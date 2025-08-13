// Internet Archive Radio Integration
// ForzaRadio - Non-Stop Radio from IA Collection

class IARadio {
    constructor() {
        this.uploaderEmail = "vishnusanthoshvr@gmail.com";
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.isRadioMode = false;
        this.autoPlayNext = true;
        this.shuffleMode = false;
        this.shuffledIndices = [];
        
        // IA API endpoints
        this.searchUrl = `https://archive.org/advancedsearch.php?q=uploader:${this.uploaderEmail}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&output=json&rows=200`;
        this.downloadBase = "https://archive.org/download/";
    }

    // Initialize radio mode
    async initRadio() {
        try {
            await this.loadPlaylist();
            this.isRadioMode = true;
            this.setupAutoPlay();
            return true;
        } catch (error) {
            console.error("Failed to initialize radio:", error);
            return false;
        }
    }

    // Load playlist from Internet Archive
    async loadPlaylist() {
        try {
            const response = await fetch(this.searchUrl);
            const data = await response.json();
            
            if (!data.response || !data.response.docs) {
                throw new Error("No data returned from IA API");
            }

            // Filter for music uploads
            const musicItems = data.response.docs.filter(doc => /^music/.test(doc.identifier));
            
            if (musicItems.length === 0) {
                throw new Error("No music uploads found");
            }

            // Get MP3 URLs for each item
            this.currentPlaylist = [];
            for (const doc of musicItems) {
                try {
                    const mp3Url = await this.getMP3Url(doc.identifier);
                    if (mp3Url) {
                        // Extract song info from IA metadata and filename
                        const songInfo = await this.extractSongInfo(doc.identifier, doc.title, doc.creator);
                        
                        this.currentPlaylist.push({
                            name: songInfo.song,
                            artist: songInfo.artist,
                            originalTitle: doc.title || doc.identifier,
                            originalCreator: doc.creator,
                            img: null, // Will be fetched dynamically
                            src: doc.identifier,
                            iaId: doc.identifier,
                            downloadUrl: mp3Url
                        });
                        
                        console.log(`📝 Extracted: "${songInfo.song}" by "${songInfo.artist}" from ${doc.identifier}`);
                    }
                } catch (error) {
                    console.warn(`Failed to get MP3 URL for ${doc.identifier}:`, error);
                }
            }

            if (this.currentPlaylist.length === 0) {
                throw new Error("No valid MP3 files found in music uploads");
            }

            console.log(`Loaded ${this.currentPlaylist.length} songs from IA`);
            
            // Initialize the playlist display
            this.initPlaylistDisplay();
            
            return this.currentPlaylist;
        } catch (error) {
            console.error("Error loading IA playlist:", error);
            throw error;
        }
    }

    // Get the first MP3 URL from an IA item (using your improved approach)
    async getMP3Url(id) {
        try {
            const res = await fetch(`https://archive.org/metadata/${id}`);
            const data = await res.json();
            const mp3File = data.files.find(f => f.name.endsWith(".mp3"));
            if (!mp3File) return null;
            return `https://archive.org/download/${id}/${mp3File.name}`;
        } catch (err) {
            console.log("Error fetching metadata for", id, err);
            return null;
        }
    }

