import React from "react";
import PropTypes from "prop-types";

export default function Document({ html, scripts, data }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Search for npm packages" />

        <title>nupum</title>

        {scripts.map(uri => (
          <script key={uri} src={uri} defer />
        ))}
      </head>

      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
        <div hidden id="data">
          {JSON.stringify(data)}
        </div>
      </body>
    </html>
  );
}

Document.propTypes = {
  html: PropTypes.string.isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  data: PropTypes.object.isRequired,
};
