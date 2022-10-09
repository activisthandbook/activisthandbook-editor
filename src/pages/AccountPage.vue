<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <q-icon name="mdi-account-circle" size="24px" />
        <q-toolbar-title>Account</q-toolbar-title>

        <AppSwitcher />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div
          class="q-gutter-y-md q-my-md"
          v-if="usersStore.dataLoaded[firebaseStore.auth.currentUser.uid]"
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
                    usersStore.data[firebaseStore.auth.currentUser.uid]
                      .firstName
                  "
                  @blur="
                    usersStore.saveUser(firebaseStore.auth.currentUser.uid)
                  "
                />
                <q-input
                  label="Last name (optional)"
                  outlined
                  color="secondary"
                  autocomplete="family-name"
                  v-model="
                    usersStore.data[firebaseStore.auth.currentUser.uid].lastName
                  "
                  @blur="
                    usersStore.saveUser(firebaseStore.auth.currentUser.uid)
                  "
                />
              </div>
            </q-card-section>
          </q-card>
          <q-card class="bg-accent q-py-sm" v-if="recentArticles.data[0]">
            <q-card-section>
              <h2>My recent edits</h2>
            </q-card-section>
            <ArticleList :articles="recentArticles" />
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
const db = getFirestore();

import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

import AppSwitcher from "components/AppSwitcher.vue";
import ArticleList from "components/ArticleList.vue";

export default {
  components: { AppSwitcher, ArticleList },
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
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
  async created() {
    await this.usersStore
      .fetchUser(this.firebaseStore.auth.currentUser.uid)
      .then(() => {
        console.log(
          this.usersStore.data[this.firebaseStore.auth.currentUser.uid]
        );
      });
  },
  watch: {
    "usersStore.dataLoaded": {
      handler(isLoaded) {
        if (
          isLoaded[this.firebaseStore.auth.currentUser.uid] &&
          this.usersStore.data[this.firebaseStore.auth.currentUser.uid]
            .recentlyEditedArticles
        ) {
          // console.log(
          //   this.usersStore.data[this.firebaseStore.auth.currentUser.uid]
          // );
          this.usersStore.data[
            this.firebaseStore.auth.currentUser.uid
          ].recentlyEditedArticles
            .slice()
            .reverse()
            .forEach((articleID) => {
              this.recentArticles.unsubscribe = onSnapshot(
                doc(db, "articles", articleID),
                (doc) => {
                  this.recentArticles.data.push(doc.data());
                }
              );
            });

          this.recentArticles.dataLoaded = true;
        }
      },
      deep: true,
    },
  },
  unmounted() {
    this.usersStore.unsubscribeUser(this.firebaseStore.auth.currentUser.uid);
  },
};
</script>
