#!/usr/bin/env node

import crypto from 'node:crypto';

const EXIT_CODES = {
  PASS: 0,
  OTHER_ERROR: 1,
  MISSING_CONFIG: 2,
  HTTP_FAILED: 3,
  EVENT_STREAM_MISSING: 4,
  NOT_COMPLETED: 5
};

const DEFAULT_ENDPOINT = 'https://wss.lke.cloud.tencent.com/adp/v2/chat';
const DEFAULT_QUERY = '请用中文简要解释什么是导数概念，并给一个生活化例子。';
const DEFAULT_TIMEOUT_MS = 20000;

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }

    const known = new Set([
      '--endpoint',
      '--app-key',
      '--visitor-id',
      '--conversation-id',
      '--request-id',
      '--query',
      '--timeout-ms'
    ]);

    if (!known.has(token)) {
      throw new Error(`Unknown argument: ${token}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${token}`);
    }

    args[token.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value.trim();
    index += 1;
  }

  return args;
}

function firstValue(...values) {
  for (const value of values) {
    const cleaned = String(value ?? '').trim();
    if (cleaned) {
      return cleaned;
    }
  }
  return '';
}

function printHelp() {
  console.log([
    'ADP HTTP SSE V2 smoke verifier (Node 18+ fetch, zero extra deps)',
    '',
    'Usage:',
    '  npm run adp:sse:smoke',
    '  ADP_APP_KEY=*** npm run adp:sse:smoke',
    '  node scripts/adp-sse-smoke.mjs --app-key *** --query "什么是导数"',
    '',
    'Configuration sources, highest priority first:',
    '  CLI: --endpoint --app-key --visitor-id --conversation-id --request-id --query --timeout-ms',
    '  Env: ADP_ENDPOINT / ADP_HTTP_SSE_ENDPOINT',
    '  Env: ADP_APP_KEY / ADP_HTTP_SSE_APP_KEY',
    '  Env: ADP_VISITOR_ID / ADP_HTTP_SSE_VISITOR_ID',
    '  Env: ADP_CONVERSATION_ID / ADP_HTTP_SSE_CONVERSATION_ID',
    '  Env: ADP_REQUEST_ID / ADP_HTTP_SSE_REQUEST_ID',
    '  Env: ADP_QUERY / ADP_HTTP_SSE_QUERY',
    '  Env: ADP_TIMEOUT_MS / ADP_HTTP_SSE_TIMEOUT_MS',
    '',
    'Defaults:',
    `  endpoint: ${DEFAULT_ENDPOINT}`,
    `  query: ${DEFAULT_QUERY}`,
    `  timeoutMs: ${DEFAULT_TIMEOUT_MS}`,
    '',
    'Exit codes:',
    `  ${EXIT_CODES.PASS} pass`,
    `  ${EXIT_CODES.MISSING_CONFIG} missing required config`,
    `  ${EXIT_CODES.HTTP_FAILED} HTTP failed or timeout`,
    `  ${EXIT_CODES.EVENT_STREAM_MISSING} event stream missing`,
    `  ${EXIT_CODES.NOT_COMPLETED} no completion signal (response.completed or done)`,
    `  ${EXIT_CODES.OTHER_ERROR} script error or unknown argument`,
    '',
    'Security:',
    '  Prefer environment variables over CLI args for AppKey.',
    '  The script masks AppKey, strips endpoint query strings, and never writes output files.'
  ].join('\n'));
}

function maskSecret(value) {
  if (!value) {
    return '(empty)';
  }
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

function sanitizeEndpoint(value) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return '(invalid endpoint)';
  }
}

function parseTimeout(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return parsed;
}

function createId() {
  return crypto.randomUUID();
}

function querySummary(query) {
  const compact = String(query ?? '').replace(/\s+/g, ' ').trim();
  const hash = crypto.createHash('sha256').update(compact).digest('hex').slice(0, 12);
  return `length=${compact.length}, sha256_12=${hash}`;
}

