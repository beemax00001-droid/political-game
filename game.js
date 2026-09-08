/* ==================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE + MULTIPLAYER
   ================================================== */

const SUPABASE_URL =
    "https://kkltydnftjwdgqtufdvl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";


/* ==================================================
   SUPABASE
   ================================================== */

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==================================================
   VARIABLES
   ================================================== */

let channel = null;

let roomCode = "";

let playerId = "";

let playerNumber = 0;

let isHost = false;

let joined = false;

let gameStarted = false;

let currentEvent = null;

let gameState = null;

let joinTimeout = null;


/* ==================================================
   INITIAL STATE
   ================================================== */

function createCountry(name) {

    return {

        name: name,

        money: 100,

        electricity: 80,

        economy: 70,

        popularity: 60,

        security: 70,

        relations: 50,

        sanctions: 0

    };
}


function createGameState() {

    return {

        turn: 1,

        maxTurns: 12,

        player1: createCountry("جمهوری اول"),

        player2: createCountry("جمهوری دوم"),

        currentPlayer: 1,

        currentEventId: null,

        gameOver: false

    };
}


/* ==================================================
   PLAYER ID
   ================================================== */

function createPlayerId() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );
}


/* ==================================================
   ROOM CODE
   ================================================== */

function generateRoomCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (let i = 0; i < 6; i++) {

        result +=
            chars[
                Math.floor(
                    Math.random() * chars.length
                )
            ];
    }

    return result;
}


/* ==================================================
   SCREEN MANAGEMENT
   ================================================== */

function hideAllScreens() {

    document
        .querySelectorAll(".screen, .game-screen")
        .forEach(element => {

            element.classList.remove("active");

        });
}


function showScreen(id) {

    hideAllScreens();

    const element =
        document.getElementById(id);

    if (element) {

        element.classList.add("active");

    }
}


/* ==================================================
   CONNECTION STATUS
   ================================================== */

function setConnectionStatus(text) {

    const element =
        document.getElementById("connectionStatus");

    if (element) {

        element.textContent = text;

    }
}


/* ==================================================
   HOME
   ================================================== */

function showCreateRoom() {

    playerId = createPlayerId();

    playerNumber = 1;

    isHost = true;

    createRoom();
}


function showJoinRoom() {

    showScreen("joinScreen");

    const input =
        document.getElementById("roomCodeInput");

    if (input) {

        setTimeout(() => input.focus(), 100);

    }
}


function backHome() {

    cleanupRoom();

    showScreen("homeScreen");
}


/* ==================================================
   CREATE ROOM
   ================================================== */

async function createRoom() {

    roomCode = generateRoomCode();

    gameState = createGameState();

    showScreen("createScreen");

    document.getElementById(
        "roomCodeDisplay"
    ).textContent = roomCode;

    document.getElementById(
        "hostStatus"
    ).textContent = "در حال اتصال به اتاق...";


    await connectToRoom();


    if (!channel) {

        return;

    }


    document.getElementById(
        "hostStatus"
    ).textContent =
        "🟢 اتاق ساخته شد؛ کد را به بازیکن دوم بده.";


    document.getElementById(
        "lobbyRoomCode"
    ).textContent = roomCode;

}


/* ==================================================
   JOIN ROOM
   ================================================== */

