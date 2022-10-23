const routes = [
  {
    path: "/",
    component: () => import("src/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        name: "Home",
      },
      {
        path: "start",
        component: () => import("pages/StartPage.vue"),
        name: "Start",
      },
      {
        path: "signout",
        component: () => import("pages/SignoutPage.vue"),
        name: "Signout",
      },
      {
        path: "browse",
        component: () => import("pages/BrowsePage.vue"),
        name: "Browse",
      },
      {
        path: "new",
        component: () => import("src/dialogs/NewPage.vue"),
        name: "New",
        meta: {
          title: "New article | Activist Handbook",
        },
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
        meta: {
          title: "Edit menu | Activist Handbook",
        },
      },
      {
        path: "translate/:languageCollectionID",
        component: () => import("src/dialogs/TranslatePage.vue"),
        name: "Translate article",
        meta: {
          title: "Translate | Activist Handbook",
        },
      },
      {
        path: "account",
        component: () => import("src/pages/AccountPage.vue"),
        name: "Account",
        meta: {
          title: "Account | Activist Handbook",
        },
      },
      {
        path: "author/:authorID",
        component: () => import("src/pages/AuthorPage.vue"),
        name: "Author",
        meta: {
          title: "Author | Activist Handbook",
        },
      },
      {
        path: "authors/",
        component: () => import("src/pages/AuthorsPage.vue"),
        name: "Authors",
        meta: {
          title: "Authors | Activist Handbook",
        },
      },
      {
        path: "import",
        component: () => import("pages/ImportPage.vue"),
        name: "Import",
      },
      {
        path: "/review",
        component: () => import("pages/ReviewPage.vue"),
        name: "Review",
        meta: {
          title: "Review | Activist Handbook",
        },
      },
      {
        path: "/translate",
        component: () => import("pages/TranslatePage.vue"),
        name: "Translate",
        meta: {
          title: "Translate | Activist Handbook",
        },
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
