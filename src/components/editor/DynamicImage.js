import {
  findChildrenInRange,
  mergeAttributes,
  Node,
  nodeInputRule,
  Tracker,
} from "@tiptap/core";

import { VueNodeViewRenderer } from "@tiptap/vue-3";

import DynamicImage from "./DynamicImage.vue";

export default Node.create({
  name: "imageWithCaption",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  content: "block+",
  atom: true,

  draggable: true,

  addAttributes() {
    return {
      imageid: {
        default: null,
        parseHTML: (element) => element.getAttribute("imageid"),
      },

      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
      },

      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "dynamic-image",
      },
    ];
  },

  // renderHTML({ HTMLAttributes }) {
  //   return [
  //     "figure",
  //     this.options.HTMLAttributes,
  //     ["img", HTMLAttributes],
  //     ["figcaption", {}, 0],
  //   ];
  // },
  renderHTML({ HTMLAttributes }) {
    return ["dynamic-image", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(DynamicImage);
  },

  addCommands() {
    return {
      setImageWithCaption:
        ({ ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              content: attrs.content,

              attrs,
            })
            .selectNodeForward()
            .run();
        },
    };
  },
});
