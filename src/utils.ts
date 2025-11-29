import {
  foldEffect,
  foldState,
  foldable,
  foldedRanges,
  unfoldEffect,
} from '@codemirror/language';
import { Line, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

const getVisibleFoldedRanges = (view: EditorView) => {
  const foldedRanges = view.state.field(foldState, false);
  if (!foldedRanges || foldedRanges.size === 0) {
    return [];
  }

  const visibleRanges = view.visibleRanges;
  if (!visibleRanges?.length) {
    return [];
  }

  const visibleFoldedRanges: { from: number; to: number }[] = [];

  foldedRanges.between(
    visibleRanges[0].from,
    visibleRanges[visibleRanges.length - 1].to,
    (from, to) => {
      for (const visibleRange of visibleRanges) {
        /** If pushed without this check, it will break inner folded ranges */
        if (
          (from >= visibleRange.from && from <= visibleRange.to) ||
          (to >= visibleRange.from && to <= visibleRange.to) ||
          (from <= visibleRange.from && to >= visibleRange.to)
        ) {
          visibleFoldedRanges.push({ from, to });
          break;
        }
      }
    }
  );

  return visibleFoldedRanges;
};

/**
 * Gets the visible lines in the editor. Lines will not be repeated.
 *
 * @param view - The editor view to get the visible lines from.
 * @param state - The editor state. Defaults to the view's current one.
 */
export function getVisibleLines(view: EditorView, state = view.state) {
  const lines = new Map<Line['number'], Line>();

  const foldedRanges = getVisibleFoldedRanges(view);
  const allVisibleRanges = [...view.visibleRanges, ...foldedRanges].sort(
    (a, b) => a.from - b.from
  );

  for (const { from, to } of allVisibleRanges) {
    let pos = from;

    while (pos <= to) {
      const line = state.doc.lineAt(pos);
      lines.set(line.number, line);

      pos = line.to + 1;
    }
  }

  return new Set(lines.values());
}

/**
 * Gets all lines between the cursor position and viewport in the editor. Lines will not be repeated.
 *
 * @param view - The editor view to get the visible lines from.
 * @param state - The editor state. Defaults to the view's current one.
 */
export function getAllLines(view: EditorView, state = view.state) {
  const lines = new Map<Line['number'], Line>();

  const lineRanges = [];
  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    lineRanges.push({ from: line.from, to: line.to });
  }

  for (const { from, to } of lineRanges) {
    let pos = from;

    while (pos <= to) {
      const line = state.doc.lineAt(pos);
      lines.set(line.number, line);

      pos = line.to + 1;
    }
  }

  return new Set(lines.values());
}

/**
 * Gets the line at the position of the primary cursor.
 *
 * @param state - The editor state from which to extract the line.
 */
export function getCurrentLine(state: EditorState) {
  const currentPos = state.selection.main.head;
  return state.doc.lineAt(currentPos);
}

/**
 * Returns the number of columns that a string is indented, controlling for
 * tabs. This is useful for determining the indentation level of a line.
 *
 * Note that this only returns the number of _visible_ columns, not the number
 * of whitespace characters at the start of the string.
 *
 * @param str - The string to check.
 * @param tabSize - The size of a tab character. Usually 2 or 4.
 */
export function numColumns(str: string, tabSize: number) {
  // as far as I can tell, this is pretty much the fastest way to do this,
  // at least involving iteration. `str.length - str.trimStart().length` is
  // much faster, but it has some edge cases that are hard to deal with.

  let col = 0;

  // eslint-disable-next-line no-restricted-syntax
  loop: for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case ' ':
      case '\u00A0': {
        col += 1;
        continue loop;
      }

      case '\t': {
        // if the current column is a multiple of the tab size, we can just
        // add the tab size to the column. otherwise, we need to add the
        // difference between the tab size and the current column.
        col += tabSize - (col % tabSize);
        continue loop;
      }

      case '\r': {
        continue loop;
      }

      default: {
        break loop;
      }
    }
  }

  return col;
}

export function getNearestFoldRange(
  view: EditorView,
  lineNumber: number,
  state = view.state
): { from: number; to: number } | null {
  const line = state.doc.line(lineNumber);
  const range = foldable(state, line.from, line.to);
  if (range) {
    return range;
  }

  // if the line itself isn't foldable, walk upward to find parent fold
  for (let l = lineNumber - 1; l > 0; l--) {
    const up = state.doc.line(l);
    const r = foldable(state, up.from, up.to);
    if (r && r.from <= line.from && r.to >= line.to) {
      return r;
    }
  }

  return null;
}

export function isLineFolded(view: EditorView, lineNumber: number): boolean {
  const state = view.state;
  const foldField = state.field(foldState, false);
  if (!foldField) {
    return false;
  }

  let folded = false;
  foldField.between(0, state.doc.length, (from, to) => {
    const fromLine = state.doc.lineAt(from).number;
    const toLine = state.doc.lineAt(to).number;

    if (lineNumber >= fromLine && lineNumber <= toLine) {
      folded = true;
      return false;
    }
  });

  return folded;
}

export function isLineEmpty(view: EditorView, lineNumber: number) {
  const lineText = view.state.doc.line(lineNumber).text;
  return /^\s*$/.test(lineText);
}

export function toggleFoldRange(
  view: EditorView,
  range: { from: number; to: number }
) {
  const { from, to } = range;
  const folded = foldedRanges(view.state);
  let covering = false;
  folded.between(from, to, (fromPos, toPos) => {
    if (fromPos <= from && toPos >= to) {
      covering = true;
    }
  });
  if (covering) {
    view.dispatch({
      effects: [
        unfoldEffect.of(range),
        EditorView.scrollIntoView(range.from, { y: 'nearest' }),
      ],
    });
  } else {
    view.dispatch({
      effects: [
        foldEffect.of(range),
        EditorView.scrollIntoView(range.from, { y: 'nearest' }),
      ],
    });
  }
}
