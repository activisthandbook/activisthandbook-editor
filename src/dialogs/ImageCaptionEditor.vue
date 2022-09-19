<template>
  <q-dialog
    v-model="dialogOpen"
    @show="getAttributes()"
    @hide="$emit('hide')"
    ref="imageCaptionEditor"
  >
    <q-card style="min-width: 350px" class="bg-accent">
      <q-card-section>
        <div class="text-bold">Edit image caption</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="attributes.imageCaption"
          autofocus
          outlined
          color="secondary"
          hint="Make sure to give proper attribution to the author."
          @keyup.enter="updateImage()"
        />
        <div class="q-gutter-sm text-right q-mt-md">
          <q-btn label="Cancel" no-caps color="secondary" flat v-close-popup />
          <q-btn
            label="Update caption"
            color="secondary"
            no-caps
            @click="updateImage()"
          />
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
        // caption: null,
      },
    };
  },

  computed: {
    ...mapStores(useEditorStore),
  },
  methods: {
    getAttributes() {
      this.attributes =
        this.editorStore.tiptap.content.getAttributes("imageWithCaption");
    },
    updateImage() {
      this.$refs.imageCaptionEditor.hide();

      this.editorStore.tiptap.content
        .chain()
        .focus()
        .setImageWithCaption({
          ...this.attributes,
        })
        .run();
    },
  },
};
</script>
