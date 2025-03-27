const player = document.querySelector('.music-player');
const playPauseBtn = document.getElementById('play-pause');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const bigTitle = document.getElementById('big-title');
const bigArtist = document.getElementById('big-artist');
const fileUpload = document.getElementById('file-upload');
const backgroundAnimation = document.querySelector('.background-animation');
const colorThief = new ColorThief();

const songs = [
    {
        title: "Lost",
        artist: "Frank Ocean",
        audioUrl: "/songs/ChannelOrange/Lost.mp3",
        coverUrl: "covers/channelORANGE.png"
    },
    {
        title: "Blood",
        artist: "Kendrick Lamar",
        audioUrl: "/songs/DAMN/Blood.mp3",
        coverUrl: "covers/DAMN.png"
    },
    {
        title: "Pink + White",
        artist: "Frank Ocean",
        audioUrl: "/songs/Blonde/Pink + White.mp3",
        coverUrl: "covers/Blonde.png"
    },
    {
        title: "N95",
        artist: "Kendrick Lamar",
        audioUrl: "songs/MrMorale/N95.mp3",
        coverUrl: "covers/MrMorale.png"
    },
    {
        title: "The Blacker The Berry",
        artist: "Kendrick Lamar",
        audioUrl: "/songs/TPAB/The Blacker The Berry.mp3",
        coverUrl: "covers/TPAB.png"
    },
    {
        title: "m.A.A.d city",
        artist: "Kendrick Lamar",
        audioUrl: "/songs/GKMC/m.A.A.d city.mp3",
        coverUrl: "covers/GKMC.png"
    },
    {
        title: "Nights",
        artist: "Frank Ocean",
        audioUrl: "/songs/Blonde/Nights.mp3",
        coverUrl: "covers/Blonde.png"
    }
];

let currentSongIndex = 0;
let audio = new Audio();
let isPlaying = false;

// Initialize carousel
function initializeCarousel() {
    const carousel = document.querySelector('.album-carousel');
    carousel.innerHTML = '';
    
    // Show 5 albums: 2 before, current, and 2 after
    for (let offset = -2; offset <= 2; offset++) {
        const index = (currentSongIndex + offset + songs.length) % songs.length;
        const position = offset === 0 ? 'current' : 
                        offset < 0 ? `previous-${Math.abs(offset)}` : `next-${offset}`;
        
        carousel.innerHTML += `
            <div class="album ${position}" data-index="${index}">
                <img src="${songs[index].coverUrl}" alt="${songs[index].title}">
            </div>
        `;
    }
}

// Update CSS styles for additional albums
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .album.previous-2 {
            transform: translateX(-240%) scale(0.6);
            filter: blur(6px);
            opacity: 0.4;
        }
        .album.previous-1 {
            transform: translateX(-120%) scale(0.8);
            filter: blur(3px);
            opacity: 0.7;
        }
        .album.next-1 {
            transform: translateX(120%) scale(0.8);
            filter: blur(3px);
            opacity: 0.7;
        }
        .album.next-2 {
            transform: translateX(240%) scale(0.6);
            filter: blur(6px);
            opacity: 0.4;
        }
    </style>
`);

// Update drag function to handle additional albums
function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const diff = x - startX;
    const dragPercentage = (diff / window.innerWidth) * 200;
    
    document.querySelectorAll('.album').forEach(album => {
        const baseTransform = album.classList.contains('current') ? 0 :
            album.classList.contains('previous-1') ? -120 :
            album.classList.contains('previous-2') ? -240 :
            album.classList.contains('next-1') ? 120 : 240;
        
        // Increase the drag multiplier from 0.8 to 1.2 for more movement
        const translateX = baseTransform + (dragPercentage * 1.2);
        
        // Adjust scale and blur based on the increased movement
        const scale = album.classList.contains('current') ? 
            1 - Math.abs(dragPercentage) * 0.002 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            0.8 + Math.abs(dragPercentage) * 0.002 :
            0.6 + Math.abs(dragPercentage) * 0.002;
            
        const blur = album.classList.contains('current') ?
            Math.abs(dragPercentage) * 0.04 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            3 - Math.abs(dragPercentage) * 0.04 :
            6 - Math.abs(dragPercentage) * 0.04;
        
        album.style.transform = `translateX(${translateX}%) scale(${scale})`;
        album.style.filter = `blur(${blur}px)`;
        album.style.opacity = album.classList.contains('current') ?
            1 - Math.abs(dragPercentage) * 0.006 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            0.7 + Math.abs(dragPercentage) * 0.006 :
            0.4 + Math.abs(dragPercentage) * 0.006;
    });
}

// Update player info
function updatePlayerInfo(index) {
    document.getElementById('current-title').textContent = songs[index].title;
    document.getElementById('current-artist').textContent = songs[index].artist;
    
    // Update audio source
    audio.src = songs[index].audioUrl;
    if (isPlaying) {
        audio.play();
    }
    
    // Update background
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 4);
        const colorStrings = colors.map(color => 
            `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`
        );
        document.querySelector('.background-animation').style.background = 
            `linear-gradient(45deg, ${colorStrings.join(', ')})`;
    };
    img.src = songs[index].coverUrl;
}

// Swipe handling
let startX = 0;
let currentX = 0;
let isDragging = false;

const carousel = document.querySelector('.album-carousel');

// Update the handleSwipe function
function handleSwipe(direction) {
    const oldIndex = currentSongIndex;
    if (direction === 'left') {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    }
    
    // Start playing the new song immediately
    updatePlayerInfo(currentSongIndex);
    
    // Animate the carousel smoothly
    const carousel = document.querySelector('.album-carousel');
    const albums = carousel.querySelectorAll('.album');
    
    albums.forEach(album => {
        album.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // After transition completes, reset the carousel
    setTimeout(() => {
        initializeCarousel();
    }, 500);
}

// Update the CSS for smoother transitions
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .album {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .album img {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .album.sliding-left {
            transform: translateX(-120%) scale(0.8);
            filter: blur(3px);
            opacity: 0.7;
        }
        
        .album.sliding-right {
            transform: translateX(120%) scale(0.8);
            filter: blur(3px);
            opacity: 0.7;
        }
    </style>
`);

