<template>
  <div v-if="articles_draft.dataLoaded" class="q-gutter-y-md q-my-md">
    <q-card v-if="!articles_draft.data[0]" class="bg-accent">
      <q-card-section>No new edits.</q-card-section>
    </q-card>
    <ReviewArticleItem
      v-for="article_draft in articles_draft.data"
      :liveDraftArticle="article_draft"
      :key="article_draft.id"
    />
  </div>
</template>
<script>
import ReviewArticleItem from "./ReviewArticleItem.vue";

import {
  collection,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
const db = getFirestore();

export default {
  components: {
    ReviewArticleItem,
  },
  data() {
    return {
      articles_draft: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  created: function () {
    this.fetchArticles();
  },
  unmounted() {
    this.articles_draft.unsubscribe();
  },
  methods: {
    async fetchArticles() {
      const q = query(
        collection(db, "articles_draft"),
        where("requestedPublication", "==", true),
        orderBy("requestedPublicationTimestamp", "asc"),
        limit(10)
      );
      this.articles_draft.unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const articles = [];
        querySnapshot.forEach((doc) => {
          articles.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        this.articles_draft.data = articles;
        this.articles_draft.dataLoaded = true;
      });
    },
  },
};
</script>
