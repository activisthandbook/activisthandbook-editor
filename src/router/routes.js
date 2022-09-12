const routes = [
  {
    path: "/",
    component: () => import("src/layouts/EditLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        name: "Home",
      },
      {
        path: "new",
        component: () => import("src/dialogs/NewPage.vue"),
        name: "New",
      },
      {
        path: "article/:articleID",
        component: () => import("pages/EditPage.vue"),
        name: "Edit",
      },
      {
        path: "menu",
        component: () => import("pages/MenuPage.vue"),
        name: "Menu",
      },
      {
        path: "translate/:languageCollectionID",
        component: () => import("src/dialogs/TranslatePage.vue"),
        name: "Translate",
      },
    ],
  },
  {
    path: "/moderate",
    component: () => import("layouts/ModerationLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ModerationPage.vue"),
        name: "Moderate",
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
    name: "404",
  },
];

export default routes;
