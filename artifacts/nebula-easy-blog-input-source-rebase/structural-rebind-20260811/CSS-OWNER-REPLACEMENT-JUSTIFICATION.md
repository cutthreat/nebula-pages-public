# CSS owner replacement justification

- source_ref: current C76 manifest `E5A9922E6F77EEB1AB2CA58215F25EE94C54E3C71B3D73C4C95A5A3A956D2BC8` and `SOURCE-SUBTREE-MAP-20260811.md`.
- owner: isolated `.blog-input-article` pre/post body component in `nebula-easy-blog-input.html/.css`.
- scope: replace the effective inherited `.article-copy*` cascade with one explicit page-owned typography/rhythm contract; Home/shared/legacy rules remain byte-identical and no longer match this body subtree.
- rollback: restore HTML hash `01955AC4919DBF8F60A2AE6DC8C79CC9164D049568C9C71D39A3B3DA1BF0A895` and CSS hash `942CE3A9CCEE0D5A66EFB23187BCD2AE52202044E3BD8D0C88FA339091FEBEFF` from the retained pre-structural CSS artifact and the previous isolated HTML evidence.

The standalone CSS file grows because it now owns declarations previously supplied by `_unzipped/blog-input-new.css`. Effective matched owner rules do not grow: before `15/15/24/28/33` at `1200/992/768/576/320`; after `14/15/20/26/30`. The replacement removes cascade ownership ambiguity instead of stacking an override layer.
