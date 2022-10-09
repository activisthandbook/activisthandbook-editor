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
      // tiptap docs
      // title: null,
      // description: null,
      content: null,
    },

    article: {
      id: null,
      title: null,
      description: null,
      path: null,
      tags: null,
      focusMode: {
        isOn: false,
        buttonLabel: null,
        buttonAnchor: "primary-action",
        buttonLink: null,
      },

      content: null,
      contentHeaders: null,
      contentImages: null,

      deleteArticle: null,
      requestedPublication: null,
      requestedPublicationTimestamp: null,
      langCode: null,
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

        await getDoc(doc(db, "articles", articleID))
          .then(async (snapshot) => {
            if (snapshot.exists()) {
              // Find language info from local store, using the language code that is saved with the article
              const lang = languagesStore.languages.find(
                (x) => x.code === snapshot.data().langCode
              );

              this.article = { ...this.article, ...snapshot.data(), lang };

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
                    "img",
                    "figure",
                    "figcaption",
                    // Custom elements
                    "action-donate",
                    "action-volunteer",
                    "action-custom",
                    "action-smart-small",
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
                    img: [
                      "src",
                      "alt",
                      "imageid",
                      "imagesource",
                      "imagecaption",
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
      await this.render();
      await this.save(userID);
      await this.updateMyRecentArticles(userID);
    },
    render: _.throttle(async function (userID) {
      this.article.title = this.tiptap.title.getHTML().slice(3, -4);
      this.article.description = this.tiptap.description.getHTML().slice(3, -4);
      this.article.content = this.tiptap.content.getHTML();

      console.log("test", this.tiptap.content.getJSON());

      this.article.wordCount =
        this.tiptap.content.storage.characterCount.words();

      await this.updateHeadings();
      await this.updateImages();
    }, 4000),
    save: _.throttle(async function (userID) {
      await setDoc(
        doc(db, "articles", this.article.id),
        {
          ...this.article,
          lastUpdatedServerTimestamp: serverTimestamp(),
          lastUpdatedBy: userID,
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
    }, 4000),
    updateMyRecentArticles: async function (userID) {
      if (!this.recentArticles.includes(this.article.id)) {
        this.recentArticles.push(this.article.id);
        await setDoc(
          doc(db, "users", userID),
          {
            recentlyEditedArticles: arrayRemove(this.article.id),
          },
          { merge: true }
        ).catch((error) => {
          Notify.create("Saving recent edits failed");
          console.error(error);
        });
        await setDoc(
          doc(db, "users", userID),
          {
            recentlyEditedArticles: arrayUnion(this.article.id),
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

      console.log("test!");

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
          images.push(node.attrs.imageID);
        }
      });

      this.article.contentImages = images;
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
