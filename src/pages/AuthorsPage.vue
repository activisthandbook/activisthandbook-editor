<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="flex q-py-md">
        <q-icon name="mdi-account-group" size="24px" />
        <q-toolbar-title>Authors</q-toolbar-title>

        <AppSwitcher />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-my-md">Author list...</div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script>
import AppSwitcher from "components/AppSwitcher.vue";

export default {
  components: { AppSwitcher },
  data: function () {
    return {};
  },
};
</script>
