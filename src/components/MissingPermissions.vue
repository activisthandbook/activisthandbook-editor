<template>
  <q-page-container>
    <q-page padding style="max-width: 700px; margin: auto">
      <q-card class="text-center bg-accent q-my-md" bordered flat>
        <q-card-section class="q-pa-xl">
          <div>
            <q-icon name="mdi-lock" size="64px" />
          </div>
          <h2 class="q-mt-md q-mb-sm">No access</h2>
          <div>
            You cannot view this page. Ask an administrator to give you access.
          </div>
          <div class="q-mt-md q-gutter-sm">
            <q-btn
              label="Home"
              no-caps
              color="secondary"
              icon="mdi-home"
              :to="{ name: 'Home', params: { tab: 'me' } }"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </q-page-container>
</template>
