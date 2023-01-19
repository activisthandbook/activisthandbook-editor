const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

// Counting number of articles that need review
// Whenever there is a change, we check what the change was, and adjust the counter
const Counter = require("./../distributedCounter");
const articlesNeedReview = new Counter(
    db.collection("articles_draft/{articleID}"),
    "versions_published"
  );

exports.onCreate = functions
  .region("europe-west1")
  .firestore.document("menu/draft/versions_published/{versionID}")
  .onWrite(async (change, context) => {
    // Previous status was NOT review, and then it changed to review
    if (change.before.get("status") != "review" && change.after.get("status") == "review") {
      articlesNeedReview.incrementBy(1);
    // Previous status was review, and then it changed to NOT review
    } else if (change.before.get("status") == "review" && change.after.get("status") != "review") {
      articlesNeedReview.incrementBy(-1);
    }
  });
