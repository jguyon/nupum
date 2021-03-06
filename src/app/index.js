import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import { HelmetProvider } from "react-helmet-async";
import Router, { preloadRoutes } from "../router";
import { ModuleCacheProvider } from "../module-cache";
import { ResourceCacheProvider } from "../resource-cache";
import ErrorBoundary from "./error-boundary";
import { HydrationProvider } from "./use-hydration";
import RootLayout from "./root-layout";
import { LocationFocusProvider } from "./location-focus";
import { SearchFormProvider } from "./search-form";
import PageLayout from "./page-layout";
import HomePage from "./home-page";
import SearchPage, { preloadSearchPage } from "./search-page";
import PackagePage, { preloadPackagePage } from "./package-page";
import PageNotFound from "./page-not-found";

const PRELOAD_TIMEOUT = process.env.NODE_ENV === "test" ? 0 : 2000;

export default function App({
  history,
  moduleCache,
  resourceCache,
  helmetContext,
}) {
  return (
    <HelmetProvider context={helmetContext}>
      <ErrorBoundary>
        <HydrationProvider>
          <ModuleCacheProvider cache={moduleCache}>
            <ResourceCacheProvider cache={resourceCache}>
              <Router
                history={history}
                routes={routes}
                preloadTimeout={PRELOAD_TIMEOUT}
                preloadProps={{ moduleCache, resourceCache }}
              />
            </ResourceCacheProvider>
          </ModuleCacheProvider>
        </HydrationProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  moduleCache: PropTypes.object.isRequired,
  resourceCache: PropTypes.object.isRequired,
  helmetContext: PropTypes.object,
};

export function preloadApp({ history, moduleCache, resourceCache }) {
  invariant(
    history && typeof history === "object",
    "expected `history` prop to be present",
  );
  invariant(
    moduleCache && typeof moduleCache === "object",
    "expected `moduleCache` prop to be present",
  );
  invariant(
    resourceCache && typeof resourceCache === "object",
    "expected `resourceCache` prop to be present",
  );

  return preloadRoutes(history, routes, { moduleCache, resourceCache });
}

const routes = [
  {
    path: "/*",
    render: ({ location, action, children }) => (
      <RootLayout>
        <LocationFocusProvider location={location} action={action}>
          <SearchFormProvider>{children}</SearchFormProvider>
        </LocationFocusProvider>
      </RootLayout>
    ),
    routes: [
      {
        path: "/",
        render: () => <HomePage />,
      },
      {
        path: "/*",
        render: ({ children }) => <PageLayout>{children}</PageLayout>,
        routes: [
          {
            path: "/search",
            preload: ({ location, moduleCache, resourceCache }) =>
              preloadSearchPage({ location, moduleCache, resourceCache }),
            render: ({ location }) => <SearchPage location={location} />,
          },
          {
            path: "/package/:name",
            preload: ({ moduleCache, resourceCache, params: { name } }) =>
              preloadPackagePage({ moduleCache, resourceCache, name }),
            render: ({ params: { name } }) => (
              <PackagePage key={name} name={name} />
            ),
          },
          {
            path: "/package/:scope/:name",
            preload: ({
              moduleCache,
              resourceCache,
              params: { scope, name },
            }) =>
              preloadPackagePage({
                moduleCache,
                resourceCache,
                name: `${scope}/${name}`,
              }),
            render: ({ params: { scope, name } }) => (
              <PackagePage key={`${scope}/${name}`} name={`${scope}/${name}`} />
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
