/**
 * Wikifeed MCP — wraps Wikimedia Feed API (free, no auth)
 *
 * Tools:
 * - on_this_day: Historical events, births, deaths, and holidays for a given month/day
 * - featured_article: Wikipedia's featured article for a given date
 * - most_read: Most-read Wikipedia articles for a given date
 * - picture_of_day: Wikipedia's picture of the day for a given date
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/en';
const HEADERS = { 'User-Agent': 'pipeworx-mcp/1.0' };

const tools: McpToolExport['tools'] = [
  {
    name: 'on_this_day',
    description:
      'Get historical events, births, deaths, and holidays that occurred on a given month and day across all years.',
    inputSchema: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          description: 'Two-digit month number (e.g., "01" for January, "12" for December)',
        },
        day: {
          type: 'string',
          description: 'Two-digit day number (e.g., "01", "15", "31")',
        },
      },
      required: ['month', 'day'],
    },
  },
  {
    name: 'featured_article',
    description: "Get Wikipedia's featured article for a specific date.",
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'string',
          description: 'Four-digit year (e.g., "2024")',
        },
        month: {
          type: 'string',
          description: 'Two-digit month number (e.g., "01", "12")',
        },
        day: {
          type: 'string',
          description: 'Two-digit day number (e.g., "01", "15")',
        },
      },
      required: ['year', 'month', 'day'],
    },
  },
  {
    name: 'most_read',
    description: 'Get the most-read Wikipedia articles for a specific date.',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'string',
          description: 'Four-digit year (e.g., "2024")',
        },
        month: {
          type: 'string',
          description: 'Two-digit month number (e.g., "01", "12")',
        },
        day: {
          type: 'string',
          description: 'Two-digit day number (e.g., "01", "15")',
        },
      },
      required: ['year', 'month', 'day'],
    },
  },
  {
    name: 'picture_of_day',
    description: "Get Wikipedia's picture of the day for a specific date, including title, description, and image URL.",
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'string',
          description: 'Four-digit year (e.g., "2024")',
        },
        month: {
          type: 'string',
          description: 'Two-digit month number (e.g., "01", "12")',
        },
        day: {
          type: 'string',
          description: 'Two-digit day number (e.g., "01", "15")',
        },
      },
      required: ['year', 'month', 'day'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'on_this_day':
      return onThisDay(args.month as string, args.day as string);
    case 'featured_article':
      return featuredArticle(args.year as string, args.month as string, args.day as string);
    case 'most_read':
      return mostRead(args.year as string, args.month as string, args.day as string);
    case 'picture_of_day':
      return pictureOfDay(args.year as string, args.month as string, args.day as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function onThisDay(month: string, day: string) {
  const res = await fetch(`${BASE_URL}/onthisday/all/${month}/${day}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikimedia error: ${res.status}`);

  const data = (await res.json()) as {
    events?: { year: number; text: string; pages?: { title: string }[] }[];
    births?: { year: number; text: string; pages?: { title: string }[] }[];
    deaths?: { year: number; text: string; pages?: { title: string }[] }[];
    holidays?: { text: string; pages?: { title: string }[] }[];
  };

  return {
    month,
    day,
    events: (data.events ?? []).map((e) => ({
      year: e.year,
      text: e.text,
      pages: (e.pages ?? []).map((p) => p.title),
    })),
    births: (data.births ?? []).map((b) => ({
      year: b.year,
      text: b.text,
      pages: (b.pages ?? []).map((p) => p.title),
    })),
    deaths: (data.deaths ?? []).map((d) => ({
      year: d.year,
      text: d.text,
      pages: (d.pages ?? []).map((p) => p.title),
    })),
    holidays: (data.holidays ?? []).map((h) => ({
      text: h.text,
      pages: (h.pages ?? []).map((p) => p.title),
    })),
  };
}

async function featuredArticle(year: string, month: string, day: string) {
  const res = await fetch(`${BASE_URL}/featured/${year}/${month}/${day}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikimedia error: ${res.status}`);

  const data = (await res.json()) as {
    tfa?: {
      title: string;
      displaytitle?: string;
      extract?: string;
      description?: string;
      content_urls?: { desktop?: { page?: string } };
      originalimage?: { source: string; width: number; height: number };
    };
  };

  if (!data.tfa) throw new Error('No featured article found for this date');

  const tfa = data.tfa;
  return {
    title: tfa.title,
    display_title: tfa.displaytitle ?? tfa.title,
    description: tfa.description ?? null,
    extract: tfa.extract ?? null,
    url: tfa.content_urls?.desktop?.page ?? null,
    image: tfa.originalimage
      ? { source: tfa.originalimage.source, width: tfa.originalimage.width, height: tfa.originalimage.height }
      : null,
  };
}

async function mostRead(year: string, month: string, day: string) {
  const res = await fetch(`${BASE_URL}/mostread/${year}/${month}/${day}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikimedia error: ${res.status}`);

  const data = (await res.json()) as {
    mostread?: {
      date: string;
      articles: {
        title: string;
        displaytitle?: string;
        views: number;
        rank: number;
        description?: string;
        content_urls?: { desktop?: { page?: string } };
      }[];
    };
  };

  if (!data.mostread) throw new Error('No most-read data found for this date');

  return {
    date: data.mostread.date,
    articles: data.mostread.articles.slice(0, 20).map((a) => ({
      rank: a.rank,
      title: a.title,
      display_title: a.displaytitle ?? a.title,
      views: a.views,
      description: a.description ?? null,
      url: a.content_urls?.desktop?.page ?? null,
    })),
  };
}

async function pictureOfDay(year: string, month: string, day: string) {
  const res = await fetch(`${BASE_URL}/image/${year}/${month}/${day}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Wikimedia error: ${res.status}`);

  const data = (await res.json()) as {
    image?: {
      title: string;
      description?: { text?: string };
      image?: { source: string };
      thumbnail?: { source: string; width: number; height: number };
      file_page?: string;
    };
  };

  if (!data.image) throw new Error('No picture of the day found for this date');

  const img = data.image;
  return {
    title: img.title,
    description: img.description?.text ?? null,
    image_url: img.image?.source ?? null,
    thumbnail: img.thumbnail
      ? { source: img.thumbnail.source, width: img.thumbnail.width, height: img.thumbnail.height }
      : null,
    file_page: img.file_page ?? null,
  };
}

export default { tools, callTool } satisfies McpToolExport;
