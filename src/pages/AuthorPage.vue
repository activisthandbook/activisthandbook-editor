<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <q-icon name="mdi-account-circle" size="24px" />
        <q-toolbar-title>Author</q-toolbar-title>

        <AppSwitcher />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-my-md" v-if="author.data.name">
          <q-card class="bg-accent q-py-sm">
            <q-card-section>
              <div class="q-gutter-y-md">
                <h2>{{ author.data.name }}</h2>
                <div>
                  Everyone can see what contributions you make to Activist
                  Handbook.
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-card class="bg-accent q-py-sm" v-if="recentArticles.data[0]">
            <q-card-section>
              <h2>Recent contributions</h2>
            </q-card-section>
            <ArticleList :articles="recentArticles" />
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import AppSwitcher from "components/AppSwitcher.vue";

export default {
  components: { AppSwitcher },
  data: function () {
    return {
      recentArticles: {
        data: [],
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
};
</script>