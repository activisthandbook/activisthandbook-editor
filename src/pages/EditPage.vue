<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="bg-accent text-black" bordered>
      <q-toolbar class="q-py-md">
        <!-- <q-icon name="mdi-file-document-edit" size="24px" class="gt-xs" /> -->
        <AppSwitcher> </AppSwitcher>
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
          color="primary"
          text-color="accent"
          no-caps
          @click="validateThenPublish()"
          :disable="!allowedToPublish"
          :icon="!allowedToPublish ? 'mdi-check' : 'mdi-send'"
          class="q-px-lg q-mr-sm"
        >
          <span class="q-ml-sm">
            <span v-if="allowedToPublish">Publish</span>
            <span v-else>Done</span>
          </span>
        </q-btn>

        <q-btn icon="mdi-dots-vertical" round color="black" flat>
          <q-menu
            :offset="[0, 8]"
            class="shadow-10 bg-accent q-pa-sm"
            style="width: 292px"
            max-height="calc(100vh - 70px)"
          >
            <q-list class="q-ma-sm q-gutter-y-sm">
              <!-- 👉 TODO: Switch between versions -->
              <q-item
                v-if="editorStore.article.publishedFullPath"
                clickable
                v-close-popup
                class="rounded-borders bg-grey-2"
                :href="websiteURL"
                target="_blank"
              >
                <q-item-section>View on website</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-eye" />
                </q-item-section>
              </q-item>
              <q-item
                v-if="editorStore.article.publishedFullPath"
                clickable
                v-close-popup
                class="rounded-borders bg-grey-2"
                :href="versionHistoryURL"
                target="_blank"
              >
                <q-item-section>Version history</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-history" />
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                class="rounded-borders bg-grey-2"
                @click="deleteAndPublish()"
              >
                <q-item-section>Delete</q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-delete" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
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
          <q-card class="bg-grey-2 q-mb-md text-body2" flat>
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
          <ArticleEditor />
        </div>

        <!-- TO-DO: Add AI Editor -->
        <!-- <q-page-sticky
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
        </q-page-sticky> -->
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
            :class="{
              'q-ml-md': header.level === 3,
            }"
          >
            <q-btn
              v-if="header.level < 4"
              @click="mixin_scrollToID(header.id)"
              no-caps
              square
              flat
              class="full-width"
              align="left"
              :class="{ 'text-bold': header.level === 2 }"
              padding="4px 10px"
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
              :to="{ name: 'Home', params: { homeTab: 'home' } }"
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
              v-if="
                usersStore.profile.data[
                  firebaseStore.auth.currentUser.uid
                ].roles?.includes('moderator')
              "
              label="Review"
              no-caps
              color="secondary"
              icon="mdi-shield-check"
              :to="{ name: 'Review', params: { reviewTab: 'articles' } }"
              outline
            />
            <q-btn
              v-else
              label="Home"
              no-caps
              color="secondary"
              icon="mdi-home"
              :to="{ name: 'Home', params: { homeTab: 'home' } }"
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
import AppSwitcher from "components/AppSwitcher.vue";

import {
  getFirestore,
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
const db = getFirestore();

// VUE COMPONENTS
import ArticleEditor from "src/components/editor/ArticleEditor.vue";
import { useUsersStore } from "src/stores/users";

export default {
  components: {
    ArticleEditor,
    AppSwitcher,
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
    ...mapStores(useEditorStore, useFirebaseStore, useUsersStore),
    allowedToPublish: function () {
      if (
        this.editorStore.article.requestedPublication &&
        this.editorStore.article.requestedPublicationTimestamp >
          this.editorStore.local.lastEditTimestamp
      ) {
        return false;
      } else return true;
    },
    // publishedFullPath: function () {
    //   let fullPath = "";
    //   if (this.editorStore.article.publishedFullPath) {
    //     if (this.editorStore.article.langCode !== "en") {
    //       fullPath += this.editorStore.article.langCode + "/";
    //     }
    //     fullPath += this.editorStore.article.publishedFullPath;
    //   }
    //   return fullPath;
    // },
    websiteURL: function () {
      return (
        "https://new.activisthandbook.org/" +
        this.editorStore.article.publishedFullPath
      );
    },
    versionHistoryURL: function () {
      return (
        "https://github.com/activisthandbook/activisthandbook/commits/main/articles/" +
        this.editorStore.article.publishedFullPath +
        ".md"
      );
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
      await this.editorStore.render();
      await this.editorStore.save(this.firebaseStore.auth.currentUser.uid);

      const time = Date.now();

      const batch = writeBatch(db);

      // 1. Create new version
      const versionID = this.mixin_randomID();
      const versionRef = doc(
        db,
        "articles_draft",
        this.$route.params.articleID,
        "versions_draft",
        versionID
      );

      const versionContent = {
        ...this.editorStore.article,
        id: versionID,
        articleID: this.editorStore.article.id,
        status: "review",
        metadata: {
          createdTimestamp: serverTimestamp(),
          createdBy: this.firebaseStore.auth.currentUser.uid,
        },
      };
      batch.set(versionRef, versionContent, {
        merge: true,
      });

      // 2. Update live draft
      batch.set(
        doc(db, "articles_draft", this.$route.params.articleID),
        {
          requestedPublication: true,
          requestedPublicationTimestamp: time,
          metadata: {
            updatedTimestamp: serverTimestamp(),
            updatedBy: this.firebaseStore.auth.currentUser.uid,
          },
        },
        {
          merge: true,
        }
      );

      await batch
        .commit()
        .then(async () => {
          this.editorStore.article.requestedPublication = true;
          this.editorStore.article.requestedPublicationTimestamp = time;

          if (!this.editorStore.article.deleteArticle) {
            this.publishedSuccesfullyDialog = true;
          }
        })
        .catch((error) => {
          this.$q.notify("Publishing failed");
          console.error(error);
        });
    },
    deleteAndPublish() {
      setDoc(
        doc(db, "articles_draft", this.$route.params.articleID),
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
        doc(db, "articles_draft", this.$route.params.articleID),
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
