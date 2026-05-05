import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { Suspense, useEffect } from "react";
import { LoadingProvider } from "./contexts/loading.context";
import { AuthProvider } from "contexts/auth.context";
import { Spin } from "antd";

function App() {
  useEffect(() => {
    const reloadOnce = () => {
      const key = "__chunk_reload_ts__";
      const last = Number(sessionStorage.getItem(key) || "0");
      if (Date.now() - last < 10000) return;
      sessionStorage.setItem(key, String(Date.now()));
      window.location.reload();
    };

    const isChunkLoadFailure = (message) => {
      const msg = (message || "").toLowerCase();
      return (
        msg.includes("loading chunk") ||
        msg.includes("chunkloaderror") ||
        msg.includes("failed to fetch dynamically imported module") ||
        msg.includes("importing a module script failed")
      );
    };

    const onError = (event) => {
      const message =
        event?.message ||
        event?.error?.message ||
        (typeof event?.error === "string" ? event.error : "");
      if (isChunkLoadFailure(message)) reloadOnce();
    };

    const onUnhandledRejection = (event) => {
      const reason = event?.reason;
      const message = reason?.message || (typeof reason === "string" ? reason : "");
      if (isChunkLoadFailure(message)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin size="large" />
          </div>
        }
      >
        <AuthProvider>
          <LoadingProvider>
            <Router />
          </LoadingProvider>
        </AuthProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