function compactText(value, maxLength = 240) {
  const compact = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength)}...`;
}

function inferEventName(rawEvent, dataText, parsedJson) {
  if (rawEvent) {
    return rawEvent;
  }
  if (parsedJson && typeof parsedJson === 'object') {
    if (typeof parsedJson.Type === 'string' && parsedJson.Type.trim()) {
      return parsedJson.Type.trim();
    }
    if (typeof parsedJson.type === 'string' && parsedJson.type.trim()) {
      return parsedJson.type.trim();
    }
    if (typeof parsedJson.event === 'string' && parsedJson.event.trim()) {
      return parsedJson.event.trim();
    }
  }
  if (typeof dataText === 'string' && dataText.trim() === '[DONE]') {
    return 'done';
  }
  return 'message';
}

function isCompletionEvent(eventName, dataText, parsedJson) {
  const normalized = String(eventName || '').toLowerCase();
  if (normalized === 'response.completed' || normalized === 'done') {
    return true;
  }
  if (typeof dataText === 'string' && dataText.trim() === '[DONE]') {
    return true;
  }
  if (parsedJson && typeof parsedJson === 'object') {
    if (String(parsedJson.Type || parsedJson.type || '').toLowerCase() === 'response.completed') {
      return true;
    }
    if (String(parsedJson.event || '').toLowerCase() === 'done') {
      return true;
    }
    if (parsedJson.done === true) {
      return true;
    }
  }
  return false;
}

function buildRequestBody({ appKey, visitorId, conversationId, requestId, query }) {
  return {
    RequestId: requestId,
    ConversationId: conversationId,
    AppKey: appKey,
    VisitorId: visitorId,
    Contents: [
      {
        Type: 'text',
        Text: query
      }
    ],
    Incremental: true,
    EnableMultiIntent: true,
    Stream: 'enable'
  };
}

async function run() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[adp-sse-smoke] ${error.message}`);
    return EXIT_CODES.OTHER_ERROR;
  }

  if (args.help) {
    printHelp();
    return EXIT_CODES.PASS;
  }

  const endpoint = firstValue(args.endpoint, process.env.ADP_ENDPOINT, process.env.ADP_HTTP_SSE_ENDPOINT, DEFAULT_ENDPOINT);
  const appKey = firstValue(args.appKey, process.env.ADP_APP_KEY, process.env.ADP_HTTP_SSE_APP_KEY);
  const visitorId = firstValue(args.visitorId, process.env.ADP_VISITOR_ID, process.env.ADP_HTTP_SSE_VISITOR_ID, `doc-showcase-smoke-${Date.now()}`);
  const conversationId = firstValue(args.conversationId, process.env.ADP_CONVERSATION_ID, process.env.ADP_HTTP_SSE_CONVERSATION_ID, createId());
  const requestId = firstValue(args.requestId, process.env.ADP_REQUEST_ID, process.env.ADP_HTTP_SSE_REQUEST_ID, createId());
  const query = firstValue(args.query, process.env.ADP_QUERY, process.env.ADP_HTTP_SSE_QUERY, DEFAULT_QUERY);
  const timeoutMs = parseTimeout(firstValue(args.timeoutMs, process.env.ADP_TIMEOUT_MS, process.env.ADP_HTTP_SSE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS));

  if (!appKey) {
    console.error('[adp-sse-smoke] missing required config: ADP_APP_KEY or ADP_HTTP_SSE_APP_KEY');
    console.error(`[adp-sse-smoke] exit=${EXIT_CODES.MISSING_CONFIG}`);
    return EXIT_CODES.MISSING_CONFIG;
  }

  let url;
  try {
    url = new URL(endpoint);
  } catch {
    console.error(`[adp-sse-smoke] invalid endpoint: ${sanitizeEndpoint(endpoint)}`);
    console.error(`[adp-sse-smoke] exit=${EXIT_CODES.MISSING_CONFIG}`);
    return EXIT_CODES.MISSING_CONFIG;
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  console.log('[adp-sse-smoke] start');
  console.log(`[adp-sse-smoke] endpoint=${sanitizeEndpoint(url.href)}`);
  console.log(`[adp-sse-smoke] visitorId=${visitorId}`);
  console.log(`[adp-sse-smoke] conversationId=${conversationId}`);
  console.log(`[adp-sse-smoke] requestId=${requestId}`);
  console.log(`[adp-sse-smoke] query=${querySummary(query)}`);
  console.log(`[adp-sse-smoke] timeoutMs=${timeoutMs}`);
  console.log(`[adp-sse-smoke] appKey(masked)=${maskSecret(appKey)}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildRequestBody({ appKey, visitorId, conversationId, requestId, query })),
      signal: controller.signal
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      const bodyText = compactText(await response.text(), 240);
      console.error(`[adp-sse-smoke] HTTP status=${response.status}`);
      if (bodyText) {
        console.error(`[adp-sse-smoke] HTTP body=${bodyText}`);
      }
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.HTTP_FAILED}`);
      return EXIT_CODES.HTTP_FAILED;
    }

    if (!response.body) {
      console.error('[adp-sse-smoke] response.body is empty');
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.EVENT_STREAM_MISSING}`);
      return EXIT_CODES.EVENT_STREAM_MISSING;
    }

    if (contentType && !contentType.toLowerCase().includes('text/event-stream')) {
      console.error(`[adp-sse-smoke] unexpected content-type=${contentType}`);
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.EVENT_STREAM_MISSING}`);
      return EXIT_CODES.EVENT_STREAM_MISSING;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let currentEvent = '';
    let currentDataLines = [];
    let eventCount = 0;
    let completionSignal = '';
    const eventSequence = [];

    const emitEvent = () => {
      const dataText = currentDataLines.join('\n');
      if (!currentEvent && !dataText) {
        currentEvent = '';
        currentDataLines = [];
        return;
      }

      let parsed = null;
      if (dataText) {
        try {
          parsed = JSON.parse(dataText);
        } catch {
          parsed = null;
        }
      }

      const eventName = inferEventName(currentEvent, dataText, parsed);
      eventCount += 1;
      eventSequence.push(eventName);

      if (!completionSignal && isCompletionEvent(eventName, dataText, parsed)) {
        completionSignal = eventName;
      }

      currentEvent = '';
      currentDataLines = [];
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line === '') {
          emitEvent();
          continue;
        }
        if (line.startsWith(':')) {
          continue;
        }
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
          continue;
        }
        if (line.startsWith('data:')) {
          currentDataLines.push(line.slice(5).trimStart());
        }
      }

      if (done) {
        if (buffer.trim()) {
          for (const line of buffer.split(/\r?\n/)) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              currentDataLines.push(line.slice(5).trimStart());
            }
          }
        }
        emitEvent();
        break;
      }
    }

    const durationMs = Date.now() - startedAt;
    const sequencePreview = eventSequence.slice(0, 30).join(' -> ');

    console.log('[adp-sse-smoke] HTTP 200 OK');
    console.log(`[adp-sse-smoke] contentType=${contentType || '(none)'}`);
    console.log(`[adp-sse-smoke] eventCount=${eventCount}`);
    console.log(`[adp-sse-smoke] eventSequence=${sequencePreview || '(none)'}`);
    console.log(`[adp-sse-smoke] completionSignal=${completionSignal || '(none)'}`);
    console.log(`[adp-sse-smoke] durationMs=${durationMs}`);

    if (eventCount === 0) {
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.EVENT_STREAM_MISSING}`);
      return EXIT_CODES.EVENT_STREAM_MISSING;
    }

    if (!completionSignal) {
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.NOT_COMPLETED}`);
      return EXIT_CODES.NOT_COMPLETED;
    }

    console.log(`[adp-sse-smoke] result=PASS exit=${EXIT_CODES.PASS}`);
    return EXIT_CODES.PASS;
  } catch (error) {
    if (error?.name === 'AbortError') {
      console.error(`[adp-sse-smoke] timeout after ${timeoutMs}ms`);
      console.error(`[adp-sse-smoke] exit=${EXIT_CODES.HTTP_FAILED}`);
      return EXIT_CODES.HTTP_FAILED;
    }

    console.error(`[adp-sse-smoke] unexpected error: ${error?.message || String(error)}`);
    console.error(`[adp-sse-smoke] exit=${EXIT_CODES.OTHER_ERROR}`);
    return EXIT_CODES.OTHER_ERROR;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

const code = await run();
process.exit(code);
