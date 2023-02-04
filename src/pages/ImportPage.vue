<template>
  <div class="q-gutter-y-md q-ma-xl">
    <h1>Wiki.js import tool</h1>
    <div class="text-bold">
      Instructions: This is an import tool for Wiki.js. First, set the graphql
      endpoint url in the 'devServer' settings in 'quasar.config.js'. Then click
      the bottons below in order. Review the output to verify everything works
      as expected.
    </div>
    <div>
      Warning: Using this import tool can be expensive. The exact costs depends
      on the number of articles being imported and those already in Firebase.
    </div>
    <div>Limitations:</div>
    <ul>
      <li>Import max 1000 pages.</li>
      <li>
        Only works with quasar dev server, not in production (to circumvent cors
        rules).
      </li>
      <li>Images and videos need to be added manually.</li>
      <li>Does not check for duplicate paths with existing articles.</li>
      <li>Cannot deal with '&lt;' in text.</li>
      <li>Counters only correct when there were no articles before.</li>
    </ul>
    <div class="text-bold">Fetch limit</div>
    <q-slider v-model="settings.fetchLimit" :min="1" :max="1000" label-always />
    <div class="text-bold">Preparation</div>
    <ul>
      <li>
        Change the file src/stores/firebase.js: temporarily set 'importing' to
        true.
      </li>
      <li>Temporarily allow localhost in app-check and authentication.</li>
      <li>Give yourself admin rights.</li>
    </ul>
    <div class="text-bold">1) Add GraphQL API key</div>
    <form>
      <q-input
        v-model="apiKey"
        outlined
        label="API Key"
        type="password"
        autocomplete="current-password"
      />
    </form>

    <div class="text-bold">2) Get page IDs</div>
    <q-btn
      label="Get page IDs"
      @click="getPageIDs()"
      :loading="pageIDs.loading"
    />
    <div v-if="pageIDs.dataLoaded">
      RESULT: {{ pageIDs.data.length }} page IDs found
      <div class="plain-text-result">{{ pageIDs.data }}</div>
    </div>

    <div class="text-bold">3) Fetch pages (API Key required)</div>
    <q-btn
      label="Fetch pages"
      @click="fetchPages()"
      :disable="!apiKey || !pageIDs.dataLoaded"
      :loading="pages.loading"
    />
    <div v-if="pages.dataLoaded">
      RESULT: {{ pages.length }} pages found
      <!-- <div class="plain-text-result">{{ pages }}</div> -->
    </div>

    <div class="text-bold">4) Render articles</div>
    <q-btn
      label="Render"
      @click="renderPages()"
      :disable="!pages.dataLoaded"
      :loading="renderedPages.loading || renderedLanguageCollections.loading"
    />
    <div
      v-if="renderedPages.dataLoaded && renderedLanguageCollections.dataLoaded"
    >
      RESULT: {{ renderedPages.data.length }} pages rendered,
      {{ renderedLanguageCollections.data.length }} language collections created
      <div class="plain-text-result">{{ renderedPages.data }}</div>
      <div class="plain-text-result">
        {{ renderedLanguageCollections.data }}
      </div>
    </div>

    <div class="text-bold">5) Push articles</div>
    <q-btn
      label="Push"
      @click="pushPages()"
      :disable="
        !renderedPages.dataLoaded || !renderedLanguageCollections.dataLoaded
      "
      :loading="push.loading"
    />
    <div v-if="push.done">
      RESULT: Successfully pushed all articles and language collections
    </div>

    <div class="text-bold">6) Set counters (do this after 5 min!)</div>
    <q-btn
      label="Set counters"
      @click="setCounters()"
      :loading="databaseArticles.loading || databaseLanguageCollections.loading"
    />
    <div
      v-if="
        databaseArticles.dataLoaded && databaseLanguageCollections.dataLoaded
      "
    >
      RESULT: Successfully fetched
      <strong>{{ databaseArticles.length }} articles</strong> &
      <strong
        >{{ databaseLanguageCollections.length }} languageCollections</strong
      >
      and set the counters.
    </div>

    <div class="text-bold">7) Finishing</div>
    <ul>
      <li>Remove localhost from app check and authentication.</li>
      <li>
        Change the file src/stores/firebase.js: temporarily set 'importing' to
        false.
      </li>
    </ul>
  </div>
</template>
<script>
import axios from "axios";
import sanitizeHtml from "sanitize-html";

