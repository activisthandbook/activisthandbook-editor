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
          <q-menu :offset="[0, 12]" class="shadow-8 bg-accent">
            <q-list style="min-width: 100px">
              <!-- 👉 TODO: Switch between versions -->
              <q-item clickable v-close-popup disable>
                <q-item-section>Version history</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-history" />
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="deleteAndPublish()">
                <q-item-section>Delete</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-delete-outline" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup :to="{ name: 'Home' }" exact>
                <q-item-section>Home</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-home-outline" />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup :to="{ name: 'New' }">
                <q-item-section>New article</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-text-box-plus-outline" />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup :to="{ name: 'Moderate' }">
                <q-item-section>Moderate</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-shield-outline" />
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
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      show-if-above
      v-model="rightDrawerOpen"
      side="right"
      bordered
      class="bg-accent"
      :width="400"
    >
      <div class="q-ma-md table-of-contents">
        <div
          v-for="(header, index) in editorStore.article.contentHeaders"
          :key="index"
          :class="{ 'q-ml-lg': header.level === 3 }"
        >
          <q-btn
            @click="mixin_scrollToID(header.id)"
            no-caps
            square
            flat
            class="full-width"
            align="left"
            :class="{ 'text-bold': header.level === 2 }"
            :dense="header.level > 2"
          >
            <div class="ellipsis">{{ header.text }}</div>
          </q-btn>
        </div>
      </div>
    </q-drawer> -->

    <q-page-container class="flex items-start">
      <q-page padding style="max-width: 720px; margin: auto; width: 100%">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <!-- GUIDE -->
          <q-card class="bg-secondary text-accent q-mb-md" flat>
            <q-card-section>
              <div class="q-gutter-y-sm">
                <div>
                  <strong
                    >Thank you for making Activist Handbook better.</strong
                  >
                  All your edits are automatically saved and publicly shared
                  with others under a
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                    target="_blank"
                    class="text-accent"
                    >Creative Commons BY-NC-SA 4.0 licence</a
                  >.
                </div>
                <q-btn
                  label="Writing guide"
                  no-caps
                  color="accent"
                  text-color="black"
                  icon-right="mdi-arrow-right"
                  href="https://activisthandbook.org/en/support/writers"
                  target="_blank"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- EDITOR -->
          <TipTapEditor />
        </div>
        <q-page-sticky
          position="bottom-right"
          :offset="[12, 12]"
          style="z-index: 10"
        >
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
      <aside>
        <div class="table-of-contents">
          <div class="text-caption q-mb-sm text-grey-9">Contents</div>
          <div
            v-if="
              !editorStore.article.contentHeaders ||
              !editorStore.article.contentHeaders[0]
            "
          >
            No headings added yet.
          </div>
          <div
            v-for="(header, index) in editorStore.article.contentHeaders"
            :key="index"
            :class="{ 'q-ml-lg': header.level === 3 }"
          >
            <q-btn
              @click="mixin_scrollToID(header.id)"
              no-caps
              square
              flat
              class="full-width"
              align="left"
              :class="{ 'text-bold': header.level === 2 }"
              dense
            >
              <div class="ellipsis">{{ header.text }}</div>
            </q-btn>
          </div>
        </div>
      </aside>
    </q-page-container>

    <!-- DIALOGS -->
    <!-- Deletion notice dialog -->
    <q-dialog flat v-model="this.editorStore.article.deleteArticle" persistent>
      <q-card class="text-center bg-accent">
        <q-card-section class="q-pa-xl">
          <div>
            <q-icon name="mdi-delete" size="64px" color="primary" />
          </div>
          <h2 class="q-mt-md q-mb-sm">Article is in bin</h2>
          <div>
            Our moderators will review your request to delete this page soon.
          </div>
          <div class="q-mt-md q-gutter-sm">
            <q-btn
              label="Restore"
              no-caps
              color="secondary"
              icon="mdi-restore"
              @click="restoreAndPublish()"
              outline
            />
            <q-btn
              label="Home"
              no-caps
              color="secondary"
              icon="mdi-home"
              :to="{ name: 'Home' }"
              autofocus
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog flat v-model="this.publishedSuccesfullyDialog">
      <q-card class="text-center bg-accent">
        <q-card-section class="q-pa-xl">
          <div>
            <q-icon name="mdi-heart" size="64px" color="primary" />
          </div>
          <h2 class="q-mt-md q-mb-sm">Thank you for contributing</h2>
          <div>
            Our moderators will have a look at your edits. Thank you for making
            Activist Handbook better.
          </div>
          <div class="q-mt-md q-gutter-sm">
            <q-btn
              label="Home"
              no-caps
              color="secondary"
              icon="mdi-home"
              :to="{ name: 'Home' }"
              outline
            />
            <q-btn
              label="Continue editing"
              no-caps
              color="secondary"
              @click="this.publishedSuccesfullyDialog = false"
              autofocus
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Publishing error dialog -->
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
  </q-layout>
