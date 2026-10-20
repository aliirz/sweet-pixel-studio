import {access, copyFile, cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
const c = JSON.parse(await readFile(new URL('../content/catalog.json', import.meta.url)));
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const localSrc = src => {
  if (typeof src !== 'string' || !/^assets\/[a-z0-9./-]+$/.test(src) || src.includes('..')) throw new Error(`Asset path must stay inside assets/: ${src}`);
  return src;
};
const link = item => {
  if (item.live_button !== true) return '';
  const url = new URL(item.url);
  if (url.protocol !== 'https:') throw new Error('Live links must use HTTPS');
  return `<a href="${escape(url.href)}">${escape(item.label ?? item.name)} <span aria-hidden="true">↗</span></a>`;
};
for (const key of ['status_line', 'archive_heading', 'hero_kicker', 'hero_footer', 'art_caption']) {
  if (!c.studio[key]) throw new Error(`Missing studio.${key}`);
}
if (c.studio.active !== false || c.studio.tense !== 'past') throw new Error('The studio record must stay past tense and inactive');
const mark = `<img class="brand-mark" src="${escape(localSrc(c.studio.mark.src))}" alt="">`;
const games = [...c.wall].sort((a,b)=>a.order-b.order).map((g,i)=>{
  const thumb = g.thumbnail ? localSrc(g.thumbnail.src) : '';
  if (thumb && !g.thumbnail.alt) throw new Error(`Missing alt for ${g.id}`);
  const art = thumb
    ? `<img src="${escape(thumb)}" alt="${escape(g.thumbnail.alt)}">`
    : `<div class="pixel-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
  const platform = g.platforms.length ? `<span class="platform">${escape(g.platforms.join(' · '))}</span>` : '';
  const linked = [...g.links, ...g.stores];
  const links = linked.map(link).join('');
  const note = linked.some(x => x.live_button === true) ? '' : '<span class="archive-note">Preserved in the archive</span>';
  const memory = g.memory ? `<p class="memory">${escape(g.memory)}</p>` : '';
  return `<article class="game ${escape(g.id)}" data-game="${escape(g.id)}">
<div class="game-art${thumb ? ' has-art' : ''}"><span class="number" aria-hidden="true">0${i+1}</span>${art}${platform}</div>
<div class="game-copy"><h3>${escape(g.name)}</h3>${memory}<p${g.memory ? ' class="summary"' : ''}>${escape(g.summary)}</p><div class="links">${links}${note}</div></div></article>`;
}).join('');
const credits = c.credits.map((p,i)=>{
  const face = p.portrait
    ? `<img class="credit-portrait" src="${escape(localSrc(p.portrait.src))}" alt="">`
    : `<span class="credit-pixel" aria-hidden="true">■</span>`;
  return `<li><span class="credit-index" aria-hidden="true">0${i+1}</span><h3>${escape(p.short)}</h3><p>${escape(p.role)}</p>${face}</li>`;
}).join('');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(c.studio.status_line)}"><meta name="color-scheme" content="light"><title>${escape(c.title)} — A studio remembered</title><link rel="stylesheet" href="style.css"></head>
<body><a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="#" aria-label="Sweet Pixel Studio home">${mark}SPS<span class="wordmark-caption">THE STUDIO ARCHIVE</span></a><nav aria-label="Main"><a href="#games">The games</a><a href="#people">The people</a><a href="#archive">The story</a></nav></header>
<main id="main"><section class="hero" aria-labelledby="title"><div class="eyebrow"><span></span> ${escape(c.studio.hero_kicker)}</div><h1 id="title">SWEET <br>PIXEL <span>STUDIO</span><b aria-hidden="true">✳</b></h1><div class="hero-bottom"><p>For the games we made.<br>For the people who made them.</p><a class="hero-link" href="#games">Explore the archive <span aria-hidden="true">↓</span></a></div><p class="status-line">${escape(c.studio.status_line)}</p><div class="hero-footer"><span>INDEPENDENT SPIRIT, PRESERVED.</span><span>${escape(c.studio.hero_footer)}</span></div></section>
<section id="games" aria-labelledby="games-title"><div class="section-heading"><div><p class="eyebrow">01 / THE WORK</p><h2 id="games-title">Small studio.<br>Whole worlds.</h2></div><p>A collection of what we put into the world.<br>Original games, surviving links, lasting memories.</p></div><div id="game-wall">${games}</div><p class="caption">${escape(c.studio.art_caption)}</p></section>
<section id="trailers" aria-labelledby="trailers-title"><div><p class="eyebrow">FROM THE STUDIO CHANNEL</p><h2 id="trailers-title">More from the reel.</h2></div><div class="trailer-links">${c.trailers.map(t=>`<div>${link(t)}</div>`).join('')}</div></section>
<section id="people" aria-labelledby="people-title"><div class="section-heading"><div><p class="eyebrow">02 / THE PEOPLE</p><h2 id="people-title">The names<br>behind the pixels.</h2></div><p>From the studio’s About page and the 2014 README.<br>A small roll call. A big thank you.</p></div><ol id="credit-wall">${credits}</ol></section>
<section id="archive" aria-labelledby="archive-title"><p class="eyebrow">03 / THE SPIRIT</p><h2 id="archive-title">${escape(c.studio.archive_heading)}</h2><blockquote>${escape(c.studio.blurb)}<cite>— How the studio described itself then</cite></blockquote><p class="quote">${escape(c.studio.quote)}</p><div class="archive-bottom"><p>This page brings together the 2014 archive and the later studio site. The original repository remains untouched. Some storefronts have closed. The work and the people are what remain.</p><a href="${escape(c.archive.repository)}">Visit the 2014 archive <span aria-hidden="true">↗</span></a></div></section>
</main><footer><span>SWEET PIXEL STUDIO</span><p>Made with love for the people who were there.</p><a href="#title">Back to top ↑</a></footer></body></html>`;
if (html.includes(c.studio.invitation)) throw new Error('The hiring invitation does not belong on a closed studio page');
const used = new Set([c.studio.mark.src]);
for (const game of c.wall) if (game.thumbnail) used.add(game.thumbnail.src);
for (const person of c.credits) if (person.portrait) used.add(person.portrait.src);
for (const src of used) await access(new URL(`../web/${src}`, import.meta.url));
await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
await writeFile('dist/index.html', html);
await copyFile('web/style.css', 'dist/style.css');
await cp('web/assets', 'dist/assets', {recursive: true});
console.log('Built static tribute from content/catalog.json');