    // Fetch dynamic album/artist image using Spotify API with content filtering
    async getDynamicImage(songName, artistName) {
        try {
            // Clean and extract song/artist names
            const cleanSongName = this.cleanSongName(songName);
            const cleanArtistName = this.cleanArtistName(artistName);
            
            console.log(`🎵 Searching Spotify for: "${cleanSongName}" by "${cleanArtistName}"`);
            
            // Get Spotify access token
            const accessToken = await this.getSpotifyToken();
            if (!accessToken) {
                console.log("❌ Could not get Spotify access token");
                return this.generateGradientImage(songName, artistName);
            }
            
            // First try: Search for exact track
            const searchUrl = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(cleanSongName)}%20artist:${encodeURIComponent(cleanArtistName)}&type=track&limit=5`;
            
            const searchResponse = await fetch(searchUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                if (searchData.tracks && searchData.tracks.items.length > 0) {
                    const track = searchData.tracks.items[0];
                    if (track.album && track.album.images && track.album.images.length > 0) {
                        // Get the highest quality image and filter content
                        const image = track.album.images[0];
                        if (this.isImageAppropriate(track, cleanSongName, cleanArtistName)) {
                            console.log(`✅ Found appropriate Spotify album art for: ${cleanSongName}`);
                            return image.url;
                        } else {
                            console.log(`⚠️ Skipping inappropriate content for: ${cleanSongName}`);
                        }
                    }
                }
            }
            
            // Second try: Search for track by name only
            if (cleanSongName && cleanSongName !== "Unknown Song") {
                const trackSearchUrl = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(cleanSongName)}&type=track&limit=5`;
                
                const trackSearchResponse = await fetch(trackSearchUrl, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (trackSearchResponse.ok) {
                    const trackSearchData = await trackSearchResponse.json();
                    
                    if (trackSearchData.tracks && trackSearchData.tracks.items.length > 0) {
                        // Find first appropriate track
                        for (const track of trackSearchData.tracks.items) {
                            if (track.album && track.album.images && track.album.images.length > 0) {
                                if (this.isImageAppropriate(track, cleanSongName, cleanArtistName)) {
                                    const image = track.album.images[0];
                                    console.log(`✅ Found appropriate Spotify track art for: ${cleanSongName}`);
                                    return image.url;
                                }
                            }
                        }
                    }
                }
            }
            
            // Third try: Search for artist
            if (cleanArtistName && cleanArtistName !== "Unknown Artist") {
                const artistSearchUrl = `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(cleanArtistName)}&type=artist&limit=5`;
                
                const artistSearchResponse = await fetch(artistSearchUrl, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (artistSearchResponse.ok) {
                    const artistSearchData = await artistSearchResponse.json();
                    
                    if (artistSearchData.artists && artistSearchData.artists.items.length > 0) {
                        // Find first appropriate artist
                        for (const artist of artistSearchData.artists.items) {
                            if (artist.images && artist.images.length > 0) {
                                if (this.isArtistAppropriate(artist, cleanArtistName)) {
                                    const image = artist.images[0];
                                    console.log(`✅ Found appropriate Spotify artist image for: ${cleanArtistName}`);
                                    return image.url;
                                }
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.log("Error fetching image from Spotify:", error);
        }
        
        // Final fallback: Generate a gradient based on song/artist name
        console.log(`❌ No appropriate Spotify image found, generating gradient for: ${songName}`);
        return this.generateGradientImage(songName, artistName);
    }

    // Check if track content is appropriate
    isImageAppropriate(track, songName, artistName) {
        // Check explicit content flag
        if (track.explicit === true) {
            console.log(`⚠️ Skipping explicit track: ${songName}`);
            return false;
        }
        
        // Check for inappropriate words in track name
        const inappropriateWords = [
            'explicit', 'explicit content', 'parental advisory', 'clean version',
            'radio edit', 'clean edit', 'censored', 'uncensored'
        ];
        
        const trackName = (track.name || '').toLowerCase();
        const albumName = (track.album?.name || '').toLowerCase();
        
        for (const word of inappropriateWords) {
            if (trackName.includes(word) || albumName.includes(word)) {
                console.log(`⚠️ Skipping track with inappropriate content: ${songName}`);
                return false;
            }
        }
        
        // Check for mature content indicators
        if (track.album?.album_type === 'single' && track.popularity < 20) {
            // Low popularity singles might be inappropriate content
            console.log(`⚠️ Skipping low popularity single: ${songName}`);
            return false;
        }
        
        return true;
    }

    // Check if artist content is appropriate
    isArtistAppropriate(artist, artistName) {
        // Check for inappropriate words in artist name
        const inappropriateWords = [
            'explicit', 'explicit content', 'parental advisory', 'clean version',
            'radio edit', 'clean edit', 'censored', 'uncensored'
        ];
        
        const artistNameLower = (artist.name || '').toLowerCase();
        
        for (const word of inappropriateWords) {
            if (artistNameLower.includes(word)) {
                console.log(`⚠️ Skipping artist with inappropriate content: ${artistName}`);
                return false;
            }
        }
        
        // Check popularity as a general quality indicator
        if (artist.popularity < 10) {
            console.log(`⚠️ Skipping very low popularity artist: ${artistName}`);
            return false;
        }
        
        return true;
    }

    // Get Spotify access token using client credentials flow
    async getSpotifyToken() {
        try {
            const clientId = window.API_CONFIG?.SPOTIFY_CLIENT_ID;
            const clientSecret = window.API_CONFIG?.SPOTIFY_CLIENT_SECRET;
            
            if (!clientId || !clientSecret) {
                console.log("❌ Spotify credentials not configured");
                return null;
            }
            
            // Check if we have a cached token
            const cachedToken = localStorage.getItem('spotify_token');
            const tokenExpiry = localStorage.getItem('spotify_token_expiry');
            
            if (cachedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                return cachedToken;
            }
            
            // Get new token
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Cache the token for 1 hour
                localStorage.setItem('spotify_token', data.access_token);
                localStorage.setItem('spotify_token_expiry', Date.now() + (data.expires_in * 1000));
                
                console.log("✅ Got new Spotify access token");
                return data.access_token;
            } else {
                console.log("❌ Failed to get Spotify token:", response.status);
                return null;
            }
            
        } catch (error) {
            console.log("Error getting Spotify token:", error);
            return null;
        }
    }

    // Clean song name for better matching
    cleanSongName(songName) {
        if (!songName) return "";
        
        let cleaned = songName
            .replace(/^music-\d+/, '') // Remove music-1, music-2 prefixes
            .replace(/^[0-9]+\.\s*/, '') // Remove leading numbers
            .replace(/\([^)]*\)/g, '') // Remove parentheses content
            .replace(/\[[^\]]*\]/g, '') // Remove bracket content
            .replace(/\.mp3$/i, '') // Remove .mp3 extension
            .replace(/\.m4a$/i, '') // Remove .m4a extension
            .replace(/\.wav$/i, '') // Remove .wav extension
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        // If it's still empty or just numbers, try to extract from IA identifier
        if (!cleaned || /^[0-9\s]+$/.test(cleaned)) {
            return songName.replace(/^music-/, '').trim();
        }
        
        return cleaned;
    }

    // Clean artist name for better matching
    cleanArtistName(artistName) {
        if (!artistName) return "Unknown Artist";
        
        let cleaned = artistName
            .replace(/^[0-9]+\.\s*/, '') // Remove leading numbers
            .replace(/\([^)]*\)/g, '') // Remove parentheses content
            .replace(/\[[^\]]*\]/g, '') // Remove bracket content
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        return cleaned || "Unknown Artist";
    }

