import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { setPlayerAdminStatus } from "./lib/db";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

onAuthStateChanged(auth, async (user) => {
  if (user && ADMIN_UID && user.uid === ADMIN_UID) {
    try {
      const result = await setPlayerAdminStatus(ADMIN_UID, true);
      if (!result) {
        console.error("Failed to set admin status");
      }
    } catch (error) {
      console.error("Error setting admin status:", error);
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
