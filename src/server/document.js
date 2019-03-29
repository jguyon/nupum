import React from "react";
import PropTypes from "prop-types";

export default function Document({ html, scripts }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no"
        />

        <title>nupum</title>

        {scripts.map(uri => (
          <link key={uri} rel="preload" href={uri} as="script" />
        ))}
      </head>

      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: html }} />

        {scripts.map(uri => (
          <script key={uri} src={uri} />
        ))}
      </body>
    </html>
  );
}

Document.propTypes = {
  html: PropTypes.string.isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};
