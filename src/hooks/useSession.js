import {useEffect, useState} from "react";
import {getCurrentUser, getRole, isAuthenticated, logout as clearSession} from "../services/authService";

export function useSession() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  return {
    user,
    role: getRole(),
    loading,
    isAuthenticated: Boolean(user),
    logout
  };
}
