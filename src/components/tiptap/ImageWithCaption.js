import {
  findChildrenInRange,
  mergeAttributes,
  Node,
  nodeInputRule,
  Tracker,
} from "@tiptap/core";

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const ImageWithCaption = Node.create({
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

  // isolating: true,

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
      [
        "img",
        HTMLAttributes,
        // mergeAttributes(HTMLAttributes, {
        //   // draggable: false,
        //   // contenteditable: false,
        //   // selectable: true,
        // }),
      ],
      [
        "figcaption",
        {
          // draggable: false,
          // contenteditable: false,
          // selectable: true,
        },
        0,
      ],
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

      //   imageToFigure:
      //     () =>
      //     ({ tr, commands }) => {
      //       const { doc, selection } = tr;
      //       const { from, to } = selection;
      //       const images = findChildrenInRange(
      //         doc,
      //         { from, to },
      //         (node) => node.type.name === "image"
      //       );

      //       if (!images.length) {
      //         return false;
      //       }

      //       const tracker = new Tracker(tr);

      //       return commands.forEach(images, ({ node, pos }) => {
      //         const mapResult = tracker.map(pos);

      //         if (mapResult.deleted) {
      //           return false;
      //         }

      //         const range = {
      //           from: mapResult.position,
      //           to: mapResult.position + node.nodeSize,
      //         };

      //         return commands.insertContentAt(range, {
      //           type: this.name,
      //           attrs: {
      //             src: node.attrs.src,
      //           },
      //         });
      //       });
      //     },

      //   figureToImage:
      //     () =>
      //     ({ tr, commands }) => {
      //       const { doc, selection } = tr;
      //       const { from, to } = selection;
      //       const figures = findChildrenInRange(
      //         doc,
      //         { from, to },
      //         (node) => node.type.name === this.name
      //       );

      //       if (!figures.length) {
      //         return false;
      //       }

      //       const tracker = new Tracker(tr);

      //       return commands.forEach(figures, ({ node, pos }) => {
      //         const mapResult = tracker.map(pos);

      //         if (mapResult.deleted) {
      //           return false;
      //         }

      //         const range = {
      //           from: mapResult.position,
      //           to: mapResult.position + node.nodeSize,
      //         };

      //         return commands.insertContentAt(range, {
      //           type: "image",
      //           attrs: {
      //             src: node.attrs.src,
      //           },
      //         });
      //       });
      //     },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, src, alt, imageID, imageSource, imageCaption] = match;

          return { src, alt, imageID, imageSource, imageCaption };
        },
      }),
    ];
  },
});
