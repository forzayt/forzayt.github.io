# 🎵 ForzaRadio - Internet Archive Non-Stop Radio

> **Transform your music player into a continuous radio stream from your Internet Archive collection**

## 🚀 Overview

ForzaRadio is an enhanced version of the original music player that automatically streams music from your Internet Archive uploads. It creates a non-stop radio experience that continuously plays your uploaded music collection.

## ✨ Key Features

### 🎧 **Radio Mode**
- **Auto-play**: Continuous streaming without interruption
- **IA Integration**: Direct connection to your Internet Archive collection
- **Smart Fallback**: Falls back to original playlist if IA is unavailable
- **Real-time Updates**: Refresh playlist to get latest uploads

### 🎛️ **Enhanced Controls**
- **Shuffle Mode**: Random song selection for variety
- **Sequential Mode**: Play songs in order
- **Refresh Button**: Update playlist from IA
- **Progress Tracking**: Visual progress with click-to-seek

### 📱 **User Experience**
- **Radio Indicators**: Clear visual feedback for radio mode
- **Status Display**: Connection and song count information
- **Responsive Design**: Works on all devices
- **Embeddable**: Can be embedded in any website

## 🛠️ Technical Architecture

### **File Structure**
```
forzaRadio/
├── index.html              # Main application (hybrid mode)
├── embed/
│   ├── index.html          # Original embed version
│   └── radio.html          # Radio-only version
├── js/
│   ├── music-list.js       # Original song data
│   ├── ia-radio.js         # IA integration logic
│   └── forza-radio.js      # Main radio controller
├── style.css               # Styling
├── test-ia.html           # IA integration test
└── upload.bat.txt          # IA upload script
```

### **Core Components**

#### 1. **IARadio Class** (`js/ia-radio.js`)
- Handles Internet Archive API communication
- Manages playlist loading and caching
- Controls shuffle and sequential modes
- Auto-play functionality

#### 2. **ForzaRadio Class** (`js/forza-radio.js`)
- Main application controller
- Integrates IA radio with original player
- Manages UI updates and event handling
- Provides fallback to original music

#### 3. **Radio Interface** (`embed/radio.html`)
- Dedicated radio streaming interface
- Auto-start functionality
- Radio-specific styling and indicators

## 🔧 Setup Instructions

### **1. Internet Archive Integration**

Your upload system is already configured:
- **Upload Script**: `upload.bat.txt` handles MP3 uploads to IA
- **Email**: `vishnusanthoshvr@gmail.com` (configured in IA radio)
- **File Naming**: `music_YYYYMMDD_HHMMSS_filename` format
- **Metadata**: Title and artist extracted via ffprobe

### **2. Usage Options**

#### **Option A: Hybrid Mode** (Recommended)
```html
<!-- Use main index.html - automatically detects IA availability -->
<!-- Falls back to original music if IA is unavailable -->
```

#### **Option B: Radio-Only Mode**
```html
<!-- Use embed/radio.html for dedicated radio experience -->
<!-- Auto-starts and focuses on IA streaming -->
```

#### **Option C: Embed in Other Sites**
```html
<!-- Embed the radio player -->
<iframe src="https://your-domain.com/embed/radio.html"
        title="ForzaRadio"
        width="100%"
        height="400"
        frameborder="0">
</iframe>
```

### **3. Configuration**

#### **IA Radio Settings** (`js/ia-radio.js`)
```javascript
class IARadio {
    constructor() {
        this.uploaderEmail = "vishnusanthoshvr@gmail.com"; // Your IA email
        this.autoPlayNext = true;                          // Auto-play enabled
        this.shuffleMode = false;                          // Default: sequential
    }
}
```

#### **Customization Options**
- **Email**: Change `uploaderEmail` to your IA account
- **Auto-play**: Set `autoPlayNext` to false to disable
- **Shuffle**: Set `shuffleMode` to true for default shuffle
- **API Limits**: Adjust `rows=200` in search URL for more songs

## 🎮 How It Works

