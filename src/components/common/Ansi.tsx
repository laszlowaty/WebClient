import Anser from "anser";
import { escapeCarriageReturn } from "escape-carriage";
import * as React from "react";

const ansiToHTML = (input: string): string => {
  input = escapeCarriageReturn(input);
  return Anser.ansiToHtml(input, {
    remove_empty: false,
    use_classes: true,
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
]);
const htmlEntReplacer = (entity: string): string =>
  htmlEntReplacements.get(entity) || entity;

const Ansi = (props: Props): JSX.Element => {
  const { className, text } = props;

  return (
    <code
      className={className}
      dangerouslySetInnerHTML={{ __html: ansiToHTML(text.replace(/[<>]/g, htmlEntReplacer)) }}
    />
  );
}

export default Ansi;