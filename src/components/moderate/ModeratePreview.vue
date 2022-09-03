<template>
  <q-card-section class="q-p-none">
    <q-card flat class="bg-warning q-mb-md" v-if="article.deleteArticle">
      <q-card-section
        >If you accept, this article will be deleted</q-card-section
      >
    </q-card>
    <h1 class="q-my-none">
      <div v-if="article.title">
        {{ article.title }}
      </div>
      <div v-else class="text-grey">No title</div>
    </h1>

    <p class="description">
      <span v-if="article.description">
        {{ article.description }}
      </span>
      <span v-else class="text-grey"> No description </span>
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

  <div v-show="!quickReview || showContent">
    <q-card-section
      v-if="article.content !== '<p></p>'"
      v-html="sanitize(article.content)"
      class="q-pt-none"
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
