<template>
  <div v-if="!firebaseStore.userLoaded">
    <q-spinner class="fixed-center" color="grey" size="3em" />
  </div>
  <router-view v-else-if="firebaseStore.userAuthenticated" />
  <div style="max-width: 700px; margin: auto" v-else>
    <q-card class="q-ma-md">
      <q-card-section class="q-gutter-y-sm">
        <h1>Start contributing</h1>
        <div>
          You can make Activist Handbook better. Just sign in and start editing.
        </div>
        <q-btn
          color="secondary"
          label="Sign in with Google"
          @click="signin"
          no-caps
          icon="mdi-account"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useQuasar } from "quasar";

import { defineComponent } from "vue";
import { useFirebaseStore } from "stores/firebase";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const provider = new GoogleAuthProvider();

export default defineComponent({
  name: "App",
  setup() {
    const firebaseStore = useFirebaseStore();
    // call the action as a method of the store
    firebaseStore.initialize();

    const $q = useQuasar();

    $q.loadingBar.setDefaults({
      color: "grey",
    });

    return {
      firebaseStore,
    };
  },
  methods: {
    signin() {
      signInWithPopup(this.firebaseStore.auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // const credential = GoogleAuthProvider.credentialFromResult(result);
          // The signed-in user info.
          this.$q.notify("Signin succesful");
          // ...
        })
        .catch((error) => {
          // Handle Errors here.
          console.log(error);
          this.$q.notify("Something went wrong signin in");
          // const errorCode = error.code;
          // const errorMessage = error.message;
          // The email of the user's account used.
          // const email = error.email;
          // The AuthCredential type that was used.
          // const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
    },
  },
});
</script>
