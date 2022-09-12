<template>
  <q-card class="fixed-center bg-accent" flat bordered>
    <q-card-section>
      <div class="q-gutter-y-sm">
        <h1 class="q-my-sm">Activist Handbook</h1>
        <h2>Editor</h2>
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
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
});
</script>
