
// ====== CONFIG: replace these with values from your Firebase console ======
const firebaseConfig = {
    apiKey: "AIzaSyBgWvYqf2pv2iCyMe8Ui7BKrVjGHXGoSfI",
    authDomain: "livecountupdate.firebaseapp.com",
    databaseURL: "https://livecountupdate-default-rtdb.firebaseio.com",
    projectId: "livecountupdate",
    storageBucket: "livecountupdate.firebasestorage.app",
    messagingSenderId: "392205412851",
    appId: "1:392205412851:web:3734f056ed22322ff7ca86"
  };
  // ========================================================================
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // Safe room name based on page path
  const room = (location.pathname || "/")
    .replace(/\//g, "_")            // replace slashes with underscores
    .replace(/[.#$\[\]]/g, "_")     // remove illegal Firebase chars
    || "_root";
  
  // Check if room element exists before setting innerText
const roomElement = document.getElementById("room");
if (roomElement) {
  roomElement.innerText = "Room: " + decodeURIComponent(location.pathname || "/");
}
  
  // Reference to the room's viewers node
  const viewersRef = db.ref("viewers/" + room);
  
  // Create a unique id for this visitor
  const myId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);
  
  // Add self to viewers list
  viewersRef.child(myId).set({ ts: firebase.database.ServerValue.TIMESTAMP })
    .catch(err => console.error("Add viewer failed:", err));
  
  // Remove on disconnect
  viewersRef.child(myId).onDisconnect().remove();
  
  // Listen for changes and update count
  viewersRef.on("value", snapshot => {
    const cnt = snapshot ? snapshot.numChildren() : 0;
    const livecountElement = document.getElementById("livecount");
    if (livecountElement) {
      livecountElement.innerText = cnt + " viewers";
    }
  });
  
  // Optional: cleanup stale entries (in case onDisconnect fails)
  setInterval(async () => {
    try {
      const snap = await viewersRef.once("value");
      const now = Date.now();
      snap.forEach(child => {
        const val = child.val();
        if (val && val.ts && (now - val.ts) > (1000 * 60 * 10)) {
          viewersRef.child(child.key).remove().catch(()=>{});
        }
      });
    } catch (e) { /* ignore cleanup errors */ }
  }, 1000 * 60 * 5); // every 5 minutes