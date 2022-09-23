const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const Counter = require("./../distributedCounter");

exports.publishedArticlesOnCreate = functions
  .region("europe-west1")
  .firestore.document("publishedArticles/{articleID}")
  .onCreate((change, context) => {
    const publishedArticlesCount = new Counter(
      db.collection("app").doc("analytics"),
      "publishedArticlesCount"
    );

    publishedArticlesCount.incrementBy(1);
  });

exports.publishedArticlesOnDelete = functions
  .region("europe-west1")
  .firestore.document("publishedArticles/{articleID}")
  .onDelete((change, context) => {
    const publishedArticlesCount = new Counter(
      db.collection("app").doc("analytics"),
      "publishedArticlesCount"
    );

    publishedArticlesCount.incrementBy(-1);
  });
