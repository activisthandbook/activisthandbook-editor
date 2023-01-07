const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const articles_inQueue_count = new Counter(
  db.collection("app").doc("analytics"),
  "articles_inQueue_count"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_inQueue/{articleID}")
  .onCreate((change, context) => {
    // Trigger the counter
    articles_inQueue_count.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("articles_inQueue/{articleID}")
  .onDelete((change, context) => {
    // Trigger the counter
    articles_inQueue_count.incrementBy(-1);
  });
