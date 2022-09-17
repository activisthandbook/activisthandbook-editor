<template>
  <q-list v-if="articles.dataLoaded" separator>
    <q-item
      v-for="(article, index) in articles.data"
      :key="index"
      :to="{ name: 'Edit', params: { articleID: article.id } }"
      class="q-py-md"
    >
      <q-item-section>
        <q-item-label class="text-bold" v-if="article.title">
          {{ article.title }}
        </q-item-label>
        <q-item-label class="text-bold text-grey" v-else>No title</q-item-label>

        <q-item-label v-if="article.description">
          {{ article.description }}
        </q-item-label>
        <q-item-label v-else class="text-grey"> No description </q-item-label>
        <q-item-label caption
          >{{ article.langCode }}/{{ article.path }}</q-item-label
        >
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
import {
  query,
  collection,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
} from "firebase/firestore";
const db = getFirestore();

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
  created() {
    this.fetchArticles();
  },
  methods: {
    fetchArticles() {
      this.articles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles"),
          orderBy("lastUpdatedServerTimestamp", "desc"),
          limit(10)
        ),
        (snapshot) => {
          let articles = [];
          snapshot.forEach((doc) => {
            articles.push(doc.data());
          });
          this.articles.data = articles;
          this.articles.dataLoaded = true;
        },
        (error) => {
          this.articles.error = error;
        }
      );
    },
  },
  unmounted() {
    this.articles.unsubscribe();
  },
};
</script>
