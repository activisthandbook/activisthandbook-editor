<template>
  <router-view />
</template>

<script>
import { mapStores } from "pinia";
import { useEditorStore } from "stores/editor";
import { useFirebaseStore } from "stores/firebase";

import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
const db = getFirestore();

const auth = getAuth();

export default {
  name: "EditorLayout",
};
</script>
