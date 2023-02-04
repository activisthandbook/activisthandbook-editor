const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const image_count = new Counter(
  db.collection("app").doc("analytics"),
  "images_count"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("images/{imageID}")
  .onCreate((change, context) => {
    // Trigger the counter
    image_count.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("images/{imageID}")
  .onDelete((change, context) => {
    // Trigger the counter
    image_count.incrementBy(-1);
  });
