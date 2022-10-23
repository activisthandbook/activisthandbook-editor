const debugging = true;

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
var turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});
turndownService.keep([
  "div",
  "figure",
  "iframe",
  "client-only",
  "action-custom",
  "action-donate",
  "action-smart-small",
  "action-volunteer",
]);

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
      const userProfileRef = db
        .collection("userProfiles")
        .doc(context.auth.token.uid);
      const userDoc = await userProfileRef.get();

      if (!userDoc.exists) {
        log("🔴 Error: Could not find user profile");
        throw new functions.https.HttpsError(
          "not-found",
          "Could not find user profile"
        );
      } else {
        const userDocData = userDoc.data();

        if (!userDocData.roles.includes("moderator")) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "You are not a moderator."
          );
        }
      }

      // STEP 1: FETCH DATA
      // Fetch all articles that need to be published. And retrieve all the language collections that these articles are part of.
      const publishingQueueArticles = await fetchPublishingQueue();
      const publishingQueueMenu = await fetchPublishingQueueMenu();

      log("🔵 publishingQueueArticles", publishingQueueArticles);
      log("🔵 languageCollections", languageCollections);
      log("🔵 publishingQueueMenu", publishingQueueMenu);

      if (!publishingQueueArticles && !publishingQueueMenu) {
        throw new functions.https.HttpsError(
          "not-found",
          "No articles or menu found in the publishing queue."
        );
      }

      if (publishingQueueArticles) {
        // STEP 2: UPDATED PUBLISHED COLLECTION & LANGUAGE COLLECTIONS
        await updatePublishedArticles(publishingQueueArticles);
        log("🔵 languageCollections", languageCollections);
      }

      // STEP 3: SYNC WITH GITHUB
      // Generate file output and sync with GitHub.
      await syncWithGithub(
        process.env.GITHUB_API,
        publishingQueueArticles,
        publishingQueueMenu
      );

      // STEP 4: CLEAR PUBLISHING QUEUE
      await clearPublishingQueue(publishingQueueArticles, publishingQueueMenu);

      return {
        success: true,
      };
    }
  });

// STEP 1 _________________________________

async function fetchPublishingQueue() {
  const publishingQueueRef = db.collection("publishingQueue");
  const snapshot = await publishingQueueRef.get();
  if (snapshot.empty) {
    // console.log('No matching documents.');
    return null;
  } else {
    let articles = [];

    snapshot.forEach((doc) => {
      articles.push(doc.data());
      log("⚪️ article added", doc.data());
    });

    // TO-DO: Optimize speed https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
    for (const article of articles) {
      await fetchLanguageCollection(article.languageCollectionID);
    }

    return articles;
  }
}

async function fetchLanguageCollection(languageCollectionID) {
  log("⚪️ languageCollections", languageCollections);
  log("⚪️ languageCollectionID", languageCollectionID);

  // if (!languageCollections[languageCollectionID]) {
  const languageCollectionRef = db
    .collection("languageCollections")
    .doc(languageCollectionID);
  const doc = await languageCollectionRef.get();
  if (!doc.exists) {
    log("🔴 Error: Could not find language collection");
    throw new functions.https.HttpsError(
      "not-found",
      "Could not find language collection."
    );
  } else {
    languageCollections[languageCollectionID] = doc.data();
    log("⚪️ language collection added", doc.data());
  }
  // }
}

async function fetchPublishingQueueMenu() {
  const publishingQueueRef = db.collection("menu").doc("publishingQueue");
  const docSnapshot = await publishingQueueRef.get();
  if (docSnapshot.empty) {
    // console.log('No matching documents.');
    return null;
  } else {
    return docSnapshot.data();
  }
}

// STEP 2 _________________________________

