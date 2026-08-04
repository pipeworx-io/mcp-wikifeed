# mcp-wikifeed

Wikifeed MCP — wraps Wikimedia Feed API (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `on_this_day` | Get historical events, births, deaths, and holidays that occurred on a given month and day across all years. |
| `featured_article` | Get Wikipedia's featured article for a specific date. |
| `most_read` | Get the most-read Wikipedia articles for a specific date. |
| `picture_of_day` | Get Wikipedia's picture of the day for a specific date, including title, description, and image URL. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "wikifeed": {
      "url": "https://gateway.pipeworx.io/wikifeed/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Wikifeed data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
