# MCP Server Setup Guide — AI + Systems Thinking Course

This guide helps instructors and students install the two MCP servers that provide hands-on Claude tools for the course.

---

## Prerequisites

- **Python 3.10+** installed
- **pip** package manager
- **Claude Desktop** or **Claude Code** (CLI)

## Step 1: Install Dependencies

```bash
pip install "mcp[cli]" pydantic
```

## Step 2: Locate the Server Files

The MCP server files are in `Cubelets MCP Tool/files/`:

- `week1_foundations_mcp_server.py` — Week 1 tools
- `cubelets_mcp_server.py` — Week 2-3 tools

Copy these files to a permanent location on your machine (e.g., `C:\mcp-servers\` or `~/mcp-servers/`).

## Step 3: Configure Claude Desktop

Open Claude Desktop settings and edit the MCP configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` section:

```json
{
  "mcpServers": {
    "week1-foundations": {
      "command": "python",
      "args": ["C:/path/to/week1_foundations_mcp_server.py"]
    },
    "systems-thinking-cubelets": {
      "command": "python",
      "args": ["C:/path/to/cubelets_mcp_server.py"]
    }
  }
}
```

Replace `C:/path/to/` with the actual path where you placed the server files.

## Step 4: Restart Claude Desktop

Close and reopen Claude Desktop. You should see the MCP tools available in your tool list.

## Available Tools

### Week 1 Foundations Server
| Tool | Used In | What It Does |
|------|---------|--------------|
| `analyze_system_map` | W1-C1 | Validate system maps, detect feedback loops |
| `find_ai_leverage` | W1-C2 | Score AI placement in business workflows |
| `analyze_workflow_redesign` | W1-C3 | Compare tool-first vs AI-first workflows |

### Systems Thinking Cubelets Server
| Tool | Used In | What It Does |
|------|---------|--------------|
| `score_reinforcing_loops` | ST-001 | Classify feedback loops in CLDs |
| `compare_interventions` | ST-002 | Rank interventions using Meadows hierarchy |
| `detect_burden_shift` | ST-003 | Detect Shifting the Burden archetype |

## Troubleshooting

- **"Module not found" error:** Run `pip install "mcp[cli]" pydantic` again
- **Server not appearing:** Check the file path in your config — use forward slashes even on Windows
- **Python not found:** Ensure Python is in your system PATH, or use the full path (e.g., `C:/Python310/python.exe`)

## Testing

Run the test suite to verify the servers work:

```bash
cd "Cubelets MCP Tool/files"
python -m pytest test_*.py -v
```

---

Questions? Contact Ricco Wilson — Ricco.Wilson@gmail.com
