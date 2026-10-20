import {readFile, mkdir, writeFile, copyFile} from 'node:fs/promises';
const c = JSON.parse(await readFile(new URL('../content/catalog.json', import.meta.url)));
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const link = item => {
  if (item.live_button !== true) return '';
  const url = new URL(item.url);
  if (url.protocol !== 'https:') throw new Error('Live links must use HTTPS');
  return `<a href="${escape(url.href)}">${escape(item.label ?? item.name)} <span aria-hidden="true">↗</span></a>`;
};
const games = [...c.wall].sort((a,b)=>a.order-b.order).map((g,i)=>`<article class="game ${escape(g.id)}" data-game="${escape(g.id)}">
<div class="game-art" aria-hidden="true"><span class="number">0${i+1}</span><div class="pixel-mark"><i></i><i></i><i></i><i></i><i></i></div>${g.platforms.length ? `<span class="platform">${escape(g.platforms.join(' · '))}</span>` : ''}</div>
<div class="game-copy"><h3>${escape(g.name)}</h3><p>${escape(g.summary)}</p><div class="links">${[...g.links,...g.stores].map(link).join('')}${![...g.links,...g.stores].some(x=>x.live_button===true)?'<span class="archive-note">Preserved in the archive</span>':''}</div></div></article>`).join('');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="A tribute to Sweet Pixel Studio: the games, the people, and a shared love of making things to play."><meta name="color-scheme" content="light"><title>${escape(c.title)} — A studio remembered</title><link rel="stylesheet" href="style.css"></head>
<body><a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="#" aria-label="Sweet Pixel Studio home"><span class="brand-pixel" aria-hidden="true"></span>SPS<span class="wordmark-caption">THE STUDIO ARCHIVE</span></a><nav aria-label="Main"><a href="#games">The games</a><a href="#people">The people</a><a href="#archive">The story</a></nav></header>
<main id="main"><section class="hero" aria-labelledby="title"><div class="eyebrow"><span></span> A LITTLE STUDIO. A LASTING IMPRESSION.</div><h1 id="title">SWEET <br>PIXEL <span>STUDIO</span><b aria-hidden="true">✳</b></h1><div class="hero-bottom"><p>For the games we made.<br>For the people who made them.</p><a class="hero-link" href="#games">Explore the archive <span aria-hidden="true">↓</span></a></div><div class="hero-footer"><span>INDEPENDENT SPIRIT, PRESERVED.</span><span>EST. IN MEMORIES / ALWAYS IN PLAY</span></div></section>
<section id="games" aria-labelledby="games-title"><div class="section-heading"><div><p class="eyebrow">01 / THE WORK</p><h2 id="games-title">Small studio.<br>Whole worlds.</h2></div><p>A collection of what we put into the world.<br>Original games, surviving links, lasting memories.</p></div><div id="game-wall">${games}</div><p class="caption">New graphic studies for this tribute. Original game artwork is preserved separately.</p></section>
<section id="trailers" aria-labelledby="trailers-title"><div><p class="eyebrow">FROM THE STUDIO CHANNEL</p><h2 id="trailers-title">More from the reel.</h2></div><div class="trailer-links">${c.trailers.map(t=>`<div>${link(t)}</div>`).join('')}</div></section>
<section id="people" aria-labelledby="people-title"><div class="section-heading"><div><p class="eyebrow">02 / THE PEOPLE</p><h2 id="people-title">The names<br>behind the pixels.</h2></div><p>From the studio’s About page and the 2014 README.<br>A small roll call. A big thank you.</p></div><ol id="credit-wall">${c.credits.map((p,i)=>`<li><span class="credit-index" aria-hidden="true">0${i+1}</span><h3>${escape(p.short)}</h3><p>${escape(p.role)}</p><span class="credit-pixel" aria-hidden="true">■</span></li>`).join('')}</ol></section>
<section id="archive" aria-labelledby="archive-title"><p class="eyebrow">03 / THE SPIRIT</p><h2 id="archive-title">Still a scrappy clan<br>at heart.</h2><blockquote>${escape(c.studio.blurb)}<cite>— From the original studio site</cite></blockquote><p class="quote">${escape(c.studio.quote)}</p><div class="archive-bottom"><p>This tribute brings together the 2014 archive and the later studio site. The original repository remains untouched. Some storefronts have closed; the work and the people are still worth remembering.</p><a href="${escape(c.archive.repository)}">Visit the 2014 archive <span aria-hidden="true">↗</span></a></div></section>
</main><footer><span>SWEET PIXEL STUDIO</span><p>Made with love for the people who were there.</p><a href="#title">Back to top ↑</a></footer></body></html>`;
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
await copyFile('web/style.css','dist/style.css');
console.log('Built static tribute from content/catalog.json');
