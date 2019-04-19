import React from "react";
import PropTypes from "prop-types";
import Router from "../router";
import Root from "./root";
import { SearchFormProvider } from "./search-form";
import Layout from "./layout";
import HomePage from "./home-page";
import SearchPage from "./search-page";
import PackagePage from "./package-page";
import PageNotFound from "./page-not-found";

export default function App({ history }) {
  return <Router history={history} routes={routes} />;
}

App.propTypes = {
  history: PropTypes.object.isRequired,
};

const routes = [
  {
    path: "/*",
    render: ({ children }) => (
      <Root>
        <SearchFormProvider>{children}</SearchFormProvider>
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
            render: ({ location }) => <SearchPage location={location} />,
          },
          {
            path: "/package/:name",
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
