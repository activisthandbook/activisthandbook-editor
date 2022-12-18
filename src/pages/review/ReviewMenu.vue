<template>
  <h2>Sidebar</h2>
  <div>
    <q-card flat class="bg-grey-3 q-mt-sm">
      <q-card-section>
        <div class="text-bold">Compare versions:</div>
        <div
          class="q-px-xs"
          v-if="menuVersions.dataLoaded && menuVersions.data"
        >
          <q-slider
            v-model="menuVersionSelected"
            :min="0"
            :max="menuVersions.data.length - 1"
            :step="1"
            markers
            snap
            label
            :label-value="versionLabel"
            label-always
            color="grey-6"
            thumb-color="secondary"
            thumb-size="32px"
            track-size="16px"
          />
        </div>
        <div class="flex" style="margin-top: -12px">
          <span>First edit</span>
          <!-- <span v-else>On website now</span> -->
          <q-space />
          <span>Last edit</span>
        </div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-sm-3">
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
                name: 'Menu',
              }"
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-btn
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
    </q-card>

    <div v-if="!menuVersions.dataLoaded">Loading...</div>

    <div v-else-if="!menuVersions.data[0]">
      <div class="q-my-md">No updates to menu.</div>
      <q-btn label="Edit menu" :to="{ name: 'Menu' }" no-caps />
    </div>

    <div class="q-gutter-y-md q-my-md" v-else>
      <q-card
        v-for="(menuItem, index) in menuVersions.data[menuVersionSelected]
          .sidebar"
        :key="menuItem.id"
        class="bg-accent"
      >
        <q-card-section>
          <div class="text-h3 q-pb-sm text-uppercase">{{ index }}</div>
          <q-tree :nodes="menuItem" children-key="items" node-key="id" dense>
            <template v-slot:default-header="prop">
              <div class="text-weight-bold text-secondary">
                {{ prop.node.text }}
              </div>
            </template>

            <template v-slot:default-body="prop">
              <div class="text-caption">
                {{ prop.node.link }}
              </div>
            </template>
          </q-tree>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
<script>
// import { transform, isEqual, isArray, isObject } from "lodash";

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
} from "firebase/firestore";
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
import { useAnalyticsStore } from "src/stores/analytics";
const db = getFirestore();

