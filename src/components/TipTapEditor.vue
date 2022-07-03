<template>
  <editor-content :editor="editorStore.title" class="text-h1 title" />
  <editor-content :editor="editorStore.description" class="description" />
  <editor-content :editor="editorStore.path" class="path text-caption" />

  <EditorMenu />
  <editor-content :editor="editorStore.content" class="content" />
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
    v-if="editorStore && editorStore.content"
  >
    <!-- {{ editorStore.content.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
    <q-chip color="grey-3" text-color="grey-8">
      <span class="q-gutter-x-xs items-center flex">
        <q-icon name="mdi-circle" color="teal" style="margin-left: -1px" />
        <strong>
          {{
            editorStore.content.storage.collaborationCursor.users.length
          }}</strong
        >
        <span>online</span>
      </span>
    </q-chip>
  </q-page-sticky>
  <q-page-sticky
    position="bottom"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.content"
  >
    <!-- {{ editorStore.content.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
    <q-chip square color="grey-3" text-color="grey-8">
      <span class="q-gutter-x-xs">
        <strong>
          {{ editorStore.content.storage.characterCount.words() }}</strong
        >
        <span>words</span>
      </span>
    </q-chip>
  </q-page-sticky>
</template>

<script>
import EditorMenu from "components/EditorMenu.vue";

import { getCssVar } from "quasar";

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
      // provider: useEditorStore(),
      link: "",
      linkDialog: false,
      title: "",
      description: "",
      currentLink: "",
      backgroundColor: "",
      textColor: "",
      syncData: null,
    };
  },

  watch: {
    modelValue: {
      handler(value) {
        // console.log("modelValue watcher triggered");
        if (
          this.editorStore.title.getHTML() === value.title ||
          this.editorStore.description.getHTML() === value.description ||
          this.editorStore.content.getHTML() === value.content
        ) {
          return;
        } else {
          this.editorStore.title.commands.setContent(value.title, false);
          this.editorStore.description.commands.setContent(
            value.description,
            false
          );
          this.editorStore.content.commands.setContent(value.content, false);
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.setUserColor();
      this.setupEditors();
    });
  },

  methods: {
    test() {
      this.editorStore.syncData.set("test", Math.random());
      console.log(this.editorStore.syncData.get("test"));
    },
    setupEditors() {
      console.log("setting up editors");

      this.editorStore.clientID = ydoc.clientID;
      // Registered with a WebRTC provider
      this.editorStore.provider = new WebrtcProvider(
        "activisthandbook-edit",
        ydoc
      );

      const user = {
        firebaseID: this.firebaseStore.auth.currentUser.uid,
        name: this.firebaseStore.auth.currentUser.displayName,
        color: this.backgroundColor,
        avatar: this.firebaseStore.auth.currentUser.photoURL,
      };

      // Method 1: Define a top-level type
      this.editorStore.syncData = ydoc.getMap("syncData");

      this.editorStore.title = new Editor({
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "title",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.provider,
            user,
          }),
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: "Title",
          }),
        ],
        onUpdate: () => {
          // console.log("emitting title update");
          // HTML
          this.editorStore.titleRendered = true;
          this.$emit("update:modelValue", {
            title: this.editorStore.title.getHTML(),
            description: this.editorStore.description.getHTML(),
            content: this.editorStore.content.getHTML(),
          });
          // JSON
          // this.$emit("update:modelValue", this.editor.getJSON());
        },
      });

      this.editorStore.description = new Editor({
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "description",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.provider,
            user,
          }),
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: "Description",
          }),
        ],
        onUpdate: () => {
          // console.log("emitting description update");
          this.editorStore.descriptionRendered = true;
          // HTML
          this.$emit("update:modelValue", {
            title: this.editorStore.title.getHTML(),
            description: this.editorStore.description.getHTML(),
            content: this.editorStore.content.getHTML(),
          });
          // JSON
          // this.$emit("update:modelValue", this.editor.getJSON());
        },
      });

      this.editorStore.path = new Editor({
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Collaboration.configure({
            document: ydoc,
            field: "path",
          }),
          CollaborationCursor.configure({
            provider: this.editorStore.provider,
            user,
          }),
          // Placeholder.configure({
          //   // Use a placeholder:
          //   // Use different placeholders depending on the node type:
          //   placeholder: "Path",
          // }),
        ],
        onUpdate: () => {
          // console.log("emitting description update");
          this.editorStore.descriptionRendered = true;
          // HTML
          this.$emit("update:modelValue", {
            title: this.editorStore.title.getHTML(),
            description: this.editorStore.description.getHTML(),
            content: this.editorStore.content.getHTML(),
          });
          // JSON
          // this.$emit("update:modelValue", this.editor.getJSON());
        },
      });

      this.editorStore.content = new Editor({
        // content: "<p>I’m running Tiptap with Vue.js. 🎉</p>",
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
            provider: this.editorStore.provider,
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
          this.editorStore.contentRendered = true;
          // console.log("emitting content update");
          // HTML
          this.$emit("update:modelValue", {
            title: this.editorStore.title.getHTML(),
            description: this.editorStore.description.getHTML(),
            content: this.editorStore.content.getHTML(),
          });
          // JSON
          // this.$emit("update:modelValue", this.editor.getJSON());
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
    this.editorStore.title.destroy();
    this.editorStore.description.destroy();
    this.editorStore.content.destroy();
    this.editorStore.provider.destroy();
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
  font-size: 2m;
}
.description {
  font-size: 1.2em;
  font-style: italic;
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
</style>
