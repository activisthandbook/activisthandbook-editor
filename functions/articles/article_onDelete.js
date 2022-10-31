const functions = require("firebase-functions");
const firebase_tools = require("firebase-tools");

exports.article_onDelete = functions
  .region("europe-west1")
  .firestore.document("articles/{articleID}")
  .onDelete(async (snap, context) => {
    // const publishedArticlesCount = new Counter(
    //   db.collection("app").doc("analytics"),
    //   "publishedArticlesCount"
    // );

    // publishedArticlesCount.incrementBy(-1);

    const articleID = context.params.articleID;

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore.delete(`articles/${articleID}`, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      force: true,
      token: functions.config().fb.token,
    });

    // TO-DO: Remove article from recently edited user profiles

    // functions.logger.log("🟢 success!");
  });
