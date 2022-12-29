<template>
  <div
    v-if="
      firebaseStore.auth.currentUser &&
      !usersStore.profile.dataLoaded[firebaseStore.auth.currentUser.uid]
    "
    class="fixed-full text-center text-caption text-grey bg-accent"
  >
    <div class="fixed-center">
      <q-spinner color="grey" size="3em" />
      <div class="q-mt-md">Loading...</div>
    </div>
  </div>

  <div v-else>
    <router-view />
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useAnalyticsStore } from "src/stores/analytics";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

export default {
  name: "DefaultLayout",
  computed: {
    ...mapStores(useAnalyticsStore, useUsersStore, useFirebaseStore),
  },
  async created() {
    await this.analyticsStore.fetchAnalytics();
    await this.usersStore.fetchUser(this.firebaseStore.auth.currentUser.uid);
  },
  unmounted() {
    this.usersStore.unsubscribeUser(this.firebaseStore.auth.currentUser.uid);
  },
};
</script>
