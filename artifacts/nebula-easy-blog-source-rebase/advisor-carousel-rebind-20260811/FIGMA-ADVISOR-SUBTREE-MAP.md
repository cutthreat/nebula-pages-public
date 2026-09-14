# Blog advisor subtree map — current C76

- File: `C76M54fY7z926wIQoWFh8Y`
- Source generation: `c76-normalized-export-20260727`
- Target owner: `.blog-advisor`
- Source mode: current local raster + exact-node Figma MCP `get_design_context`/`get_metadata`
- Duplicate-name resolution: repeated `Card` instances are siblings inside the named `FIND ANSWERS` subtree; the owning screen node and direct row node disambiguate each breakpoint.

| Width | Owning subtree | Carrier | Intro | Cards | Controls | CTA |
|---|---|---|---|---|---|---|
| 1200 | `642:5788/643:7311` | page `x=0 y=1132 1200x560`; content `x=45 1110px` | `643:7310`, `350x394`, top 84 | `643:7292`, two `350x479`, gap 30 | none | `643:7306`, `211x70` |
| 992 | `1001:20800/1001:20842` | `x=0 y=1112 992x560` | `1001:20844`, `290x426`, `x=31 y=64` | `1002:21736`, two `296x489`, gap 20 | none | `1001:20853`, `211x70` |
| 768 | `1002:21942/1002:21986` | `x=0 y=1072 768x880` (`BG 1002:21987`) | `1002:23954/1002:21988`, `690x122`, `x=39 y=54` | `1002:23868`, two `335x483`, gap 20 | none | `1002:21997`, `200x60` |
| 576 | `1002:23955/1002:24003` | `x=0 y=928 576x780` (`BG 1002:24004`) | `1002:24005/1002:24006`, content `510px`, top 34, intro `115px` | `1005:21897`, two `250x437`, gap 10 | none | `1002:24018`, `183x50`, after cards |
| 320 | `1005:22168/1005:22213` | `x=0 y=1791 320x960` (`BG 1005:22214`) | `1005:22215/1005:22216`, content `290px`, top 34, intro `198px` | clip `1005:22665` `290x437`; rail `1005:22666` `510x437`; two `250x437`, gap 10, 30px next visible | `1005:22653/1005:22658`, two `50x50`, gap 10, previous disabled + next active in source state | `1005:22228`, `183x50`, after rail |

## Source → live ownership

- `FIND ANSWERS`/BG → `.blog-advisor`
- intro frame → `.blog-advisor__copy`, heading and `.blog-advisor__list`
- arrow frame → `.blog-advisor__controls` and native buttons
- clipped card line/video line → `.blog-advisor__experts`
- repeated Card instances → `.blog-advisor__expert`
- `FIND PSYCHIC - 1 BUTTON` → `.blog-advisor__button`

At 320 the controls are a real source-defined carousel state, so the live owner requires bounded page-local state. At 576 and above controls are absent and both cards remain simultaneously visible.

