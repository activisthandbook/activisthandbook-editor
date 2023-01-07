import { defineStore } from "pinia";

import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
const db = getFirestore();

import { Notify } from "quasar";

export const useUsersStore = defineStore("users", {
  state: () => ({
    profile: {
      loadStarted: {},
      data: {},
      dataLoaded: {},
      doesNotExist: {},
      error: {},
      unsubscribe: {},
    },
    recentArticles: {
      loadStarted: {},
      data: {},
      dataLoaded: {},
      error: {},
      unsubscribe: {},
    },
  }),
  actions: {
    // USER
    async fetchUser(userID, settings) {
      if (!this.profile.loadStarted[userID]) {
        return new Promise(async (resolve, reject) => {
          this.profile.loadStarted[userID] = true;

          const userRef = doc(db, "users_profile", userID);

          this.profile.unsubscribe[userID] = await onSnapshot(
            userRef,
            async (docSnapshot) => {
              if (docSnapshot.exists()) {
                this.profile.data[userID] = docSnapshot.data();
              } else {
                this.profile.data[userID] = {};
                this.profile.doesNotExist[userID] = true;
                let query = null;
                if (this.router.currentRoute.value.path !== "/start") {
                  query = { next: this.router.currentRoute.value.fullPath };
                }
                await this.router.push({
                  name: "Start",
                  query: query,
                });
              }
              this.profile.dataLoaded[userID] = true;
              resolve();
            },
            (error) => {
              this.profile.error[userID] = error;
              console.log(error);
              reject(error);
            }
          );
        });
      }
    },
    async unsubscribeUser(userID) {
      if (this.profile.unsubscribe[userID]) this.profile.unsubscribe[userID]();

      if (this.recentArticles.unsubscribe[userID]) {
        this.recentArticles.unsubscribe[userID].forEach((unsubscribe) => {
          unsubscribe();
          console.log("recentArticle unsubscribed");
        });
      }

      delete this.profile.loadStarted[userID];
      delete this.profile.data[userID];
      delete this.profile.dataLoaded[userID];
      delete this.profile.error[userID];
      delete this.profile.unsubscribe[userID];
    },
    async saveUser(userID) {
      let data = {
        ...this.profile.data[userID],
        metadata: {
          updatedTimestamp: serverTimestamp(),
          updatedBy: userID,
        },
      };
      if (!this.profile.data[userID].metadata?.createdTimestamp) {
        console.log("created");
        data.metadata.createdTimestamp = serverTimestamp();
        data.metadata.createdBy = userID;
      }
      await setDoc(doc(db, "users_profile", userID), data, {
        merge: true,
      }).catch((error) => {
        Notify.create("Saving user failed");
        console.error(error);
      });
    },
    // RECENT ARTICLES
    async fetchRecentArticles(userID) {
      if (this.profile.data[userID].recentlyEditedArticles) {
        const maxRecentArticles = 5;

        this.recentArticles.data[userID] = [];
        this.recentArticles.unsubscribe[userID] = [];

        let articlesToAdd = [];

        let loopCount = 0;
        let asyncLoopCount = 0;

        await this.profile.data[userID].recentlyEditedArticles
          .slice()
          .reverse()
          .forEach(async (articleID) => {
            loopCount++;
            if (loopCount <= maxRecentArticles) {
              const docSnap = await getDoc(
                doc(db, "articles_draft", articleID)
              );

              if (docSnap.exists()) {
                articlesToAdd.push(docSnap.data());
              }

              asyncLoopCount++;

              if (
                asyncLoopCount === maxRecentArticles - 1 ||
                asyncLoopCount ===
                  this.profile.data[userID].recentlyEditedArticles.length
              ) {
                this.recentArticles.data[userID] = articlesToAdd;
                this.recentArticles.dataLoaded[userID] = true;
              }
            }
          });

        // if (this.profile.data[userID].recentlyEditedArticles.length > 10) {
        //   const numberTooMany =
        //     this.profile.data[userID].recentlyEditedArticles.length - 10;

        //   this.profile.data[userID].recentlyEditedArticles.splice(
        //     0,
        //     numberTooMany
        //   );

        //   await setDoc(
        //     doc(db, "users_profile", userID),
        //     {
        //       recentlyEditedArticles:
        //         this.profile.data[userID].recentlyEditedArticles,
        //     },
        //     { merge: true }
        //   ).catch((error) => {
        //     Notify.create("Saving recent edits failed");
        //     console.error(error);
        //   });
        // }

        // console.log(articlesToAdd);

        // console.log("test", articlesToAdd);

        // this.recentArticles.data[userID] = articlesToAdd;

        // this.recentArticles.dataLoaded[userID] = true;
      } else {
        this.recentArticles.dataLoaded[userID] = true;
        this.recentArticles.error[userID] = new Error("No articles found");
      }
    },
    destroyRecentArticles(userID) {
      this.recentArticles.data[userID] = [];
      this.recentArticles.dataLoaded[userID] = false;
    },
  },
});
