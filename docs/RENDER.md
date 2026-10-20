# Render contract

Read `content/catalog.json`. Do not invent a sixth wall game or a tenth credit.

## Game wall

Render `wall` in `order`. The names are Pixel Fall, Abode, Monster Jump, Boom, and Johnny Ace, once each.

The uniqueness and order check targets this wall. Shootman Runner and Zama Truck are in `trailers` and may appear in a trailer row. Their names on that row are not a wall failure.

Pixel Fall was the 2014 game and was not on the 2018 homepage. The 2018 homepage order was Abode, Monster Jump, Boom. The wall keeps Pixel Fall first so the earlier game stays in the record.

## Links

Render a link only when `live_button` is true.

- Abode's only game link is the GameJolt URL.
- Boom has no live game link and no live store button. Its store ids stay in `stores` for the offline record.
- Pixel Fall and Monster Jump trailers may show. Their store ids must not become buttons.
- Boom's store ids, `com.sps.boom` and `1184904558`, must not become buttons.
- Do not render `character_filenames` as credits. They are Boom characters.

## Credits

Render all nine credits: each `short` name and `role`, in catalog order. That includes Sayyam and Mubassir Hayat. Fuller names and filenames are provenance.

Johnny Ace is the fifth game card. Do not also render that name as a person. The withheld list is empty.

## Page

The homepage title is SWEET PIXEL STUDIO. The studio is inactive. Render `status_line`, `archive_heading`, `hero_footer`, and `art_caption` from the catalog. Keep the blurb and the quote as words the studio used then. Do not render the hiring invitation.

Render `thumbnail.src` and `thumbnail.alt` on a wall card when `thumbnail` is an object. Copy the file from `web/` into the build. Do not hotlink. Johnny Ace has no thumbnail, so that card keeps the geometric stand-in.

Render `portrait.src` beside a credit when `portrait` is an object. Seven About-page portraits exist. Sayyam and Mubassir Hayat have none.

Do not add a playable game, a Mailchimp action, or a Google Analytics snippet. Leave out Sweet-Deadpool.svg, Playstation-Icons.png, and the rest of the sticker sheet. The empty press-kit anchors stay off. The commented Honest Game Trailers embed stays off.

## Checks

Deterministic build checks read the catalog and the rendered page. They do not fetch the network.

Record a fresh status check by editing `content/network-observations.json`. A 404, a 429, or an upstream outage does not fail the build. Do not flip `live_button` because one recheck failed.