### **1. Initialization Process**
1. **Load IA Playlist**: Fetches your uploaded music from IA
2. **Format Data**: Converts IA metadata to player format
3. **Setup Auto-play**: Configures continuous streaming
4. **Fallback Check**: Uses original music if IA fails

### **2. Radio Streaming**
1. **Song Selection**: Gets next song from playlist
2. **Audio Loading**: Streams from IA download URLs
3. **Auto-advance**: Automatically plays next song when current ends
4. **UI Updates**: Updates player interface with current song info

### **3. User Controls**
- **Play/Pause**: Standard audio controls
- **Next/Previous**: Manual song navigation
- **Shuffle**: Toggle between random and sequential
- **Refresh**: Update playlist from IA
- **Progress Bar**: Click to seek within songs

## 🔄 Upload Workflow

### **1. Prepare Music Files**
```
C:\Users\vishn\Music\Upload\
├── song1.mp3
├── song2.mp3
└── song3.mp3
```

### **2. Run Upload Script**
```batch
# Execute upload.bat.txt
# Automatically uploads all MP3s to IA
# Extracts metadata using ffprobe
# Creates unique identifiers
```

### **3. Radio Integration**
- **Automatic Detection**: ForzaRadio finds new uploads
- **Real-time Updates**: Refresh button gets latest songs
- **Seamless Playback**: No manual configuration needed

## 🎨 Customization

### **Styling**
```css
/* Radio indicator colors */
.radio-indicator {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}

/* Auto-play indicator */
.auto-play-indicator {
    background: #4CAF50;
}
```

### **Behavior**
```javascript
// Disable auto-play
window.iaRadio.autoPlayNext = false;

// Enable shuffle by default
window.iaRadio.shuffleMode = true;

// Custom refresh interval
setInterval(() => {
    window.iaRadio.refreshPlaylist();
}, 300000); // Refresh every 5 minutes
```

## 🚀 Deployment

### **GitHub Pages**
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/repository-name`

### **Custom Domain**
1. Upload files to web server
2. Configure domain DNS
3. Access via your custom domain

### **Local Testing**
1. Use local web server (Python, Node.js, etc.)
2. Test IA integration with your uploads
3. Verify auto-play functionality

## 🔍 Troubleshooting

### **Common Issues**

#### **IA Connection Failed**
- Check internet connection
- Verify IA API availability
- Confirm email address in configuration
- Check browser console for errors

#### **No Songs Found**
- Ensure songs are uploaded to IA
- Verify uploader email matches configuration
- Check IA search API response
- Use browser dev tools to debug

#### **Auto-play Not Working**
- Modern browsers block auto-play
- User must interact with page first
- Check browser autoplay policies
- Consider manual play button

### **Debug Mode**
```javascript
// Enable debug logging
console.log("IA Radio Status:", window.iaRadio.getStatus());
console.log("Current Song:", window.iaRadio.getCurrentSong());
console.log("Playlist:", window.iaRadio.getAllSongs());
```

## 📈 Future Enhancements

### **Planned Features**
- **Volume Control**: Add volume slider
- **Playlist Management**: Create custom playlists
- **Audio Visualizations**: Add visual effects
- **Offline Mode**: Cache songs for offline playback
- **Social Features**: Share current song
- **Analytics**: Track listening statistics

### **API Improvements**
- **Caching**: Local storage for better performance
- **Pagination**: Handle large music collections
- **Search**: Filter songs by title/artist
- **Categories**: Organize music by genre/mood

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

### **Testing**
- Test with different IA collections
- Verify fallback functionality
- Check mobile responsiveness
- Validate embed functionality

## 📄 License

This project is based on the original MusicApp by Samir Paul and enhanced with ForzaRadio functionality.

## 🎵 Enjoy Your Radio!

ForzaRadio transforms your music collection into a continuous streaming experience. Upload your music to Internet Archive, and let ForzaRadio create your personal radio station!

---

**🎧 Start streaming your IA music collection today!**
