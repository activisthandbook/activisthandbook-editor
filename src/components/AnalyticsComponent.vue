<script setup>
import { ref, onMounted } from "vue";
import { getAnalytics } from "firebase/analytics";

import { useFirebaseStore } from "src/stores/firebase";
const firebaseStore = useFirebaseStore();

// import { useGtm } from '@gtm-support/vue-gtm';
// const gtm = useGtm();

const cookieBanner = ref("show");
const analyticsAllowed = ref(null);

onMounted(() => {
  if (localStorage.getItem("cookieBanner")) {
    cookieBanner.value = localStorage.getItem("cookieBanner");
  }
  if (localStorage.getItem("analyticsAllowed")) {
    analyticsAllowed.value = localStorage.getItem("analyticsAllowed");
  }
  if (localStorage.getItem("analyticsAllowed") === "yes") {
    turnOnAnalytics();
  }
});

function decline() {
  cookieBanner.value = "hide";
  analyticsAllowed.value = "no";
  localStorage.setItem("cookieBanner", "hide");
  localStorage.setItem("analyticsAllowed", "no");
}
function declineAndReload() {
  decline();
  location.reload();
}
function accept() {
  cookieBanner.value = "hide";
  analyticsAllowed.value = "yes";
  localStorage.setItem("cookieBanner", "hide");
  localStorage.setItem("analyticsAllowed", "yes");
  turnOnAnalytics();
}
function turnOnAnalytics() {
  console.log("using analytics");
  firebaseStore.analytics = getAnalytics(firebaseStore.firebaseApp);
}
</script>
<template>
  <!-- BANNER -->
  <div
    class="cookie-notification"
    v-if="cookieBanner === 'show'"
    data-nosnippet
  >
    <div class="explanation">
      <strong>Analytics help us write better guides for change-makers.</strong
      ><br />
      Are you ok with us using cookies for analytics?
    </div>
    <button class="button accept" @click="accept()">OK 👍</button>
    <button class="button decline" @click="decline()">Decline</button>
  </div>

  <!-- CHANGE CHOICE  -->
  <div class="change-choice-container" v-if="cookieBanner === 'hide'">
    <div class="change-choice">
      <div><strong>Privacy</strong></div>
      <div v-if="analyticsAllowed === 'yes'">
        You have accepted cookies for analytical purposes (<a
          class="toggle"
          @click="declineAndReload()"
          @keyup.enter="declineAndReload()"
          tabindex="0"
          >turn off</a
        >).
      </div>
      <div v-if="analyticsAllowed === 'no'">
        You have not accepted cookies for analytical purposes (<a
          class="toggle"
          @click="accept()"
          @keyup.enter="accept()"
          tabindex="0"
          >turn on</a
        >).
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.cookie-notification {
  position: fixed;
  text-align: center;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: $accent;
  padding: 4vh 10vw;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  z-index: 2000;

  .explanation {
    max-width: 512px;
    margin: 0 auto 16px;
  }

  .button {
    font-family: $font-secondary;
    font-weight: 700;
    padding: 12px 8px;
    width: 128px;
    color: $accent;
    border-radius: 2px;
    margin: 4px;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
  .decline {
    background: rgba(0, 0, 0, 0.85);
  }
  .accept {
    background: $secondary;
  }
}
.change-choice {
  // background: var(--vp-c-bg-alt);
  text-align: center;
  padding: 32px 16px;
  font-size: 12px;
  line-height: 1.5;
  color: #444;

  .toggle {
    cursor: pointer;
  }
}
</style>
