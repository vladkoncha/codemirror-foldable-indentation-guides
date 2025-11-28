import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { getIndentUnit, indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';

import { foldableIndentationGuides } from '../src';

const pythonDoc = `def read_file(path):
  with open(path, 'r') as file:
  
    print("opening file")
    text = file.read()
    
    file.close()
    
    if len(text) > 1000:
      print("thats a big file!")
      
    return text

def main():
  read_file("notes.txt")
`;

const jsDoc = `import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { getIndentUnit, indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';

import { foldableIndentationGuides } from '../src';

const jsDoc = "";

const indentConf = new Compartment();

const view = new EditorView({
  state: EditorState.create({
    doc: jsDoc,
    extensions: [
      basicSetup,
      // python(),
      javascript(),
      indentConf.of(indentUnit.of('  ')),
      foldableIndentationGuides(),
    ],
  }),
  parent: document.getElementById('editor')!,
});

function toggleIndent() {
  const indent = getIndentUnit(view.state) === 2 ? '    ' : '  ';
  view.dispatch({ effects: indentConf.reconfigure(indentUnit.of(indent)) });
}

document
  .getElementById('toggleIndent')!
  .addEventListener('click', toggleIndent);
`;

const indentConf = new Compartment();

const view = new EditorView({
  state: EditorState.create({
    doc: jsDoc,
    extensions: [
      basicSetup,
      // python(),
      javascript(),
      indentConf.of(indentUnit.of('  ')),
      foldableIndentationGuides({
        additionalPadding: 4,
        highlightActiveMarker: true,
        highlightActiveBlockBackground: true,
        highlightHoveredBlockBackground: true,
        highlightHoveredMarker: true,
        colors: {
          activeLight: 'red',
          light: '#4385c780',
          backgroundLight: '#4385c720',
          backgroundHoverLight: '#ce701180',
        },
      }),
    ],
  }),
  parent: document.getElementById('editor')!,
});

function toggleIndent() {
  const indent = getIndentUnit(view.state) === 2 ? '    ' : '  ';
  view.dispatch({ effects: indentConf.reconfigure(indentUnit.of(indent)) });
}

document
  .getElementById('toggleIndent')!
  .addEventListener('click', toggleIndent);
