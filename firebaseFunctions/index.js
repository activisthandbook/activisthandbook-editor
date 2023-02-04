const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ARTICLES
const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./articles/publishArticles");

// IMAGES
const getImageUploadURL = require("./images/getImageUploadURL");
const processImageUpload = require("./images/processImageUpload");

// ARTICLES
// Callable functions 🔗
// exports.generateArticle = generateArticle.generateArticle;
exports.publishArticles = publishArticles.publishArticles;

// Triggers 🔥
exports.articles_draft = require("./articles/articles_draft");
exports.articles_inQueue = require("./articles/articles_inQueue");
exports.articles_published = require("./articles/articles_published");
exports.articles_versionsDraft = require("./articles/articles_versionsDraft");
exports.articles_versionsPublished = require("./articles/articles_versionsPublished");
exports.languageCollections = require("./articles/languageCollections");

// IMAGES
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
exports.processImageUpload = processImageUpload.processImageUpload;

// USERS
exports.users_profile = require("./users/users_profile");
