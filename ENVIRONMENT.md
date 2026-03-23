# Nebula Environment

## Current Baseline
- Python 3.12
- Node 24 / npm 11
- Git 2.53
- Chrome / Edge present on the machine

## Installed Python Packages
- `python-docx`
- `lxml`
- `playwright`
- `pillow`

## What This Environment Is For
- Read and edit `.docx` files
- Render and inspect Figma exports and page screenshots
- Compare page output visually
- Work with the static Neuro landing page in `H:\Nebula\GPT\_unzipped`

## Bootstrap
- Run `H:\Nebula\GPT\setup_env.ps1`

## Runbook
- See `H:\Nebula\GPT\RUNBOOK.md`

## Browser Strategy
- Use the installed Chrome/Edge channel for Playwright runs
- Do not wait on Playwright browser downloads unless a task explicitly requires it
