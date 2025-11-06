"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { getPlayerByUid, createPlayer, runAutoclaimingForAllUsers } from "@/lib/db";
import { CustomUser } from "@/types/database";
import type { User } from "firebase/auth";
import { logError } from "@/lib/errorUtils";

interface AuthContextType {
  currentUser: CustomUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoclaimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshPlayerData = async (user: User) => {
    try {
      const playerData = await getPlayerByUid(user.uid);
      if (playerData) {
        const isAdmin = Boolean(playerData.isAdmin);
        setCurrentUser(prev => {
          if (prev && prev.uid === user.uid && prev.isAdmin === isAdmin) {
            return prev;
          }
          return {
            ...user,
            isAdmin: isAdmin,
            displayName: playerData.displayName || user.displayName || "",
            email: playerData.email || user.email || "",
          };
        });
      }
    } catch (error) {
      logError(error, "AuthProvider.refreshPlayerData");
      // Silent fail - continue with existing user data
    }
  };

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (autoclaimIntervalRef.current) {
        clearInterval(autoclaimIntervalRef.current);
        autoclaimIntervalRef.current = null;
      }

      if (user) {
        const customUser: CustomUser = {
          ...user,
          isAdmin: false,
          displayName: user.displayName,
          email: user.email,
        };
        setCurrentUser(customUser);
        setLoading(false);
        
        // Fetch player data asynchronously without blocking
        (async () => {
          try {
            const playerData = await getPlayerByUid(user.uid);
            if (playerData) {
              const isAdmin = Boolean(playerData.isAdmin);
              
              setCurrentUser(prev => {
                if (!prev || prev.uid !== user.uid) return prev;
                return {
                  ...user,
                  isAdmin: isAdmin,
                  displayName: playerData.displayName || user.displayName || "",
                  email: playerData.email || user.email || "",
                };
              });
            } else {
              const today = new Date().toISOString().split('T')[0];
              
              // Check localStorage for display name and SRC username (set during signup)
              const storedDisplayName = localStorage.getItem(`displayName_${user.uid}`);
              const storedSRCUsername = localStorage.getItem(`srcUsername_${user.uid}`);
              
              // Use stored display name if available, otherwise fall back to Firebase Auth or email
              const finalDisplayName = storedDisplayName || user.displayName || user.email?.split('@')[0] || "Player";
              const srcUsername = storedSRCUsername || "";
              
              // Clear localStorage after reading
              if (storedDisplayName) {
                localStorage.removeItem(`displayName_${user.uid}`);
              }
              if (storedSRCUsername) {
                localStorage.removeItem(`srcUsername_${user.uid}`);
              }
              
              const newPlayer = {
                uid: user.uid,
                displayName: finalDisplayName,
                email: user.email || "",
                joinDate: today,
                totalRuns: 0,
                bestRank: null,
                favoriteCategory: null,
                favoritePlatform: null,
                nameColor: "#cba6f7",
                isAdmin: false,
                srcUsername: srcUsername || undefined,
              };
              createPlayer(newPlayer).catch(() => {});
            }
          } catch (error) {
            logError(error, "AuthProvider.onAuthStateChanged");
            // Silent fail - user is already logged in
          }
          
          // Start refresh interval after initial data fetch
          // Only refresh every 5 minutes - player data doesn't change frequently
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
          }
          refreshIntervalRef.current = setInterval(() => {
            refreshPlayerData(user);
          }, 300000); // 5 minutes instead of 3 seconds
          
          // Run autoclaiming for all users periodically (every 10 minutes)
          // This ensures all users with SRC usernames get their runs claimed
          // Only run if user is authenticated (to avoid running for anonymous users)
          if (user) {
            // Run once after a short delay on login
            setTimeout(() => {
              runAutoclaimingForAllUsers().catch(error => {
                logError(error, "AuthProvider.autoclaiming");
              });
            }, 30000); // Wait 30 seconds after login to avoid blocking initial load
            
            // Then run every 10 minutes
            autoclaimIntervalRef.current = setInterval(() => {
              runAutoclaimingForAllUsers().catch(error => {
                logError(error, "AuthProvider.autoclaiming");
              });
            }, 600000); // 10 minutes
          }
        })();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (autoclaimIntervalRef.current) {
        clearInterval(autoclaimIntervalRef.current);
      }
    };
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};