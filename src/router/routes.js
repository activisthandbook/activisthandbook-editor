const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "edit",
        component: () => import("pages/EditPage.vue"),
        name: "Edit",
      },
    ],
  },
  {
    path: "/moderate",
    component: () => import("layouts/ModerationLayout.vue"),
    children: [
      { path: "", component: () => import("pages/ModerationPage.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
