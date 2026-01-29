// YouTube API를 동적으로 로드
function loadYouTubeAPI() {
    // 이미 로드되어 있으면 스킵
    if (window.YT && window.YT.Player) {
        if (typeof window.onYouTubeIframeAPIReady === 'function') {
            window.onYouTubeIframeAPIReady();
        }
        return;
    }
    
    // 이미 로딩 중이면 스킵
    if (document.getElementById('youtube-iframe-api-script')) {
        return;
    }
    
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api-script';
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    
    // 스크립트 로드 실패 시 에러 처리
    tag.onerror = function() {
        console.error('Failed to load YouTube IFrame API');
    };

    document.body.appendChild(tag);
    

    // 첫번쨰 script 태그가 있다면 그 앞에 삽입
    // const firstScript = document.getElementsByTagName('script')[0];
    // if (firstScript && firstScript.parentNode) {
    //     firstScript.parentNode.insertBefore(tag, firstScript);
    // } else {
    //     document.body.appendChild(tag);
    // }
}

// 모든 플레이어 인스턴스를 저장하는 객체
const players = {};

// 플레이어 초기화 함수
function initYouTubePlayers() {
    // data-video-id 속성을 가진 모든 요소 찾기
    const playerElements = document.querySelectorAll('[data-video-id]');
    
    if (playerElements.length === 0) {
        console.warn('No elements with data-video-id found');
        return;
    }
    
    playerElements.forEach((element, index) => {
        const videoId = element.getAttribute('data-video-id');
        const playerId = element.id || `youtube-player-${index}`;
        
        if (!videoId) {
            console.warn(`Element ${playerId} has no video-id attribute`);
            return;
        }
        
        // 이미 해당 요소에 플레이어가 초기화되어 있으면 스킵
        if (players[playerId]) {
            return;
        }
        
        // 요소에 id가 없으면 할당
        if (!element.id) {
            element.id = playerId;
        }
        
        try {
            players[playerId] = new YT.Player(playerId, {
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    loop: 0,
                    enablejsapi: 1,
                    rel: 0,
                    modestbranding: 1,
                    controls: 1,
                    fs: 0,
                },
                events: {
                    onReady: (event) => onPlayerReady(event, playerId),
                    onStateChange: (event) => onPlayerStateChange(event, playerId)
                },
            });            
            console.log(`YouTube player initialized: ${playerId} (video: ${videoId})`);
        } catch (error) {
            console.error(`Failed to initialize player ${playerId}:`, error);
        }
    });
}

// 1. YouTube API 준비 (전역 함수로 선언)
window.onYouTubeIframeAPIReady = function() {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        console.error('YouTube IFrame API is not loaded');
        return;
    }
    
    // DOM이 준비될 때까지 대기
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initYouTubePlayers);
    } else {
        initYouTubePlayers();
    }
};

// 2. 준비 완료 시 컨트롤 이벤트 등록
function onPlayerReady(event, playerId) {
    const player = players[playerId];
    if (!player) {
        console.error(`Player ${playerId} is not initialized`);
        return;
    }

    console.log(`Player ${playerId} is ready`);

    // 각 플레이어마다 컨트롤 버튼 이벤트 등록
    setupControls(playerId);

    // 썸네일 클릭 이벤트 설정
    setupThumbnailClick(playerId);
}

// 컨트롤 버튼 설정
function setupControls(playerId) {
    const player = players[playerId];
    if (!player) return;

    // 플레이어 요소 찾기
    const playerElement = document.getElementById(playerId);
    if (!playerElement) return;

    // 플레이어가 속한 video-wrap 컨테이너 찾기
    const videoWrap = playerElement.closest('.video-wrap');
    if (!videoWrap) {
        console.warn(`Could not find .video-wrap container for player ${playerId}`);
        return;
    }

    // 해당 컨테이너 내의 controls 요소에서 버튼 찾기
    const controlsContainer = videoWrap.querySelector('.controls');
    if (!controlsContainer) {
        console.warn(`Could not find .controls container for player ${playerId}`);
        return;
    }

    const playBtn = controlsContainer.querySelector('.playBtn');
    const pauseBtn = controlsContainer.querySelector('.pauseBtn');
    const stopBtn = controlsContainer.querySelector('.stopBtn');
    const muteBtn = controlsContainer.querySelector('.muteBtn');
    const seekBtn = controlsContainer.querySelector('.seekBtn');

    // 기존 이벤트 리스너 제거를 위해 새 함수로 교체
    if (playBtn) {
        playBtn.onclick = () => player.playVideo();
    }
    if (pauseBtn) {
        pauseBtn.onclick = () => player.pauseVideo();
    }
    if (stopBtn) {
        stopBtn.onclick = () => player.stopVideo();
    }
    if (muteBtn) {
        muteBtn.onclick = () => {
            if (player.isMuted()) {
                player.unMute();
                muteBtn.textContent = "음소거";
            } else {
                player.mute();
                muteBtn.textContent = "음소거 해제";
            }
        };
    }
    if (seekBtn) {
        seekBtn.onclick = () => {
            const current = player.getCurrentTime();
            player.seekTo(current + 10, true); // 10초 앞으로
        };
    }
}

// 썸네일 클릭 이벤트 설정
function setupThumbnailClick(playerId) {
    const player = players[playerId];
    if (!player) return;

    // 플레이어 요소 찾기
    const playerElement = document.getElementById(playerId);
    if (!playerElement) return;

    // 플레이어가 속한 video-wrap 컨테이너 찾기
    const videoWrap = playerElement.closest('.video-wrap');
    if (!videoWrap) return;

    // 해당 컨테이너 내의 썸네일과 iframe-container 찾기
    const thumb = videoWrap.querySelector('.thumb');
    const iframeContainer = videoWrap.querySelector('.iframe-container');
    const controls = videoWrap.querySelector('.controls');

    if (thumb && iframeContainer) {
        // 기존 이벤트 리스너가 있으면 제거하기 위해 클론으로 교체
        const newThumb = thumb.cloneNode(true);
        thumb.replaceWith(newThumb);

        newThumb.addEventListener('click', () => {
            newThumb.style.display = 'none';
            iframeContainer.style.display = 'block';
            controls.style.display= 'block';
            player.playVideo();
        });
    }
}

// 3. 상태 변화 감지
function onPlayerStateChange(event, playerId) {
    const player = players[playerId];
    if (!player) return;
    
    const state = event.data;
    switch (state) {
        case YT.PlayerState.PLAYING:
            console.log(`Player ${playerId}: 재생 중`);
            break;
        case YT.PlayerState.PAUSED:
            console.log(`Player ${playerId}: 일시정지`);
            break;
                case YT.PlayerState.ENDED:
            console.log(`Player ${playerId}: 영상 종료`);
            // 플레이어가 종료되면 썸네일 다시 표시
            const playerElement = document.getElementById(playerId);
            if (playerElement) {
                const videoWrap = playerElement.closest('.video-wrap');
                if (videoWrap) {
                    const thumb = videoWrap.querySelector('.thumb');
                    const iframeContainer = videoWrap.querySelector('.iframe-container');
                    const controls = videoWrap.querySelector('.controls');
                    if (thumb && iframeContainer) {
                        iframeContainer.style.display = 'none';
                        thumb.style.display = 'block';
                        controls.style.display ='none';
                    }
                }
            }
            break;
    }
}

// 플레이어 가져오기 헬퍼 함수
function getPlayer(playerId) {
    return players[playerId] || null;
}

// 모든 플레이어 가져오기
function getAllPlayers() {
    return players;
}

// API 로드 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadYouTubeAPI);
} else {
    loadYouTubeAPI();
}