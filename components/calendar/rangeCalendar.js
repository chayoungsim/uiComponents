// dayjs 플러그인 초기화
dayjs.extend(window.dayjs_plugin_weekday);
dayjs.extend(window.dayjs_plugin_isoWeek);

// Range Calendar 현재 날짜 상태 관리
let rangeCurrentDate = { year: 2026, month: 1 };

/**
 * Year/Month Picker 생성 (Range Calendar용)
 */
function createRangeYearMonthPicker(targetElement, currentYear, currentMonth, onSelect) {
    // 기존 picker 제거 (토글 기능)
    const existingPicker = document.querySelector('.year-month-picker');
    if (existingPicker) {
        existingPicker.remove();
        return;
    }

    const picker = document.createElement('div');
    picker.className = 'year-month-picker';

    // 년도 목록 생성 (현재 년도 기준 ±10년)
    const yearCol = document.createElement('div');
    yearCol.className = 'picker-col';
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        const yearItem = document.createElement('div');
        yearItem.className = `picker-item ${year === currentYear ? 'active' : ''}`;
        yearItem.textContent = `${year}년`;
        yearItem.dataset.year = year;
        yearCol.appendChild(yearItem);
    }

    // 월 목록 생성
    const monthCol = document.createElement('div');
    monthCol.className = 'picker-col';
    
    for (let month = 1; month <= 12; month++) {
        const monthItem = document.createElement('div');
        monthItem.className = `picker-item ${month === currentMonth ? 'active' : ''}`;
        monthItem.textContent = `${month}월`;
        monthItem.dataset.month = month;
        monthCol.appendChild(monthItem);
    }

    picker.appendChild(yearCol);
    picker.appendChild(monthCol);

    // picker를 header 영역에 추가
    const header = targetElement.closest('.range-header');
    header.style.position = 'relative';
    header.appendChild(picker);

    // 활성화된 항목으로 스크롤
    setTimeout(() => {
        const activeYear = yearCol.querySelector('.active');
        const activeMonth = monthCol.querySelector('.active');
        if (activeYear) {
            activeYear.scrollIntoView({ block: 'center' });
        }
        if (activeMonth) {
            activeMonth.scrollIntoView({ block: 'center' });
        }
    }, 0);

    // 년도/월 선택 이벤트
    let selectedYear = currentYear;
    let selectedMonth = currentMonth;

    yearCol.addEventListener('click', (e) => {
        if (e.target.classList.contains('picker-item')) {
            yearCol.querySelectorAll('.picker-item').forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            selectedYear = parseInt(e.target.dataset.year);
            
            // 년도 선택 시 즉시 적용
            onSelect(selectedYear, selectedMonth);
            picker.remove();
        }
    });

    monthCol.addEventListener('click', (e) => {
        if (e.target.classList.contains('picker-item')) {
            monthCol.querySelectorAll('.picker-item').forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            selectedMonth = parseInt(e.target.dataset.month);
            
            // 월 선택 시 즉시 적용
            onSelect(selectedYear, selectedMonth);
            picker.remove();
        }
    });

    // 외부 클릭 시 picker 닫기
    setTimeout(() => {
        document.addEventListener('click', function closePicker(e) {
            if (!picker.contains(e.target) && !targetElement.contains(e.target)) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        });
    }, 0);
}

/**
 * Range Calendar의 날짜 영역 렌더링
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
 * Range Calendar 타이틀 업데이트
 */
function updateRangeTitle(year, month) {
    const titleElement = document.getElementById('rangeTitle');
    titleElement.textContent = `${year}. ${String(month).padStart(2, '0')}`;
}

/**
 * Range Calendar 월 변경
 */
function changeRangeMonth(delta) {
    const date = rangeCurrentDate;
    const newDate = dayjs(`${date.year}-${date.month}-01`).add(delta, 'month');
    
    rangeCurrentDate = {
        year: newDate.year(),
        month: newDate.month() + 1
    };
    
    updateRangeTitle(newDate.year(), newDate.month() + 1);
    renderRangeDays(newDate.year(), newDate.month() + 1);
}

/**
 * Range Calendar의 년/월 직접 설정
 */
function setRangeYearMonth(year, month) {
    rangeCurrentDate = { year, month };
    updateRangeTitle(year, month);
    renderRangeDays(year, month);
}

/**
 * Range Calendar 이벤트 리스너 등록
 */
function initRangeCalendar() {
    // 이전/다음 버튼
    document.getElementById('rangePrevBtn').addEventListener('click', () => changeRangeMonth(-1));
    document.getElementById('rangeNextBtn').addEventListener('click', () => changeRangeMonth(1));
    
    // Title 클릭 - Year/Month Picker
    const rangeTitle = document.getElementById('rangeTitle');
    rangeTitle.addEventListener('click', (e) => {
        const { year, month } = rangeCurrentDate;
        createRangeYearMonthPicker(
            rangeTitle,
            year,
            month,
            (selectedYear, selectedMonth) => setRangeYearMonth(selectedYear, selectedMonth)
        );
    });
    
    // 초기 렌더링
    renderRangeDays(2026, 1);
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRangeCalendar);
} else {
    initRangeCalendar();
}