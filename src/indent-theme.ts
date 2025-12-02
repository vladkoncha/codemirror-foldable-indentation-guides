import { EditorView } from '@codemirror/view';
import { IndentationGuidesConfiguration } from './config';

export function indentTheme(
  colorOptions: IndentationGuidesConfiguration['colors']
) {
  const defaultColors = {
    light: '#F0F1F2',
    dark: '#2B3245',
    activeLight: '#E4E5E6',
    activeDark: '#3C445C',
    hoverLight: '#E4E5E6',
    hoverDark: '#3C445C',
    backgroundLight: '#e4e5e630',
    backgroundDark: '#3c445c30',
    backgroundHoverLight: '#e4e5e630',
    backgroundHoverDark: '#3c445c30',
  };

  let colors = defaultColors;
  if (colorOptions) {
    colors = { ...defaultColors, ...colorOptions };
  }

  return EditorView.baseTheme({
    '&light': {
      '--indent-marker-bg-color': colors.light,
      '--indent-marker-active-bg-color': colors.activeLight,
      '--indent-marker-hover-bg-color': colors.hoverLight,
      '--indent-background-highlight-color': colors.backgroundLight,
      '--indent-background-highlight-hover-color': colors.backgroundHoverLight,
    },

    '&dark': {
      '--indent-marker-bg-color': colors.dark,
      '--indent-marker-active-bg-color': colors.activeDark,
      '--indent-marker-hover-bg-color': colors.hoverDark,
      '--indent-background-highlight-color': colors.backgroundDark,
      '--indent-background-highlight-hover-color': colors.backgroundHoverDark,
    },

    '.cm-line': {
      position: 'relative',
    },

    '.cm-indentation-guide': {
      position: 'absolute',
      display: 'inline-block',
      height: '100%',
    },

    '.cm-indentation-guide-button': {
      '--border-width': '1px',
      '--border-active-width': '1px',
      '--border-hover-width': '1px',
      '--additional-padding': '0px',
      border: '0',
      padding: '0 var(--additional-padding)',
      position: 'absolute',
      background: 'transparent',
      height: '100%',
      display: 'inline-block',
      outline: 'none',
      'font-size': 'inherit',
      'font-family': 'inherit',
    },

    '.cm-indentation-guide-button:first-child': {
      'padding-left': '0',
    },

    '.cm-indentation-guide-button::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: 'var(--additional-padding)',
      height: '100%',
      display: 'inline-block',
      'font-size': 'inherit',
      'border-left': 'var(--border-width) solid var(--indent-marker-bg-color)',
    },

    '.cm-indentation-guide-button:first-child::before': {
      left: '0',
    },

    '.cm-indentation-guide-button_active::before': {
      'border-left':
        'var(--border-active-width) solid var(--indent-marker-active-bg-color)',
    },

    '.cm-indentation-guide-button_hover::before': {
      'border-left':
        'var(--border-hover-width) solid var(--indent-marker-hover-bg-color)',
    },

    '.cm-indentation-guide-background-highlight': {
      '--indentation-guide-background-highlight-active-width': '0',
      '--indentation-guide-background-highlight-active-left': '0',
      '--indentation-guide-background-highlight-hover-width': '0',
      '--indentation-guide-background-highlight-hover-left': '0',

      position: 'absolute',
      top: '0',
      left: '0',
      opacity: '0',
      height: '100%',
      'pointer-events': 'none',
      'font-size': 'inherit',
      'z-index': '-1',
      background: 'var(--indent-background-highlight-color)',
    },

    '.cm-indentation-guide-background-highlight_active': {
      opacity: '1',
      left: 'var(--indentation-guide-background-highlight-active-left)',
      width: 'var(--indentation-guide-background-highlight-active-width)',
    },

    '.cm-indentation-guide-background-highlight_hover': {
      opacity: '1',
      left: 'var(--indentation-guide-background-highlight-hover-left)',
      width: 'var(--indentation-guide-background-highlight-hover-width)',
      background: 'var(--indent-background-highlight-hover-color)',
    },
  });
}
