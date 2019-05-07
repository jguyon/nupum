import invariant from "tiny-invariant";
import { css } from "@emotion/core";
import colors from "open-color";

export const baseFontFamily = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif`;

export const baseFontSize = 16;
export const baseLineHeight = 1.4;
export const compactLineHeight = 1.2;
const rhythmRatio = 0.5;
const scaleRatio = 2;
const scaleNotes = 5;

export const primaryColor = "pink";

export function establishRhythm() {
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
