"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as ReduxProvider } from "react-redux";
import { useState } from "react";
import { store } from "@/src/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensuring QueryClient is instantiated once per user session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute tak data cache mein fresh rahega
            refetchOnWindowFocus: false, // Window par waapas aane pe faltu API calls rokne ke liye
            retry: 1, // Agar error aaye toh sirf ek baar retry karega
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* DevTools: Development mode mein queries ko debug karne ke liye */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}