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
      <q-list class="q-ma-sm q-gutter-y-sm" v-if="$route.name === 'Edit'">
        <!-- 👉 TODO: Switch between versions -->
        <!-- <q-item
          clickable
          v-close-popup
          disable
          class="rounded-borders bg-grey-2"
        >
          <q-item-section>Version history</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-history" />
          </q-item-section>
        </q-item> -->

        <q-item
          clickable
          v-close-popup
          @click="deleteAndPublish()"
          class="rounded-borders bg-grey-2"
        >
          <q-item-section>Delete</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-delete-outline" />
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-close-popup
          :to="{ name: 'New' }"
          class="rounded-borders bg-grey-2"
        >
          <q-item-section>New article</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-text-box-plus-outline" />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="q-gutter-sm text-center q-mb-sm q-pt-sm">
        <q-btn
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
          :to="{ name: 'Moderate' }"
          color="primary"
          text-color="accent"
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
          text-color="accent"
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
          text-color="accent"
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
