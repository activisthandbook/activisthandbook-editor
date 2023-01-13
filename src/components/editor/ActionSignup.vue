<template>
  <!-- SYNC WITH WEBSITE: Has content -->
  <node-view-wrapper class="action-signup">
    <span
      class="label"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    >
      Signup form
    </span>
    <node-view-content class="content" />

    <div class="signup-preview" contenteditable="false">
      <div class="input-label"></div>
      <div class="input"></div>
      <div class="input-label"></div>
      <div class="input"></div>
      <div class="input-label"></div>
      <div class="input"></div>

      <div class="privacy"></div>
      <div class="button"></div>
    </div>
    <q-card contenteditable="false" class="text-black bg-accent q-mt-lg">
      <q-card-section>
        <div class="q-gutter-y-sm">
          <div class="text-bold">Form settings</div>
          <q-input
            label="Button label"
            outlined
            color="secondary"
            v-model="buttonlabel"
            @update:model-value="update()"
          />
          <q-select
            placeholder="Add tag..."
            v-model="tags"
            use-input
            use-chips
            outlined
            multiple
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"
            color="secondary"
            @update:model-value="update()"
          >
            <template #prepend>
              <q-icon name="mdi-tag" />
            </template>
          </q-select>
          <q-input
            label="After signup, redirect to..."
            placeholder="/path/to/page"
            outlined
            color="secondary"
            v-model="redirect"
            @update:model-value="update()"
          />
        </div>
      </q-card-section>
    </q-card>
  </node-view-wrapper>
</template>

<style lang="scss">
.action-signup {
  background: $secondary;
  color: $accent;
  border: 3px solid #0d0d0d;
  border-radius: 2px;
  margin: 1rem 0;
  position: relative;
  padding: calc(14px + 0.5vw) calc(8px + 2vw) calc(14px + 2vw) calc(8px + 2vw);

  .signup-preview {
    .input-label,
    .privacy {
      background: rgba($accent, 0.5);
      height: 24px;
      max-width: 200px;
      margin-bottom: 8px;
    }
    .input {
      background: $accent;
      height: 52px;
      margin-bottom: 16px;
    }
    .privacy {
      margin: auto;
      margin-top: 32px;
      max-width: 350px;
    }
    .button {
      width: 83%;
      max-width: 200px;
      height: 52px;
      margin: 24px auto 0 auto;
      background: $accent;
      box-shadow: calc(4px + 0.4vw) calc(4px + 0.4vw) 0 black;
    }
  }

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
  data() {
    return {
      tags: this.node.attrs.tags,
      redirect: this.node.attrs.redirect,
      buttonlabel: this.node.attrs.buttonlabel,
    };
  },
  methods: {
    update() {
      this.updateAttributes({
        tags: this.tags,
        redirect: this.redirect,
        buttonlabel: this.buttonlabel,
      });
    },
  },
};
</script>
