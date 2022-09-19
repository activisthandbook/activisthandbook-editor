<template>
  <q-card
    v-if="editor && editor.tiptap.content"
    class="bg-grey-2 justify-center sticky"
    bordered
    flat
  >
    <div class="q-gutter-xs flex" style="padding: 12px">
      <div class="bg-grey-4 rounded-borders flex items-center q-pa-xs">
        <span class="text-caption text-bold q-ml-sm q-mr-sm text-black"
          >Heading</span
        >
        <!-- <q-icon
          name="mdi-format-size"
          color="grey"
          style="margin: 8px 4px 8px 10px"
          size="22px"
        /> -->
        <!-- <q-btn
          unelevated
          icon="mdi-text"
          padding="8px"
          :class="{
            'is-active': !editor.tiptap.content.isActive('heading'),
          }"
          @click="editor.tiptap.content.chain().focus().setParagraph().run()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Paragraph</q-tooltip
          >
        </q-btn> -->
        <!-- icon="mdi-numeric-1-box" -->
        <q-btn
          unelevated
          icon="mdi-numeric-1-box"
          flat
          dense
          :class="{
            'is-active': editor.tiptap.content.isActive('customHeading', {
              level: 2,
            }),
          }"
          @click="setHeading(2)"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Heading 1</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          dense
          icon="mdi-numeric-2-box"
          :class="{
            'is-active': editor.tiptap.content.isActive('customHeading', {
              level: 3,
            }),
          }"
          @click="setHeading(3)"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Heading 2</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          icon="mdi-numeric-3-box"
          dense
          :class="{
            'is-active': editor.tiptap.content.isActive('heading', {
              level: 4,
            }),
          }"
          @click="setHeading(4)"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Heading 3</q-tooltip
          >
        </q-btn>
      </div>

      <q-space />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-bold"
        @click="editor.tiptap.content.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('bold') }"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-italic"
        @click="editor.tiptap.content.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('italic') }"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-link"
        @click="openLinkDialog($event)"
        :class="{ 'is-active': editor.tiptap.content.isActive('link') }"
        class="hide-at-less-than-tiny"
      >
        <q-dialog v-model="linkDialog">
          <q-card style="min-width: 350px" class="bg-accent">
            <q-card-section>
              <div class="text-bold">Add link</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                dense
                v-model="currentLink"
                autofocus
                @keyup.enter="setLink(currentLink)"
                color="secondary"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                v-if="currentLink"
                flat
                label="Remove"
                v-close-popup
                color="secondary"
                no-caps
                @click="removeLink()"
              />
              <q-btn
                label="Add link"
                no-caps
                v-close-popup
                color="secondary"
                @click="setLink(currentLink)"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-btn>

      <q-space class="hide-at-less-than-small" />
      <q-separator vertical class="hide-at-less-than-small" />
      <q-space class="hide-at-less-than-small" />
      <q-btn
        padding="sm"
        flat
        icon="mdi-format-list-bulleted"
        @click="editor.tiptap.content.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('bulletList') }"
        class="hide-at-less-than-small"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-list-numbered"
        @click="editor.tiptap.content.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('orderedList') }"
        class="hide-at-less-than-small"
      />

      <q-space class="hide-at-less-than-small" />
      <q-separator vertical class="hide-at-less-than-small" />
      <q-space class="hide-at-less-than-small" />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-quote-open"
        @click="editor.tiptap.content.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('blockquote') }"
        class="hide-at-less-than-medium"
      />
      <q-btn
        padding="sm"
        flat
        icon="mdi-image"
        class="hide-at-less-than-medium"
        @click="imageDialogOpen = true"
        v-show="!editor.tiptap.content.isActive('imageWithCaption')"
      />
      <ImageSelector
        v-model="imageDialogOpen"
        @hide="imageDialogOpen = false"
      />

      <q-btn
        v-show="editor.tiptap.content.isActive('imageWithCaption')"
        padding="sm"
        flat
        icon="mdi-image-edit"
        class="hide-at-less-than-medium is-active"
        @click="imageCaptionDialogOpen = true"
      />
      <ImageCaptionEditor
        v-model="imageCaptionDialogOpen"
        @hide="imageCaptionDialogOpen = false"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-youtube"
        class="hide-at-less-than-medium"
        @click="openYoutubeDialog()"
        :class="{ 'is-active': editor.tiptap.content.isActive('youtube') }"
      />

      <q-dialog v-model="youtubeDialog">
        <q-card style="min-width: 350px" class="bg-accent">
          <q-card-section>
            <div class="text-bold">Add YouTube video</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              placeholder="https://www.youtube.com/..."
              dense
              v-model="videoLink"
              autofocus
              @keyup.enter="addYoutubeVideo()"
              color="secondary"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Add video"
              no-caps
              v-close-popup
              color="secondary"
              @click="addYoutubeVideo()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-btn padding="sm" flat icon="mdi-dots-horizontal">
        <q-menu
          :offset="[0, 4]"
          class="shadow-8 bg-accent"
          anchor="bottom right"
          self="top right"
        >
          <q-list style="min-width: 200px">
            <q-item
              clickable
              v-close-popup
              @click="openLinkDialog($event)"
              :class="{
                'is-active': editor.tiptap.content.isActive('link'),
              }"
              class="show-at-less-than-tiny"
            >
              <q-item-section>Link</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-link" />
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="
                editor.tiptap.content.chain().focus().toggleBulletList().run()
              "
              :class="{
                'is-active': editor.tiptap.content.isActive('bulletList'),
              }"
              class="show-at-less-than-small"
            >
              <q-item-section>Bullet points</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-format-list-bulleted" />
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="
                editor.tiptap.content.chain().focus().toggleOrderedList().run()
              "
              :class="{
                'is-active': editor.tiptap.content.isActive('orderedList'),
              }"
              class="show-at-less-than-small"
            >
              <q-item-section>Numbered list</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-format-list-numbered" />
              </q-item-section>
            </q-item>
            <q-separator class="show-at-less-than-medium" />
            <q-item
              clickable
              v-close-popup
              @click="
                editor.tiptap.content.chain().focus().toggleBlockquote().run()
              "
              :class="{
                'is-active': editor.tiptap.content.isActive('blockquote'),
              }"
              class="show-at-less-than-medium"
            >
              <q-item-section>Quote</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-format-quote-open" />
              </q-item-section>
            </q-item>

            <q-item
              v-show="!editor.tiptap.content.isActive('imageWithCaption')"
              clickable
              v-close-popup
              @click="imageDialogOpen = true"
              class="show-at-less-than-medium"
            >
              <q-item-section>Image</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-image" />
              </q-item-section>
            </q-item>
            <q-item
              v-show="editor.tiptap.content.isActive('imageWithCaption')"
              clickable
              v-close-popup
              class="is-active show-at-less-than-medium"
              @click="imageCaptionDialogOpen = true"
            >
              <q-item-section>Edit image</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-image-edit" />
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="openYoutubeDialog()"
              :class="{
                'is-active': editor.tiptap.content.isActive('youtube'),
              }"
              class="show-at-less-than-medium"
            >
              <q-item-section>YouTube video</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-youtube" />
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              :disable="editor.tiptap.content.isActive('table')"
              @click="
                editor.tiptap.content
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              "
            >
              <q-item-section>Table</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-table" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </q-card>
  <div
    v-if="
      editor && editor.tiptap.content && editor.tiptap.content.isActive('table')
    "
    class="justify-center sticky table-menu"
  >
    <div class="flex justify-center q-gutter-sm">
      <div class="bg-accent shadow-8 rounded-borders flex items-center q-pa-xs">
        <span class="text-caption text-bold q-ml-sm text-black">Column</span>
        <q-btn
          unelevated
          icon="mdi-table-column-plus-before"
          flat
          padding="sm"
          @click="editor.tiptap.content.chain().focus().addColumnBefore().run()"
          :disabled="!editor.tiptap.content.can().addColumnBefore()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Add column before</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          padding="sm"
          icon="mdi-close-box"
          @click="editor.tiptap.content.chain().focus().deleteColumn().run()"
          :disabled="!editor.tiptap.content.can().deleteColumn()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Remove column</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          icon="mdi-table-column-plus-after"
          padding="sm"
          @click="editor.tiptap.content.chain().focus().addColumnAfter().run()"
          :disabled="!editor.tiptap.content.can().addColumnAfter()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Add column after</q-tooltip
          >
        </q-btn>
      </div>

      <div class="bg-accent shadow-8 rounded-borders flex items-center q-pa-xs">
        <span class="text-caption text-bold q-ml-sm q-mr-sm text-black"
          >Row</span
        >
        <q-btn
          unelevated
          icon="mdi-table-row-plus-before"
          flat
          padding="sm"
          @click="editor.tiptap.content.chain().focus().addRowBefore().run()"
          :disabled="!editor.tiptap.content.can().addRowBefore()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Add column before</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          padding="sm"
          icon="mdi-close-box"
          @click="editor.tiptap.content.chain().focus().deleteRow().run()"
          :disabled="!editor.tiptap.content.can().deleteRow()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Remove column</q-tooltip
          >
        </q-btn>
        <q-btn
          flat
          icon="mdi-table-row-plus-after"
          padding="sm"
          @click="editor.tiptap.content.chain().focus().addRowAfter().run()"
          :disabled="!editor.tiptap.content.can().addRowAfter()"
        >
          <q-tooltip
            transition-show="none"
            transition-hide="none"
            class="bg-grey-9 text-white"
            :offset="[0, 4]"
            >Add column after</q-tooltip
          >
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";