    // Extract song info from IA identifier and filename
    async extractSongInfo(iaId, title, creator) {
        // Try to extract from title first
        if (title && title !== iaId) {
            // Common patterns: "Artist - Song" or "Song by Artist"
            const artistSongPattern = /^(.+?)\s*[-–—]\s*(.+)$/;
            const songByPattern = /^(.+?)\s+by\s+(.+)$/i;
            
            let match = title.match(artistSongPattern);
            if (match) {
                return {
                    artist: this.cleanArtistName(match[1]),
                    song: this.cleanSongName(match[2])
                };
            }
            
            match = title.match(songByPattern);
            if (match) {
                return {
                    artist: this.cleanArtistName(match[2]),
                    song: this.cleanSongName(match[1])
                };
            }
        }
        
        // Try to extract from IA identifier (music-xxx format)
        if (iaId && iaId.startsWith('music-')) {
            const cleanId = iaId.replace(/^music-/, '');
            
            // Try to find the actual MP3 filename to extract info
            return await this.extractFromMP3Filename(iaId, cleanId);
        }
        
        // Fallback to provided creator and title
        return {
            artist: this.cleanArtistName(creator || "Unknown Artist"),
            song: this.cleanSongName(title || iaId)
        };
    }

    // Extract song info from MP3 filename
    async extractFromMP3Filename(iaId, cleanId) {
        try {
            const res = await fetch(`https://archive.org/metadata/${iaId}`);
            const data = await res.json();
            
            if (data.files) {
                const mp3File = data.files.find(f => f.name.endsWith(".mp3"));
                if (mp3File && mp3File.name) {
                    const filename = mp3File.name.replace(/\.mp3$/i, '');
                    
                    // Common patterns in filenames
                    const patterns = [
                        /^(.+?)\s*[-–—]\s*(.+)$/, // "Artist - Song"
                        /^(.+?)\s*_\s*(.+)$/, // "Artist_Song"
                        /^(.+?)\s*\.\s*(.+)$/, // "Artist.Song"
                        /^(.+?)\s+by\s+(.+)$/i, // "Song by Artist"
                        /^(.+?)\s*-\s*(.+)$/ // "Artist - Song" (simple dash)
                    ];
                    
                    for (const pattern of patterns) {
                        const match = filename.match(pattern);
                        if (match) {
                            return {
                                artist: this.cleanArtistName(match[1]),
                                song: this.cleanSongName(match[2])
                            };
                        }
                    }
                    
                    // If no pattern matches, treat the whole filename as song name
                    return {
                        artist: "Unknown Artist",
                        song: this.cleanSongName(filename)
                    };
                }
            }
        } catch (error) {
            console.log("Error extracting from MP3 filename:", error);
        }
        
        // Final fallback
        return {
            artist: "Unknown Artist",
            song: this.cleanSongName(cleanId)
        };
    }

