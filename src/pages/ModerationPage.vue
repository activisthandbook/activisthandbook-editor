<template>
  <q-btn label="Publish" @click="publishArticles()" />
  <q-card v-if="articles.dataLoaded">
    <q-list>
      <q-expansion-item
        expand-separator
        label="Article"
        v-for="(article, index) in articles.data"
        :key="index"
      >
        <q-card>
          <q-card-section v-html="sanitize(article.content)"> </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-card>
</template>
<script>
import { useFirebaseStore } from "stores/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
const db = getFirestore();

import sanitizeHtml from "sanitize-html";

import { httpsCallable } from "firebase/functions";

export default {
  name: "ModerationPage",
  setup() {
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      firebaseStore,
    };
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
  mounted: function () {
    const q = query(
      collection(db, "articles"),
      where("requestPublication", "==", true)
    );
    this.articles.unsubscribe = onSnapshot(q, (querySnapshot) => {
      const articles = [];
      querySnapshot.forEach((doc) => {
        articles.push(doc.data());
      });
      console.log(articles);
      this.articles.data = articles;
      this.articles.dataLoaded = true;
    });
  },
  methods: {
    sanitize: function (inputHTML) {
      return sanitizeHtml(inputHTML);
    },
    publishArticles: function () {
      const publishArticles = httpsCallable(
        this.firebaseStore.functions,
        "publishArticles"
      );
      publishArticles().then((result) => {
        console.log(result.data);
      });
    },
  },
};
</script>
