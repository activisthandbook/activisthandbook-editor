<template>
  <div class="form">
    <div class="form__label">Title</div>

    <div v-if="title" class="form__item form__item--title">
      <editor-content :editor="title" />
    </div>

    <div class="form__label">Tasks</div>
    <div v-if="tasks" class="form__item form__item--tasks">
      <editor-content :editor="tasks" />
    </div>

    <div class="form__label">Description</div>
    <div v-if="description" class="form__item form__item--description">
      <editor-content :editor="description" />
    </div>
    <div class="form__label">JSON</div>
    <div class="form__item form__item--json">
      <code>{{ json }}</code>
    </div>
  </div>
</template>

<script>
import Bold from "@tiptap/extension-bold";
import Collaboration from "@tiptap/extension-collaboration";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { yDocToProsemirrorJSON } from "y-prosemirror";
import * as Y from "yjs";

const ParagraphDocument = Document.extend({
  content: "paragraph",
});

const TaskListDocument = Document.extend({
  content: "taskList",
});

const CustomTaskItem = TaskItem.extend({
  content: "text*",
});

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      title: null,
      tasks: null,
      description: null,
      ydoc: new Y.Doc(),
    };
  },

  mounted() {
    this.title = new Editor({
      extensions: [
        ParagraphDocument,
        Paragraph,
        Text,
        Collaboration.configure({
          document: this.ydoc,
          field: "title",
        }),
      ],
      content: "<p>No matter what you do, this will be a single paragraph.",
    });

    this.tasks = new Editor({
      extensions: [
        TaskListDocument,
        Paragraph,
        Text,
        TaskList,
        CustomTaskItem,
        Collaboration.configure({
          document: this.ydoc,
          field: "tasks",
        }),
      ],
      content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">And this</li>
          <li data-type="taskItem" data-checked="false">is a task list</li>
          <li data-type="taskItem" data-checked="false">and only a task list.</li>
        </ul>
      `,
    });

    this.description = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Collaboration.configure({
          document: this.ydoc,
          field: "description",
        }),
      ],
      content: `
        <p>
          <strong>Lengthy text</strong>
        </p>
        <p>
          This can be lengthy text.
        </p>
      `,
    });
  },

  computed: {
    json() {
      return {
        title: yDocToProsemirrorJSON(this.ydoc, "title"),
        tasks: yDocToProsemirrorJSON(this.ydoc, "tasks"),
        description: yDocToProsemirrorJSON(this.ydoc, "description"),
      };
    },
  },

  beforeUnmount() {
    this.title.destroy();
    this.tasks.destroy();
    this.description.destroy();
    this.provider.destroy();
  },
};
</script>
