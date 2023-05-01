<template>
  <q-skeleton
    class="rounded-borders"
    height="144.77px"
    v-if="!article_draft.dataLoaded || !article_published.dataLoaded"
  />
  <q-card v-else class="bg-accent" flat bordered>
    <q-expansion-item>
      <template v-slot:header>
        <q-item-section class="q-py-md">
          <q-item-label class="text-caption q-pb-xs">
            <q-chip
              dense
              square
              class="text-caption q-ml-none q-mt-none q-mr-sm"
              color="grey-2"
              text-color="black"
            >
              {{ versionDate }}
            </q-chip>
            <q-chip
              v-if="!article_draft_live.lastPublishedServerTimestamp"
              dense
              square
              class="text-caption q-ml-none q-mt-none q-mr-sm"
              color="secondary"
              text-color="accent"
              icon="mdi-star"
            >
              New
            </q-chip>
            <q-chip
              v-if="article_draft.data.deleteArticle"
              dense
              square
              class="text-caption q-ml-none q-mt-none q-mr-sm"
              color="warning"
              icon="mdi-delete"
            >
              Delete
            </q-chip>
            <q-chip
              v-if="
                article_draft.data.content === article_published.data.content
              "
              dense
              square
              class="text-caption q-ml-none q-mt-none q-mr-sm"
              color="grey-8"
              text-color="accent"
              icon="mdi-pencil-off"
            >
              Same content
            </q-chip>
          </q-item-label>
          <q-item-label class="text-bold">
            <HighlightedDifferences
              :differences="differences.title"
              fallback="No title"
            />
          </q-item-label>
          <q-item-label>
            <HighlightedDifferences
              :differences="differences.description"
              fallback="No description"
            />
          </q-item-label>
          <q-item-label class="text-caption q-pt-xs">
            <q-icon name="mdi-link" class="q-mr-xs" /><span class="text-grey"
              >activisthandbook.org/</span
            >{{ article_draft.data.langCode }}/<HighlightedDifferences
              :differences="differences.path"
              fallback="no-path"
            />
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="versionAuthor">
          <q-chip
            color="grey-2"
            text-color="black"
            icon="mdi-account"
            class="text-caption"
          >
            {{ versionAuthor }}
          </q-chip>
        </q-item-section>
      </template>

      <q-card class="bg-accent">
        <q-separator />
        <div style="position: sticky; top: 0; z-index: 1" class="bg-accent">
          <q-card-section>
            <div class="q-gutter-md row items-center">
              <div v-if="article_draft.data.deleteArticle">
                <q-btn
                  label="Delete"
                  icon="mdi-delete"
                  text-color="black"
                  color="warning"
                  no-caps
                  @click="deleteArticle()"
                />
              </div>
              <div v-else>
                <q-btn
                  label="Accept"
                  icon="mdi-check-bold"
                  color="secondary"
                  no-caps
                  @click="acceptVersion()"
                />
              </div>

              <div>
                <q-btn
                  label="Edit"
                  icon="mdi-pencil"
                  color="secondary"
                  dense
                  no-caps
                  flat
                  :to="{
                    name: 'Edit',
                    params: {
                      articleID: article_draft_live.id,
                    },
                  }"
                />
              </div>

              <div v-if="article_draft_live.lastPublishedServerTimestamp">
                <q-btn
                  label="Revert"
                  icon="mdi-history"
                  color="secondary"
                  no-caps
                  dense
                  flat
                  @click="revertToLastPublished()"
                />
              </div>

              <div v-else-if="!article_draft.data.deleteArticle">
                <q-btn
                  label="Delete"
                  icon="mdi-delete"
                  color="secondary"
                  no-caps
                  dense
                  flat
                />
              </div>

              <q-space />

              <div class="flex items-center">
                <div>
                  <!-- Disabled -->
                  <q-btn
                    v-if="
                      article_draft_selected >
                      article_draft_live.versions_draft_count - 2
                    "
                    icon="mdi-arrow-left-circle-outline"
                    color="grey"
                    round
                    flat
                    dense
                    disable
                  />
                  <!-- Enabled -->
                  <q-btn
                    v-else
                    icon="mdi-arrow-left-circle"
                    round
                    flat
                    dense
                    @click="older()"
                  />
                </div>

                <div class="q-px-xs">
                  {{
                    article_draft_live.versions_draft_count -
                    article_draft_selected
                  }}
                </div>
                <div>
                  <!-- Disabled -->
                  <q-btn
                    v-if="article_draft_selected < 1"
                    icon="mdi-arrow-right-circle-outline"
                    color="grey"
                    round
                    flat
                    dense
                    disable
                  />
                  <!-- Enabled -->
                  <q-btn
                    v-else
                    icon="mdi-arrow-right-circle"
                    round
                    flat
                    dense
                    @click="newer()"
                  />
                </div>
                <q-tooltip class="bg-black text-bold"
                  >Compare versions</q-tooltip
                >
              </div>
            </div>
          </q-card-section>
          <q-separator />
        </div>
        <q-card-section>
          <q-card
            flat
            class="bg-warning q-my-sm"
            v-if="article_draft.data.deleteArticle"
          >
            <q-card-section
              >If you accept this version, this article and all its version
              history will be permanently deleted!</q-card-section
            >
          </q-card>
          <code
            style="
              white-space: pre-wrap;
              word-break: break-word;
              color: rgba(0, 0, 0, 0.5);
              font-size: 0.8em;
            "
            class="scroll"
          >
            <HighlightedDifferences
              :differences="differences.content"
              fallback="No content"
            />
          </code>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-card>
