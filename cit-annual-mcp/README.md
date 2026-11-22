# cit-annual-mcp

企业所得税年度汇算清缴 MCP **最小闭环**（v1）。

- 画像：一般企业、非跨地区、无境外所得
- 选表规则：`annual-cit-form-selection-logic.md` **v0.2**（硬约束）
  - 小微：`A101010` / `A102010` / `A104000` **一律 skipped**（禁止 `optional_filled`）
  - `A106000` **仅** `needs_loss_schedule` 时 required
  - 高新证书所属期有效 → `A107041` 一律 required
  - 研发/捐赠问询为 false → `A107012` / `A105070` skipped
- `fill_return` 仅为骨架 stub，**不声称**已完整填好所有行次

## 目录

```
cit-annual-mcp/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # MCP stdio server
│   ├── cli.ts            # fixture 本地跑通
│   ├── select-forms.ts   # 选表引擎
│   ├── fill-return.ts    # 填表 stub
│   ├── signals.ts
│   ├── store.ts
│   ├── tools.ts
│   └── types.ts
└── fixtures/
    ├── scenario-a-small-micro/     # 小微·无研发·无捐赠
    └── scenario-b-non-small-micro/ # 非小微·有研发·有捐赠
```

## 安装

需要 Node.js ≥ 18。

```bash
cd cit-annual-mcp
npm install
npm run build
```

## 本地跑一条 fixture（推荐验收）

```bash
cd cit-annual-mcp
npm install

# 场景 A：小微 · 无研发 · 无捐赠
npm run fixture -- scenario-a-small-micro

# 场景 B：非小微 · 有研发 · 有捐赠
npm run fixture -- scenario-b-non-small-micro

# 两个都跑
npm run test:fixtures
```

期望：退出码 0；场景 A 中三明细 + A107012 + A105070 + A106000 为 `skipped`；场景 B 中三明细 + A107012 + A105070 + A106000 为 `required`。

## MCP Tools

| Tool | 作用 |
| --- | --- |
| `ingest_books` | 导入 8 张强制结构化表（JSON） |
| `set_inquiry_answers` | 写入问询答案 |
| `ask_gaps` | 缺口问询 stub |
| `select_forms` | 核心：每表 `status` + 中文 `reason` |
| `fill_return` | 仅对 required/optional_filled 返回骨架 |
| `export_selection` | 导出 `form_selection_result` |

流水线：`ingest_books` → `set_inquiry_answers` → `select_forms` → `fill_return` / `export_selection`。

## 在 Cursor 里挂 MCP

在 Cursor MCP 配置（如 `~/.cursor/mcp.json` 或项目 `.cursor/mcp.json`）加入：

```json
{
  "mcpServers": {
    "cit-annual": {
      "command": "node",
      "args": ["/绝对路径/cursortest/cit-annual-mcp/dist/index.js"],
      "cwd": "/绝对路径/cursortest/cit-annual-mcp"
    }
  }
}
```

开发态也可用 `tsx`（无需先 build）：

```json
{
  "mcpServers": {
    "cit-annual": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/绝对路径/cursortest/cit-annual-mcp"
    }
  }
}
```

重启 Cursor MCP 后，即可在对话里调用上述 tools。

## 范围说明

本包只实现选表闭环 + 填表骨架。行次公式、勾稽验收、黄金样例对照不在 v1 最小闭环内。
