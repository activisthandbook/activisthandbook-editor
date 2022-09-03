<template>
  <editor-content
    :editor="editorStore.y.title"
    class="text-h1 title"
    :class="{ editable }"
  />
  <editor-content
    :editor="editorStore.y.description"
    class="description"
    :class="{ editable }"
  />

  <q-select
    v-model="language"
    :options="languages"
    label="Language"
    dense
    outlined
    color="secondary"
  />

  <editor-content
    :editor="editorStore.y.path"
    class="path text-caption"
    :class="{ editable }"
  />

  <EditorMenu />

  <editor-content
    :editor="editorStore.y.content"
    class="content"
    :class="{ editable }"
  />

  <!-- 👉 TO-DO: AI-generate text -->
  <!-- <div
    class="text-center generator"
    v-if="
      editorStore &&
      editorStore.content &&
      editorStore.content.storage.characterCount.words() < 60
    "
    :class="{
      'less-visible': editorStore.content.storage.characterCount.words() > 30,
    }"
  >
    <q-separator class="q-my-lg" />
    <div class="text-caption q-mb-sm">
      Don't feel like starting with an empty page?
    </div>
    <q-btn
      label="Generate outline"
      no-caps
      class="gradient"
      text-color="white"
    />
  </div> -->

  <!-- 👉 TO-DO: Tags -->

  <!-- <q-page-sticky
    position="bottom-right"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.y.content"
  >
    <q-chip color="grey-3" text-color="grey-9">
      <span class="q-gutter-x-xs items-center flex">
        <q-icon name="mdi-circle" color="secondary" style="margin-left: -1px" />
        <strong>
          {{
            editorStore.y.content.storage.collaborationCursor.users.length
          }}</strong
        >
        <span>online</span>
      </span>
    </q-chip>
  </q-page-sticky> -->
  <q-page-sticky
    position="bottom-left"
    :offset="[12, 12]"
    v-if="editorStore && editorStore.y.content"
  >
    <q-chip square color="grey-3" text-color="grey-9">
      <span class="q-gutter-x-xs">
        <strong>
          {{ editorStore.y.content.storage.characterCount.words() }}</strong
        >
        <span>words</span>
      </span>
      <q-separator vertical class="q-mx-sm" />
      <span
        v-if="
          (editorStore.lastEditTimestamp && !lastSaveTimestamp) ||
          editorStore.lastEditTimestamp > lastSaveTimestamp
        "
      >
        <q-icon name="mdi-sync" />
        Saving...
      </span>
      <span v-else icon="">
        <q-icon name="mdi-cloud-check" />
        Saved
      </span>
    </q-chip>
  </q-page-sticky>
</template>

<script>
import EditorMenu from "components/EditorMenu.vue";

import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import _ from "lodash";

import { Editor, EditorContent } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";

import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Link from "@tiptap/extension-link";
import Focus from "@tiptap/extension-focus";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
// A new Y document
const ydoc = new Y.Doc();

