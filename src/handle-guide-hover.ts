import { IndentationViewPlugin } from './indentation-view-plugin';

export function handleGuideHover(
  guideElement: HTMLElement,
  plugin: IndentationViewPlugin
) {
  if (!guideElement || !plugin) {
    return;
  }

  const lineAttr = guideElement.parentElement?.dataset.line;
  const colAttr = guideElement.dataset.col;
  if (!lineAttr || !colAttr) {
    plugin.clearHoverClasses();
    return;
  }

  const lineNumber = Number(lineAttr);
  const col = Number(colAttr);

  // avoid recomputing the same hover
  if (
    plugin.hoveredGuide?.col === col &&
    plugin.hoveredGuide?.start !== null &&
    lineNumber >= plugin.hoveredGuide?.start &&
    lineNumber <= plugin.hoveredGuide?.end
  ) {
    return;
  }

  const { start, end } = plugin.computeBlockRange(lineNumber, col);
  plugin.applyHoverClasses(start, end, col);
}
