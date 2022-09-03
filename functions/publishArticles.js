const functions = require("firebase-functions");

let { Octokit } = require("@octokit/rest");
Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

const { Base64 } = require("js-base64");

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

exports.publishArticles = functions
  .region("europe-west1")
  .runWith({ secrets: ["GITHUB_API"] })
  .https.onCall(async (data, context) => {
    const publishingQueueArticles = await fetchPublishingQueue();

    await syncWithGithub(process.env.GITHUB_API, publishingQueueArticles);

    await clearPublishingQueue(publishingQueueArticles);

    return {
      success: true,
    };
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
      files[article.path + ".md"] = article.content;
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
  for (const article of articles) {
    await db.collection("publishingQueue").doc(article.id).delete();
  }

  const moderatorRef = db.collection("app").doc("moderator");

  await moderatorRef.set(
    {
      publishingQueueCount: 0,
    },
    { merge: true }
  );
}
