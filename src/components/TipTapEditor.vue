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
  <!-- <editor-content :editor="editorStore.content" /> -->

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
  <q-page-sticky
    position="bottom-right"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.y.content"
  >
    <!-- {{ editorStore.content.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
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
  </q-page-sticky>
  <q-page-sticky
    position="bottom"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.y.content"
  >
    <!-- {{ editorStore.content.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
    <q-chip square color="grey-3" text-color="grey-9">
      <span class="q-gutter-x-xs">
        <strong>
          {{ editorStore.y.content.storage.characterCount.words() }}</strong
        >
        <span>words</span>
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
  props: {
    modelValue: {
      default: { title: "", description: "", content: "" },
    },
  },

  emits: ["update:modelValue"],
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
      link: "",
      linkDialog: false,
      title: "",
      description: "",
      currentLink: "",
      backgroundColor: "",
      textColor: "",
      syncedData: null,
      editable: false,
    };
  },

  watch: {
    modelValue: {
      handler(value) {
        // console.log("modelValue watcher triggered");
        if (
          this.editorStore.y.title.getHTML() === value.title ||
          this.editorStore.y.description.getHTML() === value.description ||
          this.editorStore.y.content.getHTML() === value.content ||
          this.editorStore.y.path.getHTML() === value.path
        ) {
          return;
        } else {
          this.editorStore.y.title.commands.setContent(value.title, false);
          this.editorStore.y.description.commands.setContent(
            value.description,
            false
          );
          this.editorStore.y.content.commands.setContent(value.content, false);
          this.editorStore.y.path.commands.setContent(value.path, false);
        }
      },
      deep: true,
    },
    editable() {
      this.editorStore.y.title.setEditable(this.editable);
      this.editorStore.y.description.setEditable(this.editable);
      this.editorStore.y.path.setEditable(this.editable);
      this.editorStore.y.content.setEditable(this.editable);
    },
  },
  mounted() {
    this.$nextTick(async () => {
      this.editorStore.fetchFromServer();
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
        "activisthandbook-edit",
        ydoc
      );

      this.editorStore.y.provider.on("peers", (event) => {
        this.editorStore.hasPeers = true;

        console.log("peers");
        const time = Date.now();
        this.editorStore.y.syncedData.set("lastPeerChangeTimestamp", time);
      });

      const user = {
        firebaseID: this.firebaseStore.auth.currentUser.uid,
        name: this.firebaseStore.auth.currentUser.displayName,
        color: this.backgroundColor,
        avatar: this.firebaseStore.auth.currentUser.photoURL,
      };

      this.editorStore.y.syncedData = ydoc.getMap("syncedData");

      // Observe the remote syncedData and update the local values every time they change
      this.editorStore.y.syncedData.observe((ymapEvent) => {
        ymapEvent.changes.keys.forEach((change, key) => {
          if (change.action === "add" || change.action === "update") {
            this.editorStore.syncedData[key] =
              this.editorStore.y.syncedData.get(key);
          } else if (change.action === "delete") {
            this.editorStore.syncedData[key] = null;
          }
        });
      });

      this.editorStore.y.title = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "title",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.y.provider,
            user,
          }),
          Placeholder.configure({
            placeholder: "Title",
          }),
        ],
        onUpdate: () => {
          this.editorStore.y.titleRendered = true;
          this.emitChanges();
        },
      });

      this.editorStore.y.description = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "description",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.y.provider,
            user,
          }),
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: "Description",
          }),
        ],
        onUpdate: () => {
          this.editorStore.y.descriptionRendered = true;
          this.emitChanges();
        },
      });

      this.editorStore.y.path = new Editor({
        editable: this.editable,
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "path",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.y.provider,
            user,
          }),
        ],
        onUpdate: () => {
          this.editorStore.y.pathRendered = true;
          this.emitChanges();
        },
      });

      let nthTime = 1;
      let lastContent = null;
      this.editorStore.y.content = new Editor({
        editable: this.editable,
        extensions: [
          StarterKit.configure({
            // The Collaboration extension comes with its own history handling
            history: false,
          }),
          Collaboration.configure({
            document: ydoc,
            field: "content",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.y.provider,
            user,
          }),
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
          // console.log(nthTime, this.editorStore.y.content.getHTML());
          // console.log("onUpdate content", this.editorStore.y.content.getHTML());
          // console.log(nthTime, this.editorStore.hasPeers);
          if (nthTime === 3 && this.editorStore.hasPeers) {
            // console.log("Trying undo...");
            // console.log(
            //   "onUpdate content 1",
            //   this.editorStore.y.content.getHTML()
            // );
            // this.editorStore.y.content.commands.undo();
            // console.log("real 1", this.editorStore.y.content.getHTML());
            lastContent = this.editorStore.y.content.getHTML();
            this.editorStore.y.content.commands.undo();
            // console.log("real 2", this.editorStore.y.content.getHTML());
            // if (tryoutUndo.getHTML() !== "<p></p>") {
            //   console.log("Undo!");
            //   this.editorStore.y.content.commands.undo();
            // } else {
            //   console.log("Nevermind!");
            // }
          } else if (nthTime === 4 && this.editorStore.hasPeers) {
            // console.log("real 3", this.editorStore.y.content.getHTML());
            if (this.editorStore.y.content.getHTML() === "<p></p>") {
              // console.log("Redo!");

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
              // this.editorStore.y.content.commands.redo();
            }
          }

          this.editorStore.y.contentRendered = true;
          this.emitChanges();
          //           if 2nd && peers has happened

          // then clear everything before saving peer data
          // or undo last edit editor.commands.undo()
          // console.log(nthTime, "b", this.editorStore.y.content.getHTML());
          nthTime += 1;
        },
      });
    },
    emitChanges() {
      const newArticle = {
        title: this.editorStore.y.title.getHTML().slice(3, -4),
        description: this.editorStore.y.description.getHTML().slice(3, -4),
        content: this.editorStore.y.content.getHTML(),
        path: this.editorStore.y.path.getHTML().slice(3, -4),
      };
      this.$emit("update:modelValue", newArticle);
      this.editorStore.article = newArticle;
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
    border: 1px solid $grey-3;
    background: $grey-3;

    &::before {
      content: "activisthandbook.org/";
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
.ProseMirror {
  opacity: 0.6;
}
.editable .ProseMirror {
  transition: 0.3s opacity;
  opacity: 1;
}
</style>