async function joinRoom() {

    const input =
        document.getElementById("roomCodeInput");

    const status =
        document.getElementById("joinStatus");


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (!/^[A-Z0-9]{6}$/.test(code)) {

        status.textContent =
            "❌ کد باید دقیقاً ۶ کاراکتر باشد.";

        return;

    }


    playerId = createPlayerId();

    playerNumber = 2;

    isHost = false;

    roomCode = code;


    status.textContent =
        "🔌 در حال پیدا کردن اتاق...";


    const connected =
        await connectToRoom();


    if (!connected) {

        status.textContent =
            "❌ اتصال به اتاق برقرار نشد.";

        return;

    }


    showScreen("lobbyScreen");


    document.getElementById(
        "lobbyRoomCode"
    ).textContent = roomCode;


    document.getElementById(
        "lobbyStatus"
    ).textContent =
        "🟡 در حال درخواست ورود از میزبان...";


    /*
     * از میزبان درخواست ورود می‌کنیم.
     */

    await sendMessage(
        "room_join_request",
        {
            playerId: playerId
        }
    );


    /*
     * اگر میزبان وجود نداشته باشد،
     * بعد از 8 ثانیه خطا می‌دهیم.
     */

    clearTimeout(joinTimeout);

    joinTimeout = setTimeout(() => {

        if (!joined && !gameStarted) {

            document.getElementById(
                "lobbyStatus"
            ).textContent =
                "❌ اتاق پیدا نشد یا میزبان آفلاین است.";

        }

    }, 8000);

}


/* ==================================================
   CONNECT TO ROOM
   ================================================== */

async function connectToRoom() {

    if (!roomCode) {

        return false;

    }


    /*
     * اگر کانال قبلی وجود دارد حذفش می‌کنیم.
     */

    if (channel) {

        await db.removeChannel(channel);

        channel = null;

    }


    /*
     * Public Broadcast
     * برای نسخه فعلی نیازی به Auth ندارد.
     */

    channel = db.channel(
        "game-room-" + roomCode,
        {
            config: {

                broadcast: {

                    self: false,

                    ack: true

                },

                presence: {

                    key: playerId

                }

            }

        }
    );


    /* ---------- Broadcast listeners ---------- */


    channel.on(
        "broadcast",
        {
            event: "room_join_request"
        },
        async payload => {

            if (!isHost) {

                return;

            }


            const joiningPlayer =
                payload?.payload?.playerId;


            if (!joiningPlayer) {

                return;

            }


            /*
             * نفر دوم وارد شد.
             */

            joined = true;


            updateHostPlayer2(true);


            await sendMessage(
                "room_join_accepted",
                {
                    playerId: joiningPlayer
                }
            );


            /*
             * وضعیت فعلی بازی را برای نفر دوم می‌فرستیم.
             */

            await sendMessage(
                "game_state",
                {
                    state: gameState
                }
            );


            /*
             * بازی را برای هر دو شروع می‌کنیم.
             */

            await sendMessage(
                "game_start",
                {
                    state: gameState
                }
            );


            startGame();

        }
    );


    channel.on(
        "broadcast",
        {
            event: "room_join_accepted"
        },
        payload => {

            if (isHost) {

                return;

            }


            const acceptedPlayer =
                payload?.payload?.playerId;


            if (
                acceptedPlayer === playerId
            ) {

                joined = true;

                clearTimeout(joinTimeout);


                document.getElementById(
                    "lobbyStatus"
                ).textContent =
                    "🟢 ورود به اتاق تأیید شد.";

            }

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_state"
        },
        payload => {

            if (isHost) {

                return;

            }


            if (payload?.payload?.state) {

                gameState =
                    payload.payload.state;

                renderGameState();

            }

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_start"
        },
        payload => {

            if (isHost) {

                return;

            }


            if (payload?.payload?.state) {

                gameState =
                    payload.payload.state;

            }


            joined = true;

            clearTimeout(joinTimeout);

            startGame();

        }
    );


    channel.on(
        "broadcast",
        {
            event: "event_update"
        },
        payload => {

            if (payload?.payload?.event) {

                currentEvent =
                    payload.payload.event;

                renderEvent();

            }

        }
    );


    channel.on(
        "broadcast",
        {
            event: "player_choice"
        },
        async payload => {

            if (!isHost) {

                return;

            }


            const choiceId =
                payload?.payload?.choiceId;

            const senderId =
                payload?.payload?.playerId;


            if (
                !choiceId ||
                !senderId
            ) {

                return;

            }


            if (
                senderId !== playerId
            ) {

                handlePlayer2Choice(
                    choiceId
                );

            }

        }
    );


    channel.on(
        "broadcast",
        {
            event: "state_update"
        },
        payload => {

            if (
                isHost
            ) {

                return;

            }


            if (payload?.payload?.state) {

                gameState =
                    payload.payload.state;

                renderGameState();

            }

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_over"
        },
        payload => {

            if (payload?.payload) {

                showGameResult(
                    payload.payload
                );

            }

        }
    );


    /* ---------- Presence ---------- */

    channel.on(
        "presence",
        {
            event: "sync"
        },
        () => {

            const state =
                channel.presenceState();

            const count =
                Object.keys(state).length;


            if (isHost && count >= 2) {

                updateHostPlayer2(true);

            }

        }
    );


    channel.on(
        "presence",
        {
            event: "join"
        },
        () => {

            if (isHost) {

                updateHostPlayer2(true);

            }

        }
    );


    channel.on(
        "presence",
        {
            event: "leave"
        },
        () => {

            if (isHost) {

                updateHostPlayer2(false);

            }

        }
    );


    /* ---------- Subscribe ---------- */

    return new Promise(resolve => {

        channel.subscribe(
            async (status, error) => {

                console.log(
                    "ROOM STATUS:",
                    status,
                    error || ""
                );


                if (
                    status === "SUBSCRIBED"
                ) {

                    setConnectionStatus(
                        "● آنلاین"
                    );


                    /*
                     * Presence را ثبت می‌کنیم.
                     */

                    await channel.track({

                        playerId: playerId,

                        playerNumber:
                            playerNumber,

                        onlineAt:
                            new Date().toISOString()

                    });


                    resolve(true);

                    return;

                }


                if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT"
                ) {

                    console.error(
                        "CHANNEL ERROR:",
                        error
                    );

                    resolve(false);

                }

            }
        );

    });

}


