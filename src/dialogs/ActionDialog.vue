<template>
  <q-dialog
    v-model="dialogOpen"
    @hide="$emit('hide')"
    ref="ActionDialog"
    :maximized="$q.screen.lt.sm"
  >
    <q-layout container view="hHh lpR fFf" class="bg-accent">
      <q-header class="bg-accent text-black" bordered>
        <q-toolbar>
          <q-btn flat round dense icon="mdi-close" v-close-popup />
          <q-toolbar-title>Insert action</q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page padding>
          <div class="q-gutter-y-md q-pt-sm">
            <q-card class="bg-secondary" dark>
              <q-card-section>
                <strong>Motivate the reader to take action.</strong> Focus on 1
                action per page to maximise conversions.
              </q-card-section>
            </q-card>
            <q-card
              class="bg-accent"
              flat
              bordered
              v-for="(option, index) in options"
              :key="index"
            >
              <q-item
                clickable
                class="q-py-md"
                @click="insertAction(option.action)"
              >
                <q-item-section avatar>
                  <q-avatar
                    size="52px"
                    :icon="option.icon"
                    color="secondary"
                    text-color="accent"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-bold">
                    {{ option.label }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ option.explanation }}
                  </q-item-label>
                </q-item-section>
                <q-card-section side>
                  <q-icon name="mdi-chevron-right" size="20px" color="grey" />
                </q-card-section>
              </q-item>
            </q-card>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>
<script>
import { mapStores } from "pinia";
import { useEditorStore } from "src/stores/editor";

export default {
  props: ["value"],
  computed: {
    ...mapStores(useEditorStore),
  },
  data() {
    return {
      dialogOpen: this.value,
      selectedAction: "donate",
      options: [
        {
          label: "Smart action",
          icon: "mdi-auto-fix",
          explanation: "Best option in most cases: adapts to the user",
          action: "smart",
        },
        {
          label: "Donate",
          icon: "mdi-currency-eur",
          explanation: "Ask for money",
          action: "donate",
        },
        {
          label: "Sign up",
          icon: "mdi-heart",
          explanation: "Ask for contact details",
          action: "signup",
        },
        {
          label: "Custom action",
          icon: "mdi-format-textbox",
          explanation: "Prominent block of text with button",
          action: "custom",
        },

        {
          label: "Button",
          icon: "mdi-cursor-default-click",
          explanation: "A big blue link",
          action: "button",
        },
      ],
    };
  },

  methods: {
    insertAction(action) {
      this.$refs.ActionDialog.hide();

      switch (action) {
        case "donate":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionDonate({})
            .run();
          break;
        case "signup":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionSignup({})
            .run();
          break;
        case "custom":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionCustom({})
            .run();
          break;
        case "button":
          this.editorStore.tiptap.content
            .chain()
            .focus()
            .setActionButton({})
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
<style>
main.q-page {
  min-height: none !important;
}
</style>
