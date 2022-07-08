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
        (editorStore.lastEditTimestamp && !lastSaveTimestamp) ||
        editorStore.lastEditTimestamp > lastSaveTimestamp
      "
      icon="mdi-sync"
      >Saving...</q-chip
    >
    <q-chip color="grey-3" text-color="grey-9" v-else icon="mdi-cloud-check"
      >Saved</q-chip
    >
  </q-page-sticky>
</template>

<script>
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
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
        path: "",
      },
      numberOfSaves: 1,
      dataOrigin: null,
      loadedFromServer: false,
      firstCheckDone: false,
      secondCheckDone: false,
    };
  },

  computed: {
    nextSaveClaimedBy: function () {
      return this.editorStore.syncedData.nextSaveClaimedBy;
    },
    nextSaveTimestamp: function () {
      return this.editorStore.syncedData.nextSaveTimestamp;
    },
    lastSaveTimestamp: function () {
      return this.editorStore.syncedData.lastSaveTimestamp;
    },
    connectedP2P: function () {
      return this.editorStore.y.provider.connected;
    },
  },

  watch: {
    article: {
      handler(newValue) {
        if (
          this.editorStore.y.titleRendered &&
          this.editorStore.y.descriptionRendered &&
          this.editorStore.y.contentRendered &&
          this.editorStore.y.pathRendered
        ) {
          // the document has been edited, so we set saved to false

          if (this.numberOfSaves === 1) {
            // console.log(this.numberOfSaves, "First check!");
            this.firstCheckDone = true;
            // the first 3 times the article watcher is just updated from initialising the editor, the 4th time is from loading from p2p or server, so we do not have to save anything to the server in those cases
          } else if (this.numberOfSaves === 2) {
            // console.log(this.numberOfSaves, "Second check!");
            this.secondCheckDone = true;
            // console.log("second check");
          } else {
            // console.log(this.numberOfSaves, "Save!");
            // the document has been edited, so we set saved to false
            this.editorStore.lastEditTimestamp = Date.now();
            this.announceSave();
            this.save(newValue);
          }

          this.numberOfSaves += 1;
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
    announceSave: _.throttle(function () {
      const time = Date.now();

      if (
        !this.nextSaveTimestamp ||
        (this.nextSaveClaimedBy !== this.editorStore.y.clientID && // someone else
          this.nextSaveTimestamp < this.editorStore.lastEditTimestamp) // their last save is not up-to-date
      ) {
        // console.log("I'm gonna do it");
        this.editorStore.y.syncedData.set(
          "nextSaveClaimedBy",
          this.editorStore.y.clientID
        );
        this.editorStore.y.syncedData.set("nextSaveTimestamp", time);
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
    }, 3000),
    save: _.throttle(function (article) {
      console.log("Save!");
      if (this.editorStore.y.clientID === this.nextSaveClaimedBy) {
        if (this.article.content !== "<p></p>") {
          setDoc(
            doc(db, "articles/test2"),
            {
              ...this.editorStore.article,
              lastUpdatedServerTimestamp: serverTimestamp(),
            },
            { merge: true }
          ).then(() => {
            // console.log("synced!");

            const time = Date.now();
            this.editorStore.y.syncedData.set("lastSaveTimestamp", time);
            this.saved = true;
          });
        }
      }
    }, 4000),
  },
};
</script>
