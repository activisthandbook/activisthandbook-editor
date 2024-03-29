const debugging = true;

const functions = require("firebase-functions");

let { Octokit } = require("@octokit/rest");
Octokit = Octokit.plugin(require("octokit-commit-multiple-files"));

var _ = require("lodash");

const { Base64 } = require("js-base64");

const sanitizeHtml = require("sanitize-html");

const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const db = getFirestore();

// Convert HTML into markdown
// Yeah, I know, it's a bit stupid, because vitepress will convert the markdown back to HTML. But we need it to be markdown first so vitepress can process everything correctly, e.g. adding a table of contents and heading anchors). And the TipTap editor doesn't support markdown.
// https://github.com/valeriangalliat/markdown-it-anchor
// https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
// var TurndownService = require("turndown");

var TurndownService = require("turndown");
const elementsToKeep = [
  "div",
  "iframe",
  "dynamic-image",
  "action-custom",
  "action-donate",
  "action-smart-small",
  "action-signup",
  "action-button",
  "table",
];
function isOneOfElements(node, array) {
  log("isOneOfElements node", node);
  log("isOneOfElements localName", node.localName);
  log("isOneOfElements array", array);

  for (const item of array) {
    if (node.localName === item) {
      log("isOneOfElements inArray!");
      return true;
    }
  }
  return false;
}
var turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  blankReplacement: function (content, node) {
    if (isOneOfElements(node, elementsToKeep)) {
      ("");
      log("isOneOfElements true");
      return node.outerHTML;
    } else {
      log("isOneOfElements false");
      return node.isBlock ? "\n\n" : "";
    }
  },
});
turndownService.keep(elementsToKeep);

// const {
//   NodeHtmlMarkdown,
//   NodeHtmlMarkdownOptions,
// } = require("node-html-markdown");

// const htmlToMarkdown = new NodeHtmlMarkdown({
//   bulletMarker: "-",
//   ignore: [
//     "div",
//     "iframe",
//     "dynamic-image",
//     "action-custom",
//     "action-donate",
//     "action-smart-small",
//     "action-signup",
//     "action-button",
//   ],
// });

const languagesFile = require("./languages");
const languages = languagesFile.languages;

const newLine = `
`;

let languageCollections = {};

exports.publishArticles = functions
  .region("europe-west1")
  // Not working (eg. getting branch error)? Make sure to check that the API token is still valid:
  // STEP 1: Generate new token (https://github.com/settings/tokens)
  // STEP 2: Save the token (https://firebase.google.com/docs/functions/config-env):
  //  firebase functions:secrets:set GITHUB_API
  .runWith({
    secrets: ["GITHUB_API"],
    enforceAppCheck: true, // Requests without valid App Check tokens will be rejected.
    memory: "8GB",
    timeoutSeconds: 540,
  })
  .https.onCall(async (data, context) => {
    // APP CHECK
    // context.app will be undefined if the request doesn't include an
    // App Check token. (If the request includes an invalid App Check
    // token, the request will be rejected with HTTP error 401.)
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app."
      );
    }

    // Checking that the user is authenticated.
    if (!context.auth.token.email_verified) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated with a verified email."
      );
    } else {
      // Reset variables
      languageCollections = {};

      const userProfileRef = db
        .collection("users_profile")
        .doc(context.auth.token.uid);
      const userDoc = await userProfileRef.get();

      if (!userDoc.exists) {
        log("🔴 Error: Could not find user profile");
        throw new functions.https.HttpsError(
          "not-found",
          "Could not find user profile"
        );
      } else {
        const userDocData = userDoc.data();

        if (!userDocData.roles?.includes("moderator")) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "You are not a moderator."
          );
        }
      }

      // STEP 1: FETCH DATA
      // Fetch all articles that need to be published. And retrieve all the language collections that these articles are part of.
      const publishingQueueArticles = await fetchPublishingQueue();
      const publishingQueueMenu = await fetchPublishingQueueMenu();

      log("🔵 publishingQueueArticles", publishingQueueArticles);
      log("🔵 languageCollections", languageCollections);
      log("🔵 publishingQueueMenu", publishingQueueMenu);

      if (!publishingQueueArticles && !publishingQueueMenu) {
        throw new functions.https.HttpsError(
          "not-found",
          "No articles or menu found in the publishing queue."
        );
      }

      if (publishingQueueArticles) {
        // STEP 2: UPDATED PUBLISHED COLLECTION & LANGUAGE COLLECTIONS
        await updatePublishedArticles(publishingQueueArticles);
        log("🔵 languageCollections", languageCollections);
      }

      // STEP 3: SYNC WITH GITHUB
      // Generate file output and sync with GitHub.
      await syncWithGithub(
        process.env.GITHUB_API,
        publishingQueueArticles,
        publishingQueueMenu
      );

      // STEP 4: CLEAR PUBLISHING QUEUE
      await clearPublishingQueue(publishingQueueArticles, publishingQueueMenu);

      return {
        success: true,
      };
    }
  });

