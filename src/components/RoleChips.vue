<template>
  <q-chip
    v-if="roles && roles.includes('admin')"
    label="Admin"
    icon="mdi-crown"
    color="grey-2"
  />
  <q-chip
    v-if="roles && roles.includes('moderator')"
    label="Moderator"
    icon="mdi-shield-check"
    color="grey-2"
  />
</template>
<script>
export default {
  props: ["roles"],
};
</script>
