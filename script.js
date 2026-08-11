// ---------- starfield ----------
const field = document.getElementById('starfield');
const starCount = window.innerWidth < 600 ? 40 : 90;
for (let i = 0; i < starCount; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  s.style.left = Math.random() * 100 + 'vw';
  s.style.top = Math.random() * 100 + 'vh';
  s.style.animationDelay = (Math.random() * 3.5) + 's';
  field.appendChild(s);
}

// ---------- helper: pick a random message, avoid immediate repeat ----------
function pickRandom(pool, lastPick) {
  if (pool.length === 1) return pool[0];
  let choice;
  do {
    choice = pool[Math.floor(Math.random() * pool.length)];
  } while (choice === lastPick);
  return choice;
}

function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // restart animation
  el.classList.add(className);
}

// ---------- envelope open ----------
const envelope = document.getElementById('envelope');
const envelopeScene = document.getElementById('envelopeScene');
const envelopeHint = document.getElementById('envelopeHint');
const letterReveal = document.getElementById('letterReveal');
const letterScroll = document.getElementById('letterScroll');
const letterDots = document.getElementById('letterDots');
const pages = Array.from(document.querySelectorAll('.letter-page'));
let envelopeOpened = false;

// build the progress dots, one per page
pages.forEach((_, i) => {
  const dot = document.createElement('span');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => {
    pages[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  });
  letterDots.appendChild(dot);
});
const dotEls = Array.from(letterDots.children);

// track which page is currently in view and light up the matching dot
const pageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const idx = pages.indexOf(entry.target);
    if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
      entry.target.classList.add('active');
      if (dotEls[idx]) {
        dotEls.forEach(d => d.classList.remove('active'));
        dotEls[idx].classList.add('active');
      }
    } else {
      entry.target.classList.remove('active');
    }
  });
}, { root: letterScroll, threshold: [0, 0.6, 1] });
pages.forEach(p => pageObserver.observe(p));

// size the box to fit the tallest paragraph exactly — no more leftover
// empty space under short pages like the signature
function sizeLetterScroll(){
  let maxH = 0;
  pages.forEach(page => {
    let h = 0;
    page.querySelectorAll('p').forEach(el => {
      const cs = getComputedStyle(el);
      h += el.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
    });
    if (h > maxH) maxH = h;
  });
  const breathingRoom = 8;
  const finalH = Math.min(Math.max(maxH + breathingRoom, 60), window.innerHeight * 0.4);
  letterScroll.style.height = finalH + 'px';
}

envelopeScene.addEventListener('click', () => {
  if (envelopeOpened) return;
  envelopeOpened = true;

  envelope.classList.add('open');
  envelopeHint.textContent = 'đang mở thư...';

  setTimeout(() => {
    envelopeScene.classList.add('gone');
    letterReveal.style.display = 'block';
    sizeLetterScroll();
    // make sure the reader always starts on page 1
    letterScroll.scrollTop = 0;
    pages.forEach(p => p.classList.remove('active'));
    dotEls.forEach(d => d.classList.remove('active'));
    pages[0].classList.add('active');
    dotEls[0].classList.add('active');
    // two rAFs so the browser paints display:block first, then transitions cleanly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        letterReveal.classList.add('show');
      });
    });
    setTimeout(() => {
      letterReveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
  }, 900);
});

window.addEventListener('resize', () => {
  if (envelopeOpened) sizeLetterScroll();
});

// ---------- light stick: random encouragement each tap ----------
const lightstick = document.getElementById('lightstick');
const pulseContainer = document.getElementById('pulseContainer');
const lightHint = document.getElementById('lightHint');

const lightMessages = [
  'mọi chuyện rồi cũng sẽ ổn thôi mà 💜',
  'cả khán đài đang lấp lánh cùng em',
  'ARMY luôn ở bên BTS, anh cũng vậy, sáu năm nay có đổi đâu vẫn ở bên em mà 💜',
  'bật đèn lên cho tâm trạng khá hơn một xíu nhé ✨',
  'một đốm sáng nhỏ, nhưng là của em',
  'dù sân khấu nào, em vẫn có một góc để toả sáng',
  'nghỉ một chút rồi lại rực rỡ tiếp em nhé',
  'em không cần hoàn hảo để được thương, quen nhau lâu vậy anh biết rõ mà',
  'hôm nay chưa sáng thì để mai anh bật sáng cùng em 💜'
];
let lastLightMsg = null;

lightstick.addEventListener('click', () => {
  document.body.classList.add('lit');

  const msg = pickRandom(lightMessages, lastLightMsg);
  lastLightMsg = msg;
  lightHint.textContent = msg;
  replay(lightHint, 'pulse-text');

  // expanding ring
  const ring = document.createElement('div');
  ring.className = 'pulse-ring';
  pulseContainer.appendChild(ring);
  setTimeout(() => ring.remove(), 1200);

  // sparkle particles
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('span');
    p.className = 'spark';
    p.textContent = ['✨', '💜', '·'][Math.floor(Math.random() * 3)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 50;
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist - 30 + 'px');
    p.style.animationDelay = (Math.random() * 0.15) + 's';
    pulseContainer.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
});

// ---------- yarn ball: random encouragement each tap ----------
const yarnBall = document.getElementById('yarnBall');
const yarnQuote = document.getElementById('yarnQuote');

const yarnMessages = [
  'Lỡ tuột một mũi thì tháo ra đan lại,<br>chứ không ai vứt cả cuộn len đi bao giờ.',
  'Muốn đan được cái túi đẹp thì lỡ tay tháo ra vài lần cũng là bình thường mà.',
  'Cứ từ từ thôi, đan chậm một chút cũng không sao.',
  'Sợi len có rối thì từ từ gỡ cũng ra,<br>hôm nay mệt rồi thì cứ cất đó mai hẵng gỡ tiếp em nha.',
  'Quen nhau 7 năm hơn, anh thấy em vượt qua bao nhiêu chuyện khó hơn vầy rồi.',
  'Nghỉ tay một chút đi em,<br>cuộn len vẫn ở đó chờ em, và anh cũng vậy.',
  'Tháo len ra đan lại em còn chẳng nản, dăm ba chuyện này từ từ rồi mình tính.'
];
let lastYarnMsg = null;

yarnBall.addEventListener('click', () => {
  yarnBall.classList.add('unraveled');

  const msg = pickRandom(yarnMessages, lastYarnMsg);
  lastYarnMsg = msg;
  yarnQuote.innerHTML = msg;
  yarnQuote.classList.add('show');
  replay(yarnQuote, 'pulse-text');
});

// ---------- hug button ----------
const heartsWrap = document.getElementById('hearts');
document.getElementById('hugBtn').addEventListener('click', () => {
  document.getElementById('hugMsg').classList.add('show');
  const symbols = ['💜', '🤍', '🧶', '✨'];
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.left = (45 + Math.random() * 10) + '%';
    h.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    h.style.animationDelay = (Math.random() * 0.4) + 's';
    heartsWrap.appendChild(h);
    setTimeout(() => h.remove(), 3200);
  }
});