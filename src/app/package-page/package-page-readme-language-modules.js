import React from "react";
import { createModule } from "../../module-cache";

const SUPPORTED_LANGUAGES = [
  { lang: "coffeescript", deps: ["javascript"], aliases: ["coffee"] },
  { lang: "css", deps: ["markup"], aliases: [] },
  { lang: "elm", deps: [], aliases: [] },
  { lang: "flow", deps: ["clike", "markup", "javascript"], aliases: [] },
  { lang: "graphql", deps: [], aliases: ["gql"] },
  { lang: "javascript", deps: ["clike", "markup"], aliases: ["js"] },
  { lang: "jsx", deps: ["clike", "markup", "javascript"], aliases: [] },
  { lang: "markdown", deps: ["markup"], aliases: ["md"] },
  { lang: "markup", deps: [], aliases: ["html", "xml", "svg"] },
  { lang: "ocaml", deps: [], aliases: [] },
  { lang: "reason", deps: ["clike"], aliases: [] },
  { lang: "sass", deps: ["markup", "css"], aliases: [] },
  { lang: "scss", deps: ["markup", "css"], aliases: [] },
  { lang: "sql", deps: [], aliases: [] },
  { lang: "tsx", deps: ["clike", "markup", "javascript"], aliases: [] },
  {
    lang: "typescript",
    deps: ["clike", "markup", "javascript"],
    aliases: ["ts"],
  },
  { lang: "yaml", deps: [], aliases: ["yml"] },
];

const languageModules = new Map();

for (const { lang, deps, aliases } of SUPPORTED_LANGUAGES) {
  const module = createModule(async () => {
    const [Refractor, ...grammars] = await Promise.all([
      importRefractor(),
      ...deps.map(dep => importLanguage(dep)),
      importLanguage(lang),
    ]);

    for (const grammar of grammars) {
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
