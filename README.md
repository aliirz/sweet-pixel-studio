# Sweet Pixel Studio

Preservation catalog for the studio. The playable browser games are waiting.

[aliirz/SweetPixelStudios](https://github.com/aliirz/SweetPixelStudios) is the 2014 site and stays the archive. Its last commit is `d7bb3f727126966ab279b1e24aecc1318c989a85` on 2014-11-29. Do not rewrite it.

sweetpixelstudio.com is the later site. It is not in that repository. This catalog records the games, the team, and the links from that site.

## What is here

- `content/catalog.json` is the render contract: the game wall, the trailer row, and the credits.
- `content/network-observations.json` is a dated status record. It is not a build check.
- `docs/RENDER.md` says what the site shell should show.
- `docs/SOURCES.md` cites the pages these facts came from.

There is no game, no Mailchimp form, and no analytics. Original game thumbnails and the seven About-page portraits are in `web/assets/`. The studio is recorded as inactive.

## Wall

1. Pixel Fall
2. Abode
3. Monster Jump
4. Boom
5. Johnny Ace

Shootman Runner and Zama Truck are trailers, not wall games. Johnny Ace is a studio game, not a teammate. The credit wall is the seven About-page names. Sayyam and Mubassir Hayat are withheld. Mubbasher Khanzada stays.

Store buttons stay off. The store pages checked on 2026-10-20 returned 404. Abode still links to GameJolt. Trailer buttons stay on where the oembed check returned 200.

## Owners

djangrok owns `content/catalog.json` and this preservation pass. Codexcore owns the test runner and the site shell. Build the shell from the catalog. Keep network checks in the observations file.

## Tribute shell

Use Node.js 22+ and Python 3. No package installation is needed.

```sh
npm test
npm run preview
```

Open `http://localhost:4173`. `npm run build` generates `dist/index.html`, `dist/style.css`, and `dist/assets/` from the catalog and `web/`. The site is static: no client JavaScript, remote fonts, embedded video, analytics or automatic network requests. External destinations load only when their links are followed. Game cards use the original thumbnails. Johnny Ace still has the geometric stand-in, because no thumbnail survived in the archive.

The offline suite checks the actual generated HTML: wall order/uniqueness, exact credit names and roles, allowed game and trailer links, hidden store IDs, catalogued platform labels, studio blurb and quote, preservation scope and navigation. Network observations do not enter the build. Pixel Fall gameplay and tests remain deferred.

For visual acceptance, check at 390px and 1280px: headings, wall cards and credit rows fit without horizontal scrolling; navigation and every external link are usable by keyboard; the separate trailer row does not look like additional wall games. Hosting preview is private and does not replace the historic domain.

## Published site

Pushes to `main` run `npm test` and publish `dist/` to [aliirz.github.io/sweet-pixel-studio](https://aliirz.github.io/sweet-pixel-studio/). Asset paths stay relative, so the page works from that project path. sweetpixelstudio.com still serves the 2018 site and is not pointed here.
