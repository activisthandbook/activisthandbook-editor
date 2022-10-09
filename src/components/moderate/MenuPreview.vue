<template>
  <h2>Sidebar</h2>
  <div
    flat
    class="bg-grey-3 q-mt-sm"
    style="position: sticky; top: 0; z-index: 1"
  >
    <q-card-section>
      <div class="text-bold">Compare versions:</div>
      <div class="q-px-xs" v-if="menuVersions.dataLoaded && menuVersions.data">
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
        <span v-if="isNewMenu">First edit</span>
        <span v-else>On website now</span>
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
  </div>

  <div class="flex items-center q-mt-sm">
    <q-toggle v-model="showOnlyDifferences" color="secondary" /> Only show
    differences with website
    <div class="text-caption">
      Note: if this setting is on, items that have been removed are not shown!
    </div>
  </div>

  <div class="q-gutter-y-md q-my-md">
    <q-card
      v-for="(menuItem, index) in menuToBeShown.sidebar"
      :key="menuItem.id"
      class="bg-accent"
    >
      <q-card-section>
        <div class="text-bold">{{ index }}</div>
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
</template>
<script>
import { transform, isEqual, isArray, isObject } from "lodash";

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
const db = getFirestore();

export default {
  props: { oldMenu: { default: {} }, liveDraftMenu: { default: {} } },
  data: function () {
    return {
      showOnlyDifferences: true,
      menuVersionSelected: 1,
      menuVersions: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  mounted() {
    this.fetchVersions();
  },
  computed: {
    menuToBeShown() {
      if (this.showOnlyDifferences) return this.differences;
      else return this.menuVersions.data[this.menuVersionSelected];
    },
    /**
     * https://davidwells.io/snippets/get-difference-between-two-objects-javascript
     * Find difference between two objects
     * @param  {object} origObj - Source object to compare newObj against
     * @param  {object} newObj  - New object with potential changes
     * @return {object} differences
     */
    differences() {
      if (this.menuVersions.dataLoaded) {
        const origObj = this.oldMenu;
        const newObj = this.menuVersions.data[this.menuVersionSelected];

        function changes(newObj, origObj) {
          let arrayIndexCounter = 0;
          return transform(newObj, function (result, value, key) {
            if (!isEqual(value, origObj[key])) {
              let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
              result[resultKey] =
                isObject(value) && isObject(origObj[key])
                  ? changes(value, origObj[key])
                  : value;
            }
          });
        }
        const differences = changes(newObj, origObj);

        // We want all the differences to be ordered alphabetically, to make it easier to compare
        const differencesOrdered = Object.keys(differences)
          .sort()
          .reduce((obj, key) => {
            obj[key] = differences[key];
            return obj;
          }, {});

        return differencesOrdered;
      } else return {};
    },
    isNewMenu() {
      if (this.liveDraftMenu.lastPublishedServerTimestamp) return false;
      else return true;
    },
    versionLabel: function () {
      if (this.menuVersions.dataLoaded) {
        const date = this.mixin_humanDate(
          this.menuVersions.data[this.menuVersionSelected]
            .lastUpdatedServerTimestamp
        );

        if (!this.isNewMenu && this.menuVersionSelected === 0) {
          return date + " (Published on website)";
        } else if (
          this.menuVersionSelected ===
          this.menuVersions.data.length - 2
        ) {
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
    fetchVersions() {
      let versionsQuery = null;
      if (this.liveDraftMenu.lastPublishedServerTimestamp) {
        versionsQuery = query(
          collection(db, "menu", "draft", "versions"),
          orderBy("lastUpdatedServerTimestamp"),
          where(
            "lastUpdatedServerTimestamp",
            ">=",
            this.liveDraftMenu.lastPublishedServerTimestamp
          ),
          limit(10)
        );
      } else {
        versionsQuery = query(
          collection(db, "menu", "draft", "versions"),
          orderBy("lastUpdatedServerTimestamp"),
          limit(10)
        );
      }

      // Now let's fetch the actual data.
      this.menuVersions.unsubscribe = onSnapshot(
        versionsQuery,
        (querySnapshot) => {
          // Process the data we just received from the server
          const versions = [];
          querySnapshot.forEach((doc) => {
            versions.push({ ...doc.data(), id: doc.id });
          });

          // Add the live draft at the end of the timeline as well

          const orderedLiveDraftMenu = Object.keys(this.liveDraftMenu)
            .sort()
            .reduce((obj, key) => {
              obj[key] = this.liveDraftMenu[key];
              return obj;
            }, {});

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
  },
};
</script>
