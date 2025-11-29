import { getIndentUnit } from '@codemirror/language';
import {
  PluginValue,
  EditorView,
  DecorationSet,
  ViewUpdate,
  ViewPlugin,
} from '@codemirror/view';
import { indentationGuidesConfig } from './config';
import { IndentationMap } from './map';
import {
  getAllLines,
  getCurrentLine,
  getNearestFoldRange,
  toggleFoldRange,
} from './utils';
import { buildIndentationDecorations } from './build-indentation-decorations';
import { getNewIndentationMap } from './get-new-indentation-map';
import { handleGuideHover } from './handle-guide-hover';

export class IndentationViewPlugin implements PluginValue {
  private unitWidth: number;
  private currentLineNumber: number;
  private view: EditorView;
  private contentElement: HTMLElement | null;
  private viewContentWidth: number;
  decorations: DecorationSet;

  /** Edges of current active block in a viewport */
  private activeColEdges: number[];
  private activeCol: number;

  /** map of lineNumber -> indent level (integer) */
  lineLevels: Map<number, number>;

  indentationMap: IndentationMap;

  highlightHoveredGuide: boolean;
  highlightHoveredBlock: boolean;

  hoveredGuide: {
    col: number;
    start: number;
    end: number;
  } | null = null;

  constructor(view: EditorView) {
    const built = buildIndentationDecorations(view);
    this.highlightHoveredGuide = false;
    this.highlightHoveredBlock = false;
    this.activeColEdges = [];
    this.activeCol = 0;
    this.view = view;
    this.viewContentWidth =
      view.dom.querySelector('.cm-content')?.clientWidth ?? 0;
    this.contentElement = view.dom.querySelector('.cm-content');
    this.decorations = built.decoSet;
    this.lineLevels = built.lineLevels;
    this.indentationMap = built.indentationMap;
    this.unitWidth = getIndentUnit(view.state);
    this.currentLineNumber = getCurrentLine(view.state).number;
  }

  update(update: ViewUpdate) {
    this.contentElement ??= update.view.dom.querySelector('.cm-content');
    const unitWidth = getIndentUnit(update.state);
    const unitWidthChanged = unitWidth !== this.unitWidth;
    if (unitWidthChanged) {
      this.unitWidth = unitWidth;
    }
    const lineNumber = getCurrentLine(update.state).number;
    const lineNumberChanged = lineNumber !== this.currentLineNumber;
    this.currentLineNumber = lineNumber;

    const {
      highlightActiveMarker,
      highlightActiveBlockBackground,
      highlightHoveredBlockBackground,
      highlightHoveredMarker,
    } = update.state.facet(indentationGuidesConfig);
    this.highlightHoveredGuide = highlightHoveredMarker;
    this.highlightHoveredBlock = highlightHoveredBlockBackground;
    const isHighlightActive =
      highlightActiveMarker || highlightActiveBlockBackground;

    const viewContentWidth = this.contentElement?.clientWidth ?? 0;
    const viewChanged =
      lineNumberChanged ||
      update.viewportChanged ||
      viewContentWidth !== this.viewContentWidth;

    const activeBlockUpdateRequired = isHighlightActive && viewChanged;

    if (update.docChanged || update.viewportChanged || unitWidthChanged) {
      const built = buildIndentationDecorations(update.view);

      this.decorations = built.decoSet;
      this.lineLevels = built.lineLevels;
      this.indentationMap = built.indentationMap;
      this.clearHoverClasses();
    }

    if (activeBlockUpdateRequired) {
      this.viewContentWidth = viewContentWidth;
      this.updateActiveColumns(
        lineNumber,
        highlightActiveMarker,
        highlightActiveBlockBackground
      );
    }
  }

