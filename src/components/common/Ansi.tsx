import Anser from "anser";
import { escapeCarriageReturn } from "escape-carriage";
import * as React from "react";

const anser = new Anser();
// @ts-ignore
window.anser = anser;
const ansiToHTML = (input: string): string => {
  input = escapeCarriageReturn(input);
  return anser.ansiToHtml(input, {
    remove_empty: false,
    use_classes: true,
    continue: true,
  });
}
declare interface Props {
  text: string;
  className?: string;
}

const htmlEntReplacements = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ["'", '&#39;'],
  ['"', '&quot;'],
  ['\n', '<br>'],
]);

const htmlEntReplacer = (entity: string): string =>
  htmlEntReplacements.get(entity) || entity;

const Ansi = (props: Props): JSX.Element => {
  const { text } = props;
  let parsed = ansiToHTML(text.replace(/[<>'"&\n]/g, htmlEntReplacer));
  const __html = parsed === '' ? '&nbsp;' : parsed;

  return (
    <code
      dangerouslySetInnerHTML={{ __html: __html + '<br>' }}
    />
  );
}

export default Ansi;
