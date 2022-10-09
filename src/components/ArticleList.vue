<template>
  <q-list v-if="articles.dataLoaded" separator>
    <q-item
      v-for="(article, index) in articles.data"
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
    </q-item>
  </q-list>
</template>
<script>
export default {
  props: ["articles"],
};
</script>
