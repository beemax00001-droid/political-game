const SUPABASE_URL = "https://kkltydnftjwdgqtufdvl.supabase.co";
const SUPABASE_KEY = "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
script.onload = startSupabase;
document.head.appendChild(script);

let supabase;
let channel;
let myPlayer;

function startSupabase() {
    supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    console.log("Supabase connected!");
}

const joinBox = document.getElementById("joinBox");
const roomBox = document.getElementById("roomBox");
const roomCodeInput = document.getElementById("roomCode");
const generatedCode = document.getElementById("generatedCode");

function showJoin() {
    joinBox.classList.remove("hidden");
    roomBox.classList.add("hidden");
}

function hideJoin() {
    joinBox.classList.add("hidden");
}

function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

async function createRoom() {

    if (!supabase) {
        alert("اتصال اینترنت یا Supabase آماده نیست.");
        return;
    }

    const code = generateCode();

    myPlayer = "player1";

    generatedCode.textContent = code;

    roomBox.classList.remove("hidden");
    joinBox.classList.add("hidden");

    channel = supabase.channel("room-" + code);

    channel
        .on(
            "broadcast",
            { event: "player_joined" },
            (payload) => {

                console.log("Player 2 joined!");

                alert("🟢 بازیکن دوم وارد شد!");

                document.querySelector(".waiting").innerHTML =
                    "🟢 بازیکن دوم وارد شد!";
            }
        )
        .subscribe((status) => {

            if (status === "SUBSCRIBED") {
                console.log("Room ready:", code);
            }

        });
}

async function joinRoom() {

    if (!supabase) {
        alert("اتصال اینترنت یا Supabase آماده نیست.");
        return;
    }

    const code = roomCodeInput.value
        .trim()
        .toUpperCase();

    if (code.length !== 6) {
        alert("کد اتاق باید ۶ کاراکتر باشد.");
        return;
    }

    myPlayer = "player2";

    channel = supabase.channel("room-" + code);

    channel
        .on(
            "broadcast",
            { event: "player_joined" },
            () => {}
        )
        .subscribe(async (status) => {

            if (status === "SUBSCRIBED") {

                await channel.send({
                    type: "broadcast",
                    event: "player_joined",
                    payload: {
                        player: "player2"
                    }
                });

                alert("🟢 وارد اتاق شدی!");

                console.log("Joined room:", code);
            }

        });
}

function copyCode() {

    const code = generatedCode.textContent;

    navigator.clipboard.writeText(code)
        .then(() => {
            alert("کد اتاق کپی شد!");
        })
        .catch(() => {
            alert("کد اتاق: " + code);
        });
}