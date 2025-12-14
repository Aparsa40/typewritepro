import { listAllTokens, refreshIfNeeded } from './driveTokenService';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const PROACTIVE_INTERVAL_MS = 60 * 1000; // 1 min during tests or local quick mode

let timer: NodeJS.Timeout | null = null;
let isRunning = false;

export async function runOnceAndRefresh(): Promise<void> {
  try {
    const tokens = await listAllTokens();
    for (const t of tokens) {
      try {
        if (!t.expiresAt) continue;
        const msUntilExpires = t.expiresAt - Date.now();
        // Refresh when expiring within 1 minute
        if (msUntilExpires < 60 * 1000) {
          try {
            await refreshIfNeeded(t.tokenId);
            console.log('[driveTokenScheduler] refreshed token', t.tokenId);
          } catch (e) {
            console.warn('[driveTokenScheduler] failed to refresh token', t.tokenId, e);
          }
        }
      } catch (e) {
        console.warn('[driveTokenScheduler] token scan inner error', t.tokenId, e);
      }
    }
  } catch (e) {
    console.warn('[driveTokenScheduler] failed to list tokens or refresh', e);
  }
}

export function startScheduler(intervalMs?: number) {
  if (isRunning) return;
  isRunning = true;
  const actual = intervalMs || DEFAULT_INTERVAL_MS;
  console.log('[driveTokenScheduler] starting with interval', actual);
  timer = setInterval(() => runOnceAndRefresh().catch((e) => console.warn('Scheduler error', e)), actual);
}

export function stopScheduler() {
  if (!isRunning) return;
  isRunning = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function isSchedulerRunning() { return isRunning; }
