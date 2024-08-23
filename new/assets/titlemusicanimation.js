var audio = document.getElementById("audioPlayer"),
    loader = document.getElementById("preloader");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);

source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function updateTitle() {
    if (audio.paused) return; // Stop updating the title if the audio is paused

    requestAnimationFrame(updateTitle);

    analyser.getByteFrequencyData(dataArray);

    let sum = dataArray.reduce((a, b) => a + b, 0);
    let average = sum / bufferLength;
    let visualEffect = '|'.repeat(Math.floor(average / 10));

    document.title = visualEffect || 'Audio Visualizer';
}

function playpause() {
    if (document.getElementById("switchforsound").checked == false) {
        audio.pause();
        
    } else {
        audio.play();
        audioContext.resume().then(() => {
            updateTitle(); // Start updating the title when audio plays
        });
    }
}

function settingtoggle() {
    document.getElementById("setting-container").classList.toggle("settingactivate");
    document.getElementById("visualmodetogglebuttoncontainer").classList.toggle("visualmodeshow");
    document.getElementById("soundtogglebuttoncontainer").classList.toggle("soundmodeshow");
}

function visualmode() {
    document.body.classList.toggle("light-mode");
    document.querySelectorAll(".needtobeinvert").forEach(function(e) {
        e.classList.toggle("invertapplied");
    });
}

window.addEventListener("load", function() {
    loader.style.display = "none";
    document.querySelector(".hey").classList.add("popup");
});