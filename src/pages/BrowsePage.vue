<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Activist Handbook</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding style="max-width: 720px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <q-tabs
            v-model="tab"
            class="bg-grey-3 rounded-borders"
            align="justify"
            active-color="secondary"
          >
            <q-tab
              name="my-files"
              icon="mdi-account-circle"
              label="My files"
              no-caps
            />

            <q-tab name="new" icon="mdi-star-outline" label="New" no-caps />
            <q-tab
              name="published"
              icon="mdi-check-circle-outline"
              label="Published"
              no-caps
            />
            <q-tab name="tree" icon="mdi-file-tree" label="Tree" no-caps />
            <q-tab
              name="import"
              icon="mdi-database-import-outline"
              label="Imported"
              no-caps
            />
          </q-tabs>
          <div class="q-gutter-y-md">
            <div>
              <q-card
                class="bg-accent q-py-sm"
                v-if="
                  usersStore.recentArticles.dataLoaded[
                    firebaseStore.auth.currentUser.uid
                  ]
                "
              >
                <q-card-section>
                  <h3 class="flex items-center">
                    <q-icon
                      name="mdi-file-document-edit-outline"
                      class="q-mr-sm"
                    />
                    <span>My recent edits</span>
                  </h3>
                </q-card-section>

                <ArticleList
                  :articles="
                    usersStore.recentArticles.data[
                      firebaseStore.auth.currentUser.uid
                    ]
                  "
                />
              </q-card>
            </div>
            <div>
              <q-card
                class="bg-accent q-py-sm"
                v-if="unpublishedArticles.data.length"
              >
                <q-card-section>
                  <h3 class="flex items-center">
                    <q-icon name="mdi-star-outline" class="q-mr-sm" />
                    <span>New</span>
                  </h3>
                </q-card-section>

                <ArticleList :articles="unpublishedArticles.data" />
              </q-card>
            </div>
            <div>
              <q-card
                class="bg-accent q-py-sm"
                v-if="publishedArticles.data.length"
              >
                <q-card-section>
                  <h3 class="flex items-center">
                    <q-icon name="mdi-check-circle" class="q-mr-sm" />
                    <span>Recently published</span>
                  </h3>
                </q-card-section>

                <ArticleList :articles="publishedArticles.data" />
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
      <q-page-sticky
        position="bottom-right"
        :offset="[12, 12]"
        style="z-index: 10"
      >
        <q-btn
          fab
          icon-right="mdi-plus"
          color="primary"
          unelevated
          class="shadow-5"
          no-caps
          :hide-label="false"
          :to="{ name: 'New' }"
        >
          <span class="q-mr-sm">New article</span>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
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

import AppSwitcher from "components/AppSwitcher.vue";
import ArticleList from "components/ArticleList.vue";

export default {
  name: "IndexPage",
  components: { AppSwitcher, ArticleList },
  data: function () {
    return {
      tab: "my-files",
      unpublishedArticles: {
        data: [],
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      // recentlyEditedArticles: {
      //   data: [],
      //   dataLoaded: false,
      //   error: null,
      //   unsubscribe: null,
      // },
      publishedArticles: {
        data: [],
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
    // this.fetchRecentlyEditedArticles();
    this.fetchPublishedArticles();
  },
  methods: {
    fetchUnpublishedArticles() {
      this.unpublishedArticles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles"),
          where("lastPublishedServerTimestamp", "==", null),
          limit(3)
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
    // fetchRecentlyEditedArticles() {
    //   this.recentlyEditedArticles.unsubscribe = onSnapshot(
    //     query(
    //       collection(db, "articles"),
    //       orderBy("lastUpdatedServerTimestamp", "desc"),
    //       limit(3)
    //     ),
    //     (snapshot) => {
    //       let articles = [];
    //       snapshot.forEach((doc) => {
    //         articles.push(doc.data());
    //       });
    //       this.recentlyEditedArticles.data = articles;
    //       this.recentlyEditedArticles.dataLoaded = true;
    //     },
    //     (error) => {
    //       this.recentlyEditedArticles.error = error;
    //     }
    //   );
    // },
    fetchPublishedArticles() {
      this.publishedArticles.unsubscribe = onSnapshot(
        query(
          collection(db, "articles"),
          orderBy("lastPublishedServerTimestamp", "desc"),
          where("lastPublishedServerTimestamp", "!=", null),
          limit(3)
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
  unmounted() {
    this.unpublishedArticles.unsubscribe();
    // this.recentlyEditedArticles.unsubscribe();
    this.publishedArticles.unsubscribe();
  },
};
</script>
