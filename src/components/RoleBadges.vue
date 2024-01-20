<template>
  <q-badge
    v-if="roles && roles.includes('admin')"
    color="grey-2"
    text-color="black"
    class="text-body2"
  >
    <q-icon name="mdi-crown" class="q-mr-xs" />
    Admin
  </q-badge>
  <q-badge
    v-if="roles && roles.includes('moderator')"
    color="grey-2"
    text-color="black"
    class="text-body2"
  >
    <q-icon name="mdi-shield-check" class="q-mr-xs" />
    Moderator
  </q-badge>
</template>
<script>
export default {
  props: ["roles"],
};
</script>
