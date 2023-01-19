const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Counting number of published versions of an article
// It changes when an article published version is created or deleted 
const Counter = require("./../distributedCounter");
const articleVersionsPublished = new Counter(
    db.collection("articles_draft/{articleID}"),
    "versions_published"
  );

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}/versions_published/{versionID}")
  .onCreate(async (snap, context) => {
    articleVersionsPublished.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}/versions_published/{versionID}")
  .onDelete(async (snap, context) => {
    articleVersionsPublished.incrementBy(-1);
  });
