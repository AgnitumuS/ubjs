# Icons for `ub-icons` font

Content of this folder is combined into the font files + css using `webfont` and config from `../.webfontrc.json`.

All SVG icons MUST be of size 20x20

Allowed tags are: 'rect', 'line', 'circle', 'ellipsis', 'polyline' and 'polygon' - will be converted to `path`.
Multiple path's will be merged.

Good cross-platform SVG editor is [BoxySvg](https://boxy-svg.com)

Avoid any `transform="`, `fill` etc. Icon template is:
```svg
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="....."></path>
</svg>
```
To avoid updates conflicts each file name MUST starts from icon 
Unicode code ([private codes range](https://codepoints.net/U+f0001) what starts with `F` should be used.
The file name format is `${icon.unicode}-${icon.name}.svg`.

In case you need to add a new icon - use last number + 1 as a unicode prefix.
For example in case last code is `uF096-someFile.svg` then new icon should be `uF097-newIcon.svg`.

NOTE: Number are HEX !!!  So, after `uF109-someIcon.svg` MUST go `uF10A-someOtherIcon.svg` and NOT `uF110-someOtherIcon.svg`

Do not use (or change) existed unicode codes. See [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont) for details.