async function updatePublishedArticles(articles) {
  // Get a new write batch
  const batch = db.batch();

  // 🔁 LOOP THROUGH ALL ARTICLES
  for (const article of articles) {
    // References for docs we want to edit later
    const publishedArticleRef = db
      .collection("publishedArticles")
      .doc(article.id);
    const languageCollectionRef = db
      .collection("languageCollections")
      .doc(article.languageCollectionID);

    let publishedArticlesIndex = null;
    if (languageCollections[article.languageCollectionID].publishedArticles) {
      // Find the index of the current article language in the publishedArticles of this article's languageCollection
      publishedArticlesIndex = languageCollections[
        article.languageCollectionID
      ].publishedArticles.findIndex((x) => x.articleID === article.id);

      log("⚪️ publishedArticlesIndex", publishedArticlesIndex);
    }

    // 🗑 DELETE ARTICLE
    // Actions:
    // - remove from language collection
    if (article.deleteArticle) {
      log("⚪️ delete article", article);
      batch.delete(publishedArticleRef);

      // Fallback 'if' statement: publishedArticles should always be defined for articles that you are trying to delete
      if (languageCollections[article.languageCollectionID].publishedArticles) {
        // Remove article from publishedArticles array
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.splice(publishedArticlesIndex, 1);

        log(
          "⚪️ publishedArticles",
          languageCollections[article.languageCollectionID].publishedArticles
        );
      }
    } // 🗑 END DELETE ARTICLE

    // 📝 EDIT ARTICLE
    // Actions:
    // 1. Update publishedArticles collection
    // 2. Build full link from languageCode and path
    // 3. Get details on this language based on the languageCode
    // 4. Define object to add or update in the languageCollection 'publishedArticles' array.
    // 5. Check if this languageCollection already contains any published articles & find index
    // 6. Create, add to or update publishedArticles array
    else {
      log("⚪️ edit article", article);
      // 1. Update publishedArticles collection
      batch.set(publishedArticleRef, article);

      // 2. Build full link from languageCode and path
      let link = null;
      if (article.langCode === "en") {
        link = `/${article.path}`;
      } else {
        link = `/${article.langCode}/${article.path}`;
      }
      log("⚪️ link article", link);

      // 3. Get details on this language based on the languageCode
      const languageDetails = languages.find(
        (x) => x.code === article.langCode
      );
      log("⚪️ languageDetails", languageDetails);

      // 4. Define object to add or update in the languageCollection 'publishedArticles' array.
      const languageToAdd = {
        articleID: article.id,
        langCode: article.langCode,
        link: link,
        localName: languageDetails.localName,
      };
      log("⚪️ languageToAdd", languageToAdd);

      // 6. Create, add to or update publishedArticles array

      // A. No published languages yet -> create array
      if (
        !languageCollections[article.languageCollectionID].publishedArticles
      ) {
        languageCollections[article.languageCollectionID].publishedArticles = [
          languageToAdd,
        ];
        log(
          "⚪️ No published languages yet -> create publishedArticles array",
          languageCollections[article.languageCollectionID].publishedArticles
        );
      }

      // B. Article not included in language collection yet -> add to array
      else if (publishedArticlesIndex === -1) {
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.push(languageToAdd);

        log(
          "⚪️ Article not included in language collection yet -> add to array",
          languageCollections[article.languageCollectionID].publishedArticles
        );
      }

      // C. Article has been published before -> update array
      else if (publishedArticlesIndex >= 0) {
        // Remove current instance
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.splice(publishedArticlesIndex, 1);

        // Add updated instance
        languageCollections[
          article.languageCollectionID
        ].publishedArticles.push(languageToAdd);

        log(
          "⚪️Article has been published before -> update array",
          languageCollections[article.languageCollectionID].publishedArticles
        );
      }
    } // 📝 END EDIT ARTICLE

    // 🔤 SORT LANGUAGE COLLECTION ALPHABETICALLY
    languageCollections[article.languageCollectionID].publishedArticles.sort(
      (a, b) => a.localName - b.localName
    ); // b - a for reverse sort
    log(
      "⚪️sort publishedArticles",
      languageCollections[article.languageCollectionID].publishedArticles
    );

    // 🔥 UPDATE LANGUAGE COLLECTION IN FIRESTORE
    batch.update(languageCollectionRef, {
      publishedArticles:
        languageCollections[article.languageCollectionID].publishedArticles,
    });
  } // 🔁 END LOOP

  // 🔥 COMMIT THE BATCH
  await batch.commit();
}

