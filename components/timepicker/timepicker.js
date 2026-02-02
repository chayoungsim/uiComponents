export function createTimePicker() {
  let hour = 7;
  let minute = 0;
  let isPM = false;
  let isSelectingHour = true;

  const hourBox = document.getElementById('hourBox');
  const minuteBox = document.getElementById('minuteBox');
  const amBtn = document.getElementById('amBtn');
  const pmBtn = document.getElementById('pmBtn');
  const clockFace = document.getElementById('clockFace');
  const clockHand = document.getElementById('clockHand');
  const clockCenter = document.getElementById('clockCenter');

  /* ---------- active 동기화 ---------- */
  function syncActiveNumber() {
    const value = clockCenter.textContent.trim();

    clockFace.querySelectorAll('.clock-number').forEach(el => {
      el.classList.toggle(
        'active',
        el.textContent.trim() === value
      );
    });
  }

  /* ---------- Render ---------- */
  function renderNumbers() {
    clockFace.querySelectorAll('.clock-number').forEach(el => el.remove());

    const values = isSelectingHour
      ? [12,1,2,3,4,5,6,7,8,9,10,11]
      : [0,5,10,15,20,25,30,35,40,45,50,55];

    values.forEach((value, index) => {
      const angle = index * 30;
      const rad = angle * Math.PI / 180;
      const radius = 100;

      const x = 128 + radius * Math.sin(rad);
      const y = 128 - radius * Math.cos(rad);

      const el = document.createElement('div');
      el.className = 'clock-number';
      el.textContent = value;
      el.style.left = `${x - 20}px`;
      el.style.top = `${y - 20}px`;

      el.addEventListener('click', () => {
        if (isSelectingHour) {
          hour = value || 12;
        } else {
          minute = value;
        }
        update();
      });

      clockFace.appendChild(el);
    });

    syncActiveNumber();
  }

  /* ---------- Update ---------- */
  function update() {
    hourBox.textContent = String(hour).padStart(2, '0');
    minuteBox.textContent = String(minute).padStart(2, '0');

    const angle = isSelectingHour
      ? (hour % 12) * 30
      : (minute / 5) * 30;

    clockHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    clockCenter.textContent = isSelectingHour ? hour : minute;

    syncActiveNumber();
  }

  /* ---------- Clock Interaction ---------- */
  function handleClockClick(e) {
    const rect = clockFace.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let deg = Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI;
    if (deg < 0) deg += 360;

    if (isSelectingHour) {
      hour = Math.floor((deg + 15) / 30) || 12;
    } else {
      minute = Math.floor((deg + 3) / 6);
      minute = Math.round(minute / 5) * 5;
      if (minute === 60) minute = 0;
    }

    update();
  }

  /* ---------- Events ---------- */
  hourBox.addEventListener('click', () => {
    isSelectingHour = true;
    hourBox.classList.add('active');
    minuteBox.classList.remove('active');
    renderNumbers();
    update();
  });

  minuteBox.addEventListener('click', () => {
    isSelectingHour = false;
    minuteBox.classList.add('active');
    hourBox.classList.remove('active');
    renderNumbers();
    update();
  });

  amBtn.addEventListener('click', () => {
    isPM = false;
    amBtn.classList.add('active');
    pmBtn.classList.remove('active');
  });

  pmBtn.addEventListener('click', () => {
    isPM = true;
    pmBtn.classList.add('active');
    amBtn.classList.remove('active');
  });

  clockFace.addEventListener('click', handleClockClick);

  /* ---------- Init ---------- */
  renderNumbers();
  update();

  /* ---------- Public API ---------- */
  return {
    getTime() {
      return {
        hour,
        minute,
        isPM,
        formatted: `${isPM ? '오후' : '오전'} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      };
    },
    setTime(h, m, pm = false) {
      hour = h;
      minute = m;
      isPM = pm;
      update();
    }
  };
}
