const admin = require("firebase-admin");

// 🔄 INITIALISATIONS
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const generateArticle = require("./openAI/generateArticle");
const publishArticles = require("./publishArticles");
const getImageUploadURL = require("./images/getImageUploadURL");
const processImageUpload = require("./images/processImageUpload");

exports.generateArticle = generateArticle.generateArticle;
exports.publishArticles = publishArticles.publishArticles;
exports.getImageUploadURL = getImageUploadURL.getImageUploadURL;
exports.processImageUpload = processImageUpload.processImageUpload;
