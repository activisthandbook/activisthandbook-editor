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
} from "firebase/firestore";
const db = getFirestore();

export const useEditorStore = defineStore("editor", {
  state: () => ({
    editorsInitialised: false,
    local: {
      lastSaveTimestamp: null,
      lastEditTimestamp: null,
    },
    tiptap: {
      // tiptap docs
      title: null,
      description: null,
      content: null,
    },

    article: {
      id: null,
      title: null,
      description: null,
      path: null,
      content: null,
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
                    img: ["src", "alt"],
                  },

                  allowedIframeHostnames: ["www.youtube-nocookie.com"],
                }),

                true
              );

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
    async renderAndSave() {
      this.render();
      await this.save();
    },
    render() {
      this.article.title = this.tiptap.title.getHTML().slice(3, -4);
      this.article.description = this.tiptap.description.getHTML().slice(3, -4);
      this.article.content = this.tiptap.content.getHTML();
      this.local.lastEditTimestamp = Date.now();
      this.article.wordCount =
        this.tiptap.content.storage.characterCount.words();
    },
    save: _.throttle(async function () {
      await setDoc(
        doc(db, "articles", this.article.id),
        {
          ...this.article,
          lastUpdatedServerTimestamp: serverTimestamp(),
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
      // }
      // }
    }, 4000),
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
