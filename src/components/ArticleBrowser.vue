<template>
  <q-list>
    <q-item>
      <q-item-section>
        <q-item-label>Title</q-item-label>
        <q-item-label>Description</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn icon="mdi-pencil" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default {
  data: function () {
    return {
      articles: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  async mounted() {
    await fetchArticles();
  },
  async unmounted() {
    this.articles.unsubscribe();
  },
  methods: {
    async fetchArticles() {
      const q = query(
        collection(db, "articles_draft"),
        where("inFolder", "==", "en/organising")
      );

      this.articles.unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const articles = [];
          querySnapshot.forEach((doc) => {
            articles.push(doc.data());
          });
          articles.data = articles;
          articles.dataLoaded = true;
        },
        (error) => {
          this.articles.error = error;
        }
      );
    },
  },
};
</script>
