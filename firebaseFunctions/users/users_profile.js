const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Create a counter
const Counter = require("./../distributedCounter");
const users_profile_count = new Counter(
  db.collection("app").doc("analytics"),
  "users_profile_count"
);

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("users_profile/{userID}")
  .onCreate((change, context) => {
    // Trigger the counter
    users_profile_count.incrementBy(1);
  });

exports.onDelete = functions
  .region("europe-west1")
  .firestore.document("users_profile/{userID}")
  .onDelete((change, context) => {
    // Trigger the counter
    users_profile_count.incrementBy(-1);
  });
