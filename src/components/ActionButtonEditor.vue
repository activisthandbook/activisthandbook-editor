<template>
  <q-input
    outlined
    label="Button label"
    v-model="content.label"
    @update:model-value="handleInput()"
    color="secondary"
  >
    <template #prepend>
      <q-icon name="mdi-card-text" />
    </template>
  </q-input>
  <q-select
    label="Button action"
    v-model="content.anchor"
    outlined
    emit-value
    option-value="value"
    option-label="label"
    map-options
    :options="[
      {
        label: 'Scroll to call to action',
        value: 'primary-action',
      },
      {
        label: 'Visit link',
        value: null,
      },
    ]"
    color="secondary"
    @update:model-value="handleInput()"
  >
    <template #prepend>
      <q-icon name="mdi-cursor-default-click" />
    </template>
  </q-select>
  <q-input
    v-if="!content.anchor"
    outlined
    label="Link"
    v-model="content.link"
    @update:model-value="handleInput()"
    color="secondary"
  >
    <template #prepend>
      <q-icon name="mdi-link" />
    </template>
  </q-input>
</template>
<script>
export default {
  props: ["value"],
  data() {
    return {
      content: this.value,
    };
  },
  methods: {
    handleInput() {
      this.$emit("input", this.content);
    },
  },
  watch: {
    content: {
      handler(newValue) {
        if (newValue.anchor) {
          this.content.link = null;
          this.handleInput();
        }
      },
      deep: true,
    },
  },
};
</script>
