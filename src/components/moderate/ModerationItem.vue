<template>
  <div
    v-if="
      articleVersions.dataLoaded && articleVersions.data[articleVersionSelected]
    "
  >
    <q-card class="q-py-sm bg-accent">
      <q-expansion-item class="bg-accent">
        <template v-slot:header>
          <q-item-section
            class="q-py-md text-bold"
            v-if="
              articleVersions.data[this.articleVersionSelected].websiteVersion
            "
          >
            <q-item-label class="q-pt-sm">Website version</q-item-label>
            <q-item-label caption class="q-py-sm"
              >Preview unavailable</q-item-label
            >
          </q-item-section>
          <q-item-section class="q-py-sm" v-else>
            <q-item-label caption>
              {{
                mixin_humanDate(
                  articleVersions.data[this.articleVersionSelected].metadata
                    .createdTimestamp
                )
              }}
            </q-item-label>
            <q-item-label class="text-bold">
              <div v-if="articleVersions.data[articleVersionSelected].title">
                {{ articleVersions.data[articleVersionSelected].title }}
              </div>
              <div v-else class="text-grey">No title</div>
            </q-item-label>

            <q-item-label>
              <div
                v-if="articleVersions.data[articleVersionSelected].description"
              >
                {{ articleVersions.data[articleVersionSelected].description }}
              </div>
              <div v-else class="text-grey">No description</div>
            </q-item-label>

            <q-item-label class="text-caption">
              <q-icon name="mdi-link" class="q-mr-xs" />activisthandbook.org/{{
                fullPath
              }}
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
              icon="mdi-star-outline"
              label="New"
              class="q-ma-none"
              color="grey-3"
            />
            <q-chip
              v-else
              icon="mdi-file-edit-outline"
              label="Edit"
              class="q-ma-none"
              color="grey-3"
            />
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
              <div
                class="row q-col-gutter-sm q-mt-sm"
                v-if="
                  !articleVersions.data[articleVersionSelected].deleteArticle
                "
              >
                <div class="col-12 col-sm-6">
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
                    v-if="!isNewArticle && articleVersionSelected === 0"
                    label="Revert to last published"
                    icon="mdi-history"
                    color="secondary"
                    class="full-width"
                    no-caps
                    @click="revertToLastPublished()"
                  />
                  <q-btn
                    v-else
                    label="Accept this version"
                    icon="mdi-check"
                    color="secondary"
                    class="full-width"
                    no-caps
                    @click="acceptVersion()"
                  />
                </div>
              </div>
              <!-- DELETING ARTICLE -->
              <div class="row q-col-gutter-sm q-mt-sm" v-else>
                <div class="col-12 col-sm-6">
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
                    v-if="!isNewArticle"
                    :disable="articleVersionSelected === 0"
                    label="Delete from website"
                    icon="mdi-delete"
                    color="secondary"
                    class="full-width"
                    no-caps
                    @click="acceptVersion()"
                  />
                  <q-btn
                    v-else
                    label="Delete drafts"
                    icon="mdi-delete"
                    color="secondary"
                    class="full-width"
                    no-caps
                    @click="deleteArticle()"
                  />
                </div>
              </div>
            </q-card-section>
          </div>

          <q-card
            v-if="articleVersions.data[articleVersionSelected].websiteVersion"
            flat
            class="bg-grey-3 q-mx-lg q-my-lg"
          >
            <q-card-section>
              It is not yet possible to preview the version of this article that
              is currently on this website.
            </q-card-section>
          </q-card>

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
  limit,
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
import { mapStores } from "pinia";
import { useAnalyticsStore } from "src/stores/analytics";
import { useFirebaseStore } from "src/stores/firebase";
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
    fullPath: function () {
      let fullPath = "";
      if (
        this.articleVersions.data[this.articleVersionSelected].langCode !== "en"
      ) {
        fullPath +=
          this.articleVersions.data[this.articleVersionSelected].langCode + "/";
      }
      fullPath += this.articleVersions.data[this.articleVersionSelected].path;

      return fullPath;
    },
    ...mapStores(useAnalyticsStore, useFirebaseStore),
  },
  created() {
    this.fetchVersions();
  },
  methods: {
    fetchVersions: async function () {
      // FETCH VERSIONS: Here we'll fetch all versions so the moderator can compare them.

      // Define the query
      let versionsQuery = null;
      if (!this.isNewArticle) {
        // PUBLISHED BEFORE: This is not a new article. It has been published before, so we only want to show the versions back until the last published one on the website (so including that one)
        versionsQuery = query(
          collection(db, "articles", this.liveDraftArticle.id, "versions"),
          orderBy("metadata.createdTimestamp"),
          where(
            "status",
            "==",
            "review"
            // this.liveDraftArticle.lastPublishedServerTimestamp
          ),
          limit(10)
        );
      } else {
        // NEW ARTICLE: Fetch all versions
        versionsQuery = query(
          collection(db, "articles", this.liveDraftArticle.id, "versions"),
          orderBy("metadata.createdTimestamp"),
          limit(10)
        );
      }

      // Now let's fetch the actual data.
      this.articleVersions.unsubscribe = onSnapshot(
        versionsQuery,
        async (querySnapshot) => {
          // Process the data we just received from the server
          const versions = [];

          // Hacky solution
          if (!this.isNewArticle) {
            versions.push({
              websiteVersion: true,
            });
          }

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

      // } else {
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
        fullPath: this.fullPath,
        publishedPath: acceptedVersion.path,
        content: acceptedVersion.content,
        id: acceptedVersion.articleID,
        languageCollectionID: acceptedVersion.languageCollectionID,
        deleteArticle: acceptedVersion.deleteArticle,
        langCode: acceptedVersion.langCode,
        wordCount: acceptedVersion.wordCount,
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
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
        publishedPath: acceptedVersion.path,
        lastPublishedServerTimestamp: serverTimestamp(),
        metadata: {
          updatedTimestamp: serverTimestamp(),
          updatedBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      // 4. Create a new version with the status "published"
      if (!acceptedVersion.deleteArticle) {
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
          fullPath: this.fullPath,
          publishedPath: acceptedVersion.path,
          content: acceptedVersion.content,
          articleID: acceptedVersion.articleID,
          id: versionID,
          languageCollectionID: acceptedVersion.languageCollectionID,
          deleteArticle: acceptedVersion.deleteArticle,
          langCode: acceptedVersion.langCode,
          wordCount: acceptedVersion.wordCount,
          status: "published",
          metadata: {
            createdTimestamp: serverTimestamp(),
            createdBy: this.firebaseStore.auth.currentUser.uid,
          },
        });
      }

      // Commit the batch
      await batch.commit();
      // }

      if (acceptedVersion.deleteArticle) {
        await this.deleteArticle();
      }

      // update analytics locally (it will be updated on server automatically with a counter, but this way we prevent a delay)
      this.analyticsStore.data.articlePublishingQueueCount++;
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

      // 2. Reverts the live edit to the last published version.
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
        requestedPublication: false,
        reverted: true,

        metadata: {
          updatedTimestamp: serverTimestamp(),
          updatedBy: this.firebaseStore.auth.currentUser.uid,
        },
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
              metadata: {
                updatedTimestamp: serverTimestamp(),
                updatedBy: this.firebaseStore.auth.currentUser.uid,
              },
            });
          }

          // 2. Deletes all versions
          // TO-DO: Move this to cloud function
          this.articleVersions.data.forEach((article) => {
            if (!article.websiteVersion || article.requestedPublication) {
              const reviewVersionRef = doc(
                db,
                "articles",
                this.liveDraftArticle.id,
                "versions",
                article.id
              );
              transaction.delete(reviewVersionRef);
            }
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
        this.articleVersions.data[this.articleVersionSelected].metadata
          .createdTimestamp
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
