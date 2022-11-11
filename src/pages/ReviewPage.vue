<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Review</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <MissingPermissions
      v-if="
        !usersStore.profile.data[
          firebaseStore.auth.currentUser.uid
        ].roles?.includes('moderator')
      "
    />
    <div v-else>
      <q-page-container>
        <q-page padding style="max-width: 700px; margin: auto">
          <div class="q-gutter-y-md q-mt-md q-mb-xl">
            <!-- ⌛️ RENDERING TIME -->
            <q-card
              v-if="showRenderingTime"
              flat
              class="bg-secondary text-accent"
            >
              <q-card-section>
                <div class="flex items-center q-gutter-md">
                  <q-spinner size="24px" style="opacity: 0.5" class="q-mr-sm" />
                  <div class="q-ml-sm text-bold">
                    <div>
                      Updating website... ({{ this.remainingSeconds }} seconds
                      left)
                    </div>
                    <div class="text-caption">
                      Sending the update to servers in 100+ countries
                    </div>
                  </div>
                  <q-space />
                  <q-btn
                    label="View changes"
                    href="https://github.com/activisthandbook/activisthandbook/commits/main"
                    target="_blank"
                    no-caps
                    flat
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- PUBLISHING QUEUE -->
            <q-card
              v-if="
                !this.showRenderingTime &&
                analyticsStore.dataLoaded &&
                (analyticsStore.data.articlePublishingQueueCount ||
                  analyticsStore.data.menuInPublishingQueue)
              "
              class="bg-primary text-accent q-mb-lg"
              dark
            >
              <q-card-section>
                <div class="flex justify-between items-center q-gutter-sm">
                  <div>
                    <strong v-if="analyticsStore.data.menuInPublishingQueue"
                      >Menu</strong
                    >
                    <span
                      v-if="
                        analyticsStore.data.articlePublishingQueueCount &&
                        analyticsStore.data.menuInPublishingQueue
                      "
                    >
                      and
                    </span>
                    <strong
                      v-if="analyticsStore.data.articlePublishingQueueCount"
                    >
                      <strong>
                        {{ analyticsStore.data.articlePublishingQueueCount }}
                      </strong>
                      <span
                        v-if="
                          analyticsStore.data.articlePublishingQueueCount > 1
                        "
                      >
                        articles</span
                      >
                      <span v-else> article</span>
                    </strong>
                    waiting to be updated.
                  </div>
                  <q-btn
                    color="accent"
                    text-color="black"
                    no-caps
                    class="q-ml-sm q-ml-sm"
                    :class="{
                      'draw-attention':
                        analyticsStore.dataLoaded &&
                        analyticsStore.data.articlePublishingQueueCount > 0,
                    }"
                    @click="publishArticles()"
                    icon="mdi-check-all"
                    label="Update website"
                  />
                </div>
              </q-card-section>
            </q-card>

            <q-tabs
              v-model="tab"
              class="bg-grey-3 rounded-borders"
              align="justify"
            >
              <q-tab
                name="review"
                icon="mdi-file-document-edit"
                label="Articles"
                no-caps
              >
                <q-badge
                  floating
                  color="secondary"
                  rounded
                  v-if="articles.dataLoaded && articles.data[0]"
                >
                  {{ articles.data.length
                  }}<span v-if="articles.data.length === 10">+</span>
                </q-badge>
              </q-tab>
              <q-tab name="menu" icon="mdi-folder-text" label="Menu" no-caps>
                <q-badge
                  floating
                  color="secondary"
                  rounded
                  v-if="menu.dataLoaded && menu.data.requestedPublication"
                >
                  1
                </q-badge>
              </q-tab>
            </q-tabs>

            <div style="min-height: 256px">
              <!-- REVIEW -->
              <div
                v-if="articles.dataLoaded && tab === 'review'"
                class="q-gutter-y-md q-my-md"
              >
                <q-card v-if="!articles.data[0]" class="bg-accent">
                  <q-card-section>No new edits.</q-card-section>
                </q-card>

                <!-- <transition-group
                name="list"
                class="q-gutter-y-md q-my-md"
                tag="div"
              > -->
                <ModerationItem
                  v-for="article in articles.data"
                  :liveDraftArticle="article"
                  :key="article.id"
                  :quickReview="quickReview"
                />
                <!-- </transition-group> -->
              </div>

              <!-- MENU -->
              <div v-if="menu.dataLoaded && tab === 'menu'">
                <MenuPreview :liveDraftMenu="menu.data" />
              </div>
            </div>

            <!-- <q-separator class="q-my-xl" />

          <q-card flat class="q-mt-xl bg-grey-2">
            <q-card-section class="text-center">
              <q-icon name="mdi-alert" size="64px" color="grey" />
              <div class="text-bold">Danger zone</div>
              <div>
                Warning! The buttons below are dangerous. Proceed with caution.
              </div>
              <div class="q-gutter-sm q-mt-sm">
                <q-btn
                  label="Accept all changes"
                  icon="mdi-check-all"
                  no-caps
                  outline
                  disable
                />
                <q-btn
                  label="Revert all changes"
                  icon="mdi-delete"
                  no-caps
                  outline
                  disable
                />
              </div>
            </q-card-section>
          </q-card> -->
          </div>
        </q-page>
      </q-page-container>

      <!-- DIALOGS -->
      <q-dialog flat v-model="this.publishedSuccesfullyDialog">
        <q-card class="text-center bg-accent">
          <q-card-section class="q-pa-xl">
            <div>
              <q-icon name="mdi-check-bold" size="64px" color="primary" />
            </div>
            <h2 class="q-mt-md q-mb-sm">Awesome, they're published!</h2>
            <div>It might take a few minutes for the website to update.</div>
            <div class="q-mt-md q-gutter-sm">
              <q-btn
                label="Home"
                no-caps
                color="secondary"
                icon="mdi-home"
                :to="{ name: 'Home' }"
                outline
              />
              <q-btn
                label="Continue moderating"
                no-caps
                color="secondary"
                @click="publishedSuccesfullyDialog = false"
                autofocus
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-layout>
</template>
<script>
import AppSwitcher from "src/components/AppSwitcher.vue";
import MenuPreview from "src/components/moderate/MenuPreview.vue";
import MissingPermissions from "src/components/MissingPermissions.vue";

