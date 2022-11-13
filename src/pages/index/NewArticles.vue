<template>
  <q-card class="bg-accent q-py-sm" v-if="unpublishedArticles.dataLoaded">
    <q-list>
      <q-item class="q-py-md bg-grey-1 q-mb-sm">
        <q-item-section avatar>
          <q-icon name="mdi-star-outline" size="32px" />
        </q-item-section>
        <q-item-section class="text-h5"> New articles </q-item-section>
      </q-item>
    </q-list>
    <ArticleList
      v-if="unpublishedArticles.data[0]"
      :articles="unpublishedArticles.data"
    />
    <q-card-section v-else> No new unpublished articles found. </q-card-section>
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
      unpublishedArticles: {
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
    this.fetchUnpublishedArticles();
  },
  unmounted() {
    this.unpublishedArticles.unsubscribe();
  },
  methods: {
    fetchUnpublishedArticles() {
      this.unpublishedArticles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles"),
          where("lastPublishedServerTimestamp", "==", null),
          limit(5)
        ),
        (snapshot) => {
          let articles = [];
          snapshot.forEach((doc) => {
            articles.push(doc.data());
          });
          this.unpublishedArticles.data = articles;
          this.unpublishedArticles.dataLoaded = true;
        },
        (error) => {
          this.unpublishedArticles.error = error;
        }
      );
    },
  },
};
</script>
