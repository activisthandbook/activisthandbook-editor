<template>
  <div v-if="articleVersions.dataLoaded">
    <q-card v-if="quickReview">
      <ModeratePreview
        :article="articleVersions.data[articleVersionSelected - 1]"
        :quickReview="true"
      />
      <q-card-section style="position: sticky; top: 0; z-index: 1">
        <q-card flat bordered>
          <q-card-section>
            <div class="q-mb-md flex items-center justify-between">
              <div>
                <span class="text-bold q-mr-xs">Latest version</span>
                <q-chip
                  v-if="
                    articleVersions.data[articleVersionSelected - 1]
                      .deleteArticle
                  "
                  icon="mdi-delete"
                  label="Delete"
                  color="warning"
                  class="q-ma-none"
                />
                <q-chip
                  v-else-if="isNewArticle"
                  label="New article"
                  class="q-ma-none"
                />
                <q-chip v-else label="Updated article" class="q-ma-none" />
              </div>

              <span class="text-caption">
                <span v-if="isNewArticle">{{
                  articleVersions.data.length - 1
                }}</span>
                <span v-else>{{ articleVersions.data.length - 2 }}</span>
                other versions
              </span>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-btn
                  label="Edit"
                  icon="mdi-pencil"
                  color="white"
                  text-color="black"
                  class="full-width"
                  no-caps
                  :to="{ name: 'Edit' }"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-btn
                  :disable="!isNewArticle && articleVersionSelected === 1"
                  label="Accept latest version"
                  icon="mdi-check"
                  color="white"
                  text-color="secondary"
                  class="full-width"
                  no-caps
                  @click="acceptVersion()"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>

    <q-expansion-item v-else>
      <template v-slot:header>
        <q-item-section class="q-py-sm">
          <q-item-label class="text-bold">
            <div v-if="articleVersions.data[articleVersionSelected - 1].title">
              {{ articleVersions.data[articleVersionSelected - 1].title }}
            </div>
            <div v-else class="text-grey">No title</div>
          </q-item-label>
          <q-item-label>
            <div
              v-if="
                articleVersions.data[articleVersionSelected - 1].description
              "
            >
              {{ articleVersions.data[articleVersionSelected - 1].description }}
            </div>
            <div v-else class="text-grey">No description</div>
          </q-item-label>
          <q-item-label caption
            >activisthandbook.org/{{
              articleVersions.data[articleVersionSelected - 1].path
            }}</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <q-chip
            v-if="
              articleVersions.data[articleVersionSelected - 1].deleteArticle
            "
            label="Delete"
            icon="mdi-delete"
            color="warning"
            class="q-ma-none"
          />
          <q-chip v-else-if="isNewArticle" label="New" class="q-ma-none" />
          <q-chip v-else label="Update" class="q-ma-none" />
        </q-item-section>
      </template>
      <q-card>
        <q-card-section style="position: sticky; top: 0; z-index: 1">
          <q-card flat class="bg-grey-2">
            <q-card-section>
              <div class="text-bold">Compare versions:</div>
              <div
                class="q-px-xs"
                v-if="articleVersions.dataLoaded && articleVersions.data"
              >
                <q-slider
                  v-model="articleVersionSelected"
                  :min="1"
                  :max="articleVersions.data.length"
                  :step="1"
                  markers
                  snap
                  label
                  :label-value="versionLabel()"
                  label-always
                  color="grey-6"
                  thumb-color="secondary"
                  thumb-size="32px"
                  track-size="16px"
                />
              </div>
              <div class="flex" style="margin-top: -12px">
                <span v-if="isNewArticle">First edit</span>
                <span v-else>On website now</span>
                <q-space />
                <span>Last edit</span>
              </div>
              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col-12 col-sm-3" v-if="isNewArticle">
                  <q-btn
                    label="Delete"
                    icon="mdi-delete"
                    color="white"
                    text-color="black"
                    class="full-width"
                    no-caps
                  />
                </div>

                <div class="col-12 col-sm-3" v-else>
                  <q-btn
                    label="Revert"
                    icon="mdi-close"
                    color="white"
                    text-color="black"
                    class="full-width"
                    no-caps
                    @click="revertToLastPublished()"
                  />
                </div>

                <div class="col-12 col-sm-3">
                  <q-btn
                    label="Edit"
                    icon="mdi-pencil"
                    color="white"
                    text-color="black"
                    class="full-width"
                    no-caps
                    :to="{ name: 'Edit' }"
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-btn
                    :disable="!isNewArticle && articleVersionSelected === 1"
                    label="Accept this version"
                    icon="mdi-check"
                    color="white"
                    text-color="secondary"
                    class="full-width"
                    no-caps
                    @click="acceptVersion()"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <ModeratePreview
          :article="articleVersions.data[articleVersionSelected - 1]"
          :quickReview="false"
        />
      </q-card>
      <q-separator />
    </q-expansion-item>
  </div>