// STEP 1 _________________________________

async function fetchPublishingQueue() {
  const publishingQueueRef = db.collection("articles_inQueue");
  const snapshot = await publishingQueueRef.get();
  if (snapshot.empty) {
    // console.log('No matching documents.');
    return null;
  } else {
    let articles = [];

    snapshot.forEach((doc) => {
      articles.push(doc.data());
      log("⚪️ article added", doc.data());
    });

    // TO-DO: Optimize speed https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
    for (const article of articles) {
      await fetchLanguageCollection(article.languageCollectionID);
    }

    return articles;
  }
}

async function fetchLanguageCollection(languageCollectionID) {
  log("⚪️ languageCollections", languageCollections);
  log("⚪️ languageCollectionID", languageCollectionID);

  // if (!languageCollections[languageCollectionID]) {
  const languageCollectionRef = db
    .collection("languageCollections")
    .doc(languageCollectionID);
  const doc = await languageCollectionRef.get();
  if (!doc.exists) {
    log("🔴 Error: Could not find language collection");
    throw new functions.https.HttpsError(
      "not-found",
      "Could not find language collection."
    );
  } else {
    languageCollections[languageCollectionID] = doc.data();
    log("⚪️ language collection added", doc.data());
  }
  // }
}

async function fetchPublishingQueueMenu() {
  const publishingQueueRef = db.collection("menu").doc("inQueue");
  const docSnapshot = await publishingQueueRef.get();
  if (docSnapshot.empty) {
    // console.log('No matching documents.');
    return null;
  } else {
    return docSnapshot.data();
  }
}

// STEP 2 _________________________________

function generateFullPath(article) {
  let fullPath = "";
  if (article.langCode == "en") {
    fullPath = article.path;
  } else {
    fullPath = article.langCode + "/" + article.path;
  }
  return fullPath;
}

function generateGitHubPath(fullPath) {
  return "articles/" + fullPath + ".md";
}