</template>

<script>
import { mapStores } from "pinia";
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import {
  getFirestore,
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
const db = getFirestore();

// VUE COMPONENTS
import TipTapEditor from "src/components/tiptap/TipTapEditor.vue";

export default {
  components: {
    TipTapEditor,
  },

  data() {
    return {
      rightDrawerOpen: false,
      errorDialogOpen: false,
      validation: null,
      publishedSuccesfullyDialog: false,
    };
  },

  computed: {
    ...mapStores(useEditorStore, useFirebaseStore),
    allowedToPublish: function () {
      if (
        this.editorStore.article.requestedPublication &&
        this.editorStore.article.requestedPublicationTimestamp >
          this.editorStore.local.lastEditTimestamp
      ) {
        return false;
      } else return true;
    },
  },

  created() {
    // watch the params of the route to fetch the data again
    this.$watch(
      () => this.$route.params,
      async (toParams, previousParams) => {
        if (!previousParams || toParams.articleID !== previousParams.articleID)
          await this.fetchAndRender();
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    );
  },

  methods: {
    async fetchAndRender() {
      await this.editorStore.fetchFromServer(this.$route.params.articleID);
    },
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
    validateThenPublish() {
      this.validation = this.editorStore.validateArticle();
      if (this.validation.hasErrors) {
        this.errorDialogOpen = true;
      } else {
        this.publish();
      }
    },
    async publish() {
      const time = Date.now();

      const batch = writeBatch(db);

      // 1. Create new version
      const versionID = this.mixin_randomID();
      const versionRef = doc(
        db,
        "articles",
        this.$route.params.articleID,
        "versions",
        versionID
      );

      const versionContent = {
        title: this.editorStore.article.title,
        description: this.editorStore.article.description,
        tags: this.editorStore.article.tags,
        path: this.editorStore.article.path,
        content: this.editorStore.article.content,
        articleID: this.editorStore.article.id,
        id: versionID,
        languageCollectionID: this.editorStore.article.languageCollectionID,
        deleteArticle: this.editorStore.article.deleteArticle,
        langCode: this.editorStore.article.langCode,
        wordCount: this.editorStore.article.wordCount,

        lastUpdatedServerTimestamp: serverTimestamp(),
        status: "review",
      };
      batch.set(versionRef, versionContent, {
        merge: true,
      });

      // 2. Update live draft
      batch.set(
        doc(db, "articles", this.$route.params.articleID),
        {
          requestedPublication: true,
          requestedPublicationTimestamp: time,
        },
        {
          merge: true,
        }
      );

      await batch.commit().then(() => {
        this.editorStore.article.requestedPublication = true;
        this.editorStore.article.requestedPublicationTimestamp = time;

        if (!this.editorStore.article.deleteArticle) {
          this.publishedSuccesfullyDialog = true;
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
        this.editorStore.article.deleteArticle = false;

        this.publish();
      });
    },
  },
};
</script>
<style lang="scss">
.q-drawer {
  background: $accent;
}
.no-touch {
  aside {
    opacity: 0.5;
    transition: 0.5s opacity;

    &:hover {
      opacity: 1;
    }
  }
}
aside {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  // border-radius: 6px;
  margin: 32px;
  position: sticky;
  top: 32px;
  width: 300px;
  max-height: calc(100vh - 64px);
  overflow: scroll;
  padding: 8px 16px;

  @media only screen and (max-width: 1100px) {
    display: none;
  }
}
.table-of-contents .q-btn:not(.text-bold) {
  font-family: $font-primary;
  font-weight: 400;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  scroll-margin-top: 100px;
}
</style>
