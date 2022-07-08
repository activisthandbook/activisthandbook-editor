<template>
  <q-card-section class="q-p-none">
    <h1 class="q-my-none">
      {{ article.title }}
    </h1>
    <p class="description">
      {{ article.description }}
    </p>

    <div class="text-caption">
      <q-icon name="mdi-link" />
      activisthandbook.org/<span class="text-bold">{{ article.path }}</span>
    </div>
  </q-card-section>
  <q-card-section class="q-pt-none">
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

  <q-card-section
    v-html="sanitize(article.content)"
    class="q-pt-none"
    v-show="!quickReview || showContent"
  >
  </q-card-section>
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
