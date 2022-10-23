<template>
  <q-list separator>
    <q-item
      v-for="(article, index) in articles"
      :key="index"
      :to="{ name: 'Edit', params: { articleID: article.id } }"
      class="q-py-md"
    >
      <q-item-section>
        <q-item-label class="text-bold" v-if="article.title">
          {{ article.title }}
        </q-item-label>
        <q-item-label class="text-bold text-grey" v-else>No title</q-item-label>

        <q-item-label v-if="article.description">
          {{ article.description }}
        </q-item-label>
        <q-item-label v-else class="text-grey"> No description </q-item-label>
        <q-item-label caption
          ><q-icon name="mdi-link" class="q-mr-xs" />{{ article.langCode }}/{{
            article.path
          }}<span v-if="!article.path" class="text-grey-5"
            >no-path</span
          ></q-item-label
        >
      </q-item-section>
      <q-item-section side class="gt-xs">
        <q-item-section>
          <q-chip
            v-if="article.deleteArticle"
            label="In bin"
            icon="mdi-delete"
            color="warning"
            class="q-ma-none"
          />
          <q-chip
            v-else-if="!article.lastPublishedServerTimestamp"
            icon="mdi-star-outline"
            label="New"
            class="q-ma-none"
            color="grey-3"
          />
          <q-chip
            v-else
            icon="mdi-file-edit-outline"
            label="Edit"
            class="q-ma-none"
            color="grey-3"
          />
        </q-item-section>
      </q-item-section>
      <q-item-section side class="gt-xs">
        <q-item-label caption v-if="article.metadata.updatedTimestamp">
          {{ mixin_humanDate(article.metadata.updatedTimestamp) }}
        </q-item-label>
        <q-item-label caption v-else-if="article.metadata.createdTimestamp">
          {{ mixin_humanDate(article.metadata.createdTimestamp) }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script>
export default {
  props: ["articles"],
};
</script>
