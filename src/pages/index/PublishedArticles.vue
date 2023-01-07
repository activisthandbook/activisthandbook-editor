<template>
  <q-card class="bg-accent q-py-sm" v-if="articles_published.dataLoaded">
    <q-list>
      <q-item class="q-py-md bg-grey-1 q-mb-sm">
        <q-item-section avatar>
          <q-icon name="mdi-check-circle-outline" size="32px" />
        </q-item-section>
        <q-item-section class="text-h5"> Recently published </q-item-section>
      </q-item>
    </q-list>
    <ArticleList
      v-if="articles_published.data[0]"
      :articles="articles_published.data"
    />
    <q-card-section v-else> No newly published articles found. </q-card-section>
  </q-card>
</template>
<script>
import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

import {
  query,
  collection,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
const db = getFirestore();

import ArticleList from "src/components/ArticleList.vue";

export default {
  components: { ArticleList },
  data: function () {
    return {
      publishedArticles: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
  created() {
    this.fetchPublishedArticles();
  },
  unmounted() {
    this.publishedArticles.unsubscribe();
  },
  methods: {
    fetchPublishedArticles() {
      this.publishedArticles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles_draft"),
          orderBy("lastPublishedServerTimestamp", "desc"),
          where("lastPublishedServerTimestamp", "!=", null),
          limit(5)
        ),
        (snapshot) => {
          let articles = [];
          snapshot.forEach((doc) => {
            articles.push(doc.data());
          });
          this.publishedArticles.data = articles;
          this.publishedArticles.dataLoaded = true;
        },
        (error) => {
          this.publishedArticles.error = error;
        }
      );
    },
  },
};
</script>