export default {
  // props: { oldMenu: { default: {} }, liveDraftMenu: { default: {} } },
  data: function () {
    return {
      liveDraftMenu: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      showOnlyDifferences: false,
      menuVersionSelected: 0,
      menuVersions: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  async created() {
    await this.fetchLiveDraftMenu().then(async () => {
      await this.fetchVersions();
    });
  },
  unmounted() {
    this.liveDraftMenu.unsubscribe();
    this.menuVersions.unsubscribe();
  },

  computed: {
    ...mapStores(useFirebaseStore, useAnalyticsStore),
    // menuToBeShown() {
    //   if (this.showOnlyDifferences) return this.differences();
    //   else return this.menuVersions.data[this.menuVersionSelected];
    // },
    /**
     * https://davidwells.io/snippets/get-difference-between-two-objects-javascript
     * Find difference between two objects
     * @param  {object} origObj - Source object to compare newObj against
     * @param  {object} newObj  - New object with potential changes
     * @return {object} differences
     */
    // differences() {
    //   if (this.menuVersions.dataLoaded) {
    //     const origObj = this.oldMenu;
    //     const newObj = this.menuVersions.data[this.menuVersionSelected];

    //     function changes(newObj, origObj) {
    //       let arrayIndexCounter = 0;
    //       return transform(newObj, function (result, value, key) {
    //         if (!isEqual(value, origObj[key])) {
    //           let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
    //           result[resultKey] =
    //             isObject(value) && isObject(origObj[key])
    //               ? changes(value, origObj[key])
    //               : value;
    //         }
    //       });
    //     }
    //     const differences = changes(newObj, origObj);

    //     // We want all the differences to be ordered alphabetically, to make it easier to compare
    //     const differencesOrdered = Object.keys(differences)
    //       .sort()
    //       .reduce((obj, key) => {
    //         obj[key] = differences[key];
    //         return obj;
    //       }, {});

    //     return differencesOrdered;
    //   } else return {};
    // },
    isNewMenu() {
      if (this.liveDraftMenu.data?.lastPublishedServerTimestamp) return false;
      else return true;
    },
    versionLabel: function () {
      if (
        this.menuVersions.dataLoaded &&
        this.menuVersions.data[this.menuVersionSelected]
      ) {
        const date = this.mixin_humanDate(
          this.menuVersions.data[this.menuVersionSelected]
            .lastUpdatedServerTimestamp
        );

        // if (!this.isNewMenu && this.menuVersionSelected === 0) {
        //   return date + " (Published on website)";
        // } else
        if (this.menuVersionSelected === this.menuVersions.data.length - 2) {
          return date + " (Recommended)";
        } else if (
          this.menuVersionSelected ===
          this.menuVersions.data.length - 1
        ) {
          return date + " (Unfinished draft)";
        } else {
          return date;
        }
      } else {
        return "";
      }
    },
  },
  methods: {
    async fetchLiveDraftMenu() {
      return new Promise((resolve, reject) => {
        // To-do: compare differences in menu: https://davidwells.io/snippets/get-difference-between-two-objects-javascript
        this.liveDraftMenu.unsubscribe = onSnapshot(
          doc(db, "menu", "draft"),
          (doc) => {
            if (doc.exists()) {
              this.liveDraftMenu.data = doc.data();
              this.liveDraftMenu.dataLoaded = true;
            } else {
              this.$q.notify("Could not load menu");
            }
            resolve();
          },
          (error) => {
            this.$q.notify("Could not load menu");
            console.error(error);
            reject();
          }
        );
      });
    },
    async fetchVersions() {
      // let versionsQuery = null;
      // if (this.liveDraftMenu.data.lastPublishedServerTimestamp) {
      const versionsQuery = query(
        collection(db, "menu", "draft", "versions"),
        where("status", "==", "review"),
        // orderBy("metadata.createdTimestamp"),
        limit(10)
      );
      // } else {
      //   versionsQuery = query(
      //     collection(db, "menu", "draft", "versions"),
      //     where("status", "==", "review"),
      //     // orderBy("metadata.createdTimestamp"),
      //     limit(10)
      //   );
      // }

      // Now let's fetch the actual data.
      this.menuVersions.unsubscribe = onSnapshot(
        versionsQuery,
        (querySnapshot) => {
          console.log("menuVersions changed");
          // Process the data we just received from the server
          const versions = [];
          querySnapshot.forEach((doc) => {
            console.log("querySnapshot doc", doc.data());

            const data = doc.data();
            const orderedData = {
              ...data,
              sidebar: Object.keys(data.sidebar)
                .sort()
                .reduce((obj, key) => {
                  obj[key] = data.sidebar[key];
                  return obj;
                }, {}),
            };

            versions.push({ ...orderedData, id: doc.id });
          });

          // Add the live draft at the end of the timeline as well

          const orderedLiveDraftMenu = {
            ...this.liveDraftMenu.data,
            sidebar: Object.keys(this.liveDraftMenu.data.sidebar)
              .sort()
              .reduce((obj, key) => {
                obj[key] = this.liveDraftMenu.data.sidebar[key];
                return obj;
              }, {}),
          };

          versions.push(orderedLiveDraftMenu);

          // Add all the versions to the view
          this.menuVersions.data = versions;

          // The selected version is counted as the index of the array (starting with 0). Set the selected version to the last review request (so the one before the live draft)
          this.menuVersionSelected = this.menuVersions.data.length - 2;

          this.menuVersions.dataLoaded = true;
        },
        (error) => {
          this.menuVersions.error = error;
          this.$q.notify("Loading menu versions failed");
          console.log(error);
        }
      );
    },
    acceptVersion: async function () {
      /* TODO: Add check for duplicate path  */
      // - Change to transaction
      // - Check the publishingQueue for an identical path

      const acceptedVersion = this.menuVersions.data[this.menuVersionSelected];

      // } else {
      // Get a new write batch
      const batch = writeBatch(db);

      // 1. Copy the currently selected version to the publishingQueue collection
      const publishingQueueRef = doc(db, "menu", "publishingQueue");
      batch.set(publishingQueueRef, {
        ...acceptedVersion,
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      // 2. Delete all review versions
      this.menuVersions.data.forEach((version) => {
        if (version.status === "review") {
          const reviewVersionRef = doc(
            db,
            "menu",
            "draft",
            "versions",
            version.id
          );
          batch.delete(reviewVersionRef);
        }
      });

      // 3. Set requestedReview to false for the live edit version
      const liveArticleRef = doc(db, "menu", "draft");
      batch.update(liveArticleRef, {
        requestedPublication: false,
        lastPublishedServerTimestamp: serverTimestamp(),
        "metadata.updatedTimestamp": serverTimestamp(),
        "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
      });

      // 4. Create a new version with the status "published"
      const versionID = this.mixin_randomID();
      const versionRef = doc(db, "menu", "draft", "versions", versionID);
      batch.set(versionRef, {
        ...acceptedVersion,
        status: "published",
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      const publishedRef = doc(db, "menu", "published");
      batch.set(
        versionRef,
        {
          ...acceptedVersion,
          status: "published",
          metadata: {
            updatedTimestamp: serverTimestamp(),
            updateddBy: this.firebaseStore.auth.currentUser.uid,
          },
        },
        { merge: true }
      );

      const analyticsRef = doc(db, "app", "analytics");
      batch.update(analyticsRef, {
        menuInPublishingQueue: true,
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      });

      // Commit the batch
      await batch.commit();

      // update analytics locally (it will be updated on server automatically with a counter, but this way we prevent a delay)
      this.analyticsStore.data.menuInPublishingQueue = true;
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
        requestedPublication: false,
        reverted: true,
        "metadata.updatedTimestamp": serverTimestamp(),
        "metadata.updatedBy": this.firebaseStore.auth.currentUser.uid,
      });
      // Commit the batch
      await batch.commit();
    },
  },
};
</script>
