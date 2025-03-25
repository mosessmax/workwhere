import { createAuthClient } from "better-auth/react";
import { useEffect, useState } from "react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // fetch session on mount
    const getSession = async () => {
      try {
        const currentSession = await authClient.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    const intervalId = setInterval(async () => {
      const currentSession = await authClient.getSession();
      
      if (JSON.stringify(currentSession) !== JSON.stringify(session)) {
        setSession(currentSession);
      }
    }, 60000); 

    return () => clearInterval(intervalId);
  }, []);
  
  return {
    session,
    loading,
    isAuthenticated: !!session,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp,
  };
}