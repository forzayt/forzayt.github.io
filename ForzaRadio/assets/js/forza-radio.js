// ForzaRadio - Enhanced Music Player with IA Integration
// Combines original player functionality with Internet Archive radio

class ForzaRadio {
    constructor() {
        console.log("🚀 ForzaRadio constructor called");
        
        this.wrapper = document.querySelector(".wrapper");
        if (!this.wrapper) {
            console.error("❌ Wrapper not found!");
            return;
        }
        
        this.musicImg = this.wrapper.querySelector(".img-area img");
        this.musicName = this.wrapper.querySelector(".song-details .name");
        this.musicArtist = this.wrapper.querySelector(".song-details .artist");
        this.playPauseBtn = this.wrapper.querySelector(".top-play-pause");

        this.mainAudio = this.wrapper.querySelector("#main-audio");
        this.progressArea = this.wrapper.querySelector(".progress-area");
        this.progressBar = this.progressArea.querySelector(".progress-bar");
        this.musicList = this.wrapper.querySelector(".music-list");
        this.moreMusicBtn = this.wrapper.querySelector("#more-music");
        this.closemoreMusic = this.musicList.querySelector("#close");
        
        // Debug element selection
        console.log("🔍 Elements found:", {
            wrapper: !!this.wrapper,
            musicImg: !!this.musicImg,
            musicName: !!this.musicName,
            musicArtist: !!this.musicArtist,
            playPauseBtn: !!this.playPauseBtn,
            mainAudio: !!this.mainAudio,
            progressArea: !!this.progressArea,
            progressBar: !!this.progressBar,
            musicList: !!this.musicList,
            moreMusicBtn: !!this.moreMusicBtn,
            closemoreMusic: !!this.closemoreMusic
        });

        this.musicIndex = 1;
        this.isMusicPaused = true;
        this.isRadioMode = false;
        this.originalMusicList = [];
        
        this.init();
    }

    async init() {
        console.log("🚀 ForzaRadio init called");
        // Initialize IA Radio
        await this.initIARadio();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial music
        this.loadInitialMusic();
    }

    async initIARadio() {
        try {
            // Try to initialize IA radio
            const radioSuccess = await window.iaRadio.initRadio();
            if (radioSuccess) {
                this.isRadioMode = true;
                this.setupRadioMode();
                console.log("🎵 ForzaRadio: IA Radio mode activated!");
            } else {
                // Fallback to original music
                this.loadOriginalMusic();
                console.log("🎵 ForzaRadio: Using original music playlist");
            }
        } catch (error) {
            console.log("🎵 ForzaRadio: Falling back to original music");
            this.loadOriginalMusic();
        }
    }

    loadOriginalMusic() {
        // Load original music list if IA fails
        this.originalMusicList = window.allMusic || [];
        this.isRadioMode = false;
    }

    setupRadioMode() {
        // Add radio indicator to UI
        this.addRadioIndicator();
        
        // Setup radio-specific controls
        this.setupRadioControls();
        
        // Load first song from IA
        const firstSong = window.iaRadio.getCurrentSong();
        if (firstSong) {
            this.loadMusicFromIA(firstSong);
        }
    }

    addRadioIndicator() {
        // Add radio mode indicator to top bar
        const topBar = this.wrapper.querySelector(".top-bar span");
        if (topBar) {
            topBar.innerHTML = "🎵 Forza Radio ";
        }
    }

