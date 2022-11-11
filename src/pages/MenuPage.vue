<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <AppSwitcher />
        <q-toolbar-title>Menu</q-toolbar-title>
        <!-- <q-space /> -->

        <q-btn
          no-caps
          color="primary"
          icon="mdi-check"
          class="q-ml-sm"
          @click="publish()"
          :disable="requestedPublicationTimestamp > lastUpdatedTimestampMillis"
        >
          <span class="q-ml-sm"> Publish </span>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mb-xl">
          <q-card flat class="bg-grey-2 q-my-lg">
            <q-card-section>
              <div class="text-bold q-mb-sm">Select menu language</div>
              <LanguageSelector
                v-model="lang"
                :options="languagesStore.languages"
                autofocus
              />
            </q-card-section>
          </q-card>

          <div v-if="selectedLangCode" class="q-gutter-md">
            <!-- <h1>Top navigation</h1>
            <div>
              <div
                v-if="!nav_menuItems || !nav_menuItems[selectedLangCode]"
                class="q-mb-md text-italic"
              >
                No navigation items have been added yet.
              </div>
              <div class="q-mb-sm" v-else>
                <SlickList
                  axis="y"
                  :list="nav_menuItems[selectedLangCode]"
                  useDragHandle
                  lockAxis="y"
                  helperClass="drag-item"
                  @update:list="nav_updateParentOrder($event)"
                >
                  <SlickItem
                    v-for="(menuItem, index) in nav_menuItems[selectedLangCode]"
                    :key="menuItem.id"
                    :index="index"
                  >
                    <NavigationMenuItem
                      :menu="menuItem"
                      :group="nav_accordionGroupID"
                      @update="nav_update($event, index)"
                      @delete="nav_deleteItem(index)"
                      :touched="touched"
                    />
                  </SlickItem>
                </SlickList>
              </div>
              <q-btn
                label="Add item"
                no-caps
                color="secondary"
                icon="mdi-plus"
                @click="nav_addItem()"
              />
            </div> -->

            <h1 class="q-mt-lg">Sidebar</h1>

            <div>
              <div
                v-if="
                  !sidebar_menuItems || !sidebar_menuItems[selectedLangCode]
                "
                class="q-mb-md text-italic"
              >
                No sidebar items have been added yet.
              </div>
              <div class="q-mb-sm" v-else>
                <SlickList
                  axis="y"
                  :list="sidebar_menuItems[selectedLangCode]"
                  useDragHandle
                  lockAxis="y"
                  helperClass="drag-item"
                  @update:list="sidebar_updateParentOrder($event)"
                >
                  <SlickItem
                    v-for="(menuItem, index) in sidebar_menuItems[
                      selectedLangCode
                    ]"
                    :key="menuItem.id"
                    :index="index"
                  >
                    <NavigationMenuItem
                      :menu="menuItem"
                      :group="sidebar_accordionGroupID"
                      @update="sidebar_update($event, index)"
                      @delete="sidebar_deleteItem(index)"
                      :touched="touched"
                    />
                  </SlickItem>
                </SlickList>
              </div>
              <q-btn
                label="Add item"
                no-caps
                color="secondary"
                icon="mdi-plus"
                @click="sidebar_addItem()"
              />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import LanguageSelector from "components/LanguageSelector.vue";

import _ from "lodash";

