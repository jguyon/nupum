import React from "react";
import { createModule } from "../../module-cache";

const SUPPORTED_LANGUAGES = [
  { lang: "coffeescript", aliases: ["coffee"] },
  { lang: "css", aliases: [] },
  { lang: "elm", aliases: [] },
  { lang: "flow", aliases: [] },
  { lang: "graphql", aliases: ["gql"] },
  { lang: "javascript", aliases: ["js"] },
  { lang: "json", aliases: [] },
  { lang: "jsx", aliases: [] },
  { lang: "markdown", aliases: ["md"] },
  { lang: "markup", aliases: ["html", "xml", "svg"] },
  { lang: "ocaml", aliases: [] },
  { lang: "reason", aliases: [] },
  { lang: "sass", aliases: [] },
  { lang: "scss", aliases: [] },
  { lang: "sql", aliases: [] },
  { lang: "tsx", aliases: [] },
  { lang: "typescript", aliases: ["ts"] },
  { lang: "yaml", aliases: ["yml"] },
];

const languageModules = new Map();

for (const { lang, aliases } of SUPPORTED_LANGUAGES) {
  const module = createModule(async () => {
    const Refractor = await importRefractor();

    if (!Refractor.hasLanguage(lang)) {
      const grammar = await importLanguage(lang);
      Refractor.registerLanguage(grammar);
    }

    return function HighlightLanguage(props) {
      return <Refractor {...props} language={lang} />;
    };
  });

  languageModules.set(lang, module);
  for (const alias of aliases) {
    languageModules.set(alias, module);
  }
}

function importRefractor() {
  return import(/* webpackChunkName: "react-refractor" */ "react-refractor").then(
    module => module.default,
  );
}

async function importLanguage(lang) {
  return import(/* webpackChunkName: "refractor-lang-[request]" */ `refractor/lang/${lang}`).then(
    module => module.default,
  );
}

export default languageModules;
