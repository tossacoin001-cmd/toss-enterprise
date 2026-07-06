# Prompt Library

This document owns how prompts are stored, versioned, and reused. Honest current state: **no prompts exist yet** because no agent has been implemented. These conventions bind the first implementation.

## Rules

1. **Prompts are code.** They live in the agent's package under `src/prompts/`, one file per prompt, exported as typed template functions (variables are typed parameters, not string concatenation scattered through logic).
2. **No duplicated prompt text.** Shared fragments (brand voice block, PII rules block) live in one place and are imported. When the second agent needs the brand voice block, it moves to `packages/core` per the second-occurrence rule.
3. **Versioned by git, reviewed like code.** A prompt change that alters customer-visible output gets the same scrutiny as a code change, and a test where feasible (golden outputs for deterministic checks, assertion of required elements for generative ones).
4. **Every prompt states its contract at the top of the file:** which model tier it targets, expected input shape, expected output shape (prefer structured output with Zod schemas via the AI SDK).
5. **Brand voice in every customer-visible prompt.** The canonical voice rules are in [../06-brand/brand-system.md](../06-brand/brand-system.md); prompts import the shared voice fragment rather than restating it.

## Anatomy of a prompt module (target convention)

```ts
// src/prompts/qualify-lead.ts
// Model tier: fast. Input: LeadPayload. Output: LeadQualification (zod).
export const qualifyLead = (lead: LeadPayload) => `...`;
```

## Open questions

- Whether to adopt a prompt evaluation harness (simple golden-file tests vs a tool like promptfoo) when the first customer-visible prompt ships. Decide during visibility-agent implementation.
