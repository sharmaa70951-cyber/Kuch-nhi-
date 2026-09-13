import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  onValue
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyD5kH_VWXI2r_znQbhlHenqDEZBJmnJcFM",
  authDomain: "camra-share.firebaseapp.com",
  databaseURL: "https://camra-share-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "camra-share",
  storageBucket: "camra-share.firebasestorage.app",
  messagingSenderId: "618409884143",
  appId: "1:618409884143:web:d787884065b651f54f9e1a",
  measurementId: "G-ZLF7B4GFR4"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

await signInAnonymously(auth);


// Elements

const home = document.getElementById("home");
const guest = document.getElementById("guest");
const host = document.getElementById("host");

const createBtn =
  document.getElementById("createBtn");

const pressBtn =
  document.getElementById("pressBtn");

const homeStatus =
  document.getElementById("homeStatus");

const guestTitle =
  document.getElementById("guestTitle");

const guestText =
  document.getElementById("guestText");

const countdown =
  document.getElementById("countdown");

const hostStatus =
  document.getElementById("hostStatus");

const inviteLink =
  document.getElementById("inviteLink");

const copyBtn =
  document.getElementById("copyBtn");

const pressCount =
  document.getElementById("pressCount");

const stageCount =
  document.getElementById("stageCount");

const hostEvent =
  document.getElementById("hostEvent");

const hostLog =
  document.getElementById("hostLog");

const connectionDot =
  document.getElementById("connectionDot");

const connectionText =
  document.getElementById("connectionText");


// Show section

function show(section) {

  home.classList.add("hidden");
  guest.classList.add("hidden");
  host.classList.add("hidden");

  section.classList.remove("hidden");
}


// Create random room ID

function createRoomId() {

  return (
    Math.random()
      .toString(36)
      .slice(2, 10) +
    Date.now()
      .toString(36)
      .slice(-4)
  );

}


// Add event to Host log

function addLog(text) {

  const row =
    document.createElement("div");

  row.textContent = "• " + text;

  hostLog.prepend(row);

}


// Check URL

const params =
  new URLSearchParams(
    window.location.search
  );

const guestRoom =
  params.get("room");


// =============================
// HOST
// =============================

if (!guestRoom) {

  createBtn.addEventListener(
    "click",
    async () => {

      try {

        createBtn.disabled = true;

        homeStatus.textContent =
          "Room ban raha hai...";


        const roomId =
          createRoomId();


        await set(
          ref(
            db,
            `dontPressRooms/${roomId}`
          ),
          {
            createdAt: Date.now(),
            presses: 0,
            stage: 0,
            event: "Room created"
          }
        );


        const url =
          new URL(
            window.location.href
          );

        url.search = "";

        url.searchParams.set(
          "room",
          roomId
        );


        inviteLink.value =
          url.toString();


        show(host);


        hostStatus.textContent =
          "Guest ko link bhejo. Uske actions yahan live aayenge.";


        // Copy link

        copyBtn.addEventListener(
          "click",
          async () => {

            try {

              await navigator.clipboard.writeText(
                inviteLink.value
              );

              copyBtn.textContent =
                "✅ Copied";

              setTimeout(
                () => {

                  copyBtn.textContent =
                    "Copy Link";

                },
                1800
              );

            } catch {

              inviteLink.select();

              document.execCommand("copy");

            }

          }
        );


        // Listen for Guest actions

        onValue(
          ref(
            db,
            `dontPressRooms/${roomId}`
          ),

          snapshot => {

            const data =
              snapshot.val();

            if (!data) return;


            pressCount.textContent =
              data.presses || 0;


            stageCount.textContent =
              data.stage || 0;


            if (
              data.presses > 0
            ) {

              connectionText.textContent =
                "Guest Active";

              connectionDot.classList.add(
                "online"
              );

              hostStatus.textContent =
                "🟢 Guest connected hai aur game khel raha hai.";

            }


            if (
              data.event &&
              data.event !== "Room created"
            ) {

              hostEvent.textContent =
                data.event;

            }

          }
        );


        // Event log

        onValue(
          ref(
            db,
            `dontPressRooms/${roomId}/events`
          ),

          snapshot => {

            hostLog.innerHTML = "";

            const data =
              snapshot.val();

            if (!data) return;


            Object.values(data)
              .sort(
                (a, b) =>
                  a.time - b.time
              )
              .reverse()
              .forEach(
                event => {

                  addLog(
                    event.text
                  );

                }
              );

          }
        );


      } catch (error) {

        console.error(error);

        createBtn.disabled =
          false;

        homeStatus.textContent =
          "❌ Room बनाने में problem हुई.";

      }

    }
  );

}


