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
          <div class="q-gutter-y-md">
            <q-tabs
              v-model="tab"
              class="bg-grey-3 rounded-borders"
              align="justify"
              active-color="secondary"
            >
              <q-tab name="me" icon="mdi-account-circle" label="Me" no-caps />

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

// Subpages
import MyArticles from "src/pages/index/MyArticles.vue";
import NewArticles from "src/pages/index/NewArticles.vue";
import PublishedArticles from "src/pages/index/PublishedArticles.vue";
import TreeArticles from "src/pages/index/TreeArticles.vue";
import ImportedArticles from "src/pages/index/ImportedArticles.vue";

export default {
  name: "IndexPage",
  components: {
    AppSwitcher,
    MyArticles,
    NewArticles,
    PublishedArticles,
    TreeArticles,
    ImportedArticles,
  },
  data() {
    return {
      tab: "me",
    };
  },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
};
</script>
