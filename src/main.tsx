import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { setPlayerAdminStatus } from "./lib/db";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_UID = "wM0WvvBqPIhB0YkK49bvEYB4rBv1";

onAuthStateChanged(auth, async (user) => {
  if (user && user.uid === ADMIN_UID) {
    try {
      console.log("Setting admin status for logged-in user:", ADMIN_UID);
      const result = await setPlayerAdminStatus(ADMIN_UID, true);
      console.log("Admin status set result:", result);
      if (!result) {
        console.error("Failed to set admin status for:", ADMIN_UID);
      }
    } catch (error) {
      console.error("Error setting admin status:", error);
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