    // Generate a gradient image based on song/artist name
    generateGradientImage(songName, artistName) {
        const text = (songName + artistName).toLowerCase();
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue1 = Math.abs(hash) % 360;
        const hue2 = (hue1 + 120) % 360; // More contrast
        const hue3 = (hue1 + 240) % 360; // Third color for more variety
        
        // Create a more sophisticated gradient
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="grad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:hsl(${hue1}, 80%, 70%);stop-opacity:1" />
                        <stop offset="50%" style="stop-color:hsl(${hue2}, 70%, 60%);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:hsl(${hue3}, 60%, 50%);stop-opacity:1" />
                    </radialGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)"/>
                <circle cx="200" cy="200" r="80" fill="rgba(255,255,255,0.1)" filter="url(#shadow)"/>
                <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" filter="url(#shadow)">🎵</text>
                <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.8">${this.cleanSongName(songName).substring(0, 20)}</text>
            </svg>
        `)}`;
    }

    // Get current song
    getCurrentSong() {
        if (this.currentPlaylist.length === 0) return null;
        
        let index = this.currentIndex;
        if (this.shuffleMode && this.shuffledIndices.length > 0) {
            index = this.shuffledIndices[this.currentIndex];
        }
        
        return this.currentPlaylist[index];
    }

    // Get next song
    getNextSong() {
        if (this.currentPlaylist.length === 0) return null;
        
        this.currentIndex++;
        if (this.currentIndex >= this.currentPlaylist.length) {
            this.currentIndex = 0; // Loop back to start
        }
        
        return this.getCurrentSong();
    }

    // Get previous song
    getPrevSong() {
        if (this.currentPlaylist.length === 0) return null;
        
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.currentPlaylist.length - 1; // Loop to end
        }
        
