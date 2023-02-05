<template>
  <q-card
    v-if="editor && editor.tiptap.content"
    class="bg-accent justify-center sticky"
    flat
    bordered
  >
    <div class="q-gutter-x-xs flex" style="padding: 12px">
      <!-- HEADINGS -->
      <div class="bg-grey-3 rounded-borders flex items-center q-pa-xs">
        <span class="text-caption text-bold q-ml-sm q-mr-sm text-black"
          >Heading</span
        >
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

      <!-- BOLD, ITALIC, LINK -->
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
        @click="editor.openLinkDialog($event)"
        :class="{ 'is-active': editor.tiptap.content.isActive('link') }"
        class="hide-at-less-than-tiny"
      >
        <q-dialog v-model="this.editor.ui.linkDialog.open">
          <q-card style="min-width: 350px" class="bg-accent">
            <q-card-section>
              <div class="text-bold">Add link</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                dense
                v-model="editor.ui.linkDialog.currentLink"
                autofocus
                @keyup.enter="setLink(editor.ui.linkDialog.currentLink)"
                color="secondary"
                placeholder="/path/to/page"
              />
              <q-btn
                v-if="editor.ui.linkDialog.currentLink"
                flat
                label="Remove link"
                icon="mdi-link-off"
                v-close-popup
                dense
                color="secondary"
                class="q-mt-md"
                no-caps
                @click="removeLink()"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancel"
                v-close-popup
                color="secondary"
                no-caps
              />
              <q-btn
                v-if="editor.ui.linkDialog.currentLink"
                label="Update link"
                no-caps
                v-close-popup
                color="secondary"
                @click="setLink(editor.ui.linkDialog.currentLink)"
              />
              <q-btn
                v-else
                label="Add link"
                no-caps
                v-close-popup
                color="secondary"
                @click="setLink(editor.ui.linkDialog.currentLink)"
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

      <!-- 📱 OVERFLOW MENU -->
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

            <q-item clickable v-close-popup @click="actionDialogOpen = true">
              <q-item-section>Call to action</q-item-section>
              <q-item-section side>
                <q-icon name="mdi-alert-decagram" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </q-card>

  <q-footer
    class="bg-accent text-black rounded-borders shadow-5"
    v-if="editor?.tiptap?.content.isActive('link')"
  >
    <q-btn-group unelevated class="bg-secondary rounded-borders">
      <q-btn
        label="Open link"
        no-caps
        icon="mdi-open-in-new"
        padding="9.5px 12px"
        color="secondary"
        size="12px"
        @click="openLink()"
      />
      <q-separator vertical dark />
      <q-btn
        label="Edit"
        no-caps
        icon="mdi-pencil"
        padding="9.5px 12px"
        size="12px"
        color="secondary"
        @click="editor.openLinkDialog()"
      />
      <q-separator vertical dark />
      <q-btn
        label="Remove"
        no-caps
        icon="mdi-link-off"
        padding="9.5px 12px"
        size="12px"
        color="secondary"
        @click="removeLink()"
      />
    </q-btn-group>
  </q-footer>

  <q-footer
    class="bg-secondary rounded-borders shadow-5"
    v-if="editor?.tiptap?.content.isActive('table')"
    dark
  >
    <q-btn-group unelevated class="flex items-center">
      <span class="text-caption text-bold q-ml-md q-mr-xs">Column</span>
      <q-btn
        unelevated
        icon="mdi-table-column-plus-before"
        flat
        padding="8px 6px"
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
        padding="8px 6px"
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
        padding="8px 6px"
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
      <q-separator vertical class="q-ml-xs q-mr-md" dark />
      <span class="text-caption text-bold q-mr-xs">Row</span>
      <q-btn
        unelevated
        icon="mdi-table-row-plus-before"
        flat
        padding="8px 6px"
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
        padding="8px 6px"
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
        padding="8px 6px"
        @click="editor.tiptap.content.chain().focus().addRowAfter().run()"
        :disabled="!editor.tiptap.content.can().addRowAfter()"
        class="q-mr-xs"
      >
        <q-tooltip
          transition-show="none"
          transition-hide="none"
          class="bg-grey-9 text-white"
          :offset="[0, 4]"
          >Add column after</q-tooltip
        >
      </q-btn>
    </q-btn-group>
  </q-footer>

  <!-- DIALOGS -->
  <ImageSelector v-model="imageDialogOpen" @hide="imageDialogOpen = false" />
  <ActionDialog v-model="actionDialogOpen" @hide="actionDialogOpen = false" />
</template>
<script>
import { defineComponent } from "vue";

import ImageSelector from "src/dialogs/ImageSelector.vue";
import ActionDialog from "src/dialogs/ActionDialog.vue";

import { useEditorStore } from "stores/editor";

export default defineComponent({
  components: {
    ImageSelector,
    ActionDialog,
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

      // Action
      actionDialogOpen: false,

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
      let finalLink = null;
      let url = null;

      if (link.startsWith("https://www.activisthandbook.org/")) {
        finalLink = link.slice(32);
      } else if (link.startsWith("https://activisthandbook.org/")) {
        finalLink = link.slice(28);
      } else if (link.startsWith("https://") || link.startsWith("http://")) {
        try {
          url = new URL(link);
          url.searchParams.set("utm_source", "activisthandbook.org");
          finalLink = url.href;
        } catch {
          this.$q.notify("Invalid URL");
          finalLink = link;
        }
      } else {
        finalLink = link;
      }

      this.editor.tiptap.content
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalLink })
        .run();
      this.editor.ui.linkDialog.open = false;
    },
    removeLink() {
      this.editor.tiptap.content.chain().focus().unsetLink().run();
    },
    openLink() {
      const link = this.editor.tiptap.content.getAttributes("link").href;
      if (link.startsWith("http") || link.startsWith("mailto:")) {
        window.open(link);
      } else {
        window.open("https://activisthandbook.org" + link);
      }
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
.q-footer {
  right: auto;
  margin: 8px 10px;
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
