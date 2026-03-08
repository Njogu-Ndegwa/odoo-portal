import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { STORAGE_KEYS } from "./odoo-auth";

const httpLink = createHttpLink({
  uri: "https://dirac-fed-dev.omnivoltaic.com/odoo-portal",
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.SALES_ACCESS_TOKEN)
      : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const portalApolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default portalApolloClient;
