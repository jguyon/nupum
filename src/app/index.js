import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import Router, { preloadRoutes } from "../router";
import { ModuleCacheProvider } from "../module-cache";
import Root from "./root";
import { LocationFocusProvider } from "./location-focus";
import { SearchFormProvider } from "./search-form";
import Layout from "./layout";
import HomePage from "./home-page";
import SearchPage, { preloadSearchPage } from "./search-page";
import PackagePage, { preloadPackagePage } from "./package-page";
import PageNotFound from "./page-not-found";

const PRELOAD_TIMEOUT = process.env.NODE_ENV === "test" ? 0 : 2000;

export default function App({ history, moduleCache }) {
  return (
    <ModuleCacheProvider cache={moduleCache}>
      <Router
        history={history}
        routes={routes}
        preloadTimeout={PRELOAD_TIMEOUT}
        preloadProps={{ moduleCache }}
      />
    </ModuleCacheProvider>
  );
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  moduleCache: PropTypes.object.isRequired,
};

export function preloadApp({ history, moduleCache }) {
  invariant(
    history && typeof history === "object",
    "expected `history` prop to be present",
  );
  invariant(
    moduleCache && typeof moduleCache === "object",
    "expected `moduleCache` prop to be present",
  );

  return preloadRoutes(history, routes, { moduleCache });
}

const routes = [
  {
    path: "/*",
    render: ({ location, children }) => (
      <Root>
        <LocationFocusProvider location={location}>
          <SearchFormProvider>{children}</SearchFormProvider>
        </LocationFocusProvider>
      </Root>
    ),
    routes: [
      {
        path: "/",
        render: () => <HomePage />,
      },
      {
        path: "/*",
        render: ({ children }) => <Layout>{children}</Layout>,
        routes: [
          {
            path: "/search",
            preload: props => preloadSearchPage(props),
            render: ({ location }) => <SearchPage location={location} />,
          },
          {
            path: "/package/:name",
            preload: props => preloadPackagePage(props),
            render: ({ params: { name } }) => (
              <PackagePage key={name} name={name} />
            ),
          },
          {
            path: "/*",
            render: () => <PageNotFound />,
          },
        ],
      },
    ],
  },
];
