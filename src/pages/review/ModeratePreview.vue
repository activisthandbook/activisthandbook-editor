<template>
  <q-card-section class="q-pt-none">
    <q-card flat class="bg-warning q-mt-md" v-if="article.deleteArticle">
      <q-card-section
        >If you accept this version, this article and all its version history
        will be permanently deleted!</q-card-section
      >
    </q-card>
  </q-card-section>

  <div v-show="showContent">
    <q-card-section
      v-if="article.content !== '<p></p>'"
      v-html="sanitize(article.content)"
      class="article q-pt-none"
    >
    </q-card-section>
    <q-card-section v-else class="text-grey"> Empty document </q-card-section>
  </div>
</template>
<script>
import sanitizeHtml from "sanitize-html";

export default {
  props: ["article"],
  data() {
    return {
      showContent: false,
    };
  },
  methods: {
    // RENDER FUNCTIONS
    sanitize: function (inputHTML) {
      return sanitizeHtml(inputHTML);
    },
  },
};
</script>
