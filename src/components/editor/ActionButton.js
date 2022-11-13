import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionButtonComponent from "./ActionButton.vue";

export default Node.create({
  name: "actionButton",

  group: "block",

  // content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-button",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      // "client-only",
      // ["action-custom", mergeAttributes(HTMLAttributes), 0],
      "action-button",
      mergeAttributes(HTMLAttributes),
      // 0,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionButtonComponent);
  },

  addAttributes() {
    return {
      buttonlink: {
        default: null,
        parseHTML: (element) => element.getAttribute("buttonlink"),
      },
      buttonanchor: {
        default: null,
        parseHTML: (element) => element.getAttribute("buttonanchor"),
      },

      buttonlabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("buttonlabel"),
      },
    };
  },

  addCommands() {
    return {
      setActionButton:
        ({ ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              // content: [
              //   {
              //     type: "heading",
              //     attrs: { level: 2 },
              //     content: [
              //       {
              //         type: "text",
              //         text: "Act!",
              //       },
              //     ],
              //   },
              //   {
              //     type: "paragraph",
              //     content: [
              //       {
              //         type: "text",
              //         text: "Write something here..",
              //       },
              //     ],
              //   },
              // ],

              attrs,
            })
            .run();
        },
    };
  },
});
