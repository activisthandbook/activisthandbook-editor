<template>
  <div
    v-if="!firebaseStore.userLoaded || firebaseStore.userVerificationLoading"
    class="fixed-center text-center text-caption text-grey"
  >
    <q-spinner color="grey" size="3em" />
    <div class="q-mt-md">Getting ready...</div>
  </div>
  <router-view v-else-if="firebaseStore.userAuthenticated" />
  <LoginPage v-else />
</template>

<script>
import { useQuasar } from "quasar";

import { defineComponent } from "vue";
import { useFirebaseStore } from "stores/firebase";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { mapStores } from "pinia";

import LoginPage from "src/pages/LoginPage.vue";

const provider = new GoogleAuthProvider();

export default defineComponent({
  name: "App",
  components: { LoginPage },
  setup() {
    const firebaseStore = useFirebaseStore();
    // call the action as a method of the store
    firebaseStore.initialize();

    const $q = useQuasar();

    $q.loadingBar.setDefaults({
      color: "grey",
    });

    return { firebaseStore };
  },
  async created() {
    await this.firebaseStore.signInWithEmailLink();
  },
  // computed: {
  //   ...mapStores(useUsersStore),
  // },

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
