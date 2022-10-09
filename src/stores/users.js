import { defineStore } from "pinia";

import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
const db = getFirestore();

export const useUsersStore = defineStore("users", {
  state: () => ({
    // Each [userID] has the following components
    loadStarted: {},
    data: {},
    dataLoaded: {},
    error: {},
    unsubscribe: {},
  }),
  actions: {
    async fetchUser(userID) {
      if (!this.loadStarted[userID]) {
        this.loadStarted[userID] = true;

        const userRef = doc(db, "users", userID);

        this.unsubscribe[userID] = await onSnapshot(
          userRef,
          (docSnapshot) => {
            this.data[userID] = docSnapshot.data();
            this.dataLoaded[userID] = true;
          },
          (error) => {
            this.error[userID] = error;
          }
        );
      }
    },
    async unsubscribeUser(userID) {
      if (this.unsubscribe[userID]) this.unsubscribe[userID]();

      delete this.loadStarted[userID];
      delete this.data[userID];
      delete this.dataLoaded[userID];
      delete this.error[userID];
      delete this.unsubscribe[userID];
    },
    async saveUser(userID) {
      await setDoc(
        doc(db, "users", userID),
        {
          ...this.data[userID],
          lastUpdatedServerTimestamp: serverTimestamp(),
        },
        { merge: true }
      ).catch((error) => {
        Notify.create("Saving user failed");
        console.error(error);
      });
    },
  },
});