</template>
<script>
import HighlightedDifferences from "./HighlightedDifferences.vue";

import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useAnalyticsStore } from "src/stores/analytics";

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  orderBy,
  startAfter,
  limit,
  query,
  collection,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  where,
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
const db = getFirestore();

import { html_beautify } from "js-beautify";
import { diffChars } from "diff";

let article_draft_doc = null;

export default {
  props: ["article_draft_live"],
  components: {
    HighlightedDifferences,
  },
  data: function () {
    return {
      article_draft: {
        doc: null,
        data: null,
        dataLoaded: false,
      },
      article_published: {
        data: null,
        dataLoaded: false,
      },
      article_draft_selected: 0,
    };
  },
  computed: {
    ...mapStores(useUsersStore, useAnalyticsStore),
    differences() {
      let differences = {};

      const article_draft = this.article_draft.data;
      let article_published = this.article_published.data;

      differences.title = diffChars(
        article_published.title || "",
        article_draft.title || ""
      );

      differences.description = diffChars(
        article_published.description || "",
        article_draft.description || ""
      );

      differences.path = diffChars(
        article_published.path || "",
        article_draft.path || ""
      );

      differences.content = diffChars(
        html_beautify(article_published.content || ""),
        html_beautify(article_draft.content || "")
      );

      return differences;
    },
    versionAuthor: function () {
      if (
        this.usersStore.profile.dataLoaded[
          this.article_draft.data.metadata.updatedBy
        ]
      ) {
        return this.usersStore.profile.data[
          this.article_draft.data.metadata.updatedBy
        ]?.firstName;
      } else return null;
    },
    versionDate: function () {
      return this.mixin_humanDate(
        this.article_draft.data.metadata.updatedTimestamp
      );
    },
  },
  async created() {
    await this.fetch_article_draft({});
    await this.fetch_article_published();
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
    async older() {
      await this.fetch_article_draft({ older: true });
      this.article_draft_selected += 1;
    },
    async newer() {
      await this.fetch_article_draft({ newer: true });
      this.article_draft_selected -= 1;
    },
    async fetch_article_draft({ older, newer }) {
      if (this.article_draft_live.versions_draft_count) {
        let q = null;
        if (older) {
          q = query(
            collection(
              db,
              "articles_draft",
              this.article_draft_live.id,
              "versions_draft"
            ),
            orderBy("metadata.updatedTimestamp", "desc"),
            startAfter(article_draft_doc),
            limit(1)
          );
        } else if (newer) {
          q = query(
            collection(
              db,
              "articles_draft",
              this.article_draft_live.id,
              "versions_draft"
            ),
            orderBy("metadata.updatedTimestamp", "asc"),
            startAfter(article_draft_doc),
            limit(1)
          );
        } else {
          q = query(
            collection(
              db,
              "articles_draft",
              this.article_draft_live.id,
              "versions_draft"
            ),
            orderBy("metadata.updatedTimestamp", "desc"),
            limit(1)
          );
        }

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          article_draft_doc = doc;
          this.article_draft.data = doc.data();

          this.article_draft.dataLoaded = true;

          await this.usersStore.fetchUser(
            this.article_draft.data.metadata.updatedBy
          );
        });
      } else {
        this.article_draft.dataLoaded = true;
      }
    },
    async fetch_article_published() {
      if (!this.article_draft_live.lastPublishedServerTimestamp) {
        this.article_published.data = {
          title: "",
          description: "",
          path: "",
          content: "",
        };
        this.article_published.dataLoaded = true;
      } else {
        const docRef = doc(
          db,
          "articles_published",
          this.article_draft_live.id
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.article_published.data = docSnap.data();
          this.article_published.dataLoaded = true;
        } else {
          // docSnap.data() will be undefined in this case
          this.$q.notify("Published version not found");
        }
      }
    },
    acceptVersion: async function () {
      /* TODO: Add check for duplicate path  */
      // - Change to transaction
      // - Check the publishingQueue for an identical path

      const acceptedVersion = this.article_draft.data;
      console.log(acceptedVersion);

      const pathValidation = await this.mixin_validatePath(
        acceptedVersion.path,
        acceptedVersion.lang.code,
        acceptedVersion.articleID
      );
      if (pathValidation.error) {
        console.log("Path error!", pathValidation);
        this.$q.dialog({
          title: "Duplicate path!",
          message:
            "A page with this path already exists. Change the path before publishing.",
          ok: {
            color: "secondary",
            flat: true,
            noCaps: true,
          },
        });
      } else {
        // Get a new write batch
        const batch = writeBatch(db);

        // 1. Copy the currently selected version to the publishingQueue collection
        const publishingQueueRef = doc(
          db,
          "articles_inQueue",
          acceptedVersion.articleID
        );
        batch.set(publishingQueueRef, {
          ...acceptedVersion,
          id: acceptedVersion.articleID,
        });

        // 2. Delete all review versions
        const querySnapshot = await getDocs(
          query(
            collection(
              db,
              "articles_draft",
              acceptedVersion.articleID,
              "versions_draft"
            )
          )
        );
        querySnapshot.forEach(async (version) => {
          const reviewVersionRef = doc(
            db,
            "articles_draft",
            acceptedVersion.articleID,
            "versions_draft",
            version.id
          );
          batch.delete(reviewVersionRef);
        });

        // 3. Set requestedReview to false for the live edit version
        const liveArticleRef = doc(
          db,
          "articles_draft",
          acceptedVersion.articleID
        );
        batch.update(liveArticleRef, {
          requestedPublication: false,
          // publishedFullPath: this.fullPath(acceptedVersion),
          lastPublishedServerTimestamp: serverTimestamp(),
          versions_draft_count: 0,
        });

        // 4. Create a new version with the status "published"
        const versionID = this.mixin_randomID();
        const versionRef = doc(
          db,
          "articles_draft",
          acceptedVersion.articleID,
          "versions_published",
          versionID
        );
        batch.set(versionRef, {
          ...acceptedVersion,
          id: versionID,
          publishedFullPath: this.fullPath(acceptedVersion),
        });

        // Commit the batch
        await batch.commit();
        // }

        if (acceptedVersion.deleteArticle) {
          await this.deleteArticle();
        }

        // update analytics locally (it will be updated on server automatically with a counter, but this way we prevent a delay)
        this.analyticsStore.data.articles_inQueue_count++;
      }
    },
    async deleteArticle() {
      try {
        await runTransaction(db, async (transaction) => {
          // Read the language collection that this article is member of
          const languageCollectionRef = doc(
            db,
            "languageCollections",
            this.article_draft_live.languageCollectionID
          );

          const languageCollectionDoc = await transaction.get(
            languageCollectionRef
          );
          let languageCollectionData = null;
          if (!languageCollectionDoc.exists()) {
            throw "Language collection not found";
          } else {
            languageCollectionData = languageCollectionDoc.data();
          }

          // Copy the currently selected version to the publishingQueue collection
          if (this.article_draft_live.lastPublishedServerTimestamp) {
            const publishingQueueRef = doc(
              db,
              "articles_inQueue",
              this.article_draft_live.id
            );

            transaction.set(publishingQueueRef, {
              deleteArticle: true,
              languageCollectionID:
                this.article_draft_live.languageCollectionID,
              id: this.article_draft_live.articleID,
            });
          }

          // Remove from language collection
          if (
            languageCollectionData.articles_draft.length > 1 ||
            this.article_draft_live.lastPublishedServerTimestamp
          ) {
            transaction.update(languageCollectionRef, {
              articles_draft: arrayRemove({
                articleID: this.article_draft_live.id,
                langCode: this.article_draft_live.langCode,
              }),
            });
          } else {
            transaction.delete(languageCollectionRef);
          }

          // Delete live draft article. Versions are automatically deleted
          const liveArticleRef = doc(
            db,
            "articles_draft",
            this.article_draft_live.id
          );
          transaction.delete(liveArticleRef);
        });

        // update analytics locally (it will be updated on server automatically with a counter, but this way we prevent a delay)
        if (
          !this.article_draft_live.deleteArticle &&
          !this.article_draft_live.lastPublishedServerTimestamp
        ) {
          this.analyticsStore.data.articles_inQueue_count++;
        }
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
    },
    async revertToLastPublished() {
      // Get a new write batch
      const batch = writeBatch(db);

      const lastPublishedArticle = this.article_published.data;

      // 1. Deletes all review versions
      const querySnapshot = await getDocs(
        query(
          collection(
            db,
            "articles_draft",
            this.article_draft_live.id,
            "versions_draft"
          )
        )
      );
      querySnapshot.forEach(async (version) => {
        const reviewVersionRef = doc(
          db,
          "articles_draft",
          this.article_draft_live.id,
          "versions_draft",
          version.id
        );
        batch.delete(reviewVersionRef);
      });

      // 2. Reverts the live edit to the last published version.
      const liveArticleRef = doc(
        db,
        "articles_draft",
        this.article_draft_live.id
      );
      batch.update(liveArticleRef, {
        ...lastPublishedArticle,
        id: lastPublishedArticle.articleID,
        requestedPublication: false,
        reverted: true,
      });
      // Commit the batch
      await batch.commit();
    },
  },
};
</script>
