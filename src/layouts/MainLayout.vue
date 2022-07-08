<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-primary text-white" bordered>
      <q-toolbar class="flex">
        <q-toolbar-title>Edit page</q-toolbar-title>

        <q-btn icon="mdi-link" label="Share" color="white" outline no-caps />
        <q-btn
          color="white"
          text-color="black"
          no-caps
          class="q-ml-sm"
          @click="publish()"
          :disable="!allowedToPublish"
          :icon="!allowedToPublish ? 'mdi-check' : 'mdi-send'"
        >
          <span class="q-ml-sm">
            <span v-if="allowedToPublish">Publish</span>
            <span v-else>Requested</span>
          </span>
        </q-btn>

        <q-btn
          icon="mdi-account"
          round
          dense
          class="q-ml-sm"
          text-color="white"
          flat
        >
          <q-menu :offset="[0, 12]">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="signOut()">
                <q-item-section>Sign out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
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
  setup() {
    const editorStore = useEditorStore();
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      editorStore,
      firebaseStore,
    };
  },
  data: function () {
    return {
      allowedToPublish: false,
    };
  },

  mounted: function () {
    this.updateWhileAgo();
    setInterval(() => {
      this.updateWhileAgo();
    }, 3000);
  },

  methods: {
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
    openPublishingDialog() {},
    publish() {
      console.log("publish");
      const time = Date.now();
      addDoc(
        collection(db, "articles", "test2", "versions"),
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
        doc(db, "articles", "test2"),
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
          title: "Sent for review ✅",
          message:
            "Our moderators will review the edits you made. Thank you for contributing to Activist Handbook.",
          ok: {
            color: "secondary",
            flat: true,
          },
        });
      });
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
