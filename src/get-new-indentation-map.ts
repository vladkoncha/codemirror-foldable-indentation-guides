import { getIndentUnit } from '@codemirror/language';
import { EditorState, Line } from '@codemirror/state';
import { indentationGuidesConfig } from './config';
import { IndentationMap } from './map';

export function getNewIndentationMap(state: EditorState, lines: Set<Line>) {
  const indentWidth = getIndentUnit(state);
  const { markerType } = state.facet(indentationGuidesConfig);
  return new IndentationMap(lines, state, indentWidth, markerType);
}
