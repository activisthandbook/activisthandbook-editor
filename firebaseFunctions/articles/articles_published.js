const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const articles_published_count = new Counter(
  db.collection("app").doc("analytics"),
  "articles_published_count"
);

exports.articles_published_onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_published/{articleID}")
  .onCreate((change, context) => {
    // Trigger the counter
    articles_published_count.incrementBy(1);
  });

exports.articles_published_onDelete = functions
  .region("europe-west1")
  .firestore.document("articles_published/{articleID}")
  .onDelete((change, context) => {
    // Trigger the counter
    articles_published_count.incrementBy(-1);
  });
