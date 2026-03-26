import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Router from "./routes";
import { Suspense } from "react";
import { LoadingProvider } from "./contexts/loading.context";
import { AuthProvider } from "contexts/auth.context";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
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
