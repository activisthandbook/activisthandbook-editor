<template>
  <q-layout></q-layout>
  <q-dialog v-model="open" persistent>
    <q-card class="bg-accent full-width" style="max-width: 350px">
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
          <q-card flat class="bg-grey-2">
            <q-card-section>
              <strong>Before you create a new article...</strong> Did you check
              if similar articles already exist on Activist Handbook? You can
              also improve existing guides.
            </q-card-section>
          </q-card>
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
import {
  doc,
  writeBatch,
  getFirestore,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
const db = getFirestore();

import { mapStores } from "pinia";
import { useLanguagesStore } from "stores/languages";
import { useFirebaseStore } from "src/stores/firebase";

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
    ...mapStores(useLanguagesStore, useFirebaseStore),
  },
  methods: {
    async createNewArticle() {
      const newArticleID = this.mixin_randomID();
      const newLanguageCollectionID = this.mixin_randomID();
      this.loading = true;

      const batch = writeBatch(db);

      batch.set(doc(db, "articles_draft", newArticleID), {
        langCode: this.lang.code,
        title: this.title,
        languageCollectionID: newLanguageCollectionID,
        lastPublishedServerTimestamp: null,
        publishedFullPath: null,
        id: newArticleID,
        metadata: {
          updatedTimestamp: serverTimestamp(),
          updatedBy: this.firebaseStore.auth.currentUser.uid,
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      batch.set(doc(db, "languageCollections", newLanguageCollectionID), {
        articles_draft: [
          {
            articleID: newArticleID,
            langCode: this.lang.code,
          },
        ],
        articles_published: null,
        id: newLanguageCollectionID,
        metadata: {
          updatedTimestamp: serverTimestamp(),
          updatedBy: this.firebaseStore.auth.currentUser.uid,
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      batch.set(
        doc(db, "users_profile", this.firebaseStore.auth.currentUser.uid),
        {
          recentlyEditedArticles: arrayUnion(newArticleID),

          metadata: {
            updatedTimestamp: serverTimestamp(),
            updatedBy: this.firebaseStore.auth.currentUser.uid,
          },
        },
        { merge: true }
      );

      await batch
        .commit()
        .then(() => {
          this.loading = false;
          this.$router.push({
            name: "Edit",
            params: { articleID: newArticleID },
          });
        })
        .catch((error) => {
          this.loading = false;
          this.$q.notify("Creating article failed");
          console.log(error);
        });
    },
    goBack() {
      window.history.go(-1);
    },
  },
};
</script>
