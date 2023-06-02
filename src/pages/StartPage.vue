<template>
  <div class="q-pa-md">
    <div class="text-center text-h5" style="padding: 3vh 0 3vh 0">
      Activist<br />Handbook
    </div>
    <div
      class="justify-center q-gutter-y-md q-pb-xl"
      style="max-width: 512px; margin: auto"
    >
      <q-card class="bg-accent full-width">
        <q-card-section v-if="step === 1" class="q-gutter-y-md">
          <h2>Almost there...</h2>
          <div>
            <strong>Enter a name for your <u>public</u> profile.</strong>
            Feel free to use a nickname if you would like to stay anonymous.
          </div>
          <q-input
            outlined
            color="secondary"
            label="First name"
            autocomplete="fname"
            type="text"
            placeholder="Greta"
            required
            v-model="
              usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                .firstName
            "
            :rules="[(val) => !!val || 'Add your name']"
            @keyup.enter="createProfile()"
          >
            <template #prepend>
              <q-icon name="mdi-account" />
            </template>
          </q-input>

          <q-btn
            label="Continue"
            no-caps
            color="secondary"
            class="full-width"
            icon-right="mdi-arrow-right-circle"
            padding="8px"
            @click="createProfile()"
            :disable="
              !usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                .firstName
            "
            :loading="loading"
          />
        </q-card-section>

        <div v-if="step === 2" class="rounded-borders overflow-hidden">
          <q-img
            src="/our-team.webp"
            srcset="
              /our-team.webp 1x,
             /our-team-2x.webp 2x,
            "
            alt="Three volunteers of Activist Handbook sitting on a couch"
            title="Our team"
            :ratio="16 / 9"
            no-spinner
            no-transition
          />
          <q-card-section class="q-gutter-y-md">
            <div>
              <div class="q-mb-md">
                <strong
                  >Welcome,
                  {{
                    usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                      .firstName
                  }}!</strong
                >
                We've got some suggestions to help you get started:
              </div>

              <q-list bordered class="rounded-borders">
                <q-item-label header>Recommendations ✨</q-item-label>
                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="subscribe.writersGuide"
                      color="secondary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >Email me a guide for new writers 📖</q-item-label
                    >
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="subscribe.newsletter"
                      color="secondary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >Subscribe me to the newsletter ✉️</q-item-label
                    >
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="subscribe.volunteer"
                      color="secondary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >I'd like to become a volunteer! ❤️</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div v-if="subscribe.volunteer">
              <div class="text-bold q-mb-md">
                How can we reach you? One of our volunteers will send you a
                message to say hi 👋
              </div>
              <q-input
                outlined
                color="secondary"
                label="Phone (international format)"
                autocomplete="tel"
                type="tel"
                placeholder="+XX 1234567890"
                required
                v-model="phone"
                :rules="[(val) => !!val || 'Add a phone number']"
                hint="We'll reach out to you so we can get to know each other"
              >
                <template #prepend>
                  <q-icon name="mdi-phone" />
                </template>
              </q-input>
            </div>

            <q-btn
              label="Start editing"
              no-caps
              color="secondary"
              class="full-width"
              icon-right="mdi-arrow-right-circle"
              padding="8px"
              @click="subscribeActionNetwork()"
              :disable="
                !usersStore.profile.data[firebaseStore.auth.currentUser.uid]
                  .firstName ||
                (subscribe.volunteer && !phone)
              "
              :loading="loading"
            />
          </q-card-section>
        </div>
      </q-card>
      <div class="text-bold row items-center justify-center q-mt-xl">
        <q-icon name="mdi-heart" class="q-mr-sm" /> We train 6000 activists
        every month
      </div>
    </div>
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useUsersStore } from "src/stores/users";
import { useFirebaseStore } from "src/stores/firebase";
export default {
  computed: {
    ...mapStores(useUsersStore, useFirebaseStore),
  },
  data: function () {
    return {
      step: 1,
      loading: false,
      phone: null,
      subscribe: {
        writersGuide: false,
        newsletter: false,
        volunteer: false,
      },
    };
  },
  created() {
    if (
      this.usersStore.profile.data[this.firebaseStore.auth.currentUser.uid]
        .firstName
    ) {
      this.next();
    }
  },
  methods: {
    async submit() {
      try {
        await this.subscribeActionNetwork();
        await this.saveProfile();
      } catch (error) {
        console.log(error);
        return;
      }
      console.log("next");
    },
    async createProfile() {
      if (
        this.usersStore.profile.data[this.firebaseStore.auth.currentUser.uid]
          .firstName
      ) {
        this.loading = true;
        await this.usersStore.createUser(
          this.firebaseStore.auth.currentUser.uid,
          this.firebaseStore.auth.currentUser.uid
        );
        this.loading = false;
        this.$q.notify({
          message: "Created public profile",
          icon: "mdi-check",
          timeout: 2000,
        });
        this.step = 2;
      }
    },
    async subscribeActionNetwork() {
      if (
        this.subscribe.writersGuide ||
        this.subscribe.newsletter ||
        this.subscribe.volunteer
      ) {
        this.loading = true;
        let tags = ["signed-up-via-editor"];

        if (this.subscribe.writersGuide) tags.push("guide-writers");
        if (this.subscribe.newsletter) tags.push("newsletter");
        if (this.subscribe.volunteer) tags.push("interested-in-volunteering");

        console.log(this.phone);

        const profile =
          this.usersStore.profile.data[this.firebaseStore.auth.currentUser.uid];

        // TO-DO: change url
        await fetch("https://activisthandbook.org/api/subscribe", {
          method: "POST",
          body: JSON.stringify({
            firstName: profile.firstName,
            email: this.firebaseStore.auth.currentUser.email,
            phone: this.phone,
            tags: tags,
          }),
        })
          .then((response) => response.json())
          .then(async (data) => {
            this.loading = false;
            this.$q.notify({
              message: "Signed up succesfully",
              icon: "mdi-check",
            });
            this.next();
          })
          .catch((error) => {
            console.error(error);
            this.$q.notify({
              message: "Could create email subscription",
              icon: "mdi-alert",
            });
          });
      } else {
        this.next();
      }
    },
    next() {
      if (this.$route.query.next) {
        this.$router.push(this.$route.query.next);
      } else this.$router.push({ name: "Home", params: { homeTab: "me" } });
    },
  },
};
</script>
