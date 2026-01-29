let player;

// 1. YouTube API 준비 (전역 함수로 선언)
window.onYouTubeIframeAPIReady = function() {
    const playerElement = document.getElementById('player');
    if (!playerElement) {
        console.error('YouTube player element not found');
        return;
    }
    
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube IFrame API is not loaded');
        return;
    }
    
    player = new YT.Player('player', {
        videoId: '_6YkzI6hGe4', // 첫 번째로 재생할 영상
        playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: '_6YkzI6hGe4',  // 재생할 추가 영상 또는 재생목록 ID          
            enablejsapi: 1,      // JS API 제어 가능하도록 설정
            rel: 0,              // 재생 종료 후 관련 동영상 표시 안 함
            modestbranding: 1,   // YouTube 로고 최소화
            controls: 1,         // 기본 컨트롤 표시 (0: 숨김)
            showinfo: 0,         // 영상 정보 표시 숨김 (현재는 deprecated)
            fs: 0,               // 전체화면 버튼 숨김
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        },
    });
};

// 2. 준비 완료 시 컨트롤 이벤트 등록
function onPlayerReady(event) {
    if (!player) {
        console.error('Player is not initialized');
        return;
    }
    
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stopBtn = document.getElementById("stopBtn");
    const muteBtn = document.getElementById("muteBtn");
    const seekBtn = document.getElementById("seekBtn");

    if (playBtn) playBtn.addEventListener("click", () => player.playVideo());
    if (pauseBtn) pauseBtn.addEventListener("click", () => player.pauseVideo());
    if (stopBtn) stopBtn.addEventListener("click", () => player.stopVideo());
    if (muteBtn) {
        muteBtn.addEventListener("click", () => {
            if (player.isMuted()) {
              player.unMute();
              muteBtn.textContent = "음소거";
            } else {
              player.mute();
              muteBtn.textContent = "음소거 해제";
            }
        });
    }
    if (seekBtn) {
        seekBtn.addEventListener("click", () => {
            const current = player.getCurrentTime();
            player.seekTo(current + 10, true); // 10초 앞으로
        });
    }
}

// 3. 상태 변화 감지
function onPlayerStateChange(event) {
    const state = event.data;
    switch (state) {
      case YT.PlayerState.PLAYING:
        console.log("재생 중");
        break;
      case YT.PlayerState.PAUSED:
        console.log("일시정지");
        break;
      case YT.PlayerState.ENDED:
        console.log("영상 종료");
        break;
    }
}