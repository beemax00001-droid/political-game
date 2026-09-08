const SUPABASE_URL = "https://kkltydnftjwdgqtufdvl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";


// ===============================
// اتصال به Supabase
// ===============================

let db = null;

if (window.supabase) {
    db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}


// ===============================
// متغیرها
// ===============================

let channel = null;
let currentRoom = null;


// ===============================
// المنت‌های صفحه
// ===============================

const joinBox =
    document.getElementById("joinBox");

const roomBox =
    document.getElementById("roomBox");

const roomCodeInput =
    document.getElementById("roomCode");

const generatedCode =
    document.getElementById("generatedCode");


// ===============================
// ساخت کد اتاق
// ===============================

function generateCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        code += characters[
            Math.floor(
                Math.random() * characters.length
            )
        ];

    }

    return code;
}


// ===============================
// نمایش ورود به اتاق
// ===============================

function showJoin() {

    joinBox.classList.remove("hidden");

    roomBox.classList.add("hidden");

    roomCodeInput.focus();
}


// ===============================
// بستن ورود
// ===============================

function hideJoin() {

    joinBox.classList.add("hidden");

}


// ===============================
// ساخت اتاق
// ===============================

async function createRoom() {

    if (!db) {

        alert(
            "اتصال آنلاین آماده نیست.\nصفحه را یک بار رفرش کن."
        );

        return;
    }


    const code = generateCode();

    currentRoom = code;


    generatedCode.textContent = code;


    joinBox.classList.add("hidden");

    roomBox.classList.remove("hidden");


    channel =
        db.channel("game-room-" + code);


    channel
        .on(
            "broadcast",
            {
                event: "player_joined"
            },
            (payload) => {

                const waiting =
                    document.querySelector(".waiting");

                if (waiting) {

                    waiting.innerHTML =
                        "🟢 بازیکن دوم وارد شد!";

                }

                alert(
                    "بازیکن دوم وارد اتاق شد!"
                );

            }
        )
        .subscribe(
            (status) => {

                if (
                    status ===
                    "SUBSCRIBED"
                ) {

                    console.log(
                        "Room created:",
                        code
                    );

                }

            }
        );

}


// ===============================
// ورود به اتاق
// ===============================

async function joinRoom() {

    if (!db) {

        alert(
            "اتصال آنلاین آماده نیست.\nصفحه را یک بار رفرش کن."
        );

        return;
    }


    const code =
        roomCodeInput.value
            .trim()
            .toUpperCase();


    if (code.length !== 6) {

        alert(
            "کد اتاق باید دقیقاً ۶ کاراکتر باشد."
        );

        return;
    }


    currentRoom = code;


    channel =
        db.channel("game-room-" + code);


    channel.subscribe(
        async (status) => {

            if (
                status ===
                "SUBSCRIBED"
            ) {

                await channel.send({

                    type: "broadcast",

                    event: "player_joined",

                    payload: {

                        player: "player2"

                    }

                });


                alert(
                    "🟢 با موفقیت وارد اتاق شدی!"
                );


                joinBox.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ===============================
// کپی کردن کد
// ===============================

async function copyCode() {

    const code =
        generatedCode.textContent;


    try {

        await navigator.clipboard.writeText(
            code
        );

        alert(
            "✅ کد اتاق کپی شد!"
        );

    } catch (error) {

        alert(
            "کد اتاق:\n" + code
        );

    }

}