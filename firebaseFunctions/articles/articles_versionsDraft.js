const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("articles_draft/{articleID}/versions_draft/{versionID}")
  .onCreate((change, context) => {
    const articles_versionsDraft_count = new Counter(
      db.collection("articles_draft").doc(context.params.articleID),
      "versions_draft_count"
    );

    // Trigger the counter
    articles_versionsDraft_count.incrementBy(1);
  });
