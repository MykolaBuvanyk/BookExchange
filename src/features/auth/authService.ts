import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { DEFAULT_USER_ROLE } from "@/constants";
import { auth, db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import { routes } from "@/lib/routes";

type RegisterUserParams = {
  name: string;
  email: string;
  password: string;
};

type LoginUserParams = {
  email: string;
  password: string;
};

export async function registerUser({
  name,
  email,
  password,
}: RegisterUserParams) {
  const credentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  await updateProfile(credentials.user, {
    displayName: name,
  });

  await setDoc(doc(db, collections.users, credentials.user.uid), {
    id: credentials.user.uid,
    name,
    email,
    role: DEFAULT_USER_ROLE,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credentials.user;
}

export async function loginUser({ email, password }: LoginUserParams) {
  const credentials = await signInWithEmailAndPassword(auth, email, password);

  return credentials.user;
}

export async function sendPasswordReset(email: string) {
  const resetUrl = `${window.location.origin}${routes.login}`;

  await sendPasswordResetEmail(auth, email, {
    handleCodeInApp: false,
    url: resetUrl,
  });
}

export async function logoutUser() {
  await signOut(auth);
}
