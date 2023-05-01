<template>
  <span
    v-for="(part, index) in differences"
    :key="index"
    :class="{
      'bg-green-2 text-black': part.added,
      'bg-primary text-accent': part.removed,
    }"
  >
    {{ part.value }}
  </span>
  <span
    v-if="differences.length === 1 && differences[0].count === 0"
    class="text-grey"
  >
    {{ fallback }}
  </span>
</template>
<script>
export default {
  props: ["differences", "fallback"],
};
</script>
<style scoped>
.bg-primary {
  text-decoration: line-through;
}
</style>
