const image = document.getElementById('cover'),
    title = document.getElementById('music-title'),
    artist = document.getElementById('music-artist'),
    currentTimeEl = document.getElementById('current-time'),
    durationEl = document.getElementById('duration'),
    progress = document.getElementById('progress'),
    playerProgress = document.getElementById('player-progress'),
    prevBtn = document.getElementById('prev'),
    nextBtn = document.getElementById('next'),
    playBtn = document.getElementById('play'),
    background = document.getElementById('bg-img');

let music = new Audio();
let isPlaying = false;
let musicIndex = 0;
let songs = [];

// Your Spotify API credentials
const clientId = '57e7d63ff50e46058facee08174119c7';  // Replace with your client ID
const clientSecret = 'c8f8624cc0c245db82a065d2f8182f7c';  // Replace with your client secret
const playlistId = '5iYeSAR4fs2XXnSzjowQ9l';  // Extract the playlist ID only


function setPlaylistLink() {
    const linkElement = document.getElementById('spotifyLink');
    linkElement.href = `https://open.spotify.com/playlist/${playlistId}`;
}

// Call the function to set the link
setPlaylistLink();

// Fetch access token from Spotify (public API access)
async function getSpotifyAccessToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    if (!result.ok) {
        const errorData = await result.json();
        console.error('Error fetching Spotify token:', errorData);
        return null;
    }

    const data = await result.json();
    return data.access_token;
}

// Fetch tracks from a Spotify playlist
async function fetchSpotifyTracks() {
    const accessToken = await getSpotifyAccessToken(); // Make sure this function retrieves a valid token
    if (!accessToken) {
        console.error('Failed to retrieve Spotify access token.');
        return;
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching Spotify tracks:', errorData);
        return;
    }

    try {
        const data = await response.json();
        songs = data.items.map(item => ({
            path: item.track.preview_url || '',  // Handle missing preview URL
            displayName: item.track.name,
            cover: item.track.album.images[0]?.url || '',  // Handle missing cover
            artist: item.track.artists[0].name
        })).filter(song => song.path);  // Filter out tracks with no preview URL

        if (songs.length > 0) {
            loadMusic(songs[musicIndex]);
        } else {
            console.error('No valid songs with preview URLs found.');
        }
    } catch (error) {
        console.error('Failed to parse Spotify tracks JSON:', error);
    }
}
// Toggle play/pause
function togglePlay() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    isPlaying = true;
    playBtn.classList.replace('fa-play', 'fa-pause');
    playBtn.setAttribute('title', 'Pause');
    music.play();
}

function pauseMusic() {
    isPlaying = false;
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
    music.pause();
}

function loadMusic(song) {
    music.src = song.path;
    title.textContent = song.displayName;
    artist.textContent = song.artist;
    image.src = song.cover;
    background.src = song.cover;
}

function changeMusic(direction) {
    musicIndex = (musicIndex + direction + songs.length) % songs.length;
    loadMusic(songs[musicIndex]);
    playMusic();
}

function updateProgressBar() {
    const { duration, currentTime } = music;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    const formatTime = (time) => String(Math.floor(time)).padStart(2, '0');
    durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(duration % 60)}`;
    currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(currentTime % 60)}`;
}

function setProgressBar(e) {
    const width = playerProgress.clientWidth;
    const clickX = e.offsetX;
    music.currentTime = (clickX / width) * music.duration;
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeMusic(-1));
nextBtn.addEventListener('click', () => changeMusic(1));
music.addEventListener('ended', () => changeMusic(1));
music.addEventListener('timeupdate', updateProgressBar);
playerProgress.addEventListener('click', setProgressBar);

// Fetch tracks on page load
fetchSpotifyTracks();
