import {
  indentationGuidesConfig,
  IndentationGuidesConfiguration,
} from './config';
import { indentTheme } from './indent-theme';
import { indentationGuidesPlugin } from './indentation-view-plugin';

export function foldableIndentationGuides(
  config: IndentationGuidesConfiguration = {}
) {
  return [
    indentationGuidesConfig.of(config),
    indentTheme(config.colors),
    indentationGuidesPlugin,
  ];
}
