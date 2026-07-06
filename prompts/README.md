# Prompts

This folder owns the prompt registry and any prompt that does not live inside a package: workflow prompts, chat assistant configuration, reusable non-code prompt text. Status: Planned.

Prompt policy is owned by [docs/03-ai/prompt-library.md](../docs/03-ai/prompt-library.md): agent prompts are code and live in the agent's package under `src/prompts/`; shared fragments graduate to `packages/core` on second occurrence. [registry.md](registry.md) indexes every prompt wherever it lives.
