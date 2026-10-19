# Contributing

Bug reports and pull requests are welcome.

Please include the Zotero version, operating system, visible column layout, and exact divider being dragged in bug reports. Confirm that the problem occurs in the main library item list rather than Advanced Search or another dialog.

Before submitting code, run:

```powershell
node --check bootstrap.js
node test/test.js
pwsh -File scripts/build.ps1
```

Keep changes narrowly scoped. In particular, do not patch Zotero's global `VirtualizedTable` prototype: the intended target is only `window.ZoteroPane.itemsView.tree` with an `item-tree-main-*` ID.