/* ==================================================
   SEND MESSAGE
   ================================================== */

async function sendMessage(
    event,
    payload = {}
) {

    if (!channel) {

        return false;

    }


    try {

        const result =
            await channel.send({

                type: "broadcast",

                event: event,

                payload: payload

            });


        console.log(
            "SEND:",
            event,
            result
        );


        return true;

    } catch (error) {

        console.error(
            "SEND ERROR:",
            error
        );

        return false;

    }

}


/* ==================================================
   PLAYER UI
   ================================================== */

function updateHostPlayer2(connected) {

    const element =
        document.getElementById(
            "hostPlayer2"
        );


    if (!element) {

        return;

    }


    if (connected) {

        element.classList.remove(
            "waiting"
        );

        element.innerHTML =
            "<span>🟢 بازیکن ۲</span>" +
            "<strong>متصل</strong>";

        document.getElementById(
            "hostStatus"
        ).textContent =
            "🟢 بازیکن دوم وارد شد!";

    } else {

        element.classList.add(
            "waiting"
        );

        element.innerHTML =
            "<span>⚪ بازیکن ۲</span>" +
            "<strong>منتظر...</strong>";

    }

}


/* ==================================================
   START GAME
   ================================================== */

function startGame() {

    if (gameStarted) {

        return;

    }


    gameStarted = true;


    if (!gameState) {

        gameState =
            createGameState();

    }


    showScreen("gameScreen");


    renderGameState();


    /*
     * فقط میزبان اتفاق بعدی را انتخاب می‌کند.
     * این باعث می‌شود دو گوشی با هم تداخل نکنند.
     */

    if (isHost) {

        setTimeout(() => {

            nextEvent();

        }, 800);

    }

}


/* ==================================================
   NEXT EVENT
   ================================================== */

async function nextEvent() {

    if (!isHost) {

        return;

    }


    if (
        gameState.gameOver
    ) {

        return;

    }


    /*
     * AI وضعیت فعلی را بررسی می‌کند.
     */

    const event =
        AIDirector.chooseEvent(
            gameState
        );


    currentEvent = event;

    gameState.currentEventId =
        event.id;


    /*
     * نمایش برای میزبان
     */

    renderEvent();


    /*
     * ارسال اتفاق به بازیکن دوم
     */

    await sendMessage(
        "event_update",
        {
            event: event
        }
    );


    updateDirectorMessage();

}


