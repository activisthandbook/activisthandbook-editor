const functions = require("firebase-functions");

let { Octokit } = require("@octokit/rest");
Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

const { Base64 } = require("js-base64");

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

exports.publishMenu = functions
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
      const publishingQueueMenu = await fetchPublishingQueue();

      await syncWithGithub(process.env.GITHUB_API, publishingQueueMenu);

      await clearPublishingQueue();

      return {
        success: true,
      };
    }
  });

async function fetchPublishingQueue() {
  const publishingQueueRef = db.collection("menu").doc("publishingQueue");
  const docSnapshot = await publishingQueueRef.get();
  if (docSnapshot.empty) {
    // console.log('No matching documents.');
    throw new functions.https.HttpsError(
      "not-found",
      "No menu found in the publishing queue."
    );
  } else {
    return docSnapshot.data();
  }
}

async function syncWithGithub(token, menu) {
  const octokit = new Octokit({
    auth: token,
  });

  const owner = "activisthandbook";
  const repo = "activisthandbook";
  const branch = "main";
  const createBranch = false;

  let files = {};

  const fileContents = generateFileContent(menu);

  files[".vitepress/menus/sidebar.json"] = fileContents.sidebar;

  const commits = await octokit.rest.repos.createOrUpdateFiles({
    owner,
    repo,
    branch,
    createBranch,
    changes: [
      {
        message: "Menu update",
        files: files,
      },
    ],
  });
}

async function clearPublishingQueue() {
  // Get a new write batch
  const batch = db.batch();

  const menuPublishingQueueRef = db.collection("menu").doc("publishingQueue");

  batch.delete(menuPublishingQueueRef);

  const moderatorRef = db.collection("app").doc("moderator");
  batch.set(
    moderatorRef,
    {
      menuPublishingQueue: false,
    },
    { merge: true }
  );

  // Commit the batch
  await batch.commit();
}

function generateFileContent(menu) {
  const sidebarFileContents = JSON.stringify(menu.sidebar);

  return { sidebar: sidebarFileContents };
}
