# Zotero 类 Excel 列宽调整

[English](README.md)

这是一个针对 Zotero 10 的小型插件，仅修正文库主窗口中央条目列表的列宽拖动方式，使其更接近 Microsoft Excel。

## 行为

拖动两列之间的分隔线时：

- 分隔线左侧的目标列改变宽度；
- 目标列与最右侧可调整列之间的列保持原宽度；
- 最右侧可调整列吸收相反方向的宽度变化；
- 最右侧列达到 Zotero 原有的最小宽度后，目标列不能继续变宽；
- Zotero 原有的列宽保存机制保持不变。

如果最右侧可见列是固定宽度的图标列，插件会从右向左寻找最后一个可调整列。

## 作用范围

插件只修改主窗口中央条目列表（内部 ID：`item-tree-main-*`），不会影响：

- 高级搜索；
- 首选项及其他对话框；
- PDF/EPUB 阅读器；
- 其他插件创建的表格。

RTL（从右向左）界面会保留 Zotero 原有行为。

## 兼容性

- Zotero 10.0.x
- 开发时核对版本：Zotero 10.0.6（Windows 64 位）

本插件使用 Zotero 的内部表格方法，因此后续 Zotero 版本若更改内部实现，插件可能需要更新。清单文件把兼容范围限制为 `10.0.*`，避免未经验证地加载到更高版本。

## 安装

1. 从[最新发布页面](https://github.com/Ning703/zotero-excel-column-resize/releases/latest)下载 `.xpi` 文件。
2. 在 Zotero 中打开“工具 → 插件”。
3. 点击右上角齿轮，选择“Install Plugin From File…”（从文件安装插件）。
4. 选择下载的 `.xpi` 文件。

在插件窗口中禁用或移除本插件即可恢复 Zotero 原有列宽逻辑。插件不会修改文库数据，也不会修改 Zotero 安装目录中的文件。

## 开发与测试

需要 Node.js；打包需要 PowerShell 7 或更高版本。

```powershell
node --check bootstrap.js
node test/test.js
pwsh -File scripts/build.ps1
```

生成的安装包位于 `dist/`。贡献方式参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE)
