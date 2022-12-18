const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const articlesInQueueCount = new Counter(
  db.collection("app").doc("analytics"),
  "articlesInQueueCount"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articlesInQueue/{articleID}")
  .onCreate((change, context) => {
    // Trigger the counter
    articlesInQueueCount.incrementBy(1);
  });

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articlesInQueue/{articleID}")
  .onDelete((change, context) => {
    // Trigger the counter
    articlesInQueueCount.incrementBy(-1);
  });
