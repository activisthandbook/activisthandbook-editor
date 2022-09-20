<template>
  <div
    v-if="
      articleVersions.dataLoaded && articleVersions.data[articleVersionSelected]
    "
  >
    <q-card class="q-py-sm bg-accent">
      <q-expansion-item class="bg-accent">
        <template v-slot:header>
          <q-item-section class="q-py-sm">
            <q-item-label class="text-bold">
              <div v-if="articleVersions.data[articleVersionSelected].title">
                {{ articleVersions.data[articleVersionSelected].title }}
              </div>
              <div v-else class="text-grey">No title</div>
            </q-item-label>
            <q-item-label>
              {{
                mixin_humanDate(
                  articleVersions.data[this.articleVersionSelected]
                    .lastUpdatedServerTimestamp
                )
              }}
              <div
                v-if="articleVersions.data[articleVersionSelected].description"
              >
                {{ articleVersions.data[articleVersionSelected].description }}
              </div>
              <div v-else class="text-grey">No description</div>
            </q-item-label>
            <q-item-label class="text-caption">
              <q-icon name="mdi-link" />activisthandbook.org/{{
                articleVersions.data[articleVersionSelected].langCode
              }}/{{ articleVersions.data[articleVersionSelected].path }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip
              v-if="articleVersions.data[articleVersionSelected].deleteArticle"
              label="Delete"
              icon="mdi-delete"
              color="warning"
              class="q-ma-none"
            />
            <q-chip
              v-else-if="isNewArticle"
              icon="mdi-star"
              label="New"
              class="q-ma-none"
              color="grey-3"
            />
            <q-chip v-else label="Update" class="q-ma-none" color="grey-3" />
          </q-item-section>
        </template>

        <div>
          <div
            flat
            class="bg-grey-3 q-mt-sm"
            style="position: sticky; top: 0; z-index: 1"
          >
            <q-card-section>
              <div class="text-bold">Compare versions:</div>
              <div
                class="q-px-xs"
                v-if="articleVersions.dataLoaded && articleVersions.data"
              >
                <q-slider
                  v-model="articleVersionSelected"
                  :min="0"
                  :max="articleVersions.data.length - 1"
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
                    color="secondary"
                    outline
                    class="full-width"
                    no-caps
                    @click="deleteArticle()"
                  />
                </div>

                <div class="col-12 col-sm-3" v-else>
                  <q-btn
                    label="Revert"
                    icon="mdi-close"
                    color="secondary"
                    outline
                    class="full-width"
                    no-caps
                    @click="revertToLastPublished()"
                  />
                </div>

                <div class="col-12 col-sm-3">
                  <q-btn
                    label="Edit"
                    icon="mdi-pencil"
                    color="secondary"
                    outline
                    class="full-width"
                    no-caps
                    :to="{
                      name: 'Edit',
                      params: {
                        articleID: liveDraftArticle.id,
                      },
                    }"
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-btn
                    :disable="!isNewArticle && articleVersionSelected === 0"
                    label="Accept this version"
                    icon="mdi-check"
                    color="secondary"
                    class="full-width"
                    no-caps
                    @click="acceptVersion()"
                  />
                </div>
              </div>
            </q-card-section>
          </div>

          <ModeratePreview
            :article="articleVersions.data[articleVersionSelected]"
            :quickReview="false"
          />
        </div>
      </q-expansion-item>
    </q-card>
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
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
const db = getFirestore();

