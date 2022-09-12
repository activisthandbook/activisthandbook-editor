<template>
  <q-dialog v-model="open" persistent>
    <q-card class="bg-accent full-width" style="max-width: 320px">
      <q-card-section>
        <div class="q-gutter-y-md">
          <h1 class="q-mt-md q-mb-none">New article</h1>
          <q-input
            label="Title"
            outlined
            color="secondary"
            v-model="title"
            autofocus
            @keyup.enter="createNewArticle()"
          />
          <LanguageSelector
            v-model="lang"
            :options="languagesStore.languages"
          />
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancel" no-caps flat @click="goBack()" />
            <q-btn
              label="Create"
              color="primary"
              no-caps
              icon-right="mdi-arrow-right"
              @click="createNewArticle()"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import { doc, writeBatch, getFirestore } from "firebase/firestore";
const db = getFirestore();

import { mapStores } from "pinia";
import { useLanguagesStore } from "stores/languages";

import LanguageSelector from "components/LanguageSelector.vue";
export default {
  components: { LanguageSelector },
  data: function () {
    return {
      open: true,
      title: null,
      lang: {
        code: "en",
        EnglishName: "English",
        localName: "English",
      },
      loading: false,
    };
  },
  computed: {
    // note we are not passing an array, just one store after the other
    // each store will be accessible as its id + 'Store'
    ...mapStores(useLanguagesStore),
  },
  methods: {
    createNewArticle: async function () {
      const newArticleID = this.mixin_randomID();
      const newLanguageCollectionID = this.mixin_randomID();
      this.loading = true;

      const batch = writeBatch(db);

      batch.set(doc(db, "articles", newArticleID), {
        langCode: this.lang.code,
        title: this.title,
        languageCollectionID: newLanguageCollectionID,
      });

      batch.set(doc(db, "languageCollections", newLanguageCollectionID), {
        articles: [{ articleID: newArticleID, langCode: this.lang.code }],
      });

      await batch.commit().then(() => {
        this.loading = false;
        this.$router.push({
          name: "Edit",
          params: { articleID: newArticleID },
        });
      });
    },
    goBack() {
      window.history.go(-1);
    },
  },
};
</script>