async function updatePublishedArticles(articles) {
  // Get a new write batch
  const batch1 = db.batch();
  const batch2 = db.batch();
  const batch3 = db.batch();

  let i = 0;

  // 🔁 LOOP THROUGH ALL ARTICLES
  for (const article of articles) {
    // References for docs we want to edit later
    const draftArticleRef = db.collection("articles_draft").doc(article.id);
    const publishedArticleRef = db
      .collection("articles_published")
      .doc(article.id);
    const languageCollectionRef = db
      .collection("languageCollections")
      .doc(article.languageCollectionID);

    let publishedArticlesIndex = null;

    if (languageCollections[article.languageCollectionID].articles_published) {
      // Find the index of the current article language in the articles_published of this article's languageCollection
      publishedArticlesIndex = languageCollections[
        article.languageCollectionID
      ].articles_published.findIndex((x) => x.articleID === article.id);

      log("⚪️ publishedArticlesIndex", publishedArticlesIndex);
    }

    // 🗑 DELETE ARTICLE (published ones)
    // Actions:
    // - remove from language collection
    if (article.deleteArticle && article.publishedFullPath) {
      log("⚪️ delete article", article);

      if (i < 500) batch1.delete(publishedArticleRef);
      else if (i < 1000) batch2.delete(publishedArticleRef);
      else batch3.delete(publishedArticleRef);
      i++;

      // Fallback 'if' statement: articles_published should always be defined for articles that you are trying to delete
      if (
        languageCollections[article.languageCollectionID].articles_published
      ) {
        // Remove article from articles_published array
        languageCollections[
          article.languageCollectionID
        ].articles_published.splice(publishedArticlesIndex, 1);

        log(
          "⚪️ articles_published",
          languageCollections[article.languageCollectionID].articles_published
        );
      }
    } // 🗑 END DELETE ARTICLE

    // 📝 EDIT ARTICLE
    // Actions:
    // 1. Update articles_published collection
    // 2. Build fullPublishedPath from languageCode and path
    // 3. Get details on this language based on the languageCode
    // 4. Define object to add or update in the languageCollection 'articles_published' array.
    // 5. Check if this languageCollection already contains any published articles & find index
    // 6. Create, add to or update articles_published array
    else if (!article.deleteArticle) {
      log("⚪️ edit article", article);

      // 1. Build full link from languageCode and path
      const fullPublishedPath = generateFullPath(article);

      log("⚪️ fullPublishedPath article", fullPublishedPath);

      // Update full published path
      const publishedArticleData = {
        ...article,
        publishedFullPath: fullPublishedPath,
      };
      const draftArticleData = {
        publishedFullPath: fullPublishedPath,
      };

      // 2. Update articles_published and articles_draft collections
      if (i < 500) batch1.set(publishedArticleRef, publishedArticleData);
      else if (i < 1000) batch2.set(publishedArticleRef, publishedArticleData);
      else batch3.set(publishedArticleRef, publishedArticleData);
      i++;

      if (i < 500) batch1.update(draftArticleRef, draftArticleData);
      else if (i < 1000) batch2.update(draftArticleRef, draftArticleData);
      else batch3.update(draftArticleRef, draftArticleData);
      i++;

      // 3. Get details on this language based on the languageCode
      const languageDetails = languages.find(
        (x) => x.code === article.langCode
      );
      log("⚪️ languageDetails", languageDetails);

      // 4. Define object to add or update in the languageCollection 'articles_published' array.
      const languageToAdd = {
        articleID: article.id,
        langCode: article.langCode,
        fullPublishedPath: fullPublishedPath,
        localName: languageDetails.localName,
      };
      log("⚪️ languageToAdd", languageToAdd);

      // 6. Create, add to or update articles_published array

      // A. No published languages yet -> create array
      if (
        !languageCollections[article.languageCollectionID].articles_published
      ) {
        languageCollections[article.languageCollectionID].articles_published = [
          languageToAdd,
        ];
        log(
          "⚪️ No published languages yet -> create articles_published array",
          languageCollections[article.languageCollectionID].articles_published
        );
      }

      // B. Article not included in language collection yet -> add to array
      else if (publishedArticlesIndex === -1) {
        languageCollections[
          article.languageCollectionID
        ].articles_published.push(languageToAdd);

        log(
          "⚪️ Article not included in language collection yet -> add to array",
          languageCollections[article.languageCollectionID].articles_published
        );
      }

      // C. Article has been published before -> update array
      else if (publishedArticlesIndex >= 0) {
        // Remove current instance
        languageCollections[
          article.languageCollectionID
        ].articles_published.splice(publishedArticlesIndex, 1);

        // Add updated instance
        languageCollections[
          article.languageCollectionID
        ].articles_published.push(languageToAdd);

        log(
          "⚪️Article has been published before -> update array",
          languageCollections[article.languageCollectionID].articles_published
        );
      }
    } // 📝 END EDIT ARTICLE

    // 🔤 SORT LANGUAGE COLLECTION ALPHABETICALLY
    languageCollections[article.languageCollectionID].articles_published =
      _.sortBy(
        languageCollections[article.languageCollectionID].articles_published,
        ["localName"]
      );

    // ADD COUNT TO LANGUAGE COLLECTION
    languageCollections[article.languageCollectionID].articles_published_count =
      languageCollections[
        article.languageCollectionID
      ].articles_published.length;

    log(
      "⚪️sort articles_published",
      languageCollections[article.languageCollectionID].articles_published
    );

    if (
      (!languageCollections[article.languageCollectionID].articles_published ||
        !languageCollections[article.languageCollectionID].articles_published
          .length) &&
      (!languageCollections[article.languageCollectionID].articles_draft ||
        !languageCollections[article.languageCollectionID].articles_draft
          .length)
    ) {
      // If both articles_published and articles are empty, delete language collection
      if (i < 500) batch1.delete(languageCollectionRef);
      else if (i < 1000) batch2.delete(languageCollectionRef);
      else batch3.delete(languageCollectionRef);
      i++;
    } else {
      // 🔥 UPDATE LANGUAGE COLLECTION IN FIRESTORE
      const languageCollectionData = {
        articles_published:
          languageCollections[article.languageCollectionID].articles_published,
        articles_published_count:
          languageCollections[article.languageCollectionID].articles_published
            .length,
        lastPublishedServerTimestamp: FieldValue.serverTimestamp(),
      };
      if (i < 500) batch1.update(languageCollectionRef, languageCollectionData);
      else if (i < 1000)
        batch2.update(languageCollectionRef, languageCollectionData);
      else batch3.update(languageCollectionRef, languageCollectionData);
      i++;
    }
  } // 🔁 END LOOP

  // 🔥 COMMIT THE BATCH
  await batch1.commit();
  await batch2.commit();
  await batch3.commit();
}

