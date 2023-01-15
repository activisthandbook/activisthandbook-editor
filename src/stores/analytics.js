import { defineStore } from "pinia";

import { getFirestore, doc, onSnapshot, connectFirestoreEmulator } from "firebase/firestore";
const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);

export const useAnalyticsStore = defineStore("analytics", {
  state: () => ({
    data: null,
    dataLoaded: null,
    error: null,
    unsubscribe: null,
  }),
  actions: {
    async fetchAnalytics() {
      const moderatorRef = doc(db, "app", "analytics");

      this.unsubscribe = await onSnapshot(
        moderatorRef,
        (docSnapshot) => {
          this.data = docSnapshot.data();
          this.dataLoaded = true;
        },
        (error) => {
          this.error = error;
          console.log(error);
        }
      );
    },
  },
});
