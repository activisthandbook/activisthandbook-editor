const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./articles/publishArticles");
const publishedArticlesCount = require("./articles/publishedArticlesCount");
const getImageUploadURL = require("./images/getImageUploadURL");
const processImageUpload = require("./images/processImageUpload");

// ARTICLES
// Generate articles
exports.generateArticle = generateArticle.generateArticle;

// Publish articles
exports.publishArticles = publishArticles.publishArticles;

// Published article count
exports.publishedArticlesOnCreate =
  publishedArticlesCount.publishedArticlesOnCreate;
exports.publishedArticlesOnDelete =
  publishedArticlesCount.publishedArticlesOnDelete;

// IMAGES
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
exports.processImageUpload = processImageUpload.processImageUpload;