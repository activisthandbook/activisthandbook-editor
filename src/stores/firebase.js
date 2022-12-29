import { defineStore } from "pinia";

import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
// import { getAnalytics, logEvent, setUserId } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
// import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getPerformance } from "firebase/performance";

import { Notify } from "quasar";

// SELF-HOSTING CONFIG: When hosting yourself, make sure to edit this configuration

// Dev environment
const firebaseConfigDev = {
  apiKey: "AIzaSyD9JdsMNlyu_10H7JU5M-nft_EVnoq8OOw",
  authDomain: "rebeltools-write.firebaseapp.com",
  projectId: "rebeltools-write",
  databaseURL:
    "https://rebeltools-write-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "rebeltools-write.appspot.com",
  messagingSenderId: "901019837865",
  appId: "1:901019837865:web:62160cdfcc47fe960f10b8",
};

// Production environment
const firebaseConfigProduction = {
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
    userVerificationLoading: false,
  }),

  actions: {
    async initialize() {
      /* 🔥 INITIALISE FIREBASE
      Docs: https://firebase.google.com/docs/web/setup
      */
      this.firebaseApp = null;
      if (process.env.DEV) {
        console.log(`DEV SERVER`);
        this.firebaseApp = initializeApp(firebaseConfigDev);
      } else {
        this.firebaseApp = initializeApp(firebaseConfigProduction);
      }

      // 🔥 INITIALISE REALTIME DATABASE
      // this.database = getDatabase(firebaseApp);

      /* 🔥 INITIALISE FUNCTIONS
      Docs: https://firebase.google.com/docs/web/setup
      */
      this.functions = getFunctions(this.firebaseApp, "europe-west1");

      /* 📈 INITIALISE GOOGLE ANALYTICS
      Docs: https://firebase.google.com/docs/analytics
      */
      // this.analytics = getAnalytics(firebaseApp);

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
      getPerformance(this.firebaseApp);
    },
    async signOut() {
      this.userLoaded = false;
      this.userAuthenticated = false;

      await signOut(this.auth)
        .then(() => {
          // Sign-out successful.
          Notify.create({
            message: "Signout succesful",
            icon: "mdi-check",
          });
        })
        .catch((error) => {
          // An error happened.
          console.log(error);
        });
    },
    /* 💌 SEND VERIFICATION EMAIL
    Docs: https://firebase.google.com/docs/auth/web/email-link-auth#send_an_authentication_link_to_the_users_email_address
    */
    async sendVerificationEmail(email) {
      // event.preventDefault();
      const actionCodeSettings = {
        /* URL you want to redirect back to. The domain (www.example.com) for this URL must be in the authorized domains list in the Firebase Console. */
        url: window.location.href,
        // url: window.location.origin + "/start?next=" + window.location.pathname,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings)
        .then(() => {
          /* ✅ SUCCESS: The link was successfully sent. Inform the user. Save the email locally so you don't need to ask the user for it again if they open the link on the same device. */
          window.localStorage.setItem("emailForSignIn", email);
          Notify.create({
            message: "Verification email sent",
            icon: "mdi-email-check",
          });

          // logEvent(getAnalytics(), "verification_email_sent");

          return true;
        })
        .catch((error) => {
          /* ❌ ERROR: Notify user of error (as a last resort). */
          console.error(error);

          throw new Error(error);
        });
    },

    /* 🔐 SIGN IN USING EMAIL LINK
    Docs: https://firebase.google.com/docs/auth/web/email-link-auth#completing_sign-in_in_a_web_page
    */
    async signInWithEmailLink() {
      // Confirm the link is a sign-in with email link.
      if (isSignInWithEmailLink(this.auth, window.location.href)) {
        this.userVerificationLoading = true;

        /* Additional state parameters can also be passed via URL. This can be used to continue the user's intended action before triggering the sign-in operation. */

        /* Get the email. This should be available if the user completes the flow on the same device where they started it. */
        let email = window.localStorage.getItem("emailForSignIn");

        if (!email) {
          /* LINK OPENED ON NEW DEVICE
          User opened the link on a different device. To prevent session fixation attacks, ask the user to provide the associated email again. For example: */
          email = window.prompt("Please provide your email for confirmation");

          // 👉 TO-DO: Make this more user friendly using Quasar dialog
        }

        // The client SDK will parse the code from the link for you.
        await signInWithEmailLink(this.auth, email, window.location.href)
          .then((result) => {
            this.userVerificationLoading = false;
            /* ✅ SUCCESS
            - You can access the new user via result.user.
            - Additional user info profile not available via: result.additionalUserInfo.profile == null
            - You can check if the user is new or existing: result.additionalUserInfo.isNewUser */

            let query = Object.assign({}, this.router.currentRoute.query);
            delete query.apiKey;
            delete query.oobCode;
            delete query.mode;
            delete query.lang;
            this.router.replace({ query });

            this.userAuthenticated = true;

            // Clear email from storage.
            window.localStorage.removeItem("emailForSignIn");
            // commit("signedInWithEmailLink");

            // Notify the user that the login was succesful.
            Notify.create({
              message: "You are now signed in",
              icon: "mdi-account-check",
              timeout: 3000,
            });

            // logEvent(getAnalytics(), "signin", {
            //   with: "email-link",
            // });

            return true;
          })
          .catch((error) => {
            this.userVerificationLoading = false;
            /* ❌ ERROR: Common errors could be invalid email and invalid or expired OTPs. */
            Notify.create({
              message: error + " (auth.js)",
              icon: "mdi-alert",
            });
          });
      } else {
        // console.log("not a sign in link");
      }
    },
  },
});
