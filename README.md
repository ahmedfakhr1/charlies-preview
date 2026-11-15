# Charlie's

Static site: `index.html`, `menu.html`, `reserve.html` and `visit.html` (a redirect to `reserve.html`). Deploy the contents of this folder at the root of the repository.

## Reservation form

The "Book your table" block (`id="reservation"`) sits in the right-hand column of the "Find us" section on `index.html` and on `reserve.html` (the address, hours and phone are the left-hand column). Every Book link on the site points to it.

The block always has the same framed space under the heading, 600px tall (640px on phones) and the width of the panel. It has two states, and the page does not move when it switches from one to the other.

1. Empty (how it ships). The framed space is a calm placeholder with one line, "Online booking opens soon.", and a quiet "Or call 0155 273 5204" link. There are no form fields and nothing to type into.

2. Form in place. The form fills that same space and a small "Call 0155 273 5204" link sits under it.

Two ways to plug the form in. Either one switches the block to state 2.

1. One setting. Open `js/app.js` and put the address of the booking form between the quotes on the first line of code:

   ```js
   const RESERVATION_FORM_URL = "https://example.com/book";
   ```

   The form opens in a responsive iframe (full width of the frame, lazy-loaded, no border). If the form needs more or less height, change `--stage-h` on `.resv-frame` in `css/site.css` (the phone value is in the `max-width: 520px` block at the end of that section). The empty state follows the same value, so the two stay the same size.

2. Embed snippet. If the form tool gives you an embed snippet (an iframe or a script tag), paste it inside the marked container, in both `index.html` and `reserve.html`:

   ```html
   <div class="resv-embed" data-embed>
     <!-- paste the snippet here -->
   </div>
   ```

   Leave `RESERVATION_FORM_URL` empty in that case.

After any change, raise the `?v=4` on the css and js links in the four html files (for example to `?v=5`) so browsers fetch the new files.

## Look and motion

- The site is dark: deep navy and near-black with brass lines and ivory text. A single fine grain (`img/grain.jpg`) lies over every dark section, and neighbouring sections run into each other through soft gradients, so there is no hard edge between them. The one ivory surface is the menu card on `menu.html`, with a soft shade around it.
- The hero is the night photo of the sign filling the first screen, under a navy-to-black gradient (darkest at the bottom and left, so the sign keeps glowing) and the same fine grain, with a very slow drift (scale 1 to 1.04 over 24 seconds). The logo, tagline and Book link sit low and left. The bottom of the hero melts into the next section.
- The brass arch outlines (by day and by night, the booking arch, the reservations arch, the menu plaque) are SVG lines drawn once when they come into view. They sit around the photos, never over them, and the photos themselves never move.
- Text reveals come in from different directions in different sections. Everything uses one easing curve and runs 0.6 to 1.4 seconds, using only transform and opacity.
- If a visitor has "reduce motion" switched on, all of it is off and everything is on screen at once. If the script fails to load, the page shows everything after a moment and the CSS rings stand in for the drawn outlines.
- The sticky row on the menu page has a brass marker that slides to the part of the menu in view. A tap on the row scrolls there smoothly.

## Photos

The photos now in `img/` are placeholders sitting in final-sized slots. To swap one, save the new photo under the same file name (WebP, under 220 KB) and update its `alt` text in the html; nothing else changes. Bigger is better: the layouts are made for sharp photos.

| File | Where it goes | Best source size |
| --- | --- | --- |
| `hero.webp` | Full-bleed first screen, cropped to cover. The focal point (the sign) is set by `object-position` on `.hero-bg img` in `css/site.css`. Keep the left and bottom dark: the text sits there. | 2400 x 1350 or larger (landscape) |
| `day-arch.webp` | The "By day" arch, 3:4 | 900 x 1200 |
| `night-arch.webp` | The "By night" arch, 3:4 | 900 x 1200 |
| `garden.webp` | The garden, left column | 1200 x 1500 |
| `sign-small.webp` | The garden, lower right, 16:10 | 1600 x 1000 |
| `dish-salad.webp`, `dish-chicken.webp`, `dish-halloumi.webp`, `dish-cake.webp` | The four "From the kitchen" tiles, 3:2 | 1200 x 800 each |
| `canopy.webp` | The small arch on the reservations page | 680 x 900 |

`prep_images.py` rebuilds these from the source photos and never upscales a file; point its lines at the new photos and run it, or export the WebP files by hand.

## Other things worth knowing

- Opening hours for the open or closed line are set on the `<body>` tag of each page: `data-open="540"` and `data-close="60"` are minutes after midnight (9 AM and 1 AM the next day), read in Cairo time.
- The العربية link shows the pop-up "Arabic version coming soon."
- The menu on `menu.html` is one printed-style card with four groups (Breakfast, All day, Desserts, Drinks) and a sticky row that jumps between them. A link such as `menu.html#desserts` lands on that group.
