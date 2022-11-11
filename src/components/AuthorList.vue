<template>
  <q-list separator v-if="authors">
    <q-item
      v-for="author in authors"
      :key="author.id"
      :to="{
        name: 'Author',
        params: { authorID: author.id },
      }"
      class="q-py-md"
    >
      <q-item-section>
        <q-item-label class="text-bold">
          {{ author.firstName }} {{ author.lastName }}
        </q-item-label>
        <q-item-label>
          <q-chip
            color="primary"
            dark
            icon="mdi-file-document-edit"
            v-if="author.editCount"
          >
            <span class="q-mr-xs text-bold">{{ author.editCount }}</span>
            <span v-if="author.editCount > 1">edits</span>
            <span v-else>edit</span>
          </q-chip>
          <RoleChips :roles="author.roles" />
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
import RoleChips from "components/RoleChips.vue";

export default {
  props: ["authors"],
  components: { RoleChips },
};
</script>
