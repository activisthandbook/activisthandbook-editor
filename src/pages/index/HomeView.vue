<template>
  <AnalyticsDashboard />

  <q-card class="bg-accent" bordered flat>
    <q-card-section>
      <div class="q-gutter-y-md">
        <div>
          <strong
            >Thank you for making Activist Handbook better<span
              v-if="
                usersStore.profile.dataLoaded[
                  firebaseStore.auth.currentUser.uid
                ]
              "
              >,
              {{
                usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                  .firstName
              }} </span
            >.</strong
          >
          Our team trains 4000 activists every month. And we couldn't do it
          without you.
        </div>
        <div>
          Need help getting started? Our team of volunteers is happy to assist.
        </div>
        <div class="q-gutter-sm">
          <q-btn
            label="Support page"
            no-caps
            color="secondary"
            icon="mdi-help-circle"
            href="https://activisthandbook.org/en/support/writers"
            target="_blank"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
// import ActionHome from "src/components/actions/ActionHome.vue";
import AnalyticsDashboard from "./AnalyticsDashboard.vue";

import { mapStores } from "pinia";

import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

export default {
  components: {
    AnalyticsDashboard,
    // ActionHome,
  },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
};
</script>
