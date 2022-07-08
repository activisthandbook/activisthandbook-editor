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
    const publishingQueue = await fetchPublishingQueue();

    functions.logger.log("Articles (from main function):", publishingQueue);

    await syncWithGithub(process.env.GITHUB_API, publishingQueue);

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

    functions.logger.log("Articles (from fetchPublishingQueue):", articles);

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

  functions.logger.log("Articles (from syncWithGithub):", articles);

  for (const article of articles) {
    functions.logger.log("For loop, article:", article);
    if (article.delete) {
      filesToDelete.push(article.path);
      functions.logger.log("Delete, filesToDelete is now:", filesToDelete);
    } else {
      files[article.path + ".md"] = article.content;
      functions.logger.log("Else, files is now:", files);
    }
  }

  functions.logger.log("Files:", files);
  functions.logger.log("Files to delete:", filesToDelete);

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
