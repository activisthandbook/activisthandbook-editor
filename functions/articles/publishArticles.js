const functions = require("firebase-functions");

let { Octokit } = require("@octokit/rest");
Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

const { Base64 } = require("js-base64");

const sanitizeHtml = require("sanitize-html");

const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const db = getFirestore();

// Convert HTML into markdown
// Yeah, I know, it's a bit stupid, because vitepress will convert the markdown back to HTML. But we need it to be markdown first so vitepress can process everything correctly, e.g. adding a table of contents and heading anchors). And the TipTap editor doesn't support markdown.
// https://github.com/valeriangalliat/markdown-it-anchor
// https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
var TurndownService = require("turndown");
var turndownService = new TurndownService();

const languagesFile = require("./languages");
const languages = languagesFile.languages;

let languageCollections = {};

exports.publishArticles = functions
  .region("europe-west1")
  // Not working (eg. getting branch error)? Make sure to check that the API token is still valid:
  // https://github.com/settings/tokens
  // https://firebase.google.com/docs/functions/config-env
  .runWith({ secrets: ["GITHUB_API"] })
  .https.onCall(async (data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth.token.email_verified) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated with a verified email."
      );
    } else {
      // STEP 1: FETCH DATA
      // Fetch all articles that need to be published. And retrieve all the language collections that these articles are part of.
      const publishingQueueArticles = await fetchPublishingQueue();
      functions.logger.log(
        "🔵 publishingQueueArticles",
        publishingQueueArticles
      );
      functions.logger.log("🔵 languageCollections", languageCollections);

      // STEP 2: UPDATED PUBLISHED COLLECTION & LANGUAGE COLLECTIONS
      await updatePublishedArticles(publishingQueueArticles);
      functions.logger.log("🔵 languageCollections", languageCollections);

      // STEP 3: SYNC WITH GITHUB
      // Generate file output and sync with GitHub.
      await syncWithGithub(process.env.GITHUB_API, publishingQueueArticles);

      // STEP 4: CLEAR PUBLISHING QUEUE
      await clearPublishingQueue(publishingQueueArticles);

      return {
        success: true,
        updatedArticleCount: publishingQueueArticles.length,
      };
    }
  });

// STEP 1 _________________________________

async function fetchPublishingQueue() {
  const publishingQueueRef = db.collection("publishingQueue");
  const snapshot = await publishingQueueRef.get();
  if (snapshot.empty) {
    // console.log('No matching documents.');
    throw new functions.https.HttpsError(
      "not-found",
      "No articles found in the publishing queue."
    );
  } else {
    let articles = [];

    snapshot.forEach((doc) => {
      articles.push(doc.data());
      functions.logger.log("⚪️ article added", doc.data());
    });

    // TO-DO: Optimize speed https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
    for (const article of articles) {
      await fetchLanguageCollection(article.languageCollectionID);
    }

    return articles;
  }
}

async function fetchLanguageCollection(languageCollectionID) {
  functions.logger.log("⚪️ languageCollections", languageCollections);
  functions.logger.log("⚪️ languageCollectionID", languageCollectionID);

  // if (!languageCollections[languageCollectionID]) {
  const languageCollectionRef = db
    .collection("languageCollections")
    .doc(languageCollectionID);
  const doc = await languageCollectionRef.get();
  if (!doc.exists) {
    functions.logger.log("🔴 Error: Could not find language collection");
    throw new functions.https.HttpsError(
      "not-found",
      "Could not find language collection."
    );
  } else {
    languageCollections[languageCollectionID] = doc.data();
    functions.logger.log("⚪️ language collection added", doc.data());
  }
  // }
}

// STEP 2 _________________________________

async function updatePublishedArticles(articles) {
  // Get a new write batch
  const batch = db.batch();

  for (const article of articles) {
    const publishedArticleRef = db
      .collection("publishedArticles")
      .doc(article.id);
    const languageCollectionRef = db
      .collection("languageCollections")
      .doc(article.languageCollectionID);

    // languageCollections[article.languageCollectionID].publishedArticles =
    //   languageCollections[article.languageCollectionID].articles;

    if (article.delete) {
      batch.delete(publishedArticleRef);

      // Find the index of the current article language in the publishedArticles of this article's languageCollection
      const currentLanguageIndex = languageCollections[
        article.languageCollectionID
      ].publishedArticles.findIndex(
        (object) => object.langCode === article.langCode
      );

      // Update in local array
      languageCollections[
        article.languageCollectionID
      ].publishedArticles.splice(currentLanguageIndex, 1);
    } else {
      batch.set(publishedArticleRef, article);

      let link = null;
      if (article.langCode === "en") {
        link = `/${article.path}`;
      } else {
        link = `/${article.langCode}/${article.path}`;
      }

      const languageDetails = languages.find(
        (x) => x.code === article.langCode
      );

      const languageToAdd = {
        // It's important these keys are in alphabetical order!
        articleID: article.id,
        langCode: article.langCode,
        link: link,
        localName: languageDetails.localName,
      };

      // Update in local array (many lines below)
      if (languageCollections[article.languageCollectionID].publishedArticles) {
        const indexArticleInLanguageCollection = languageCollections[
          article.languageCollectionID
        ].publishedArticles.findIndex((x) => x.articleID === article.id);
      }

      if (
        // No published languages yet
        !languageCollections[article.languageCollectionID].publishedArticles
      ) {
        languageCollections[article.languageCollectionID].publishedArticles = [
          languageToAdd,
        ];
      } else if (
        // Does not include this language yet (at least not an exact instance like this)
        !languageCollections[
          article.languageCollectionID
        ].publishedArticles.includes(languageToAdd) ||
        // This article is not included in language collection yet
        indexArticleInLanguageCollection === -1
      ) {
        // Add it!
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.push(languageToAdd);
      } else if (indexArticleInLanguageCollection >= 0) {
        // Remove current instance
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.splice(indexArticleInLanguageCollection, 1);

        // Add updated instance
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.push(languageToAdd);
      }
    }

    // Sort the language collection
    languageCollections[article.languageCollectionID].publishedArticles.sort(
      (a, b) => a.localName - b.localName
    ); // b - a for reverse sort

    // Update on server
    batch.update(languageCollectionRef, {
      publishedArticles:
        languageCollections[article.languageCollectionID].publishedArticles,
    });
  }

  // Commit the batch
  await batch.commit();
}

