# @pipeworx/mcp-wikifeed

MCP server for Wikipedia featured content and daily feeds

## Tools

| Tool | Description |
|------|-------------|
| `on_this_day` | Historical events, births, deaths, and holidays for a given month/day |
| `featured_article` | Wikipedia's featured article for a given date |
| `most_read` | Most-read Wikipedia articles for a given date |
| `picture_of_day` | Wikipedia's picture of the day for a given date |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "on_this_day",
      "arguments": { "month": "07", "day": "04" }
    }
  }'
```

## License

MIT