carousel.addEventListener('mousedown', startDragging);
carousel.addEventListener('mousemove', drag);
carousel.addEventListener('mouseup', endDragging);
carousel.addEventListener('mouseleave', endDragging);

// Add these variables near the other state variables
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

// Update the touch event listeners
carousel.addEventListener('touchstart', handleTouchStart);
carousel.addEventListener('touchmove', handleTouchMove);
carousel.addEventListener('touchend', handleTouchEnd);

// Add these new touch handling functions
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
    startDragging(e.touches[0]);
}

function handleTouchMove(e) {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    // Check if scrolling vertically
    if (Math.abs(touchY - touchStartY) > Math.abs(touchX - touchStartX)) {
        isSwiping = false;
        return;
    }
    
    e.preventDefault();
    drag(e.touches[0]);
}

function handleTouchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;
    
    const touch = e.changedTouches[0];
    endDragging(touch);
}

// Remove the old touch event listeners
carousel.removeEventListener('touchstart', e => startDragging(e.touches[0]));
carousel.removeEventListener('touchmove', e => drag(e.touches[0]));
carousel.removeEventListener('touchend', endDragging);

// Add these constants at the top with other constants
let startTime = 0;
let isClick = false;

// Update the startDragging function
function startDragging(e) {
    isDragging = true;
    isClick = true;
    startX = e.pageX;
    startTime = Date.now();
    
    document.querySelectorAll('.album').forEach(album => {
        album.style.transition = 'none';
        album.style.cursor = 'grabbing';
    });
}

// Update the drag function's transform calculations
function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const diff = x - startX;
    const dragPercentage = (diff / window.innerWidth) * 200;
    
    document.querySelectorAll('.album').forEach(album => {
        const baseTransform = album.classList.contains('current') ? 0 :
            album.classList.contains('previous-1') ? -120 :
            album.classList.contains('previous-2') ? -240 :
            album.classList.contains('next-1') ? 120 : 240;
        
        // Increase the drag multiplier from 0.8 to 1.2 for more movement
        const translateX = baseTransform + (dragPercentage * 1.2);
        
        // Adjust scale and blur based on the increased movement
        const scale = album.classList.contains('current') ? 
            1 - Math.abs(dragPercentage) * 0.002 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            0.8 + Math.abs(dragPercentage) * 0.002 :
            0.6 + Math.abs(dragPercentage) * 0.002;
            
        const blur = album.classList.contains('current') ?
            Math.abs(dragPercentage) * 0.04 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            3 - Math.abs(dragPercentage) * 0.04 :
            6 - Math.abs(dragPercentage) * 0.04;
        
        album.style.transform = `translateX(${translateX}%) scale(${scale})`;
        album.style.filter = `blur(${blur}px)`;
        album.style.opacity = album.classList.contains('current') ?
            1 - Math.abs(dragPercentage) * 0.006 :
            album.classList.contains('previous-1') || album.classList.contains('next-1') ?
            0.7 + Math.abs(dragPercentage) * 0.006 :
            0.4 + Math.abs(dragPercentage) * 0.006;
    });
}

// Update the swipe threshold in endDragging
function endDragging(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const endTime = Date.now();
    const diff = e?.pageX ? e.pageX - startX : 0;
    const dragPercentage = (diff / window.innerWidth) * 200;
    
    document.querySelectorAll('.album').forEach(album => {
        album.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        album.style.cursor = 'pointer';
    });

    // Handle click vs drag
    if (isClick && endTime - startTime < 300 && Math.abs(diff) < 10) {
        const clickedAlbum = e.target.closest('.album');
        if (clickedAlbum) {
            const newIndex = parseInt(clickedAlbum.dataset.index);
            if (newIndex !== currentSongIndex) {
                currentSongIndex = newIndex;
                updatePlayerInfo(currentSongIndex);
                initializeCarousel();
            }
        }
    } else if (Math.abs(dragPercentage) > 20) {
        handleSwipe(diff < 0 ? 'left' : 'right');
    } else {
        initializeCarousel();
    }
    
    isClick = false;
}

