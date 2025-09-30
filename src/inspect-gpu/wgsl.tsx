import React, { useLayoutEffect, useRef } from 'react';

import { StyledCompactShader } from './shader';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { createTheme } from '@uiw/codemirror-themes';

import { parser } from '@use-gpu/shader/wgsl';
import { styleTags, tags as t } from "@lezer/highlight";

export type WGSLProps = {
  code: string,
  onChange?: (code: string) => void,
  onCommit?: (code: string) => void,
};

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Assign: t.operator,
      AddAssign: t.operator,
      SubAssign: t.operator,
      MulAssign: t.operator,
      DivAssign: t.operator,
      ModAssign: t.operator,
      LeftAssign: t.operator,
      RightAssign: t.operator,
      AndAssign: t.operator,
      XorAssign: t.operator,
      OrAssign: t.operator,
      Add: t.operator,
      Sub: t.operator,
      Mul: t.operator,
      Div: t.operator,
      Mod: t.operator,
      Left: t.operator,
      Right: t.operator,
      And: t.operator,
      Xor: t.operator,
      Or: t.operator,
      AndAnd: t.operator,
      OrOr: t.operator,
      Inc: t.operator,
      Dec: t.operator,
      Bang: t.operator,
      Tilde: t.operator,
      Eq: t.operator,
      Neq: t.operator,
      Lt: t.operator,
      Lte: t.operator,
      Gt: t.operator,
      Gte: t.operator,
      '<': t.operator,
      '>': t.operator,
      "ReturnType": t.operator,

      "Comment": t.comment,
      "FunctionHeader/Identifier": t.macroName,
      "FunctionCall/Identifier": t.macroName,

      "Keyword": t.keyword,
      "Type": t.typeName,
      "TypeDeclaration": t.typeName,
      "Attribute": t.attributeName,
      "Attribute/Identifier": t.attributeName,
      "Attribute/IntLiteral": t.number,
      "IntLiteral": t.number,
      "UintLiteral": t.number,
      "FloatLiteral": t.number,
      "String": t.string,
      "true": t.number,
      "false": t.number,
    }),
  ]
});

const colorTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#000000',
    foreground: '#aedaff',
    caret: '#6a7eff',
    lineHighlight: '#ffffff00',
    gutterBackground: '#303030',
    gutterForeground: '#8090A0',
  },
  styles: [
    { tag: t.comment, color: '#7377ffff' },
    { tag: t.keyword, color: '#5c8dffff' },
    { tag: t.number, color: '#73d3ffff', 'fontWeight': 'bold' },
    { tag: t.string, color: '#73d3ffff' },
    { tag: t.typeName, color: '#79ffdbff' },
    { tag: t.operator, color: '#60c797ff' },
    { tag: t.attributeName, color: '#73d3ffff' },
    { tag: t.macroName, color: '#fff7fbff', 'fontWeight': 'bold' },
  ],
});

const fontTheme = EditorView.theme({
  "& .cm-scroller": {
    fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Bitstream Vera Sans, monospace',
  },
  "& .cm-search": {
    fontSize: '16px',
    overflowX: 'auto',
  },
  "& .cm-search input": {
    fontSize: '15px',
  },
  "& .cm-search button": {
    fontSize: '14px',
  },
  "& .cm-search label": {
    display: 'inline-flex',
    direction: 'row',
    alignItems: 'center',
    position: 'relative',
    top: '2px',
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#4377ff80"
  },
  '& .cm-selectionMatch': {
    background: "#4377ff40"
  },
});

export function wgslLang() {
  const language = LRLanguage.define({
    parser: parserWithMetadata,
  });

  return new LanguageSupport(language);
}

export const renderWGSL = (props: WGSLProps) => <StyledCompactShader><WGSL {...props} /></StyledCompactShader>;

export const WGSL = (props: WGSLProps) => {
  const {code, onChange, onCommit} = props;

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useLayoutEffect(() => {
    const {current: view} = viewRef;
    if (!view) return;

    const currentCode = view.state.doc.toString();
    if (code !== currentCode) {
      view.dispatch({
        changes: [{ from: 0, to: currentCode.length, insert: code }],
      });
    }
  }, [code]);

  useLayoutEffect(() => {
    const {current: editor} = editorRef;
    if (!editor) return;

    const listener = EditorView.updateListener.of((v: ViewUpdate) => {
      if (onChange && v.docChanged) {
        onChange(v.state.doc.toString());
      }
    });

    const handleCommit = (v: EditorView) => {
      try {
        if (onCommit) onCommit(v.state.doc.toString());
      } catch (e) {
        console.error(e);
      }
      return true;
    };

    const commitKeys = [
      {
        key: 'Cmd-s',
        run: handleCommit,
      },
      {
        key: 'Ctrl-s',
        run: handleCommit,
      },
    ];

    const startState = EditorState.create({
      doc: code,
      extensions: [
        wgslLang(),
        basicSetup,
        colorTheme,
        fontTheme,
        keymap.of(commitKeys),
        keymap.of(defaultKeymap),
        listener,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editor,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [onChange, onCommit]);

  return <div ref={editorRef}></div>;
};
