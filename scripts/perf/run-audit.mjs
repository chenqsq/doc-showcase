import process from 'node:process';
import {
  PREVIEW_PORT,
  PROFILE_KEYS,
  REPO_ROOT,
  ROUTE_KEYS,
  createPreviewBaseUrl,
  ensureDir,
  parseCliArgs,
  resolveRouteSpecs
} from './config.mjs';
import {
  cleanupResidualAuditProcesses,
  ensurePreviewServerWithPort,
  findAvailablePort,
  stopPreviewServer
} from './browser.mjs';
import { runLighthouseAudit } from './run-lighthouse.mjs';
import { runTraceAudit } from './run-trace.mjs';
import { summarizePerfOutputs } from './summarize.mjs';

async function runEnvAudit(envKey, options, baseUrlOverride = null) {
  const routeSpecs = resolveRouteSpecs(options.routes ?? ROUTE_KEYS);
  const profileKeys = options.profiles ?? PROFILE_KEYS;

  await runLighthouseAudit({
    envKey,
    baseUrlOverride,
    profileKeys,
    routeSpecs,
    maxRuns: options.maxRuns
  });

  await runTraceAudit({
    envKey,
    baseUrlOverride,
    profileKeys,
    routeSpecs,
    maxRuns: options.maxRuns
  });
}

async function main() {
  const envKey = process.argv[2];
  const options = parseCliArgs(process.argv.slice(3));
  let previewServer = null;

  try {
    console.log('清理残留性能审计进程...');
    await cleanupResidualAuditProcesses();

    ensureDir(REPO_ROOT);

    if (envKey === 'preview') {
      const previewPort = await findAvailablePort(PREVIEW_PORT);
      const previewBaseUrl = createPreviewBaseUrl(previewPort);
      previewServer = await ensurePreviewServerWithPort(REPO_ROOT, previewPort);
      await runEnvAudit('preview', options, previewBaseUrl);
    } else if (envKey === 'pages') {
      await runEnvAudit('pages', options);
    } else if (envKey === 'all') {
      const previewPort = await findAvailablePort(PREVIEW_PORT);
      const previewBaseUrl = createPreviewBaseUrl(previewPort);
      previewServer = await ensurePreviewServerWithPort(REPO_ROOT, previewPort);
      await runEnvAudit('preview', options, previewBaseUrl);
      await stopPreviewServer(previewServer);
      previewServer = null;
      await runEnvAudit('pages', options);
    } else {
      throw new Error(`未知审计目标: ${envKey ?? '(empty)'}`);
    }

    summarizePerfOutputs();
  } finally {
    if (previewServer) {
      await stopPreviewServer(previewServer);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
