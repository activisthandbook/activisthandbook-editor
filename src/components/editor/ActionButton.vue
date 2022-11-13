<template>
  <node-view-wrapper class="action-button">
    <span
      class="label"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    >
      Action button
    </span>
    <!-- <node-view-content class="content" /> -->
    <div class="button items-center justify-center" contenteditable="false">
      <span v-if="button.label">{{ button.label }}</span>
      <span v-else>Click me!</span>
    </div>
    <q-card contenteditable="false" class="text-black bg-accent">
      <q-card-section>
        <div class="q-gutter-y-sm">
          <div class="text-bold">Action button</div>
          <!-- <ActionButtonEditor
            :value="test"
            @input="(event) => (test = event.target.value)"
          /> -->
          <ActionButtonEditor v-model:value="button" @input="update()" />
          <!-- <q-input
            label="Button label"
            outlined
            color="secondary"
            v-model="buttonlabel"
            @update:model-value="update()"
          />
          <q-input
            label="Button anchor"
            outlined
            color="secondary"
            v-model="buttonanchor"
            @update:model-value="update()"
          />
          <q-input
            label="Button link"
            outlined
            color="secondary"
            v-model="buttonlink"
            @update:model-value="update()"
          /> -->
        </div>
      </q-card-section>
    </q-card>
  </node-view-wrapper>
</template>

<style lang="scss">
.action-button {
  background: $accent;
  // color: $accent;
  border: 3px solid #0d0d0d;
  border-radius: 2px;
  margin: 1rem 0;
  position: relative;
  padding: calc(32px + 0.5vw) calc(8px + 2vw) calc(14px + 1.8vw) calc(8px + 2vw);

  .label {
    left: 0;
    background-color: #0d0d0d;
    color: $accent;
    font-size: 0.6rem;
    letter-spacing: 1px;
    font-weight: bold;
    text-transform: uppercase;
    position: absolute;
    top: 0;
    padding: 0.25rem 0.75rem;
    border-radius: 0 0 2px 0;
    cursor: move;
  }

  .button {
    min-width: 200px;
    background: $secondary;
    font-family: $font-secondary;
    color: $accent;
    height: 52px;
    margin-bottom: 24px;
    padding: 0 16px;
    display: inline-flex;
    box-shadow: calc(4px + 0.4vw) calc(4px + 0.4vw) 0 black;
  }
}
</style>

<script>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";
import ActionButtonEditor from "src/components/ActionButtonEditor.vue";

export default {
  props: nodeViewProps,
  // props: {
  //   node: {
  //     type: Object,
  //     required: true,
  //   },
  // },
  data() {
    return {
      button: {
        label: this.node.attrs.buttonlabel,
        anchor: this.node.attrs.buttonanchor,
        link: this.node.attrs.buttonlink,
      },
    };
  },
  components: {
    NodeViewWrapper,
    ActionButtonEditor,
    // NodeViewContent,
  },

  methods: {
    update() {
      this.updateAttributes({
        buttonlabel: this.button.label,
        buttonanchor: this.button.anchor,
        buttonlink: this.button.link,
      });
    },
  },
};
</script>
