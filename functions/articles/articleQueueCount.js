const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const Counter = require("./../distributedCounter");

const articlePublishingQueueCount = new Counter(
  db.collection("app").doc("analytics"),
  "articlePublishingQueueCount"
);

exports.articlePublishingQueueOnCreate = functions
  .region("europe-west1")
  .firestore.document("publishingQueue/{articleID}")
  .onCreate((change, context) => {
    articlePublishingQueueCount.incrementBy(1);
  });

exports.articlePublishingQueueOnDelete = functions
  .region("europe-west1")
  .firestore.document("publishingQueue/{articleID}")
  .onDelete((change, context) => {
    articlePublishingQueueCount.incrementBy(-1);
  });
