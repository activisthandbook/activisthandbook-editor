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

            <!-- PUBLISHING QUEUE -->
            <PublishingQueue
              v-if="
                !this.showRenderingTime &&
                analyticsStore.dataLoaded &&
                (analyticsStore.data.articlePublishingQueueCount ||
                  analyticsStore.data.menuInPublishingQueue)
              "
              @published="publishedSuccesfullyDialog = true"
            />
            <q-tabs class="bg-grey-3 rounded-borders" align="justify">
              <q-route-tab
                icon="mdi-file-document-edit"
                label="Articles"
                no-caps
                :to="{ params: { tab: 'articles' } }"
              >
                <!-- <q-badge
                  floating
                  color="secondary"
                  rounded
                  v-if="articles.dataLoaded && articles.data[0]"
                >
                  {{ articles.data.length
                  }}<span v-if="articles.data.length === 10">+</span>
                </q-badge> -->
              </q-route-tab>
              <q-route-tab
                icon="mdi-folder-text"
                label="Menu"
                no-caps
                :to="{ params: { tab: 'menu' } }"
              >
                <!-- <q-badge
                  floating
                  color="secondary"
                  rounded
                  v-if="menu.dataLoaded && menu.data.requestedPublication"
                >
                  1
                </q-badge> -->
              </q-route-tab>
            </q-tabs>

            <div style="min-height: 256px">
              <ReviewArticles v-if="$route.params.tab === 'articles'" />
              <ReviewMenu v-if="$route.params.tab === 'menu'" />
            </div>

            <!-- <q-separator class="q-my-xl" />

          <q-card flat class="q-mt-xl bg-grey-2">
            <q-card-section class="text-center">
              <q-icon name="mdi-alert" size="64px" color="grey" />
              <div class="text-bold">Danger zone</div>
              <div>
                Warning! The buttons below are dangerous. Proceed with caution.
              </div>
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
          </q-card> -->
          </div>
        </q-page>
      </q-page-container>

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
                :to="{ name: 'Home', params: { tab: 'me' } }"
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
    </div>
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
import RenderingTime from "src/pages/review/RenderingTime.vue";
import PublishingQueue from "src/pages/review/PublishingQueue.vue";
import ReviewArticles from "src/pages/review/ReviewArticles.vue";
import ReviewMenu from "src/pages/review/ReviewMenu.vue";

export default {
  name: "ModerationPage",
  components: {
    // ModerationItem,
    AppSwitcher,
    // MenuPreview,
    MissingPermissions,
    RenderingTime,
    PublishingQueue,
    ReviewArticles,
    ReviewMenu,
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
  // created() {
  //   // watch the params of the route to fetch the data again
  //   this.$watch(
  //     () => this.$route.params,
  //     async (toParams, previousParams) => {
  //       if (
  //         !previousParams ||
  //         toParams.articleID !== previousParams.articleID
  //       ) {
  //       }
  //     },
  //     // fetch the data when the view is created and the data is
  //     // already being observed
  //     { immediate: true }
  //   );
  // },
};
</script>
<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
