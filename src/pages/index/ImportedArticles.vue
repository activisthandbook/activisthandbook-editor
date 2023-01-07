<template>
  <q-card class="bg-accent q-py-sm" v-if="importedArticles.dataLoaded">
    <q-list>
      <q-item class="q-py-md bg-grey-1 q-mb-sm">
        <q-item-section avatar>
          <q-icon name="mdi-database-import-outline" size="32px" />
        </q-item-section>
        <q-item-section class="text-h5"> Imported articles </q-item-section>
      </q-item>
    </q-list>
    <ArticleList
      v-if="importedArticles.data[0]"
      :articles="importedArticles.data"
    />
    <q-card-section v-else> No imported articles found. </q-card-section>
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
      importedArticles: {
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
    this.fetchImportedArticles();
  },
  unmounted() {
    this.importedArticles.unsubscribe();
  },
  methods: {
    fetchImportedArticles() {
      this.importedArticles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles_draft"),
          where("imported", "==", true),
          limit(5)
        ),
        (snapshot) => {
          let articles = [];
          snapshot.forEach((doc) => {
            articles.push(doc.data());
          });
          this.importedArticles.data = articles;
          this.importedArticles.dataLoaded = true;
        },
        (error) => {
          this.importedArticles.error = error;
        }
      );
    },
  },
};
</script>
