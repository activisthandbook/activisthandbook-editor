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
      <q-item-section avatar>
        <q-avatar icon="mdi-account" color="grey-2" text-color="grey" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-bold">
          {{ author.firstName }} {{ author.lastName }}
        </q-item-label>
        <q-item-label class="q-gutter-xs">
          <q-badge
            color="primary"
            outline
            icon="mdi-file-document-edit"
            v-if="author.editCount"
            class="text-body2"
          >
            <q-icon name="mdi-heart" class="q-mr-xs" />
            <span class="q-mr-xs text-bold">{{ author.editCount }}</span>
            <span v-if="author.editCount > 1">edits</span>
            <span v-else>edit</span>
          </q-badge>
          <RoleBadges :roles="author.roles" />
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
import RoleBadges from "src/components/RoleBadges.vue";

export default {
  props: ["authors"],
  components: { RoleBadges },
};
</script>
