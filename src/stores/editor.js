import { defineStore } from "pinia";
import * as Y from "yjs";

import sanitizeHtml from "sanitize-html";

import { getFirestore, getDoc, doc } from "firebase/firestore";
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
      syncedData: null, // ymap

      // helper variables:
      titleRendered: false,
      descriptionRendered: false,
      contentRendered: false,
      pathRendered: false,
    },
    hasPeers: false,
    syncedData: {
      nextSaveClaimedBy: null,
      nextSaveTimestamp: null,
      lastSaveTimestamp: null,
      lastPersonJoinedTimestamp: null,
      requestedPublication: null,
      requestedPublicationTimestamp: null,
    },
    article: {
      title: null,
      description: null,
      path: null,
      content: null,
    },
    lastEditTimestamp: null,
  }),
  actions: {
    // any amount of arguments, return a promise or not
    async fetchFromServer() {
      await getDoc(doc(db, "articles", "test2"))
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
              this.y.syncedData.set(
                "requestedPublication",
                snapshot.data().requestedPublication
              );
              this.y.syncedData.set(
                "requestedPublicationTimestamp",
                snapshot.data().requestedPublicationTimestamp
              );
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
  },
});
