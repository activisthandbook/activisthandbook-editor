const functions = require("firebase-functions");

const axios = require("axios");
const FormData = require("form-data");

const cors = require("cors")({ origin: true });

exports.updateSubscriber = functions
  .region("europe-west1")
  // Not working? Make sure to check that the API token is still valid:
  // https://actionnetwork.org/groups/GROUP-NAME/apis
  // https://firebase.google.com/docs/functions/config-env
  .runWith({
    secrets: ["ACTIONNETWORK_API_KEY"],
  })
  .https.onRequest(async (request, response) => {
    // return cors(request, response, async () => {
    functions.logger.log("🔵 updateSubscriber request", request.body);

    const actionNetworkResponse = await sentActionNetworkRequest(
      process.env.ACTIONNETWORK_API_KEY,
      request.body
    );

    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "*");

    // functions.logger.log("🔵 response", response);

    response.send("ok!");
    // });
  });

async function sentActionNetworkRequest(apiKey, requestData) {
  const url = "https://actionnetwork.org/api/v2/people";
  const data = {
    person: {
      family_name: "Smith",
      given_name: "John",
      postal_addresses: [{ postal_code: "20009" }],
      email_addresses: [{ address: "jsmith@mail.com" }],
      phone_number: [{ number: "12021234444" }],
    },
    add_tags: ["volunteer", "member"],
  };
  const config = {
    headers: {
      "osdi-api-token": apiKey,
    },
  };

  const response = axios
    .post(url, data, config)
    .then((response) => {
      functions.logger.log("🔵 actionnetwork response data", response.data);

      return response.data;
    })
    .catch((error) => {
      functions.logger.error("🔴 actionnetwork error", error);
    });

  return response;
}
