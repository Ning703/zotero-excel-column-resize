/*
 * Excel-like Column Resize for Zotero 10.0
 *
 * This bootstrap plugin patches only the VirtualizedTree instance owned by
 * ZoteroPane.itemsView (the centre item list in the main library window).
 * It does not patch the VirtualizedTable class or any search/dialog tables.
 */

"use strict";

const ADDON_NAME = "Excel-like Column Resize";
const MAIN_TREE_ID = "item-tree-main";
const READY_RETRY_COUNT = 300;
const READY_RETRY_DELAY_MS = 100;

let isRunning = false;
let startupGeneration = 0;
const patchedWindows = new Map();

function install() {}

async function startup() {
  isRunning = true;
  startupGeneration++;
  await Zotero.initializationPromise;

  for (const window of Zotero.getMainWindows()) {
    void attachWhenReady(window, startupGeneration);
  }
}

function onMainWindowLoad({ window }) {
  void attachWhenReady(window, startupGeneration);
}

function onMainWindowUnload({ window }) {
  restoreWindow(window);
}

function shutdown(_data, reason) {
  isRunning = false;
  startupGeneration++;

  if (reason === APP_SHUTDOWN) {
    return;
  }

  for (const window of Array.from(patchedWindows.keys())) {
    restoreWindow(window);
  }
}

function uninstall() {}

async function attachWhenReady(window, generation) {
  for (let attempt = 0; attempt < READY_RETRY_COUNT; attempt++) {
    if (!isRunning || generation !== startupGeneration || window.closed) {
      return;
    }

    if (patchWindow(window)) {
      return;
    }

    await Zotero.Promise.delay(READY_RETRY_DELAY_MS);
  }

  Zotero.debug(`${ADDON_NAME}: main item tree was not available`, 2);
}

function patchWindow(window) {
  const tree = window.ZoteroPane?.itemsView?.tree;
  const treeID = tree?.props?.id;
  const isMainItemTree = treeID === MAIN_TREE_ID || treeID?.startsWith(`${MAIN_TREE_ID}-`);
  if (!tree || !isMainItemTree || typeof tree._getResizeColumns !== "function") {
    return false;
  }

  const existing = patchedWindows.get(window);
  if (existing?.tree === tree) {
    return true;
  }
  if (existing) {
    restoreWindow(window);
  }

  const originalGetResizeColumns = tree._getResizeColumns;

  tree._getResizeColumns = function (index) {
    const originalResult = originalGetResizeColumns.call(this, index);

    // Preserve Zotero's behavior if this drag cannot be resized, and avoid
    // changing behavior in right-to-left layouts in this initial release.
    if (!originalResult || Zotero.rtl) {
      return originalResult;
    }

    const [leftColumn, _originalRightColumn, resizingColumn] = originalResult;
    const visibleColumns = this._getVisibleColumns().slice().sort((a, b) => a.ordinal - b.ordinal);
    const boundaryIndex = typeof index === "number" ? index : this.state.resizing;

    if (!Number.isInteger(boundaryIndex) || boundaryIndex <= 0 || boundaryIndex >= visibleColumns.length) {
      return originalResult;
    }

    // The absorber must be to the right of the dragged divider. Work backwards
    // so the rightmost resizable visible column absorbs the delta. Fixed-width
    // icon/status columns are skipped exactly as Zotero skips them natively.
    let absorberColumn = null;
    for (let i = visibleColumns.length - 1; i >= boundaryIndex; i--) {
      const candidate = visibleColumns[i];
      if (!candidate.fixedWidth && candidate.dataKey !== leftColumn.dataKey) {
        absorberColumn = candidate;
        break;
      }
    }

    if (!absorberColumn) {
      return originalResult;
    }

    return [leftColumn, absorberColumn, resizingColumn];
  };

  patchedWindows.set(window, { tree, originalGetResizeColumns });
  Zotero.debug(`${ADDON_NAME}: patched ${treeID}`);
  return true;
}

function restoreWindow(window) {
  const patch = patchedWindows.get(window);
  if (!patch) {
    return;
  }

  if (patch.tree?._getResizeColumns) {
    patch.tree._getResizeColumns = patch.originalGetResizeColumns;
  }
  patchedWindows.delete(window);
  Zotero.debug(`${ADDON_NAME}: restored ${MAIN_TREE_ID}`);
}