/* ==================================================
   RENDER EVENT
   ================================================== */

function renderEvent() {

    if (!currentEvent) {

        return;

    }


    const icon =
        document.getElementById(
            "eventIcon"
        );

    const category =
        document.getElementById(
            "eventCategory"
        );

    const title =
        document.getElementById(
            "eventTitle"
        );

    const description =
        document.getElementById(
            "eventDescription"
        );

    const choices =
        document.getElementById(
            "eventChoices"
        );


    icon.textContent =
        currentEvent.icon;

    category.textContent =
        currentEvent.category;

    title.textContent =
        currentEvent.title;

    description.textContent =
        currentEvent.description;


    choices.innerHTML = "";


    currentEvent.choices.forEach(
        choice => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "choice";

            button.textContent =
                choice.title;


            button.onclick = () => {

                chooseEvent(
                    choice.id
                );

            };


            choices.appendChild(
                button
            );

        }
    );

}


/* ==================================================
   CHOOSE EVENT
   ================================================== */

async function chooseEvent(choiceId) {

    if (!currentEvent) {

        return;

    }


    /*
     * هر بازیکن انتخاب خودش را
     * برای میزبان می‌فرستد.
     */

    if (!isHost) {

        await sendMessage(
            "player_choice",
            {
                playerId: playerId,

                choiceId: choiceId
            }
        );

        return;

    }


    /*
     * میزبان انتخاب را اجرا می‌کند.
     */

    applyChoice(
        playerNumber,
        choiceId
    );

}


/* ==================================================
   PLAYER 2 CHOICE
   ================================================== */

function handlePlayer2Choice(
    choiceId
) {

    applyChoice(
        2,
        choiceId
    );

}


/* ==================================================
   APPLY CHOICE
   ================================================== */

async function applyChoice(
    selectedPlayer,
    choiceId
) {

    if (!currentEvent) {

        return;

    }


    const choice =
        currentEvent.choices.find(
            item =>
                item.id === choiceId
        );


    if (!choice) {

        return;

    }


    const country =
        selectedPlayer === 1
            ? gameState.player1
            : gameState.player2;


    /*
     * اعمال اثر
     */

    applyEffects(
        country,
        choice.effect
    );


    /*
     * نوبت
     */

    gameState.turn += 1;


    /*
     * نمایش نتیجه
     */

    renderGameState();


    /*
     * پیام کارگردان
     */

    document.getElementById(
        "directorMessage"
    ).textContent =
        choice.message;


    /*
     * ارسال وضعیت جدید به بازیکن دوم
     */

    await sendMessage(
        "state_update",
        {
            state: gameState
        }
    );


    /*
     * بررسی پایان
     */

    if (
        gameState.turn >
        gameState.maxTurns
    ) {

        endGame();

        return;

    }


    /*
     * اتفاق بعدی
     */

    if (isHost) {

        setTimeout(
            () => {

                nextEvent();

            },
            1200
        );

    }

}


/* ==================================================
   APPLY EFFECTS
   ================================================== */

function applyEffects(
    country,
    effects
) {

    Object.keys(effects)
        .forEach(key => {

            if (
                typeof country[key] !==
                "number"
            ) {

                return;

            }


            country[key] +=
                effects[key];

        });


    /*
     * محدودیت‌ها
     */

    country.money =
        Math.max(
            0,
            country.money
        );


    country.electricity =
        clamp(
            country.electricity,
            0,
            100
        );


    country.economy =
        clamp(
            country.economy,
            0,
            100
        );


    country.popularity =
        clamp(
            country.popularity,
            0,
            100
        );


    country.security =
        clamp(
            country.security,
            0,
            100
        );


    country.relations =
        clamp(
            country.relations,
            -100,
            100
        );


    country.sanctions =
        clamp(
            country.sanctions,
            0,
            100
        );

}


/* ==================================================
   CLAMP
   ================================================== */

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );

}


