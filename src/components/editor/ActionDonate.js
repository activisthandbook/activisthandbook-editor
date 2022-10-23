import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionDonateComponent from "./ActionDonate.vue";

export default Node.create({
  name: "actionDonate",

  group: "block",

  content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-donate",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "client-only",
      ["action-donate", mergeAttributes(HTMLAttributes), 0],
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionDonateComponent);
  },

  addCommands() {
    return {
      setActionDonate:
        ({ ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [
                    {
                      type: "text",
                      text: "Donate",
                    },
                  ],
                },
              ],

              attrs,
            })
            .run();
        },
    };
  },
});