export default {
  props: ["liveDraftArticle", "quickReview"],
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
    };
  },
  computed: {
    isNewArticle() {
      if (this.liveDraftArticle.lastPublishedServerTimestamp) return false;
      else return true;
    },
  },
  created() {
    this.fetchVersions();
  },
  methods: {
    fetchVersions: function () {
      // FETCH VERSIONS: Here we'll fetch all versions so the moderator can compare them.

      // Define the query
      let versionsQuery = null;
      if (!this.isNewArticle) {
        // PUBLISHED BEFORE: This is not a new article. It has been published before, so we only want to show the versions back until the last published one on the website (so including that one)
        versionsQuery = query(
          collection(db, "articles", this.liveDraftArticle.id, "versions"),
          orderBy("lastUpdatedServerTimestamp"),
          where(
            "lastUpdatedServerTimestamp",
            ">=",
            this.liveDraftArticle.lastPublishedServerTimestamp
          )
        );
      } else {
        // NEW ARTICLE: Fetch all versions
        versionsQuery = query(
          collection(db, "articles", this.liveDraftArticle.id, "versions"),
          orderBy("lastUpdatedServerTimestamp")
        );
      }

      // Now let's fetch the actual data.
      this.articleVersions.unsubscribe = onSnapshot(
        versionsQuery,
        (querySnapshot) => {
          // Process the data we just received from the server
          const versions = [];
          querySnapshot.forEach((doc) => {
            versions.push({ ...doc.data(), id: doc.id });
          });

          // Add the live draft at the end of the timeline as well
          versions.push(this.liveDraftArticle);

          // Add all the versions to the view
          this.articleVersions.data = versions;

          // The selected version is counted as the index of the array (starting with 0). Set the selected version to the last review request (so the one before the live draft)
          this.articleVersionSelected = this.articleVersions.data.length - 2;

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
      /* TODO: Add check for duplicate path  */
      // - Change to transaction
      // - Check the publishingQueue for an identical path

      const acceptedVersion =
        this.articleVersions.data[this.articleVersionSelected];

      if (acceptedVersion.deleteArticle) {
        this.deleteArticle();
      } else {
        // Get a new write batch
        const batch = writeBatch(db);

        // 1. Copy the currently selected version to the publishingQueue collection
        const publishingQueueRef = doc(
          db,
          "publishingQueue",
          this.liveDraftArticle.id
        );
        batch.set(publishingQueueRef, {
          title: acceptedVersion.title,
          description: acceptedVersion.description,
          tags: acceptedVersion.tags,
          path: acceptedVersion.path,
          content: acceptedVersion.content,
          id: acceptedVersion.articleID,
          languageCollectionID: acceptedVersion.languageCollectionID,
          deleteArticle: acceptedVersion.deleteArticle,
          langCode: acceptedVersion.langCode,
          wordCount: acceptedVersion.wordCount,
          lastUpdatedServerTimestamp: serverTimestamp(),
        });

        // 2. Delete all review versions
        this.articleVersions.data.forEach((article) => {
          if (article.status === "review") {
            const reviewVersionRef = doc(
              db,
              "articles",
              this.liveDraftArticle.id,
              "versions",
              article.id
            );
            batch.delete(reviewVersionRef);
          }
        });

        // 3. Set requestedReview to false for the live edit version
        const liveArticleRef = doc(db, "articles", this.liveDraftArticle.id);
        batch.update(liveArticleRef, {
          requestedPublication: false,
          lastPublishedServerTimestamp: serverTimestamp(),
        });

        // 4. Create a new version with the status "published"
        const versionID = this.mixin_randomID();
        const versionRef = doc(
          db,
          "articles",
          this.liveDraftArticle.id,
          "versions",
          versionID
        );
        batch.set(versionRef, {
          title: acceptedVersion.title,
          description: acceptedVersion.description,
          tags: acceptedVersion.tags,
          path: acceptedVersion.path,
          content: acceptedVersion.content,
          articleID: acceptedVersion.articleID,
          id: versionID,
          languageCollectionID: acceptedVersion.languageCollectionID,
          deleteArticle: acceptedVersion.deleteArticle,
          langCode: acceptedVersion.langCode,
          wordCount: acceptedVersion.wordCount,

          lastUpdatedServerTimestamp: serverTimestamp(),
          status: "published",
        });

        const moderatorRef = doc(db, "app", "moderator");
        batch.set(moderatorRef, {
          publishingQueueCount: increment(1),
        });

        // Commit the batch
        await batch.commit();
      }
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
            this.liveDraftArticle.id,
            "versions",
            article.id
          );
          batch.delete(reviewVersionRef);
        }
      });

      // 2. Reverts the live edit to the last published version
      const liveArticleRef = doc(db, "articles", this.liveDraftArticle.id);
      batch.update(liveArticleRef, {
        title: lastPublishedArticle.title,
        description: lastPublishedArticle.description,
        tags: lastPublishedArticle.tags,
        path: lastPublishedArticle.path,
        content: lastPublishedArticle.content,
        id: lastPublishedArticle.articleID,
        languageCollectionID: lastPublishedArticle.languageCollectionID,
        deleteArticle: lastPublishedArticle.deleteArticle,
        langCode: lastPublishedArticle.langCode,
        wordCount: lastPublishedArticle.wordCount,
        lastUpdatedServerTimestamp: lastPublishedArticle.lastPublishedArticle,

        requestedPublication: false,
        reverted: true,
      });

      // Commit the batch
      await batch.commit();
    },
    deleteArticle: async function () {
      try {
        await runTransaction(db, async (transaction) => {
          // 1. Read the language collection that this article is member of (To see if it is only child. If so, we delete the entire collection.)
          const languageCollectionRef = doc(
            db,
            "languageCollections",
            this.liveDraftArticle.languageCollectionID
          );

          const languageCollectionDoc = await transaction.get(
            languageCollectionRef
          );
          if (!languageCollectionDoc.exists()) {
            throw "Language collection not found";
          }
          if (languageCollectionDoc.data().articles.length === 1) {
            transaction.delete(languageCollectionRef);
          } else {
            transaction.update(languageCollectionRef, {
              articles: arrayRemove({
                langCode: this.liveDraftArticle.langCode,
                articleID: this.liveDraftArticle.id,
              }),
            });
          }

          // 2. Deletes all versions
          this.articleVersions.data.forEach((article) => {
            const reviewVersionRef = doc(
              db,
              "articles",
              this.liveDraftArticle.id,
              "versions",
              article.id
            );
            transaction.delete(reviewVersionRef);
          });

          const liveArticleRef = doc(db, "articles", this.liveDraftArticle.id);
          transaction.delete(liveArticleRef);
        });
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    },

    versionLabel: function () {
      if (!this.isNewArticle) {
      }
      const date = this.mixin_humanDate(
        this.articleVersions.data[this.articleVersionSelected]
          .lastUpdatedServerTimestamp
      );

      if (!this.isNewArticle && this.articleVersionSelected === 0) {
        return date + " (Published on website)";
      } else if (
        this.articleVersionSelected ===
        this.articleVersions.data.length - 2
      ) {
        return date + " (Recommended)";
      } else if (
        this.articleVersionSelected ===
        this.articleVersions.data.length - 1
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
