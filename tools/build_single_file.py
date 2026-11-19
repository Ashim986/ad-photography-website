#!/usr/bin/env python3
"""Build a one-file copy of the site for the old "upload just index.html" flow.

The normal deploy is the whole site/ folder. This fallback writes
single-file/index.html with every photo embedded once (no duplicates).
Lazy loading, the link preview image and the sitemap only work with the
folder upload, so prefer that.

Usage: python3 tools/build_single_file.py
"""
import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
OUT = ROOT / "single-file" / "index.html"


def data_uri(rel_path: str) -> str:
    path = SITE / rel_path.lstrip("/")
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".webp":
        mime = "image/webp"
    if path.suffix == ".ico":
        mime = "image/x-icon"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def largest(srcset: str) -> str:
    best = max(
        (c.strip().rsplit(" ", 1) for c in srcset.split(",")),
        key=lambda pair: int(pair[1].rstrip("w")),
    )
    return best[0]


html = (SITE / "index.html").read_text(encoding="utf-8")

# Gallery: drop the separate lightbox copy; the lightbox reuses the shown photo.
html = re.sub(r'\sdata-src="[^"]*"', "", html)


# Any <img> with a srcset: keep only the largest version, embedded once.
def inline_img(match: re.Match) -> str:
    tag = match.group(0)
    srcset = re.search(r'srcset="([^"]*)"', tag)
    if srcset:
        src = largest(srcset.group(1))
        tag = re.sub(r'\ssrcset="[^"]*"', "", tag)
        tag = re.sub(r'\ssizes="[^"]*"', "", tag)
        tag = re.sub(r'src="[^"]*"', f'src="{data_uri(src)}"', tag, count=1)
    else:
        tag = re.sub(
            r'src="(images/[^"]*)"', lambda m: f'src="{data_uri(m.group(1))}"', tag, count=1
        )
    return tag.replace(' loading="lazy"', "")


html = re.sub(r"<img\b[^>]*>", inline_img, html)

# Favicons: embed the .ico; drop the PNG icons that need separate files.
html = html.replace('href="/favicon.ico"', f'href="{data_uri("favicon.ico")}"')
html = re.sub(r'\s*<link rel="(?:icon|apple-touch-icon)"[^>]*\.png"[^>]*/>', "", html)

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024 / 1024:.1f} MB)")
