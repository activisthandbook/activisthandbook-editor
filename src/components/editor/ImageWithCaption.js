import {
  findChildrenInRange,
  mergeAttributes,
  Node,
  nodeInputRule,
  Tracker,
} from "@tiptap/core";

export default Node.create({
  name: "imageWithCaption",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  content: "inline*",

  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("src"),
      },

      imageID: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("imageID"),
      },

      imageSource: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("imageSource"),
      },

      alt: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("alt"),
      },

      imageCaption: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("img")?.getAttribute("imageCaption"),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      this.options.HTMLAttributes,
      ["img", HTMLAttributes],
      ["figcaption", {}, 0],
    ];
  },

  addCommands() {
    return {
      setImageWithCaption:
        ({ ...attrs }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs,
              content: [
                {
                  type: "text",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: attrs.imageSource,
                      },
                    },
                  ],
                  text: attrs.imageCaption ? attrs.imageCaption : "",
                },
              ],
            })
            .selectNodeForward()
            .run();
        },
    };
  },
});
