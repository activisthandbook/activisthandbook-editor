<template>
  <q-card-section class="q-pt-none">
    <q-card flat class="bg-warning q-mt-md" v-if="article.deleteArticle">
      <q-card-section
        >If you accept, this article and all its version history will be
        permanently deleted!</q-card-section
      >
    </q-card>

    <q-btn
      label="Show content"
      v-show="quickReview && !showContent"
      @click="showContent = true"
      class="full-width"
      no-caps
      color="grey-2"
      text-color="black"
      unelevated
    />
    <q-btn
      label="Hide content"
      v-show="quickReview && showContent"
      @click="showContent = false"
      class="full-width"
      no-caps
      color="grey-2"
      text-color="black"
      unelevated
    />
  </q-card-section>

  <div v-show="!quickReview || showContent">
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
  props: ["article", "quickReview"],
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
