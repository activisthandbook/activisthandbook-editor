<template>
  <p>1) Fetch articles</p>
  <q-btn label="Fetch" @click="fetchArticles()" />
  <p>2) Render articles</p>
  <q-btn label="Render" @click="renderArticles()" />
  <p>3) Push articles</p>
  <q-btn label="Push" @click="pushArticles()" />
</template>
<script>
import axios from "axios";

export default {
  methods: {
    fetchArticles() {
      axios({
        url: "https://activisthandbook.org/graphql",
        method: "post",
        data: {
          query: `
            {
              pages {
                list (orderBy: TITLE) {
                  id
                }
              }
            }
          `,
        },
      }).then((result) => {
        console.log(result.data);
      });
    },
    renderArticles() {},
    pushArticles() {},
  },
};
</script>
