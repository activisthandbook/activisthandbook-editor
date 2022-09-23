const functions = require("firebase-functions");

let { Octokit } = require("@octokit/rest");
Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

const { Base64 } = require("js-base64");

const sanitizeHtml = require("sanitize-html");

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// Convert HTML into markdown
// Yeah, I know, it's a bit stupid, because vitepress will convert the markdown back to HTML. But we need it to be markdown first so vitepress can process everything correctly, e.g. adding a table of contents and heading anchors). And the TipTap editor doesn't support markdown.
// https://github.com/valeriangalliat/markdown-it-anchor
// https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
var TurndownService = require("turndown");
var turndownService = new TurndownService();

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
      const publishingQueueArticles = await fetchPublishingQueue();

      await syncWithGithub(process.env.GITHUB_API, publishingQueueArticles);

      await clearPublishingQueue(publishingQueueArticles);

      await updatePublishedArticlesCollection(publishingQueueArticles);

      return {
        success: true,
      };
    }
  });

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
    const articles = [];

    snapshot.forEach((doc) => {
      articles.push(doc.data());
    });

    return articles;
  }
}

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

  const commits = await octokit.rest.repos.createOrUpdateFiles({
    owner,
    repo,
    branch,
    createBranch,
    changes: [
      {
        message: "Your commit message",
        files: files,
        filesToDelete: filesToDelete,
      },
    ],
  });
}

async function clearPublishingQueue(articles) {
  // Get a new write batch
  const batch = db.batch();

  articles.forEach((article) => {
    const articleRef = db.collection("publishingQueue").doc(article.id);
    batch.delete(articleRef);
  });

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

async function updatePublishedArticlesCollection(articles) {
  // Get a new write batch
  const batch = db.batch();

  articles.forEach((article) => {
    let fullPath = null;
    if (article.langCode === "en") {
      fullPath = article.path;
    } else {
      fullPath = "/" + article.langCode + "/" + article.path;
    }
    const articleRef = db.collection("publishedArticles").doc(article.id);
    batch.set(articleRef, { ...article, fullPath: fullPath });
  });

  // Commit the batch
  await batch.commit();
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
languageCollectionID: ${sanitizeHtml(article.languageCollectionID)}
wordCount: ${sanitizeHtml(article.wordCount)}
lastUpdated: ${article.lastUpdatedServerTimestamp.toMillis()}
---

${turndownService.turndown(
  sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["iframe", "img"]),
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

  return fileContents;
}
