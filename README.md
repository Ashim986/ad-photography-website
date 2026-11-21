# AD Photography Website

Portfolio and booking website for AD Photography (Ashim Dahal), live at https://adlightstudio.com.

- Static site in the `site/` folder. Five pages, each in its own folder so the addresses stay short:
  - `index.html` Home (`/`)
  - `gallery/index.html` Gallery (`/gallery/`)
  - `pricing/index.html` Pricing (`/pricing/`)
  - `about/index.html` About (`/about/`)
  - `contact/index.html` Contact and booking (`/contact/`)
  - `reviews/index.html` Client reviews and the review form (`/reviews/`, linked from the footer)
- Shared files: `assets/site.css` (all styles) and `assets/site.js` (phone menu, gallery filters and rows, photo viewer, booking form). Photos are WebP files in `images/`.
- Favicons, link preview image (`og-image.jpg`), `sitemap.xml` and `robots.txt` sit at the top of `site/`.
- Booking inquiries are sent by email through Web3Forms. A hidden spam trap box drops bot submissions.
- Old links like `adlightstudio.com/#booking` or `/#pricing` forward to the new pages.
- `design/` holds the approved design source. See `design/README.md`.

## Deploy

Hosted on Cloudflare (project "adlightstudio"). Pushing to GitHub does not deploy on its own.

By hand:

1. In the Cloudflare dashboard, open Workers & Pages, then the "adlightstudio" project, then Create deployment.
2. Upload the whole `site/` folder (drag the folder, or a zip of what is inside it). The `site/` folder itself must be the top, so `index.html` and the `gallery/` folder sit at the root of the upload.
3. Open https://adlightstudio.com, then the Gallery, Pricing, About and Contact pages, and send yourself a test inquiry.

Automatic (optional): Cloudflare Pages can deploy from GitHub on every push to `master`. A project made by direct upload can't be switched to Git, so this means creating a new Pages project connected to this repository (build command: none, build output directory: `site`, production branch: `master`), then moving the adlightstudio.com custom domain to it.

## Add a gallery photo

1. Export the photo as WebP at two sizes: about 800 px and about 1600 px on the long side, named like `wedding-day-first-look-800.webp` and `wedding-day-first-look-1600.webp`. Don't put client names in file names.
2. Put both in `site/images/`.
3. In `site/gallery/index.html`, find the row for that session (each row is a `<section class="event-row">`). Copy one `<li class="tile">` in it, then change the file names, `width` and `height`, the alt text and `data-src`. To start a new session row, copy a whole `event-row` section and change its `id`, title, the line above the title and `data-category` (any of: portraits weddings events family maternity graduation indoor, separated by spaces).
4. A row that has a "Photos coming soon" card: delete that `<li class="tile">` once real photos are in.

## Client reviews

- Clients rate their session (1 to 5 stars) and write a few words on `/reviews/`. It arrives by email through Web3Forms, the same way as booking inquiries, with "OK to show on website: Yes or No". Nothing is posted on its own.
- To show a review, add it to `site/assets/reviews.json` (only when the client said Yes, or for a Google review). It then appears on `/reviews/`, and up to 3 marked `"featured": true` appear on the home page. While the list is empty, the home section stays hidden.
- Never add a made-up or sample review to this file.

```json
{
  "googleReviewLink": "https://g.page/r/.../review",
  "googleListingLink": "https://maps.app.goo.gl/...",
  "reviews": [
    { "name": "First name L.", "session": "Maternity", "date": "2026-10", "rating": 5, "text": "Their words, as written.", "source": "site", "featured": true }
  ]
}
```

- `googleReviewLink`: the "Get more reviews" link from Google Business Profile. When set, the thank-you message offers it to every client, whatever their rating (Google does not allow asking only happy clients).
- `googleListingLink`: the Google Maps listing. When set, `/reviews/` shows a "Read our Google reviews" button.
- `source`: `"site"` for the review form, `"google"` for one copied from Google (shown as "Posted on Google").