    setupRadioControls() {
        // Fullscreen button is now in HTML, just add event listener
        const fullscreenBtn = this.wrapper.querySelector("#fullscreen-toggle");
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
        }
    }

    toggleFullscreen() {
        const fullscreenBtn = this.wrapper.querySelector("#fullscreen-toggle");
        
        if (!document.fullscreenElement) {
            // Enter fullscreen - target document.body for browser window fullscreen
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            } else if (document.body.webkitRequestFullscreen) {
                document.body.webkitRequestFullscreen();
            } else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            }
            fullscreenBtn.innerText = "fullscreen_exit";
            fullscreenBtn.title = "Exit Fullscreen";
            
            // Force background application
            setTimeout(() => {
                document.body.style.background = "linear-gradient(var(--pink) 0%, var(--violet) 100%)";
                document.documentElement.style.background = "linear-gradient(var(--pink) 0%, var(--violet) 100%)";
            }, 100);
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenBtn.innerText = "fullscreen";
            fullscreenBtn.title = "Toggle Fullscreen";
            
            // Restore the album art background when exiting fullscreen
            setTimeout(() => {
                this.restoreAlbumBackground();
            }, 100);
        }
    }

    handleFullscreenChange() {
        const fullscreenBtn = this.wrapper.querySelector("#fullscreen-toggle");
        if (fullscreenBtn) {
            if (document.fullscreenElement) {
                fullscreenBtn.innerText = "fullscreen_exit";
                fullscreenBtn.title = "Exit Fullscreen";
            } else {
                fullscreenBtn.innerText = "fullscreen";
                fullscreenBtn.title = "Toggle Fullscreen";
                // Restore album background when fullscreen changes
                setTimeout(() => {
                    this.restoreAlbumBackground();
                }, 100);
            }
        }
    }

    // Restore the album art background when exiting fullscreen
    restoreAlbumBackground() {
        try {
            // Get the current music image
            const currentImage = this.musicImg?.src;
            
            if (currentImage && currentImage !== '') {
                // Update the CSS custom property for the background
                document.documentElement.style.setProperty('--album-bg', `url("${currentImage}")`);
                
                // Also update the body background to use the CSS custom property
                document.body.style.background = '';
                document.documentElement.style.background = '';
                
                console.log("✅ Album background restored after exiting fullscreen");
            } else {
                // Fallback to default gradient if no image
                document.documentElement.style.setProperty('--album-bg', 'linear-gradient(var(--pink) 0%, var(--violet) 100%)');
                console.log("✅ Default gradient background restored");
            }
        } catch (error) {
            console.error("Error restoring album background:", error);
            // Fallback to default gradient
            document.documentElement.style.setProperty('--album-bg', 'linear-gradient(var(--pink) 0%, var(--violet) 100%)');
        }
    }

    // Update background with album art
    updateBackgroundImage(imageUrl) {
        if (imageUrl) {
            document.documentElement.style.setProperty('--album-bg', `url("${imageUrl}")`);
            console.log("🎨 Updated background with album art");
        }
    }

    async loadMusicFromIA(song) {
        if (!song) return;
        
        this.musicName.innerText = song.name;
        this.musicArtist.innerText = song.artist;
        
        // Reset timeline first
        this.resetTimeline();
        
        // Fetch dynamic image
        try {
            const imageUrl = await window.iaRadio.getDynamicImage(song.name, song.artist);
            this.musicImg.src = imageUrl;
            // Update background with album art
            this.updateBackgroundImage(imageUrl);
        } catch (error) {
            console.log("Error loading dynamic image:", error);
            // Fallback to generated gradient
            const fallbackImage = window.iaRadio.generateGradientImage(song.name, song.artist);
            this.musicImg.src = fallbackImage;
            this.updateBackgroundImage(fallbackImage);
        }
        
        // Load audio with better error handling
        if (song.downloadUrl) {
            try {
                // Pause current audio if playing
                if (!this.mainAudio.paused) {
                    this.mainAudio.pause();
                }
                
                // Set new source and load
                this.mainAudio.src = song.downloadUrl;
                this.mainAudio.load();
                
                // Add error handling for audio loading
                this.mainAudio.onerror = () => {
                    console.error(`Failed to load audio: ${song.downloadUrl}`);
                    // Try to play next song if current fails
                    setTimeout(() => {
                        if (this.isRadioMode) {
                            window.iaRadio.playNext();
                        }
                    }, 1000);
                };
                
                // Add canplaythrough listener for better loading
                this.mainAudio.oncanplaythrough = () => {
                    console.log(`✅ Audio loaded successfully: ${song.name}`);
                };
                
            } catch (error) {
                console.error("Error setting audio source:", error);
                // Try to play next song if current fails
                setTimeout(() => {
                    if (this.isRadioMode) {
                        window.iaRadio.playNext();
                    }
                }, 1000);
            }
        } else {
            console.error("No download URL available for song:", song);
        }
        
        // Update playlist UI
        this.updatePlaylistUI();
    }

    loadInitialMusic() {
        if (this.isRadioMode) {
            const currentSong = window.iaRadio.getCurrentSong();
            if (currentSong) {
                this.loadMusicFromIA(currentSong);
            }
        } else {
            // Original music loading logic
            this.loadMusic(this.musicIndex).catch(console.error);
        }
        this.playingSong();
    }

    async loadMusic(indexNumb) {
        if (this.isRadioMode) {
            const song = window.iaRadio.getCurrentSong();
            if (song) {
                this.loadMusicFromIA(song);
            }
        } else {
            // Original logic
            const song = this.originalMusicList[indexNumb - 1];
            this.musicName.innerText = song.name;
            this.musicArtist.innerText = song.artist;
            
            // Use dynamic image for original music too
            try {
                const imageUrl = await window.iaRadio.getDynamicImage(song.name, song.artist);
                this.musicImg.src = imageUrl;
                // Update background with album art
                this.updateBackgroundImage(imageUrl);
            } catch (error) {
                const fallbackImage = window.iaRadio.generateGradientImage(song.name, song.artist);
                this.musicImg.src = fallbackImage;
                this.updateBackgroundImage(fallbackImage);
            }
            
            // Safely load audio
            this.safelyLoadAudio(`https://samirpaulb.github.io/assets/music/${song.src}.mp3`);
        }
    }

    // Safely load audio with conflict prevention
    safelyLoadAudio(audioSrc) {
        try {
            // Pause current audio if playing
            if (!this.mainAudio.paused) {
                this.mainAudio.pause();
            }
            
            // Reset timeline
            this.resetTimeline();
            
            // Reset any existing error handlers
            this.mainAudio.onerror = null;
            this.mainAudio.oncanplaythrough = null;
            
            // Set new source and load
            this.mainAudio.src = audioSrc;
            this.mainAudio.load();
            
            console.log(`✅ Audio source set: ${audioSrc}`);
        } catch (error) {
            console.error("Error loading audio:", error);
        }
    }

    // Reset timeline to initial state
    resetTimeline() {
        try {
            // Reset progress bar
            if (this.progressBar) {
                this.progressBar.style.width = "0%";
            }
            
            // Reset time displays
            let musicCurrentTime = this.wrapper.querySelector(".current-time");
            let musicDuration = this.wrapper.querySelector(".max-duration");
            
            if (musicCurrentTime) {
                musicCurrentTime.innerText = "0:00";
            }
            
            if (musicDuration) {
                musicDuration.innerText = "0:00";
            }
            
            console.log("✅ Timeline reset");
        } catch (error) {
            console.error("Error resetting timeline:", error);
        }
    }

    setupEventListeners() {
        console.log("🎯 Setting up event listeners...");
        
        // Play/Pause
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener("click", () => {
                console.log("🎵 Play/Pause button clicked");
                const isMusicPlay = this.wrapper.classList.contains("paused");
                isMusicPlay ? this.pauseMusic() : this.playMusic();
                this.playingSong();
            });
            console.log("✅ Play/Pause event listener added");
        } else {
            console.error("❌ Play/Pause button not found!");
        }

        // Progress bar
        if (this.progressArea) {
            this.progressArea.addEventListener("click", (e) => {
                console.log("🎯 Progress bar clicked");
                this.handleProgressClick(e);
            });
            console.log("✅ Progress bar event listener added");
        } else {
            console.error("❌ Progress area not found!");
        }

        // Music list
        if (this.moreMusicBtn) {
            this.moreMusicBtn.addEventListener("click", () => {
                console.log("📋 Music list button clicked");
                this.musicList.classList.toggle("show");
            });
            console.log("✅ Music list button event listener added");
        } else {
            console.error("❌ More music button not found!");
        }
        
        if (this.closemoreMusic) {
            this.closemoreMusic.addEventListener("click", () => {
                this.moreMusicBtn.click();
            });
            console.log("✅ Close music list event listener added");
        } else {
            console.error("❌ Close music list button not found!");
        }

        // Audio ended
        if (this.mainAudio) {
            this.mainAudio.addEventListener("ended", () => {
                console.log("🎵 Audio ended event fired");
                this.handleSongEnded();
            });
            console.log("✅ Audio ended event listener added");

            // Time update
            this.mainAudio.addEventListener("timeupdate", (e) => {
                this.handleTimeUpdate(e);
            });
            console.log("✅ Audio timeupdate event listener added");

            // Add loadeddata listener for duration
            this.mainAudio.addEventListener("loadeddata", () => {
                console.log("🎵 Audio loadeddata event fired");
                let mainAdDuration = this.mainAudio.duration;
                let totalMin = Math.floor(mainAdDuration / 60);
                let totalSec = Math.floor(mainAdDuration % 60);
                if(totalSec < 10) {
                    totalSec = `0${totalSec}`;
                }
                let musicDuration = this.wrapper.querySelector(".max-duration");
                if (musicDuration) {
                    musicDuration.innerText = `${totalMin}:${totalSec}`;
                }
            });
            console.log("✅ Audio loadeddata event listener added");
        } else {
            console.error("❌ Main audio element not found!");
        }

        // Fullscreen change event
        document.addEventListener("fullscreenchange", () => this.handleFullscreenChange());
        document.addEventListener("webkitfullscreenchange", () => this.handleFullscreenChange());
        document.addEventListener("msfullscreenchange", () => this.handleFullscreenChange());
        console.log("✅ Fullscreen event listeners added");
        
        console.log("🎯 Event listeners setup complete");
    }

    playMusic() {
        try {
            console.log("▶️ playMusic called");
            console.log("🎵 Audio state:", {
                readyState: this.mainAudio.readyState,
                paused: this.mainAudio.paused,
                currentTime: this.mainAudio.currentTime,
                duration: this.mainAudio.duration,
                src: this.mainAudio.src
            });
            
            this.wrapper.classList.add("paused");
            this.playPauseBtn.querySelector("i").innerText = "pause";
            
            // Ensure audio is loaded before playing
            if (this.mainAudio.readyState >= 2) { // HAVE_CURRENT_DATA
                console.log("✅ Audio ready, attempting to play...");
                this.mainAudio.play().then(() => {
                    console.log("✅ Audio play successful");
                }).catch(error => {
                    console.error("Failed to play audio:", error);
                    // Reset button state on error
                    this.wrapper.classList.remove("paused");
                    this.playPauseBtn.querySelector("i").innerText = "play_arrow";
                });
            } else {
                console.log("⏳ Audio not ready, waiting for data...");
                // Wait for audio to be ready
                this.mainAudio.addEventListener('canplay', () => {
                    console.log("✅ Audio can play now, attempting to play...");
                    this.mainAudio.play().catch(error => {
                        console.error("Failed to play audio after loading:", error);
                        this.wrapper.classList.remove("paused");
                        this.playPauseBtn.querySelector("i").innerText = "play_arrow";
                    });
                }, { once: true });
            }
        } catch (error) {
            console.error("Error in playMusic:", error);
            // Reset button state on error
            this.wrapper.classList.remove("paused");
            this.playPauseBtn.querySelector("i").innerText = "play_arrow";
        }
    }

    pauseMusic() {
        try {
            this.wrapper.classList.remove("paused");
            this.playPauseBtn.querySelector("i").innerText = "play_arrow";
            this.mainAudio.pause();
        } catch (error) {
            console.error("Error in pauseMusic:", error);
        }
    }



    handleProgressClick(e) {
        try {
            // Get progress area dimensions
            let progressWidth = this.progressArea.clientWidth;
            let clickedOffsetX = e.offsetX;
            
            // Validate click position
            if (clickedOffsetX < 0 || clickedOffsetX > progressWidth) {
                return;
            }
            
            // Get song duration
            let songDuration = this.mainAudio.duration;
            
            // Ensure we have a valid duration
            if (!isFinite(songDuration) || songDuration <= 0) {
                console.log("Cannot seek: invalid duration");
                return;
            }
            
            // Calculate new time position
            let newTime = (clickedOffsetX / progressWidth) * songDuration;
            
            // Ensure time is within bounds
            newTime = Math.max(0, Math.min(songDuration, newTime));
            
            // Update audio position
            this.mainAudio.currentTime = newTime;
            
            // If audio was paused, start playing
            if (this.mainAudio.paused) {
                this.playMusic();
            }
            
            // Update UI
            this.playingSong();
            
            console.log(`🎯 Seeking to: ${Math.floor(newTime / 60)}:${Math.floor(newTime % 60).toString().padStart(2, '0')}`);
            
        } catch (error) {
            console.error("Error in handleProgressClick:", error);
        }
    }



    handleSongEnded() {
        console.log("🎵 Song ended, handling...");
        
        if (this.isRadioMode) {
            // Radio mode auto-plays next
            console.log("🎵 Radio mode - playing next song");
            try {
                window.iaRadio.playNext();
            } catch (error) {
                console.error("Error playing next song in radio mode:", error);
                // Fallback: try to reload current song
                setTimeout(() => {
                    if (this.isRadioMode) {
                        const currentSong = window.iaRadio.getCurrentSong();
                        if (currentSong) {
                            this.loadMusicFromIA(currentSong);
                        }
                    }
                }, 2000);
            }
        } else {
            // Auto-play next song for non-radio mode
            console.log("🎵 Non-radio mode - playing next song");
            this.musicIndex++;
            if (this.musicIndex > this.originalMusicList.length) {
                this.musicIndex = 1;
            }
            this.loadMusic(this.musicIndex).then(() => {
                // Add a small delay to prevent rapid succession
                setTimeout(() => {
                    this.playMusic();
                }, 500);
            }).catch(error => {
                console.error("Error loading next song:", error);
            });
            this.playingSong();
        }
    }

    handleTimeUpdate(e) {
        try {
            const currentTime = e.target.currentTime;
            const duration = e.target.duration;
            
            // Debug logging
            if (Math.floor(currentTime) % 5 === 0) { // Log every 5 seconds to avoid spam
                console.log(`⏱️ Time update: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
            }
            
            // Ensure we have valid duration and current time
            if (!isFinite(duration) || !isFinite(currentTime) || duration <= 0) {
                if (Math.floor(currentTime) % 5 === 0) {
                    console.log("⚠️ Invalid duration or current time:", { duration, currentTime });
                }
                return;
            }
            
            // Calculate progress percentage
            let progressWidth = (currentTime / duration) * 100;
            
            // Ensure progress is within bounds
            progressWidth = Math.max(0, Math.min(100, progressWidth));
            
            // Update progress bar
            if (this.progressBar) {
                this.progressBar.style.width = `${progressWidth}%`;
            } else {
                console.error("❌ Progress bar element not found!");
            }
            
            // Update current time display
            let musicCurrentTime = this.wrapper.querySelector(".current-time");
            if (musicCurrentTime) {
                let currentMin = Math.floor(currentTime / 60);
                let currentSec = Math.floor(currentTime % 60);
                if(currentSec < 10) {
                    currentSec = `0${currentSec}`;
                }
                musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
            } else {
                console.error("❌ Current time element not found!");
            }
            
            // Update duration display if not set
            let musicDuration = this.wrapper.querySelector(".max-duration");
            if (musicDuration && (!musicDuration.innerText || musicDuration.innerText === "0:00")) {
                let totalMin = Math.floor(duration / 60);
                let totalSec = Math.floor(duration % 60);
                if(totalSec < 10) {
                    totalSec = `0${totalSec}`;
                }
                musicDuration.innerText = `${totalMin}:${totalSec}`;
            }
        } catch (error) {
            console.error("Error in handleTimeUpdate:", error);
        }
    }

    updatePlaylistUI() {
        if (this.isRadioMode) {
            this.generateIAPlaylist();
        } else {
            this.generateOriginalPlaylist();
        }
    }

    generateIAPlaylist() {
        const ulTag = this.wrapper.querySelector("ul");
        ulTag.innerHTML = "";
        
        const songs = window.iaRadio.getAllSongs();
        songs.forEach((song, index) => {
            let liTag = `<li li-index="${index + 1}">
                <div class="row">
                    <span>${song.name}</span>
                    <p>${song.artist}</p>
                </div>
                <span class="audio-duration">🎵 IA</span>
            </li>`;
            ulTag.insertAdjacentHTML("beforeend", liTag);
        });

        this.setupPlaylistClickHandlers();
    }

    generateOriginalPlaylist() {
        const ulTag = this.wrapper.querySelector("ul");
        ulTag.innerHTML = "";
        
        for (let i = 0; i < this.originalMusicList.length; i++) {
            let liTag = `<li li-index="${i + 1}">
                <div class="row">
                    <span>${this.originalMusicList[i].name}</span>
                    <p>${this.originalMusicList[i].artist}</p>
                </div>
                <span id="${this.originalMusicList[i].src}" class="audio-duration">3:40</span>
                <audio class="${this.originalMusicList[i].src}" src="https://samirpaulb.github.io/assets/music/${this.originalMusicList[i].src}.mp3"></audio>
            </li>`;
            ulTag.insertAdjacentHTML("beforeend", liTag);
        }

        this.setupPlaylistClickHandlers();
    }

    setupPlaylistClickHandlers() {
        const allLiTag = this.wrapper.querySelectorAll("ul li");
        allLiTag.forEach((li, index) => {
            li.setAttribute("onclick", `window.forzaRadio.clicked(this, ${index})`);
        });
    }

    clicked(element, index) {
        if (this.isRadioMode) {
            window.iaRadio.playSongByIndex(index);
        } else {
            let getLiIndex = element.getAttribute("li-index");
            this.musicIndex = getLiIndex;
            this.loadMusic(this.musicIndex).then(() => this.playMusic()).catch(console.error);
        }
        this.playingSong();
    }

    playingSong() {
        const allLiTag = this.wrapper.querySelectorAll("ul li");
        
        for (let j = 0; j < allLiTag.length; j++) {
            let audioTag = allLiTag[j].querySelector(".audio-duration");
            
            if(allLiTag[j].classList.contains("playing")){
                allLiTag[j].classList.remove("playing");
                if (audioTag && audioTag.getAttribute("t-duration")) {
                    let adDuration = audioTag.getAttribute("t-duration");
                    audioTag.innerText = adDuration;
                }
            }

            if(this.isRadioMode) {
                if(j == window.iaRadio.currentIndex){
                    allLiTag[j].classList.add("playing");
                    if (audioTag) audioTag.innerText = "Playing";
                }
            } else {
                if(allLiTag[j].getAttribute("li-index") == this.musicIndex){
                    allLiTag[j].classList.add("playing");
                    if (audioTag) audioTag.innerText = "Playing";
                }
            }
        }
    }
}

// Initialize ForzaRadio when DOM is loaded
window.addEventListener("load", () => {
    window.forzaRadio = new ForzaRadio();
});
