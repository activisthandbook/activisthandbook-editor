import { defineStore } from "pinia";
import * as Y from "yjs";

import _ from "lodash";

import sanitizeHtml from "sanitize-html";

import { Notify, LoadingBar } from "quasar";

import { useLanguagesStore } from "stores/languages";
const languagesStore = useLanguagesStore();

import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
  increment,
} from "firebase/firestore";
const db = getFirestore();

export const useEditorStore = defineStore("editor", {
  state: () => ({
    editorsInitialised: false,
    recentArticles: [],
    local: {
      lastSaveTimestamp: null,
      lastEditTimestamp: null,
    },
    tiptap: {
      content: null,
    },

    article: {
      id: null,
      title: null,
      description: null,

      path: null,
      pathTags: null, // Must sync with path
      pathDepth: null, // Must sync with path
      publishedFullPath: null, // May only be changed by cloud function

      tags: null,
      focusMode: {
        isOn: false,
        buttonLabel: "",
        buttonAnchor: "primary-action",
        buttonLink: "",
      },

      landingPage: {
        isOn: false,
      },

      content: null,
      contentHeaders: null, // Syncs with content
      contentImages: null, // Syncs with content

      deleteArticle: null,

      requestedPublication: null,
      requestedPublicationTimestamp: null,

      langCode: null, // Cannot change

      // https://medium.com/feedflood/update-data-in-cloud-firestore-merge-true-in-set-operation-166703040de
      metadata: {
        createdTimestamp: null,
        createdBy: null,
        updatedTimestamp: null,
        updatedTimestamp: null,
      },
    },
    articleDataLoaded: false,
  }),
  actions: {
    // any amount of arguments, return a promise or not
    async fetchFromServer(articleID) {
      if (this.editorsInitialised) {
        this.tiptap.title.destroy();
        this.tiptap.description.destroy();
        this.tiptap.content.destroy();
      }
      this.$reset();

      if (articleID) {
        this.article.id = articleID;
        LoadingBar.start();

        await getDoc(doc(db, "articles_draft", articleID))
          .then(async (snapshot) => {
            if (snapshot.exists()) {
              // Find language info from local store, using the language code that is saved with the article
              const lang = languagesStore.languages.find(
                (x) => x.code === snapshot.data().langCode
              );

              this.article = { ...this.article, ...snapshot.data(), lang };

              document.title = `Edit | ${this.article.title || "No title"}`;

              // Load the language collection data
              const languageCollectionID = snapshot.data().languageCollectionID;
              await getDoc(
                doc(db, "languageCollections", languageCollectionID)
              ).then(async (snapshot) => {
                if (snapshot.exists()) {
                  const languageCollection = snapshot.data().articles;
                  this.local.languageCollection = [];
                  languageCollection.forEach((article) => {
                    const languageDetails = languagesStore.languages.find(
                      (x) => x.code === article.langCode
                    );
                    this.local.languageCollection.push({
                      ...article,
                      ...languageDetails,
                    });
                  });
                } else {
                  Notify.create("Language collection not found.");
                }
              });

              // Add data to tiptap views
              this.tiptap.title.commands.setContent(
                sanitizeHtml(this.article.title),
                true
              );
              this.tiptap.description.commands.setContent(
                sanitizeHtml(this.article.description),
                true
              );

              this.tiptap.path.commands.setContent(
                sanitizeHtml(this.article.path),
                true
              );
              this.tiptap.content.commands.setContent(
                // IMPORTANT: this sanitisation must match the one in the cloud functions!
                sanitizeHtml(this.article.content, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                    "iframe",
                    // Custom elements
                    // "client-only",
                    "dynamic-image",
                    "action-donate",
                    "action-volunteer",
                    "action-custom",
                    "action-smart-small",
                    "action-button",
                  ]),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    iframe: [
                      "src",
                      "allowfullscreen",
                      "start",
                      "width",
                      "height",
                    ],
                    div: ["data-youtube-video"],
                    "dynamic-image": ["alt", "imageid", "title"],
                    "action-custom": ["buttonlink", "buttonlabel"],
                    "action-button": [
                      "buttonlink",
                      "buttonanchor",
                      "buttonlabel",
                    ],
                  },

                  allowedIframeHostnames: ["www.youtube-nocookie.com"],
                }),

                true
              );

              await this.render();

              this.articleDataLoaded = true;
              LoadingBar.stop();
            } else {
              Notify.create("Article not found.");
              this.router.push({ name: "404" });
              LoadingBar.stop();
            }
          })
          .catch((error) => {
            console.error(error);
          });

        this.editorsInitialised = true;
      }
    },
    async renderAndSave(userID) {
      this.local.lastEditTimestamp = Date.now();
      await this.throttledRender();
      await this.throttledSave(userID);
      await this.updateMyRecentArticles(userID);
    },
    throttledRender: _.throttle(async function (userID) {
      this.render(userID);
    }, 4000),
    async render(userID) {
      this.article.title = this.tiptap.title.getHTML().slice(3, -4);
      this.article.description = this.tiptap.description.getHTML().slice(3, -4);
      this.article.content = this.tiptap.content.getHTML();

      this.article.wordCount =
        this.tiptap.content.storage.characterCount.words();

      await this.updateHeadings();
      await this.updateImages();
      await this.updatePathTags();
    },
    throttledSave: _.throttle(async function (userID) {
      await this.save(userID);
    }, 5000),
    async save(userID) {
      await setDoc(
        doc(db, "articles_draft", this.article.id),
        {
          ...this.article,
          metadata: {
            updatedTimestamp: serverTimestamp(),
            updatedBy: userID,
          },
        },
        { merge: true }
      )
        .then(() => {
          this.local.lastSaveTimestamp = Date.now();
        })
        .catch((error) => {
          Notify.create("Saving failed");
          console.error(error);
        });
    },
    updateMyRecentArticles: async function (userID) {
      if (!this.recentArticles.includes(this.article.id)) {
        this.recentArticles.push(this.article.id);
        await setDoc(
          doc(db, "userProfiles", userID),
          {
            recentlyEditedArticles: arrayRemove(this.article.id),
            metadata: {
              updatedTimestamp: serverTimestamp(),
              updatedBy: userID,
            },
          },
          { merge: true }
        ).catch((error) => {
          Notify.create("Saving recent edits failed");
          console.error(error);
        });
        await setDoc(
          doc(db, "userProfiles", userID),
          {
            recentlyEditedArticles: arrayUnion(this.article.id),
            editCount: increment(1),
            metadata: {
              updatedTimestamp: serverTimestamp(),
              updatedBy: userID,
            },
          },
          { merge: true }
        ).catch((error) => {
          Notify.create("Saving recent edits failed");
          console.error(error);
        });
      }
    },
    async updateHeadings() {
      const headings = [];
      const transaction = this.tiptap.content.state.tr;

      this.tiptap.content.state.doc.descendants(async (node, pos) => {
        if (node.type.name === "heading") {
          const id = `heading-${headings.length + 1}`;

          if (node.attrs.id !== id) {
            transaction.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              id,
            });
          }

          headings.push({
            level: node.attrs.level,
            text: node.textContent,
            id,
          });
        }
      });

      transaction.setMeta("addToHistory", false);
      transaction.setMeta("preventUpdate", true);

      await this.tiptap.content.view.dispatch(transaction);

      this.article.contentHeaders = headings;
    },
    async updateImages() {
      const images = [];

      await this.tiptap.content.state.doc.descendants(async (node, pos) => {
        if (node.type.name === "imageWithCaption") {
          images.push(node.attrs.imageid);
        }
      });

      this.article.contentImages = images;
    },
    async updatePathTags() {
      if (this.article.path) {
        const array = this.article.path.split("/");
        let finalArray = [];

        for (let i = 0; i < array.length; i++) {
          finalArray.push(`${i}*${array[i]}`);
        }

        this.article.pathTags = finalArray;
        this.article.pathDepth = finalArray.length;
      }
    },
    validateArticle() {
      let errorList = [];
      let hasErrors = false;
      if (this.tiptap.content.getHTML() === "<p></p>") {
        errorList.push("Write some article content.");
      }
      if (this.tiptap.title.getHTML() === "<p></p>") {
        errorList.push("Make sure to add a title.");
      }
      if (this.tiptap.description.getHTML() === "<p></p>") {
        errorList.push("Don't forget the description.");
      }
      if (!this.article.path) {
        // TO-DO: Add check to see if path already exists.
        errorList.push("Add a url path.");
      }
      if (errorList.length) {
        hasErrors = true;
      }
      return {
        hasErrors,
        errorList,
      };
    },
  },
});
