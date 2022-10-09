const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./articles/publishArticles");
const publishedArticlesCount = require("./articles/publishedArticlesCount");
const articlePublishingQueueCount = require("./articles/articleQueueCount");
const getImageUploadURL = require("./images/getImageUploadURL");
const processImageUpload = require("./images/processImageUpload");
const updateSubscriber = require("./users/updateSubscriber");

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

// Article publishing queue count
exports.articlePublishingQueueOnCreate =
  articlePublishingQueueCount.articlePublishingQueueOnCreate;
exports.articlePublishingQueueOnDelete =
  articlePublishingQueueCount.articlePublishingQueueOnDelete;

// IMAGES
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
exports.processImageUpload = processImageUpload.processImageUpload;

// SUBSCRIBERS
exports.updateSubscriber = updateSubscriber.updateSubscriber;