// STEP 3 _________________________________

async function syncWithGithub(token, articles, menu) {
  const octokit = new Octokit({
    auth: token,
  });

  const owner = "activisthandbook";
  const repo = "activisthandbook";
  const branch = "main";
  const createBranch = false;

  let files = {};
  let filesToDelete = [];

  if (articles) {
    for (const article of articles) {
      let githubPath = "";
      if (article.langCode == "en") {
        githubPath = "articles/" + article.path + ".md";
      } else {
        githubPath =
          "articles/" + article.langCode + "/" + article.path + ".md";
      }

      if (article.deleteArticle) {
        filesToDelete.push(githubPath);
      } else {
        files[githubPath] = generateFileContent(article);
      }
    }
    for (const languageCollectionID in languageCollections) {
      const githubPath =
        "articles/public/languageCollections/" + languageCollectionID + ".json";

      if (
        languageCollections[languageCollectionID].publishedArticles &&
        languageCollections[languageCollectionID].publishedArticles.length
      ) {
        files[githubPath] = JSON.stringify(
          languageCollections[languageCollectionID].publishedArticles
        );
      } else {
        filesToDelete.push(githubPath);
      }
    }
  }

  if (menu) {
    const fileContentsMenu = generateFileContentMenu(menu);
    files[".vitepress/menus/sidebar.json"] = fileContentsMenu.sidebar;
    log("⚪️ fileContentsMenu", fileContentsMenu);
  }

  log("🔵 files", files);
  log("🔵 filesToDelete", filesToDelete);

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
lastUpdated: ${article.metadata.createdTimestamp.toMillis()}
languageCollectionID: ${sanitizeHtml(article.languageCollectionID)}
---

${turndownService.turndown(
  sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "iframe",
      "img",
      "figure",
      "figcaption",
      // Custom elements (make sure these are also included in TurndownService!!!)
      "client-only",
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
      "action-custom": ["buttonlink", "buttonlabel"],
    },

    allowedIframeHostnames: ["www.youtube-nocookie.com"],
  })
)}
`;
  log("⚪️ fileContents", fileContents);

  return fileContents;
}

function generateFileContentMenu(menu) {
  if (menu.sidebar.en) {
    // Change name of 'en' sidebar, and put it at the end of the object (because if it's position in the object would be before other languages, those would never match in vitepress)
    const enSidebar = menu.sidebar.en;
    delete menu.sidebar.en;
    menu.sidebar["/"] = enSidebar;
  }

  const sidebarFileContents = JSON.stringify(menu.sidebar);

  return { sidebar: sidebarFileContents };
}

// STEP 4 _________________________________

async function clearPublishingQueue(articles, menu) {
  // Get a new write batch
  const batch = db.batch();

  if (articles) {
    for (const article of articles) {
      const articleRef = db.collection("publishingQueue").doc(article.id);
      batch.delete(articleRef);
    }
  }

  if (menu) {
    const menuPublishingQueueRef = db.collection("menu").doc("publishingQueue");

    batch.delete(menuPublishingQueueRef);
    const moderatorRef = db.collection("app").doc("analytics");
    batch.set(
      moderatorRef,
      {
        menuInPublishingQueue: false,
      },
      { merge: true }
    );
  }

  // Commit the batch
  await batch.commit();
}

function log(message, attachment) {
  if (debugging) {
    if (attachment) {
      functions.logger.log(message, attachment);
    } else {
      functions.logger.log(message);
    }
  }
}
