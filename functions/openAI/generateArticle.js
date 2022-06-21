const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

let openaiConfiguration = null;
let openai = null;

// Main function
exports.generateArticle = functions
  .region("europe-west1")
  .runWith({ secrets: ["OPENAI_SECRET"] })
  .https.onCall(async (data, context) => {
    functions.logger.info("🔥 generateArticle started", data);
    functions.logger.info("🔥 auth data", context.auth);

    // OpenAI setup
    openaiConfiguration = new Configuration({
      apiKey: process.env.OPENAI_SECRET,
    });

    openai = new OpenAIApi(openaiConfiguration);

    const customerRef = db.collection("customers").doc(context.auth.uid);
    let newCustomerTimestamps = [];

    // 🔐 CHECK IF USER IS ALLOWED TO GENERATE ARTICLE
    if (context.auth.token.email_verified) {
      functions.logger.info("🟢 email verified");

      // Fetch customer profile
      await customerRef.get().then(async (doc) => {
        functions.logger.info("🟢 customer doc fetched", doc);
        if (doc.exists) {
          functions.logger.info("🟢 customer doc data", doc.data());

          const currentCustomerTimestamps = doc.data().timestamps;

          if (currentCustomerTimestamps) {
            const oneMonthAgo = Date.now() - 60000 * 60 * 24 * 30;
            newCustomerTimestamps = currentCustomerTimestamps.filter(
              (currentCustomerTimestamps) =>
                currentCustomerTimestamps > oneMonthAgo
            );
          }
          functions.logger.info(
            "🟢 new customer timestamps",
            newCustomerTimestamps
          );

          // Check how many articles the customer has generated this month
          if (newCustomerTimestamps.length < 3) {
            functions.logger.info("🟢 within limit", newCustomerTimestamps);
            const response = await startGeneration();

            // Add timestamp
            newCustomerTimestamps.push(Date.now());
            updateCustomerProfile();
            return response;
          } else {
            functions.logger.info("🟠 limit reached", newCustomerTimestamps);
            updateCustomerProfile();
            throw new functions.https.HttpsError(
              "resource-exhausted",
              "You have reached the limit of articles per month"
            );
          }
        } else {
          functions.logger.error("🔴 customer doc not found");
          throw new functions.https(
            "NOT_FOUND",
            "We could not retrieve your profile info."
          );
        }
      });
    } else {
      // User not signed in
      functions.logger.error("🔴 not signed in");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in to generate an article."
      );
    }

    // 📝 GENERATE ARTICLE
    async function startGeneration() {
      let fullResponse = {};

      // Check what type of article the user wants to generate
      switch (data.type) {
        case "tactic":
          fullResponse = await writeTacticArticle(context.auth.uid, data);
          break;
        default:
          break;
      }

      // Save the result to Firestore
      const resultRef = db.collection("results").doc(data.id);
      return await resultRef
        .set(fullResponse)
        .then(() => {
          functions.logger.info("🟢 Response saved!", fullResponse);
          return fullResponse;
        })
        .catch((error) => {
          functions.logger.error("🔴 Error in setting result data", error);
          throw new functions.https.HttpsError(
            "internal",
            "Something went wrong saving your generated article."
          );
        });
    }

    // UPDATE CUSOTMER PROFILE
    async function updateCustomerProfile() {
      customerRef
        .set({ timestamps: newCustomerTimestamps }, { merge: true })
        .then(() => {
          functions.logger.info(
            "🟢 Set customer timestamp succesful",
            newCustomerTimestamps
          );
        })
        .catch((error) => {
          functions.logger.error(
            "🔴 Error in setting customer timestamp",
            error
          );
          throw new functions.https.HttpsError(
            "internal",
            "Something went wrong updating your profile."
          );
        });
    }
  });

// MOVE THIS FUNCTION TO DIFFERRENT FILE
async function writeTacticArticle(userID, data) {
  // The write functions below will add additional data to the article object
  let article = {
    userID: userID,
    type: data.type,
    topic: data.topic,
    timestamp: FieldValue.serverTimestamp(),
  };

  return await Promise.all([
    writeIntroduction(),
    writeImpact(),
    writeResourcesNeeded(),
    writeOrganise(),
    writeExample(),
    writeImprove(),
  ])
    .then(() => {
      return article;
    })
    .catch((error) => {
      functions.logger.error("🔴 Promise rejected", error);
      throw new functions.https.HttpsError(
        "internal",
        "Something went wrong generating your article."
      );
    });

  function extractTextFromResponse(response) {
    // Returns the text from the response, removing new lines at beginning and end of text
    return response.data.choices[0].text.replace(/^\s+|\s+$/g, "");
  }

  async function writeIntroduction() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt:
          "Write a short introduction for a guide for activists about '" +
          data.topic +
          " '.",
        temperature: 0.5,
        max_tokens: 250,
        user: userID,
      })
      .then((response) => {
        article.introduction = extractTextFromResponse(response);
        return article.introduction;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }

  async function writeImpact() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt:
          "How effective are '" +
          data.topic +
          " ' and how can I make them more impactful?",
        temperature: 0.5,
        max_tokens: 250,
        user: userID,
      })
      .then((response) => {
        article.impact = extractTextFromResponse(response);
        return article.impact;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }

  async function writeResourcesNeeded() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt:
          "What resources do activists need to organise a '" +
          data.topic +
          " '?",
        temperature: 0.5,
        max_tokens: 200,
        user: userID,
      })
      .then((response) => {
        article.resourcesNeeded = extractTextFromResponse(response);
        return article.resourcesNeeded;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }

  async function writeOrganise() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt: "Explain how activists can organise a'" + data.topic + " '.",
        temperature: 0.5,
        max_tokens: 250,
        user: userID,
      })
      .then((response) => {
        article.organise = extractTextFromResponse(response);
        return article.organise;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }

  async function writeExample() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt:
          "Give examples for activists of a successful " + data.topic + " '.",
        temperature: 0.5,
        max_tokens: 120,
        user: userID,
      })
      .then((response) => {
        article.example = extractTextFromResponse(response);
        return article.example;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }

  async function writeImprove() {
    return await openai
      .createCompletion("text-davinci-002", {
        prompt:
          "List questions that activists may have about " + data.topic + " '.",
        temperature: 0.9,
        max_tokens: 250,
        user: userID,
      })
      .then((response) => {
        article.improve = extractTextFromResponse(response);
        return article.improve;
      })
      .catch((error) => {
        functions.logger.error("🔴 Error in OpenAI", error);
        throw error;
      });
  }
}
