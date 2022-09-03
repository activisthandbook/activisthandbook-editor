import { defineStore } from "pinia";
import * as Y from "yjs";

import _ from "lodash";

import sanitizeHtml from "sanitize-html";

import { Notify } from "quasar";

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
    y: {
      provider: null,
      clientID: null,

      // y documents:
      title: null, // tiptap doc
      description: null, // tiptap doc
      path: null, // tiptap doc
      content: null, // tiptap doc
      // syncedData: null, // ymap

      // helper variables:
      titleRendered: false,
      descriptionRendered: false,
      contentRendered: false,
      pathRendered: false,
    },
    hasPeers: false,
    // syncedData: {
    //   nextSaveClaimedBy: null,
    //   nextSaveTimestamp: null,
    //   lastSaveTimestamp: null,
    //   lastPersonJoinedTimestamp: null,
    //   requestedPublication: null,
    //   requestedPublicationTimestamp: null,
    //   deleteArticle: null,
    // },
    article: {
      title: null,
      description: null,
      path: null,
      content: null,
      deleteArticle: null,
      requestedPublication: null,
    },
    lastEditTimestamp: null,
    numberOfSaves: 1,
  }),
  actions: {
    // any amount of arguments, return a promise or not
    async fetchFromServer(articleID) {
      this.article.id = articleID;
      await getDoc(doc(db, "articles", articleID))
        .then((snapshot) => {
          if (snapshot.exists()) {
            if (this.y.content.getHTML() === "<p></p>") {
              // We only want to set the content if it is currently empty
              this.y.title.commands.setContent(
                sanitizeHtml(snapshot.data().title),
                true
              );
              this.y.description.commands.setContent(
                sanitizeHtml(snapshot.data().description),
                true
              );
              this.y.path.commands.setContent(
                sanitizeHtml(snapshot.data().path),
                true
              );
              this.y.content.commands.setContent(
                sanitizeHtml(snapshot.data().content),
                true
              );
              // this.y.syncedData.set(
              //   "requestedPublication",
              //   snapshot.data().requestedPublication
              // );
              // this.y.syncedData.set(
              //   "deleteArticle",
              //   snapshot.data().deleteArticle
              // );
              // this.y.syncedData.set(
              //   "requestedPublicationTimestamp",
              //   snapshot.data().requestedPublicationTimestamp
              // );
              // console.log(
              //   snapshot.data().requestedPublicationTimestamp.toDate()
              // );
            }

            this.dataOrigin = "server";

            this.loadedFromServer = true;
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async save() {
      // if (
      //   this.y.titleRendered &&
      //   this.y.descriptionRendered &&
      //   this.y.contentRendered &&
      //   this.y.pathRendered
      // ) {
      // the document has been edited, so we set saved to false

      // if (this.numberOfSaves >= 3) {
      // the first 3 times the article watcher is just updated from initialising the editor, the 4th time is from loading from p2p or server, so we do not have to save anything to the server in those cases

      // console.log(this.numberOfSaves, "Save!");
      // the document has been edited, so we set saved to false

      this.article.title = this.y.title.getHTML().slice(3, -4);
      this.article.description = this.y.description.getHTML().slice(3, -4);
      this.article.content = this.y.content.getHTML();
      this.article.path = this.y.path.getHTML().slice(3, -4);

      this.lastEditTimestamp = Date.now();
      // await this.announcePushToServer();
      await this.pushToServer();
      // }

      // this.numberOfSaves += 1;
      // }
    },
    // announcePushToServer: _.throttle(async function () {
    //   const time = Date.now();

    //   if (
    //     !this.syncedData.nextSaveTimestamp ||
    //     (this.syncedData.nextSaveClaimedBy !== this.y.clientID && // someone else
    //       this.syncedData.nextSaveTimestamp < this.lastEditTimestamp) // their last save is not up-to-date
    //   ) {
    //   console.log("I'm gonna do it");
    //   await this.y.syncedData.set("nextSaveClaimedBy", this.y.clientID);
    //   await this.y.syncedData.set("nextSaveTimestamp", time);
    //   }
    // }, 3000),
    pushToServer: _.throttle(async function () {
      console.log("Saving...");
      // if (this.y.clientID === this.syncedData.nextSaveClaimedBy) {
      // if (this.article.content !== "<p></p>") {
      await setDoc(
        doc(db, "articles", this.article.id),
        {
          ...this.article,
          lastUpdatedServerTimestamp: serverTimestamp(),
        },
        { merge: true }
      )
        .then(() => {
          // console.log("synced!");

          const time = Date.now();
          // this.y.syncedData.set("lastSaveTimestamp", time);
          this.saved = true;
          console.log("Saved!");
        })
        .catch((error) => {
          Notify.create("Saving failed");
          console.log(error);
        });
      // }
      // }
    }, 4000),
    validateArticle() {
      let errorList = [];
      let hasErrors = false;
      if (this.y.content.getHTML() === "<p></p>") {
        errorList.push("Write some article content.");
      }
      if (this.y.title.getHTML() === "<p></p>") {
        errorList.push("Make sure to add a title.");
      }
      if (this.y.description.getHTML() === "<p></p>") {
        errorList.push("Don't forget the description.");
      }
      if (this.y.path.getHTML() === "<p></p>") {
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