  private updateActiveColumns(
    lineNumber: number,
    highlightActiveMarker: boolean,
    highlightActiveBlockBackground: boolean
  ) {
    requestAnimationFrame(() => {
      this.clearActiveClasses();

      const lines = this.indentationMap
        .getActiveLinesNumbers(lineNumber)
        ?.sort((a, b) => a.line.number - b.line.number);
      if (lines) {
        lines.forEach(line => {
          const { active: activeCol } = line;
          const lineNumber = line.line.number;

          if (highlightActiveMarker) {
            this.applyActiveMarker(lineNumber, activeCol ?? 0);
          }
          if (highlightActiveBlockBackground) {
            this.applyBackgroundHighlight(lineNumber, activeCol ?? 0, 'active');
          }
        });
        this.activeColEdges = [
          lines[0].line.number,
          lines[lines.length - 1].line.number,
        ];
        this.activeCol = lines[0].active ?? 0;
        return;
      }

      if (!this.activeColEdges || !this.activeCol) {
        return;
      }

      /** If current line is outside computed indentation map lines,
       *  compute active block lines from active column points */
      const ranges = this.activeColEdges.map(edge =>
        this.computeBlockRange(edge, this.activeCol)
      );

      ranges.forEach(range => {
        for (let i = range.start; i <= range.end; i++) {
          if (highlightActiveMarker) {
            this.applyActiveMarker(lineNumber, this.activeCol);
          }
          if (highlightActiveBlockBackground) {
            this.applyBackgroundHighlight(lineNumber, this.activeCol, 'active');
          }
        }
        this.activeColEdges.push(range.start, range.end);
      });
      this.activeColEdges = Array.from(new Set(this.activeColEdges));
    });
  }

  /** compute block (inclusive line numbers) for a given clicked line and column (0-based) */
  computeBlockRange(lineNumber: number, col: number) {
    const minLevel = col; // if a line has level >= minLevel it has that guide

    // scan up
    let start = lineNumber;
    while (start > 1) {
      const prev = this.lineLevels.get(start - 1) ?? 0;
      if (prev >= minLevel) {
        start--;
      } else {
        break;
      }
    }

    // scan down
    let end = lineNumber;
    while (end <= this.view.state.doc.lines) {
      const next = this.lineLevels.get(end + 1);
      if (typeof next === 'number' && next >= minLevel) {
        end++;
      } else {
        break;
      }
    }
    return { start, end };
  }

  clearActiveClasses() {
    const dom = this.view.dom;

    dom
      .querySelectorAll('.cm-indentation-guide-button_active')
      .forEach(el => el.classList.remove('cm-indentation-guide-button_active'));

    dom
      .querySelectorAll<HTMLElement>(
        '.cm-indentation-guide-background-highlight_active'
      )
      .forEach(el => {
        el.classList.remove('cm-indentation-guide-background-highlight_active');
      });
  }

  applyActiveMarker(lineNumber: number, col: number) {
    const root = this.view.dom;
    const selector = `.cm-indentation-guide[data-line="${lineNumber}"] > .cm-indentation-guide-button[data-col="${col}"]`;

    root.querySelectorAll(selector).forEach(btn => {
      btn.classList.add('cm-indentation-guide-button_active');
    });
  }

  /** highlight DOM buttons in column `col` for lines in [start, end]  */
  applyHoverClasses(start: number, end: number, col: number) {
    this.clearHoverClasses();
    const root = this.view.dom;
    const selector = `.cm-indentation-guide-button[data-col="${col}"]`;
    root.querySelectorAll(selector).forEach(btn => {
      const lineAttr = btn.parentElement?.dataset.line;
      if (!lineAttr) {
        return;
      }
      const ln = Number(lineAttr);
      if (ln >= start && ln <= end) {
        if (this.highlightHoveredGuide) {
          btn.classList.add('cm-indentation-guide-button_hover');
        }
        if (this.highlightHoveredBlock) {
          this.applyBackgroundHighlight(ln, col, 'hover');
        }
      }
    });
    this.hoveredGuide = { col, start, end };
  }

