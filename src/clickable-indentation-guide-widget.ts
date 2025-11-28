import { WidgetType } from '@codemirror/view';

export class ClickableIndentationGuideWidget extends WidgetType {
  constructor(
    readonly indentWidth: number,
    readonly level: number,
    readonly lineNumber: number,
    readonly styles?: {
      thickness?: number;
      activeThickness?: number;
      hoverThickness?: number;
      additionalPadding?: number;
      foldOnClick?: boolean;
      highlightBackground?: boolean;
      hideFirstIndent?: boolean;
    }
  ) {
    super();
  }

  eq(other: ClickableIndentationGuideWidget) {
    return (
      other.level === this.level &&
      other.indentWidth === this.indentWidth &&
      other.lineNumber === this.lineNumber &&
      JSON.stringify(other.styles) === JSON.stringify(this.styles)
    );
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'cm-indentation-guide';
    wrap.dataset.line = String(this.lineNumber);

    for (let i = this.styles?.hideFirstIndent ? 1 : 0; i < this.level; i++) {
      const button = wrap.appendChild(
        document.createElement(this.styles?.foldOnClick ? 'button' : 'div')
      );
      button.className = 'cm-indentation-guide-button';
      button.style.cursor = this.styles?.foldOnClick ? 'pointer' : 'text';
      button.style.setProperty(
        '--border-width',
        `${this.styles?.thickness ?? 1}px`
      );
      button.style.setProperty(
        '--border-active-width',
        `${this.styles?.activeThickness ?? 1}px`
      );
      button.style.setProperty(
        '--border-hover-width',
        `${this.styles?.hoverThickness ?? 1}px`
      );
      button.style.setProperty(
        '--additional-padding',
        `${this.styles?.additionalPadding ?? 0}px`
      );

      button.dataset.col = String(i + 1);

      button.style.left =
        i === 0
          ? '0'
          : `calc(${i * this.indentWidth}ch - var(--additional-padding))`;
    }

    if (this.styles?.highlightBackground) {
      const backgroundHighlight = wrap.appendChild(
        document.createElement('div')
      );
      backgroundHighlight.className =
        'cm-indentation-guide-background-highlight';
    }

    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}
