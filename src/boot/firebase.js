import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, setUserId } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ store }) => {
  // ..

  /* 🔥 INITIALISE FIREBASE
  Docs: https://firebase.google.com/docs/web/setup
  */
  const firebaseApp = initializeApp(firebaseConfig);

  // 🔥 INITIALISE REALTIME DATABASE
  const database = getDatabase(firebaseApp);

  /* 🔥 INITIALISE FUNCTIONS
  Docs: https://firebase.google.com/docs/web/setup
  */
  store.commit(
    "firebase/addFunctions",
    getFunctions(firebaseApp, "europe-west1")
  );

  /* 🔥 INITIALISE STORAGE
  Docs: https://firebase.google.com/docs/web/setup
  */
  // store.commit("firebase/addStorage", getStorage(firebaseApp));

  /* 📈 INITIALISE GOOGLE ANALYTICS
  Docs: https://firebase.google.com/docs/analytics
  */
  // store.commit("firebase/addAnalytics", getAnalytics(firebaseApp));

  /* 🔐 FIREBASE AUTHENTICATION
  Docs: https://firebase.google.com/docs/auth
  */

  // signInAnonymously(getAuth())
  //   .then((response) => {
  //     // Signed in with anonymous account
  //     store.commit("auth/signin", response.user);
  //   })
  //   .catch((error) => {
  //     // const errorCode = error.code;
  //     Notify.create({
  //       message: error.message + " (firebase.js)",
  //       icon: "mdi-alert",
  //     });
  //   });
  store.commit("firebase/addAuth", getAuth());

  onAuthStateChanged(store.state.firebase.auth, (user) => {
    if (user) {
      /* SIGNIN SUCCESFUL ✅
      User is signed in, see docs for a list of available properties:
      https://firebase.google.com/docs/reference/js/firebase.User */
      // Store the user data in Vuex
      store.commit("auth/signin", user);
      store.dispatch("currentCustomer/subscribeToDatabase");
      /* Future logged events will be linked to the user ID:
      https://firebase.google.com/docs/analytics/userid */
      // setUserId(store.state.firebase.analytics, user.uid);
    } else {
      store.commit("auth/destroy");
      /* NOT SIGNED IN ❌
      This may seem a bit counterintuitive, but we always want to make sure users are signed in. Even if they don't have an account, we will sign them in, but with an anonymous Firebase account. */
      // Log 'signout' event to analytics
      // logEvent(store.state.firebase.analytics, "signout");
      // ..
    }
  });

  /* 📶 OFFLINE PERSISTANCE FIRESTORE
  Docs: https://firebase.google.com/docs/firestore/manage-data/enable-offline
  */
  enableIndexedDbPersistence(getFirestore()).catch((err) => {
    if (err.code === "failed-precondition") {
      /* Multiple tabs open, persistence can only be enabled in one tab at a a time. */
    } else if (err.code === "unimplemented") {
      /* The current browser does not support all of the features required to enable persistence */
    }
  });

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
});
