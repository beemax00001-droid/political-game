const SUPABASE_URL = "https://kkltydnftjwdgqtufdvl.supabase.co";
const SUPABASE_KEY = "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let channel = null;
let roomCode = "";
let playerNumber = 0;


// ---------- ابزارها ----------

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

function hideAllScreens() {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });
}

function showScreen(id) {
    hideAllScreens();
    document.getElementById(id).classList.remove("hidden");
}


// ---------- صفحه‌ها ----------

function showCreateRoom() {
    showScreen("createScreen");
    createRoom();
}

function showJoinRoom() {
    showScreen("joinScreen");
    document.getElementById("roomCodeInput").focus();
}

function backHome() {
    showScreen("homeScreen");
}


// ---------- ساخت اتاق ----------

async function createRoom() {

    roomCode = generateRoomCode();
    playerNumber = 1;

    document.getElementById("roomCodeDisplay").textContent = roomCode;
    document.getElementById("lobbyRoomCode").textContent = roomCode;

    channel = db.channel("game-room-" + roomCode);

    channel.on("broadcast", { event: "player2_joined" }, async () => {

        document.getElementById("player2").textContent =
            "🟢 بازیکن ۲";

        document.getElementById("lobbyStatus").textContent =
            "🎮 هر دو بازیکن آماده‌اند!";

        await channel.send({
            type: "broadcast",
            event: "start_game"
        });

        startGame();
    });

    channel.subscribe(status => {

        if (status === "SUBSCRIBED") {

            document.getElementById("hostStatus").textContent =
                "🟢 اتاق ساخته شد؛ منتظر بازیکن دوم...";

            showScreen("lobbyScreen");
        }
    });
}


// ---------- ورود به اتاق ----------

async function joinRoom() {

    const input =
        document.getElementById("roomCodeInput");

    const code =
        input.value.trim().toUpperCase();

    if (code.length !== 6) {

        document.getElementById("joinStatus").textContent =
            "❌ کد باید ۶ کاراکتر باشد.";

        return;
    }

    roomCode = code;
    playerNumber = 2;

    document.getElementById("lobbyRoomCode").textContent =
        roomCode;

    channel = db.channel("game-room-" + roomCode);

    channel.on("broadcast", { event: "start_game" }, () => {

        document.getElementById("lobbyStatus").textContent =
            "🎮 بازی شروع شد!";

        startGame();
    });

    channel.subscribe(async status => {

        if (status === "SUBSCRIBED") {

            showScreen("lobbyScreen");

            document.getElementById("player2").textContent =
                "🟢 بازیکن ۲";

            document.getElementById("lobbyStatus").textContent =
                "🟢 وارد اتاق شدی؛ منتظر بازیکن اول...";

            await channel.send({
                type: "broadcast",
                event: "player2_joined"
            });
        }
    });
}


// ---------- شروع بازی ----------

function startGame() {

    showScreen("gameScreen");

    document.getElementById("gameContent").innerHTML = `
        <div>
            <h2>🎬 بازی شروع شد!</h2>
            <p>اتاق: ${roomCode}</p>
            <p>بازیکن شماره ${playerNumber}</p>
        </div>
    `;
}


// ---------- کپی کد ----------

async function copyRoomCode() {

    try {

        await navigator.clipboard.writeText(roomCode);

        alert("✅ کد اتاق کپی شد!");

    } catch (error) {

        alert("کد اتاق: " + roomCode);
    }
}