// =============================
// GUEST
// =============================

else {

  show(guest);


  const roomRef =
    ref(
      db,
      `dontPressRooms/${guestRoom}`
    );


  const roomSnapshot =
    await get(roomRef);


  if (!roomSnapshot.exists()) {

    guestTitle.textContent =
      "Room Not Found";

    guestText.textContent =
      "Ye secret room valid nahi hai.";

    pressBtn.classList.add(
      "hidden"
    );

  }

  else {

    let presses = 0;
    let stage = 0;
    let locked = false;


    pressBtn.addEventListener(
      "click",
      async () => {

        if (locked) return;


        presses++;

        stage =
          Math.min(
            5,
            Math.floor(
              (presses - 1) / 2
            ) + 1
          );


        let title = "";
        let text = "";
        let event = "";


        if (presses === 1) {

          title =
            "😳 TUMNE PRESS KAR DIYA!";

          text =
            "Maine bola tha DON'T PRESS!";

          event =
            "😳 Guest ne first time button press kiya.";

        }

        else if (presses === 2) {

          title =
            "😂 AGAIN?!";

          text =
            "Tum seriously rukne wale nahi ho.";

          event =
            "😂 Guest ne dobara press kiya.";

        }

        else if (presses === 3) {

          title =
            "🚨 WARNING";

          text =
            "Ab game tumhe test karega...";

          event =
            "🚨 Stage 2 unlocked.";

        }

        else if (presses === 4) {

          title =
            "👀 TOO LATE";

          text =
            "Ab button tumhe dhundhega.";

          event =
            "👀 Guest reached Stage 3.";

        }

        else if (presses === 5) {

          title =
            "⏳ 5 SECONDS...";

          text =
            "Ab countdown start!";

          event =
            "⏳ Countdown started.";


          locked = true;

          pressBtn.classList.add(
            "hidden"
          );

          countdown.classList.remove(
            "hidden"
          );


          let number = 5;

          countdown.textContent =
            number;


          const timer =
            setInterval(
              () => {

                number--;

                countdown.textContent =
                  number;


                if (number <= 0) {

                  clearInterval(timer);

                  countdown.textContent =
                    "💥";


                  locked = false;

                  pressBtn.classList.remove(
                    "hidden"
                  );


                  guestTitle.textContent =
                    "🔓 SECRET MODE";

                  guestText.textContent =
                    "Tumne rule tod diya. Obviously. 😂";

                  pressBtn.textContent =
                    "🔴 PRESS AGAIN";

                }

              },
              800
            );

        }

        else {

          title =
            presses >= 8
              ? "😈 FINAL FORM"
              : "🏆 YOU CAN'T RESIST!";


          text =
            presses >= 8
              ? "Okay... you win. 😂"
              : `Tumne ${presses} baar press kar diya!`;


          event =
            presses >= 8
              ? "😈 Guest reached FINAL FORM!"
              : `🏆 Guest has pressed ${presses} times!`;

        }


        guestTitle.textContent =
          title;

        guestText.textContent =
          text;


        // Shake animation

        guest.classList.remove(
          "shake"
        );

        void guest.offsetWidth;

        guest.classList.add(
          "shake"
        );


        // Save current state

        await set(
          roomRef,
          {
            createdAt:
              roomSnapshot.val()
                .createdAt ||
              Date.now(),

            presses,

            stage,

            event,

            updatedAt:
              Date.now()
          }
        );


        // Save event

        await set(
          ref(
            db,
            `dontPressRooms/${guestRoom}/events/${Date.now()}`
          ),
          {
            text: event,
            time: Date.now()
          }
        );

      }
    );

  }

}
