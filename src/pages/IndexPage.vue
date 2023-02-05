<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Activist Handbook</q-toolbar-title>
        <q-btn round icon="mdi-magnify" flat @click="searchDialogOpen = true" />
        <SearchDialog v-model="searchDialogOpen" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding style="max-width: 720px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <div class="q-gutter-y-md">
            <q-tabs
              class="bg-grey-3 rounded-borders"
              align="justify"
              active-color="secondary"
            >
              <q-route-tab
                :to="{ params: { homeTab: 'home' } }"
                icon="mdi-home"
                label="Home"
                no-caps
              />
              <q-route-tab
                :to="{ params: { homeTab: 'me' } }"
                icon="mdi-account-heart"
                label="Me"
                no-caps
              />

              <q-route-tab
                :to="{ params: { homeTab: 'tree' } }"
                icon="mdi-file-tree"
                label="Tree"
                no-caps
              />

              <q-route-tab
                :to="{ params: { homeTab: 'new' } }"
                icon="mdi-file-star-outline"
                label="Drafts"
                no-caps
              />
              <q-route-tab
                :to="{ params: { homeTab: 'published' } }"
                icon="mdi-file-check"
                label="Published"
                no-caps
              />

              <!-- <q-route-tab
                :to="{ params: { homeTab: 'import' } }"
                icon="mdi-database-import-outline"
                label="Imported"
                no-caps
              /> -->
            </q-tabs>

            <HomeView v-if="tab === 'home'" />
            <MyArticles v-if="tab === 'me'" />
            <NewArticles v-if="tab === 'new'" />
            <PublishedArticles v-if="tab === 'published'" />
            <TreeArticles v-if="tab === 'tree'" />
            <ImportedArticles v-if="tab === 'import'" />
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

import AppSwitcher from "components/AppSwitcher.vue";

import SearchDialog from "src/dialogs/SearchDialog.vue";

// Subpages
import HomeView from "src/pages/index/HomeView.vue";
import MyArticles from "src/pages/index/MyArticles.vue";
import NewArticles from "src/pages/index/NewArticles.vue";
import PublishedArticles from "src/pages/index/PublishedArticles.vue";
import TreeArticles from "src/pages/index/TreeArticles.vue";
import ImportedArticles from "src/pages/index/ImportedArticles.vue";

export default {
  name: "IndexPage",
  components: {
    AppSwitcher,
    SearchDialog,
    HomeView,
    MyArticles,
    NewArticles,
    PublishedArticles,
    TreeArticles,
    ImportedArticles,
  },
  data() {
    return {
      tab: null,
      searchDialogOpen: false,
    };
  },
  watch: {
    "$route.params.homeTab"() {
      this.tab = this.$route.params.homeTab;
      if (this.tab) {
        sessionStorage.setItem("homeTab", this.tab);
      }
    },
  },
  mounted() {
    if (this.$route.params.homeTab === "home") {
      const previousTab = sessionStorage.getItem("homeTab");
      if (previousTab) {
        this.$router.push({ params: { homeTab: previousTab } });
      }
    }
    this.tab = this.$route.params.homeTab;
    if (this.tab) {
      sessionStorage.setItem("homeTab", this.tab);
    }
  },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
};
</script>
