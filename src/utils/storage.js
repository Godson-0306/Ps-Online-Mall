const prefix = 'ps-mall:';

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${prefix}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(`${prefix}${key}`);
  } catch {
    // Ignore.
  }
}
