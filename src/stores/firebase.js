import { defineStore } from "pinia";

import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, setUserId } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
// import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getPerformance } from "firebase/performance";

import { Notify } from "quasar";

// SELF-HOSTING CONFIG: When hosting yourself, make sure to edit this configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9JdsMNlyu_10H7JU5M-nft_EVnoq8OOw",
  authDomain: "rebeltools-write.firebaseapp.com",
  projectId: "rebeltools-write",
  databaseURL:
    "https://rebeltools-write-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "rebeltools-write.appspot.com",
  messagingSenderId: "901019837865",
  appId: "1:901019837865:web:62160cdfcc47fe960f10b8",
};

export const useFirebaseStore = defineStore("firebase", {
  state: () => ({
    auth: null,
    functions: null,
    // database: null,
    firestore: null,
    userAuthenticated: false,
    userLoaded: false,
  }),

  actions: {
    async initialize() {
      /* 🔥 INITIALISE FIREBASE
      Docs: https://firebase.google.com/docs/web/setup
      */
      const firebaseApp = initializeApp(firebaseConfig);

      // 🔥 INITIALISE REALTIME DATABASE
      // this.database = getDatabase(firebaseApp);

      /* 🔥 INITIALISE FUNCTIONS
      Docs: https://firebase.google.com/docs/web/setup
      */
      this.functions = getFunctions(firebaseApp, "europe-west1");

      /* 🔥 INITIALISE STORAGE
      Docs: https://firebase.google.com/docs/web/setup
      */
      this.firestore = getStorage(firebaseApp);

      /* 📈 INITIALISE GOOGLE ANALYTICS
      Docs: https://firebase.google.com/docs/analytics
      */
      // store.commit("firebase/addAnalytics", getAnalytics(firebaseApp));

      this.auth = getAuth();

      onAuthStateChanged(this.auth, (user) => {
        this.userLoaded = true;
        if (user) {
          this.userAuthenticated = true;

          /* SIGNIN SUCCESFUL ✅
          User is signed in, see docs for a list of available properties:
          https://firebase.google.com/docs/reference/js/firebase.User */
          /* Future logged events will be linked to the user ID:
          https://firebase.google.com/docs/analytics/userid */
          // setUserId(store.state.firebase.analytics, user.uid);
        } else {
          this.userAuthenticated = false;
          // NOT SIGNED IN ❌
        }
      });

      /* 📶 OFFLINE PERSISTANCE FIRESTORE
      Docs: https://firebase.google.com/docs/firestore/manage-data/enable-offline
      */
      // enableIndexedDbPersistence(getFirestore()).catch((err) => {
      //   if (err.code === "failed-precondition") {
      //     /* Multiple tabs open, persistence can only be enabled in one tab at a a time. */
      //   } else if (err.code === "unimplemented") {
      //     /* The current browser does not support all of the features required to enable persistence */
      //   }
      // });

      /* 🤖 RECAPTCHA APP CHECK
      Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this key is the counterpart to the secret key you set in the Firebase console.
      Docs: https://firebase.google.com/docs/app-check
      */
      // await initializeAppCheck(firebaseApp, {
      //   provider: new ReCaptchaV3Provider(
      //     "6LckPKsdAAAAALrvsVbXnI-j5doL4S_792D7jpb0"
      //   ),

      //   /* Optional argument. If true, the SDK automatically refreshes App Check tokens as needed. */
      //   isTokenAutoRefreshEnabled: true,
      // });

      /* 🤖 PERFORNANCE MONITORING
       */
      getPerformance(firebaseApp);
    },
  },
});
