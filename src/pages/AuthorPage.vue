<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Author</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div
          v-if="!usersStore.profile.dataLoaded[$route.params.authorID]"
          class="fixed-center text-center text-caption text-grey"
        >
          <q-spinner color="grey" size="3em" />
          <div class="q-mt-md">Loading...</div>
        </div>
        <div class="q-gutter-y-md q-my-md" v-else>
          <q-card class="bg-accent q-py-sm">
            <q-card-section>
              <div class="q-gutter-y-md">
                <h2>
                  {{
                    usersStore.profile.data[$route.params.authorID].firstName
                  }}
                  {{ usersStore.profile.data[$route.params.authorID].lastName }}
                </h2>

                <q-chip color="primary" dark icon="mdi-file-document-edit">
                  <span class="q-mr-xs text-bold">{{
                    usersStore.profile.data[$route.params.authorID].editCount
                  }}</span>
                  <span
                    v-if="
                      usersStore.profile.data[$route.params.authorID]
                        .editCount > 1
                    "
                    >edits</span
                  >
                  <span v-else>edit</span>
                </q-chip>

                <RoleChips
                  :roles="usersStore.profile.data[$route.params.authorID].roles"
                />
              </div>
            </q-card-section>
            <q-list padding>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mdi-calendar" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption> Last contribution </q-item-label>
                  <q-item-label
                    v-if="
                      usersStore.profile.data[$route.params.authorID].metadata
                        .updatedTimestamp
                    "
                  >
                    {{
                      mixin_humanDate(
                        usersStore.profile.data[$route.params.authorID].metadata
                          .createdTimestamp
                      )
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mdi-star-outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption> Active since </q-item-label>
                  <q-item-label
                    v-if="
                      usersStore.profile.data[$route.params.authorID].metadata
                        .createdTimestamp
                    "
                  >
                    {{
                      mixin_humanDate(
                        usersStore.profile.data[$route.params.authorID].metadata
                          .createdTimestamp
                      )
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section
              v-if="
                $route.params.authorID === firebaseStore.auth.currentUser.uid
              "
            >
              <q-btn
                label="Edit my profile"
                :to="{ name: 'Account' }"
                color="secondary"
                no-caps
                icon="mdi-pencil"
              />
            </q-card-section>
          </q-card>
          <q-card
            class="bg-accent q-py-sm"
            v-if="usersStore.recentArticles.dataLoaded[$route.params.authorID]"
          >
            <q-list>
              <q-item class="q-py-md bg-grey-1 q-mb-sm">
                <q-item-section avatar>
                  <q-icon name="mdi-file-document-edit-outline" size="32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h5">Recent edits</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    round
                    flat
                    icon="mdi-reload"
                    @click="
                      usersStore.fetchRecentArticles($route.params.authorID)
                    "
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <ArticleList
              :articles="usersStore.recentArticles.data[$route.params.authorID]"
            />
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

import RoleChips from "components/RoleChips.vue";
import AppSwitcher from "components/AppSwitcher.vue";
import ArticleList from "components/ArticleList.vue";

export default {
  components: { AppSwitcher, RoleChips, ArticleList },
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
  async created() {
    await this.usersStore
      .fetchUser(this.$route.params.authorID)
      .then(async () => {
        await this.usersStore.fetchRecentArticles(this.$route.params.authorID);
      });
  },
  unmounted() {
    if (
      this.$route.params.authorID !== this.firebaseStore.auth.currentUser.uid
    ) {
      this.usersStore.unsubscribeUser();
    }
  },
};
</script>
