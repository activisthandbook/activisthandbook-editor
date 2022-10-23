<template>
  <q-btn
    label="Tools"
    icon-right="mdi-apps"
    no-caps
    color="grey-2"
    text-color="black"
    unelevated
    class="q-px-lg"
  >
    <q-menu
      :offset="[0, 8]"
      class="shadow-10 bg-accent q-pa-sm"
      style="width: 292px"
    >
      <slot></slot>

      <div class="q-gutter-sm text-center q-mb-sm q-pt-sm">
        <!-- <q-btn
          label="Home"
          icon="mdi-home"
          no-caps
          style="width: 256px"
          padding="16px 8px"
          size="13px"
          v-close-popup
          :to="{ name: 'Home' }"
          exact
          color="primary"
          v-if="$route.name !== 'Home'"
          text-color="accent"
          unelevated
        /> -->
        <q-btn
          icon="mdi-home"
          padding="0"
          no-caps
          label="Home"
          stack
          style="width: 80px; height: 72px"
          size="13px"
          v-close-popup
          :to="{ name: 'Home' }"
          exact
          flat
          color="primary"
        />
        <q-btn
          icon="mdi-text-box-plus"
          padding="0"
          no-caps
          label="New"
          stack
          style="width: 80px; height: 72px"
          size="13px"
          v-close-popup
          :to="{ name: 'New' }"
          exact
          flat
          color="primary"
        />
        <q-btn
          icon="mdi-shield-check"
          padding="0"
          no-caps
          label="Review"
          stack
          style="width: 80px; height: 72px"
          size="13px"
          v-close-popup
          :to="{ name: 'Review' }"
          flat
          color="primary"
        />

        <q-btn
          icon="mdi-folder-text"
          padding="0"
          no-caps
          label="Menu"
          style="width: 80px; height: 72px"
          size="13px"
          stack
          color="primary"
          :to="{ name: 'Menu' }"
          flat
        />

        <q-btn
          icon="mdi-account-group"
          padding="0"
          no-caps
          label="Authors"
          style="width: 80px; height: 72px"
          size="13px"
          stack
          color="primary"
          :to="{ name: 'Authors' }"
          flat
        />
        <q-btn
          icon="mdi-translate"
          padding="0"
          no-caps
          label="Translate"
          style="width: 80px; height: 72px"
          size="13px"
          stack
          color="primary"
          :to="{ name: 'Translate' }"
          flat
        />
        <q-btn
          class="q-mt-md bg-grey-2"
          label="Account"
          icon="mdi-account"
          style="width: 256px"
          flat
          no-caps
          v-close-popup
          :to="{
            name: 'Account',
          }"
        />
        <q-btn
          class="bg-grey-2"
          label="Sign out"
          icon="mdi-exit-to-app"
          style="width: 256px"
          flat
          no-caps
          v-close-popup
          @click="firebaseStore.signOut()"
        />
      </div>

      <div></div>
    </q-menu>
  </q-btn>
</template>
<script>
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
export default {
  computed: {
    ...mapStores(useFirebaseStore),
  },
};
</script>
<style lang="scss" scoped>
.apps a {
  background: rgba(black, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  height: 96px;
  width: 96px;

  .q-icon {
    margin: 0 24px;
  }
}
</style>
