import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const useVisitorId = (): string => {
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    // Use sessionStorage instead of localStorage so each tab/window gets unique ID
    let stored = sessionStorage.getItem("visitorId");

    // If not in session, check if there's a persistent one in localStorage
    // and create a new session-specific one based on it
    if (!stored) {
      const persistentId = localStorage.getItem("visitorId");
      if (persistentId) {
        // Create a session-specific variant
        stored = `${persistentId}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      } else {
        // First time ever - create base persistent ID
        const baseId = uuidv4();
        localStorage.setItem("visitorId", baseId);
        stored = `${baseId}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }
      sessionStorage.setItem("visitorId", stored);
    }

    setVisitorId(stored);
    console.log("Current session visitorId:", stored);
  }, []);

  return visitorId;
};
