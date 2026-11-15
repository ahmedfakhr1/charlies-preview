# Charlie's

Static site: `index.html`, `menu.html`, `reserve.html` and `visit.html` (a redirect to `reserve.html`). Deploy the contents of this folder at the root of the repository.

## Reservation form

The "Book your table" block (`id="reservation"`) sits in the right-hand column of the "Find us" section on `index.html` and on `reserve.html` (the address, hours and phone are the left-hand column). Every Book link on the site points to it.

Until a form exists the block shows two real actions: WhatsApp 0155 273 5204 with a ready-written message asking for a table, and Call.

Two ways to plug the form in. Either one switches the block to the form and keeps WhatsApp and Call as small links underneath.

1. One setting. Open `js/app.js` and put the address of the booking form between the quotes on the first line of code:

   ```js
   const RESERVATION_FORM_URL = "https://example.com/book";
   ```

   The form opens in a responsive iframe (full width, lazy-loaded, no border, minimum height 680px, 760px on phones). If the form needs more or less height, change `min-height` on `.resv-embed iframe` in `css/site.css`.

2. Embed snippet. If the form tool gives you an embed snippet (an iframe or a script tag), paste it inside the marked container, in both `index.html` and `reserve.html`:

   ```html
   <div class="resv-embed" data-embed>
     <!-- paste the snippet here -->
   </div>
   ```

   Leave `RESERVATION_FORM_URL` empty in that case.

After any change, raise the `?v=3` on the css and js links in the four html files (for example to `?v=4`) so browsers fetch the new files.

## Other things worth knowing

- Opening hours for the open or closed line are set on the `<body>` tag of each page: `data-open="540"` and `data-close="60"` are minutes after midnight (9 AM and 1 AM the next day), read in Cairo time.
- The العربية link shows the pop-up "Arabic version coming soon."
- The menu on `menu.html` is one printed-style card with four groups (Breakfast, All day, Desserts, Drinks) and a sticky row that jumps between them. A link such as `menu.html#desserts` lands on that group.
