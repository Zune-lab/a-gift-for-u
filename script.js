// ---------- Discord webhook config ----------
// Vào server Discord → Cài đặt server → Tích hợp (Integrations) → Webhooks
// → New Webhook → chọn kênh muốn nhận tin → Copy Webhook URL, rồi dán vào đây.
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1539578954414035058/6JVTAG2ZRk8AuOPdSasfg3jVH5sprnyVYMVR04A3Hy4JdYjkbb7XtdVqeLKqdJ0rsffj';

function discordConfigured() {
  return typeof DISCORD_WEBHOOK_URL === 'string' && !DISCORD_WEBHOOK_URL.includes('YOUR_WEBHOOK');
}

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

// ---------- photo stickers, scattered throughout the page ----------
// Each sticker now lives inline between different sections (not one
// filmstrip), so we just grab every .sticker on the page and give each
// a gentle fade/rise-in the first time it scrolls into view.
const stickers = Array.from(document.querySelectorAll('.sticker'));

if (stickers.length) {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    stickers.forEach((el) => io.observe(el));
  } else {
    stickers.forEach((el) => el.classList.add('in-view'));
  }
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
  const finalH = Math.min(Math.max(maxH + breathingRoom, 60), window.innerHeight * 0.5);
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
    // page just grew (envelope closed, letter opened) — let the sticker overlay catch up
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
  }, 900);
});

window.addEventListener('resize', () => {
  if (envelopeOpened) sizeLetterScroll();
});

// ---------- light stick: random encouragement each tap ----------
const lightstick = document.getElementById('lightstick');
const pulseContainer = document.getElementById('pulseContainer');
const lightHint = document.getElementById('lightHint');

const lightstickCorner = document.getElementById('lightstickCorner');
const pulseContainerCorner = document.getElementById('pulseContainerCorner');
const lightHintCorner = document.getElementById('lightHintCorner');

// the original icon always stays in the hero's normal flow — it's
// never removed from layout, so nothing below it can shift. a sentinel
// right after it tells us when it has scrolled out of view; only then
// does the separate fixed corner badge fade in via opacity (no layout
// change involved, so there's nothing that can flicker or get stuck).
const lightstickSentinel = document.getElementById('lightstickSentinel');
if (lightstickSentinel && lightstickCorner && 'IntersectionObserver' in window) {
  const lsObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    lightstickCorner.classList.toggle('show', scrolledPast);
  }, { threshold: 0 });
  lsObserver.observe(lightstickSentinel);
}

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

