<template>
  <div
    class="row q-col-gutter-sm"
    v-if="analyticsStore.dataLoaded && analyticsStore.data"
  >
    <div class="col-sm-4 col-xs-6">
      <q-card
        class="bg-secondary cursor-pointer"
        dark
        v-ripple
        @click="$router.push({ params: { homeTab: 'me' } })"
      >
        <q-card-section>
          <div class="text-caption">Your contributions</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-account-heart" class="q-mr-sm" />
            <span
              v-if="
                usersStore.profile.dataLoaded[
                  firebaseStore.auth.currentUser.uid
                ]
              "
            >
              {{
                usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                  .editCount || 0
              }}
            </span>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div
      class="col-sm-4 col-xs-6"
      v-if="analyticsStore.data.articles_draft_count"
    >
      <q-card
        class="bg-secondary cursor-pointer"
        dark
        v-ripple
        @click="$router.push({ params: { homeTab: 'new' } })"
      >
        <q-card-section>
          <div class="text-caption">New drafts</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-file-star-outline" class="q-mr-sm" />
            <span v-if="analyticsStore.data.articles_published_count">
              {{
                analyticsStore.data.articles_draft_count -
                analyticsStore.data.articles_published_count
              }}
            </span>
            <span v-else>
              {{ analyticsStore.data.articles_draft_count }}
            </span>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-sm-4 col-xs-6">
      <q-card
        class="bg-secondary cursor-pointer"
        dark
        v-ripple
        @click="$router.push({ params: { homeTab: 'published' } })"
      >
        <q-card-section>
          <div class="text-caption">Published articles</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-file-check" class="q-mr-sm" />
            {{ analyticsStore.data.articles_published_count || 0 }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div
      class="col-sm-4 col-xs-6"
      v-if="analyticsStore.data.articles_draft_count"
    >
      <q-card
        class="bg-secondary cursor-pointer"
        dark
        v-ripple
        @click="$router.push({ name: 'Translate' })"
      >
        <q-card-section>
          <div class="text-caption">Languages per guide</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-translate" class="q-mr-sm" />
            {{
              Math.round(
                (analyticsStore.data.articles_draft_count /
                  analyticsStore.data.languageCollections_count) *
                  100
              ) / 100 || 0
            }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-sm-4 col-xs-6">
      <q-card
        class="bg-secondary cursor-pointer"
        dark
        v-ripple
        @click="$router.push({ name: 'Authors' })"
      >
        <q-card-section>
          <div class="text-caption">Authors</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-account-group" class="q-mr-sm" />
            {{ analyticsStore.data.users_profile_count || 0 }}
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-sm-4 col-xs-6">
      <q-card class="bg-secondary cursor-pointer" dark v-ripple>
        <q-card-section>
          <div class="text-caption">Monthly readers</div>
          <div class="text-h2 flex">
            <q-icon name="mdi-google-analytics" class="q-mr-sm" />
            6K
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useAnalyticsStore } from "src/stores/analytics";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";
export default {
  computed: {
    ...mapStores(useAnalyticsStore, useUsersStore, useFirebaseStore),
  },
};
</script>
