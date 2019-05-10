import invariant from "tiny-invariant";
import { css } from "@emotion/core";
import { normalize } from "polished";
import colors from "open-color";
import baseFontWoff from "typeface-ubuntu/files/ubuntu-latin-400.woff";
import baseFontWoff2 from "typeface-ubuntu/files/ubuntu-latin-400.woff2";
import baseFontItalicWoff from "typeface-ubuntu/files/ubuntu-latin-400italic.woff";
import baseFontItalicWoff2 from "typeface-ubuntu/files/ubuntu-latin-400italic.woff2";
import baseFontBoldWoff from "typeface-ubuntu/files/ubuntu-latin-700.woff";
import baseFontBoldWoff2 from "typeface-ubuntu/files/ubuntu-latin-700.woff2";
import baseFontBoldItalicWoff from "typeface-ubuntu/files/ubuntu-latin-700italic.woff";
import baseFontBoldItalicWoff2 from "typeface-ubuntu/files/ubuntu-latin-700italic.woff2";
import monoFontWoff from "typeface-ubuntu-mono/files/ubuntu-mono-latin-400.woff";
import monoFontWoff2 from "typeface-ubuntu-mono/files/ubuntu-mono-latin-400.woff2";
import monoFontItalicWoff from "typeface-ubuntu-mono/files/ubuntu-mono-latin-400italic.woff";
import monoFontItalicWoff2 from "typeface-ubuntu-mono/files/ubuntu-mono-latin-400italic.woff2";
import monoFontBoldWoff from "typeface-ubuntu-mono/files/ubuntu-mono-latin-700.woff";
import monoFontBoldWoff2 from "typeface-ubuntu-mono/files/ubuntu-mono-latin-700.woff2";
import monoFontBoldItalicWoff from "typeface-ubuntu-mono/files/ubuntu-mono-latin-700italic.woff";
import monoFontBoldItalicWoff2 from "typeface-ubuntu-mono/files/ubuntu-mono-latin-700italic.woff2";

export const baseFontFamily = "nupum-base, sans-serif";
export const monoFontFamily = "nupum-mono, monospace";

export const baseFontSize = 16;
export const baseLineHeight = 1.3;
export const compactLineHeight = 1.1;
const rhythmRatio = 0.5;
const scaleRatio = 2;
const scaleNotes = 5;

export const primaryColor = "pink";

export function establish() {
  return css`
    ${establishFonts()}
    ${normalize()}
    ${establishRhythm()}

    html {
      box-sizing: border-box;
    }
    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  `;
}

function establishFonts() {
  return css`
    @font-face {
      font-family: 'nupum-base';
      font-style: normal;
      font-weight: normal;
      font-display: swap;
      src:
        url('${baseFontWoff2}') format('woff2'),
        url('${baseFontWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-base';
      font-style: italic;
      font-weight: normal;
      font-display: swap;
      src:
        url('${baseFontItalicWoff2}') format('woff2'),
        url('${baseFontItalicWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-base';
      font-style: normal;
      font-weight: bold;
      font-display: swap;
      src:
        url('${baseFontBoldWoff2}') format('woff2'),
        url('${baseFontBoldWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-base';
      font-style: italic;
      font-weight: bold;
      font-display: swap;
      src:
        url('${baseFontBoldItalicWoff2}') format('woff2'),
        url('${baseFontBoldItalicWoff}') format('woff');
    }

    @font-face {
      font-family: 'nupum-mono';
      font-style: normal;
      font-weight: normal;
      font-display: swap;
      src:
        url('${monoFontWoff2}') format('woff2'),
        url('${monoFontWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-mono';
      font-style: italic;
      font-weight: normal;
      font-display: swap;
      src:
        url('${monoFontItalicWoff2}') format('woff2'),
        url('${monoFontItalicWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-mono';
      font-style: normal;
      font-weight: bold;
      font-display: swap;
      src:
        url('${monoFontBoldWoff2}') format('woff2'),
        url('${monoFontBoldWoff}') format('woff');
    }
    @font-face {
      font-family: 'nupum-mono';
      font-style: italic;
      font-weight: bold;
      font-display: swap;
      src:
        url('${monoFontBoldItalicWoff2}') format('woff2'),
        url('${monoFontBoldItalicWoff}') format('woff');
    }
  `;
}

function establishRhythm() {
  const fontSize = (baseFontSize / 16) * 100;
  const lineHeight = Math.ceil(baseLineHeight / rhythmRatio) * rhythmRatio;

  return css`
    html {
      font-size: ${fontSize}%;
      line-height: ${lineHeight}rem;
    }
  `;
}

export function rhythm(line, subLine = 0) {
  const size =
    line * Math.ceil(baseLineHeight / rhythmRatio) * rhythmRatio +
    subLine * rhythmRatio;

  return `${size}rem`;
}

export function scale(octave, note = 0, minLineHeight = baseLineHeight) {
  const fontSize = scaleRatio ** (octave + note / scaleNotes);
  const lineHeight =
    Math.ceil((fontSize * minLineHeight) / rhythmRatio) * rhythmRatio;

  return css`
    font-size: ${fontSize}rem;
    line-height: ${lineHeight}rem;
  `;
}

export function color(name, variant = 5) {
  const variants = colors[name];
  invariant(variants, `color ${JSON.stringify(name)} does not exist`);

  if (typeof variants === "string") {
    return variants;
  } else {
    invariant(
      variants[variant],
      `variant ${variant} of color ${JSON.stringify(name)} does not exist`,
    );
    return variants[variant];
  }
}
