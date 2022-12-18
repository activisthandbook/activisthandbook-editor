const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ARTICLES
const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./articles/publishArticles");
const articles_triggers = require("./articles/articles_triggers");
const articlesInQueue_triggers = require("./articles/articlesInQueue_triggers");
const articlesPublished_triggers = require("./articles/articlesPublished_triggers");

// IMAGES
const getImageUploadURL = require("./images/getImageUploadURL");
const processImageUpload = require("./images/processImageUpload");

// ARTICLES
// Callable functions 🔗
exports.generateArticle = generateArticle.generateArticle;
exports.publishArticles = publishArticles.publishArticles;

// Triggers 🔥
// 'articles'
exports.articles_onCreate = articles_triggers.onCreate;
exports.articles_onDelete = articles_triggers.onDelete;
// 'articlesInQueue'
exports.articlesInQueue_onCreate = articlesInQueue_triggers.onCreate;
exports.articlesInQueue_onDelete = articlesInQueue_triggers.onDelete;
// 'articlesPublished'
exports.articlesPublished_onCreate = articlesPublished_triggers.onCreate;
exports.articlesPublished_onDelete = articlesPublished_triggers.onDelete;

// IMAGES
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
exports.processImageUpload = processImageUpload.processImageUpload;
