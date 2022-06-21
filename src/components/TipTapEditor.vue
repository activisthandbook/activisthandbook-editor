<template>
  <editor-content :editor="editorStore.editor" />

  <div
    class="text-center generator"
    v-if="
      editorStore &&
      editorStore.editor &&
      editorStore.editor.storage.characterCount.words() < 60
    "
    :class="{
      'less-visible': editorStore.editor.storage.characterCount.words() > 30,
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
  </div>
  <q-page-sticky
    position="bottom-right"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.editor"
  >
    <!-- {{ editorStore.editor.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
    <q-chip>
      <span class="q-gutter-x-xs items-center flex">
        <q-icon name="mdi-circle" color="green" style="margin-left: -1px" />
        <strong>
          {{
            editorStore.editor.storage.collaborationCursor.users.length
          }}</strong
        >
        <span>online</span>
      </span>
    </q-chip>
  </q-page-sticky>
  <q-page-sticky
    position="bottom"
    :offset="[8, 8]"
    v-if="editorStore && editorStore.editor"
  >
    <!-- {{ editorStore.editor.storage.collaborationCursor.users }} -->
    <!-- <q-chip v-if="!saved">Saving...</q-chip> -->
    <q-chip square>
      <span class="q-gutter-x-xs">
        <strong>
          {{ editorStore.editor.storage.characterCount.words() }}</strong
        >
        <span>words</span>
      </span>
    </q-chip>
  </q-page-sticky>
</template>

<script>
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import _ from "lodash";

import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

export default {
  props: {
    modelValue: {
      type: String,
      default: "",
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
  },

  data() {
    return {
      // provider: useEditorStore(),
      provider: null,
      link: "",
      linkDialog: false,
      title: "",
      description: "",
      currentLink: "",
      backgroundColor: "",
      textColor: "",
    };
  },

  watch: {
    modelValue(value) {
      // HTML
      const isSame = this.editorStore.editor.getHTML() === value;

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return;
      }

      this.editorStore.editor.commands.setContent(value, false);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.setUserColor();

      // A new Y document
      const ydoc = new Y.Doc();

      this.editorStore.clientID = ydoc.clientID;
      // Registered with a WebRTC provider
      this.provider = new WebrtcProvider("activisthandbook-edit", ydoc);

      this.editorStore.editor = new Editor({
        // content: "<p>I’m running Tiptap with Vue.js. 🎉</p>",
        extensions: [
          StarterKit.configure({
            // The Collaboration extension comes with its own history handling
            history: false,
          }),
          Collaboration.configure({
            document: ydoc,
          }),
          CollaborationCursor.configure({
            provider: this.provider,
            user: {
              firebaseID: this.firebaseStore.auth.currentUser.uid,
              name: this.firebaseStore.auth.currentUser.displayName,
              color: this.backgroundColor,
              avatar: this.firebaseStore.auth.currentUser.photoURL,
            },
          }),
          Link.configure({
            openOnClick: false,
            protocols: ["mailto"],
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
          // HTML
          this.$emit("update:modelValue", this.editorStore.editor.getHTML());
          // JSON
          // this.$emit("update:modelValue", this.editor.getJSON());
        },
      });
    });
  },

  beforeUnmount() {
    this.editorStore.editor.destroy();
    this.provider.destroy();
  },

  methods: {
    setUserColor() {
      // ** Colour Contrast Calculator ** //
      // ** https://www.w3.org/TR/AERT#color-contrast ** //
      // ** ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000 ** //

      for (var i = 0; i < 100; i++) {
        // Generate random RGB values
        let color = "#";
        for (let i = 0; i < 3; i++)
          color += (
            "0" +
            Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
          ).slice(-2);
        this.backgroundColor = color;
      }
    },
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
