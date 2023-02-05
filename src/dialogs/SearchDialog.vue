<template>
  <q-dialog
    v-model="dialogOpen"
    @hide="$emit('hide')"
    ref="SearchDialog"
    :maximized="$q.screen.lt.sm"
  >
    <q-layout container view="hHh lpR fFf" class="bg-accent">
      <q-page-container>
        <q-page padding>
          <q-input
            outlined
            autofocus
            color="secondary"
            label="Search articles"
            v-model="searchQuery"
            @keydown.enter="searchArticles()"
          >
            <template #append>
              <q-btn flat round dense icon="mdi-close" @click="closeDialog()" />
            </template>
          </q-input>
          <q-card class="q-mt-md bg-accent">
            <q-card-section v-if="noResults"> No results </q-card-section>
            <q-list separator>
              <q-item
                v-for="(result, index) in searchResults"
                :key="index"
                clickable
                @click="
                  $router.push({
                    name: 'Edit',
                    params: { articleID: result.id },
                  })
                "
                class="q-py-md"
              >
                <q-item-section>
                  <q-item-label class="text-bold">
                    {{ result.title }}
                  </q-item-label>
                  <q-item-label>
                    {{ result.description }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>
<script>
import algoliasearch from "algoliasearch/lite";

// Connect and authenticate with your Algolia app
const client = algoliasearch(
  "7G6S9ZTMJU", // Application ID
  "78fc4828e167a2e0b19a4b7d3295e1d7" // Public search-only api key
);

// Create a new index and add a record
const articlesSearchIndex = client.initIndex("activisthandbook_articles");

export default {
  props: ["value"],
  data() {
    return {
      dialogOpen: this.value,
      searchQuery: null,
      searchResults: null,
      noResults: null,
    };
  },

  methods: {
    closeDialog() {
      this.$refs.SearchDialog.hide();
      this.searchQuery = null;
      this.searchResults = null;
      this.noResults = null;
    },
    searchArticles() {
      articlesSearchIndex.search(this.searchQuery).then(({ hits }) => {
        this.searchResults = hits;
        if (!hits[0]) {
          this.noResults = true;
        } else {
          this.noResults = false;
        }
      });
    },
  },
};
</script>
