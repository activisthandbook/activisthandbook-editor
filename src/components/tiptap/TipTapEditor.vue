<template>
  <q-card v-if="editorStore.article.wordCount > 5000" class="bg-warning" flat>
    <q-card-section>
      <strong>This article is too long!</strong> Try to stay under 5.000 words
      to keep articles readable. Articles with more than 10.000 words may not be
      included in our our search index.
    </q-card-section>
  </q-card>
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

  <MenuBar />

  <editor-content :editor="editorStore.tiptap.content" class="article" />

  <q-card class="q-mt-xl bg-grey-2" flat bordered>
    <q-card-section>
      <div class="q-gutter-y-sm">
        <div class="text-bold">Article details</div>
        <q-select
          label="Search tags"
          v-model="editorStore.article.tags"
          use-input
          use-chips
          outlined
          multiple
          hide-dropdown-icon
          input-debounce="0"
          new-value-mode="add-unique"
          color="secondary"
          @update:model-value="editorStore.renderAndSave()"
        />
      </div>
    </q-card-section>
    <q-list class="q-pb-md">
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-star-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption> Created </q-item-label>
          <q-item-label>
            {{ mixin_humanDate(editorStore.article.createdServerTimestamp) }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-file-document-edit-outline" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption> Last edited </q-item-label>
          <q-item-label>
            {{
              mixin_humanDate(editorStore.article.lastUpdatedServerTimestamp)
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="mdi-check" />
        </q-item-section>
        <q-item-section>
          <q-item-label caption> Last published </q-item-label>
          <q-item-label>
            {{
              mixin_humanDate(editorStore.article.lastPublishedServerTimestamp)
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>

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
import MenuBar from "src/components/MenuBar.vue";
import LanguageSelector from "components/LanguageSelector.vue";

import { mapStores } from "pinia";
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";
import { useLanguagesStore } from "stores/languages";

import _ from "lodash";

import { Editor, EditorContent } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Text from "@tiptap/extension-text";

// import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";

import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import CodeBlock from "@tiptap/extension-code-block";
import HardBreak from "@tiptap/extension-hard-break";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";

import Youtube from "@tiptap/extension-youtube";
import Focus from "@tiptap/extension-focus";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

// Table
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

import { ImageWithCaption } from "./ImageWithCaption";
const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
      id: {
        default: null,
        // rendered: false,
        // parseHTML: (element) =>
        //   element.querySelector("img")?.getAttribute("imageID"),
      },
    };
  },
});

const SingleParagraphDocument = Document.extend({
  content: "paragraph",
});

export default {
  components: {
    EditorContent,
    MenuBar,
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
      (toParams, previousParams) => {
        if (!previousParams || toParams.articleID !== previousParams.articleID)
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
          History,
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
          History,
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
          History,
          Document,
          Text,
          Paragraph,
          Blockquote,
          BulletList,
          CodeBlock,
          HardBreak,
          HorizontalRule,
          ListItem,
          OrderedList,
          CustomHeading,
          Link.configure({
            openOnClick: false,
            protocols: ["mailto"],
          }),
          Image,
          ImageWithCaption,
          Youtube.configure({
            nocookie: true,
          }),
          Table,
          TableRow,
          TableHeader,
          // Default TableCell
          // TableCell,
          // Custom TableCell with backgroundColor attribute
          TableCell,

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
        onUpdate: async () => {
          // await this.updateHeadings();
          // await this.updateImages();
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
.ProseMirror {
  outline: none;
}
.article .ProseMirror {
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
  font-size: calc(24px + 2vw);
}
.description {
  font-size: calc(14px + 0.5vw);
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
.ProseMirror img,
.ProseMirror div[data-youtube-video] {
  outline-offset: 2px;

  // &.ProseMirror-focussed {
  //   outline: 4px solid rgba($secondary, 0.6);
  //   animation: focusVideo 0.6s infinite alternate;
  // }
}
figure,
.ProseMirror div[data-youtube-video] {
  cursor: move;
  border-radius: 2px;
}
.ProseMirror div[data-youtube-video]:hover,
figure:hover {
  outline: 4px solid rgba($secondary, 0.2);
}

figure.has-focus,
div[data-youtube-video].ProseMirror-selectednode {
  //   outline: 4px solid rgba($secondary, 0.6);
  //   animation: focusVideo 0.6s infinite alternate;
  // } {
  outline: 4px solid rgba($secondary, 0.6);
  animation: focusVideo 0.6s infinite alternate;
}

@keyframes focusVideo {
  from {
    outline: 4px solid rgba($secondary, 0.4);
  }
  to {
    outline: 4px solid rgba($secondary, 0.7);
  }
}

/* Table-specific styling */
.ProseMirror {
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;
    border-radius: 2px;

    td,
    th {
      min-width: 1em;
      border: 2px solid $grey-4;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: $grey-3;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba($secondary, 0.3);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    p {
      margin: 0;
    }
  }
}

.tableWrapper {
  overflow-x: auto;
}

.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}
</style>
