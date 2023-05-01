<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Review</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <MissingPermissions
      v-if="
        !usersStore.profile.data[
          firebaseStore.auth.currentUser.uid
        ].roles?.includes('moderator')
      "
    />
    <div v-else>
      <q-page-container>
        <q-page padding style="max-width: 700px; margin: auto">
          <div class="q-gutter-y-md q-mt-md q-mb-xl">
            <!-- ⌛️ RENDERING TIME -->
            <RenderingTime v-if="showRenderingTime" />
            <RenderingTime />

            <!-- PUBLISHING QUEUE -->
            <PublishingQueue
              v-if="
                !this.showRenderingTime &&
                analyticsStore.dataLoaded &&
                (analyticsStore.data.articles_inQueue_count ||
                  analyticsStore.data.menuInPublishingQueue)
              "
              @published="published()"
            />

            <CompareArticleList />
          </div>
        </q-page>
      </q-page-container>
    </div>

    <!-- DIALOGS -->
    <q-dialog flat v-model="publishedSuccesfullyDialog">
      <q-card class="text-center bg-accent">
        <q-card-section class="q-pa-xl">
          <div>
            <q-icon name="mdi-check-bold" size="64px" color="primary" />
          </div>
          <h2 class="q-mt-md q-mb-sm">Awesome, they're published!</h2>
          <div>It might take a few minutes for the website to update.</div>
          <div class="q-mt-md q-gutter-sm">
            <q-btn
              label="Home"
              no-caps
              color="secondary"
              icon="mdi-home"
              :to="{ name: 'Home', params: { homeTab: 'home' } }"
              outline
            />
            <q-btn
              label="Continue moderating"
              no-caps
              color="secondary"
              @click="publishedSuccesfullyDialog = false"
              autofocus
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script>
// PINIA
import { mapStores } from "pinia";
import { useFirebaseStore } from "stores/firebase";
import { useAnalyticsStore } from "stores/analytics";
import { useUsersStore } from "src/stores/users";

// COMPONENTS
import AppSwitcher from "src/components/AppSwitcher.vue";
import MissingPermissions from "src/components/MissingPermissions.vue";
import CompareArticleList from "src/pages/review/CompareArticleList.vue";
import RenderingTime from "src/pages/review/RenderingTime.vue";
import PublishingQueue from "src/pages/review/PublishingQueue.vue";

export default {
  name: "ModerationPage",
  components: {
    AppSwitcher,
    MissingPermissions,
    CompareArticleList,
    RenderingTime,
    PublishingQueue,
  },
  computed: {
    ...mapStores(useFirebaseStore, useAnalyticsStore, useUsersStore),
  },
  data() {
    return {
      // tab: "review",
      publishedSuccesfullyDialog: false,
      showRenderingTime: false,
    };
  },
  methods: {
    published() {
      this.publishedSuccesfullyDialog = true;
      this.showRenderingTime = true;
      const renderingTime = 70 * 1000;

      setTimeout(() => {
        this.showRenderingTime = false;
        this.$q.notify({
          icon: "mdi-check",
          message: "Website published",
          color: "black",
          textColor: "accent",
          timeout: 7000,
          actions: [
            {
              label: "View",
              color: "accent",
              noCaps: true,
              handler: () => {
                window.open("https://activisthandbook.org", "_blank").focus();
              },
            },
          ],
        });
      }, renderingTime);
    },
  },
};
</script>
