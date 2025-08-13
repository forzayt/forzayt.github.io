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
        // Prevent rapid song changes
        if (this._isChangingSong) {
            console.log("🎵 Song change already in progress, skipping...");
            return;
        }
        
        this._isChangingSong = true;
        
        const nextSong = this.getNextSong();
        if (nextSong) {
            console.log(`🎵 Playing next song: "${nextSong.name}"`);
            
            // Instead of directly manipulating audio, notify the main player
            if (window.forzaRadio && window.forzaRadio.isRadioMode) {
                // Add a small delay to ensure smooth transition
                setTimeout(() => {
                    window.forzaRadio.loadMusicFromIA(nextSong);
                    
                    // Auto-play the new song after it's loaded
                    setTimeout(() => {
                        if (window.forzaRadio && !window.forzaRadio.mainAudio.paused) {
                            // Only auto-play if it was already playing
                            window.forzaRadio.playMusic();
                        }
                        
                        // Reset the flag after transition
                        setTimeout(() => {
                            this._isChangingSong = false;
                        }, 500);
                    }, 200);
                }, 100);
            } else {
                this._isChangingSong = false;
            }
        } else {
            console.log("❌ No next song available");
            this._isChangingSong = false;
        }
    }

    // Play previous song
    playPrev() {
        // Prevent rapid song changes
        if (this._isChangingSong) {
            console.log("🎵 Song change already in progress, skipping...");
            return;
        }
        
        this._isChangingSong = true;
        
        const prevSong = this.getPrevSong();
        if (prevSong) {
            console.log(`🎵 Playing previous song: "${prevSong.name}"`);
            
            // Instead of directly manipulating audio, notify the main player
            if (window.forzaRadio && window.forzaRadio.isRadioMode) {
                // Add a small delay to ensure smooth transition
                setTimeout(() => {
                    window.forzaRadio.loadMusicFromIA(prevSong);
                    
                    // Auto-play the new song after it's loaded
                    setTimeout(() => {
                        if (window.forzaRadio && !window.forzaRadio.mainAudio.paused) {
                            // Only auto-play if it was already playing
                            window.forzaRadio.playMusic();
                        }
                        
                        // Reset the flag after transition
                        setTimeout(() => {
                            this._isChangingSong = false;
                        }, 500);
                    }, 200);
                }, 100);
            } else {
                this._isChangingSong = false;
            }
        } else {
            console.log("❌ No previous song available");
            this._isChangingSong = false;
        }
    }

    // Load and play a specific song
    async loadAndPlaySong(song) {
        if (!song) return;
        
        // Instead of directly manipulating audio, work through the main player
        if (window.forzaRadio && window.forzaRadio.isRadioMode) {
            window.forzaRadio.loadMusicFromIA(song);
            // Auto-play the new song
            setTimeout(() => {
                if (window.forzaRadio) {
                    window.forzaRadio.playMusic();
                }
            }, 100);
        }
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
            // Prevent rapid song changes
            if (this._isChangingSong) {
                console.log("🎵 Song change already in progress, skipping...");
                return;
            }
            
            this._isChangingSong = true;
            
            this.currentIndex = index;
            const song = this.getCurrentSong();
            
            console.log(`🎵 Playing song by index ${index}: "${song.name}"`);
            
            // Work through the main player instead of directly manipulating audio
            if (window.forzaRadio && window.forzaRadio.isRadioMode) {
                // Add a small delay to ensure smooth transition
                setTimeout(() => {
                    window.forzaRadio.loadMusicFromIA(song);
                    
                    // Auto-play the new song after it's loaded
                    setTimeout(() => {
                        if (window.forzaRadio && !window.forzaRadio.mainAudio.paused) {
                            // Only auto-play if it was already playing
                            window.forzaRadio.playMusic();
                        }
                        
                        // Reset the flag after transition
                        setTimeout(() => {
                            this._isChangingSong = false;
                        }, 500);
                    }, 200);
                }, 100);
            } else {
                this._isChangingSong = false;
            }
            
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

    // Preload next song for smooth transitions
    preloadNextSong() {
        if (this.currentPlaylist.length === 0) return null;
        
        const nextIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
        const nextSong = this.currentPlaylist[nextIndex];
        
        if (nextSong && nextSong.downloadUrl) {
            console.log(`🎵 Preloading next song: "${nextSong.name}"`);
            
            // Create a hidden audio element to preload
            const preloadAudio = new Audio();
            preloadAudio.preload = 'auto';
            preloadAudio.src = nextSong.downloadUrl;
            preloadAudio.load();
            
            // Store the preloaded audio for quick access
            this._preloadedNextAudio = preloadAudio;
            
            preloadAudio.addEventListener('canplaythrough', () => {
                console.log(`✅ Next song preloaded: "${nextSong.name}"`);
            });
            
            preloadAudio.addEventListener('error', (error) => {
                console.log(`❌ Failed to preload next song: "${nextSong.name}"`, error);
                this._preloadedNextAudio = null;
            });
            
            return nextSong;
        }
        
        return null;
    }

    // Get preloaded next song audio if available
    getPreloadedNextAudio() {
        return this._preloadedNextAudio;
    }

    // Clear preloaded audio
    clearPreloadedAudio() {
        if (this._preloadedNextAudio) {
            this._preloadedNextAudio.src = '';
            this._preloadedNextAudio = null;
        }
    }
}

// Global IA Radio instance
window.iaRadio = new IARadio();
