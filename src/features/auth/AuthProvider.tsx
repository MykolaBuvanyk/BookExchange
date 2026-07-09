"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_USER_ROLE } from "@/constants";
import { auth, db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import type { UserProfile } from "@/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function createFallbackProfile(user: User): UserProfile {
  const now = new Date() as unknown as UserProfile["createdAt"];

  return {
    id: user.uid,
    name: user.displayName || user.email || "Reader",
    email: user.email || "",
    avatarUrl: user.photoURL || undefined,
    role: DEFAULT_USER_ROLE,
    createdAt: now,
    updatedAt: now,
  };
}

async function getUserProfile(user: User) {
  const profileSnapshot = await getDoc(doc(db, collections.users, user.uid));

  if (!profileSnapshot.exists()) {
    return createFallbackProfile(user);
  }

  return profileSnapshot.data() as UserProfile;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const currentProfile = await getUserProfile(user);
      setProfile(currentProfile);
    } catch {
      setProfile(createFallbackProfile(user));
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentProfile = await getUserProfile(currentUser);
        setProfile(currentProfile);
      } catch {
        setProfile(createFallbackProfile(currentUser));
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshProfile,
    }),
    [isLoading, profile, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
