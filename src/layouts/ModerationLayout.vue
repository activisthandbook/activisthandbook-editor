<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <q-icon name="mdi-shield-star" size="24px" />
        <q-toolbar-title>Moderate</q-toolbar-title>

        <q-btn
          icon="mdi-home"
          round
          flat
          :to="{ name: 'Home' }"
          color="primary"
        />

        <q-btn
          v-if="moderator.dataLoaded && !publishinDisabled"
          color="primary"
          text-color="accent"
          no-caps
          class="q-ml-sm draw-attention draw-attention q-ml-sm"
          @click="publishArticles()"
          :disable="publishinDisabled"
          :icon="publishinDisabled ? 'mdi-check' : 'mdi-arrow-right-circle'"
        >
          <span class="q-ml-sm">
            <span v-if="!publishinDisabled"
              >Publish {{ moderator.data.publishingQueueCount }}
              <span v-if="moderator.data.publishingQueueCount > 1"
                >articles</span
              ><span v-else>article</span></span
            >
            <span v-else>Published</span>
          </span>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <q-card
            v-if="this.showRenderingTime"
            flat
            class="bg-secondary text-accent"
          >
            <q-card-section class="flex items-center">
              <q-spinner size="24px" style="opacity: 0.5" />
              <span class="q-ml-sm">
                Updating website... ({{ this.remainingSeconds }}
                seconds left)
              </span>
            </q-card-section>
          </q-card>
          <router-view />
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
  </q-layout>
</template>
<script>
import { useFirebaseStore } from "stores/firebase";

import { onSnapshot, getFirestore, doc } from "firebase/firestore";
const db = getFirestore();

import { httpsCallable } from "firebase/functions";

export default {
  name: "ModerationLayout",
  setup() {
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      firebaseStore,
    };
  },
  data() {
    return {
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
  computed: {
    publishinDisabled: function () {
      if (this.moderator.data.publishingQueueCount) return false;
      else return true;
    },
  },
  mounted: function () {
    // Fetch app variables
    const moderatorRef = doc(db, "app", "moderator");

    this.moderator.unsubscribe = onSnapshot(
      moderatorRef,
      (docSnapshot) => {
        this.moderator.data = docSnapshot.data();
        this.moderator.dataLoaded = true;
      },
      (error) => {
        this.moderator.error = error;
      }
    );
  },

  methods: {
    publishArticles: function () {
      // this.publishingLoading = true;
      this.$q.loading.show({
        message: "Rendering articles...",
      });
      const publishArticles = httpsCallable(
        this.firebaseStore.functions,
        "publishArticles"
      );
      publishArticles()
        .then((result) => {
          // this.publishingLoading = false;
          this.$q.loading.hide();
          // this.$q.notify("Articles published");
          this.publishedSuccesfullyDialog = true;

          this.remainingSeconds = 52;
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
};
</script>
<style scoped>
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