/* ==================================================
   RENDER GAME STATE
   ================================================== */

function renderGameState() {

    if (!gameState) {

        return;

    }


    /*
     * هر بازیکن فقط وضعیت خودش را می‌بیند.
     */

    const country =
        playerNumber === 2
            ? gameState.player2
            : gameState.player1;


    document.getElementById(
        "countryName"
    ).textContent =
        country.name;


    document.getElementById(
        "turnNumber"
    ).textContent =
        gameState.turn;


    document.getElementById(
        "moneyStat"
    ).textContent =
        Math.round(
            country.money
        );


    document.getElementById(
        "electricityStat"
    ).textContent =
        Math.round(
            country.electricity
        );


    document.getElementById(
        "economyStat"
    ).textContent =
        Math.round(
            country.economy
        );


    document.getElementById(
        "popularityStat"
    ).textContent =
        Math.round(
            country.popularity
        );


    document.getElementById(
        "securityStat"
    ).textContent =
        Math.round(
            country.security
        );


    document.getElementById(
        "relationsStat"
    ).textContent =
        Math.round(
            country.relations
        );


    updateDirectorMessage();

}


/* ==================================================
   AI MESSAGE
   ================================================== */

function updateDirectorMessage() {

    if (!gameState) {

        return;

    }


    const message =
        AIDirector.explain(
            gameState
        );


    document.getElementById(
        "directorMessage"
    ).textContent =
        message;

}


/* ==================================================
   GAME END
   ================================================== */

async function endGame() {

    gameState.gameOver = true;


    const score1 =
        calculateScore(
            gameState.player1
        );


    const score2 =
        calculateScore(
            gameState.player2
        );


    let winner = "مساوی!";


    if (score1 > score2) {

        winner = "🏆 بازیکن ۱";

    }

    if (score2 > score1) {

        winner = "🏆 بازیکن ۲";

    }


    const result = {

        winner: winner,

        score1: score1,

        score2: score2

    };


    showGameResult(
        result
    );


    await sendMessage(
        "game_over",
        result
    );

}


/* ==================================================
   SCORE
   ================================================== */

function calculateScore(
    country
) {

    return Math.round(

        country.money * 0.25 +

        country.electricity * 1 +

        country.economy * 1.2 +

        country.popularity * 1.2 +

        country.security * .8 +

        country.relations * .5 -

        country.sanctions * .8

    );

}


/* ==================================================
   RESULT
   ================================================== */

function showGameResult(
    result
) {

    showScreen(
        "resultScreen"
    );


    document.getElementById(
        "resultTitle"
    ).textContent =
        result.winner;


    document.getElementById(
        "resultDescription"
    ).textContent =
        "امتیاز کشور اول: " +
        result.score1 +
        " | امتیاز کشور دوم: " +
        result.score2;

}


/* ==================================================
   COPY ROOM CODE
   ================================================== */

async function copyRoomCode() {

    if (!roomCode) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            roomCode
        );

        alert(
            "✅ کد اتاق کپی شد!"
        );

    } catch {

        alert(
            "کد اتاق: " +
            roomCode
        );

    }

}


/* ==================================================
   CLEANUP
   ================================================== */

async function cleanupRoom() {

    clearTimeout(
        joinTimeout
    );


    if (channel) {

        try {

            await channel.untrack();

        } catch {}

        try {

            await db.removeChannel(
                channel
            );

        } catch {}

    }


    channel = null;

    roomCode = "";

    playerId = "";

    playerNumber = 0;

    isHost = false;

    joined = false;

    gameStarted = false;

    currentEvent = null;

    gameState = null;

}


/* ==================================================
   STARTUP
   ================================================== */

window.addEventListener(
    "load",
    () => {

        if (
            window.supabase &&
            db
        ) {

            setConnectionStatus(
                "● سیستم آنلاین آماده است"
            );

        } else {

            setConnectionStatus(
                "● اتصال آنلاین برقرار نشد"
            );

        }

    }
);