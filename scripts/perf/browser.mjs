import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import process from 'node:process';
import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import { ENV_CONFIGS, PROFILE_CONFIGS, REPO_ROOT, createPreviewBaseUrl, getNpmCommand, sleep } from './config.mjs';

const PERF_LONGTASK_INIT = `
(() => {
  const state = {
    longTasks: [],
    marks: []
  };

  window.__perfAudit = state;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      state.longTasks.push({
        name: entry.name || 'longtask',
        startTime: Number(entry.startTime.toFixed(2)),
        duration: Number(entry.duration.toFixed(2))
      });
    }
  });

  try {
    observer.observe({ type: 'longtask', buffered: true });
  } catch {
    // Ignore if unsupported.
  }
})();
`;

export async function launchChromeForAudit() {
  const chrome = await launch({
    chromeFlags: [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding'
    ]
  });

  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${chrome.port}`
  });

  return { browser, chrome };
}

export async function createInstrumentedPage(browser, envKey, profileKey) {
  const envConfig = ENV_CONFIGS[envKey];
  const profile = PROFILE_CONFIGS[profileKey];
  if (!envConfig) {
    throw new Error(`未知环境: ${envKey}`);
  }
  if (!profile) {
    throw new Error(`未知设备档位: ${profileKey}`);
  }

  const page = await browser.newPage();
  await page.setViewport({
    width: profile.width,
    height: profile.height,
    deviceScaleFactor: profile.deviceScaleFactor,
    isMobile: profile.mobile,
    hasTouch: profile.hasTouch
  });
  await page.setCacheEnabled(true);
  await page.evaluateOnNewDocument(PERF_LONGTASK_INIT);

  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');
  await client.send('Network.enable');
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setCPUThrottlingRate', {
    rate: envConfig.cpuSlowdownMultiplier
  });

  if (envConfig.cdpNetwork) {
    await client.send('Network.emulateNetworkConditions', envConfig.cdpNetwork);
  }

  return { client, page, profile };
}

export async function closeChromeSession(session) {
  if (!session) {
    return;
  }

  try {
    await session.browser.close();
  } catch {
    // Ignore disconnect races.
  }

  try {
    await session.chrome.kill();
  } catch {
    // Ignore process teardown races.
  }
}

export async function warmPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
}

export async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForLoadState?.('networkidle');
  await sleep(350);
}

export async function waitForUrl(url, attempts = 90) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok || response.status === 304) {
        return;
      }
    } catch {
      // Keep polling until available.
    }

    await sleep(500);
  }

  throw new Error(`等待预览服务超时: ${url}`);
}

async function runCleanupCommand(command, args) {
  const child = spawn(command, args, {
    stdio: 'ignore',
    shell: false,
    windowsHide: true
  });

  await Promise.race([Promise.race([once(child, 'exit'), once(child, 'close')]), sleep(8000)]);
}

export async function cleanupResidualAuditProcesses(currentPid = process.pid) {
  if (process.platform !== 'win32') {
    return;
  }

  const normalizedRepoRoot = REPO_ROOT.replace(/\\/g, '\\\\').toLowerCase();
  const cleanupScript = `
$repoRoot = '${normalizedRepoRoot}';
Get-CimInstance Win32_Process |
  Where-Object {
    $_.ProcessId -ne ${currentPid} -and
    $_.CommandLine -and (
      (
        $_.CommandLine.ToLower().Contains($repoRoot) -and (
          $_.CommandLine -like '*scripts\\perf\\run-audit.mjs*' -or
          $_.CommandLine -like '*vite preview*' -or
          $_.CommandLine -like '*lighthouse*'
        )
      ) -or (
        ($_.Name -match 'chrome|msedge|chromium') -and
        $_.CommandLine -like '*--headless=new*' -and
        $_.CommandLine -like '*--disable-background-networking*' -and
        $_.CommandLine -like '*--remote-debugging-port=*'
      )
    )
  } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
`;

  await runCleanupCommand('powershell', ['-NoProfile', '-Command', cleanupScript]);
}

export async function findAvailablePort(startPort) {
  let currentPort = startPort;

  while (currentPort < startPort + 50) {
    const isFree = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(currentPort, '127.0.0.1');
    });

    if (isFree) {
      return currentPort;
    }

    currentPort += 1;
  }

  throw new Error(`无法找到可用预览端口，起始端口 ${startPort}`);
}

export function startPreviewServer(cwd, port) {
  const command = getNpmCommand();
  const child = spawn(
    command,
    [
      'run',
      'preview',
      '--',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
      '--base',
      '/doc-showcase/'
    ],
    {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      windowsHide: true
    }
  );

  return child;
}

export async function ensurePreviewServer(cwd) {
  throw new Error('ensurePreviewServer 需要显式传入 port 和 baseUrl');
}

export async function ensurePreviewServerWithPort(cwd, port) {
  const baseUrl = createPreviewBaseUrl(port);
  const child = startPreviewServer(cwd, port);
  try {
    await waitForUrl(`${baseUrl}/`);
    return child;
  } catch (error) {
    await stopPreviewServer(child);
    throw error;
  }
}

async function waitForChildExit(child, timeoutMs = 5000) {
  if (!child || child.exitCode != null || child.signalCode != null) {
    return;
  }

  await Promise.race([
    Promise.race([once(child, 'exit'), once(child, 'close')]),
    sleep(timeoutMs)
  ]);
}

async function forceKillProcessTreeWindows(pid) {
  if (!pid) {
    return;
  }

  const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
    stdio: 'ignore',
    shell: false,
    windowsHide: true
  });

  await Promise.race([once(killer, 'exit'), once(killer, 'close')]);
}

export async function stopPreviewServer(child) {
  if (!child) {
    return;
  }

  if (child.exitCode != null || child.signalCode != null) {
    return;
  }

  if (process.platform === 'win32') {
    await forceKillProcessTreeWindows(child.pid);
    await waitForChildExit(child, 5000);
    return;
  }

  child.kill();
  await waitForChildExit(child, 5000);

  if (child.exitCode == null && child.signalCode == null) {
    child.kill('SIGKILL');
    await waitForChildExit(child, 2000);
  }
}

export async function measureInteraction(page, label, action, waitForStableState) {
  const start = await page.evaluate(() => performance.now());
  await action();
  await waitForStableState();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })
  );
  const end = await page.evaluate(() => performance.now());
  return {
    label,
    durationMs: Number((end - start).toFixed(2))
  };
}

export async function getPerfAuditState(page) {
  return page.evaluate(() => window.__perfAudit ?? { longTasks: [] });
}
