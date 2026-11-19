# AD Photography Website

Portfolio and booking website for AD Photography (Ashim Dahal), live at https://adlightstudio.com.

- Static site in the `site/` folder: `index.html`, compressed photos in `site/images/`, favicons, link preview image (`og-image.jpg`), `sitemap.xml` and `robots.txt`.
- Hosted on Cloudflare (project "adlightstudio") by direct upload. Pushing to GitHub does not deploy.
- Booking inquiries are sent by email through Web3Forms. A hidden spam trap field drops bot submissions.

## Deploy

1. In the Cloudflare dashboard, open the "adlightstudio" project and create a new deployment.
2. Upload the whole `site/` folder (drag the folder, or a zip of its contents). The custom domain stays attached.
3. Open https://adlightstudio.com and check the gallery and the booking form.

Fallback: `single-file/index.html` is a one-file copy with every photo embedded (about 2.8 MB). It works with the old "upload just index.html" flow, but it loads slower, and the link preview image and sitemap need the folder upload. Rebuild it after changes with `python3 tools/build_single_file.py`.

## Add or replace a gallery photo

1. Export the photo as WebP at two widths: 800 px and up to 1600 px, named like `wedding-01-800.webp` and `wedding-01-1600.webp`.
2. Put both in `site/images/`.
3. In `site/index.html`, replace a "Coming soon" `<button class="placeholder" ...>` with a `photo-frame` button copied from an existing photo, then update the file names, `width`/`height`, alt text and caption.

## Still to fill in

Search `site/index.html` for `TODO (Ashim)`: the Facebook page link and phone number in the footer are commented out until they're added.
