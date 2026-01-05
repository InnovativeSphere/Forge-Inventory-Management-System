import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../redux/store/store";

import "../app/global.css";
import Sidebar from "@/components/Sidebar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <div className="flex h-screen bg-[var(--color-background)]">
        {/* Sidebar */}
        
          {/* The sidebar now wraps the main content */}
          <Sidebar children={undefined} /> 
          <main className="flex-1 transition-all duration-300 p-4 sm:p-6 overflow-auto max-w-full mx-auto">
            <Component {...pageProps} />
          </main>
   
      </div>
    </Provider>
  );
}
