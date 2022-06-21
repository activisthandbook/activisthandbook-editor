<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-white text-black" bordered>
      <q-toolbar class="flex">
        <q-toolbar-title>Edit page</q-toolbar-title>
        <!-- <q-btn
          v-show="$store.state.auth.data.emailVerified"
          @click="$store.dispatch('auth/signOut')"
          label="Sign out"
          flat
          no-caps
        /> -->

        <q-btn
          icon="mdi-link"
          label="Share"
          color="secondary"
          outline
          no-caps
        />
        <q-btn
          color="secondary"
          no-caps
          class="q-ml-sm"
          @click="publish()"
          :disable="requestedPublication"
          :icon="requestedPublication ? 'mdi-check' : 'mdi-send'"
        >
          <span class="q-ml-sm">
            <span v-if="!requestedPublication">Publish</span>
            <span v-else>Requested</span>
          </span>
        </q-btn>
        <!-- <q-avatar
          class="q-ml-sm"
          size="36px"
          v-if="$store.state.auth.data.photoURL"
        >
          <img :src="$store.state.auth.data.photoURL" />
        </q-avatar> -->
        <q-btn
          icon="mdi-account"
          round
          dense
          class="q-ml-sm"
          color="grey-2"
          text-color="black"
          unelevated
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
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore();

const auth = getAuth();

export default {
  name: "EditorLayout",
  data: () => ({
    requestedPublication: false,
  }),
  methods: {
    publish() {
      console.log("publish");
      setDoc(
        doc(db, "articles", "test"),
        {
          requestPublication: true,
        },
        {
          merge: true,
        }
      ).then(() => {
        this.requestedPublication = true;
        console.log("published");
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
