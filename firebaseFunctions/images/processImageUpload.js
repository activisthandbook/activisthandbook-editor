const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");

const admin = require("firebase-admin");
const { getFirestore, FieldValue, connectFirestoreEmulator } = require("firebase-admin/firestore");
const db = getFirestore();
// connectFirestoreEmulator(db, 'localhost', 8080);

const debugging = true;

exports.processImageUpload = functions
  .region("europe-west1")
  .runWith({
    enforceAppCheck: true, // Requests without valid App Check tokens will be rejected.
  })
  .https.onCall(async (imageData, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app."
      );
    }

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
        tags: labels,
        metadata: {
          createdBy: context.auth.token.uid,
          createdTimestamp: FieldValue.serverTimestamp(),
          updatedBy: context.auth.token.uid,
          updatedTimestamp: FieldValue.serverTimestamp(),
        },
      };
      log("image doc", newData);
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
  const variantName = "840x472"; // https://cloud.google.com/vision/docs/supported-files#image_sizing

  // Performs label detection on the gcs file
  const [result] = await client.labelDetection(
    `${imageDomain}/${accountHash}/${imageData.id}/${variantName}`
  );

  log("labelDetection", result);

  let labels = [];

  result.labelAnnotations.forEach((label) => labels.push(label.description));

  return labels;
}

function log(message, attachment) {
  if (debugging) {
    if (attachment) {
      functions.logger.log(message, attachment);
    } else {
      functions.logger.log(message);
    }
  }
}
