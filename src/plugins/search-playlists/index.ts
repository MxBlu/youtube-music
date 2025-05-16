import { createPlugin } from '@/utils';
import { renderer } from './main';
import style from './style.css?inline';

export interface SearchPlaylistsPluginConfig {
  enabled: boolean;
}

export interface SearchPlaylistsRenderProperties {
  observer?: MutationObserver;
  entriesObserver?: MutationObserver;
  onBrowsePageChange(): void;
  start(): void;
  stop(): void;
}

export const defaultConfig: SearchPlaylistsPluginConfig = {
  enabled: false,
};

export default createPlugin<null, null, SearchPlaylistsRenderProperties>({
  name: () => 'Search Playlists',
  description: () => 'Search Playlists',
  stylesheets: [style],
  restartNeeded: false,
  config: defaultConfig,
  renderer: renderer,
});
