<template>
  <node-view-wrapper class="embed-donation">
    <!-- <div
      class="drag-handle"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    /> -->
    <span
      class="label"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    >
      Collect donations
    </span>
    <node-view-content class="content" />
    <!-- <div class="donate" contenteditable="false">Donorbox</div> -->

    <div class="donation-preview" contenteditable="false">
      <div class="header"></div>
      <div class="interval"></div>
      <div class="currency"></div>
      <div class="options">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="custom-option"></div>
      <div class="button"></div>
    </div>
  </node-view-wrapper>
</template>

<style lang="scss">
.embed-donation {
  background: rgba(0, 0, 0, 0.1);
  // color: $accent;
  border: 3px solid #0d0d0d;
  border-radius: 2px;
  margin: 1rem 0;
  position: relative;
  padding: calc(14px + 0.5vw) calc(8px + 2vw) calc(14px + 2vw) calc(8px + 2vw);
  text-align: center;

  .donation-preview {
    background: white;
    max-width: 432px;
    margin: auto;
    cursor: default;
    padding-bottom: 32px;

    .header {
      background: $secondary;
      height: 64px;
    }
    .interval {
      height: 42px;
      background: lightgrey;
      width: 50%;
      margin: 16px auto;
    }
    .currency {
      height: 42px;
      background: lightgrey;
      width: 70%;
      margin: 16px auto;
    }
    .options {
      margin: 16px auto 0 auto;

      div {
        display: inline-block;
        width: 25%;
        height: 64px;
        background: lightgrey;
        margin: 2%;
      }
    }
    .custom-option {
      margin: auto;
      width: 83%;
      height: 64px;
      background: lightgrey;
    }

    .button {
      width: 83%;
      height: 64px;
      margin: 24px auto 0 auto;
      background: $secondary;
    }
  }

  h2 {
    color: black;
    margin-bottom: 16px;
  }
  .donation-container {
    cursor: default;
  }

  .label {
    left: 0;
    // margin-left: 1rem;
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
    NodeViewContent,
  },
};
</script>

<!--
<template>
  <node-view-wrapper class="vue-component">
    <span class="label" data-drag-handle draggable="true"
      >Collect donations</span
    >

    <div class="content">
      <button @click="increase">
        This button has been clicked {{ node.attrs.count }} times.
      </button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  methods: {
    increase() {
      this.updateAttributes({
        count: this.node.attrs.count + 1,
      });
    },
  },
};
</script>

<style lang="scss">
.vue-component {
  background: $secondary;
  border: 3px solid #0d0d0d;
  border-radius: 0.5rem;
  margin: 1rem 0;
  position: relative;
}

.label {
  margin-left: 1rem;
  background-color: #0d0d0d;
  font-size: 0.6rem;
  letter-spacing: 1px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  position: absolute;
  top: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 0 0 0.5rem 0.5rem;
  cursor: move;
}

.content {
  margin-top: 1.5rem;
  padding: 1rem;
}
</style>
-->
