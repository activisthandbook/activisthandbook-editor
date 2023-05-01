<template>
  <div v-if="articles_draft.dataLoaded" class="q-gutter-y-md q-my-md">
    <q-card v-if="!articles_draft.data[0]" class="bg-accent">
      <q-card-section>No new edits.</q-card-section>
    </q-card>

    <CompareArticle
      v-for="article in articles_draft.data"
      :article_draft_live="article"
      :key="article.id"
    />
  </div>
</template>
<script>
import CompareArticle from "./CompareArticle.vue";

import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  writeBatch,
  doc,
  serverTimestamp,
  where,
  limit,
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
const db = getFirestore();

export default {
  components: {
    CompareArticle,
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
  async created() {
    await this.fetchArticles();
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
