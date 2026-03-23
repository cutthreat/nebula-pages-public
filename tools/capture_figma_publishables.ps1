param(
  [string]$CdpUrl = "http://127.0.0.1:9222",
  [string]$OutputJson = "H:\Nebula\GPT\figma-manifest\figma-publishables.local.json",
  [string]$OutputCsv = "H:\Nebula\GPT\figma-manifest\figma-publishables.local.csv"
)

$ErrorActionPreference = "Stop"

$env:FIGMA_CDP_URL = $CdpUrl
$env:FIGMA_PUBLISHABLES_JSON = $OutputJson
$env:FIGMA_PUBLISHABLES_CSV = $OutputCsv

$py = @'
import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

cdp_url = os.environ["FIGMA_CDP_URL"]
out_json = Path(os.environ["FIGMA_PUBLISHABLES_JSON"])
out_csv = Path(os.environ["FIGMA_PUBLISHABLES_CSV"])

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(cdp_url)
    fig_pages = []
    for ctx in browser.contexts:
        for page in ctx.pages:
            try:
                url = page.url or ""
            except Exception:
                url = ""
            if "figma.com" in url:
                fig_pages.append(page)
    if not fig_pages:
        raise SystemExit("no_figma_page_found")
    page = fig_pages[0]
    page.bring_to_front()
    data = page.evaluate("""() => {
      const state = window.store && window.store.getState ? window.store.getState() : {};
      const library = state.library || {};
      return {
        page_url: location.href,
        title: document.title,
        publishableSymbols: library.publishableSymbols || [],
        publishableStateGroups: library.publishableStateGroups || [],
      };
    }""")

payload = {
    "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "cdp_url": cdp_url,
    "page_url": data.get("page_url"),
    "title": data.get("title"),
    "publishable_symbols": data.get("publishableSymbols", []),
    "publishable_state_groups": data.get("publishableStateGroups", []),
}

out_json.parent.mkdir(parents=True, exist_ok=True)
out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

rows = []
for item in payload["publishable_symbols"]:
    rows.append({
        "kind": "symbol",
        "node_id": item.get("nodeId", ""),
        "name": item.get("name", ""),
        "version_hash": item.get("versionHash", ""),
        "user_facing_version": item.get("userFacingVersion", ""),
        "width": item.get("width", ""),
        "height": item.get("height", ""),
        "sort_position": item.get("sortPosition", ""),
        "is_template": item.get("isTemplate", ""),
        "page_id": (item.get("containingFrame") or {}).get("pageId", ""),
        "page_name": (item.get("containingFrame") or {}).get("pageName", ""),
    })
for item in payload["publishable_state_groups"]:
    rows.append({
        "kind": "state_group",
        "node_id": item.get("nodeId", ""),
        "name": item.get("name", ""),
        "version_hash": item.get("versionHash", ""),
        "user_facing_version": item.get("userFacingVersion", ""),
        "width": item.get("width", ""),
        "height": item.get("height", ""),
        "sort_position": "",
        "is_template": item.get("isTemplate", ""),
        "page_id": (item.get("containingFrame") or {}).get("pageId", ""),
        "page_name": (item.get("containingFrame") or {}).get("pageName", ""),
    })

with out_csv.open("w", newline="", encoding="utf-8") as fh:
    writer = csv.DictWriter(fh, fieldnames=["kind", "node_id", "name", "version_hash", "user_facing_version", "width", "height", "sort_position", "is_template", "page_id", "page_name"])
    writer.writeheader()
    writer.writerows(rows)

print(json.dumps({"json": str(out_json), "csv": str(out_csv), "count": len(rows)}, ensure_ascii=False))
'@

$py | python -
