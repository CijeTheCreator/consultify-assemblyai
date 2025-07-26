import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  user_metadata: {
    language?: string
    role?: "doctor" | "patient"
    name?: string
    specialization?: string
    onboarding_completed?: boolean
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user as AuthUser | null
}

export const updateUserMetadata = async (metadata: Record<string, any>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  })
  return { data, error }
}

// Helper function to get user display info from Supabase Auth
export const getUserDisplayInfo = (user: AuthUser) => {
  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || "",
    role: user.user_metadata?.role || "patient",
    language: user.user_metadata?.language || "en",
    specialization: user.user_metadata?.specialization,
    onboarding_completed: user.user_metadata?.onboarding_completed || false,
    created_at: user.created_at,
  }
}
