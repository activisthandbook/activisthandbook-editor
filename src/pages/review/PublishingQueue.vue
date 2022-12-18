<template>
  <q-card class="bg-primary text-accent q-mb-lg" dark>
    <q-card-section>
      <div class="flex justify-between items-center q-gutter-sm">
        <div>
          <strong v-if="analyticsStore.data.menuInPublishingQueue">Menu</strong>
          <span
            v-if="
              analyticsStore.data.articlesInQueueCount &&
              analyticsStore.data.menuInPublishingQueue
            "
          >
            and
          </span>
          <strong v-if="analyticsStore.data.articlesInQueueCount">
            <strong>
              {{ analyticsStore.data.articlesInQueueCount }}
            </strong>
            <span v-if="analyticsStore.data.articlesInQueueCount > 1">
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
              analyticsStore.data.articlesInQueueCount > 0,
          }"
          @click="publishArticles()"
          icon="mdi-check-all"
          label="Update website"
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { mapStores } from "pinia";
import { useAnalyticsStore } from "src/stores/analytics";

import { httpsCallable } from "firebase/functions";
import { useFirebaseStore } from "src/stores/firebase";

export default {
  computed: {
    ...mapStores(useAnalyticsStore, useFirebaseStore),
  },
  methods: {
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
          // this.publishedSuccesfullyDialog = true;
          this.$emit("published");

          this.showRenderingTime = true;
          const renderingTime = 62 * 1000;

          setTimeout(() => {
            this.showRenderingTime = false;
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