import { mapStores } from "pinia";

import ModerationItem from "src/components/moderate/ModerationItem.vue";

import { useFirebaseStore } from "stores/firebase";
import { useAnalyticsStore } from "stores/analytics";

import {
  collection,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
const db = getFirestore();

import { httpsCallable } from "firebase/functions";
import { useUsersStore } from "src/stores/users";

export default {
  name: "ModerationPage",
  components: { ModerationItem, AppSwitcher, MenuPreview, MissingPermissions },
  computed: {
    ...mapStores(useFirebaseStore, useAnalyticsStore, useUsersStore),
  },
  data() {
    return {
      tab: "review",
      version: 3,
      quickReview: false,

      articles: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      menu: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },

      publishedSuccesfullyDialog: false,
      showRenderingTime: false,
      remainingSeconds: null,
      moderator: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  created: function () {
    // Fetch articles
    this.fetchArticles();
    this.fetchMenu();
  },
  unmounted() {
    this.articles.unsubscribe();
    this.menu.unsubscribe();
  },
  methods: {
    async fetchArticles() {
      const q = query(
        collection(db, "articles"),
        where("requestedPublication", "==", true),
        orderBy("requestedPublicationTimestamp", "asc"),
        limit(10)
      );
      this.articles.unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const articles = [];
        querySnapshot.forEach((doc) => {
          articles.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        this.articles.data = articles;
        this.articles.dataLoaded = true;
      });
    },
    async fetchMenu() {
      // To-do: compare differences in menu: https://davidwells.io/snippets/get-difference-between-two-objects-javascript
      this.menu.unsubscribe = onSnapshot(
        doc(db, "menu", "draft"),
        (doc) => {
          if (doc.exists()) {
            this.menu.data = doc.data();
            this.menu.dataLoaded = true;
          } else {
            this.$q.notify("Could not load menu");
          }
        },
        (error) => {
          this.$q.notify("Could not load menu");
          console.error(error);
        }
      );
    },
    async publishArticles() {
      // this.publishingLoading = true;
      this.$q.loading.show({
        message: "Rendering articles...",
      });
      const publishArticles = httpsCallable(
        this.firebaseStore.functions,
        "publishArticles"
      );
      await publishArticles()
        .then((result) => {
          // this.publishingLoading = false;
          this.$q.loading.hide();
          // this.$q.notify("Articles published");
          this.publishedSuccesfullyDialog = true;

          this.remainingSeconds = 62;
          this.showRenderingTime = true;
          const renderingTime = this.remainingSeconds * 1000;

          const timer = setInterval(() => {
            this.remainingSeconds = this.remainingSeconds - 1;
          }, 1000);

          setTimeout(() => {
            this.showRenderingTime = false;
            clearInterval(timer);
            this.$q.notify({
              icon: "mdi-check",
              message: "Website published",
              color: "black",
              textColor: "accent",
              timeout: 7000,
              actions: [
                {
                  label: "View",
                  color: "accent",
                  noCaps: true,
                  handler: () => {
                    window
                      .open("https://activisthandbook.org", "_blank")
                      .focus();
                  },
                },
              ],
            });
          }, renderingTime);
        })
        .catch((error) => {
          // this.publishingLoading = false;
          this.$q.loading.hide();
          this.$q.notify("Publishing articles failed");
          console.log(error);
        });
    },
  },
  unmounted() {
    this.articles.unsubscribe();
    // this.moderator.unsubscribe();
  },
};
</script>
<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* The element to apply the animation to */
.draw-attention {
  animation-name: draw-attention;
  animation-duration: 6s;
  animation-iteration-count: infinite;
}
@keyframes draw-attention {
  0% {
    transform: scale(1);
  }
  42% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  55% {
    transform: scale(1.01);
  }
  58% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