  applyBackgroundHighlight(
    lineNumber: number,
    col: number,
    type: 'active' | 'hover'
  ) {
    const root = this.view.dom;
    const selector = `.cm-indentation-guide[data-line="${lineNumber}"] > .cm-indentation-guide-button[data-col="${col}"]`;

    const button = root.querySelector<HTMLButtonElement>(selector);
    if (!button) {
      return;
    }

    let highlightLeft = button.offsetLeft;
    let btnWidth = button.offsetWidth;

    const highlightBackgroundSelector = `.cm-indentation-guide[data-line="${lineNumber}"] > .cm-indentation-guide-background-highlight`;
    const backgroundDiv = root.querySelector<HTMLElement>(
      highlightBackgroundSelector
    );
    if (!backgroundDiv) {
      return;
    }

    backgroundDiv.style.setProperty(
      `--indentation-guide-background-highlight-${type}-left`,
      `${highlightLeft}px`
    );
    backgroundDiv.style.setProperty(
      `--indentation-guide-background-highlight-${type}-width`,
      `${this.viewContentWidth - (highlightLeft ?? 0) - (btnWidth ?? 0) / 2}px`
    );
    backgroundDiv.classList.add(
      `cm-indentation-guide-background-highlight_${type}`
    );
  }

  clearHoverClasses() {
    if (this.hoveredGuide?.col === null) {
      return;
    }

    const dom = this.view.dom;

    dom
      .querySelectorAll('.cm-indentation-guide-button_hover')
      .forEach(el => el.classList.remove('cm-indentation-guide-button_hover'));
    this.hoveredGuide = null;

    dom
      .querySelectorAll<HTMLElement>(
        '.cm-indentation-guide-background-highlight'
      )
      .forEach(el => {
        el.classList.remove('cm-indentation-guide-background-highlight_hover');
      });
  }
}

export const indentationGuidesPlugin = ViewPlugin.fromClass(
  IndentationViewPlugin,
  {
    decorations: v => v.decorations,

    eventHandlers: {
      mousemove: (e, view) => {
        const { highlightHoveredMarker, highlightHoveredBlockBackground } =
          view.state.facet(indentationGuidesConfig);
        if (!highlightHoveredMarker && !highlightHoveredBlockBackground) {
          return;
        }

        const plugin = view.plugin(indentationGuidesPlugin);
        if (!plugin) {
          return;
        }

        const target = (e.target as HTMLElement).closest(
          '.cm-indentation-guide-button'
        ) as HTMLElement | null;
        if (target) {
          handleGuideHover(target, plugin);
        } else {
          plugin.clearHoverClasses();
        }
      },

      mouseout: (e, view) => {
        const { highlightHoveredMarker, highlightHoveredBlockBackground } =
          view.state.facet(indentationGuidesConfig);
        if (!highlightHoveredMarker && !highlightHoveredBlockBackground) {
          return;
        }

        // When pointer leaves the widget area completely — clear hover
        const related = e.relatedTarget as HTMLElement | null;
        if (
          !related ||
          !related.closest ||
          !related.closest('.cm-indentation-guide')
        ) {
          const plugin = view.plugin(indentationGuidesPlugin);
          plugin?.clearHoverClasses();
        }
      },

      mousedown: (e, view) => {
        const { foldBlockOnClick } = view.state.facet(indentationGuidesConfig);
        if (!foldBlockOnClick) {
          return;
        }

        const target = (e.target as HTMLElement).closest(
          '.cm-indentation-guide-button'
        ) as HTMLElement | null;
        if (!target) {
          return false;
        }

        e.preventDefault(); // prevent editor caret move

        const lineAttr = target.parentElement?.dataset.line;
        const colAttr = target.dataset.col;
        if (!lineAttr || !colAttr) {
          return false;
        }
        const plugin = view.plugin(indentationGuidesPlugin);
        if (!plugin) {
          return false;
        }
        const lineNumber = Number(lineAttr);
        const col = Number(colAttr);

        const lines = getAllLines(view);
        const map = getNewIndentationMap(view.state, lines);
        const lineLevels = new Map<number, number>();
        for (const line of lines) {
          const entry = map.get(line.number);
          const level = entry?.level ?? 0;
          lineLevels.set(line.number, level);
        }
        plugin.lineLevels = lineLevels;

        const { start } = plugin.computeBlockRange(lineNumber, col);
        const range = getNearestFoldRange(view, start - 1);
        if (!range) {
          return;
        }

        toggleFoldRange(view, range);
        return true;
      },
    },
  }
);
