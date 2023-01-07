<template>
  <q-input
    use-input
    dense
    v-model="localPath"
    color="secondary"
    placeholder="my-path"
    @blur="handleBlur()"
    :error="!!validation.error"
    :error-message="validation.error"
  >
    <template v-slot:prepend>
      <q-icon name="mdi-link" />
      <span class="text-caption text-grey-9 text-bold q-ml-sm">
        activisthandbook.org/<span v-if="lang">{{ lang.code }}/</span>
      </span>
    </template>
  </q-input>
  <div v-if="validation.duplicates && validation.duplicates[0]">
    Duplicate page:
    <router-link
      target="_blank"
      :to="{
        name: 'Edit',
        params: { articleID: validation.duplicates[0].id },
      }"
      >{{ validation.duplicates[0].title }}</router-link
    >
  </div>
</template>
<script>
export default {
  props: {
    path: String,
    lang: Object,
    currentID: String,
  },
  emits: ["validUpdate"],
  data: function () {
    return {
      localPath: null,
      validation: {
        error: null,
        duplicates: [],
      },
    };
  },
  watch: {
    path: function () {
      this.localPath = this.path;
    },
  },
  methods: {
    async handleBlur() {
      // Only do something if path is changed
      if (this.localPath !== this.path) {
        this.validation = await this.mixin_validatePath(
          this.localPath,
          this.lang.code,
          this.currentID
        );

        if (!this.validation.error) {
          this.$emit("validUpdate", this.localPath);
        }
      }
    },
  },
};
</script>
