<template>
  <q-card class="bg-secondary text-accent">
    <q-card-section>
      <div class="flex items-center q-gutter-md">
        <q-spinner size="24px" style="opacity: 0.5" class="q-mr-sm" />
        <div class="q-ml-sm text-bold">
          <div>
            Updating website... ({{ this.remainingSeconds }} seconds left)
          </div>
          <div class="text-caption">
            Sending the update to servers in 100+ countries
          </div>
        </div>
        <q-space />
        <q-btn
          label="View changes"
          href="https://github.com/activisthandbook/activisthandbook/commits/main"
          target="_blank"
          no-caps
          flat
        />
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
export default {
  data: function () {
    return {
      remainingSeconds: 62,
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
