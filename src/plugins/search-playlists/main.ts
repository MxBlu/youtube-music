import { SearchPlaylistsRenderProperties } from '.';

export const renderer: SearchPlaylistsRenderProperties = {
  start: function (): void {
    // Trigger the page change to start with - in case we are already on the search page
    this.onBrowsePageChange();
    // Start a MutationObserver to watch for a playlist page being loaded
    this.observer = new MutationObserver(() => this.onBrowsePageChange());
    this.observer.observe(
      document.querySelector(
        'ytmusic-browse-response #content-wrapper > #contents',
      )!,
      {
        attributes: false,
        childList: true,
        subtree: false,
      },
    );
  },

  stop: function (): void {
    this.observer?.disconnect();
    this.entriesObserver?.disconnect();
  },

  onBrowsePageChange: function (): void {
    // Only proceed when we have an actual playlist
    const playlistRenderer = document.querySelector<HTMLElement>(
      'ytmusic-playlist-shelf-renderer',
    );
    if (!playlistRenderer) {
      return;
    }

    // If an existing observer exists, clean it up first
    if (this.entriesObserver) {
      this.entriesObserver?.disconnect();
      this.entriesObserver = undefined;
    }

    // Search element container
    const headerEndItems = playlistRenderer.querySelector('#end-items')!;
    const searchFilterItems = document.createElement('div');
    searchFilterItems.classList.add('search-filter-container');
    // Search filter box
    const searchBoxContainer = document.createElement('div');
    searchBoxContainer.classList.add('filter-search-box');
    const searchBox = document.createElement('input');
    searchBox.placeholder = 'Filter songs...';
    searchBoxContainer.append(searchBox);
    searchFilterItems.append(searchBoxContainer);
    // Search select all checkbox
    const selectAllContainer = document.createElement('div');
    selectAllContainer.classList.add('filter-search-selectall');
    const selectAll = document.createElement('input');
    selectAll.type = 'checkbox';
    selectAllContainer.append(selectAll);
    searchFilterItems.append(selectAllContainer);

    headerEndItems.append(searchFilterItems);

    // Create function to filter playlist entries by the filter value
    function filterValues() {
      const start = performance.now();
      // Iterate over all entries and set the display style on the matching
      // entries to 'flex', and 'none' for unmatching entries
      const filterValue = searchBox.value.toLowerCase();
      for (const entry of playlistRenderer!.querySelectorAll<
        HTMLElement & { filtered: boolean }
      >('ytmusic-responsive-list-item-renderer')) {
        if (entry.textContent?.toLowerCase().includes(filterValue)) {
          entry.style.display = 'flex';
        } else {
          entry.style.display = 'none';
        }
      }
      const time = performance.now() - start;
      console.log(`Filtering playlist entries: took ${time.toFixed(2)}ms`);
    }

    // Create function to select/unselect all displayed entries
    function toggleSelectAll() {
      const start = performance.now();
      // Iterate over all entries and set the display style on the matching
      // entries to 'flex', and 'none' for unmatching entries
      const shouldSelectAll = selectAll.checked;
      for (const entry of playlistRenderer!.querySelectorAll<
        HTMLElement & { filtered: boolean }
      >('ytmusic-responsive-list-item-renderer')) {
        if (['', 'flex'].includes(entry.style.display)) {
          entry
            .querySelector<HTMLElement>(
              `yt-checkbox-renderer[aria-checked=${!shouldSelectAll}] > yt-icon`,
            )
            ?.click();
          console.log(
            `Toggling entry: ${entry.querySelector('.title')!.textContent}`,
          );
        }
      }
      const time = performance.now() - start;
      console.log(`Toggle select all entries: took ${time.toFixed(2)}ms`);
    }

    // When the search box is modified, filter the entries in the playlist
    searchBox.addEventListener(
      'input',
      debounce(() => {
        selectAll.checked = false;
        filterValues();
      }, 250),
    );
    // Handle select all checkbox
    selectAll.addEventListener('change', toggleSelectAll);

    // Setup a MutationObserver to re-filter once there are new results
    this.entriesObserver = new MutationObserver(() => {
      // Only filter if there is a filter to search by
      if (searchBox.value) {
        filterValues();
      }
    });
    this.entriesObserver.observe(playlistRenderer.querySelector('#contents')!, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  },
};

/**
 * Debounce a function to delay execution
 * @param callback Function to call after debouncing
 * @param wait Duration to wait before executing the function
 * @returns Debounced function
 */
function debounce(callback: () => void, wait: number) {
  let timeoutId: number;
  return () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback();
    }, wait);
  };
}
