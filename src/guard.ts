// Prompt-injection guard, ported verbatim from ldnmxx-hack's shared/guard.ts. NOT a security
// boundary — the model is sandboxed and every output is structurally validated (see renderTool) —
// just a cheap, honest first pass that catches the blatant override / prompt-exfiltration /
// jailbreak attempts. Free-text user input (e.g. a founder's idea) is common, so the pattern list
// is deliberately tight to avoid false positives; on a match the caller falls back to a
// deterministic default (never worse than doing nothing). Patterns are ReDoS-safe (bounded
// quantifiers, no nested repetition).

export interface GuardResult {
  flagged: boolean;
  reason?: string;
}

const PATTERNS: { re: RegExp; reason: string }[] = [
  {
    re: /ignore\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|earlier|above)\s+(?:instruction|prompt|message|rule|direction)s?/i,
    reason: "instruction-override attempt",
  },
  {
    re: /disregard\s+(?:all\s+|the\s+|any\s+)?(?:previous|prior|earlier|above|system)/i,
    reason: "instruction-override attempt",
  },
  { re: /\b(?:system|developer)\s+prompt\b/i, reason: "prompt-exfiltration attempt" },
  {
    re: /\b(?:reveal|show|print|repeat|reproduce)\b[^.\n]{0,30}\b(?:system|initial|original|above|your)\s+(?:prompt|instruction|rule)s?/i,
    reason: "prompt-exfiltration attempt",
  },
  { re: /\byou\s+are\s+now\b/i, reason: "role-override attempt" },
  { re: /\b(?:developer|god)\s+mode\b/i, reason: "jailbreak attempt" },
  { re: /\bjailbreak/i, reason: "jailbreak attempt" },
];

// First matching pattern wins; returns {flagged:false} for ordinary text (including empty).
export function detectInjection(text: string): GuardResult {
  for (const { re, reason } of PATTERNS) {
    if (re.test(text)) return { flagged: true, reason };
  }
  return { flagged: false };
}
