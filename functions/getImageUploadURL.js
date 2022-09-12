const functions = require("firebase-functions");

const axios = require("axios");
const FormData = require("form-data");

exports.getImageUploadURL = functions
  .region("europe-west1")
  // Not working (eg. getting branch error)? Make sure to check that the API token is still valid:
  // https://developers.cloudflare.com/images/cloudflare-images/api-request/
  // https://firebase.google.com/docs/functions/config-env
  .runWith({
    secrets: ["CLOUDFLARE_IMAGES_ACCOUNT_ID", "CLOUDFLARE_IMAGES_API_TOKEN"],
  })
  .https.onCall(async (data, context) => {
    const response = await getImageUploadURL(
      process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID,
      process.env.CLOUDFLARE_IMAGES_API_TOKEN
    );

    return response;
  });

async function getImageUploadURL(accountID, apiToken) {
  const form = new FormData();
  form.append("requireSignedURLs", "true");
  form.append("metadata", '{"key":"value"}');

  return await axios
    .post(
      `https://api.cloudflare.com/client/v4/accounts/${accountID}/images/v2/direct_upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${apiToken}`,
        },
      }
    )
    .then((response) => {
      functions.logger.error("🔵 cloudflare response data", response.data);

      return response.data;
    });
}