import {
  getFirestore,
  doc,
  serverTimestamp,
  writeBatch,
  getDocs,
  query,
  where,
  collection,
  limit,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
const db = getFirestore();

export default {
  data: function () {
    return {
      apiKey: null,
      settings: {
        fetchLimit: 10,
      },
      pageIDs: {
        data: null,
        dataLoaded: false,
        loading: false,
      },
      pages: {
        data: null,
        dataLoaded: false,
        loading: false,
        length: null,
      },
      renderedPages: {
        data: null,
        dataLoaded: false,
        loading: false,
        length: null,
      },
      renderedLanguageCollections: {
        data: null,
        dataLoaded: false,
        loading: false,
        length: null,
      },
      push: {
        loading: false,
        done: false,
      },
      databaseArticles: {
        data: null,
        dataLoaded: false,
        loading: false,
        length: null,
      },
      databaseLanguageCollections: {
        data: null,
        dataLoaded: false,
        loading: false,
        length: null,
      },
    };
  },
  computed: {
    pagesDataLength: function () {
      return this.pages.data.length;
    },
    ...mapStores(useFirebaseStore),
  },
  watch: {
    "pages.data"() {
      this.pages.length = this.pages.data.length;
    },
  },
  methods: {
    async getPageIDs() {
      var vm = this;

      this.pageIDs.loading = true;
      await axios({
        url: "/graphql",
        method: "post",
        data: {
          query: `
            {
              pages {
                list (orderBy: ID) {
                  id
                }
              }
            }
          `,
        },
      }).then(async (result) => {
        let pageIDs = [];
        let i = 0;
        await result.data.data.pages.list.forEach(async (page) => {
          if (i < this.settings.fetchLimit) {
            pageIDs.push(page.id);
          }
          i++;
        });
        this.pageIDs.data = pageIDs;
        // this.$nextTick(() => {
        this.pageIDs.dataLoaded = true;
        this.pageIDs.loading = false;
        // });
      });
    },
    async fetchPages() {
      this.pages.loading = true;
      // let x = 0;
      var itemsProcessed = 0;

      let pages = [];
      const callback = () => {
        this.pages.data = pages;
        this.pages.dataLoaded = true;
        this.pages.loading = false;
      };

      let i = 0;

      await this.pageIDs.data.forEach(async (pageID) => {
        await axios({
          url: "/graphql",
          method: "post",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          data: {
            query: `
                {
                  pages {
                    single (id: ${pageID}) {
                      path
                      title
                      description
                      tags {
                        id
                        tag
                        title
                      }
                      content
                      render
                      contentType

                      createdAt
                      updatedAt

                      editor
                      locale
                    }
                  }
                }
              `,
          },
        }).then(async (result) => {
          // console.log(result);
          pages.push(result.data.data.pages.single);
          itemsProcessed++;
          if (itemsProcessed === this.pageIDs.data.length) {
            callback();
          }
          // callback();
        });
      });
    },
    async renderPages() {
      let renderedPages = [];
      let languageCollections = [];

      this.renderedPages.loading = true;
      this.renderedLanguageCollections.loading = true;

      function sanitizePath(path) {
        let sanitizedPath = sanitizeHtml(path.replace("'", ""));
        if (sanitizedPath === "home") {
          sanitizedPath = "index";
        }
        return sanitizedPath;
      }

      function generateFullPath(article) {
        let fullPath = "";
        let path = sanitizePath(article.path);
        if (article.locale === "en") {
          fullPath = path;
        } else {
          fullPath = article.locale + "/" + path;
        }
        return fullPath;
      }

      function parseDate(date) {
        return Timestamp.fromMillis(Date.parse(date));
      }

      await this.pages.data.forEach((page) => {
        if (page.path === "index" && page.locale === "en") {
          console.log("index page skipped");
        } else {
          const id = this.mixin_randomID();
          let renderedPage = {
            title: sanitizeHtml(page.title),
            description: sanitizeHtml(page.description),
            path: sanitizePath(page.path),
            publishedFullPath: generateFullPath(page),
            lastPublishedServerTimestamp: parseDate(page.updatedAt),
            id: id,
            articleID: id,
            langCode: sanitizeHtml(page.locale),
            content: "",
            tags: [],
            imported: true,
            importInfo: {},
            metadata: {
              updatedTimestamp: parseDate(page.updatedAt),
              updatedBy: this.firebaseStore.auth.currentUser.uid,
              createdTimestamp: parseDate(page.createdAt),
              createdBy: this.firebaseStore.auth.currentUser.uid,
            },
          };

          // 1. Use content if contentType is html (because it does not contain TOC links)
          // Content can be markdown
          // Render is always html
          if (page.contentType === "html") {
            renderedPage.content = page.content;
          } else {
            // For example, the original is markdown, so then we use the html render
            renderedPage.content = page.render;
          }

          // 2. Set import metadata
          if (renderedPage.content.includes("<img")) {
            renderedPage.importInfo.includesImages = true;
          }
          if (renderedPage.content.includes("<iframe")) {
            renderedPage.importInfo.includesIframe = true;
          }

          // 3. Clean markdown render artifacts (we remove TOC anchor text "¶", not the empty links that remain, those are removed later)
          if (page.contentType === "markdown") {
            renderedPage.content = renderedPage.content.replaceAll("¶", "");
          }

          // 4. See if a language collection already exists for this path. If yes, add it to that collection. If not, create one.
          const renderedPageID = this.mixin_randomID();
          const renderedPageCollectionIndex = languageCollections.findIndex(
            (languageCollection) =>
              languageCollection.path === renderedPage.path
          );
          if (renderedPageCollectionIndex >= 0) {
            renderedPage.languageCollectionID =
              languageCollections[renderedPageCollectionIndex].id;
            languageCollections[
              renderedPageCollectionIndex
            ].articles_draft.push({
              articleID: renderedPage.id,
              langCode: renderedPage.langCode,
            });
          } else {
            const languageCollectionID = this.mixin_randomID();
            renderedPage.languageCollectionID = languageCollectionID;
            languageCollections.push({
              id: languageCollectionID,
              path: renderedPage.path,
              articles_draft: [
                {
                  articleID: renderedPage.id,
                  langCode: renderedPage.langCode,
                },
              ],
            });
          }

          // 5. Replace "<div>\n</div>", then all "\n", then all "\" with nothing ""
          renderedPage.content = renderedPage.content
            .replaceAll("<div>\n</div>", "")
            .replaceAll("\n", "")
            .replaceAll("\\", "")
            .replaceAll("&nbsp;", " ");

          // 6. Replace <figure with <div to prevent tiptap bug "Cannot read properties of null (reading 'firstChild')" (It usually is wrapped around a table, and replacing it fixes it.)
          renderedPage.content = renderedPage.content
            .replaceAll("<figure", "<div")
            .replaceAll("</figure", "</div");

          // 7. Change headings
          // Replace "<h3" with "<h4". Then replace "<h2" with "<h3". Finally replace "<h1" with "<h2". We leave <h5 and <h6 untouched, because that makes it easier for editors to recognise them & fix it manually (they will be highlighted in the editor).
          renderedPage.content = renderedPage.content
            .replaceAll("<h3", "<h4")
            .replaceAll("</h3", "</h4")
            .replaceAll("<h2", "<h3")
            .replaceAll("</h2", "</h3")
            .replaceAll("<h1", "<h2")
            .replaceAll("</h1", "</h2");

          // 8. Fix links
          // - In Vitepress, the default language does not use a language prefix)
          // - We want relative paths
          renderedPage.content = renderedPage.content
            .replaceAll('"https://activisthandbook.org/', '"/')
            .replaceAll('"https://www.activisthandbook.org/', '"/')
            .replaceAll('"/en/', '"/');

          var doc = document.createElement("div");
          doc.innerHTML = renderedPage.content;
          const links = doc.getElementsByTagName("a");

          for (var i = 0; i < links.length; i++) {
            const url = links[i].getAttribute("href");

            const urlArray = url.split("/");
            if (url.endsWith("/home") && !url.startsWith("http")) {
              const langCode = urlArray[1];

              renderedPage.content = renderedPage.content.replaceAll(
                `href=\"${url}\"`,
                `href=\"/${langCode}/\"`
              );
            }

            if (
              !url.startsWith("http") &&
              !url.startsWith("/") &&
              !url.startsWith("mailto")
            ) {
              renderedPage.content = renderedPage.content.replaceAll(
                `href=\"${url}\"`,
                `href=\"/${renderedPage.path}/${url}\"`
              );
              // console.log("changed links:", renderedPage.content);
            }
          }

          doc.remove();

          // 9. Add tags
          page.tags.forEach((tag) => {
            renderedPage.tags.push(sanitizeHtml(tag.title));
          });

          // 10. Sanitize content
          renderedPage.content = sanitizeHtml(renderedPage.content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
              "iframe",
              "img",
              "figure",
              "figcaption",
            ]),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              iframe: ["src", "allowfullscreen", "start", "width", "height"],
              div: ["data-youtube-video"],
              img: ["src", "alt", "imageid", "imagesource", "imagecaption"],
            },

            allowedIframeHostnames: ["www.youtube-nocookie.com"],

            // 11. Remove empty <a></a> tags
            exclusiveFilter: function (frame) {
              return frame.tag === "a" && !frame.text.trim();
            },
          });

          // 12. Replace  &amp; with &
          renderedPage.content = renderedPage.content.replaceAll("&amp;", "&");
          renderedPage.title = renderedPage.title.replaceAll("&amp;", "&");
          renderedPage.description = renderedPage.description.replaceAll(
            "&amp;",
            "&"
          );

          renderedPages.push(renderedPage);
        }
      });

      this.renderedPages.data = renderedPages;
      this.renderedLanguageCollections.data = languageCollections;
      this.renderedPages.loading = false;
      this.renderedLanguageCollections.loading = false;
      this.renderedPages.dataLoaded = true;
      this.renderedLanguageCollections.dataLoaded = true;
    },
    async pushPages() {
      this.push.loading = true;
      this.push.done = false;
      // ARTICLES
      const batchArticles1 = writeBatch(db);
      const batchArticles2 = writeBatch(db);
      const batchArticlesVersion1 = writeBatch(db);
      const batchArticlesVersion2 = writeBatch(db);
      const batchArticlesQueue1 = writeBatch(db);
      const batchArticlesQueue2 = writeBatch(db);

      let countPages = 0;

      this.renderedPages.data.forEach(async (article) => {
        const articleRef = doc(db, "articles_draft", article.id);
        const articleVersionRef = doc(
          db,
          "articles_draft",
          article.id,
          "versions_published",
          article.id
        );
        const articleQueueRef = doc(db, "articles_inQueue", article.id);
        if (countPages < 500) {
          batchArticles1.set(articleRef, article);
          batchArticlesVersion1.set(articleVersionRef, article);
          batchArticlesQueue1.set(articleQueueRef, article);
        } else {
          batchArticles2.set(articleRef, article);
          batchArticlesVersion2.set(articleVersionRef, article);
          batchArticlesQueue2.set(articleQueueRef, article);
        }
        countPages++;
      });

      await batchArticles1.commit();
      await batchArticles2.commit();
      await batchArticlesVersion1.commit();
      await batchArticlesVersion2.commit();
      await batchArticlesQueue1.commit();
      await batchArticlesQueue2.commit();

      // LANGUAGE COLLECTIONS
      const batchLanguageCollections1 = writeBatch(db);
      const batchLanguageCollections2 = writeBatch(db);

      let countLanguageCollections = 0;

      this.renderedLanguageCollections.data.forEach(
        async (languageCollection) => {
          const languageCollectionRef = doc(
            db,
            "languageCollections",
            languageCollection.id
          );

          const data = {
            articles_draft: languageCollection.articles_draft,
            articles_published: null,
            id: languageCollection.id,
            metadata: {
              updatedTimestamp: serverTimestamp(),
              updatedBy: this.firebaseStore.auth.currentUser.uid,
              createdTimestamp: serverTimestamp(),
              createdBy: this.firebaseStore.auth.currentUser.uid,
            },
          };

          if (countLanguageCollections < 1000) {
            batchLanguageCollections1.set(languageCollectionRef, data);
          } else {
            batchLanguageCollections2.set(languageCollectionRef, data);
          }

          countLanguageCollections++;
        }
      );

      await batchLanguageCollections1.commit();
      await batchLanguageCollections2.commit();

      this.push.loading = false;
      this.push.done = true;
    },
    async setCounters() {
      // Articles
      this.databaseArticles.loading = true;
      const databaseArticles = await getDocs(
        query(collection(db, "articles_draft"))
      );

      let articles = [];
      databaseArticles.forEach(async (doc) => {
        articles.push(doc.data());
      });
      this.databaseArticles.data = articles;
      this.databaseArticles.length = articles.length;
      this.databaseArticles.dataLoaded = true;
      this.databaseArticles.loading = false;

      // Language collections
      this.databaseLanguageCollections.loading = true;
      const databaseLanguageCollections = await getDocs(
        query(collection(db, "languageCollections"))
      );

      let LanguageCollections = [];
      databaseLanguageCollections.forEach(async (doc) => {
        LanguageCollections.push(doc.data());
      });
      this.databaseLanguageCollections.data = LanguageCollections;
      this.databaseLanguageCollections.length = LanguageCollections.length;
      this.databaseLanguageCollections.dataLoaded = true;
      this.databaseLanguageCollections.loading = false;

      // Set analytics counts
      await setDoc(
        doc(db, "app", "analytics"),
        {
          articles_draft_count: this.databaseArticles.length,
          articles_published_count: this.databaseArticles.length,
          languageCollections_count: this.databaseLanguageCollections.length,
        },
        { merge: true }
      );
    },
  },
};
</script>
<style>
.plain-text-result {
  user-select: all;
  height: 32px;
  overflow: hidden;
  border: 1px solid black;
  margin-bottom: 4px;
}
</style>
