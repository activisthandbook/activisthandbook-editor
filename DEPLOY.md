# Deploy the Activist Handbook editor

To use the Activist Handbook editor in production, you need to do two things:

1. Setup hosting using Cloudflare Pages
2. Setup a Firebase environment as backend

## Host the editor using Cloudflare pages

### Build & deployment settings

Production branch: main
Preview branches: dev
Build command: quasar build
Build output directory: dist/spa

### Environment variables

NODE_VERSION: 14

## Set up Firebase environment

### 1. Create Firebase project

Create a [new Firebase project](https://console.firebase.google.com/). Set a project ID, for example: `activist-handbook`

Note: In the links below, change the project ID to whatever you are using.

### 2. Enable Firestore database

https://console.firebase.google.com/project/activist-handbook/firestore/

### 3. Enable passwordless authentication

https://console.firebase.google.com/project/activist-handbook/authentication/providers

### 3. Set up App Check

https://console.firebase.google.com/project/activist-handbook/appcheck

### 4. Login to Firebase CLI

```
firebase cli
```

### 5. Set Firebase project

```
firebase use activist-handbook
```

To find out the name of your project, run: `firebase projects:list`

### 6. Initialise Firebase

Run:

```
firebase init
```

Select Firestore, use the defauls for the Firestore Rules (firestore.rules) and Firestore Indexes (firestore.indexes.json). Do not overwrite either.

### 7. Install functions dependencies

In the `firebaseFunctions` directory, run:

```
npm install
```

### 8. Set secrets

Save your secrets: https://firebase.google.com/docs/functions/config-env#secret-manager

```
firebase functions:secrets:set SECRET_NAME
```

- OPENAI_SECRET
- [GITHUB_API](https://github.com/settings/tokens)
- [CLOUDFLARE_IMAGES_API_TOKEN](https://developers.cloudflare.com/images/cloudflare-images/serve-images/serve-private-images-using-signed-url-tokens/)
- CLOUDFLARE_IMAGES_ACCOUNT_ID
- [ALGOLIA_API_KEY1/2/3](https://www.algolia.com/account/api-keys/restricted) - one per extension
- ALGOLIA_APP_ID1/2/3

### 9. Enable Google Cloud APIs

- Cloud Vision API

### 8. Deploy security rules, indexes, extensions, functions

```
firebase deploy
```
