<template>
  <q-select
    use-input
    v-model="selectedLanguage"
    input-debounce="0"
    virtual-scroll-slice-size="10"
    virtual-scroll-slice-ratio-before="2"
    virtual-scroll-slice-ratio-after="2"
    label="Language"
    :options="searchResults"
    @filter="searchLanguage"
    dense
    outlined
    color="secondary"
    popup-content-class="bg-accent"
    virtual-scroll-item-size="53.59"
    @input="handleInput"
    @focus="focus = true"
    @blur="focus = false"
    :autofocus="autofocus"
  >
    <template v-slot:prepend>
      <q-icon name="mdi-translate" />
    </template>
    <template v-slot:selected-item="scope">
      <span :class="{ focussed: focus }"
        >{{ scope.opt.localName }} ({{ scope.opt.code }})</span
      >
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label
            >{{ scope.opt.localName }} ({{ scope.opt.code }})</q-item-label
          >
          <q-item-label caption>{{ scope.opt.EnglishName }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:before-options>
      <div
        class="q-px-md q-py-sm text-caption text-bold"
        v-if="languageCollectionID"
      >
        This page is available in:
      </div>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          <span v-if="searchInput">No results</span>
          <span v-else>Type to search language...</span>
        </q-item-section>
      </q-item>
      <div class="q-pa-sm">
        <q-btn
          label="Add language"
          icon="mdi-plus"
          color="secondary"
          no-caps
          v-if="searchInput"
          :to="{
            name: 'Translate article',
            params: { languageCollectionID: languageCollectionID },
          }"
        />
      </div>
    </template>
    <template v-slot:after-options>
      <div class="q-pa-sm" v-if="searchInput || languageCollectionID">
        <q-btn
          label="Add language"
          icon="mdi-plus"
          color="secondary"
          no-caps
          :to="{
            name: 'Translate article',
            params: { languageCollectionID: languageCollectionID },
          }"
        />
      </div>
    </template>
  </q-select>
</template>
<script>
// import { ref } from "vue";

import { mapStores } from "pinia";
import { useLanguagesStore } from "stores/languages";

import _ from "lodash";

// const stringOptions = ["English (EN)", "Nederlands (NL)", "Deutch (DE)"];

export default {
  props: {
    value: Object,
    options: Array,
    languageCollectionID: String,
    autofocus: Boolean,
  },
  data: function () {
    return {
      selectedLanguage: this.value,
      searchResults: null,
      searchInput: null,
      focus: false,
    };
  },
  computed: {
    // note we are not passing an array, just one store after the other
    // each store will be accessible as its id + 'Store'
    ...mapStores(useLanguagesStore),
  },
  watch: {
    selectedLanguage: function (newValue) {
      if (this.languageCollectionID && newValue) {
        this.$router.push({
          name: "Edit",
          params: { articleID: newValue.articleID },
        });
      }
    },
  },

  mounted() {
    // this.searchResults = this.languagesStore.languages;
  },
  methods: {
    handleInput(e) {
      this.$emit("input", this.selectedLanguage);
    },
    searchLanguage(searchInput, update) {
      this.searchInput = searchInput;

      if (searchInput === "") {
        update(() => {
          if (this.languageCollectionID) {
            this.searchResults = this.options;
          } else {
            this.searchResults = [];
          }
        });
        return;
      } else {
        update(
          () => {
            // this.searchResults = this.languagesStore.languages.slice(0, 3);
            this.searchResults = this.options
              .filter((x) => {
                const lowInput = searchInput.toLowerCase();
                return (
                  x.localName.toLowerCase().includes(lowInput) ||
                  x.code.toLowerCase().includes(lowInput) ||
                  x.EnglishName.toLowerCase().includes(lowInput)
                );
              })
              .slice(0, 5);
          },
          (ref) => {
            if (searchInput !== "" && ref.options.length > 0) {
              ref.setOptionIndex(-1); // reset optionIndex in case there is something selected
              ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
            }
          }
        );
      }

      return ["test"];
    },
  },
};
</script>
<style lang="scss" scoped>
.focussed {
  background: rgba($secondary, 0.2);
}
</style>
