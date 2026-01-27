import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./appStore/store";
import App from "./App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { PreferencesProvider } from "./application/context/PreferencesContext";
const queryClient = new QueryClient();

// Service Worker logic removed as Firebase is removed.

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PreferencesProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />
          <App />
        </BrowserRouter>
      </PreferencesProvider>
    </Provider>
  </QueryClientProvider>
  // </React.StrictMode>
);



