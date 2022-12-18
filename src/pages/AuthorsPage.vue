<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Authors</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div
          v-if="!topAuthors.dataLoaded || !newAuthors.dataLoaded"
          class="fixed-center text-center text-caption text-grey"
        >
          <q-spinner color="grey" size="3em" />
          <div class="q-mt-md">Loading...</div>
        </div>
        <div class="q-gutter-y-md q-my-md" v-else>
          <q-card class="bg-secondary" dark>
            <q-card-section>
              <div class="q-mb-sm">
                <strong
                  >These awesome people all helped make Activist Handbook
                  better.</strong
                >
                Most of them work as volunteers. Say thank you and support our
                by making a small donation:
              </div>
              <q-btn
                label="Make small donation"
                href="https://activisthandbook.org/donate"
                target="_blank"
                color="accent"
                text-color="black"
                no-caps
                icon="mdi-heart"
              />
            </q-card-section>
          </q-card>
          <q-card class="bg-accent q-py-sm">
            <!-- <q-list>
              <q-item class="q-py-md bg-grey-1 q-mb-sm">
                <q-item-section avatar>
                  <q-icon name="mdi-heart" size="32px" />
                </q-item-section>
                <q-item-section class="text-h5">
                  Top contributors
                </q-item-section>
              </q-item>
            </q-list> -->
            <q-card-section>
              <h3>Top contributors</h3>
            </q-card-section>

            <AuthorList :authors="topAuthors.data" />
          </q-card>
          <q-card class="bg-accent q-py-sm">
            <!-- <q-list>
              <q-item class="q-py-md bg-grey-1 q-mb-sm">
                <q-item-section avatar>
                  <q-icon name="mdi-star" size="32px" />
                </q-item-section>
                <q-item-section class="text-h5"> New editors </q-item-section>
              </q-item>
            </q-list> -->

            <q-card-section>
              <h3>New editors</h3>
            </q-card-section>

            <AuthorList :authors="newAuthors.data" />
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import AppSwitcher from "components/AppSwitcher.vue";
import AuthorList from "components/AuthorList.vue";
import {
  query,
  collection,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
} from "firebase/firestore";
const db = getFirestore();

export default {
  components: { AppSwitcher, AuthorList },
  data: function () {
    return {
      topAuthors: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      newAuthors: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  async created() {
    await this.fetchTopAuthors();
    await this.fetchNewAuthors();
  },
  unmounted() {
    this.topAuthors.unsubscribe();
    this.newAuthors.unsubscribe();
  },
  methods: {
    async fetchTopAuthors() {
      return new Promise(async (resolve, reject) => {
        this.topAuthors.unsubscribe = onSnapshot(
          query(
            collection(db, "userProfiles"),
            orderBy("editCount", "desc"),
            limit(5)
          ),
          (snapshot) => {
            let authors = [];
            snapshot.forEach((doc) => {
              authors.push({ ...doc.data(), id: doc.id });
            });
            this.topAuthors.data = authors;
            this.topAuthors.dataLoaded = true;
            resolve();
          },
          (error) => {
            this.topAuthors.error = error;
            reject(error);
          }
        );
      });
    },
    async fetchNewAuthors() {
      return new Promise(async (resolve, reject) => {
        this.newAuthors.unsubscribe = onSnapshot(
          query(
            collection(db, "userProfiles"),
            orderBy("metadata.createdTimestamp", "desc"),
            limit(5)
          ),
          (snapshot) => {
            let authors = [];
            snapshot.forEach((doc) => {
              authors.push({ ...doc.data(), id: doc.id });
            });
            this.newAuthors.data = authors;
            this.newAuthors.dataLoaded = true;
            resolve();
          },
          (error) => {
            this.newAuthors.error = error;
            reject(error);
          }
        );
      });
    },
  },
};
</script>