        return this.getCurrentSong();
    }

    // Toggle shuffle mode
    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        if (this.shuffleMode) {
            this.generateShuffleIndices();
        }
        return this.shuffleMode;
    }

    // Generate shuffled indices
    generateShuffleIndices() {
        this.shuffledIndices = Array.from({length: this.currentPlaylist.length}, (_, i) => i);
        for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
        }
    }

    // Setup auto-play functionality
    setupAutoPlay() {
        if (!this.isRadioMode) return;
        
        // Note: Auto-play is now handled by the main ForzaRadio class
        // to avoid duplicate event listeners
        console.log("✅ Auto-play setup complete (handled by main player)");
    }

    // Play next song
    playNext() {
        const nextSong = this.getNextSong();
        if (nextSong) {
            this.loadAndPlaySong(nextSong);
        }
    }

    // Play previous song
    playPrev() {
        const prevSong = this.getPrevSong();
        if (prevSong) {
            this.loadAndPlaySong(prevSong);
        }
    }

    // Load and play a specific song
    async loadAndPlaySong(song) {
        if (!song) return;
        
        // Update UI
        const musicName = document.querySelector('.song-details .name');
        const musicArtist = document.querySelector('.song-details .artist');
        const musicImg = document.querySelector('.img-area img');
        const audio = document.getElementById('main-audio');
        
        if (musicName) musicName.innerText = song.name;
        if (musicArtist) musicArtist.innerText = song.artist;
        
        // Fetch dynamic image
        if (musicImg) {
            try {
                const imageUrl = await this.getDynamicImage(song.name, song.artist);
                musicImg.src = imageUrl;
                
                // Update background with album art
                this.updateBackgroundImage(imageUrl);
            } catch (error) {
                console.log("Error loading dynamic image:", error);
                // Fallback to generated gradient
                const fallbackImage = this.generateGradientImage(song.name, song.artist);
                musicImg.src = fallbackImage;
                this.updateBackgroundImage(fallbackImage);
            }
        }
        
        if (audio) {
            audio.src = song.downloadUrl;
            audio.load();
            audio.play().catch(e => console.error("Auto-play failed:", e));
        }
        
        // Update playlist UI to highlight current song
        this.updatePlaylistUI();
    }

    // Update playlist UI to show current song
    updatePlaylistUI() {
        const listItems = document.querySelectorAll('.music-list ul li');
        listItems.forEach((item, index) => {
            item.classList.remove('playing');
            if (index === this.currentIndex) {
                item.classList.add('playing');
            }
        });
        
        // Also update the main player display
        this.updateMainPlayerDisplay();
    }

    // Update main player display (title, artist, image)
    updateMainPlayerDisplay() {
        const currentSong = this.getCurrentSong();
        if (!currentSong) {
            console.log("❌ No current song to display");
            return;
        }
        
        console.log(`🎵 Updating main player display for: "${currentSong.name}" by "${currentSong.artist}"`);
        
        const musicName = document.querySelector('.song-details .name');
        const musicArtist = document.querySelector('.song-details .artist');
        const musicImg = document.querySelector('.img-area img');
        
        if (musicName) {
            musicName.innerText = currentSong.name;
            console.log(`✅ Updated song name to: "${currentSong.name}"`);
        } else {
            console.log("❌ Song name element not found");
        }
        
        if (musicArtist) {
            musicArtist.innerText = currentSong.artist;
            console.log(`✅ Updated artist name to: "${currentSong.artist}"`);
        } else {
            console.log("❌ Artist name element not found");
        }
        
        // Update image if not already set
        if (musicImg && !musicImg.src.includes('data:image/svg+xml')) {
            this.getDynamicImage(currentSong.name, currentSong.artist).then(imageUrl => {
                musicImg.src = imageUrl;
                console.log(`✅ Updated image to: ${imageUrl}`);
                
                // Update background with album art
                this.updateBackgroundImage(imageUrl);
            }).catch(error => {
                console.log("Error updating image:", error);
                const fallbackImage = this.generateGradientImage(currentSong.name, currentSong.artist);
                musicImg.src = fallbackImage;
                this.updateBackgroundImage(fallbackImage);
            });
        }
    }

    // Get all songs for playlist display
    getAllSongs() {
        return this.currentPlaylist;
    }

    // Generate playlist HTML for the UI
    generatePlaylistHTML() {
        const playlistContainer = document.querySelector('.music-list ul');
        if (!playlistContainer) {
            console.log("❌ Playlist container not found");
            return;
        }
        
        console.log(`🎵 Generating playlist HTML for ${this.currentPlaylist.length} songs`);
        playlistContainer.innerHTML = '';
        
        this.currentPlaylist.forEach((song, index) => {
            console.log(`📝 Adding song ${index + 1}: "${song.name}" by "${song.artist}"`);
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="row">
                    <span>${song.name}</span>
                    <p>${song.artist}</p>
                </div>
                <audio class="${song.src}" src="${song.downloadUrl}"></audio>
            `;
            
            // Add click event to play this song
            li.addEventListener('click', () => {
                console.log(`🎯 Clicked on song ${index}: "${song.name}"`);
                this.playSongByIndex(index);
            });
            
            // Mark current song as playing
            if (index === this.currentIndex) {
                li.classList.add('playing');
                console.log(`▶️ Marking song ${index} as currently playing`);
            }
            
            playlistContainer.appendChild(li);
        });
        
        console.log(`✅ Playlist HTML generated with ${this.currentPlaylist.length} items`);
    }

    // Initialize playlist display
    initPlaylistDisplay() {
        if (this.currentPlaylist.length > 0) {
            this.generatePlaylistHTML();
            this.updateMainPlayerDisplay();
        }
    }

    // Play song by index
    playSongByIndex(index) {
        if (index >= 0 && index < this.currentPlaylist.length) {
            this.currentIndex = index;
            const song = this.getCurrentSong();
            this.loadAndPlaySong(song);
            
            // Update playlist UI to highlight current song
            this.updatePlaylistUI();
        }
    }

    // Refresh playlist from IA
    async refreshPlaylist() {
        try {
            await this.loadPlaylist();
            return true;
        } catch (error) {
            console.error("Failed to refresh playlist:", error);
            return false;
        }
    }

    // Get radio status
    getStatus() {
        return {
            isRadioMode: this.isRadioMode,
            totalSongs: this.currentPlaylist.length,
            currentIndex: this.currentIndex,
            shuffleMode: this.shuffleMode,
            autoPlayNext: this.autoPlayNext
        };
    }
    
    // Update background with album art
    updateBackgroundImage(imageUrl) {
        if (imageUrl) {
            document.documentElement.style.setProperty('--album-bg', `url("${imageUrl}")`);
            console.log("🎨 Updated background with album art");
        }
    }
}

// Global IA Radio instance
window.iaRadio = new IARadio();

// Debug function to manually initialize radio
window.initForzaRadio = async () => {
    console.log("🚀 Manually initializing ForzaRadio...");
    try {
        const success = await window.iaRadio.initRadio();
        if (success) {
            console.log("✅ Radio initialized successfully!");
            console.log("📊 Radio status:", window.iaRadio.getStatus());
        } else {
            console.log("❌ Failed to initialize radio");
        }
    } catch (error) {
        console.error("💥 Error initializing radio:", error);
    }
};

    // Auto-initialize when page loads
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🌐 DOM loaded, auto-initializing ForzaRadio...");
        setTimeout(() => {
            window.initForzaRadio();
        }, 1000); // Wait 1 second for everything to load
        
        // Initialize volume control
        initVolumeControl();
        
        // Initialize timeline/progress bar
        initTimeline();
        
        // Initialize player controls
        initPlayerControls();
    });

    // Initialize volume control functionality
    function initVolumeControl() {
        const volumeSlider = document.getElementById('volume-slider');
        const volumeIcon = document.querySelector('.volume-icon');
        const audio = document.getElementById('main-audio');
        
        if (!volumeSlider || !volumeIcon || !audio) {
            console.log("❌ Volume control elements not found");
            return;
        }
        
        // Set initial volume
        audio.volume = volumeSlider.value / 100;
        
        // Volume slider change event
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audio.volume = volume;
            
            // Update volume icon based on level
            updateVolumeIcon(volume);
            
            // Save volume preference
            localStorage.setItem('forza_radio_volume', volume);
        });
        
        // Volume icon click to mute/unmute
        volumeIcon.addEventListener('click', () => {
            if (audio.volume > 0) {
                // Mute
                localStorage.setItem('forza_radio_volume', audio.volume);
                audio.volume = 0;
                volumeSlider.value = 0;
                updateVolumeIcon(0);
            } else {
                // Unmute with previous volume
                const savedVolume = localStorage.getItem('forza_radio_volume') || 1;
                audio.volume = savedVolume;
                volumeSlider.value = savedVolume * 100;
                updateVolumeIcon(savedVolume);
            }
        });
        
        // Load saved volume preference
        const savedVolume = localStorage.getItem('forza_radio_volume');
        if (savedVolume !== null) {
            audio.volume = savedVolume;
            volumeSlider.value = savedVolume * 100;
            updateVolumeIcon(savedVolume);
        }
    }
    
    // Update volume icon based on volume level
    function updateVolumeIcon(volume) {
        const volumeIcon = document.querySelector('.volume-icon');
        if (!volumeIcon) return;
        
        if (volume === 0) {
            volumeIcon.textContent = 'volume_off';
        } else if (volume < 0.5) {
            volumeIcon.textContent = 'volume_down';
        } else {
            volumeIcon.textContent = 'volume_up';
        }
    }
    
    // Initialize timeline/progress bar functionality
    function initTimeline() {
        const progressArea = document.querySelector('.progress-area');
        const progressBar = document.querySelector('.progress-bar');
        const audio = document.getElementById('main-audio');
        const currentTimeSpan = document.querySelector('.current-time');
        const maxDurationSpan = document.querySelector('.max-duration');
        
        if (!progressArea || !progressBar || !audio) {
            console.log("❌ Timeline elements not found");
            return;
        }
        
        // Update progress bar and time display
        function updateTimeline() {
            if (audio.duration && isFinite(audio.duration)) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = progressPercent + '%';
                
                // Update time displays
                if (currentTimeSpan) {
                    currentTimeSpan.textContent = formatTime(audio.currentTime);
                }
                if (maxDurationSpan) {
                    maxDurationSpan.textContent = formatTime(audio.duration);
                }
            }
        }
        
        // Format time in MM:SS format
        function formatTime(seconds) {
            if (!isFinite(seconds)) return '0:00';
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Click on progress bar to seek
        progressArea.addEventListener('click', (e) => {
            const rect = progressArea.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progressWidth = rect.width;
            const seekPercent = clickX / progressWidth;
            
            if (audio.duration && isFinite(audio.duration)) {
                audio.currentTime = seekPercent * audio.duration;
            }
        });
        
        // Note: Timeline updates are now handled by the main ForzaRadio class
        // to avoid duplicate event listeners
        
        console.log("✅ Timeline initialized successfully");
    }
    
    // Initialize player controls functionality
    function initPlayerControls() {
        const playPauseBtn = document.querySelector('.top-play-pause');
        const repeatBtn = document.querySelector('.repeat-btn');


        const audio = document.getElementById('main-audio');
        
        if (!playPauseBtn || !repeatBtn || !audio) {
            console.log("❌ Player control elements not found");
            return;
        }
        
        let isPlaying = false;
        
        // Note: Play/Pause functionality is handled by the main ForzaRadio class
        // to avoid conflicts and ensure consistent behavior
        
        // Repeat button (toggle shuffle)
        repeatBtn.addEventListener('click', () => {
            if (window.iaRadio && window.iaRadio.isRadioMode) {
                const shuffleMode = window.iaRadio.toggleShuffle();
                repeatBtn.style.background = shuffleMode ? 
                    'linear-gradient(var(--pink) 0%, var(--violet) 100%)' : 
                    'transparent';
                repeatBtn.style.color = shuffleMode ? 'white' : 'inherit';
                console.log(`🔄 Shuffle mode: ${shuffleMode ? 'ON' : 'OFF'}`);
            }
        });
        
        // Note: Play/pause state updates and auto-play are now handled by 
        // the main ForzaRadio class to avoid duplicate event listeners
        
        console.log("✅ Player controls initialized successfully");
    }
