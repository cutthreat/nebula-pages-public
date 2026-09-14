# All Psychics — current C76 source subtree map

Authority: `figma-manifest/c76-normalized-export-20260727/all-psychic.json`, SHA256 `8A91DBBA825D863BE59EC70789601FB941C10C54F4D81EA8388942278BCE45BD`. The older `ayfBFN` receipt is excluded.

| Width | Root node | Source SHA256 | Page composition |
|---:|---|---|---|
| 1200 | `924:16998` | `22c133be7bbe2818cfac9f90c6e94ded7adcaadbde1411b5eb58bbeb1ebc9e18` | hero; two 3-card rails; explainer; video; 3x catalogue; affordability; reasons; reviews; FAQ; SEO; footer |
| 992 | `924:17233` | `d5472457fc583694076b7c5a46aa75ceca0c26c2494230fd0a97c30c73b5153c` | same order; tablet rail/card geometry |
| 768 | `924:17473` | `eadb1ddb281fc4eb05158ed10e6cc463b30b8778c2e4c115e7c39909d394adee` | same order; responsive cards and footer |
| 576 | `924:17713` | `4125e0ad89a9716df58c3099fd187f8ed50a90bb0bcaee1c8a08ff1e28d9497c` | mobile stacked rails and 2-column catalogue |
| 320 | `924:17948` | `0c1b4bbab22c11ffdbb8a2f121ea6c1d330b6bfd1b286f50469b030803b89d60` | hero 1070px; two 890px rails; 2x3 140x377 catalogue; mobile FAQ/SEO/footer |

## Mapped C76 owners → isolated DOM

| C76 node | Source geometry/state | DOM/CSS owner |
|---|---|---|
| `924:16999` | hero; responsive art and discovery chips | `.apn-hero`, `.apn-hero-cluster`, `.apn-search-card` |
| `926:20877`, `926:21514` | desktop 350x549 cards, 30px gap; mobile rail 250x437 with 50px arrows | `.apn-online-host`, `.apn-online`, `.apn-love-card`, `.apn-online__nav` |
| `926:20840`, `926:20865` | explainer then video | `.apn-neuro-proof`, `.apn-neuro-video` |
| `924:17017` / `924:17963` | catalogue: desktop 3-column; 320 2x3 140x377, 10px gaps | `.apn-neuro-catalog`, `.apn-neuro-catalog__grid`, `.apn-love-card` |
| `924:17079` | affordability | `.apn-affordable` |
| `924:17032` | reasons and client reviews | `.apn-reasons`, `.apn-clients` |
| `924:17102` | five FAQ items, item 3 open in source | `.apn-faq`, `[data-accordion-root]` |
| `924:17145`, `924:17183` | SEO accordion then footer | `.apn-answer-stack`, `.site-footer` |

Assets are existing local C76-derived `img/*` files resolved through the isolated page base. No remote asset is introduced. External reusable donor: none; the source-local advisor component is retained because the C76 1200 and 320 card nodes map directly to this DOM.
