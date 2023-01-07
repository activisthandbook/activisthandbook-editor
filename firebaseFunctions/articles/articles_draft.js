const functions = require("firebase-functions");
const firebase_tools = require("firebase-tools");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const articlesCount = new Counter(
  db.collection("app").doc("analytics"),
  "articles_draft_count"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}")
  .onCreate(async (snap, context) => {
    // Trigger the counter
    articlesCount.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}")
  .onDelete(async (snap, context) => {
    // Trigger the counter
    articlesCount.incrementBy(-1);

    const articleID = context.params.articleID;

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore.delete(`articles_draft/${articleID}`, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      force: true,
      token: functions.config().fb.token,
    });

    // TO-DO: Remove article from recently edited user profiles

    // functions.logger.log("🟢 success!");
  });
