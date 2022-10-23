<template>
  <div class="q-gutter-y-md q-ma-xl">
    <h1>Wiki.js import tool</h1>
    <div class="text-bold">
      Instructions: This is an import tool for Wiki.js. First, set the graphql
      endpoint url in the 'devServer' settings in 'quasar.config.js'. Then click
      the bottons below in order. Review the output to verify everything works
      as expected.
    </div>
    <div>Limitations:</div>
    <ul>
      <li>Import max 500 pages.</li>
      <li>
        Only works with quasar dev server, not in production (to circumvent cors
        rules).
      </li>
      <li>Images and videos need to be added manually.</li>
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
      <div class="plain-text-result">{{ pages }}</div>
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
} from "firebase/firestore";
const db = getFirestore();

export default {
  data: function () {
    return {
      apiKey: null,
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
    };
  },
  computed: {
    pagesDataLength: function () {
      return this.pages.data.length;
    },
  },
  watch: {
    "pages.data"() {
      this.pages.length = this.pages.data.length;
      console.log("test");
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
        await result.data.data.pages.list.forEach(async (page) => {
          pageIDs.push(page.id);
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
        console.log("callback");
        this.pages.data = pages;
        this.pages.dataLoaded = true;
        this.pages.loading = false;
      };

      await this.pageIDs.data.forEach(async (pageID) => {
        // x += 1;
        // if (x < 10) {
        // const id = 289;
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
        // }
      });
    },
    async renderPages() {
      let renderedPages = [];
      let languageCollections = [];

      this.renderedPages.loading = true;
      this.renderedLanguageCollections.loading = true;

      await this.pages.data.forEach((page) => {
        let renderedPage = {
          title: sanitizeHtml(page.title),
          description: sanitizeHtml(page.description),
          path: sanitizeHtml(page.path),
          id: this.mixin_randomID(),
          langCode: sanitizeHtml(page.locale),
          content: "",
          tags: [],
          imported: true,
          importInfo: {},
          lastUpdatedServerTimestamp: serverTimestamp(),
          createdServerTimestamp: serverTimestamp(),
          lastPublishedServerTimestamp: null,
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
          (languageCollection) => languageCollection.path === renderedPage.path
        );
        if (renderedPageCollectionIndex >= 0) {
          renderedPage.languageCollectionID =
            languageCollections[renderedPageCollectionIndex].id;
          languageCollections[renderedPageCollectionIndex].articles.push({
            articleID: renderedPage.id,
            langCode: renderedPage.langCode,
          });
        } else {
          const languageCollectionID = this.mixin_randomID();
          renderedPage.languageCollectionID = languageCollectionID;
          languageCollections.push({
            id: languageCollectionID,
            path: renderedPage.path,
            articles: [
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

          // Remove empty <a></a> tags
          exclusiveFilter: function (frame) {
            return frame.tag === "a" && !frame.text.trim();
          },
        });

        renderedPages.push(renderedPage);
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
      const batchArticles = writeBatch(db);

      this.renderedPages.data.forEach((article) => {
        const articleRef = doc(db, "articles", article.id);
        batchArticles.set(articleRef, article);
      });

      await batchArticles.commit();

      // LANGUAGE COLLECTIONS
      const batchLanguageCollections = writeBatch(db);

      this.renderedLanguageCollections.data.forEach((languageCollection) => {
        const languageCollectionRef = doc(
          db,
          "languageCollections",
          languageCollection.id
        );

        batchLanguageCollections.set(languageCollectionRef, {
          articles: languageCollection.articles,
        });
      });

      await batchLanguageCollections.commit();

      this.push.loading = false;
      this.push.done = true;
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
