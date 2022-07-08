<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-primary text-white" bordered>
      <q-toolbar class="flex">
        <q-icon name="mdi-shield-star" size="24px" />
        <q-toolbar-title>Moderate</q-toolbar-title>

        <q-btn
          color="white"
          text-color="black"
          no-caps
          icon="mdi-check"
          label="Publish 9 articles"
          @click="publishArticles()"
          :loading="publishingLoading"
        >
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import { useFirebaseStore } from "stores/firebase";

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
      publishingLoading: false,
    };
  },

  methods: {
    publishArticles: function () {
      this.publishingLoading = true;
      const publishArticles = httpsCallable(
        this.firebaseStore.functions,
        "publishArticles"
      );
      publishArticles()
        .then((result) => {
          this.publishingLoading = false;
          this.$q.notify("Articles published");
        })
        .catch((error) => {
          this.$q.notify("Publishing articles failed");
          console.log(error);
        });
    },
  },
};
</script>