// Update the album styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .album {
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
        }
        .album:hover {
            transform: scale(1.02);
        }
        .album.current:hover {
            transform: scale(1.05);
        }
    </style>
`);

// Play/Pause functionality
document.getElementById('play-pause').addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        document.getElementById('play-pause').textContent = '▶';
    } else {
        audio.play();
        document.getElementById('play-pause').textContent = '⏸';
    }
    isPlaying = !isPlaying;
});
// Initialize the player
initializeCarousel();
updatePlayerInfo(currentSongIndex);

// Add these constants at the top with other constants
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = 0;
volumeSlider.max = 100;
volumeSlider.value = 100;
volumeSlider.className = 'volume-slider';

// Add this after the play/pause button in the HTML
document.querySelector('.current-song').insertAdjacentHTML('beforeend', `
    <div class="player-controls">
        <div class="progress-container">
            <div class="progress-bar"></div>
            <input type="range" class="seek-slider" max="100" value="0">
            <div class="time-display">
                <span class="current-time">0:00</span>
                <span class="duration">0:00</span>
            </div>
        </div>
        <div class="volume-container">
            <i class="volume-icon">🔊</i>
            ${volumeSlider.outerHTML}
        </div>
    </div>
`);

// Add these styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .player-controls {
            margin-top: -30px;
            width: 100%;
        }

        .progress-container {
            width: 100%;
            position: relative;
            margin-bottom: 10px;
        }

        .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            position: relative;
            margin: 10px 0;
        }

        .seek-slider {
            position: absolute;
            width: 100%;
            top: 0;
            left: 0;
            margin: 0;
            opacity: 0;
            cursor: pointer;
            z-index: 2;
        }

        .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .volume-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .volume-slider {
            -webkit-appearance: none;
            width: 100px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            outline: none;
        }

        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }

        .volume-icon {
            font-size: 1.2rem;
            cursor: pointer;
        }
    </style>
`);

// Add these event listeners and functions
audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    document.querySelector('.progress-bar').style.background = 
        `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.1) ${progress}%)`;
    
    document.querySelector('.current-time').textContent = formatTime(audio.currentTime);
    document.querySelector('.seek-slider').value = progress;
});

audio.addEventListener('loadedmetadata', () => {
    document.querySelector('.duration').textContent = formatTime(audio.duration);
});

document.querySelector('.seek-slider').addEventListener('input', (e) => {
    const time = (audio.duration / 100) * e.target.value;
    audio.currentTime = time;
});

document.querySelector('.volume-slider').addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    const volumeIcon = document.querySelector('.volume-icon');
    volumeIcon.textContent = audio.volume === 0 ? '🔇' : 
                            audio.volume < 0.5 ? '🔉' : '🔊';
});

document.querySelector('.volume-icon').addEventListener('click', () => {
    if (audio.volume > 0) {
        audio.volume = 0;
        volumeSlider.value = 0;
        document.querySelector('.volume-icon').textContent = '🔇';
    } else {
        audio.volume = 1;
        volumeSlider.value = 100;
        document.querySelector('.volume-icon').textContent = '🔊';
    }
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Add audio ended event listener after other audio event listeners
audio.addEventListener('ended', () => {
    handleSwipe('left'); // Move to next song
});

// Update the album styles to only apply hover effect to current song
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .album {
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
        }
        .album.current:hover {
            transform: scale(1.05) !important;
            transition: transform 0.3s ease;
        }
        
        .seek-slider {
            height: 12px;
            top: -4px;
        }
        
        .progress-bar {
            height: 4px;
            margin: 12px 0;
        }
        
        .seek-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .seek-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }
    </style>
`);

// Add near the top with other constants
const instructions = {
    en: "swipe left or right",
    hu: "lapozz balra vagy jobbra",
    de: "swipe nach links oder rechts",
    es: "desliza izquierda o derecha",
    fr: "glissez à gauche ou à droite",
    jp: "左右にスワイプ",
    kr: "좌우로 스와이프",
    zh: "左右滑动"
};
let currentLanguage = 'en';

// Add after the carousel initialization
document.querySelector('.carousel-container').insertAdjacentHTML('beforeend', `
    <button class="language-switch">🌐</button>
`);

// Add the styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .language-switch {
            position: absolute;
            top: -50px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        .language-switch:hover {
            opacity: 1;
        }
    </style>
`);

// Add the language switch functionality
document.querySelector('.language-switch').addEventListener('click', () => {
    const langs = Object.keys(instructions);
    currentLanguage = langs[(langs.indexOf(currentLanguage) + 1) % langs.length];
    document.querySelector('.instruction').textContent = instructions[currentLanguage];
});
