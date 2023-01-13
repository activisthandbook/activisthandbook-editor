import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionSignupComponent from "./ActionSignup.vue";

export default Node.create({
  name: "actionSignup",

  group: "block",

  content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-signup",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      // "client-only",
      // ["action-signup", mergeAttributes(HTMLAttributes), 0],
      "action-signup",
      mergeAttributes(HTMLAttributes),
      0,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionSignupComponent);
  },

  addAttributes() {
    return {
      tags: {
        default: null,
        parseHTML: (element) => element.getAttribute("tags")?.split(","),
      },
      redirect: {
        default: null,
        parseHTML: (element) => element.getAttribute("redirect"),
      },
      buttonlabel: {
        default: null,
        parseHTML: (element) => element.getAttribute("buttonlabel"),
      },
    };
  },

  addCommands() {
    return {
      setActionSignup:
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
                      text: "Join our team",
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
