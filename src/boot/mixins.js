import { boot } from "quasar/wrappers";
import { Notify } from "quasar";
import { openURL } from "quasar";

import {
  query,
  collection,
  getDocs,
  where,
  limit,
  getFirestore,
} from "firebase/firestore";

import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(calendar);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  calendar: {
    lastDay: "[Yesterday at] H:mm",
    sameDay: "[Today at] H:mm",
    nextDay: "[Tomorrow at] H:mm",
    lastWeek: "[Last] dddd [at] H:mm",
    nextWeek: "dddd [at] H:mm",
    sameElse: "D MMM YYYY, H:mm",
  },
});

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  // something to do
  app.mixin({
    methods: {
      mixin_humanDate(firestoreTimestamp) {
        try {
          if (firestoreTimestamp) {
            return dayjs(firestoreTimestamp.toDate()).calendar();
          } else return "Date unknown";
        } catch {
          return null;
        }
      },

      mixin_openURL: (link) => {
        openURL(link);
      },
      mixin_copyText: (text) => {
        navigator.clipboard.writeText(text);
        Notify.create({
          message: "Copied to clipboard",
          icon: "mdi-check",
          timeout: 1000,
        });
      },
      mixin_randomID: function () {
        var text = "";
        var possible =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

        for (var i = 0; i < 32; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      },
      mixin_scrollToID: function (id) {
        const el = document.getElementById(id);
        el.scrollIntoView({ behavior: "smooth" });
        // const target = getScrollTarget(el);
        // const verticalScrollPosition = getVerticalScrollPosition(target); // returns a Number (pixels)

        // const offset = el.offsetTop;
        // const duration = 600;
        // setVerticalScrollPosition("vertical", offset, duration);

        // console.log(offset, verticalScrollPosition);
      },
      async mixin_validatePath(path, langCode, currentID) {
        const validPathRegex = /^[@a-z0-9\/]+(-[@a-z0-9\/]+)*$/;

        // Empty path
        if (!path) {
          return { error: "Add a path.", duplicates: null };
        }

        if (path === "index") {
          return {
            error: "Editing the homepage is not yet possible.",
            duplicates: null,
          };
        }

        // Invalid path
        else if (
          !validPathRegex.test(path) ||
          path.endsWith("/") ||
          path.startsWith("/") ||
          path.includes("//") ||
          path.includes("--")
        ) {
          return {
            error:
              "Only use lowercase letters, numbers and dashes (-) or slashes (/) in between.",
            duplicates: null,
          };
        } else {
          const db = getFirestore();

          try {
            const articles_draft = await getDocs(
              query(
                collection(db, "articles_draft"),
                where("path", "==", path),
                where("lang.code", "==", langCode),
                where("id", "!=", currentID),
                limit(1)
              )
            );
            const articles_published = await getDocs(
              query(
                collection(db, "articles_published"),
                where("path", "==", path),
                where("lang.code", "==", langCode),
                where("id", "!=", currentID),
                limit(1)
              )
            );

            if (articles_draft.empty && articles_published.empty) {
              // Valid, no document exists yet with this path
              return { error: null, duplicates: null };
            } else {
              // Invalid
              const duplicates = [];
              articles_draft.forEach((doc) => {
                duplicates.push(doc.data());
              });
              articles_published.forEach((doc) => {
                duplicates.push(doc.data());
              });
              return { error: "Path already exists.", duplicates: duplicates };
            }
          } catch (error) {
            this.$q.notify("Validating path failed");
            console.error(error);
            return {
              error: "Something went wrong.",
              duplicates: null,
            };
          }
        }
      },
    },
  });
});
