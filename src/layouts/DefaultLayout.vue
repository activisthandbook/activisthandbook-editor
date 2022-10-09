<template>
  <router-view />
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
