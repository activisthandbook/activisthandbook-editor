<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Account</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div
          class="q-gutter-y-md q-my-md"
          v-if="
            usersStore.profile.dataLoaded[firebaseStore.auth.currentUser.uid]
          "
        >
          <q-card class="bg-accent q-py-sm">
            <q-card-section>
              <div class="q-gutter-y-md">
                <h2>Public profile</h2>
                <div>
                  Everyone can see what contributions you make to Activist
                  Handbook. If you want to stay anonymous, use a nickname.
                </div>
                <q-input
                  label="First name or nickname"
                  outlined
                  color="secondary"
                  autocomplete="given-name"
                  v-model="
                    usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                      .firstName
                  "
                  @blur="
                    usersStore.saveUser(
                      firebaseStore.auth.currentUser.uid,
                      firebaseStore.auth.currentUser.uid
                    )
                  "
                />
                <q-input
                  label="Last name (optional)"
                  outlined
                  color="secondary"
                  autocomplete="family-name"
                  v-model="
                    usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                      .lastName
                  "
                  @blur="
                    usersStore.saveUser(
                      firebaseStore.auth.currentUser.uid,
                      firebaseStore.auth.currentUser.uid
                    )
                  "
                />
                <q-btn
                  label="View my profile"
                  :to="{
                    name: 'Author',
                    params: { authorID: firebaseStore.auth.currentUser.uid },
                  }"
                  no-caps
                  color="secondary"
                />
              </div>
            </q-card-section>
          </q-card>
          <q-card class="bg-accent q-py-sm">
            <q-card-section>
              <div class="q-gutter-y-md">
                <h2>My account</h2>
                <q-input
                  label="Email address"
                  outlined
                  color="secondary"
                  autocomplete="given-name"
                  v-model="firebaseStore.auth.currentUser.email"
                  disable
                  hint="Editing your email is not possible"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

import AppSwitcher from "components/AppSwitcher.vue";

export default {
  components: { AppSwitcher },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
};
</script>
