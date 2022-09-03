<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="q-py-md">
        <q-toolbar-title>Edit</q-toolbar-title>

        <!-- <q-btn
          icon="mdi-link"
          label="Share"
          color="primary"
          class="q-mr-sm"
          outline
          no-caps
          @click="share()"
        /> -->

        <q-btn
          label="Tools"
          icon="mdi-tools"
          no-caps
          class="q-mr-sm q-px-lg"
          color="grey-2"
          text-color="primary"
          unelevated
        >
          <q-menu :offset="[0, 12]" class="shadow-8">
            <q-list style="min-width: 100px">
              <!-- 👉 TODO: Switch between versions -->
              <q-item clickable v-close-popup disable>
                <q-item-section>Version history</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-history" />
                </q-item-section>
              </q-item>

              <!-- 👉 TODO: Open article in different language -->
              <q-item clickable v-close-popup disable>
                <q-item-section>Translate</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-translate" />
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="deleteAndPublish()">
                <q-item-section>Delete</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-delete" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                :to="{ name: 'Edit', params: { articleID: mixin_randomID() } }"
              >
                <q-item-section>New article</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-text-box-plus-outline" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="firebaseStore.signOut()">
                <q-item-section>Sign out</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-exit-to-app" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          color="primary"
          text-color="accent"
          no-caps
          @click="validateThenPublish()"
          :disable="!allowedToPublish"
          :icon="!allowedToPublish ? 'mdi-check' : 'mdi-send'"
          class="q-px-lg"
        >
          <span class="q-ml-sm">
            <span v-if="allowedToPublish">Publish</span>
            <span v-else>Done</span>
          </span>
        </q-btn>

        <q-dialog v-model="errorDialogOpen">
          <q-card style="min-width: 300px">
            <q-card-section>
              <div class="text-bold q-mb-sm">Almost ready to publish... 🤩</div>
              <div>But first:</div>
              <div v-for="(error, index) in validation.errorList" :key="index">
                👉 {{ error }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding style="max-width: 700px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <q-card class="bg-secondary text-accent" flat>
            <q-card-section>
              <div class="q-gutter-y-sm">
                <h1 class="q-my-sm text-accent">New to writing?</h1>
                <div>Read our guide for Activist Handbook writers:</div>
                <q-btn
                  label="Writing guide"
                  no-caps
                  color="accent"
                  text-color="black"
                  icon-right="mdi-arrow-right"
                />
              </div>
            </q-card-section>
          </q-card>
          <!-- <TipTapEditor v-model="article" /> -->
          <q-card class="text-center bg-primary text-accent" flat v-if="false">
            <q-card-section class="q-py-xl">
              <div>
                <q-icon name="mdi-delete" size="64px" />
              </div>
              <h1 class="text-accent q-mt-md q-mb-sm">Article is in bin!</h1>
              <div>
                Our moderators will review your request to delete this page
                soon.
              </div>
              <div class="q-mt-md">
                <q-btn
                  label="Restore"
                  no-caps
                  color="accent"
                  text-color="black"
                  icon="mdi-restore"
                  @click="restoreAndPublish()"
                />
              </div>
            </q-card-section>
          </q-card>
          <TipTapEditor />
        </div>
        <q-page-sticky position="bottom-right" :offset="[12, 12]">
          <q-fab
            icon="mdi-auto-fix"
            label="AI Writer"
            label-position="left"
            external-label
            text-color="accent"
            class="gradient"
            no-caps
            :hide-label="false"
          >
          </q-fab>
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import {
  getFirestore,
  setDoc,
  doc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
const db = getFirestore();

// VUE COMPONENTS
import TipTapEditor from "components/TipTapEditor.vue";

export default {
  setup() {
    const editorStore = useEditorStore();
    const firebaseStore = useFirebaseStore();

    return {
      // you can return the whole store instance to use it in the template
      editorStore,
      firebaseStore,
    };
  },
  components: {
    TipTapEditor,
  },

  data() {
    return {
      // article: {
      //   title: "",
      //   description: "",
      //   content: "",
      //   path: "",
      // },
      allowedToPublish: false,
      errorDialogOpen: false,
      validation: null,
    };
  },

  mounted: function () {
    this.updateWhileAgo();
    setInterval(() => {
      this.updateWhileAgo();
    }, 1000);
  },

  computed: {
    lastSaveTimestamp: function () {
      return 0;
    },
  },

  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      () => {
        this.editorStore.fetchFromServer(this.$route.params.articleID);
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },

  methods: {
    share() {
      this.mixin_copyText(window.location.href);
      this.$q.dialog({
        title: "Copied to clipboard ✅",
        message:
          "Share the link with others to work together on this article. Anyone with the link can edit.",
        ok: {
          color: "secondary",
          flat: true,
          noCaps: true,
        },
      });
    },
    updateWhileAgo() {
      const whileAgo = Date.now() - 1000 * 10;

      let requestedPublication = false;
      let requestedPublicationTimestamp = 0;

      if (!requestedPublication) {
        this.allowedToPublish = true;
      } else if (
        whileAgo > requestedPublicationTimestamp &&
        this.editorStore.lastEditTimestamp > requestedPublicationTimestamp
      ) {
        this.allowedToPublish = true;
      } else this.allowedToPublish = false;

      // this.allowedToPublish =
      //   whileAgo > this.editorStore.syncedData.requestedPublicationTimestamp;

      //   this.editorStore.syncedData.requestedPublication && !whileAgo
    },
    validateThenPublish() {
      this.validation = this.editorStore.validateArticle();
      if (this.validation.hasErrors) {
        this.errorDialogOpen = true;
      } else {
        this.publish();
      }
    },
    publish() {
      console.log("publish");
      const time = Date.now();
      addDoc(
        collection(db, "articles", this.$route.params.articleID, "versions"),
        {
          ...this.editorStore.article,
          lastUpdatedServerTimestamp: serverTimestamp(),
          status: "review",
        },
        {
          merge: true,
        }
      ).then(() => {
        this.editorStore.y.syncedData.set("requestedPublication", true);
        console.log("published");
      });

      setDoc(
        doc(db, "articles", this.$route.params.articleID),
        {
          requestedPublication: true,
          requestedPublicationTimestamp: time,
        },
        {
          merge: true,
        }
      ).then(() => {
        this.editorStore.y.syncedData.set("requestedPublication", true);
        this.editorStore.y.syncedData.set(
          "requestedPublicationTimestamp",
          time
        );
        this.updateWhileAgo();
        console.log("published");
        if (this.editorStore.syncedData.deleteArticle) {
          this.$q.dialog({
            title: "Article put in bin 🗑",
            message:
              "Our moderators will review your request to delete this page soon.",
            ok: {
              color: "secondary",
              flat: true,
              noCaps: true,
            },
          });
        } else {
          this.$q.dialog({
            title: "Thank you for contributing ❤️",
            message:
              "Our moderators will have a look at your edits. Thank you for making Activist Handbook better.",
            ok: {
              color: "secondary",
              flat: true,
              noCaps: true,
            },
          });
        }
      });
    },
    deleteAndPublish() {
      setDoc(
        doc(db, "articles", this.$route.params.articleID),
        {
          deleteArticle: true,
        },
        {
          merge: true,
        }
      ).then(() => {
        this.editorStore.y.syncedData.set("deleteArticle", true);
        this.editorStore.article.deleteArticle = true;
        this.publish();
      });
    },
    restoreAndPublish() {
      setDoc(
        doc(db, "articles", this.$route.params.articleID),
        {
          deleteArticle: false,
        },
        {
          merge: true,
        }
      ).then(() => {
        this.editorStore.y.syncedData.set("deleteArticle", false);
        this.editorStore.article.deleteArticle = false;

        this.publish();
      });
    },
  },
};
</script>
