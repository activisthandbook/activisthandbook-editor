<template>
  <!-- <q-input
    placeholder="Title..."
    class="text-h1"
    v-model="title"
    color="secondary"
  >
    <template v-slot:append>
      <q-btn icon="mdi-cog" flat round color="black" />
    </template>
  </q-input>

  <q-input
    label="Description"
    type="textarea"
    color="secondary"
    v-model="description"
    autogrow
    outlined
  /> -->

  <TipTapEditor v-model="article" />

  <q-page-sticky position="bottom-left" :offset="[8, 8]">
    <q-chip
      color="grey-3"
      text-color="grey-8"
      v-if="
        (lastEditTimestamp && !lastSaveTimestamp) ||
        lastEditTimestamp > lastSaveTimestamp
      "
      icon="mdi-sync"
      >Saving...</q-chip
    >
    <q-chip color="grey-3" text-color="grey-8" v-else icon="mdi-cloud-check"
      >Saved</q-chip
    >
  </q-page-sticky>
</template>

<script>
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import sanitizeHtml from "sanitize-html";

import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
const db = getFirestore();

import _ from "lodash";

// VUE COMPONENTS
import TipTapEditor from "components/TipTapEditor.vue";

export default {
  setup() {
    const editorStore = useEditorStore();
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      editorStore,
      firebaseStore,
    };
  },
  components: {
    TipTapEditor,
  },

  data() {
    return {
      articleSync: null,
      article: {
        title: "",
        description: "",
        content: "",
      },
      numberOfSaves: 0,
      lastEditTimestamp: null,
      dataOrigin: null,
      loadedFromServer: false,
      firstCheckDone: false,
      secondCheckDone: false,
    };
  },

  computed: {
    nextSaveClaimedBy: function () {
      if (this.editorStore.syncData) {
        return null;
      } else return null;
    },
    nextSaveTimestamp: function () {
      if (this.editorStore.syncData) {
        return null;
      } else return null;
    },
    lastSaveTimestamp: function () {
      if (this.editorStore.syncData) {
        return null;
      } else return null;
    },
    connectedP2P: function () {
      return this.editorStore.provider.connected;
    },
  },

  watch: {
    article: {
      handler(newValue) {
        this.numberOfSaves += 1;

        if (
          this.editorStore.titleRendered &&
          this.editorStore.descriptionRendered &&
          this.editorStore.contentRendered
        ) {
          if (!this.firstCheckDone) {
            // console.log("first check");
            this.firstCheckDone = true;
            // the first 3 times the article watcher is just updated from initialising the editor, the 4th time is from loading from p2p or server, so we do not have to save anything to the server in those cases

            this.loadFromServer();
          } else if (!this.secondCheckDone) {
            this.secondCheckDone = true;
            // console.log("second check");
          } else {
            // the document has been edited, so we set saved to false
            this.lastEditTimestamp = Date.now();
            this.announceSave();
            this.save(newValue);
          }
        }
      },
      deep: true,
    },
  },

  methods: {
    loadFromServer: function () {
      if (this.connectedP2P) {
        console.log("connected immediately");
        this.fetch();
      } else {
        this.$watch("connectedP2P", (connected) => {
          console.log("watching connect");
          if (connected) {
            console.log("connected after watch");
            this.fetch();
          }
        });
      }
    },
    fetch: async function () {
      setTimeout(() => {
        // we don't really know when
        if (
          this.editorStore.content.storage.collaborationCursor.users.length ===
          1
        ) {
          getDoc(doc(db, "articles", "test"))
            .then((snapshot) => {
              if (snapshot.exists()) {
                this.editorStore.title.commands.setContent(
                  sanitizeHtml(snapshot.data().title),
                  true
                );
                this.editorStore.description.commands.setContent(
                  sanitizeHtml(snapshot.data().description),
                  true
                );
                this.editorStore.path.commands.setContent(
                  sanitizeHtml(snapshot.data().path),
                  true
                );
                this.editorStore.content.commands.setContent(
                  sanitizeHtml(snapshot.data().content),
                  true
                );
                this.editorStore.syncYdoc.set(
                  "requestedPublication",
                  snapshot.data().requestedPublication
                );
                this.dataOrigin = "server";

                this.loadedFromServer = true;
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }, 500);
    },
    announceSave: _.debounce(function () {
      const time = Date.now();

      // console.log(
      //   "same person",
      //   this.nextSaveClaimedBy !== this.editorStore.clientID
      // );
      // console.log("time", this.nextSaveTimestamp, this.lastEditTimestamp);

      if (
        !this.nextSaveTimestamp ||
        (this.nextSaveClaimedBy !== this.editorStore.clientID && // someone else
          this.nextSaveTimestamp < this.lastEditTimestamp) // their last save is not up-to-date
      ) {
        // console.log("I'm gonna do it");
        this.editorStore.syncYdoc.set(
          "nextSaveClaimedBy",
          this.editorStore.clientID
        );
        this.editorStore.syncYdoc.set("nextSaveTimestamp", time);
      }

      // if (
      //   !this.articleSync ||
      //   (pointInFuture > this.articleSync.timestampLastSynced &&
      //     this.editorStore.clientID !== this.articleSync.syncedByClientID)
      // ) {
      //   console.log("ok, I'm gonna do it!");
      //   setDoc(
      //     doc(db, "articleSync", "test"),
      //     {
      //       timestampLastSynced: serverTimestamp(),
      //       syncedByClientID: this.editorStore.clientID,
      //     },
      //     { merge: true }
      //   ).then(() => {
      //     this.saved = true;
      //   });
      // }
    }, 2000),
    save: _.debounce(function (article) {
      if (this.editorStore.clientID === this.nextSaveClaimedBy) {
        if (this.article.content !== "<p></p>") {
          setDoc(
            doc(db, "articles/test"),
            {
              title: article.title.slice(3, -4), // removing the <p> and </p> tags
              description: article.description.slice(3, -4), // removing the <p> and </p> tags
              path: article.path.slice(3, -4), // removing the <p> and </p> tags
              content: article.content,
            },
            { merge: true }
          ).then(() => {
            // console.log("synced!");

            const time = Date.now();
            this.editorStore.syncYdoc.set("lastSaveTimestamp", time);
            this.saved = true;
          });
        }
      }
    }, 3000),
  },
};
</script>
