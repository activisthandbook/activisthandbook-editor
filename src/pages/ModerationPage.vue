<template>
  <div class="flex justify-between items-center">
    <h2 class="q-my-none">Review edits</h2>
    <q-toggle
      v-model="quickReview"
      label="Quick view"
      icon="mdi-lightning-bolt"
    />
  </div>

  <q-tabs v-model="tab" inline-label class="bg-grey-3 rounded-borders">
    <q-tab
      name="review-requests"
      icon="mdi-eye"
      label="Review requests"
      no-caps
    />
    <q-tab name="all" icon="mdi-playlist-edit" label="All edits" no-caps />
  </q-tabs>

  <div style="min-height: 256px">
    <div v-if="articles.dataLoaded">
      <q-card v-if="!articles.data[0]">
        <q-card-section>No new edits.</q-card-section>
      </q-card>
      <q-card :flat="quickReview" v-else>
        <q-list
          :padding="!quickReview"
          :class="{ 'q-gutter-y-md q-mt-md': quickReview }"
          bordered
        >
          <ModerationItem
            v-for="article in articles.data"
            :article="article"
            :key="article.id"
            :quickReview="quickReview"
          />
        </q-list>
      </q-card>
    </div>
  </div>

  <q-separator class="q-my-xl" />

  <q-card flat class="q-mt-xl bg-grey-2">
    <q-card-section class="text-center">
      <q-icon name="mdi-alert" size="64px" color="grey" />
      <div class="text-bold">Danger zone</div>
      <div>Warning! The buttons below are dangerous. Proceed with caution.</div>
      <div class="q-gutter-sm q-mt-sm">
        <q-btn
          label="Accept all changes"
          icon="mdi-check-all"
          no-caps
          outline
          disable
        />
        <q-btn
          label="Revert all changes"
          icon="mdi-delete"
          no-caps
          outline
          disable
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import ModerationItem from "src/components/moderate/ModerationItem.vue";

import { useFirebaseStore } from "stores/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
const db = getFirestore();

import { httpsCallable } from "firebase/functions";

export default {
  name: "ModerationPage",
  components: { ModerationItem },
  setup() {
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      firebaseStore,
    };
  },
  data() {
    return {
      tab: "review-requests",
      version: 3,
      quickReview: false,
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
      where("requestedPublication", "==", true)
    );
    this.articles.unsubscribe = onSnapshot(q, (querySnapshot) => {
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
  methods: {
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
