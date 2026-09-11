import { useState, useCallback, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthState {
  type: "none" | "customer" | "admin";
  user?: AuthUser;
}

// ── Map Supabase User → AuthUser (sync, no async) ─────
function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email!.split("@")[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

const ADMIN_EMAILS = ["admin@henryatelier.com.br", "admin@ascendia.com.br", "admin@grfconstrucao.com"];

function isAdminUser(user: User): boolean {
  return user.user_metadata?.role === "admin" ||
    ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ type: "none" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return () => { mounted = false; };
    }

    // Safety #1: Check existing session (page refresh / SSR hydration)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = mapSupabaseUser(session.user);
        const isAdmin = isAdminUser(session.user);
        setAuthState({ type: isAdmin ? "admin" : "customer", user: authUser });
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Safety #2: Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          const authUser = mapSupabaseUser(session.user);
          const isAdmin = isAdminUser(session.user);
          setAuthState({ type: isAdmin ? "admin" : "customer", user: authUser });
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setAuthState({ type: "none" });
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const authUser = mapSupabaseUser(session.user);
          const isAdmin = isAdminUser(session.user);
          setAuthState({ type: isAdmin ? "admin" : "customer", user: authUser });
        } else if (event === "USER_UPDATED" && session?.user) {
          const authUser = mapSupabaseUser(session.user);
          const isAdmin = isAdminUser(session.user);
          setAuthState({ type: isAdmin ? "admin" : "customer", user: authUser });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser = mapSupabaseUser(session.user);
        const isAdmin = isAdminUser(session.user);
        setAuthState({ type: isAdmin ? "admin" : "customer", user: authUser });
      } else {
        setAuthState({ type: "none" });
      }
    }).catch(() => setAuthState({ type: "none" }));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({ type: "none" });
  }, []);

  const isAdmin = authState.type === "admin";
  const isCustomer = authState.type === "customer";
  const isLoggedIn = authState.type !== "none";

  return { authState, isAdmin, isCustomer, isLoggedIn, loading, refresh, logout };
}
