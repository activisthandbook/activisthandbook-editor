import { defineStore } from "pinia";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    editor: null,
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
