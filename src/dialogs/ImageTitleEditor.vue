<template>
  <q-dialog v-model="dialogOpen" @show="getAttributes()">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-bold">Edit image title</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="attributes.title"
          autofocus
          outlined
          color="secondary"
        />
        <div class="q-gutter-sm text-right q-mt-md">
          <q-btn
            label="Remove image"
            no-caps
            color="secondary"
            @click="removeImage()"
            flat
            v-close-popup
          />
          <q-btn label="Update title" color="secondary" no-caps v-close-popup />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { mapStores } from "pinia";
import { useEditorStore } from "src/stores/editor";
import sanitizeHtml from "sanitize-html";

export default {
  props: ["value"],
  data() {
    return {
      dialogOpen: this.value,
      attributes: {
        title: null,
        src: null,
        alt: null,
      },
    };
  },

  computed: {
    ...mapStores(useEditorStore),
  },
  methods: {
    getAttributes() {
      this.attributes = this.editorStore.tiptap.content.getAttributes("figure");
    },
    removeImage() {
      this.editorStore.tiptap.content.chain().focus().deleteSelection().run();
    },
  },
};
</script>
