<template>
  <q-card
    v-if="editor"
    class="bg-white text-black justify-center sticky"
    style="border-bottom: 1px solid rgba(0, 0, 0, 0.1)"
  >
    <div class="q-gutter-xs flex q-pa-md">
      <q-btn
        icon-right="mdi-menu-down"
        no-caps
        outline
        style="width: 150px"
        align="between"
        class="btn-fixed-width"
      >
        <span v-if="editor.isActive('heading', { level: 1 })">Heading 1</span>
        <span v-else-if="editor.isActive('heading', { level: 2 })"
          >Heading 2</span
        >
        <span v-else-if="editor.isActive('heading', { level: 3 })"
          >Heading 3</span
        >
        <span
          v-else-if="
            editor.isActive('paragraph') || editor.isActive('introduction')
          "
          >Paragraph</span
        >
        <q-menu auto-close transition-show="none" transition-hide="none">
          <q-list style="min-width: 100px">
            <q-item
              clickable
              @click="setHeading(1)"
              :class="{
                'is-active': editor.isActive('heading', {
                  level: 1,
                }),
              }"
            >
              <q-item-section>Heading 1</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="setHeading(2)"
              :class="{
                'is-active': editor.isActive('heading', {
                  level: 2,
                }),
              }"
            >
              <q-item-section>Heading 2</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="setHeading(3)"
              :class="{
                'is-active': editor.isActive('heading', {
                  level: 3,
                }),
              }"
            >
              <q-item-section>Heading 3</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="editor.chain().focus().setParagraph().run()"
              :class="{
                'is-active':
                  editor.isActive('paragraph') ||
                  editor.isActive('introduction'),
              }"
            >
              <q-item-section>Paragraph</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-space />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-bold"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-italic"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-link"
        @click="openLinkDialog($event)"
        :class="{ 'is-active': editor.isActive('link') }"
      >
        <q-dialog v-model="linkDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-bold">Add link</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                dense
                v-model="currentLink"
                autofocus
                @keyup.enter="prompt = false"
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
                @click="editor.chain().focus().unsetLink().run()"
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
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="gt-xs"
      />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-list-numbered"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="gt-xs"
      />

      <q-space class="gt-xs" />
      <q-separator vertical class="gt-xs" />
      <q-space class="gt-xs" />

      <q-btn
        padding="sm"
        flat
        icon="mdi-format-quote-open"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        class="gt-xs"
      />
      <q-btn padding="sm" flat icon="mdi-image" class="gt-xs" />
      <q-btn padding="sm" flat icon="mdi-youtube" class="gt-xs" />

      <q-btn
        padding="sm"
        flat
        icon="mdi-dots-horizontal"
        class="lt-sm q-ml-md"
      />
    </div>
  </q-card>
</template>
<script>
import { defineComponent } from "vue";

import { useEditorStore } from "stores/editor";

export default defineComponent({
  setup() {
    const editor = useEditorStore().editor;
    return {
      // you can return the whole editorStore instance to use it in the template
      editor,
    };
  },
  data() {
    return {
      // provider: useEditorStore(),
      link: "",
      linkDialog: false,
      title: "",
      currentLink: "",
    };
  },
  methods: {
    setHeading(level) {
      return this.editor.commands.setHeading({ level: level });
    },
    setLink(link) {
      this.editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: link })
        .run();
    },
    openLinkDialog(event) {
      event.preventDefault();
      this.currentLink = this.editor.getAttributes("link").href;
      this.linkDialog = true;
    },
  },
});
</script>
