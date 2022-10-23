import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionSmartComponent from "./ActionSmart.vue";

export default Node.create({
  name: "actionSmart",

  group: "block",
  atom: true,

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-smart-small",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "client-only",
      ["action-smart-small", mergeAttributes(HTMLAttributes)],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionSmartComponent);
  },

  addCommands() {
    return {
      setActionSmart:
        ({ ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,

              attrs,
            })
            .run();
        },
    };
  },
});
