"use client";

import { useEffect } from "react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("SW registered: ", registration);
          },
          function (err) {
            console.log("SW registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return <>{children}</>;
}
