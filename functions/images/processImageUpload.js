const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

exports.processImageUpload = functions
  .region("europe-west1")
  // Not working (eg. getting branch error)? Make sure to check that the API token is still valid:
  // https://developers.cloudflare.com/images/cloudflare-images/api-request/
  // https://firebase.google.com/docs/functions/config-env
  .https.onCall(async (imageData, context) => {
    if (!context.auth.token.email_verified) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated with a verified email."
      );
    } else {
      const labels = await detectImageLabels(imageData);

      const newData = {
        ...imageData,
        labels: labels,
        createdServerTimestamp: admin.database.ServerValue.TIMESTAMP,
      };

      const res = await db.collection("images").doc(imageData.id).set(newData);

      return newData;
    }
  });

async function detectImageLabels(imageData) {
  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Details for Cloudflare Images delivery URL
  const imageDomain = "https://imagedelivery.net";
  const accountHash = "0REzXdw3XtT87nmcqY33OQ";
  const variantName = "public";

  // Performs label detection on the gcs file
  const [result] = await client.labelDetection(
    `${imageDomain}/${accountHash}/${imageData.id}/${variantName}`
  );

  let labels = [];

  result.labelAnnotations.forEach((label) => labels.push(label.description));

  functions.logger.log("🔵 result:", result);
  functions.logger.log("🔵 labels:", labels);

  return labels;
}
