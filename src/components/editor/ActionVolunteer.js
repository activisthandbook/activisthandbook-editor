import { mergeAttributes, Node } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ActionVolunteerComponent from "./ActionVolunteer.vue";

export default Node.create({
  name: "actionVolunteer",

  group: "block",

  content: "block+",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "action-volunteer",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      // "client-only",
      // ["action-volunteer", mergeAttributes(HTMLAttributes), 0],
      "action-volunteer",
      mergeAttributes(HTMLAttributes),
      0,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(ActionVolunteerComponent);
  },

  addCommands() {
    return {
      setActionVolunteer:
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
