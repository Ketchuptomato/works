/* =========================================
   ヒナタ洋菓子 — script.js
   ========================================= */

/* ---------- 第1画面：スライダー（中央表示・ループ） ---------- */
(function () {
  const hero  = document.querySelector('.hero');
  const track = document.getElementById('heroTrack');
  const dotsWrap = document.getElementById('heroDots');
  const originals = Array.from(track.children);
  const N = originals.length;
  const INTERVAL = 5000;

  // 前後に1セットずつ複製 → [複製, 本体, 複製]
  originals.forEach(s => track.appendChild(s.cloneNode(true)));
  originals.slice().reverse().forEach(s => track.insertBefore(s.cloneNode(true), track.firstChild));
  const slides = Array.from(track.children);
  slides.forEach((s, i) => { if (i < N || i >= 2 * N) s.setAttribute('aria-hidden', 'true'); });

  let pos = N;          // 本体の1枚目から開始
  let timer = null;
  let busy = false;

  // ドット
  const dots = originals.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `スライド ${i + 1}`);
    b.addEventListener('click', () => { go(N + i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  function render(animate) {
    hero.classList.toggle('no-anim', !animate);
    track.style.transition = animate ? '' : 'none';
    slides.forEach(s => { s.style.transition = animate ? '' : 'none'; });
    const w = slides[0].offsetWidth;
    const offset = (hero.offsetWidth - w) / 2 - pos * w;
    track.style.transform = `translateX(${offset}px)`;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === pos));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === pos % N));
  }

  let fallback = null;

  function go(next) {
    if (busy || next === pos) return;
    busy = true;
    pos = next;
    render(true);
    // transitionend が来ない場合（タブ非表示など）の保険
    clearTimeout(fallback);
    fallback = setTimeout(settle, 1000);
  }

  // 複製側に来たら、見た目を変えずに本体側へ瞬時に戻す
  function settle() {
    clearTimeout(fallback);
    busy = false;
    if (pos >= 2 * N || pos < N) {
      pos = pos >= 2 * N ? pos - N : pos + N;
      render(false);
      void track.offsetWidth; // 位置を確定させてからアニメーションを戻す
      track.style.transition = '';
      slides.forEach(s => { s.style.transition = ''; });
    }
  }

  track.addEventListener('transitionend', e => {
    if (e.target === track && e.propertyName === 'transform') settle();
  });

  document.getElementById('heroPrev').addEventListener('click', () => { go(pos - 1); restart(); });
  document.getElementById('heroNext').addEventListener('click', () => { go(pos + 1); restart(); });

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(pos + 1), INTERVAL);
  }
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);

  // スワイプ（スマホ）
  let startX = null;
  hero.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(dx < 0 ? pos + 1 : pos - 1); restart(); }
    startX = null;
  });

  window.addEventListener('resize', () => render(false));
  render(false);
  restart();
})();

/* ---------- 第2画面：商品ポップアップ ---------- */
const PRODUCTS = {
  bread: {
    cat: 'パン',
    name: 'メロンパン',
    img: 'https://images.unsplash.com/photo-1763469866616-2d7d7198c46c?auto=format&fit=crop&w=900&q=80',
    desc: '昭和の創業当時から変わらぬ配合で焼き上げる、ヒナタの看板パンです。表面のビスケット生地には、バターと卵をたっぷりと使い、職人がひとつひとつ手で包んでから格子模様をつけています。外はさっくりと香ばしく、中はふんわりやわらか。ほんのり甘い生地は、朝食にもおやつにもぴったりです。焼きたては毎朝十時頃から店頭に並びます。'
  },
  baked: {
    cat: '焼き菓子',
    name: 'チョコチップクッキー',
    img: 'https://images.unsplash.com/photo-1579618385552-046edd29f899?auto=format&fit=crop&w=900&q=80',
    desc: '発酵バターの豊かな香りに、ほろ苦いチョコチップをたっぷりと練り込んだ、昔ながらの手づくりクッキーです。小麦粉・バター・砂糖・卵というシンプルな素材を使い、職人がひとつひとつ手で丸めて低温でじっくりと焼き上げることで、外はさっくり、中はほろりとほどける食感に仕上げました。紅茶やコーヒーとの相性も抜群。レトロな缶入りは、ご贈答品としても喜ばれています。'
  },
  cake: {
    cat: 'ケーキ',
    name: 'モンブラン',
    img: 'https://images.unsplash.com/photo-1790328603645-b3976e484017?auto=format&fit=crop&w=900&q=80',
    desc: '厳選した国産栗をふんだんに使った、秋冬を代表するケーキです。土台には香ばしいメレンゲとしっとりしたスポンジを重ね、軽やかな生クリームを包み込むように、栗のクリームを細く丁寧に絞り出しました。てっぺんには渋皮栗の甘露煮をひと粒。栗本来の豊かな風味と上品な甘さを、どうぞゆっくりとお楽しみください。季節限定の人気商品です。'
  },
  gift: {
    cat: 'ギフト',
    name: 'マドレーヌ詰め合わせ',
    img: 'https://images.unsplash.com/photo-1692071097904-b549fdc4029a?auto=format&fit=crop&w=900&q=80',
    desc: '創業以来、変わらぬレシピで焼き続けているマドレーヌを中心に、人気の焼き菓子を詰め合わせました。たっぷりのバターとはちみつを使ったマドレーヌは、しっとりとした口当たりとやさしい甘さが自慢です。日持ちがするため、内祝いやお中元・お歳暮、ちょっとした手土産にも最適です。のし紙やメッセージカードのご用意も承っております。'
  }
};

(function () {
  const modal = document.getElementById('modal');
  const img   = document.getElementById('modalImg');
  const cat   = document.getElementById('modalCat');
  const name  = document.getElementById('modalName');
  const desc  = document.getElementById('modalDesc');
  let lastFocus = null;

  function open(key) {
    const p = PRODUCTS[key];
    if (!p) return;
    img.src = p.img;
    img.alt = p.name;
    cat.textContent = p.cat;
    name.textContent = p.name;
    desc.textContent = p.desc;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-product]').forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.product));
  });
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();
