import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { DEFAULT_USER_ROLE } from "@/constants";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import type { UserProfile, UserRole } from "@/types";

export type AdminUserFormValues = {
  name: string;
  email: string;
  role: UserRole;
};

function mapUserDocument(
  document: QueryDocumentSnapshot<DocumentData>,
): UserProfile {
  const data = document.data();

  return {
    id: document.id,
    name: data.name || "",
    email: data.email || "",
    avatarUrl: data.avatarUrl || undefined,
    role: data.role || DEFAULT_USER_ROLE,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function fetchAdminUsers() {
  const snapshot = await getDocs(
    query(collection(db, collections.users), orderBy("name", "asc")),
  );

  return snapshot.docs.map(mapUserDocument);
}

export async function createManagedUserProfile(input: AdminUserFormValues) {
  const userReference = doc(collection(db, collections.users));

  await setDoc(userReference, {
    id: userReference.id,
    name: input.name.trim(),
    email: input.email.trim(),
    avatarUrl: null,
    role: input.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateManagedUserProfile(
  userId: string,
  input: AdminUserFormValues,
) {
  await updateDoc(doc(db, collections.users, userId), {
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteManagedUserProfile(userId: string) {
  await deleteDoc(doc(db, collections.users, userId));
}
