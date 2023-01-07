<template>
  <q-layout></q-layout>
  <q-dialog v-model="open" persistent>
    <q-card class="bg-accent full-width" style="max-width: 320px">
      <q-card-section>
        <div class="q-gutter-y-md">
          <h1 class="q-mt-md q-mb-none">Translate article</h1>
          <div>
            <LanguageSelector
              v-model="lang"
              :options="languagesStore.languages"
            />
            <div class="text-caption q-mt-xs text-bold">
              <div v-if="invalid">{{ errors.join(" ") }}</div>
              <div v-else>Click 'Create' to add {{ lang.EnglishName }}</div>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancel" no-caps flat @click="goBack()" />
            <q-btn
              label="Create"
              color="primary"
              no-caps
              icon-right="mdi-arrow-right"
              @click="createNewTranslation()"
              :loading="loading"
              :disable="invalid"
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
  getDoc,
  getFirestore,
  arrayUnion,
  serverTimestamp,
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
      lang: null,
      languageCollection: null,
      loading: false,
    };
  },
  computed: {
    // note we are not passing an array, just one store after the other
    // each store will be accessible as its id + 'Store'
    ...mapStores(useLanguagesStore, useFirebaseStore),
    errors: function () {
      let errors = [];
      if (!this.lang) {
        errors.push("Select a language");
      } else if (
        this.languageCollection.find(
          (article) => article.langCode === this.lang.code
        )
      ) {
        errors.push("This language has already been added.");
      }

      return errors;
    },
    invalid: function () {
      if (this.errors.length) return true;
      else return false;
    },
  },
  async mounted() {
    await getDoc(
      doc(db, "languageCollections", this.$route.params.languageCollectionID)
    )
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.languageCollection = snapshot.data().articles;
        } else {
          this.$q.notify("Language collection not found.");
          this.$router.push({ name: "404" });
        }
      })
      .catch((error) => {
        console.log(error);
        this.$q.notify("Error fetching language collection.");
      });
  },
  methods: {
    async createNewTranslation() {
      const newArticleID = this.mixin_randomID();
      this.loading = true;

      const batch = writeBatch(db);

      batch.set(doc(db, "articles_draft", newArticleID), {
        langCode: this.lang.code,
        languageCollectionID: this.$route.params.languageCollectionID,
        publishedFullPath: null,
        metadata: {
          updatedTimestamp: null,
          updatedBy: null,
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      batch.update(
        doc(db, "languageCollections", this.$route.params.languageCollectionID),
        {
          articles: arrayUnion({
            articleID: newArticleID,
            langCode: this.lang.code,
          }),
          "metadata.updatedTimestamp": serverTimestamp(),
          "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
        }
      );

      batch.set(
        doc(db, "userProfiles", this.firebaseStore.auth.currentUser.uid),
        {
          recentlyEditedArticles: arrayUnion(newArticleID),
          metadata: {
            updatedTimestamp: serverTimestamp(),
            updatedBy: this.firebaseStore.auth.currentUser.uid,
          },
        },
        { merge: true }
      );

      await batch.commit();
      this.loading = false;
      this.$router.push({
        name: "Edit",
        params: { articleID: newArticleID },
      });
    },
    goBack() {
      window.history.go(-1);
    },
  },
};
</script>
