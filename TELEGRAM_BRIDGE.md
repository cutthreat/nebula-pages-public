# Telegram Bridge

## Purpose
- Let the existing Telegram bot act as the operator UI for Nebula without moving learning logic into Codex.
- The bot should only read the latest local learning payload and present it in chat.

## Source Of Truth
- `learning-reports/autonomous-free-learning-telegram.txt`
- `learning-reports/autonomous-free-learning-latest.json`
- `learning-reports/autonomous-free-learning-latest.md`

## Recommended Bot Behavior
- Add a command such as `/nebula-learning`.
- When invoked, the bot reads `learning-reports/autonomous-free-learning-telegram.txt` and sends it as a chat message.
- If the text file is missing, the bot should tell the user to run:
  - `powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\export_free_learning_telegram_payload.ps1 -WorkspaceRoot H:\Nebula\GPT`

## Why File-Based Bridge
- No Codex dependency.
- No new backend service required.
- Telegram becomes a thin viewer over the local autonomous loop.
- The file can be refreshed by the scheduled task or manually.

## Operator Flow
1. Local autonomous loop runs.
2. Telegram payload file is refreshed.
3. Telegram bot exposes the payload on request.
4. User sees the current learning state in chat.

## Minimal Acceptance Criteria
- Telegram can display the current total/implemented/missing queue numbers.
- Telegram can show the report path.
- Telegram can be used without opening the workspace UI.
