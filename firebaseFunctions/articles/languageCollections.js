const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const languageCollections_count = new Counter(
  db.collection("app").doc("analytics"),
  "languageCollections_count"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("languageCollections/{languageCollectionID}")
  .onCreate((change, context) => {
    // Trigger the counter
    languageCollections_count.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("languageCollections/{languageCollectionID}")
  .onDelete((change, context) => {
    // Trigger the counter
    languageCollections_count.incrementBy(-1);
  });
