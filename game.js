const SUPABASE_URL = "https://kkltydnftjwdgqtufdvl.supabase.co";
const SUPABASE_KEY = "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let channel = null;
let currentRoom = null;
let playerId = null;

// ساخت یک شناسه برای بازیکن
function createPlayerId() {
    return Math.random().toString(36).substring(2, 10);
}

// ساخت کد اتاق
function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}


// ========================================
// 🏠 ساخت اتاق
// ========================================

async function createRoom() {

    playerId = createPlayerId();
    currentRoom = generateRoomCode();

    connectToRoom(currentRoom, true);
}


// ========================================
// 🚪 ورود به اتاق
// ========================================

async function joinRoom() {

    const input = document.getElementById("roomCode");

    const code = input.value.trim().toUpperCase();

    if (code.length !== 6) {
        alert("کد اتاق باید ۶ کاراکتر باشد.");
        return;
    }

    playerId = createPlayerId();
    currentRoom = code;

    connectToRoom(currentRoom, false);
}


// ========================================
// 🔌 اتصال به اتاق
// ========================================

function connectToRoom(roomCode, isHost) {

    channel = db.channel("room-" + roomCode);

    channel
        .on(
            "broadcast",
            { event: "player_joined" },
            ({ payload }) => {

                console.log("بازیکن دوم وارد شد:", payload);

                alert("🟢 بازیکن دوم وارد اتاق شد!");

                // شروع بازی برای نفر اول
                startGame();
            }
        )

        .on(
            "broadcast",
            { event: "game_start" },
            () => {

                console.log("🎮 بازی شروع شد!");

                startGame();
            }
        )

        .subscribe(async (status) => {

            if (status !== "SUBSCRIBED") {
                return;
            }

            console.log("🟢 اتصال به اتاق برقرار شد:", roomCode);

            // نمایش کد اتاق
            const generatedCode =
                document.getElementById("generatedCode");

            if (generatedCode) {
                generatedCode.textContent = roomCode;
            }

            // اگر سازنده اتاق است
            if (isHost) {

                const roomBox =
                    document.getElementById("roomBox");

                const joinBox =
                    document.getElementById("joinBox");

                if (roomBox) {
                    roomBox.classList.remove("hidden");
                }

                if (joinBox) {
                    joinBox.classList.add("hidden");
                }

                console.log("🏠 اتاق ساخته شد.");

            } else {

                // نفر دوم وارد شد
                await channel.send({
                    type: "broadcast",
                    event: "player_joined",
                    payload: {
                        playerId: playerId
                    }
                });

                console.log("🚪 وارد اتاق شدی.");

                // به همه اعلام کن بازی آماده شروع است
                await channel.send({
                    type: "broadcast",
                    event: "game_start",
                    payload: {}
                });

                startGame();
            }
        });
}


// ========================================
// 🎮 شروع بازی
// ========================================

function startGame() {

    console.log("================================");
    console.log("🎮 GAME START");
    console.log("اتاق:", currentRoom);
    console.log("بازیکن:", playerId);
    console.log("================================");

    alert(
        "🎮 بازی شروع شد!\n\n" +
        "اتاق: " + currentRoom
    );
}