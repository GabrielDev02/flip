const SNOOZE_KEY = "flip:push-prompt-snoozed-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

export function isPushPromptSnoozed(): boolean {
  try {
    return Number(window.localStorage.getItem(SNOOZE_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

export function snoozePushPrompt() {
  try {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    // storage unavailable; the prompt just shows again next visit
  }
}
