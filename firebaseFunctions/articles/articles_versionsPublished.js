const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document(
    "articles_draft/{articleID}/versions_published/{versionID}"
  )
  .onCreate((change, context) => {
    const articles_versionsPublished_count = new Counter(
      db.collection("articles_draft").doc(context.params.articleID),
      "versions_published_count"
    );

    // Trigger the counter
    articles_versionsPublished_count.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document(
    "articles_draft/{articleID}/versions_published/{versionID}"
  )
  .onDelete((change, context) => {
    const articles_versionsPublished_count = new Counter(
      db.collection("articles_draft").doc(context.params.articleID),
      "versions_published_count"
    );

    // Trigger the counter
    articles_versionsPublished_count.incrementBy(-1);
  });