// STEP 3 _________________________________

async function syncWithGithub(token, articles, menu) {
  const octokit = new Octokit({
    auth: token,
  });

  const owner = "activisthandbook";
  const repo = "activisthandbook";
  const branch = "main";
  const createBranch = false;

  let files = {};
  let filesToDelete = [];

  if (articles) {
    for (const article of articles) {
      const newFullPath = generateFullPath(article);

      // Delete previously published article if it is in bin, or if the path has changed
      if (
        (article.deleteArticle && article.publishedFullPath) ||
        (article.publishedFullPath && article.publishedFullPath !== newFullPath)
      ) {
        const publishedGithubPath = generateGitHubPath(
          article.publishedFullPath
        );
        filesToDelete.push(publishedGithubPath);
      }

      // If this article is not in the bin, we update the file on its new github path (this may be the same as previously)
      if (!article.deleteArticle) {
        const newGithubPath = generateGitHubPath(newFullPath);
        files[newGithubPath] = generateFileContent(article);
      }
    }
    for (const languageCollectionID in languageCollections) {
      const githubPath =
        "articles/public/languageCollections/" + languageCollectionID + ".json";

      if (
        languageCollections[languageCollectionID].articles_published &&
        languageCollections[languageCollectionID].articles_published.length
      ) {
        files[githubPath] = JSON.stringify(
          languageCollections[languageCollectionID].articles_published
        );
      } else if (
        languageCollections[languageCollectionID].lastPublishedServerTimestamp
      ) {
        // If no published articles exist in this language collection, we'll delete it's JSON file
        filesToDelete.push(githubPath);
      }
    }
  }

  if (menu) {
    const fileContentsMenu = generateFileContentMenu(menu);
    files[".vitepress/menus/sidebar.json"] = fileContentsMenu.sidebar;
    log("⚪️ fileContentsMenu", fileContentsMenu);
  }

  log("🔵 files", files);
  log("🔵 filesToDelete", filesToDelete);

  if (Object.keys(files).length || filesToDelete.length) {
    const commits = await octokit.rest.repos.createOrUpdateFiles({
      owner,
      repo,
      branch,
      createBranch,
      changes: [
        {
          message: "Updated using Activist Handbook Editor",
          files: files,
          filesToDelete: filesToDelete,
        },
      ],
    });
  }
}

