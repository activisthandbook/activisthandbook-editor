import { boot } from "quasar/wrappers";
import { Notify } from "quasar";
import { openURL } from "quasar";

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
        if (firestoreTimestamp) {
          return dayjs(firestoreTimestamp.toDate()).calendar();
        } else return "Date unknown";
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

        for (var i = 0; i < 20; i++)
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
    },
  });
});
