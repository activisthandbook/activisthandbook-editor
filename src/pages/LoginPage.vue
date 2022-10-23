<template>
  <div class="q-pa-md">
    <div class="text-center text-h5" style="padding: 3vh 0 3vh 0">
      Activist<br />Handbook
    </div>
    <div class="justify-center q-pb-xl" style="max-width: 512px; margin: auto">
      <q-card class="bg-accent" v-if="$route.query.logout">
        <q-card-section>
          <div class="q-gutter-y-md">
            <h1>You are now signed out</h1>
            <div>We hope to see you soon again.</div>
            <q-btn
              label="Home"
              :to="{
                name: 'Home',
              }"
              color="secondary"
              no-caps
            />
          </div>
        </q-card-section>
      </q-card>
      <div class="q-gutter-y-md" v-else-if="step === 1">
        <q-card class="bg-accent full-width">
          <q-card-section>
            <div class="q-gutter-y-md q-ma-md">
              <h2>Start editing</h2>
              <div>
                <strong>Everyone can edit Activist Handbook.</strong> It's the
                Wikipedia for activists. Just enter your email to start
                contributing.
              </div>
              <q-input
                outlined
                color="secondary"
                label="Email"
                autocomplete="email"
                type="email"
                placeholder="greta@email.com"
                required
                v-model="email"
                @keyup.enter="signin()"
              >
                <template #prepend>
                  <q-icon name="mdi-email" />
                </template>
              </q-input>
              <q-btn
                label="Get started"
                no-caps
                color="secondary"
                class="full-width"
                icon-right="mdi-arrow-right-circle"
                padding="8px"
                @click="signin()"
                :disable="!email"
                :loading="loading"
              />
            </div>
          </q-card-section>
        </q-card>
        <q-card class="bg-accent" flat bordered>
          <q-img
            src="/activist-handbook-hedgehog.webp"
            srcset="
              /activist-handbook-hedgehog.webp    1x,
             /activist-handbook-hedgehog-2x.webp 2x
            "
            alt="A hedgehod reading Activist Handbook"
            title="A hedgehod reading Activist Handbook"
            no-spinner
            no-transition
          />
          <q-card-section>
            <div class="q-gutter-y-sm">
              <div class="text-bold">The Wikipedia for activists</div>
              <div>
                Activist Handbook is written by activists all over the globe.
                With our guides, we train over 4000 change-makers every month.
              </div>
              <div>
                We use an
                <a
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                  target="_blank"
                  >open licence</a
                >, that allows others to reuse all our content for free. Start
                contributing too!
              </div>
            </div>
          </q-card-section>
        </q-card>
        <div class="text-bold row items-center justify-center q-mt-xl">
          <q-icon name="mdi-clock-outline" class="q-mr-sm" /> It only takes 1
          minute to start editing.
        </div>
      </div>
      <div class="q-gutter-y-md" v-else-if="step === 2">
        <q-card class="bg-accent full-width">
          <q-img
            src="/delivering-mail.webp"
            srcset="
              /delivering-mail.webp    1x,
             /delivering-mail-2x.webp 2x
            "
            alt="A painting of a bird delivering mail"
            title="You've got mail!"
            no-spinner
            no-transition
          />
          <q-card-section>
            <div class="q-gutter-y-md q-ma-md">
              <h2>Check your email!</h2>
              <div>
                <strong>We have sent you a sign-in link.</strong> Open the link
                in your email to sign in without a password.
              </div>

              <q-btn
                v-if="
                  email.endsWith('@gmail.com') ||
                  email.endsWith('@activisthandbook.org')
                "
                label="Open Gmail"
                no-caps
                color="secondary"
                class="full-width"
                icon="mdi-gmail"
                padding="8px"
                href="https://mail.google.com/"
                target="_blank"
              />
              <q-btn
                v-if="email.endsWith('@yahoo.com')"
                label="Open Yahoo email"
                no-caps
                color="secondary"
                class="full-width"
                icon="mdi-yahoo"
                padding="8px"
                href="https://mail.yahoo.com/"
                target="_blank"
              />
              <q-btn
                v-if="email.endsWith('@hotmail.com')"
                label="Open Hotmail"
                no-caps
                color="secondary"
                class="full-width"
                icon="mdi-email"
                padding="8px"
                href="https://hotmail.com"
                target="_blank"
              />
              <q-btn
                v-if="email.endsWith('@outlook.com')"
                label="Open Outlook"
                no-caps
                color="secondary"
                class="full-width"
                icon="mdi-microsoft-outlook"
                padding="8px"
                href="https://outlook.com"
                target="_blank"
              />
              <div class="text-caption">
                It might take a few minutes for the email to arrive. Also check
                your spam.
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="bg-accent" flat bordered>
          <q-card-section>
            <div class="q-gutter-y-sm">
              <div class="text-bold">Important security reminders 🔒</div>
              <div>
                As activists, we are at high risk of being hacked! Protect
                yourself and your fellow change-makers:
              </div>
              <ul class="q-gutter-y-sm">
                <li>
                  Never fill in your password after clicking on an email link.
                </li>
                <li>
                  Always check if the website domain is correct. It should end
                  with <strong>activisthandbook.org</strong>.
                </li>
              </ul>
              <q-btn
                label="Read our security guide"
                href="https://activisthandbook.org/en/tools/security"
                target="_blank"
                no-caps
                outline
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="text-caption text-grey text-center q-mt-xl">
        Artwork made by Joppe Hoekstra using OpenAI
      </div>
    </div>
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useFirebaseStore } from "src/stores/firebase";
export default {
  data() {
    return {
      step: 1,
      loading: false,
      email: "",
    };
  },
  computed: {
    ...mapStores(useFirebaseStore),
  },
  methods: {
    async signin() {
      this.loading = true;
      await this.firebaseStore.sendVerificationEmail(this.email);
      this.loading = false;
      this.step = 2;
    },
  },
};
</script>
