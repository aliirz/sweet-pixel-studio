# Sweet Pixel Studio

Preservation catalog for the studio. The playable browser games are waiting.

[aliirz/SweetPixelStudios](https://github.com/aliirz/SweetPixelStudios) is the 2014 site and stays the archive. Its last commit is `d7bb3f727126966ab279b1e24aecc1318c989a85` on 2014-11-29. Do not rewrite it.

sweetpixelstudio.com is the later site. It is not in that repository. This catalog records the games, the team, and the links from that site.

## What is here

- `content/catalog.json` is the render contract: the game wall, the trailer row, and the credits.
- `content/network-observations.json` is a dated status record. It is not a build check.
- `docs/RENDER.md` says what the site shell should show.
- `docs/SOURCES.md` cites the pages these facts came from.

There is no game, no Mailchimp form, no analytics, and no copied art in this commit.

## Wall

1. Pixel Fall
2. Abode
3. Monster Jump
4. Boom

Shootman Runner and Zama Truck are trailers, not wall games. Sayyam, Mubassir Hayat, and Johnny Ace are recorded under `withheld` and stay off the credit wall.

Store buttons stay off. The store pages checked on 2026-10-20 returned 404. Abode still links to GameJolt. Trailer buttons stay on where the oembed check returned 200.

## Owners

djangrok owns `content/catalog.json` and this preservation pass. Codexcore owns the test runner and the site shell. Build the shell from the catalog. Keep network checks in the observations file.
