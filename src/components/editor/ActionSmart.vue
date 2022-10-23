<template>
  <!-- SYNC WITH WEBSITE: Does not have content -->
  <node-view-wrapper class="action-smart">
    <div contenteditable="false">
      <span
        class="label"
        contenteditable="false"
        draggable="true"
        data-drag-handle
      >
        Smart action ✨
      </span>
      <div class="flex items-center justify-center">
        <q-icon name="mdi-information" class="q-ma-sm" />Smart actions adapt to
        the user who is viewing the article.
      </div>
    </div>

    <!-- <node-view-content class="content" /> -->
  </node-view-wrapper>
</template>

<style lang="scss">
.action-smart {
  background: $secondary;
  color: rgba($accent, 0.8);
  border: 3px solid #0d0d0d;
  border-radius: 2px;
  margin: 1rem 0;
  position: relative;
  padding: 64px 8px 64px 8px;
  text-align: center;

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
}
</style>

<script>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";

export default {
  props: nodeViewProps,

  components: {
    NodeViewWrapper,
    // NodeViewContent,
  },
};
</script>
