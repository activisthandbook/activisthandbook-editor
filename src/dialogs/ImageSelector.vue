<template>
  <q-dialog
    v-model="dialogOpen"
    :maximized="$q.screen.lt.sm"
    persistent
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
    :class="{ 'drop-active': dropboxActive }"
  >
    <q-layout view="hHh lpR fFf" container style="max-width: 640px">
      <q-header class="bg-accent text-black" bordered>
        <q-toolbar>
          <q-btn flat v-close-popup round dense icon="mdi-close" />
          <q-toolbar-title>Image selector</q-toolbar-title>
          <q-btn
            no-caps
            v-close-popup
            label="Save"
            color="secondary"
            v-if="fileURL"
          />
          <q-btn
            label="Upload"
            no-caps
            color="secondary"
            icon="mdi-upload"
            v-if="!fileURL"
          />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page padding v-if="!fileURL">
          <div>Test</div>
          <!-- PEXELS SEARCH & UPLOAD BUTTON -->
          <!-- <div class="q-gutter-y-sm">
            <q-input
              type="search"
              label="🔍 Search pictures"
              outlined
              color="secondary"
              v-model="searchQuery"
              @keyup.enter="searchPexels()"
            />

            <div class="text-caption">
              Search photos from <a href="https://www.pexels.com">Pexels</a>
            </div>
          </div> -->
        </q-page>

        <!-- PREVIEW -->
        <q-page padding v-else>
          <q-input
            type="textarea"
            autogrow
            label="Describe this image"
            color="secondary"
            outlined
            hint="Important for people using screen readers"
          />
          <q-img
            :src="fileURL"
            :ratio="16 / 9"
            class="q-my-md"
            :style="'background-color: ' + fileAvgColor"
          />
          <div class="text-center">
            <q-btn
              icon="mdi-delete"
              color="black"
              label="Delete"
              outline
              @click="deleteFile()"
            />
          </div>
        </q-page>
      </q-page-container>

      <!-- <q-footer class="bg-white text-black" v-if="!uploadedFile">
        <q-toolbar>
          <div class="text-caption">Photos from <a href="https://www.pexels.com">Pexels</a></div>
        </q-toolbar>
      </q-footer> -->
    </q-layout>
  </q-dialog>
</template>
<script>
import { useFirebaseStore } from "stores/firebase";

// SELF-HOSTING CONFIG: When hosting yourself, make sure to edit this configuration
// const PexelsAuth = "563492ad6f9170000100000190a4e6732b3c43a3a2d9009518c8f26e";

import { httpsCallable } from "firebase/functions";

export default {
  props: ["value"],
  // components: { ActivistHandbook },
  data() {
    return {
      dialogOpen: this.value,
      uploadedFile: null, // Store our uploaded file
      fileURL: "",
      fileAvgColor: "#eee",
      dropboxActive: false,
      cloudflareImagesData: null,
      cloudflareImagesDataLoaded: false,
    };
  },
  setup() {
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      firebaseStore,
    };
  },
  mounted() {
    // this.fetchDefaultCollection();
    this.getImageUploadURL();
  },
  methods: {
    getImageUploadURL() {
      const getImageUploadURL = httpsCallable(
        this.firebaseStore.functions,
        "getImageUploadURL"
      );
      getImageUploadURL().then((result) => {
        this.cloudflareImagesData = result.data;
        this.cloudflareImagesDataLoaded = true;
      });
    },
    dragover(event) {
      event.preventDefault();
      // Add some visual fluff to show the user can drop its files
      this.dropboxActive = true;
    },
    dragleave(event) {
      // Clean up
      this.dropboxActive = false;
    },
    drop(event) {
      event.preventDefault();
      this.uploadedFile = event.dataTransfer.files[0];
      this.fileURL = URL.createObjectURL(this.uploadedFile);

      this.dropboxActive = false;
      this.dialogOpen = true;

      // const preview = this.$refs.preview
    },
    deleteFile() {
      this.uploadedFile = null;
      this.fileURL = "";
    },
  },
};
</script>
<style lang="scss">
.photo-result:hover {
  opacity: 0.8 !important;
}
.drop-active {
  border: 6px dashed black !important;
}
</style>
