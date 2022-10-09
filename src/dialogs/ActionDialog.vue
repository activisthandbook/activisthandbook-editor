<template>
  <q-dialog v-model="dialogOpen" @hide="$emit('hide')" ref="ActionDialog">
    <q-card style="min-width: 350px" class="bg-accent">
      <q-card-section>
        <div class="text-bold">Select call to action:</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-option-group
          :options="options"
          type="radio"
          v-model="selectedAction"
          color="secondary"
        />
        <div class="q-gutter-sm text-right q-mt-md">
          <q-btn label="Cancel" no-caps color="secondary" flat v-close-popup />
          <q-btn
            label="Insert"
            color="secondary"
            no-caps
            @click="insertAction()"
            :disable="!selectedAction"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { mapStores } from "pinia";
import { useEditorStore } from "src/stores/editor";

export default {
  props: ["value"],
  data() {
    return {
      dialogOpen: this.value,
      selectedAction: "donate",
      options: [
        { label: "Donate", value: "donate" },
        { label: "Become volunteer", value: "volunteer" },
        { label: "Custom action", value: "custom" },
        { label: "Smart action ✨", value: "smart" },
      ],
    };
  },

  computed: {
    ...mapStores(useEditorStore),
  },
  methods: {
    insertAction() {
      this.$refs.ActionDialog.hide();

      switch (this.selectedAction) {
        case "donate":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionDonate({})
            .run();
          break;
        case "volunteer":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionVolunteer({})
            .run();
          break;
        case "custom":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionCustom({})
            .run();
          break;
        case "smart":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionSmart({})
            .run();
          break;

        default:
          break;
      }

      this.selectedAction = null;
    },
  },
};
</script>
