const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./publishArticles");
const getImageUploadURL = require("./getImageUploadURL");

exports.generateArticle = generateArticle.generateArticle;
exports.publishArticles = publishArticles.publishArticles;
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