function triggerLightstick(hintEl, containerEl) {
  document.body.classList.add('lit');

  const msg = pickRandom(lightMessages, lastLightMsg);
  lastLightMsg = msg;
  hintEl.textContent = msg;
  replay(hintEl, 'pulse-text');

  // the corner badge is fixed to the viewport, so its hint is a floating
  // bubble that fades in on tap and fades back out a few seconds later —
  // otherwise it would sit permanently on top of whatever scrolls under it
  if (hintEl.closest('.lightstick-corner')) {
    clearTimeout(hintEl._hideTimer);
    hintEl.classList.add('visible');
    hintEl._hideTimer = setTimeout(() => {
      hintEl.classList.remove('visible');
    }, 3200);
  }

  // expanding ring
  const ring = document.createElement('div');
  ring.className = 'pulse-ring';
  containerEl.appendChild(ring);
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
    containerEl.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

lightstick.addEventListener('click', () => triggerLightstick(lightHint, pulseContainer));
if (lightstickCorner) {
  lightstickCorner.addEventListener('click', () => triggerLightstick(lightHintCorner, pulseContainerCorner));
}

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

// ---------- mini game: match-3 to unlock the gift hint ----------
const matchGrid = document.getElementById('matchGrid');
const gameProgressBar = document.getElementById('gameProgressBar');
const gameScoreText = document.getElementById('gameScoreText');
const giftHint = document.getElementById('giftHint');

if (matchGrid) {
  const ROWS = 6;
  const COLS = 6;
  const TILES = ['🧶', '💜', '✨', '🌙', '🎀', '💫'];
  const TARGET = 300;

  const gameHearts = document.getElementById('gameHearts');

  let board = [];
  let selected = null;
  let locked = false;
  let score = 0;
  let won = false;

  function randTile() {
    return Math.floor(Math.random() * TILES.length);
  }

  function getTileEl(r, c) {
    return matchGrid.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  }

  function buildBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        let t;
        do {
          t = randTile();
        } while (
          (c >= 2 && row[c - 1] === t && row[c - 2] === t) ||
          (r >= 2 && board[r - 1][c] === t && board[r - 2][c] === t)
        );
        row.push(t);
      }
      board.push(row);
    }
  }

  function findMatches() {
    const matched = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    // horizontal runs
    for (let r = 0; r < ROWS; r++) {
      let runStart = 0;
      for (let c = 1; c <= COLS; c++) {
        const cur = c < COLS ? board[r][c] : null;
        const startVal = board[r][runStart];
        if (c < COLS && cur !== null && cur === startVal) continue;
        if (c - runStart >= 3 && startVal !== null) {
          for (let k = runStart; k < c; k++) matched[r][k] = true;
        }
        runStart = c;
      }
    }
    // vertical runs
    for (let c = 0; c < COLS; c++) {
      let runStart = 0;
      for (let r = 1; r <= ROWS; r++) {
        const cur = r < ROWS ? board[r][c] : null;
        const startVal = board[runStart][c];
        if (r < ROWS && cur !== null && cur === startVal) continue;
        if (r - runStart >= 3 && startVal !== null) {
          for (let k = runStart; k < r; k++) matched[k][c] = true;
        }
        runStart = r;
      }
    }
    return matched;
  }

  function hasAnyMatch(matched) {
    return matched.some(row => row.some(Boolean));
  }

  function clearMatched(matched) {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (matched[r][c]) {
          board[r][c] = null;
          count++;
        }
      }
    }
    return count;
  }

  function applyGravity() {
    const newCells = new Set();
    for (let c = 0; c < COLS; c++) {
      let pointer = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][c] !== null) {
          board[pointer][c] = board[r][c];
          if (pointer !== r) board[r][c] = null;
          pointer--;
        }
      }
      for (let r = pointer; r >= 0; r--) {
        board[r][c] = randTile();
        newCells.add(r + ',' + c);
      }
    }
    return newCells;
  }

  function render(matched, newCells, initial) {
    matchGrid.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'match-tile';
        if (matched && matched[r][c]) {
          cell.classList.add('cleared');
        } else if (newCells && newCells.has(r + ',' + c)) {
          cell.classList.add('tile-drop');
          cell.style.animationDelay = (r * 30) + 'ms';
        } else if (initial) {
          cell.classList.add('tile-enter');
          cell.style.animationDelay = ((r * COLS + c) * 12) + 'ms';
        }
        cell.textContent = board[r][c] === null ? '' : TILES[board[r][c]];
        cell.dataset.r = r;
        cell.dataset.c = c;
        if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
        cell.addEventListener('click', onTileClick);
        matchGrid.appendChild(cell);
      }
    }
  }

  function updateProgress() {
    const pct = Math.min(100, (score / TARGET) * 100);
    gameProgressBar.style.width = pct + '%';
    gameScoreText.textContent = won
      ? `${TARGET} / ${TARGET} điểm — mở khóa rồi! 🎉`
      : `${score} / ${TARGET} điểm`;
  }

  function celebrateWin() {
    if (!gameHearts) return;
    const symbols = ['💜', '✨', '🎉', '🧶'];
    for (let i = 0; i < 16; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      h.style.left = (8 + Math.random() * 84) + '%';
      h.style.setProperty('--dx', (Math.random() * 100 - 50) + 'px');
      h.style.animationDelay = (Math.random() * 0.5) + 's';
      gameHearts.appendChild(h);
      setTimeout(() => h.remove(), 3200);
    }
  }

  function addScore(points) {
    if (won || points <= 0) return;
    score = Math.min(score + points, TARGET);
    updateProgress();
    replay(gameScoreText, 'pulse-text');
    replay(gameProgressBar, 'bar-glow');
    if (score >= TARGET) {
      won = true;
      updateProgress();
      giftHint.classList.add('show');
      celebrateWin();
      setTimeout(() => {
        giftHint.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }

  function resolveCascade(chain) {
    const matched = findMatches();
    if (!hasAnyMatch(matched)) {
      locked = false;
      render();
      return;
    }
    render(matched);
    const cleared = clearMatched(matched);
    addScore(cleared * 10 * chain);
    setTimeout(() => {
      const newCells = applyGravity();
      render(null, newCells);
      setTimeout(() => resolveCascade(chain + 1), 220);
    }, 280);
  }

  function trySwap(r1, c1, r2, c2) {
    locked = true;
    const tmp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tmp;
    render();

    const matched = findMatches();
    if (!hasAnyMatch(matched)) {
      const tile1 = getTileEl(r1, c1);
      const tile2 = getTileEl(r2, c2);
      if (tile1) tile1.classList.add('shake');
      if (tile2) tile2.classList.add('shake');
      setTimeout(() => {
        const tmp2 = board[r1][c1];
        board[r1][c1] = board[r2][c2];
        board[r2][c2] = tmp2;
        render();
        locked = false;
      }, 260);
      return;
    }

    const tile1 = getTileEl(r1, c1);
    const tile2 = getTileEl(r2, c2);
    if (tile1) tile1.classList.add('swap-pop');
    if (tile2) tile2.classList.add('swap-pop');
    setTimeout(() => resolveCascade(1), 90);
  }

  function onTileClick(e) {
    if (locked || won) return;
    const r = parseInt(e.currentTarget.dataset.r, 10);
    const c = parseInt(e.currentTarget.dataset.c, 10);

    if (!selected) {
      selected = { r, c };
      render();
      return;
    }
    if (selected.r === r && selected.c === c) {
      selected = null;
      render();
      return;
    }
    const adjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;
    if (!adjacent) {
      selected = { r, c };
      render();
      return;
    }
    const s = selected;
    selected = null;
    trySwap(s.r, s.c, r, c);
  }

  buildBoard();
  render(null, null, true);
  updateProgress();
}

// ---------- plan form: hangout time + message, sent to Discord ----------
const planForm = document.getElementById('planForm');
if (planForm) {
  const planDatetime = document.getElementById('planDatetime');
  const planMessage = document.getElementById('planMessage');
  const planSubmitBtn = document.getElementById('planSubmitBtn');
  const planStatus = document.getElementById('planStatus');

  function setPlanStatus(text, isError) {
    planStatus.textContent = text;
    planStatus.classList.toggle('error', !!isError);
  }

  // format a Date as "YYYY-MM-DDTHH:mm" in local time, for the
  // datetime-local input's min attribute (and re-used for "now")
  function toLocalDatetimeValue(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes())
    );
  }

  // block picking a past date/time straight from the picker UI
  planDatetime.min = toLocalDatetimeValue(new Date());

  function buildDiscordPayload(datetimeValue, messageValue) {
    const fields = [];
    if (datetimeValue) {
      const formatted = new Date(datetimeValue).toLocaleString('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      fields.push({ name: '📅 Giờ hẹn em chọn', value: formatted, inline: false });
    }
    if (messageValue) {
      fields.push({ name: '💌 Lời nhắn', value: messageValue, inline: false });
    }
    return {
      embeds: [
        {
          title: '💜 Zân En vừa gửi phản hồi!',
          color: 0x8c6fe6,
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  planForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datetimeValue = planDatetime.value; // "" if not chosen
    const messageValue = planMessage.value.trim();

    if (!datetimeValue && !messageValue) {
      setPlanStatus('chọn giờ hoặc nhắn gì đó cho anh nha 🥺', true);
      return;
    }

    // guard again on submit — the min attribute stops most cases, but
    // browsers vary in how strictly they enforce it (and a picker
    // opened a while ago could still point at a now-past time)
    if (datetimeValue && new Date(datetimeValue).getTime() < Date.now()) {
      setPlanStatus('giờ này qua rồi, chọn lại giúp anh nha 🥺', true);
      return;
    }

    if (!discordConfigured()) {
      setPlanStatus('chưa kết nối được, để anh kiểm tra lại xíu nha 🥲', true);
      return;
    }

    planSubmitBtn.disabled = true;
    setPlanStatus('đang gửi...');

    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildDiscordPayload(datetimeValue, messageValue)),
      });
      if (!res.ok) throw new Error('Discord webhook trả về lỗi ' + res.status);

      setPlanStatus('Nhận rồi nha !!! 💜');
      planForm.reset();
      planSubmitBtn.textContent = 'Đã gửi rồi 💜';
    } catch (err) {
      console.error('Lỗi gửi lịch hẹn:', err);
      setPlanStatus('gửi chưa được, em thử lại giúp anh nha 🥲', true);
      planSubmitBtn.disabled = false;
    }
  });
}

// ---------- hug button ----------
const heartsWrap = document.getElementById('hearts');
document.getElementById('hugBtn').addEventListener('click', () => {
  document.getElementById('hugMsg').classList.add('show');
  document.getElementById('hugSticker').classList.add('show');
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