import {
  getFirestore,
  setDoc,
  getDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
const db = getFirestore();

import { mapStores } from "pinia";
import { useLanguagesStore } from "stores/languages";

import NavigationMenuItem from "components/NavigationMenuItem.vue";
import AppSwitcher from "components/AppSwitcher.vue";

import { SlickList, SlickItem } from "vue-slicksort";

export default {
  name: "MenuPage",
  // directives: { handle: HandleDirective },
  components: {
    SlickList,
    SlickItem,
    NavigationMenuItem,
    LanguageSelector,
    AppSwitcher,
  },

  data: function () {
    return {
      lang: {
        code: "en",
        EnglishName: "English",
        direction: "ltr",
        localName: "English",
      },
      selectedLangCode: "en",
      menuDataLoaded: false,

      // Data
      nav_menuItems: {},
      sidebar_menuItems: {},
      requestedPublication: null,
      requestedPublicationTimestamp: null,
      lastUpdatedTimestampMillis: null,
      nav_trackChanges: [],
      sidebar_trackChanges: [],

      nav_accordionGroupID: this.mixin_randomID(),
      sidebar_accordionGroupID: this.mixin_randomID(),

      touched: false,
      dragging: false,
    };
  },
  async mounted() {
    await this.fetchMenu();
  },
  computed: {
    // note we are not passing an array, just one store after the other
    // each store will be accessible as its id + 'Store'
    ...mapStores(useLanguagesStore),
  },
  watch: {
    lang: {
      handler(newLang) {
        this.updateLangCode(newLang);
      },
      deep: true,
    },
    nav_menuItems: {
      handler() {
        // This is not triggered for changes in the order of parent items. So we have a separate function for that 'updateParentOrder()'
        this.nav_updateTrackChanges();
        this.nav_save();
      },
      deep: true,
    },
    sidebar_menuItems: {
      handler() {
        // This is not triggered for changes in the order of parent items. So we have a separate function for that 'updateParentOrder()'
        this.sidebar_updateTrackChanges();
        this.sidebar_save();
      },
      deep: true,
    },
  },
  methods: {
    async fetchMenu() {
      await getDoc(doc(db, "menu", "draft"))
        .then(async (snapshot) => {
          if (snapshot.exists()) {
            if (snapshot.data().nav) this.nav_menuItems = snapshot.data().nav;
            if (snapshot.data().sidebar)
              this.sidebar_menuItems = snapshot.data().sidebar;

            if (snapshot.data().requestedPublication)
              this.requestedPublication = snapshot.data().requestedPublication;
            if (snapshot.data().requestedPublicationTimestamp)
              this.requestedPublicationTimestamp = snapshot
                .data()
                .requestedPublicationTimestamp.toMillis();
            if (snapshot.data().lastUpdatedServerTimestamp)
              this.lastUpdatedServerTimestamp = snapshot
                .data()
                .lastUpdatedServerTimestamp.toMillis();

            this.menuDataLoaded = true;
            this.$q.loadingBar.stop();
          } else {
            this.$q.notify("Could not load menu");
            this.$q.loadingBar.stop();
          }
        })
        .catch((error) => {
          this.$q.notify("Could not load menu");
          console.error(error);
        });
    },
    async updateLangCode(newLang) {
      this.selectedLangCode = null;
      this.touched = false;

      setTimeout(() => {
        // Hacky solution to the view not updating sometimes when selectedLangCode changes
        if (newLang) {
          this.selectedLangCode = newLang.code;
        } else {
          this.selectedLangCode = null;
        }
      }, 10);
    },
    // NAV
    nav_updateParentOrder(newMenu) {
      this.nav_menuItems[this.selectedLangCode] = newMenu;
      this.nav_updateTrackChanges();
      this.nav_save();
    },
    nav_update(event, index) {
      if (event) {
        this.nav_menuItems[this.selectedLangCode][index].items = event;
      } else this.nav_menuItems[this.selectedLangCode][index].items = [];
    },
    nav_addItem() {
      if (this.nav_menuItems && this.nav_menuItems[this.selectedLangCode]) {
        this.nav_menuItems[this.selectedLangCode].push({
          text: "",
          id: this.mixin_randomID(),
        });
      } else {
        this.nav_menuItems[this.selectedLangCode] = [
          { text: "", id: this.mixin_randomID() },
        ];
      }
    },

    nav_deleteItem(index) {
      this.nav_menuItems[this.selectedLangCode].splice(index, 1);
    },
    nav_updateTrackChanges() {
      if (
        this.selectedLangCode &&
        !this.nav_trackChanges.includes(this.selectedLangCode)
      ) {
        this.touched = true;
        this.nav_trackChanges.push(this.selectedLangCode);
        const d = new Date();
        this.lastUpdatedTimestampMillis = d.getTime()();
      }
    },
    nav_save: _.throttle(async function () {
      if (this.nav_trackChanges.length) {
        // To reduce bandwidth, we're only pushing the changed languages.
        let newMenu = {};
        this.nav_trackChanges.forEach((languageCode) => {
          newMenu[languageCode] = this.nav_menuItems[languageCode];
        });

        await setDoc(
          doc(db, "menu", "draft"),
          {
            nav: { ...newMenu },
            lastUpdatedServerTimestamp: serverTimestamp(),
          },
          { merge: true }
        )
          .then(() => {
            console.log("nav menu saved");
          })
          .catch((error) => {
            this.$q.notify("nav menu saving failed");
            console.error(error);
          });
      }
    }, 4000),

    // SIDEBAR
    sidebar_updateParentOrder(newMenu) {
      this.sidebar_menuItems[this.selectedLangCode] = newMenu;
      this.sidebar_updateTrackChanges();
      this.sidebar_save();
    },
    sidebar_update(event, index) {
      if (event) {
        this.sidebar_menuItems[this.selectedLangCode][index].items = event;
      } else this.sidebar_menuItems[this.selectedLangCode][index].items = [];
    },
    sidebar_addItem() {
      if (
        this.sidebar_menuItems &&
        this.sidebar_menuItems[this.selectedLangCode]
      ) {
        this.sidebar_menuItems[this.selectedLangCode].push({
          text: "",
          id: this.mixin_randomID(),
        });
      } else {
        this.sidebar_menuItems[this.selectedLangCode] = [
          { text: "", id: this.mixin_randomID() },
        ];
      }
    },

    sidebar_deleteItem(index) {
      this.sidebar_menuItems[this.selectedLangCode].splice(index, 1);
    },
    sidebar_updateTrackChanges() {
      if (
        this.selectedLangCode &&
        !this.sidebar_trackChanges.includes(this.selectedLangCode)
      ) {
        this.touched = true;
        this.sidebar_trackChanges.push(this.selectedLangCode);
        const d = new Date();
        this.lastUpdatedTimestampMillis = d.getTime();
      }
    },
    sidebar_save: _.throttle(async function () {
      if (this.sidebar_trackChanges.length) {
        // To reduce bandwidth, we're only pushing the changed languages.
        let newMenu = {};
        this.sidebar_trackChanges.forEach((languageCode) => {
          newMenu[languageCode] = this.sidebar_menuItems[languageCode];
        });
        await setDoc(
          doc(db, "menu", "draft"),
          {
            sidebar: { ...newMenu },
            lastUpdatedServerTimestamp: serverTimestamp(),
          },
          { merge: true }
        )
          .then(() => {
            console.log("sidebar menu saved");
          })
          .catch((error) => {
            this.$q.notify("sidebar menu saving failed");
            console.error(error);
          });
      }
    }, 4000),
    async publish() {
      const time = Date.now();

      const batch = writeBatch(db);

      // 1. Create new version
      const versionID = this.mixin_randomID();
      const versionRef = doc(db, "menu", "draft", "versions", versionID);

      batch.set(
        versionRef,
        {
          sidebar: this.sidebar_menuItems,
          nav: this.nav_menuItems,
          lastUpdatedServerTimestamp: serverTimestamp(),
          id: versionID,
          status: "review",
        },
        {
          merge: true,
        }
      );

      // 2. Update live draft
      batch.set(
        doc(db, "menu", "draft"),
        {
          requestedPublication: true,
          requestedPublicationTimestamp: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      await batch.commit().then(() => {
        this.requestedPublication = true;
        this.requestedPublicationTimestamp = time;
      });
    },
  },
};
</script>
<style lang="scss">
.q-card {
  transition: 0.5s box-shadow;
}
.drag-item > div > .q-card {
  box-shadow: $shadow-9;
}
</style>
