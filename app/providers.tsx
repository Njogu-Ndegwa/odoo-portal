"use client";

import { ApolloProvider } from "@apollo/client";
import Theme from "./theme-provider";
import AppProvider from "./app-provider";
import apolloClient from "@/lib/apollo-client";
import { AuthProvider } from "@/lib/auth-context";
import { SAProvider } from "@/lib/sa-context";
import { AlertProvider } from "./contexts/alertContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme>
      <AppProvider>
        <ApolloProvider client={apolloClient}>
          <AlertProvider>
            <SAProvider>
              <AuthProvider>{children}</AuthProvider>
            </SAProvider>
          </AlertProvider>
        </ApolloProvider>
      </AppProvider>
    </Theme>
  );
}
