import { updateEmail, updateProfile, type User } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import type { UpdateUserProfileInput } from "@/types";

type UpdateCurrentUserProfileParams = {
  authUser: User;
  profile: Required<Pick<UpdateUserProfileInput, "name" | "email">> &
    Pick<UpdateUserProfileInput, "avatarUrl">;
};

export async function updateCurrentUserProfile({
  authUser,
  profile,
}: UpdateCurrentUserProfileParams) {
  const nextName = profile.name.trim();
  const nextEmail = profile.email.trim();
  const nextAvatarUrl = profile.avatarUrl?.trim() || null;

  if (!nextName || !nextEmail) {
    throw new Error("Name and email are required.");
  }

  if (authUser.email !== nextEmail) {
    await updateEmail(authUser, nextEmail);
  }

  await updateProfile(authUser, {
    displayName: nextName,
  });

  await updateDoc(doc(db, collections.users, authUser.uid), {
    avatarUrl: nextAvatarUrl,
    email: nextEmail,
    name: nextName,
    updatedAt: serverTimestamp(),
  });
}
