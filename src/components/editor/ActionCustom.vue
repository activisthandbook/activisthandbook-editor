<template>
  <!-- SYNC WITH WEBSITE: Has content & button-->
  <node-view-wrapper class="action-custom">
    <span
      class="label"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    >
      Custom action
    </span>
    <node-view-content class="content" />
    <div class="button items-center justify-center" contenteditable="false">
      {{ buttonlabel }}
    </div>
    <q-card contenteditable="false" class="text-black bg-accent">
      <q-card-section>
        <div class="q-gutter-y-sm">
          <div class="text-bold">Action button</div>
          <q-input
            label="Button label"
            outlined
            color="secondary"
            v-model="buttonlabel"
            @update:model-value="update()"
          />
          <q-input
            label="Button link"
            outlined
            color="secondary"
            v-model="buttonlink"
            @update:model-value="update()"
          />
        </div>
      </q-card-section>
    </q-card>
  </node-view-wrapper>
</template>

<style lang="scss">
.action-custom {
  background: $secondary;
  color: $accent;
  border: 3px solid #0d0d0d;
  border-radius: 2px;
  margin: 1rem 0;
  position: relative;
  padding: calc(14px + 0.5vw) calc(8px + 2vw) calc(14px + 1.8vw) calc(8px + 2vw);

  h2 {
    color: $accent;
    margin-bottom: 16px;
  }

  .label {
    left: 0;
    background-color: #0d0d0d;
    font-size: 0.6rem;
    letter-spacing: 1px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    position: absolute;
    top: 0;
    padding: 0.25rem 0.75rem;
    border-radius: 0 0 2px 0;
    cursor: move;
  }

  .button {
    min-width: 200px;
    color: black;
    height: 52px;
    margin-bottom: 32px;
    padding: 0 16px;
    display: inline-flex;
    background: $accent;
    box-shadow: calc(4px + 0.4vw) calc(4px + 0.4vw) 0 black;
  }
}
</style>

<script>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";

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
      buttonlabel: this.node.attrs.buttonlabel,
      buttonlink: this.node.attrs.buttonlink,
    };
  },
  mounted() {
    console.log(this.node.attrs);
  },

  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  methods: {
    update() {
      this.updateAttributes({
        buttonlabel: this.buttonlabel,
        buttonlink: this.buttonlink,
      });
    },
  },
};
</script>
