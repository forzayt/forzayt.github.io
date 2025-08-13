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
        this._lastPlayTime = Date.now(); // Track when music was last playing
        
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
        
        // Prevent loading the same song multiple times in quick succession
        if (this._lastLoadedSong === song.downloadUrl && Date.now() - this._lastLoadTime < 1000) {
            console.log(`🎵 Song "${song.name}" was just loaded, skipping duplicate load`);
            return;
        }
        
        this._lastLoadedSong = song.downloadUrl;
        this._lastLoadTime = Date.now();
        
        console.log(`🎵 Loading music from IA: "${song.name}" by "${song.artist}"`);
        console.log(`🎵 Download URL: ${song.downloadUrl}`);
        
        // Update UI first
        this.musicName.innerText = song.name;
        this.musicArtist.innerText = song.artist;
        
        // Reset timeline
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
        
        // Check if we have a preloaded version of this song
        const preloadedAudio = window.iaRadio.getPreloadedNextAudio();
        let audioToUse = null;
        
        if (preloadedAudio && preloadedAudio.src === song.downloadUrl) {
            console.log(`🎵 Using preloaded audio for: "${song.name}"`);
            audioToUse = preloadedAudio;
            // Clear the preloaded audio since we're using it
            window.iaRadio.clearPreloadedAudio();
        } else {
            // Load audio with improved transition logic
            if (song.downloadUrl) {
                try {
                    console.log(`🎵 Setting audio source to: ${song.downloadUrl}`);
                    
                    // Create a new audio element for smooth transition
                    const newAudio = new Audio();
                    newAudio.preload = 'auto';
                    
                    // Set up event listeners for the new audio
                    newAudio.addEventListener('canplaythrough', () => {
                        console.log(`✅ New audio ready to play: ${song.name}`);
                        this.switchToNewAudio(newAudio, song);
                    });
                    
                    newAudio.addEventListener('error', (error) => {
                        console.error(`Failed to load new audio: ${song.downloadUrl}`, error);
                        // Try to play next song if current fails
                        setTimeout(() => {
                            if (this.isRadioMode) {
                                window.iaRadio.playNext();
                            }
                        }, 1000);
                    });
                    
                    // Start loading the new audio
                    newAudio.src = song.downloadUrl;
                    newAudio.load();
                    
                    audioToUse = newAudio;
                    
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
        }
        
        // If we have audio ready, switch to it
        if (audioToUse) {
            this.switchToNewAudio(audioToUse, song);
        }
        
        // For radio mode, ensure auto-play happens even if switchToNewAudio doesn't trigger it
        if (this.isRadioMode && !this.mainAudio.paused) {
            // If we're in radio mode and should be playing, ensure the new song starts
            setTimeout(() => {
                if (this.mainAudio.paused && this.isRadioMode) {
                    console.log("🎵 Radio mode auto-play fallback triggered");
                    this.playMusic();
                }
            }, 500);
        }
        
        // Start preloading the next song for smooth transitions
        if (this.isRadioMode) {
            setTimeout(() => {
                window.iaRadio.preloadNextSong();
            }, 1000);
        }
        
        // Update playlist UI
        this.updatePlaylistUI();
    }

    // Smoothly switch to new audio without interruption
    switchToNewAudio(newAudio, song) {
        try {
            console.log(`🔄 Switching to new audio: ${song.name}`);
            
            // Store current playback state
            const wasPlaying = !this.mainAudio.paused;
            const currentTime = this.mainAudio.currentTime;
            
            // For radio mode, we want to auto-play new songs even if the previous one ended
            // Check if this is an auto-advance scenario (radio mode and song was playing recently)
            const shouldAutoPlay = this.isRadioMode || wasPlaying || this._lastPlayTime > Date.now() - 5000;
            
            // Use crossfade for smoother transitions
            if (wasPlaying) {
                this.crossfadeAudio(this.mainAudio, newAudio, () => {
                    this.completeAudioSwitch(newAudio, song, shouldAutoPlay);
                });
            } else {
                // If not playing, switch immediately
                this.completeAudioSwitch(newAudio, song, shouldAutoPlay);
            }
            
        } catch (error) {
            console.error("Error switching audio:", error);
            // Fallback to direct switch - auto-play in radio mode
            this.completeAudioSwitch(newAudio, song, this.isRadioMode);
        }
    }

    // Crossfade between two audio elements for smooth transitions
    crossfadeAudio(oldAudio, newAudio, callback) {
        const crossfadeDuration = 800; // 800ms crossfade
        const crossfadeSteps = 25;
        const crossfadeInterval = crossfadeDuration / crossfadeSteps;
        let currentStep = 0;
        
        // Set initial volumes
        oldAudio.volume = 1;
        newAudio.volume = 0;
        
        // Start playing the new audio
        newAudio.play().catch(error => {
            console.error("Error playing new audio during crossfade:", error);
            // Fallback to simple fade out
            this.fadeOutAudio(oldAudio, callback);
            return;
        });
        
        const crossfadeTimer = setInterval(() => {
            currentStep++;
            const progress = currentStep / crossfadeSteps;
            
            // Fade out old audio
            oldAudio.volume = Math.max(0, 1 - progress);
            
            // Fade in new audio
            newAudio.volume = Math.min(1, progress);
            
            if (currentStep >= crossfadeSteps) {
                clearInterval(crossfadeTimer);
                
                // Pause old audio and complete transition
                oldAudio.pause();
                oldAudio.volume = 1; // Reset volume for future use
                
                if (callback) callback();
            }
        }, crossfadeInterval);
    }

    // Fade out current audio smoothly
    fadeOutAudio(audio, callback) {
        const fadeDuration = 500; // 500ms fade
        const fadeSteps = 20;
        const fadeInterval = fadeDuration / fadeSteps;
        let currentStep = 0;
        
        const fadeTimer = setInterval(() => {
            currentStep++;
            const volume = 1 - (currentStep / fadeSteps);
            
            if (audio.volume !== undefined) {
                audio.volume = Math.max(0, volume);
            }
            
            if (currentStep >= fadeSteps) {
                clearInterval(fadeTimer);
                audio.pause();
                if (callback) callback();
            }
        }, fadeInterval);
    }

    // Complete the audio switch
    completeAudioSwitch(newAudio, song, shouldPlay) {
        try {
            console.log(`✅ Completing audio switch for: ${song.name}`);
            
            // Transfer event listeners to new audio
            this.transferEventListeners(this.mainAudio, newAudio);
            
            // Replace the main audio element
            this.mainAudio = newAudio;
            
            // Reset volume
            this.mainAudio.volume = 1;
            
            // Auto-play if it was playing before
            if (shouldPlay) {
                setTimeout(() => {
                    this.playMusic();
                }, 100);
            }
            
            console.log(`✅ Audio switch completed for: ${song.name}`);
            
        } catch (error) {
            console.error("Error completing audio switch:", error);
        }
    }

    // Transfer event listeners from old audio to new audio
    transferEventListeners(oldAudio, newAudio) {
        try {
            // Remove listeners from old audio
            if (oldAudio && this._handleSongEndedBound) {
                oldAudio.removeEventListener("ended", this._handleSongEndedBound);
                oldAudio.removeEventListener("timeupdate", this._handleTimeUpdateBound);
                oldAudio.removeEventListener("loadeddata", this._handleLoadedDataBound);
            }
            
            // Add listeners to new audio
            if (newAudio && this._handleSongEndedBound) {
                newAudio.addEventListener("ended", this._handleSongEndedBound);
                newAudio.addEventListener("timeupdate", this._handleTimeUpdateBound);
                newAudio.addEventListener("loadeddata", this._handleLoadedDataBound);
                console.log("✅ Event listeners transferred to new audio");
            }
        } catch (error) {
            console.error("Error transferring event listeners:", error);
        }
    }

    // Clean up audio event listeners
    cleanupAudioEventListeners() {
        if (this.mainAudio) {
            this.mainAudio.removeEventListener("ended", this._handleSongEndedBound);
            this.mainAudio.removeEventListener("timeupdate", this._handleTimeUpdateBound);
            this.mainAudio.removeEventListener("loadeddata", this._handleLoadedDataBound);
            this.mainAudio.removeEventListener("canplaythrough", this._handleCanPlayThroughBound);
            this.mainAudio.removeEventListener("error", this._handleAudioErrorBound);
        }
    }

    // Handle canplaythrough event
    handleCanPlayThrough() {
        console.log("✅ Audio can play through without interruption");
    }

    // Handle audio error
    handleAudioError(error) {
        console.error("Audio error occurred:", error);
        // Try to recover by playing next song
        setTimeout(() => {
            if (this.isRadioMode) {
                window.iaRadio.playNext();
            }
        }, 1000);
    }

    loadInitialMusic() {
        if (this.isRadioMode) {
            // Check if IA Radio is initialized
            if (window.iaRadio && window.iaRadio.isInitialized) {
                const currentSong = window.iaRadio.getCurrentSong();
                if (currentSong) {
                    this.loadMusicFromIA(currentSong);
                }
            } else {
                // Wait for IA Radio to initialize
                this.waitForIARadioInit();
            }
        } else {
            // Original music loading logic
            this.loadMusic(this.musicIndex).catch(console.error);
        }
        this.playingSong();
    }

    // Wait for IA Radio to initialize
    async waitForIARadioInit() {
        console.log("⏳ Waiting for IA Radio to initialize...");
        
        // Check every 100ms for initialization
        const checkInterval = setInterval(() => {
            if (window.iaRadio && window.iaRadio.isInitialized) {
                clearInterval(checkInterval);
                console.log("✅ IA Radio initialized, loading initial song...");
                
                const currentSong = window.iaRadio.getCurrentSong();
                if (currentSong) {
                    this.loadMusicFromIA(currentSong);
                }
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            console.error("❌ IA Radio initialization timeout");
        }, 10000);
    }

    // Update playlist UI
    updatePlaylistUI() {
        if (this.isRadioMode) {
            this.generateIAPlaylist();
        } else {
            this.generateOriginalPlaylist();
        }
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

        // Audio ended - attach this once and keep it
        if (this.mainAudio) {
            // Create bound functions to use for event listeners
            this._handleSongEndedBound = this.handleSongEnded.bind(this);
            this._handleTimeUpdateBound = this.handleTimeUpdate.bind(this);
            this._handleLoadedDataBound = this.handleLoadedData.bind(this);
            
            this.mainAudio.addEventListener("ended", this._handleSongEndedBound);
            console.log("✅ Audio ended event listener added");

            // Time update
            this.mainAudio.addEventListener("timeupdate", this._handleTimeUpdateBound);
            console.log("✅ Audio timeupdate event listener added");

            // Add loadeddata listener for duration
            this.mainAudio.addEventListener("loadeddata", this._handleLoadedDataBound);
            console.log("✅ Audio loadeddata event listener added");
        } else {
            console.error("❌ Main audio element not found!");
        }

        // Fullscreen change event
        document.addEventListener("fullscreenchange", () => this.handleFullscreenChange());
        document.addEventListener("webkitfullscreenchange", () => this.handleFullscreenChange());
        document.addEventListener("msfullscreenchange", () => this.handleFullscreenChange());
        console.log("✅ Fullscreen event listeners added");
        
        // Start time-based auto-advance check
        this.startAutoAdvanceCheck();
        
        console.log("🎯 Event listeners setup complete");
    }

    // Start time-based auto-advance check as a fallback
    startAutoAdvanceCheck() {
        setInterval(() => {
            if (this.mainAudio && !this.mainAudio.paused && this.mainAudio.duration > 0) {
                // Check if we're very close to the end (within 100ms)
                const timeUntilEnd = this.mainAudio.duration - this.mainAudio.currentTime;
                if (timeUntilEnd <= 0.1 && timeUntilEnd > 0) {
                    console.log("🎵 Time-based auto-advance triggered");
                    this.handleSongEnded();
                }
            }
        }, 100); // Check every 100ms
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
            
            // Update last play time for auto-play logic
            this._lastPlayTime = Date.now();
            
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
        console.log("🎵 Current radio mode:", this.isRadioMode);
        
        if (this.isRadioMode) {
            // Radio mode - auto-play next song
            console.log("🎵 Radio mode - playing next song");
            try {
                // Small delay to ensure smooth transition
                setTimeout(() => {
                    if (this.isRadioMode) {
                        console.log("🎵 Transitioning to next song");
                        window.iaRadio.playNext();
                    }
                }, 500);
            } catch (error) {
                console.error("Error playing next song:", error);
                // Fallback: try to play next song directly
                setTimeout(() => {
                    if (this.isRadioMode) {
                        window.iaRadio.playNext();
                    }
                }, 1000);
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

    handleLoadedData() {
        console.log("🎵 Audio loadeddata event fired");
        try {
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
        } catch (error) {
            console.error("Error in handleLoadedData:", error);
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
