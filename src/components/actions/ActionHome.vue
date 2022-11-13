<template>
  <q-card class="bg-secondary" dark>
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
            color="accent"
            text-color="black"
            icon="mdi-help-circle"
            href="https://activisthandbook.org/en/support/writers"
            target="_blank"
          />
          <q-btn
            label="Donate"
            href="https://activisthandbook.org/donate"
            target="_blank"
            color="accent"
            text-color="black"
            no-caps
            icon="mdi-heart"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
import { useUsersStore } from "src/stores/users";
export default {
  computed: {
    ...mapStores(useFirebaseStore, useUsersStore),
  },
};
</script>
