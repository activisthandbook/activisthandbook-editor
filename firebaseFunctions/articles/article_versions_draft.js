const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Counting number of draft versions of an article
// It changes when an article draft version is created or deleted 
const Counter = require("./../distributedCounter");
const articleVersionsDraft = new Counter(
    db.collection("articles_draft/{articleID}"),
    "versions_draft"
  );

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}/versions_draft/{versionID}")
  .onCreate(async (snap, context) => {
    articleVersionsDraft.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}/versions_draft/{versionID}")
  .onDelete(async (snap, context) => {
    articleVersionsDraft.incrementBy(-1);
  });
