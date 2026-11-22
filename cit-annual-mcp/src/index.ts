#!/usr/bin/env node
/**
 * 企业所得税年度汇算 MCP server（最小闭环 v1）
 * Tools: ingest_books, set_inquiry_answers, ask_gaps, select_forms, fill_return, export_selection
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  toolAskGapsStub,
  toolExportSelection,
  toolFillReturn,
  toolIngestBooks,
  toolSelectForms,
  toolSetInquiryAnswers,
} from "./tools.js";
import type { BooksPayload, InquiryAnswers } from "./types.js";

const server = new Server(
  {
    name: "cit-annual-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ingest_books",
      description:
        "导入年度汇算结构化账簿/台账（科目余额表、利润表、资产台账、薪酬、亏损、预缴、研发辅助账、捐赠清单）。",
      inputSchema: {
        type: "object",
        properties: {
          books: {
            type: "object",
            description: "BooksPayload：八张强制表的行数组",
          },
          taxpayer_id: {
            type: "string",
            description: "可选纳税人识别号",
          },
        },
        required: ["books"],
      },
    },
    {
      name: "set_inquiry_answers",
      description:
        "写入/更新 inquiry_answers（所属期、小微、研发加计、捐赠、高新等问询开关）。",
      inputSchema: {
        type: "object",
        properties: {
          answers: {
            type: "object",
            description: "InquiryAnswers JSON 对象",
          },
        },
        required: ["answers"],
      },
    },
    {
      name: "ask_gaps",
      description: "缺口问询 stub：检查会话中是否缺 books/inquiry 关键字段。",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "select_forms",
      description:
        "按 form-selection-logic v0.2 判定填报表单；每表输出 status + 中文 reason。严格执行：小微禁止 A101010/A102010/A104000；A106000 仅 needs_loss_schedule；高新期内一律 A107041；研发/捐赠问询 false 则对应表 skipped。",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "fill_return",
      description:
        "填表 stub：仅对 status∈{required,optional_filled} 返回骨架行，不声称完整行次已填好。",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "export_selection",
      description: "导出当前 form_selection_result（JSON）。",
      inputSchema: {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["json"],
            description: "导出格式，当前仅 json",
          },
        },
      },
    },
  ],
}));

function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = (request.params.arguments ?? {}) as Record<string, unknown>;

  try {
    switch (name) {
      case "ingest_books":
        return jsonResult(
          toolIngestBooks({
            books: args.books as BooksPayload,
            taxpayer_id: (args.taxpayer_id as string | null | undefined) ?? null,
          })
        );
      case "set_inquiry_answers":
        return jsonResult(
          toolSetInquiryAnswers({
            answers: args.answers as InquiryAnswers,
          })
        );
      case "ask_gaps":
        return jsonResult(toolAskGapsStub());
      case "select_forms":
        return jsonResult(toolSelectForms());
      case "fill_return":
        return jsonResult(toolFillReturn());
      case "export_selection":
        return jsonResult(
          toolExportSelection({
            format: (args.format as "json" | undefined) ?? "json",
          })
        );
      default:
        return jsonResult({ ok: false, error: `未知 tool: ${name}` });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text" as const, text: message }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
