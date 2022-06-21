const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./publishArticles");

exports.generateArticle = generateArticle.generateArticle;
exports.publishArticles = publishArticles.publishArticles;
