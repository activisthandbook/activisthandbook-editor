<template>
  <q-card
    class="bg-accent q-py-sm"
    v-if="
      usersStore.recentArticles.dataLoaded[firebaseStore.auth.currentUser.uid]
    "
  >
    <q-list>
      <q-item class="q-py-md bg-grey-1 q-mb-sm">
        <q-item-section avatar>
          <q-icon name="mdi-account-circle-outline" size="32px" />
        </q-item-section>
        <q-item-section class="text-h5"> Recently edited </q-item-section>
        <q-item-section side>
          <q-btn
            round
            flat
            dense
            icon="mdi-reload"
            @click="
              usersStore.fetchRecentArticles(
                this.firebaseStore.auth.currentUser.uid
              )
            "
          />
        </q-item-section>
      </q-item>
    </q-list>
    <ArticleList
      v-if="
        usersStore.recentArticles.data[firebaseStore.auth.currentUser.uid][0]
      "
      :articles="
        usersStore.recentArticles.data[firebaseStore.auth.currentUser.uid]
      "
    />
    <q-card-section v-else>
      No articles found. Start editing and they will appear here!
    </q-card-section>
  </q-card>
  <ActionHome
    v-if="
      usersStore.recentArticles.dataLoaded[firebaseStore.auth.currentUser.uid]
    "
  />
</template>
<script>
import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

import ArticleList from "src/components/ArticleList.vue";
import ActionHome from "src/components/actions/ActionHome.vue";

export default {
  components: { ArticleList, ActionHome },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
  created() {
    this.usersStore.fetchRecentArticles(
      this.firebaseStore.auth.currentUser.uid
    );
  },
  unmounted() {
    this.usersStore.destroyRecentArticles(
      this.firebaseStore.auth.currentUser.uid
    );
  },
};
</script>
