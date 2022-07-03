import { defineStore } from "pinia";
import * as Y from "yjs";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    provider: null,
    article: null,
    titleRendered: false,
    descriptionRendered: false,
    contentRendered: false,
    title: null,
    description: null,
    content: null,
    syncData: null,
    clientID: null,
  }),

  // getters: {
  //   doubleCount (state) {
  //     return state.counter * 2
  //   }
  // },

  // actions: {
  //   increment () {
  //     this.counter++
  //   }
  // }
});
