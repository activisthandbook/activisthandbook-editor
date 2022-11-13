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
            class="q-py-sm"
            v-if="
              articleVersions.data[this.articleVersionSelected].websiteVersion
            "
          >
            <!-- <q-item-label class="q-pt-sm">Website version</q-item-label>
            <q-item-label caption class="q-py-sm"
              >Preview unavailable</q-item-label
            > -->

            <q-item-label caption>
              {{
                mixin_humanDate(
                  articleVersions.data[this.articleVersionSelected]
                    .lastPublishedServerTimestamp
                )
              }}
            </q-item-label>
            <q-item-label class="text-bold"> Website version </q-item-label>

            <q-item-label> Preview unavailable </q-item-label>

            <q-item-label class="text-caption">
              <q-icon
                name="mdi-link"
                class="q-mr-xs"
              />activisthandbook.org/path-unknown
            </q-item-label>
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
                fullPath(articleVersions.data[articleVersionSelected])
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
                    @click="deleteArticle()"
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
              <div>
                It is not yet possible to show the version of this article that
                is currently on this website.
              </div>
              <q-btn
                class="q-mt-sm"
                label="Open on website"
                :href="`https://new.activisthandbook.org/${fullPath(
                  articleVersions.data[articleVersions.data.length - 1]
                )}`"
                target="_blank"
                icon-right="mdi-open-in-new"
                no-caps
                outline
              />
            </q-card-section>
          </q-card>

          <ModeratePreview
            :article="articleVersions.data[articleVersionSelected]"
          />
        </div>
      </q-expansion-item>
    </q-card>
  </div>
</template>
<script>
import ModeratePreview from "src/pages/review/ModeratePreview.vue";

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
  props: ["liveDraftArticle"],
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

    ...mapStores(useAnalyticsStore, useFirebaseStore),
  },
  created() {
    this.fetchVersions();
  },
  methods: {
    fullPath(article) {
      let fullPath = "";
      if (article.langCode !== "en") {
        fullPath += article.langCode + "/";
      }
      fullPath += article.path;

      return fullPath;
    },
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

      // Get a new write batch
      const batch = writeBatch(db);

      // 1. Copy the currently selected version to the publishingQueue collection
      const publishingQueueRef = doc(
        db,
        "publishingQueue",
        this.liveDraftArticle.id
      );
      batch.set(publishingQueueRef, {
        ...acceptedVersion,
        id: acceptedVersion.articleID,
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
        // publishedFullPath: this.fullPath(acceptedVersion),
        lastPublishedServerTimestamp: serverTimestamp(),
        "metadata.updatedTimestamp": serverTimestamp(),
        "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
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
        ...acceptedVersion,
        id: versionID,
        publishedFullPath: this.fullPath(acceptedVersion),
        status: "published",
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

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
        ...lastPublishedArticle,
        id: lastPublishedArticle.articleID,
        requestedPublication: false,
        reverted: true,

        "metadata.updatedTimestamp": serverTimestamp(),
        "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
      });
      // Commit the batch
      await batch.commit();
    },
    deleteArticle: async function () {
      try {
        await runTransaction(db, async (transaction) => {
          const acceptedVersion =
            this.articleVersions.data[this.articleVersionSelected];

          // Read the language collection that this article is member of
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

          // Copy the currently selected version to the publishingQueue collection
          const publishingQueueRef = doc(
            db,
            "publishingQueue",
            this.liveDraftArticle.id
          );
          transaction.set(publishingQueueRef, {
            ...acceptedVersion,
            id: acceptedVersion.articleID,
            metadata: {
              createdTimestamp: serverTimestamp(),
              createdBy: this.firebaseStore.auth.currentUser.uid,
            },
          });

          // Remove from language collection
          transaction.update(languageCollectionRef, {
            articles: arrayRemove({
              articleID: this.liveDraftArticle.id,
              langCode: this.liveDraftArticle.langCode,
            }),
            "metadata.updatedTimestamp": serverTimestamp(),
            "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
          });

          // Delete live draft article. Versions are automatically deleted
          const liveArticleRef = doc(db, "articles", this.liveDraftArticle.id);
          transaction.delete(liveArticleRef);
        });

        // update analytics locally (it will be updated on server automatically with a counter, but this way we prevent a delay)
        this.analyticsStore.data.articlePublishingQueueCount++;
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    },

    versionLabel: function () {
      // if (!this.isNewArticle) {
      // }
      if (
        !this.articleVersions.data[this.articleVersionSelected].websiteVersion
      ) {
        const createdDate = this.mixin_humanDate(
          this.articleVersions.data[this.articleVersionSelected].metadata
            .createdTimestamp
        );
        const updatedDate = this.mixin_humanDate(
          this.articleVersions.data[this.articleVersionSelected].metadata
            .updatedTimestamp
        );

        if (!this.isNewArticle && this.articleVersionSelected === 0) {
          return createdDate + " (Published on website)";
        } else if (
          this.articleVersionSelected ===
          this.articleVersions.data.length - 2
        ) {
          return createdDate + " (Recommended)";
        } else if (
          this.articleVersionSelected ===
          this.articleVersions.data.length - 1
        ) {
          return updatedDate + " (Unfinished draft)";
        } else {
          return createdDate;
        }
      } else return "Published on website";
    },
  },
  unmounted() {
    this.articleVersions.unsubscribe();
  },
};
</script>
