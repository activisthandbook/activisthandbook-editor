<template>
  <!-- RESULTS NATIGATION -->
  <div
    class="flex items-center justify-between q-gutter-sm direction-links"
    v-if="searchResults && !emptySearch"
  >
    <span class="text-caption">{{ searchResults.total_results }} results</span>
    <q-pagination
      v-model="resultsPage"
      :max="Math.round(searchResults.total_results / 12)"
      :max-pages="6"
      boundary-numbers
      color="secondary"
    />
  </div>

  <!-- SEARCH RESULTS -->
  <div
    v-if="searchResults && !resultsLoading && !emptySearch"
    class="row q-col-gutter-xs"
  >
    <div
      class="col-6 col-sm-4"
      v-for="photo in searchResults.photos"
      :key="photo.id"
    >
      <q-img
        :src="photo.src.tiny"
        :ratio="16 / 9"
        no-spinner
        :style="'background-color:' + photo.avg_color"
        @click="selectPexelsPhoto(photo.id)"
        class="cursor-pointer photo-result"
      />
    </div>
  </div>

  <div
    v-if="
      defaultCollection && (!searchResults || emptySearch) && !resultsLoading
    "
  >
    <!-- ACTIVIST HANDBOOK GUIDES -->
    <!-- <activist-handbook
                title="Find the right photo"
                description="Use authentic photos and show what you are fighting for. For example, show how the climate crisis impacts people's lives. More tips & tricks here:"
                campaign="photo_selector"
                :articles="[
                  {
                    title: 'Taking photos',
                    link: 'https://www.activisthandbook.org/en/communication/photos',
                  },
                  {
                    title: 'Visual identity',
                    link: 'https://www.activisthandbook.org/en/communication/visual-identity',
                  },
                  {
                    title: 'Free image libraries',
                    link: 'https://www.activisthandbook.org/en/tools/photo-video',
                  },
                ]"
              /> -->

    <!-- DEFAULT IMAGE SUGGESTIONS -->
    <div class="row q-col-gutter-xs q-mt-sm">
      <div
        class="col-6 col-sm-4"
        v-for="photo in defaultCollection.media"
        :key="photo.id"
      >
        <q-img
          :src="photo.src.tiny"
          :ratio="16 / 9"
          no-spinner
          :style="'background-color:' + photo.avg_color"
          @click="selectPexelsPhoto(photo.id)"
          class="cursor-pointer photo-result"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      fileAvgColor: "#eee",
      defaultCollection: null,
      emptySearch: true,
      searchQuery: "",
      resultsLoading: false,
      searchResults: null,
      resultsPage: 1,
    };
  },
  watch: {
    // whenever question changes, this function will run
    resultsPage: function () {
      this.searchPexels();
    },
    searchQuery: function (newVal) {
      if (!newVal) {
        this.emptySearch = true;
      }
    },
  },
  methods: {
    fetchDefaultCollection() {
      // this.resultsLoading = true;
      // The number of images in this collection divided by 3: https://www.pexels.com/collections/rebel-tools-m9bgkg2/
      // const randomPage = Math.floor(Math.random() * (104 / 12)) + 1;
      // const url =
      //   "https://api.pexels.com/v1/collections/m9bgkg2?per_page=12&page=" +
      //   randomPage;
      // fetch(url, {
      //   headers: {
      //     Authorization: PexelsAuth,
      //   },
      // })
      //   .then((resp) => {
      //     return resp.json();
      //   })
      //   .then((data) => {
      //     this.defaultCollection = data;
      //     this.resultsLoading = false;
      //   });
    },
    searchPexels() {
      // this.resultsLoading = true;
      // this.emptySearch = false;
      // fetch(
      //   "https://api.pexels.com/v1/search?per_page=12&page=" +
      //     this.resultsPage +
      //     "&query=" +
      //     this.searchQuery,
      //   {
      //     headers: {
      //       Authorization: PexelsAuth,
      //     },
      //   }
      // )
      //   .then((resp) => {
      //     return resp.json();
      //   })
      //   .then((data) => {
      //     this.searchResults = data;
      //     this.resultsLoading = false;
      //   });
    },
    selectPexelsPhoto(id) {
      // this.resultsLoading = true;
      // fetch("https://api.pexels.com/v1/photos/" + id, {
      //   headers: {
      //     Authorization: PexelsAuth,
      //   },
      // })
      //   .then((resp) => {
      //     return resp.json();
      //   })
      //   .then((data) => {
      //     this.fileURL = data.src.large;
      //     this.fileAvgColor = data.avg_color;
      //     this.resultsLoading = false;
      //   });
    },
  },
};
</script>
