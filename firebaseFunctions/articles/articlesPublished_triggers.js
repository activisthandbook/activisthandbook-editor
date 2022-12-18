const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const articlesPublishedCount = new Counter(
  db.collection("app").doc("analytics"),
  "articlesPublishedCount"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articlesPublished/{articleID}")
  .onCreate((change, context) => {
    // Trigger the counter
    articlesPublishedCount.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("articlesPublished/{articleID}")
  .onDelete((change, context) => {
    // Trigger the counter
    articlesPublishedCount.incrementBy(-1);
  });
