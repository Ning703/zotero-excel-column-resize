"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "bootstrap.js"), "utf8");
const context = vm.createContext({
  APP_SHUTDOWN: 2,
  Zotero: {
    rtl: false,
    debug() {},
    Promise: { delay: () => Promise.resolve() },
    getMainWindows: () => [],
    initializationPromise: Promise.resolve()
  },
  Map,
  Number,
  Array,
  Promise
});
vm.runInContext(source, context, { filename: "bootstrap.js" });

function column(dataKey, ordinal, fixedWidth = false) {
  return { dataKey, ordinal, fixedWidth };
}

function makeWindow(columns, originalResult) {
  const tree = {
    props: { id: "item-tree-main-default" },
    state: { resizing: 2 },
    _getVisibleColumns: () => columns,
    _getResizeColumns: () => originalResult
  };
  return { ZoteroPane: { itemsView: { tree } }, tree };
}

function keys(result) {
  return Array.from(result, (c) => c.dataKey).join(",");
}

{
  const columns = [column("a", 0), column("b", 1), column("c", 2), column("d", 3)];
  const win = makeWindow(columns, [columns[1], columns[2], columns[1]]);
  assert.equal(context.patchWindow(win), true);
  const result = win.tree._getResizeColumns(2);
  assert.equal(keys(result), "b,d,b");
  context.restoreWindow(win);
  assert.equal(keys(win.tree._getResizeColumns(2)), "b,c,b");
}

{
  const columns = [column("a", 0), column("b", 1), column("c", 2), column("icon", 3, true)];
  const win = makeWindow(columns, [columns[1], columns[2], columns[1]]);
  context.patchWindow(win);
  const result = win.tree._getResizeColumns(2);
  assert.equal(keys(result), "b,c,b");
}

{
  const columns = [column("a", 0), column("b", 1), column("icon", 2, true)];
  const originalResult = [columns[0], columns[1], columns[0]];
  const win = makeWindow(columns, originalResult);
  context.patchWindow(win);
  const result = win.tree._getResizeColumns(2);
  assert.equal(keys(result), keys(originalResult));
}

{
  const columns = [column("a", 0), column("b", 1), column("c", 2)];
  const win = makeWindow(columns, [columns[0], columns[1], columns[0]]);
  context.Zotero.rtl = true;
  context.patchWindow(win);
  const result = win.tree._getResizeColumns(1);
  assert.equal(keys(result), "a,b,a");
  context.Zotero.rtl = false;
}

{
  const tree = { props: { id: "advanced-search" }, _getResizeColumns() {} };
  const win = { ZoteroPane: { itemsView: { tree } } };
  assert.equal(context.patchWindow(win), false);
}

{
  const columns = [column("a", 0), column("b", 1), column("c", 2)];
  const win = makeWindow(columns, [columns[0], columns[1], columns[0]]);
  win.tree.props.id = "item-tree-main-feeds";
  assert.equal(context.patchWindow(win), true);
  assert.equal(keys(win.tree._getResizeColumns(1)), "a,c,a");
}

console.log("All column resize policy tests passed.");