// STEP 3 _________________________________

async function syncWithGithub(token, articles) {
  const octokit = new Octokit({
    auth: token,
  });

  const owner = "activisthandbook";
  const repo = "activisthandbook";
  const branch = "main";
  const createBranch = false;

  let files = {};
  let filesToDelete = [];

  for (const article of articles) {
    if (article.delete) {
      filesToDelete.push(article.path);
    } else {
      let githubPath = "";
      if (article.langCode == "en") {
        githubPath = "articles/" + article.path + ".md";
      } else {
        githubPath =
          "articles/" + article.langCode + "/" + article.path + ".md";
      }
      files[githubPath] = generateFileContent(article);
    }
  }

  for (const languageCollectionID in languageCollections) {
    const githubPath =
      "articles/public/languageCollections/" + languageCollectionID + ".json";
    files[githubPath] = JSON.stringify(
      languageCollections[languageCollectionID].publishedArticles
    );
  }

  functions.logger.log("🔵 files", files);
  functions.logger.log("🔵 filesToDelete", filesToDelete);

  const commits = await octokit.rest.repos.createOrUpdateFiles({
    owner,
    repo,
    branch,
    createBranch,
    changes: [
      {
        message: "Updated using Activist Handbook Editor",
        files: files,
        filesToDelete: filesToDelete,
      },
    ],
  });
}

function generateFileContent(article) {
  // Prevent undefined errors
  if (!article.title) article.title = "";
  if (!article.description) article.description = "";
  if (!article.tags) article.tags = "";
  if (!article.id) article.id = "";
  if (!article.languageCollectionID) article.languageCollectionID = "";
  if (!article.content) article.content = "";
  if (!article.wordCount) article.wordCount = "";

  // IMPORTANT: this sanitisation must match the one locally!
  // The ugly identation is to avoid everything being interpeted as markdown quote...
  const fileContents = `---
title: ${sanitizeHtml(article.title)}
description: ${sanitizeHtml(article.description)}
tags: ${sanitizeHtml(article.tags)}
langCode: ${sanitizeHtml(article.langCode)}
articleID: ${sanitizeHtml(article.id)}
wordCount: ${sanitizeHtml(article.wordCount)}
lastUpdated: ${article.lastUpdatedServerTimestamp.toMillis()}
languageCollectionID: ${sanitizeHtml(article.languageCollectionID)}
---

${turndownService.turndown(
  sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "iframe",
      "img",
      "figure",
      "figcaption",
      // Custom elements
      "action-donate",
      "action-volunteer",
      "action-custom",
      "action-smart-small",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ["src", "allowfullscreen", "start", "width", "height"],
      div: ["data-youtube-video"],
      img: ["src", "alt", "imageid", "imagesource", "imagecaption"],
    },

    allowedIframeHostnames: ["www.youtube-nocookie.com"],
  })
)}
`;
  functions.logger.log("⚪️ fileContents", fileContents);

  return fileContents;
}

// STEP 4 _________________________________

async function clearPublishingQueue(articles) {
  // Get a new write batch
  const batch = db.batch();

  for (const article of articles) {
    const articleRef = db.collection("publishingQueue").doc(article.id);
    batch.delete(articleRef);
  }

  const moderatorRef = db.collection("app").doc("moderator");
  batch.set(
    moderatorRef,
    {
      publishingQueueCount: 0,
    },
    { merge: true }
  );

  // Commit the batch
  await batch.commit();
}

// async function updatePublishedArticlesCollection(articles) {
//   // Get a new write batch
//   const batch = db.batch();

//   articles.forEach((article) => {
//     let fullPath = null;
//     if (article.langCode === "en") {
//       fullPath = article.path;
//     } else {
//       fullPath = "/" + article.langCode + "/" + article.path;
//     }
//     const articleRef = db.collection("publishedArticles").doc(article.id);
//     batch.set(articleRef, { ...article, fullPath: fullPath });
//   });

//   // Commit the batch
//   await batch.commit();
// }
