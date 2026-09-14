# CSS owner replacement justification

- source_ref: current C76 nodes `1002:23955/1002:24003` and `1005:22168/1005:22213`, plus `FIGMA-ADVISOR-SUBTREE-MAP.md`.
- owner: isolated `.blog-advisor` responsive component in `nebula-easy-blog.html/.css/.js`.
- scope: delete the dot-pager and mobile single-card ownership; bind exact 576 static two-card composition and exact 320 arrow-controlled 510px rail clipped by a 290px carrier. Other page owners and shared files remain untouched.
- rollback: restore HTML hash `504B9BA678E511682860335993F40424220FA483FABBF2115ADACD3AD0D43784`, CSS hash `7B5A4EA443366F03FA6F506FE6DCF4279D32B1976261EAB0738CA047431AAEA7`, and remove the page-local JS file.

CSS bytes grow by less than the 5% warning threshold. The line-count jump is mechanical formatting of the previously minified file so the superseded owner rules could be removed in place; it is not a new override layer.
