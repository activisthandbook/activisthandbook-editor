<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-primary text-white" bordered>
      <q-toolbar class="flex">
        <q-icon name="mdi-shield-star" size="24px" />
        <q-toolbar-title>Moderate</q-toolbar-title>

        <q-btn
          v-if="moderator.dataLoaded && !publishinDisabled"
          color="white"
          text-color="black"
          no-caps
          class="q-ml-sm draw-attention draw-attention"
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

        <!-- <q-btn
          v-if="moderator.dataLoaded && !publishinDisabled"
          color="white"
          text-color="black"
          no-caps
          icon="mdi-check"
          @click="publishArticles()"
          :loading="publishingLoading"
        >
          <span class="q-ml-sm">
            Publish {{ moderator.data.publishingQueueCount }} articles
          </span>
        </q-btn>
        <q-btn
          v-else
          label="Published"
          icon="mdi-check"
          disable
          color="white"
          text-color="black"
          no-caps
        /> -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
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
      publishingDialogOpen: false,
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
          this.$q
            .dialog({
              title: "Awesome, they're published! ✅",
              message: "It might take a few minutes for the website to update.",
              ok: {
                color: "secondary",
                flat: true,
              },
            })
            .onOk(() => {
              // console.log('OK')
            })
            .onCancel(() => {
              // console.log('Cancel')
            })
            .onDismiss(() => {
              // console.log('I am triggered on both OK and Cancel')
            });
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
