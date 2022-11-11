<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Activist Handbook</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page padding style="max-width: 720px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <div class="q-gutter-y-md">
            <q-tabs
              v-model="tab"
              class="bg-grey-3 rounded-borders"
              align="justify"
              active-color="secondary"
            >
              <q-tab
                name="my-files"
                icon="mdi-account-circle"
                label="My files"
                no-caps
              />

              <q-tab
                name="new"
                icon="mdi-star-outline"
                label="New"
                no-caps
                disable
              />
              <q-tab
                name="published"
                icon="mdi-check-circle-outline"
                label="Published"
                no-caps
                disable
              />
              <q-tab
                name="tree"
                icon="mdi-file-tree"
                label="Tree"
                no-caps
                disable
              />
              <q-tab
                name="import"
                icon="mdi-database-import-outline"
                label="Imported"
                no-caps
                disable
              />
            </q-tabs>

            <q-card
              class="bg-accent q-py-sm"
              v-if="
                usersStore.recentArticles.dataLoaded[
                  firebaseStore.auth.currentUser.uid
                ]
              "
            >
              <q-list>
                <q-item class="q-py-md bg-grey-1 q-mb-sm">
                  <q-item-section avatar>
                    <q-icon name="mdi-file-document-edit-outline" size="32px" />
                  </q-item-section>
                  <q-item-section class="text-h5">
                    My recent edits
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      round
                      flat
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
              <!-- <q-card-section>
                <h3 class="flex items-center">
                  <q-icon
                    name="mdi-file-document-edit-outline"
                    class="q-mr-sm"
                  />
                  <span>My recent edits</span>
                </h3>
              </q-card-section> -->
              <ArticleList
                v-if="
                  usersStore.recentArticles.data[
                    firebaseStore.auth.currentUser.uid
                  ]
                "
                :articles="
                  usersStore.recentArticles.data[
                    firebaseStore.auth.currentUser.uid
                  ]
                "
              />
              <q-card-section v-else>
                No articles found. Start editing and they will appear here!
              </q-card-section>
            </q-card>
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
                          usersStore.profile.data[
                            firebaseStore.auth.currentUser.uid
                          ].firstName
                        }} </span
                      >.</strong
                    >
                    Our team trains 4000 activists every month. And we couldn't
                    do it without you.
                  </div>
                  <div>
                    Need help getting started? Our team of volunteers is happy
                    to assist.
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
          </div>
        </div>
      </q-page>
      <q-page-sticky
        position="bottom-right"
        :offset="[12, 12]"
        style="z-index: 10"
      >
        <q-btn
          fab
          icon-right="mdi-plus"
          color="primary"
          unelevated
          class="shadow-5"
          no-caps
          :hide-label="false"
          :to="{ name: 'New' }"
        >
          <span class="q-mr-sm">New article</span>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";

import AppSwitcher from "components/AppSwitcher.vue";
import ArticleList from "components/ArticleList.vue";

export default {
  name: "IndexPage",
  components: { AppSwitcher, ArticleList },
  data() {
    return {
      tab: "my-files",
    };
  },
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
