import { Facet, combineConfig } from '@codemirror/state';

export interface IndentationGuidesConfiguration {
  /**
   * Determines whether active block marker is styled differently.
   */
  highlightActiveMarker?: boolean;

  /**
   * Determines whether hovered block marker is styled differently.
   */
  highlightHoveredMarker?: boolean;

  /**
   * Determines whether to change background color of line from active block.
   */
  highlightActiveBlockBackground?: boolean;

  /**
   * Determines whether to change background color of line from hovered block.
   */
  highlightHoveredBlockBackground?: boolean;

  /**
   * Determines whether block markers are foldable.
   */
  foldBlockOnClick?: boolean;

  /**
   * Determines whether markers in the first column are omitted.
   */
  hideFirstIndent?: boolean;

  /**
   * Determines the type of indentation marker.
   */
  markerType?: 'fullScope' | 'codeOnly';

  /**
   * Determines the thickness of marker (in pixels).
   */
  thickness?: number;

  /**
   * Determines the thickness of active marker (in pixels).
   *
   * If undefined or null, then regular thickness will be used.
   */
  activeThickness?: number;

  /**
   * Determines the thickness of hovered marker (in pixels).
   *
   * If undefined or null, then regular thickness will be used.
   */
  hoverThickness?: number;

  /**
   * Determines the additional padding for each left and right side of marker button for more clickable and hoverable area (in pixels).
   */
  additionalPadding?: number;

  /**
   * Determines the color of marker.
   */
  colors?: {
    /**
     * Color of inactive indent markers when using a light theme.
     */
    light?: string;

    /**
     * Color of inactive indent markers when using a dark theme.
     */
    dark?: string;

    /**
     * Color of active indent markers when using a light theme.
     */
    activeLight?: string;

    /**
     * Color of active indent markers when using a dark theme.
     */
    activeDark?: string;

    /**
     * Color of hovered indent markers when using a light theme.
     */
    hoverLight?: string;

    /**
     * Color of hovered indent markers when using a light theme.
     */
    hoverDark?: string;

    /**
     * Color of active background when using a light theme.
     */
    backgroundLight?: string;

    /**
     * Color of active background when using a dark theme.
     */
    backgroundDark?: string;

    /**
     * Color of hovered background when using a light theme.
     */
    backgroundHoverLight?: string;

    /**
     * Color of hovered background when using a dark theme.
     */
    backgroundHoverDark?: string;
  };
}

export const indentationGuidesConfig = Facet.define<
  IndentationGuidesConfiguration,
  Required<IndentationGuidesConfiguration>
>({
  combine(configs) {
    return combineConfig(configs, {
      foldBlockOnClick: true,
      highlightHoveredMarker: true,
      highlightActiveMarker: true,
      highlightActiveBlockBackground: true,
      highlightHoveredBlockBackground: true,
      hideFirstIndent: false,
      markerType: 'fullScope',
      thickness: 1,
      additionalPadding: 0,
    });
  },
});
