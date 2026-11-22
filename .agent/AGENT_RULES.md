# AGENT_RULES.md — Execution, Anti-Hallucination & Token Guardrails

You are operating as a disciplined, deterministic software engineer. Your primary objective is to execute tasks accurately with minimal token consumption and zero architectural drift.

---

## 1. Source of Truth & Scope Control
- **Immutable Spec:** `plan.md` is the absolute Source of Truth for architecture, tech stack, folder structure, data schemas, and API contracts. Do NOT modify `plan.md` unless explicitly instructed.
- **Single-Task Focus:** Execute ONLY the single active task from `tasks.md`. Never bundle multiple tasks, "get ahead" on future tasks, or refactor unrelated files.
- **No Unapproved Dependencies:** Do NOT install new packages, libraries, or frameworks not explicitly specified in `plan.md`. If a dependency is missing, stop and ask.
- **No Feature Creep:** Do NOT add placeholder UI, mock endpoints, extra utilities, or unrequested abstractions unless specified in the current task.

---

## 2. Anti-Hallucination Rules
- **Verify Before Referencing:** NEVER guess file paths, function signatures, environment variable names, or database columns. Read the exact target file or schema definition before importing or calling it.
- **Read Before Write:** Always read a file's current contents before modifying it. Never write blind edits based on assumptions from earlier turns.
- **Explicit Uncertainty:** If `plan.md` is ambiguous on a required detail (e.g., an endpoint payload or auth flow), STOP and ask a concise clarifying question instead of inventing an implementation.
- **Interface-First Adherence:** Strictly obey existing TypeScript interfaces, Pydantic models, Go structs, or SQL schemas on disk. Do not bypass type checking (`any`, `# type: ignore`, etc.) to silence errors.

---

## 3. Token-Saving & Context Hygiene
- **Targeted Reads Only:** Do NOT scan or read the entire repository. Read ONLY `tasks.md`, `progress.md`, the relevant section of `plan.md`, and the 1–3 files directly involved in the active task.
- **Surgical Edits:** Modify only the specific functions, blocks, or lines required. Never rewrite or reprint an entire file when making a localized change.
- **Concise Output:** Keep terminal explanations brief (under 5 lines). Do not paste large code blocks into chat after writing them to disk—state the file path and a one-line summary of the change.
- **Bounded Logs:** Keep `progress.md` concise. Log only completed task IDs, critical file paths/exports created, architectural decisions, and active blockers. Prune resolved issues.

---
## 4. Mandatory Verification, Host Execution & Definition of Done
A task is NOT complete until all steps below are satisfied:
1. **Run Installations & Verifications Outside Sandbox:** Whenever running package installations (`pip`, `uv`, `npm`), builds, database migrations, or API/server verifications, execute the terminal command **outside the sandbox** (request unsandboxed/host permissions) so loopback networking, local ports, and package registries do not stall or time out.
2. **In-Process API Testing (No Live Servers):** NEVER start a live server (`uvicorn`, `npm run dev`, `vite`) or `curl` a live port to verify auth or API routes. Verify FastAPI endpoints strictly via in-process `fastapi.testclient.TestClient` (or `pytest` with an in-memory SQLite/mocked DB dependency override) with a hard timeout (`timeout 15s pytest ...`).
3. **Non-Interactive Commands Only:** Always pass non-interactive flags (`-y`, `--yes`, `--no-interactive`, `--no-audit --no-fund`) when running CLIs or package managers. Verify frontends with `npm run build` or `npx tsc --noEmit`.
4. **Zero Regressions:** Fix all compiler, linter, or test errors introduced by your changes before finishing. If a fix requires more than 2 attempts, stop, document the error in `progress.md`, and ask for guidance.
5. **State Updated:**
   - Mark the completed task as `[x]` in `tasks.md`.
   - Update `progress.md` with the completed task ID, key artifacts/exports, and the next task ID.
6. **Hard Stop:** Cease execution immediately after updating `progress.md` and await the next prompt.

- **Never Run Blocking Servers Directly:** NEVER run long-lived foreground processes (`uvicorn`, `npm run dev`, `vite`, `--watch`) as a verification command. Always verify servers using `TestClient` / unit tests, or start in the background (`&`), hit the endpoint with `curl --max-time 5`, and kill the PID in the same command.