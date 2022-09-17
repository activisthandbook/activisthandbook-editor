<template>
  <q-dialog
    v-model="view.dialogOpen"
    :maximized="$q.screen.lt.sm"
    persistent
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
    :class="{ 'drop-active': view.dropboxActive }"
    ref="imageSelector"
    @hide="handleHide()"
  >
    <q-layout view="hHh lpR fFf" container style="max-width: 640px">
      <div v-if="view.name === 'edit-image'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Edit image</q-toolbar-title>
            <q-btn label="Update" no-caps color="secondary" />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding class="text-center">
            <q-btn
              label="Replace image"
              icon="mdi-image"
              no-caps
              color="secondary"
              @click="replaceImage()"
            />
          </q-page>
        </q-page-container>
      </div>
      <div v-if="view.name === 'gallery'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Select image</q-toolbar-title>

            <input
              class="hidden"
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleFileInput($event.target.files[0])"
            />

            <q-btn
              label="Upload"
              no-caps
              color="secondary"
              icon="mdi-upload"
              @click="$refs.fileInput.click()"
              :disable="!imageUploadURL"
            />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <!-- PEXELS SEARCH & UPLOAD BUTTON -->
            <div class="q-gutter-y-md">
              <q-input
                type="search"
                label="Search pictures"
                outlined
                color="secondary"
                v-model="searchQuery"
                @keyup.enter="searchPexels()"
                autofocus
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-magnify" />
                </template>
              </q-input>

              <div
                class="q-my-lg text-grey text-center text-italic"
                style="font-size: 24px"
              >
                For example, search "protest march", "people brainstorming" or
                "black lives matter"
              </div>

              <div v-if="galleryImages.dataLoaded" class="row q-col-gutter-xs">
                <div
                  class="col-6 col-sm-4"
                  v-for="image in galleryImages.data"
                  :key="image.id"
                >
                  <q-img
                    :scr="`${imageHost}${image.id}/thumbnail`"
                    :srcset="`
                    ${imageHost}${image.id}/thumbnail,
                    ${imageHost}${image.id}/thumbnail2x 2x
                  `"
                    :ratio="16 / 9"
                    no-spinner
                    no-transition
                    class="cursor-pointer photo-result rounded-borders"
                    @click="selectImage(image)"
                  />
                </div>
              </div>

              <!-- <div class="text-bold">Found in Activist Handbook library:</div>

            <div class="text-bold">
              Results from
              <a href="https://www.pexels.com" target="_blank">Pexels</a>:
            </div> -->
            </div>
          </q-page>
        </q-page-container>
      </div>
      <div v-if="view.name === 'preview-upload'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Add description</q-toolbar-title>

            <q-btn
              no-caps
              label="Insert"
              color="secondary"
              v-if="!image.localURL"
            />
            <q-btn
              v-else
              no-caps
              label="Next"
              icon-right="mdi-arrow-right"
              color="secondary"
              @click="view.name = 'upload-consent'"
              :disable="
                !image.data.description || image.data.description.length < 5
              "
            />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <div class="text-bold q-mb-sm">
              Describe what is in the image for people using screenreaders.
            </div>
            <q-input
              type="textarea"
              autogrow
              label="Description"
              autofocus
              color="secondary"
              outlined
              v-model="image.data.description"
              :rules="[
                (val) =>
                  val.length >= 5 || 'Please use a minimum of 5 characters',
              ]"
            />
            <q-img
              :src="image.localURL"
              :ratio="16 / 9"
              class="q-my-md"
              no-spinner
              no-transition
            />
            <div class="text-center">
              <q-btn
                icon="mdi-image"
                label="Select other image"
                color="secondary"
                no-caps
                @click="resetFileInput()"
              />
            </div>
          </q-page>
        </q-page-container>
      </div>
      <div v-if="view.name === 'upload-consent'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Before you upload...</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <p>
              <strong
                >You may upload images that you created entirely
                yourself:</strong
              >
            </p>
            <ul>
              <li>✅ Photos of natural landscapes, animals, plants</li>
              <li>
                ✅ Photos of public figures & people photographed in public
                places
              </li>
              <li>✅ Photos of useful or non-artistic objects</li>
              <li>✅ Original graphs, maps, diagrams & illustrations</li>
            </ul>
            <p><strong>You can not upload someone else's work:</strong></p>
            <ul>
              <li>❌ Most images on the internet</li>
              <li>❌ Logos</li>
              <li>
                ❌ Drawings of characters from TV, comics, or movies - even if
                you drew them
              </li>
            </ul>
            <p><strong>With the exception of:</strong></p>
            <ul>
              <li>
                ✅ Work published under a
                <a
                  href="https://creativecommons.org/faq/#can-i-combine-material-under-different-creative-commons-licenses-in-my-work"
                  target="_blank"
                  >compatible Creative Commons licence</a
                >
                (BY-NC-SA 4.0).
              </li>
            </ul>

            <q-card class="bg-grey-3" flat bordered>
              <q-card-section>
                <div class="q-gutter-y-sm">
                  <div>
                    <strong>Did you create this image yourself?</strong>
                  </div>

                  <q-option-group
                    v-model="image.data.author.byMe"
                    :options="[
                      {
                        label: 'Yes, I hold the copyright',
                        value: true,
                      },
                      {
                        label: 'No, someone else made it.',
                        value: false,
                      },
                    ]"
                    color="secondary"
                  />

                  <div
                    v-if="image.data.author.byMe === false"
                    class="q-gutter-y-sm q-mt-md"
                  >
                    <div><strong>Attribution info</strong></div>

                    <q-input
                      label="Source link"
                      hint="The URL to the webpage or other source (e.g. AI generator) where you got this image from."
                      color="secondary"
                      v-model="image.data.author.source"
                      :rules="[
                        (val) => !!isValidHttpUrl(val) || 'Add a valid URL',
                      ]"
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="mdi-link" />
                      </template>
                    </q-input>

                    <q-input
                      label="Author(s)"
                      hint="The person or people who created this image."
                      color="secondary"
                      v-model="image.data.author.name"
                      :rules="[(val) => !!val || 'Add an author']"
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="mdi-account" />
                      </template>
                    </q-input>

                    <q-input
                      label="Licence"
                      hint="Under which Creative Commons licence is it available? (e.g. BY-NC-SA 4.0)"
                      color="secondary"
                      v-model="image.data.author.licence"
                      :rules="[(val) => !!val || 'Add a licence']"
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="mdi-creative-commons" />
                      </template>
                    </q-input>
                  </div>
                  <div v-if="image.data.author.byMe" class="q-mt-md">
                    <div>By uploading this image, you accept that:</div>
                    <ul>
                      <li>
                        <strong
                          >This image is publicly shared on Activist Handbook,
                          attributing you as author ({{
                            firebaseStore.auth.currentUser.displayName
                          }}).</strong
                        >
                        That means that everyone can see the image and your
                        name.
                      </li>
                      <li>
                        <strong
                          >This image is made available under a
                          <a
                            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                            target="_blank"
                            >Creative Commons BY-NC-SA 4.0 licence</a
                          >.</strong
                        >
                        This means that others can share and edit it without
                        asking your permission, as long as (1) they give you
                        attribution with your username, (2) do so for
                        non-commercial purposes and (3) share it under the same
                        licence.
                      </li>
                      <li>
                        <strong
                          >You cannot revoke usage under this licence.</strong
                        >
                        That means that it is not possible to change your mind
                        later.
                      </li>
                    </ul>
                    <q-input
                      label="AI generator"
                      hint="If you used an AI to generate this image, add the name of the tool you used here"
                      color="secondary"
                      v-model="image.data.author.ai"
                      outlined
                    >
                      <template v-slot:prepend>
                        <q-icon name="mdi-image-auto-adjust" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="q-mt-md q-gutter-sm text-center row">
              <q-btn
                label="Cancel"
                no-caps
                color="black"
                class="col"
                @click="view.name = 'preview-upload'"
              />
              <q-btn
                label="Accept & upload"
                no-caps
                color="secondary"
                class="col"
                @click="uploadImage()"
                :disable="
                  !image.data.author.byMe &&
                  (!image.data.author.source ||
                    !image.data.author.name ||
                    !image.data.author.licence)
                "
              />
            </div>

            <div class="text-caption q-mt-lg text-grey">
              The text above was inspired by the
              <a
                href="https://commons.wikimedia.org/wiki/Special:UploadWizard"
                target="_blank"
                class="text-grey"
                >Wikimedia Commons upload wizward</a
              >.
            </div>
          </q-page>
        </q-page-container>
      </div>
      <div v-if="view.name === 'loading-upload'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Uploading...</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding class="text-center">
            <q-spinner size="24px" class="q-mt-xl q-mb-md" />
            <div>Uploading image...</div>
          </q-page>
        </q-page-container>
      </div>
      <div v-if="view.name === 'preview-insert'">
        <q-header class="bg-accent text-black" bordered>
          <q-toolbar class="q-py-md">
            <q-btn flat v-close-popup round dense icon="mdi-close" />
            <q-toolbar-title>Preview</q-toolbar-title
            ><q-btn
              icon="mdi-image"
              label="All images"
              no-caps
              color="secondary"
              outline
              class="q-mr-sm"
              @click="resetFileInput()"
            />
            <q-btn
              label="Insert"
              no-caps
              color="secondary"
              @click="insertImage()"
            />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <q-input
              label="Title"
              outlined
              color="secondary"
              hint="Title is shown underneath image"
              v-model="image.title"
              autofocus
            />
            <q-img
              :src="previewImageURL"
              :ratio="16 / 9"
              class="q-my-md rounded-borders"
              no-spinner
              no-transition
            />
            <q-input
              type="textarea"
              autogrow
              label="Description"
              color="secondary"
              outlined
              hint="Important for people using screen readers"
              v-model="image.data.description"
              :rules="[
                (val) =>
                  val.length >= 5 || 'Please use a minimum of 5 characters',
              ]"
              disable
            />
            <div class="text-bold q-mt-sm">Tags</div>
            <div v-if="image.data.labels">
              <q-chip
                v-for="(label, index) in image.data.labels"
                :key="index"
                color="grey-3"
                square
              >
                {{ label.description }}
              </q-chip>
            </div>
            <div class="text-italic" v-else>
              Analysing image... <q-spinner color="grey" />
            </div>
            <div class="text-bold q-mt-sm">Attribution</div>
            <div>
              Author: {{ image.data.author.name
              }}<span v-if="image.data.author.ai"
                >, generated using {{ image.data.author.ai }}
              </span>
              <span v-if="image.data.author.source">
                (<a :href="image.data.author.source" target="_blank">Source</a>)
              </span>
            </div>
            <div v-if="image.data.author.licence">
              Licence: {{ image.data.author.licence }}
            </div>
          </q-page>
        </q-page-container>
      </div>
    </q-layout>
  </q-dialog>
</template>
<script>
import axios from "axios";
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
import { useEditorStore } from "src/stores/editor";
const db = getFirestore();

import { httpsCallable } from "firebase/functions";

import sanitizeHtml from "sanitize-html";

function imageDefault() {
  return {
    // Local image file to upload
    localURL: null,
    localFormFile: new FormData(),

    // Metadata (synced with firestore)
    dataLoaded: false,
    error: null,
    data: {
      id: null,
      description: "",
      fileName: null,
      author: {
        name: null,
        source: null,
        licence: null,
        ai: null,
      },
      labels: null,
    },
    title: null,
  };
}

import {
  query,
  collection,
  onSnapshot,
  getFirestore,
  orderBy,
  limit,
} from "firebase/firestore";

export default {
  props: ["value"],
  // components: { ActivistHandbook },
  data() {
    return {
      // Image host
      imageHost: "https://imagedelivery.net/0REzXdw3XtT87nmcqY33OQ/",

      // Cloudflare image URL
      imageUploadURL: null,

      view: {
        dialogOpen: this.value,
        name: "gallery", // "gallery", "preview", "upload-consent", "loading-upload", "upload-done"
        dropboxActive: false,
        createdBy: null, // "me", "someone-else"
      },

      // Gallery & search
      searchQuery: null,
      galleryImages: {
        data: null, // array
        dataLoaded: false,
        error: null,
        unsubscribe: null,
      },
      image: imageDefault(),
    };
  },

  computed: {
    ...mapStores(useFirebaseStore, useEditorStore),
    isValidHttpUrl: function () {
      let url;

      try {
        url = new URL(this.image.data.author.source);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    },
    previewImageURL: function () {
      // If we still have the image locally, we load that one to save bandwith
      if (this.image.localURL) return this.image.localURL;
      else return `${this.imageHost}${this.image.data.id}/articleLarge`;
    },
  },
  async mounted() {
    await this.getImageUploadURL();
    await this.fetchGalleryImages();
  },
  unmounted() {
    this.galleryImages.unsubscribe();
  },
  methods: {
    handleHide() {
      this.view.name = "gallery";
      this.resetFileInput();
    },

    // 1️⃣ SETUP
    async fetchGalleryImages() {
      this.galleryImages.unsubscribe = onSnapshot(
        query(
          collection(db, "images"),
          orderBy("createdServerTimestamp", "desc"),
          limit(12)
        ),
        (snapshot) => {
          let images = [];
          snapshot.forEach((doc) => {
            images.push(doc.data());
          });
          this.galleryImages.data = images;
          this.galleryImages.dataLoaded = true;
        },
        (error) => {
          this.galleryImages.error = error;
          console.error(error);
          this.$q.notify("Something went wrong (fetchGalleryImages).");
        }
      );
    },
    async getImageUploadURL() {
      const getImageUploadURL = httpsCallable(
        this.firebaseStore.functions,
        "getImageUploadURL"
      );
      await getImageUploadURL()
        .then((response) => {
          this.imageUploadURL = response.data.result.uploadURL;
        })
        .catch((error) => {
          console.error(error);
          this.galleryImages.error = error;
          this.$q.notify("Something went wrong (getImageUploadURL)");
        });
    },
    async processImageUpload() {
      if (!this.image.data.author.name) {
        this.image.data.author.name =
          this.firebaseStore.auth.currentUser.displayName;
      }

      const processImageUpload = httpsCallable(
        this.firebaseStore.functions,
        "processImageUpload"
      );
      await processImageUpload({ ...this.image.data })
        .then((result) => {
          // Check if we're still viewing the same image
          if (this.image.data.id === result.data.id)
            this.image.data = result.data;
        })
        .catch((error) => {
          this.image.error = error;
          console.error(error);
          this.$q.notify("Something went wrong (processImageUpload).");
        });
    },

    // 2️⃣ FILE INPUT / SELECT IMAGE
    dragover(event) {
      event.preventDefault();
      // Add some visual fluff to show the user can drop its files
      this.view.dropboxActive = true;
    },
    dragleave(event) {
      // Clean up
      this.view.dropboxActive = false;
    },
    drop(event) {
      event.preventDefault();

      this.handleFileInput(event.dataTransfer.files[0]);
      this.view.dropboxActive = false;
    },
    handleFileInput(file) {
      if (!file.type.startsWith("image")) {
        this.$q.notify("File type not supported.");
      } else {
        this.image = imageDefault();

        this.image.localURL = URL.createObjectURL(file);
        this.image.localFormFile.append("file", file);
        this.image.data.fileName = file.name;

        this.view.name = "preview-upload";
      }
    },
    resetFileInput() {
      Object.assign(this.image, imageDefault());
      this.view.name = "gallery";
    },
    selectImage(image) {
      Object.assign(this.image.data, image);
      this.view.name = "preview-insert";
    },

    // 3️⃣ UPLOAD
    async uploadImage() {
      if (!this.imageUploadURL) {
        this.$q.notify("Something went wong (upload link not available yet)");
      } else {
        this.view.name = "loading-upload";
        await axios
          .post(this.imageUploadURL, this.image.localFormFile, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(async (response) => {
            this.image.data.id = response.data.result.id;

            this.view.name = "preview-insert";
            this.$q.notify({
              message: "Image uploaded",
              icon: "mdi-check",
            });

            await this.processImageUpload();

            // Generate new url for next upload
            await this.getImageUploadURL();
          })
          .catch(async (error) => {
            console.error(error);
            this.$q.notify("Something went wrong with uploading.");
            this.view.name = "upload-consent";
            await this.processImageUpload();
          });
      }
    },

    // 4️⃣ INSERT IMAGE
    async insertImage() {
      // this.editorStore.tiptap.content
      //   .chain()
      //   .focus()
      //   .setImage({
      //     src: `${this.imageHost}${this.image.data.id}/articleLarge`,
      //     alt: this.image.data.description,
      //   })
      //   .run();

      const img = {};
      Object.assign(img, this.image);

      let caption = "";
      if (img.title) {
        caption += sanitizeHtml(img.title);
      }
      if (img.title && img.data.author.name) {
        caption += ", by ";
      }
      if (!img.title && img.data.author.name) {
        caption += "By ";
      }
      if (img.data.author.name && img.data.author.source) {
        caption += `<a href="${sanitizeHtml(
          img.data.author.source
        )}">${sanitizeHtml(img.data.author.name)}</a>`;
      }
      if (img.data.author.name && !img.data.author.source) {
        caption += sanitizeHtml(img.data.author.name);
      }
      if (img.data.author.ai) {
        caption += ` | Generated using ${sanitizeHtml(img.data.author.ai)}`;
      }
      if (img.data.author.licence) {
        caption += ` (${sanitizeHtml(img.data.author.licence)})`;
      }

      await this.editorStore.tiptap.content
        .chain()
        .focus()
        .setImageWithCaption({
          src: `${this.imageHost}${this.image.data.id}/articleLarge`,
          alt: this.image.data.description,
          caption: caption,
        })
        .run();

      this.$refs.imageSelector.hide();

      this.resetFileInput();
      this.view.name = "gallery";
    },
  },
};
</script>
<style lang="scss">
.photo-result {
  transition: 0.1s opacity;
  &:hover {
    opacity: 0.9 !important;
  }
}

.drop-active {
  border: 6px dashed black !important;
}
</style>
