# Excel-like Column Resize for Zotero

[简体中文](README.zh-CN.md)

A focused Zotero 10 plugin that makes column resizing in the main library item list behave more like Microsoft Excel.

When a divider is dragged, the column on its left changes width, the intervening columns keep their widths, and the rightmost resizable visible column absorbs the opposite change.

## Scope

The plugin patches only the central item list in Zotero's main library window (`item-tree-main-*`). It does **not** affect:

- Advanced Search;
- Preferences or other dialogs;
- PDF/EPUB readers;
- tables created by other plugins.

Fixed-width icon/status columns are skipped when choosing the rightmost absorber column. Right-to-left interfaces keep Zotero's original behavior.

## Compatibility

- Zotero 10.0.x
- Checked against Zotero 10.0.6 on 64-bit Windows

The plugin relies on an internal Zotero table method, so later Zotero versions may require an update. Its manifest intentionally limits compatibility to `10.0.*`.

## Installation

1. Download the `.xpi` file from the [latest release](https://github.com/Ning703/zotero-excel-column-resize/releases/latest).
2. In Zotero, open **Tools → Plugins**.
3. Click the gear button and choose **Install Plugin From File…**.
4. Select the downloaded `.xpi` file.

Disable or remove the plugin from the same Plugins window to restore Zotero's original resizing logic. The plugin never modifies library data or Zotero installation files.

## Development

Requirements: Node.js for tests and PowerShell 7+ for packaging.

```powershell
node --check bootstrap.js
node test/test.js
pwsh -File scripts/build.ps1
```

The package is written to `dist/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution notes.

## License

[MIT](LICENSE)

