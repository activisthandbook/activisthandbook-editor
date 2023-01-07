<template>
  <div v-if="articles.dataLoaded" class="q-gutter-y-md q-my-md">
    <q-card v-if="!articles.data[0]" class="bg-accent">
      <q-card-section>No new edits.</q-card-section>
    </q-card>
    <ReviewArticleItem
      v-for="article in articles.data"
      :liveDraftArticle="article"
      :key="article.id"
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
      articles: {
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
    this.articles.unsubscribe();
  },
  methods: {
    async fetchArticles() {
      const q = query(
        collection(db, "articles_draft"),
        where("requestedPublication", "==", true),
        orderBy("requestedPublicationTimestamp", "asc"),
        limit(10)
      );
      this.articles.unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const articles = [];
        querySnapshot.forEach((doc) => {
          articles.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        this.articles.data = articles;
        this.articles.dataLoaded = true;
      });
    },
  },
};
</script>
