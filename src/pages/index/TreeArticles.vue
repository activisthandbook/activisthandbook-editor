<template>
  <q-card class="bg-accent">
    <q-toolbar>
      <q-avatar
        icon="mdi-home"
        v-if="currentFolder.split('/').length < 3"
        class="q-ml-xs"
        text-color="grey"
      />
      <q-btn
        v-else
        flat
        round
        icon="mdi-arrow-left"
        @click="openSuperFolder()"
      />
      <q-toolbar-title class="text-caption text-grey">
        {{ currentFolder }}
      </q-toolbar-title>
    </q-toolbar>

    <q-list>
      <div
        v-for="(set, indexSet) in scrollSet"
        :key="indexSet"
        v-scroll-fire="fetchArticles(this.currentFolder)"
      >
        <q-card-section v-if="!set.dataLoaded" class="q-pa-xl text-center">
          <q-spinner size="32px" />
        </q-card-section>
        <q-card-section v-else-if="!set.data.length && scrollSet.length === 1"
          >No articles in this folder.</q-card-section
        >
        <div v-else v-for="(article, indexData) in set.data" :key="article.id">
          <q-item clickable class="q-py-md" @click="openFolder(article)">
            <q-item-section avatar>
              <q-avatar icon="mdi-folder" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-bold">/{{ article.path }}</q-item-label>
              <q-item-label>{{ article.title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="mdi-pencil"
                round
                flat
                :to="{ name: 'Edit', params: { articleID: article.id } }"
              />
            </q-item-section>
          </q-item>
          <q-separator
            v-if="
              !(
                indexSet === scrollSet.length - 2 &&
                indexData === set.data.length - 1
              )
            "
          />
        </div>
      </div>
    </q-list>
  </q-card>
</template>
<script>
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";
const db = getFirestore();

export default {
  props: ["folder"],
  data: function () {
    return {
      scrollSet: [],
      currentFolder: "en/",
    };
  },
  async mounted() {
    this.currentFolder = this.folder;
    await this.fetchArticles(this.folder);
  },
  unmounted() {
    this.destroy();
  },
  methods: {
    destroy() {
      this.scrollSet.forEach((set) => {
        set.unsubscribe();
      });
      this.scrollSet.splice(0);
    },
    async openSuperFolder() {
      const newArray = this.currentFolder.split("/").slice(0, -2);

      const superFolder = newArray.join("/") + "/";
      this.destroy();
      this.currentFolder = superFolder;
      await this.fetchArticles(superFolder);
    },
    async openFolder(article) {
      console.log("test");
      const newFolder = article.langCode + "/" + article.path + "/";
      this.currentFolder = newFolder;
      this.destroy();
      await this.fetchArticles(this.currentFolder);
    },
    async fetchArticles(folder) {
      try {
        // console.log("fetch");
        let q = null;
        if (this.scrollSet.length) {
          // await this.scrollSet.at(-1).promise.then(async () => {
          // console.log("a", this.scrollSet.at(-1).snapshot.docs);

          if (!this.scrollSet.at(-1).data?.length) {
            throw "End of list";
          }
          const lastVisible =
            this.scrollSet.at(-1).snapshot.docs[
              this.scrollSet.at(-1).snapshot.size - 1
            ];

          q = query(
            collection(db, "articles_draft"),
            where("inFolder", "==", folder),
            orderBy("path"),
            startAfter(lastVisible),
            limit(10)
          );
          // });
        } else {
          q = query(
            collection(db, "articles_draft"),
            where("inFolder", "==", folder),
            orderBy("path"),
            limit(10)
          );
        }

        this.scrollSet.push({
          data: null,
          dataLoaded: false,
          error: null,
          unsubscribe: null,
          docs: null,
        });

        // this.scrollSet.at(-1).promise = new Promise(async (resolve, reject) => {
        this.scrollSet.at(-1).unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const articles = [];
            querySnapshot.forEach((doc) => {
              articles.push(doc.data());
            });
            this.scrollSet.at(-1).snapshot = querySnapshot;
            this.scrollSet.at(-1).data = articles;
            this.scrollSet.at(-1).dataLoaded = true;
          },
          (error) => {
            this.scrollSet.at(-1).error = error;
            console.log(error);
          }
        );
        // });
      } catch (error) {
        if (error !== "End of list") console.error(error);
      }
    },
  },
};
</script>
