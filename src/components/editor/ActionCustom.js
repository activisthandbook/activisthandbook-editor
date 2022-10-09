import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionCustomComponent from "./ActionCustom.vue";

export default Node.create({
  name: "actionCustom",

  group: "block",

  content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-custom",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["action-custom", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionCustomComponent);
  },

  addCommands() {
    return {
      setActionCustom:
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
                      text: "Act!",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Write something here..",
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