function generateFileContent(article) {
  // Prevent undefined errors
  const title = article.title || null;
  const description = article.description || null;
  const tags = article.tags || null;
  const id = article.id || null;

  let frontmatter = [];

  function sanitize(value) {
    return sanitizeHtml(value, {});
  }

  function addToFrontmatter(options) {
    const { key, type, value } = options;

    if (value) {
      let hasCorrectType = null;
      let sanitizedValue = null;

      switch (type) {
        case "string":
          hasCorrectType = _.isString(value);
          sanitizedValue = sanitize(value);
          break;
        case "escapedString":
          hasCorrectType = _.isString(value);
          sanitizedValue = ">" + newLine + "  " + sanitize(value);
          break;
        case "array":
          hasCorrectType = _.isArray(value);
          sanitizedValue = sanitize(JSON.stringify(value));
          break;
        case "number":
          hasCorrectType = _.isInteger(value);
          sanitizedValue = value;
          break;
        case "focusMode":
          hasCorrectType =
            value &&
            _.isPlainObject(value) &&
            value.isOn &&
            _.isBoolean(value.isOn) &&
            _.isString(value.buttonLabel) &&
            (value.buttonAnchor === null || _.isString(value.buttonAnchor)) &&
            (value.buttonLink === null || _.isString(value.buttonLink));

          sanitizedValue =
            newLine +
            `  isOn: ${value.isOn}` +
            newLine +
            `  buttonLabel: ${sanitize(value.buttonLabel)}`;

          if (value.buttonAnchor) {
            sanitizedValue =
              sanitizedValue +
              newLine +
              `  buttonAnchor: ${sanitize(value.buttonAnchor)}`;
          }

          if (value.buttonLink) {
            sanitizedValue =
              sanitizedValue +
              newLine +
              `  buttonLink: ${sanitize(value.buttonLink)}`;
          }
          sanitizedValue =
            sanitizedValue +
            newLine +
            `sidebar: false` +
            newLine +
            `aside: false`;
          break;
        case "timestamp":
          hasCorrectType = true;
          sanitizedValue = value.toMillis();

          break;
        default:
          hasCorrectType = true;
          sanitizedValue = sanitize(value);
          break;
      }

      if (hasCorrectType) {
        frontmatter.push(`${key}: ${sanitizedValue}`);
      }
    }
  }

  // Build frontmatter arry
  addToFrontmatter({
    key: "title",
    type: "escapedString",
    value: article.title,
  });
  addToFrontmatter({
    key: "description",
    type: "escapedString",
    value: article.description,
  });

  addToFrontmatter({
    key: "langCode",
    type: "string",
    value: article.langCode,
  });
  addToFrontmatter({ key: "articleID", type: "string", value: article.id });
  addToFrontmatter({
    key: "languageCollectionID",
    type: "string",
    value: article.languageCollectionID,
  });
  addToFrontmatter({
    key: "updatedTimestamp",
    type: "timestamp",
    value: article.metadata.updatedTimestamp,
  });
  addToFrontmatter({
    key: "createdTimestamp",
    type: "timestamp",
    value: article.metadata.createdTimestamp,
  });
  addToFrontmatter({
    key: "wordCount",
    type: "number",
    value: article.wordCount,
  });
  addToFrontmatter({ key: "tags", type: "array", value: article.tags });
  addToFrontmatter({
    key: "focusMode",
    type: "focusMode",
    value: article.focusMode,
  });

  // Create string from all frontmatter items, separated with an enter.
  frontmatterString = frontmatter.join(newLine);

  // let turndownService = new TurndownService({
  //   headingStyle: "atx",
  //   bulletListMarker: "-",
  // });
  // turndownService.keep([
  //   "div",
  //   "iframe",
  //   "dynamic-image",
  //   "action-custom",
  //   "action-donate",
  //   "action-smart-small",
  //   "action-signup",
  //   "action-button",
  // ]);

  const sanitizedContentHTML = sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "iframe",
      // Custom elements (make sure these are also included in TurndownService!!!)
      // "client-only",
      "dynamic-image",
      "action-donate",
      "action-signup",
      "action-custom",
      "action-smart-small",
      "action-button",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ["src", "allowfullscreen", "start", "width", "height"],
      div: ["data-youtube-video"],
      "dynamic-image": ["alt", "imageid", "title"],
      "action-signup": ["tags", "redirect", "buttonlabel"],
      "action-custom": ["buttonlink", "buttonlabel"],
      "action-button": ["buttonlink", "buttonanchor", "buttonlabel"],
    },

    allowedIframeHostnames: ["www.youtube-nocookie.com"],
  });

  log("⚪️ sanitizedContentHTML", sanitizedContentHTML);

  const sanitizedContentMarkdown =
    turndownService.turndown(sanitizedContentHTML);

  // const sanitizedContentMarkdown =
  //   htmlToMarkdown.translate(sanitizedContentHTML);

  log("⚪️ sanitizedContentMarkdown 2", sanitizedContentMarkdown);

  const fileContents =
    `---` +
    newLine +
    `${frontmatterString}` +
    newLine +
    `---` +
    newLine +
    newLine +
    sanitizedContentMarkdown;

  log("⚪️ fileContents", fileContents);

  return fileContents;
}

function generateFileContentMenu(menu) {
  if (menu.sidebar.en) {
    // Change name of 'en' sidebar, and put it at the end of the object (because if it's position in the object would be before other languages, those would never match in vitepress)
    const enSidebar = menu.sidebar.en;
    delete menu.sidebar.en;
    menu.sidebar["/"] = enSidebar;
  }

  const sidebarFileContents = JSON.stringify(menu.sidebar);

  return { sidebar: sidebarFileContents };
}

// STEP 4 _________________________________

async function clearPublishingQueue(articles, menu) {
  // Get a new write batch
  const batch1 = db.batch();
  const batch2 = db.batch();
  const batch3 = db.batch();

  if (articles) {
    let i = 0;
    for (const article of articles) {
      const articleRef = db.collection("articles_inQueue").doc(article.id);
      if (i < 500) batch1.delete(articleRef);
      else if (i < 1000) batch2.delete(articleRef);
      else batch3.delete(articleRef);
      i++;
    }
  }

  if (menu) {
    const menuPublishingQueueRef = db.collection("menu").doc("inQueue");

    batch1.delete(menuPublishingQueueRef);
    const moderatorRef = db.collection("app").doc("analytics");
    batch1.set(
      moderatorRef,
      {
        menuInPublishingQueue: false,
      },
      { merge: true }
    );
  }

  // Commit the batch
  await batch1.commit();
  await batch2.commit();
  await batch3.commit();
}

function log(message, attachment) {
  if (debugging) {
    if (attachment) {
      functions.logger.log(message, attachment);
    } else {
      functions.logger.log(message);
    }
  }
}