import ImageSelector from "src/dialogs/ImageSelector.vue";
import ImageCaptionEditor from "src/dialogs/ImageCaptionEditor.vue";

import { useEditorStore } from "stores/editor";

export default defineComponent({
  components: {
    ImageSelector,
    ImageCaptionEditor,
  },
  setup() {
    const editor = useEditorStore();
    return {
      // you can return the whole editorStore instance to use it in the template
      editor,
    };
  },
  data() {
    return {
      // Link
      link: "",
      linkDialog: false,
      // video
      videoLink: "",
      youtubeDialog: false,

      // image
      imageDialogOpen: false,
      imageCaptionDialogOpen: false,

      title: "",
      currentLink: "",
      headingMenuOpen: false,
    };
  },
  methods: {
    setHeading(level) {
      console.log(level);
      this.editor.tiptap.content
        .chain()
        .focus()
        .toggleHeading({
          level: level,
          // id: this.mixin_randomID(),
        })
        .run();
    },
    setLink(link) {
      this.editor.tiptap.content
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: link })
        .run();
      this.linkDialog = false;
    },
    removeLink() {
      this.editor.tiptap.content.chain().focus().unsetLink().run();
    },
    openLinkDialog(event) {
      event.preventDefault();
      this.currentLink = this.editor.tiptap.content.getAttributes("link").href;
      this.linkDialog = true;
    },
    openYoutubeDialog(event) {
      // this.currentYoutubeLink = this.editor.tiptap.content.getAttributes("link").href;
      this.youtubeDialog = true;
    },
    addYoutubeVideo() {
      this.editor.tiptap.content.commands.setYoutubeVideo({
        src: this.videoLink,
        width: 100,
        height: 100,
      });
      this.youtubeDialog = false;
    },
  },
});
</script>
<style scoped lang="scss">
.sticky {
  position: sticky;
  top: 8px;
  z-index: 100;
}
.table-menu {
  top: 76px;
}
.is-active {
  background: $secondary;
  color: white;

  .q-item__section--side {
    color: white;
  }
}

.show-at-less-than-medium,
.show-at-less-than-small,
.show-at-less-than-tiny {
  display: none;
}
@media only screen and (max-width: 700px) {
  .hide-at-less-than-medium {
    display: none;
  }
  .show-at-less-than-medium {
    display: flex;
  }
}
@media only screen and (max-width: 560px) {
  .hide-at-less-than-small {
    display: none;
  }
  .show-at-less-than-small {
    display: flex;
  }
}
@media only screen and (max-width: 410px) {
  .hide-at-less-than-tiny {
    display: none;
  }
  .show-at-less-than-tiny {
    display: flex;
  }
}
</style>
