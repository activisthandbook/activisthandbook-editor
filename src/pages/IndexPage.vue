<template>
  <q-layout view="hhh lpR fFf">
    <q-page-container>
      <q-page padding style="max-width: 720px; margin: auto">
        <div class="q-gutter-y-md q-mt-md q-mb-xl">
          <q-card class="bg-accent text-center" flat>
            <q-card-section>
              <div class="q-gutter-y-sm q-py-lg">
                <q-avatar size="96px">
                  <img src="~/assets/logo.svg" />
                </q-avatar>
                <h1 class="q-my-sm">Activist Handbook</h1>
                <div class="q-gutter-sm">
                  <q-btn
                    label="New article"
                    no-caps
                    color="secondary"
                    icon="mdi-plus"
                    :to="{ name: 'New' }"
                  />
                  <q-btn
                    label="Moderate"
                    icon="mdi-shield-star"
                    no-caps
                    color="secondary"
                    :to="{ name: 'Moderate' }"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-card class="bg-accent">
            <ArticleList />
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import ArticleList from "components/ArticleList.vue";

export default {
  name: "IndexPage",
  components: { ArticleList },
};
</script>