const SingleParagraphDocument = Document.extend({
  content: "paragraph",
});

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
    EditorContent,
    EditorMenu,
  },

  data() {
    return {
      backgroundColor: "",
      editable: false,
      language: "English",
      languages: ["English", "Nederlands"],
    };
  },

  watch: {
    editable() {
      this.editorStore.y.title.setEditable(this.editable);
      this.editorStore.y.description.setEditable(this.editable);
      this.editorStore.y.path.setEditable(this.editable);
      this.editorStore.y.content.setEditable(this.editable);
    },
  },
  mounted() {
    this.$nextTick(async () => {
      // this.editorStore.fetchFromServer();
      this.setUserColor();
      this.setupEditors();
      setTimeout(() => {
        this.editable = true;
      }, 1200);
    });
  },

  methods: {
    setupEditors() {
      this.editorStore.y.clientID = ydoc.clientID;
      // Registered with a WebRTC provider
      this.editorStore.y.provider = new WebrtcProvider(
        "activisthandbook-edit" + this.$route.params.articleID,
        ydoc
      );

      // this.editorStore.y.provider.on("peers", (event) => {
      //   this.editorStore.hasPeers = true;

      //   console.log("peers");
      //   const time = Date.now();
      //   this.editorStore.y.syncedData.set("lastPeerChangeTimestamp", time);
      // });

      const user = {
        firebaseID: this.firebaseStore.auth.currentUser.uid,
        name: this.firebaseStore.auth.currentUser.displayName,
        color: this.backgroundColor,
        avatar: this.firebaseStore.auth.currentUser.photoURL,
      };

      // this.editorStore.y.syncedData = ydoc.getMap("syncedData");

      // Observe the remote syncedData and update the local values every time they change
      // this.editorStore.y.syncedData.observe((ymapEvent) => {
      //   ymapEvent.changes.keys.forEach((change, key) => {
      //     if (change.action === "add" || change.action === "update") {
      //       this.editorStore.syncedData[key] =
      //         this.editorStore.y.syncedData.get(key);
      //     } else if (change.action === "delete") {
      //       this.editorStore.syncedData[key] = null;
      //     }
      //   });
      // });

      this.editorStore.y.title = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          // Collaboration.configure({
          //   document: ydoc,
          //   field: "title",
          // }),
          // CollaborationCursor.configure({
          //   provider: this.editorStore.y.provider,
          //   user,
          // }),
          Placeholder.configure({
            placeholder: "Title",
          }),
        ],
        onUpdate: () => {
          this.editorStore.y.titleRendered = true;
          this.editorStore.save();
        },
      });

      this.editorStore.y.description = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          // Collaboration.configure({
          //   document: ydoc,
          //   field: "description",
          // }),
          // CollaborationCursor.configure({
          //   provider: this.editorStore.y.provider,
          //   user,
          // }),
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: "Description",
          }),
        ],
        onUpdate: () => {
          this.editorStore.y.descriptionRendered = true;
          this.editorStore.save();
        },
      });

      this.editorStore.y.path = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          // Collaboration.configure({
          //   document: ydoc,
          //   field: "path",
          // }),
          // CollaborationCursor.configure({
          //   provider: this.editorStore.y.provider,
          //   user,
          // }),
        ],
        onUpdate: () => {
          this.editorStore.y.pathRendered = true;
          this.editorStore.save();
        },
      });

      let nthTime = 1;
      let lastContent = null;
      this.editorStore.y.content = new Editor({
        editable: this.editable,
        extensions: [
          StarterKit.configure({
            // The Collaboration extension comes with its own history handling
            // history: false,
          }),
          // Collaboration.configure({
          //   document: ydoc,
          //   field: "content",
          // }),
          // CollaborationCursor.configure({
          //   provider: this.editorStore.y.provider,
          //   user,
          // }),
          Link.configure({
            openOnClick: false,
            protocols: ["mailto"],
          }),
          Focus.configure({
            mode: "deepest",
          }),
          CharacterCount,
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: ({ node }) => {
              if (node.type.name === "heading") {
                return "Heading...";
              }

              return "Write something...";
            },
          }),
        ],
        onUpdate: () => {
          if (nthTime === 3 && this.editorStore.hasPeers) {
            lastContent = this.editorStore.y.content.getHTML();
            this.editorStore.y.content.commands.undo();
          } else if (nthTime === 4 && this.editorStore.hasPeers) {
            if (this.editorStore.y.content.getHTML() === "<p></p>") {
              if (lastContent !== "<p></p>") {
                this.editorStore.y.content.commands.insertContent(
                  lastContent,
                  true
                );
              }

              this.editorStore.y.content.commands.insertContent(
                lastContent,
                true
              );
            }
          }

          this.editorStore.y.contentRendered = true;
          this.editorStore.save();

          nthTime += 1;
        },
      });
    },
    setUserColor() {
      // https://quasar.dev/style/sass-scss-variables
      const colors = [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
        "#8bc34a",
        "#cddc39",
        "#ffeb3b",
        "#ffc107",
        "#ff9800",
        "#ff5722",
        "#795548",
      ];
      this.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    },
  },

  beforeUnmount() {
    this.editorStore.y.title.destroy();
    this.editorStore.y.description.destroy();
    this.editorStore.y.content.destroy();
    this.editorStore.y.path.destroy();
    this.editorStore.y.provider.destroy();
  },
};
</script>
<style lang="scss">
.is-active {
  background: $secondary;
  color: white;
}
.ProseMirror {
  outline: none;

  a {
    color: $secondary;
    text-decoration: none;
    border-bottom: 4px solid rgba($secondary, 0.2);

    &:hover {
      border-bottom-color: rgba($secondary, 0.5);
    }
  }
}
.content .ProseMirror {
  outline: none;
  min-height: 180px;
}

.title .ProseMirror,
.description .ProseMirror,
.path .ProseMirror {
  border: 1px solid $grey-5;
  line-height: 1;
  border-radius: 4px;
  padding: 12px 8px;
  transition: 0.2s border-color;

  &:hover {
    border-color: $grey-9;
  }
  &:focus {
    border-color: $secondary;
    border-width: 2px;
    margin: -1px;
  }

  p {
    margin: 0;
  }
}
.title {
  color: black;
}
.path {
  font-size: 0.8em;
  .ProseMirror {
    padding: 8px 8px;
    // border: 1px solid $grey-2;
    // background: $grey-2;

    &::before {
      content: "activisthandbook.org/en/";
      color: $grey-8;
    }
    * {
      display: inline;
    }
  }
}
// Placeholder
.ProseMirror .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: $grey;
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
  color: white;
  font-family: sans-serif;
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: bold;
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

.has-focus a {
  background: rgba($secondary, 0.1);
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

// Still loading
// .ProseMirror {
//   opacity: 0.6;
// }
// .editable .ProseMirror {
//   transition: 0.3s opacity;
//   opacity: 1;
// }
</style>
