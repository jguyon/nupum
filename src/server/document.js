import React from "react";
import PropTypes from "prop-types";
import serialize from "serialize-javascript";

export default function Document({ html, scripts, data, helmet }) {
  return (
    <html {...helmet.htmlAttributes.toComponent()}>
      <head>
        <meta charSet="utf-8" />

        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}

        {scripts.map(uri => (
          <script key={uri} src={uri} defer />
        ))}
      </head>

      <body {...helmet.bodyAttributes.toComponent()}>
        <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.SERIALIZED_DATA=${serialize(data)}`,
          }}
        />
      </body>
    </html>
  );
}

Document.propTypes = {
  html: PropTypes.string.isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  data: PropTypes.object.isRequired,
  helmet: PropTypes.object.isRequired,
};
