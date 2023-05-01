<template>
  <q-card class="bg-secondary text-accent text-center q-py-md" flat>
    <q-card-section>
      <div>
        <q-icon name="mdi-earth" size="64px" />
        <q-spinner-rings
          size="64px"
          class="q-mr-sm"
          style="margin-left: -40px"
          color="accent"
        />
      </div>
      <div class="q-mt-sm q-gutter-y-sm">
        <div class="text-h2">Updating website...</div>
        <div>
          Sending the update to servers in 100+ countries. This may take a few
          minutes.
        </div>
        <q-btn
          class="q-mt-md"
          label="View changes"
          href="https://github.com/activisthandbook/activisthandbook/commits/main"
          target="_blank"
          no-caps
          outline
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
export default {
  data: function () {
    return {
      remainingSeconds: 180,
    };
  },
  created() {
    const renderingTime = this.remainingSeconds * 1000;

    const timer = setInterval(() => {
      this.remainingSeconds = this.remainingSeconds - 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
    }, renderingTime);
  },
};
</script>
