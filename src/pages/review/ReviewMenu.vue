<template>menu</template>
<script>
import {
  collection,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
const db = getFirestore();

export default {
  data() {
    return {
      menu: {
        data: null,
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
    };
  },
  created: function () {
    this.fetchMenu();
  },
  unmounted() {
    this.menu.unsubscribe();
  },
  methods: {
    async fetchMenu() {
      // To-do: compare differences in menu: https://davidwells.io/snippets/get-difference-between-two-objects-javascript
      this.menu.unsubscribe = onSnapshot(
        doc(db, "menu", "draft"),
        (doc) => {
          if (doc.exists()) {
            this.menu.data = doc.data();
            this.menu.dataLoaded = true;
          } else {
            this.$q.notify("Could not load menu");
          }
        },
        (error) => {
          this.$q.notify("Could not load menu");
          console.error(error);
        }
      );
    },
  },
};
</script>
