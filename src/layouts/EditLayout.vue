<template>
  <router-view />
</template>

<script>
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
const db = getFirestore();

const auth = getAuth();

export default {
  name: "EditorLayout",
  // setup() {
  //   const editorStore = useEditorStore();
  //   const firebaseStore = useFirebaseStore();

  //   return {
  //     // you can return the whole store instance to use it in the template
  //     editorStore,
  //     firebaseStore,
  //   };
  // },
  // data: function () {
  //   return {
  //     allowedToPublish: false,
  //     errorDialogOpen: false,
  //     validation: null,
  //   };
  // },

  // mounted: function () {
  //   this.updateWhileAgo();
  //   setInterval(() => {
  //     this.updateWhileAgo();
  //   }, 1000);
  // },

  methods: {
    share() {
      this.mixin_copyText(window.location.href);
      this.$q.dialog({
        title: "Copied to clipboard ✅",
        message:
          "Share the link with others to work together on this article. Anyone with the linuk",
        ok: {
          color: "secondary",
          flat: true,
          noCaps: true,
        },
      });
    },
    updateWhileAgo() {
      const whileAgo = Date.now() - 1000 * 10;

      if (!this.editorStore.syncedData.requestedPublication) {
        this.allowedToPublish = true;
      } else if (
        whileAgo > this.editorStore.syncedData.requestedPublicationTimestamp &&
        this.editorStore.lastEditTimestamp >
          this.editorStore.syncedData.requestedPublicationTimestamp
      ) {
        this.allowedToPublish = true;
      } else this.allowedToPublish = false;

      // this.allowedToPublish =
      //   whileAgo > this.editorStore.syncedData.requestedPublicationTimestamp;

      //   this.editorStore.syncedData.requestedPublication && !whileAgo
    },
    publish() {
      this.validation = this.editorStore.validateArticle();
      if (this.validation.hasErrors) {
        this.errorDialogOpen = true;
      } else {
        console.log("publish");
        const time = Date.now();
        addDoc(
          collection(db, "articles", this.$route.params.articleID, "versions"),
          {
            ...this.editorStore.article,
            lastUpdatedServerTimestamp: serverTimestamp(),
            status: "review",
          },
          {
            merge: true,
          }
        ).then(() => {
          this.editorStore.y.syncedData.set("requestedPublication", true);
          console.log("published");
        });

        setDoc(
          doc(db, "articles", this.$route.params.articleID),
          {
            requestedPublication: true,
            requestedPublicationTimestamp: time,
          },
          {
            merge: true,
          }
        ).then(() => {
          this.editorStore.y.syncedData.set("requestedPublication", true);
          this.editorStore.y.syncedData.set(
            "requestedPublicationTimestamp",
            time
          );
          this.updateWhileAgo();
          console.log("published");
          this.$q.dialog({
            title: "Thank you for contributing ❤️",
            message:
              "Our moderators will have a look at your edits. Thank you for making Activist Handbook better.",
            ok: {
              color: "secondary",
              flat: true,
              noCaps: true,
            },
          });
        });
      }
    },
    signOut() {
      signOut(auth)
        .then(() => {
          // Sign-out successful.
        })
        .catch((error) => {
          // An error happened.
        });
    },
  },
};
</script>
