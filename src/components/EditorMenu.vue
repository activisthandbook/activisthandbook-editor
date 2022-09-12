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
            'is-active': editor.tiptap.content.isActive('heading', {
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
            'is-active': editor.tiptap.content.isActive('heading', {
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

      <q-space class="gt-xs" />
      <q-separator vertical class="gt-xs" />
      <q-space class="gt-xs" />
      <q-btn
        padding="sm"
        flat
        icon="mdi-format-list-bulleted"
        @click="editor.tiptap.content.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('bulletList') }"
        class="gt-xs"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-list-numbered"
        @click="editor.tiptap.content.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('orderedList') }"
        class="gt-xs"
      />

      <q-space class="gt-xs" />
      <q-separator vertical class="gt-xs" />
      <q-space class="gt-xs" />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-quote-open"
        @click="editor.tiptap.content.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.tiptap.content.isActive('blockquote') }"
        class="gt-sm"
      />
      <q-btn
        padding="sm"
        flat
        icon="mdi-image"
        class="gt-sm"
        @click="imageDialogOpen = true"
        :class="{ 'is-active': editor.tiptap.content.isActive('image') }"
      />
      <ImageSelector v-model="imageDialogOpen" />

      <q-btn
        padding="sm"
        flat
        icon="mdi-youtube"
        class="gt-sm"
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

      <q-btn
        padding="sm"
        flat
        icon="mdi-dots-horizontal"
        class="lt-md q-ml-md"
      />
    </div>
  </q-card>
</template>
<script>
import { defineComponent } from "vue";

import ImageSelector from "src/dialogs/ImageSelector.vue";

import { useEditorStore } from "stores/editor";

export default defineComponent({
  components: {
    ImageSelector,
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

      title: "",
      currentLink: "",
      headingMenuOpen: false,
    };
  },
  methods: {
    setHeading(level) {
      return this.editor.tiptap.content.commands.toggleHeading({
        level: level,
      });
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
<style scoped>
.sticky {
  position: sticky;
  top: 8px;
  z-index: 1;
}
</style>
