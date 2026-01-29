// dayjs 플러그인 초기화
dayjs.extend(window.dayjs_plugin_weekday);
dayjs.extend(window.dayjs_plugin_isoWeek);

// 현재 날짜 상태 관리
let currentDates = {
    range: { year: 2026, month: 1 },
    regular: { year: 2026, month: 1 }
};

/**
 * Range Calendar의 날짜 영역만 동적으로 렌더링
 */
function renderRangeDays(year, month) {
    const grid = document.getElementById('rangeDaysGrid');
    const currentDate = dayjs(`${year}-${month}-01`);
    const today = dayjs();
    
    // 달의 첫날
    const firstDay = currentDate.startOf('month');
    
    // 첫 주의 일요일부터 시작
    const startDate = firstDay.day(0);
    
    // 날짜 셀 생성
    let html = '';
    
    // 42일치 날짜 생성 (6주)
    for (let i = 0; i < 42; i++) {
        const date = startDate.add(i, 'day');
        const day = date.date();
        const isCurrentMonth = date.month() === currentDate.month();
        const isToday = date.isSame(today, 'day');
        const isSunday = date.day() === 0;
        const isSaturday = date.day() === 6;
        
        // 클래스 배열 생성
        let classes = ['range-day-cell'];
        if (!isCurrentMonth) classes.push('not-current');
        if (isToday) classes.push('today');
        if (isSunday) classes.push('holiday-sun');
        if (isSaturday) classes.push('holiday-sat');
        
        // 예시 데이터: 특정 날짜에 스타일 적용
        if (isCurrentMonth && day === 15) classes.push('end');
        if (isCurrentMonth && day === 19) classes.push('selected');
        
        html += `
            <div class="${classes.join(' ')}">
                <span class="day-text">${day}</span>
                ${isToday ? '<span class="day-text2">오늘</span>' : ''}
                ${isCurrentMonth && day === 15 ? '<span class="day-text2">종료일</span>' : ''}
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

/**
 * Regular Calendar의 날짜 영역만 동적으로 렌더링
 */
function renderRegularDays(year, month) {
    const grid = document.getElementById('regularDaysGrid');
    const currentDate = dayjs(`${year}-${month}-01`);
    
    // 달의 첫날
    const firstDay = currentDate.startOf('month');
    
    // 첫 주의 일요일부터 시작
    const startDate = firstDay.day(0);
    
    // 날짜 셀 생성
    let html = '';
    
    // 35일치 날짜 생성 (5주)
    for (let i = 0; i < 35; i++) {
        const date = startDate.add(i, 'day');
        const day = date.date();
        const isCurrentMonth = date.month() === currentDate.month();
        
        // 클래스 배열 생성
        let classes = ['day-cell'];
        if (!isCurrentMonth) classes.push('not-current');
        
        // 예시 데이터: 특정 날짜에 스타일 적용
        if (isCurrentMonth && day === 17) classes.push('selected');
        if (isCurrentMonth && day === 19) classes.push('end');
        
        html += `
            <div class="${classes.join(' ')}">
                <span class="day-number">${isCurrentMonth || day !== 1 ? day : ''}</span>
                ${isCurrentMonth && day === 19 ? `
                    <div class="donut-chart-wrap">
                        <svg width="40" height="40" class="donut-chart">
                            <circle class="donut-progress" stroke="#39B695" stroke-width="1" fill="transparent" r="20.5" cx="21" cy="21"></circle>
                        </svg>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

/**
 * Range Calendar 타이틀 업데이트
 */
function updateRangeTitle(year, month) {
    const titleElement = document.getElementById('rangeTitle');
    titleElement.textContent = `${year}. ${String(month).padStart(2, '0')}`;
}

/**
 * Regular Calendar 타이틀 업데이트
 */
function updateRegularTitle(year, month) {
    const titleElement = document.getElementById('regularTitle');
    titleElement.innerHTML = `
        ${year}. ${String(month).padStart(2, '0')}
        <span class="picker-arrow">▼</span>
    `;
}

/**
 * Range Calendar 월 변경
 */
function changeRangeMonth(delta) {
    const date = currentDates.range;
    const newDate = dayjs(`${date.year}-${date.month}-01`).add(delta, 'month');
    
    currentDates.range = {
        year: newDate.year(),
        month: newDate.month() + 1
    };
    
    updateRangeTitle(newDate.year(), newDate.month() + 1);
    renderRangeDays(newDate.year(), newDate.month() + 1);
}

/**
 * Regular Calendar 월 변경
 */
function changeRegularMonth(delta) {
    const date = currentDates.regular;
    const newDate = dayjs(`${date.year}-${date.month}-01`).add(delta, 'month');
    
    currentDates.regular = {
        year: newDate.year(),
        month: newDate.month() + 1
    };
    
    updateRegularTitle(newDate.year(), newDate.month() + 1);
    renderRegularDays(newDate.year(), newDate.month() + 1);
}

/**
 * 이벤트 리스너 등록
 */
function initEventListeners() {
    // Range Calendar 버튼
    document.getElementById('rangePrevBtn').addEventListener('click', () => changeRangeMonth(-1));
    document.getElementById('rangeNextBtn').addEventListener('click', () => changeRangeMonth(1));
    
    // Regular Calendar 버튼
    document.getElementById('regularPrevBtn').addEventListener('click', () => changeRegularMonth(-1));
    document.getElementById('regularNextBtn').addEventListener('click', () => changeRegularMonth(1));
}

/**
 * 초기화
 */
function init() {
    // 이벤트 리스너 등록
    initEventListeners();
    
    // 초기 렌더링
    renderRangeDays(2026, 1);
    renderRegularDays(2026, 1);
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
