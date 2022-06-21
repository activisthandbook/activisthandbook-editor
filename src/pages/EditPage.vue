<template>
  <q-input
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
  />

  <EditorMenu v-if="editorStore && editorStore.editor" />

  <TipTapEditor v-model="content" />

  <q-page-sticky position="bottom-left" :offset="[8, 8]">
    <q-chip
      v-if="
        !saved &&
        this.editorStore.clientID === this.articleSync.syncedByClientID
      "
      icon="mdi-sync"
      >Saving...</q-chip
    >
    <q-chip v-else icon="mdi-cloud-check">Saved</q-chip>
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
import EditorMenu from "components/EditorMenu.vue";

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
    EditorMenu,
  },

  data() {
    return {
      content: "",
      title: "",
      description: "",
      firstSave: true,
      saved: true,
      articleSync: null,
    };
  },

  mounted: function () {
    const articleSyncRef = doc(db, "articleSync", "test");
    onSnapshot(articleSyncRef, (doc) => {
      this.articleSync = doc.data();
    });
  },

  watch: {
    content: async function (newValue, oldValue) {
      // console.log(this.editor.getHTML());
      if (!this.firstSave && !this.serverSave) {
        console.log("watch content triggered");
        this.debouncerFirst();
        this.debouncerSecond(newValue);
        this.saved = false;
      } else {
        this.firstSave = false;
        if (newValue === "<p></p>") {
          this.serverSave = true;
          // no content yet

          getDoc(doc(db, "articles", "test"))
            .then((snapshot) => {
              if (snapshot.exists()) {
                this.content = sanitizeHtml(snapshot.data().content);
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          this.serverSave = false;
        }
      }
    },
  },

  methods: {
    debouncerFirst: _.debounce(function (newVal) {
      if (
        !this.articleSync ||
        (Date.now() + 3 * 1000 > this.articleSync.timestampLastSynced &&
          this.editorStore.clientID !== this.articleSync.syncedByClientID)
      ) {
        console.log("ok, I'm gonna do it!");
        setDoc(
          doc(db, "articleSync", "test"),
          {
            timestampLastSynced: serverTimestamp(),
            syncedByClientID: this.editorStore.clientID,
          },
          { merge: true }
        ).then(() => {
          this.saved = true;
        });
      }
    }, 5000),
    debouncerSecond: _.debounce(function (newVal) {
      console.log("debouncer");

      // console.log(
      //   this.editorStore.clientID === this.articleSync.syncedByClientID
      // );
      // console.log(Date.now() + 6 * 1000 > this.articleSync.timestampLastSynced);

      if (
        !this.articleSync ||
        this.editorStore.clientID === this.articleSync.syncedByClientID
      ) {
        console.log("synced!");
        setDoc(
          doc(db, "articles/test"),
          {
            content: newVal,
          },
          { merge: true }
        ).then(() => {
          this.saved = true;
        });
      }
    }, 6000),
  },
};
</script>
<style lang="scss">
.is-active {
  background: $secondary;
  color: white;
}
.sticky {
  position: sticky;
  top: 16px;
  z-index: 1;
}
.ProseMirror {
  outline: none;
  min-height: 180px;
}

// Placeholder
.ProseMirror .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: #888;
  pointer-events: none;
  height: 0;
}

/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  opacity: 1;
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
  cursor: pointer;
  z-index: 3000;

  &:hover {
    opacity: 0.5;
  }
}

a:focus {
  background: grey;
}

.generator {
  transition: 2s opacity;
}
.less-visible {
  opacity: 0.5;

  &:hover {
    opacity: 1;
  }
}
</style>
