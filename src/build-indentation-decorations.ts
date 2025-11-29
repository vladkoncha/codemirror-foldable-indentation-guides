import { getIndentUnit } from '@codemirror/language';
import { EditorView, Decoration } from '@codemirror/view';
import { indentationGuidesConfig } from './config';
import { getVisibleLines, isLineEmpty, isLineFolded } from './utils';
import { Range } from '@codemirror/state';
import { ClickableIndentationGuideWidget } from './clickable-indentation-guide-widget';
import { getNewIndentationMap } from './get-new-indentation-map';

export function buildIndentationDecorations(view: EditorView) {
  const state = view.state;
  const widgets: Range<Decoration>[] = [];
  const lines = getVisibleLines(view);
  const indentWidth = getIndentUnit(state);
  const {
    thickness,
    activeThickness,
    hoverThickness,
    additionalPadding,
    foldBlockOnClick,
    highlightActiveBlockBackground,
    hideFirstIndent,
  } = state.facet(indentationGuidesConfig);
  const map = getNewIndentationMap(state, lines);
  const lineLevels = new Map<number, number>();

  for (const line of lines) {
    const entry = map.get(line.number);
    const level = entry?.level ?? 0;
    lineLevels.set(line.number, level);

    /** Workaround for folded empty lines in python and similar languages.
     *  Without this check, unwanted indentation guides will be drawn after foldPlaceholder
     */
    const foldedAndEmpty =
      isLineFolded(view, entry.line.number) &&
      isLineEmpty(view, entry.line.number);

    if (!level || foldedAndEmpty) {
      continue;
    }

    const deco = Decoration.widget({
      widget: new ClickableIndentationGuideWidget(
        indentWidth,
        level,
        line.number,
        {
          thickness,
          activeThickness,
          hoverThickness,
          additionalPadding,
          foldOnClick: foldBlockOnClick,
          highlightBackground: highlightActiveBlockBackground,
          hideFirstIndent,
        }
      ),
      side: 0,
    });

    widgets.push(deco.range(line.from));
  }

  return {
    indentationMap: map,
    decoSet: Decoration.set(widgets),
    lineLevels,
  };
}
