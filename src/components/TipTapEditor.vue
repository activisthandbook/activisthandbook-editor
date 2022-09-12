<template>
  <editor-content :editor="editorStore.tiptap.title" class="title" />
  <editor-content
    :editor="editorStore.tiptap.description"
    class="description"
  />

  <LanguageSelector
    v-model="editorStore.article.lang"
    :options="editorStore.local.languageCollection"
    :languageCollectionID="editorStore.article.languageCollectionID"
  />

  <q-input
    dense
    v-model="editorStore.article.path"
    outlined
    color="secondary"
    placeholder="my-path"
    @update:model-value="editorStore.renderAndSave()"
  >
    <template v-slot:prepend>
      <q-icon name="mdi-link" />
      <span class="text-caption text-grey-9 text-bold q-ml-sm">
        activisthandbook.org/<span v-if="editorStore.article.lang"
          >{{ editorStore.article.lang.code }}/</span
        >
      </span>
    </template>
  </q-input>

  <!-- <editor-content
    :editor="editorStore.tiptap.path"
    class="path text-caption"
    :data-prepend="'activisthandbook.org/' + editorStore.article.langCode + '/'"
  /> -->

  <EditorMenu />

  <editor-content :editor="editorStore.tiptap.content" class="article" />

  <!-- 👉 TO-DO: Tags -->

  <q-page-sticky
    position="bottom-left"
    :offset="[12, 12]"
    v-if="editorStore && editorStore.tiptap.content"
    style="z-index: 1"
  >
    <q-chip
      square
      color="grey-3"
      text-color="grey-9"
      @click="showReadingTime = !showReadingTime"
      clickable
      class="shadow-0"
    >
      <span class="q-gutter-x-xs" v-if="!showReadingTime">
        <strong>
          {{
            editorStore.tiptap.content.storage.characterCount.words()
          }}</strong
        >
        <span>words</span>
      </span>
      <span class="q-gutter-x-xs" v-else>
        <strong> {{ readingTime }}</strong>
        <span>minutes</span>
      </span>
      <q-separator vertical class="q-mx-sm" />
      <span v-if="unsaved">
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
import LanguageSelector from "components/LanguageSelector.vue";

import { mapStores } from "pinia";
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";
import { useLanguagesStore } from "stores/languages";

import _ from "lodash";

import { Editor, EditorContent } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";

import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Focus from "@tiptap/extension-focus";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

const SingleParagraphDocument = Document.extend({
  content: "paragraph",
});

export default {
  components: {
    EditorContent,
    EditorMenu,
    LanguageSelector,
  },

  data() {
    return {
      editorsInitialised: false,
      showReadingTime: false,
      backgroundColor: "",
      language: "English",
      languages: ["English", "Nederlands"],
    };
  },
  computed: {
    ...mapStores(useLanguagesStore, useEditorStore, useFirebaseStore),
    unsaved: function () {
      if (
        this.editorStore.local.lastEditTimestamp >
        this.editorStore.local.lastSaveTimestamp
      )
        return true;
      else return false;
    },
    readingTime: function () {
      return Math.round(
        this.editorStore.tiptap.content.storage.characterCount.words() / 250
      );
    },
  },

  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.setupEditors();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },

  mounted() {
    this.$nextTick(async () => {
      window.addEventListener("beforeunload", (e) => {
        if (this.unsaved) {
          const confirmationMessage =
            "It looks like you have been editing something. " +
            "If you leave before saving, your changes will be lost.";
          (e || window.event).returnValue = confirmationMessage; //Gecko + IE
          return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
        } else {
          return undefined;
        }
      });
    });
  },

  methods: {
    setupEditors() {
      let titleInitialised = false;
      this.editorStore.tiptap.title = new Editor({
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Placeholder.configure({
            placeholder: "Title",
          }),
        ],
        onUpdate: () => {
          if (!titleInitialised) {
            titleInitialised = true;
          } else {
            this.editorStore.renderAndSave();
          }
        },
      });

      let descriptionInitialised = false;
      this.editorStore.tiptap.description = new Editor({
        extensions: [
          SingleParagraphDocument,
          Paragraph,
          Text,
          Placeholder.configure({
            // Use a placeholder:
            // Use different placeholders depending on the node type:
            placeholder: "Description",
          }),
        ],
        onUpdate: () => {
          if (!descriptionInitialised) {
            descriptionInitialised = true;
          } else {
            this.editorStore.renderAndSave();
          }
        },
      });

      let pathInitialised = false;
      this.editorStore.tiptap.path = new Editor({
        extensions: [SingleParagraphDocument, Paragraph, Text],
        onUpdate: () => {
          if (!pathInitialised) {
            pathInitialised = true;
          } else {
            this.editorStore.renderAndSave();
          }
        },
      });

      let contentInitialised = false;
      this.editorStore.tiptap.content = new Editor({
        extensions: [
          StarterKit,
          Link.configure({
            openOnClick: false,
            protocols: ["mailto"],
          }),
          Image,
          Youtube.configure({
            nocookie: true,
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
          if (!contentInitialised) {
            contentInitialised = true;
          } else {
            this.editorStore.renderAndSave();
          }
        },
      });
    },
  },

  // beforeUnmount() {
  //   this.editorStore.tiptap.title.destroy();
  //   this.editorStore.tiptap.description.destroy();
  //   this.editorStore.tiptap.content.destroy();
  //   this.editorStore.tiptap.path.destroy();
  // },
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
  min-height: 128px;
}

.title .ProseMirror,
.description .ProseMirror {
  border: 1px solid $grey-5;
  line-height: 1;
  border-radius: 4px;
  padding: 16px;
  transition: 0.3s border-color;
  font-family: $font-secondary;
  font-weight: 700;

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
  font-size: 64px;
}
.description {
  font-size: 24px;
}

.path {
  font-size: 0.8em;
  .ProseMirror {
    padding: 8px 8px;
    // border: 1px solid $grey-2;
    // background: $grey-2;

    &::before {
      content: attr(data-prepend);
      color: $grey-8;
    }
    * {
      display: inline;
    }
  }
}
// Placeholder
// .ProseMirror .is-empty::before {
//   content: attr(data-placeholder);
//   float: left;
//   color: $grey;
//   pointer-events: none;
//   height: 0;
// }

.ProseMirror .is-empty:first-child:before {
  content: attr(data-placeholder);
  float: left;
  color: $grey-9;
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

// EMBED
img,
div[data-youtube-video] {
  outline-offset: 2px;
  cursor: move;

  &:hover {
    outline: 4px solid rgba($secondary, 0.2);
  }

  &.ProseMirror-selectednode {
    outline: 4px solid rgba($secondary, 0.6);
    animation: focusVideo 0.6s infinite alternate;
  }
}

@keyframes focusVideo {
  from {
    outline: 4px solid rgba($secondary, 0.4);
  }
  to {
    outline: 4px solid rgba($secondary, 0.7);
  }
}
</style>
