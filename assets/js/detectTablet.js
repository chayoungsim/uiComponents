// 태블릿 기기 감지 함수
function detectTablet() {
  const ua = navigator.userAgent.toLowerCase();
  
  // 1. User Agent 기반 태블릿 감지
  const isTabletUA = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua);
  
  // 2. iPad 특별 처리 (iOS 13+ 에서는 desktop UA를 사용)
  const isIPad = (ua.includes('mac') && 'ontouchend' in document);
  
  // 3. Android 태블릿 감지 개선
  // Android이지만 'mobile'이 없는 경우
  const isAndroidTablet = ua.includes('android') && !ua.includes('mobile');
  
  // 4. 화면 크기 체크 (보조 판단 기준)
  const screenSize = Math.min(window.screen.width, window.screen.height);
  const isTabletSize = screenSize >= 768 && screenSize <= 1366;
  
  // 5. 터치 지원 + 큰 화면 조합 체크
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLargeTouch = hasTouch && isTabletSize;
  
  // 최종 판단: UA 감지 우선, 크기는 보조
  return isTabletUA || isIPad || isAndroidTablet || 
         (isLargeTouch && !ua.includes('mobile'));
}

// 페이지 로드 시 태블릿 클래스 추가
function addTabletClass() {
  if (detectTablet()) {
    document.body.classList.add('tablet');
    console.log('태블릿 기기 감지됨');
  } else {
    console.log('태블릿 아님');
  }
}

// DOMContentLoaded 이벤트에서 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addTabletClass);
} else {
  addTabletClass();
}

// 화면 회전 감지 (선택사항)
window.addEventListener('resize', () => {
  // 회전 시에도 태블릿 클래스 유지
  if (detectTablet() && !document.body.classList.contains('tablet')) {
    document.body.classList.add('tablet');
  }
});