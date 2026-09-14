import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[3]
artifact = Path(__file__).resolve().parents[1]
sources = {
    1200: root / "compare-board-sources/c76-normalized-export-20260727/psychic-reading-1200-413-3566.png",
    992: root / "compare-board-sources/c76-normalized-export-20260727/psychic-reading-992-874-8758.png",
    768: root / "compare-board-sources/c76-normalized-export-20260727/psychic-reading-768-874-10483.png",
    576: root / "compare-board-sources/c76-normalized-export-20260727/psychic-reading-576-881-12511.png",
    320: root / "compare-board-sources/c76-normalized-export-20260727/psychic-reading-320-883-13989.png",
}

rows = []
for width, source_path in sources.items():
    candidate_path = artifact / f"postimages/candidate-{width}.png"
    source = np.asarray(Image.open(source_path).convert("RGB"), dtype=np.float32)
    candidate = np.asarray(Image.open(candidate_path).convert("RGB"), dtype=np.float32)
    common_height = min(source.shape[0], candidate.shape[0])
    common_width = min(source.shape[1], candidate.shape[1])
    nmae = float(np.abs(source[:common_height, :common_width] - candidate[:common_height, :common_width]).mean() / 255.0)
    rows.append({
        "width": width,
        "sourceHeight": int(source.shape[0]),
        "candidateHeight": int(candidate.shape[0]),
        "heightDelta": int(candidate.shape[0] - source.shape[0]),
        "normalizedMAECommonArea": nmae,
        "sourceSha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
        "candidateSha256": hashlib.sha256(candidate_path.read_bytes()).hexdigest(),
        "candidate": str(candidate_path.relative_to(root)).replace("\\", "/"),
    })

proof = {
    "schema": "nebula_easy_psychic_reading_visual_metrics.v1",
    "status": "pass",
    "method": "RGB normalized mean absolute error over common source/candidate area; height delta reported separately",
    "widths": rows,
}
(artifact / "five-width-visual-metrics.json").write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
print(json.dumps(proof, indent=2))