</template>
<script>
import ModeratePreview from "components/moderate/ModeratePreview.vue";

import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  writeBatch,
  doc,
  serverTimestamp,
  where,
  increment,
} from "firebase/firestore";
const db = getFirestore();

export default {
  props: ["article", "quickReview"],
  components: { ModeratePreview },
  data() {
    return {
      articleVersionSelected: 1,
      articleVersions: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      isNewArticle: false,
    };
  },
  mounted() {
    this.fetchVersions();
  },
  methods: {
    fetchVersions: function () {
      let q = null;
      if (this.article.lastPublishedServerTimestamp) {
        q = query(
          collection(db, "articles", this.article.id, "versions"),
          orderBy("lastUpdatedServerTimestamp"),
          where(
            "lastUpdatedServerTimestamp",
            ">=",
            this.article.lastPublishedServerTimestamp
          )
        );
      } else {
        q = query(
          collection(db, "articles", this.article.id, "versions"),
          orderBy("lastUpdatedServerTimestamp")
        );
      }
      this.articleVersions.unsubscribe = onSnapshot(
        q,

        (querySnapshot) => {
          const versions = [];
          querySnapshot.forEach((doc) => {
            versions.push({ ...doc.data(), id: doc.id });
          });
          versions.push(this.article);

          if (versions[0].status !== "published") {
            // The last published version of this page is not found
            this.isNewArticle = true;
          }

          this.articleVersions.data = versions;

          if (this.articleVersions.data) {
            this.articleVersionSelected = this.articleVersions.data.length - 1;
          }

          this.articleVersions.dataLoaded = true;
        },
        (error) => {
          this.articleVersions.error = error;
          this.$q.notify("Loading article versions failed");
          console.log(error);
        }
      );
    },
    acceptVersion: async function () {
      // Get a new write batch
      const batch = writeBatch(db);

      /* TODO: Add check for duplicate path lorem ipsum... asdf asdf sadf sadfa sdfad fds asdf f asdf a s */
      // - Change to transaction
      // - Check the publishingQueue for an identical path

      const acceptedArticle =
        this.articleVersions.data[this.articleVersionSelected - 1];

      // 1. Copy the currently selected version to the publishingQueue collection
      const publishingQueueRef = doc(db, "publishingQueue", this.article.id);
      batch.set(publishingQueueRef, acceptedArticle);

      // 2. Delete all review versions
      this.articleVersions.data.forEach((article) => {
        if (article.status === "review") {
          const reviewVersionRef = doc(
            db,
            "articles",
            this.article.id,
            "versions",
            article.id
          );
          batch.delete(reviewVersionRef);
        }
      });

      // 3. Set requestedReview to false for the live edit version
      const liveArticleRef = doc(db, "articles", this.article.id);
      batch.update(liveArticleRef, {
        requestedPublication: false,
        lastPublishedServerTimestamp: serverTimestamp(),
      });

      // 4. Create a new version with the status "published"
      const currentArticleRef = doc(
        db,
        "articles",
        this.article.id,
        "versions",
        this.mixin_randomID()
      );
      batch.set(currentArticleRef, {
        ...acceptedArticle,
        lastUpdatedServerTimestamp: serverTimestamp(),
        status: "published",
      });

      const moderatorRef = doc(db, "app", "moderator");
      batch.set(moderatorRef, {
        publishingQueueCount: increment(1),
      });

      // Commit the batch
      await batch.commit();
    },
    revertToLastPublished: async function () {
      // Get a new write batch
      const batch = writeBatch(db);

      const lastPublishedArticle = this.articleVersions.data[0];

      // 1. Deletes all review versions (not the previous published ones)
      this.articleVersions.data.forEach((article) => {
        if (article.status === "review") {
          const reviewVersionRef = doc(
            db,
            "articles",
            this.article.id,
            "versions",
            article.id
          );
          batch.delete(reviewVersionRef);
        }
      });

      // 2. Reverts the live edit to the last published version
      const liveArticleRef = doc(db, "articles", this.article.id);
      batch.update(liveArticleRef, {
        ...lastPublishedArticle,
        requestedPublication: false,
        reverted: true,
      });

      // Commit the batch
      await batch.commit();
    },
    deleteArticle: function () {
      // Only used on newly created articles: deletes the live version & the entire versions subcollection
    },

    versionLabel: function () {
      const date = this.mixin_humanDate(
        this.articleVersions.data[this.articleVersionSelected - 1]
          .lastUpdatedServerTimestamp
      );

      if (!this.isNewArticle && this.articleVersionSelected === 1) {
        return date + " (Published on website)";
      } else if (
        this.articleVersionSelected ===
        this.articleVersions.data.length - 1
      ) {
        return date + " (Recommended)";
      } else if (
        this.articleVersionSelected === this.articleVersions.data.length
      ) {
        return date + " (Unfinished draft)";
      } else {
        return date;
      }
    },
  },
  unmounted() {
    this.articleVersions.unsubscribe();
  },
};
</script>
