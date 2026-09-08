/* ==================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE + MULTIPLAYER + REAL AI
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

let gameHistory = [];

let processingChoice = false;

let generatingEvent = false;


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

        player1: createCountry(
            "جمهوری اول"
        ),

        player2: createCountry(
            "جمهوری دوم"
        ),

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
        Math.random()
            .toString(36)
            .substring(2, 8)
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

        result += chars[
            Math.floor(
                Math.random() *
                chars.length
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
        .querySelectorAll(
            ".screen, .game-screen"
        )
        .forEach(element => {

            element.classList.remove(
                "active"
            );

        });
}


function showScreen(id) {

    hideAllScreens();

    const element =
        document.getElementById(id);

    if (element) {

        element.classList.add(
            "active"
        );

    }
}


/* ==================================================
   CONNECTION STATUS
   ================================================== */

function setConnectionStatus(text) {

    const element =
        document.getElementById(
            "connectionStatus"
        );

    if (element) {

        element.textContent = text;

    }
}


/* ==================================================
   HOME
   ================================================== */

function showCreateRoom() {

    playerId =
        createPlayerId();

    playerNumber = 1;

    isHost = true;

    createRoom();
}


function showJoinRoom() {

    showScreen(
        "joinScreen"
    );

    const input =
        document.getElementById(
            "roomCodeInput"
        );

    if (input) {

        setTimeout(
            () => input.focus(),
            100
        );

    }
}


function backHome() {

    cleanupRoom();

    showScreen(
        "homeScreen"
    );
}


/* ==================================================
   CREATE ROOM
   ================================================== */

async function createRoom() {

    roomCode =
        generateRoomCode();

    gameState =
        createGameState();

    gameHistory = [];

    showScreen(
        "createScreen"
    );

    const roomDisplay =
        document.getElementById(
            "roomCodeDisplay"
        );

    if (roomDisplay) {

        roomDisplay.textContent =
            roomCode;

    }

    const hostStatus =
        document.getElementById(
            "hostStatus"
        );

    if (hostStatus) {

        hostStatus.textContent =
            "در حال اتصال به اتاق...";

    }

    const connected =
        await connectToRoom();

    if (!connected) {

        if (hostStatus) {

            hostStatus.textContent =
                "❌ اتصال به سرور برقرار نشد.";

        }

        return;
    }

    if (hostStatus) {

        hostStatus.textContent =
            "🟢 اتاق ساخته شد؛ کد را به بازیکن دوم بده.";

    }

    const lobbyCode =
        document.getElementById(
            "lobbyRoomCode"
        );

    if (lobbyCode) {

        lobbyCode.textContent =
            roomCode;

    }
}


/* ==================================================
   JOIN ROOM
   ================================================== */

async function joinRoom() {

    const input =
        document.getElementById(
            "roomCodeInput"
        );

    const status =
        document.getElementById(
            "joinStatus"
        );

    if (!input || !status) {

        return;

    }

    const code =
        input.value
            .trim()
            .toUpperCase();

    if (!/^[A-Z0-9]{6}$/.test(code)) {

        status.textContent =
            "❌ کد باید دقیقاً ۶ کاراکتر باشد.";

        return;
    }

    playerId =
        createPlayerId();

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

    showScreen(
        "lobbyScreen"
    );

    const lobbyCode =
        document.getElementById(
            "lobbyRoomCode"
        );

    if (lobbyCode) {

        lobbyCode.textContent =
            roomCode;

    }

    const lobbyStatus =
        document.getElementById(
            "lobbyStatus"
        );

    if (lobbyStatus) {

        lobbyStatus.textContent =
            "🟡 در حال درخواست ورود از میزبان...";

    }

    await sendMessage(
        "room_join_request",
        {
            playerId: playerId
        }
    );

    clearTimeout(
        joinTimeout
    );

    joinTimeout =
        setTimeout(
            () => {

                if (
                    !joined &&
                    !gameStarted
                ) {

                    const element =
                        document.getElementById(
                            "lobbyStatus"
                        );

                    if (element) {

                        element.textContent =
                            "❌ اتاق پیدا نشد یا میزبان آفلاین است.";

                    }

                }

            },
            8000
        );
}


/* ==================================================
   CONNECT TO ROOM
   ================================================== */

async function connectToRoom() {

    if (!roomCode) {

        return false;

    }

    if (channel) {

        try {

            await db.removeChannel(
                channel
            );

        } catch {}

        channel = null;

    }

    channel =
        db.channel(
            "game-room-" +
            roomCode,
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


    /* ==================================================
       PLAYER 2 REQUEST
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "room_join_request"
        },
        async payload => {

            if (!isHost) {

                return;

            }

            const joiningPlayer =
                payload?.payload
                    ?.playerId;

            if (!joiningPlayer) {

                return;

            }

            joined = true;

            updateHostPlayer2(
                true
            );

            await sendMessage(
                "room_join_accepted",
                {
                    playerId:
                        joiningPlayer
                }
            );

            await sendMessage(
                "game_state",
                {
                    state:
                        gameState,

                    history:
                        gameHistory
                }
            );

            await sendMessage(
                "game_start",
                {
                    state:
                        gameState,

                    history:
                        gameHistory
                }
            );

            startGame();

        }
    );


    /* ==================================================
       JOIN ACCEPTED
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "room_join_accepted"
        },
        payload => {

            if (isHost) {

                return;

            }

            const acceptedPlayer =
                payload?.payload
                    ?.playerId;

            if (
                acceptedPlayer ===
                playerId
            ) {

                joined = true;

                clearTimeout(
                    joinTimeout
                );

                const status =
                    document.getElementById(
                        "lobbyStatus"
                    );

                if (status) {

                    status.textContent =
                        "🟢 ورود به اتاق تأیید شد.";

                }

            }

        }
    );


    /* ==================================================
       GAME STATE
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "game_state"
        },
        payload => {

            if (isHost) {

                return;

            }

            if (
                payload?.payload
                    ?.state
            ) {

                gameState =
                    payload.payload.state;

            }

            if (
                Array.isArray(
                    payload?.payload
                        ?.history
                )
            ) {

                gameHistory =
                    payload.payload.history;

            }

            renderGameState();

        }
    );


    /* ==================================================
       GAME START
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "game_start"
        },
        payload => {

            if (isHost) {

                return;

            }

            if (
                payload?.payload
                    ?.state
            ) {

                gameState =
                    payload.payload.state;

            }

            if (
                Array.isArray(
                    payload?.payload
                        ?.history
                )
            ) {

                gameHistory =
                    payload.payload.history;

            }

            joined = true;

            clearTimeout(
                joinTimeout
            );

            startGame();

        }
    );


    /* ==================================================
       EVENT UPDATE
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "event_update"
        },
        payload => {

            if (
                payload?.payload
                    ?.event
            ) {

                currentEvent =
                    payload.payload.event;

                processingChoice =
                    false;

                renderEvent();

                renderGameState();

            }

        }
    );


    /* ==================================================
       PLAYER CHOICE
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "player_choice"
        },
        async payload => {

            if (!isHost) {

                return;

            }

            const choiceId =
                payload?.payload
                    ?.choiceId;

            const senderId =
                payload?.payload
                    ?.playerId;

            if (
                !choiceId ||
                !senderId
            ) {

                return;

            }

            if (
                senderId ===
                playerId
            ) {

                return;

            }

            /*
             * فقط وقتی نوبت بازیکن دوم است
             */

            if (
                gameState.currentPlayer !==
                2
            ) {

                return;

            }

            await applyChoice(
                2,
                choiceId
            );

        }
    );


    /* ==================================================
       STATE UPDATE
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "state_update"
        },
        payload => {

            if (isHost) {

                return;

            }

            if (
                payload?.payload
                    ?.state
            ) {

                gameState =
                    payload.payload.state;

            }

            if (
                Array.isArray(
                    payload?.payload
                        ?.history
                )
            ) {

                gameHistory =
                    payload.payload.history;

            }

            renderGameState();

        }
    );


    /* ==================================================
       GAME OVER
       ================================================== */

    channel.on(
        "broadcast",
        {
            event:
                "game_over"
        },
        payload => {

            if (payload?.payload) {

                showGameResult(
                    payload.payload
                );

            }

        }
    );


    /* ==================================================
       PRESENCE
       ================================================== */

    channel.on(
        "presence",
        {
            event:
                "sync"
        },
        () => {

            const state =
                channel.presenceState();

            const count =
                Object.keys(state)
                    .length;

            if (
                isHost &&
                count >= 2
            ) {

                updateHostPlayer2(
                    true
                );

            }

        }
    );


    channel.on(
        "presence",
        {
            event:
                "join"
        },
        () => {

            if (isHost) {

                updateHostPlayer2(
                    true
                );

            }

        }
    );


    channel.on(
        "presence",
        {
            event:
                "leave"
        },
        () => {

            if (isHost) {

                updateHostPlayer2(
                    false
                );

            }

        }
    );


    /* ==================================================
       SUBSCRIBE
       ================================================== */

    return new Promise(
        resolve => {

            channel.subscribe(
                async (
                    status,
                    error
                ) => {

                    console.log(
                        "ROOM STATUS:",
                        status,
                        error || ""
                    );

                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        setConnectionStatus(
                            "● آنلاین"
                        );

                        try {

                            await channel.track(
                                {

                                    playerId:
                                        playerId,

                                    playerNumber:
                                        playerNumber,

                                    onlineAt:
                                        new Date()
                                            .toISOString()

                                }
                            );

                        } catch (
                            trackError
                        ) {

                            console.error(
                                "TRACK ERROR:",
                                trackError
                            );

                        }

                        resolve(
                            true
                        );

                        return;

                    }

                    if (
                        status ===
                        "CHANNEL_ERROR" ||
                        status ===
                        "TIMED_OUT"
                    ) {

                        console.error(
                            "CHANNEL ERROR:",
                            error
                        );

                        resolve(
                            false
                        );

                    }

                }
            );

        }
    );
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

        await channel.send(
            {

                type:
                    "broadcast",

                event:
                    event,

                payload:
                    payload

            }
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

function updateHostPlayer2(
    connected
) {

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

        const status =
            document.getElementById(
                "hostStatus"
            );

        if (status) {

            status.textContent =
                "🟢 بازیکن دوم وارد شد!";

        }

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

    if (!Array.isArray(gameHistory)) {

        gameHistory = [];

    }

    showScreen(
        "gameScreen"
    );

    renderGameState();

    /*
     * فقط میزبان AI را اجرا می‌کند.
     */

    if (isHost) {

        setTimeout(
            () => {

                nextEvent();

            },
            800
        );

    }
}


/* ==================================================
   NEXT EVENT
   ================================================== */

async function nextEvent() {

    if (!isHost) {

        return;

    }

    if (!gameState) {

        return;

    }

    if (gameState.gameOver) {

        return;

    }

    if (generatingEvent) {

        return;

    }

    generatingEvent = true;

    setDirectorMessage(
        "🧠 کارگردان هوش مصنوعی در حال تحلیل وضعیت بازی است..."
    );

    try {

        /*
         * AI واقعی
         */

        const event =
            await generateAIEvent(
                gameState,
                gameHistory
            );

        if (!event) {

            throw new Error(
                "AI event is empty"
            );

        }

        currentEvent =
            event;

        gameState.currentEventId =
            event.id ||
            (
                "ai_" +
                Date.now()
            );

        /*
         * ذخیره در تاریخچه
         */

        gameHistory.push(
            {

                turn:
                    gameState.turn,

                eventId:
                    gameState.currentEventId,

                title:
                    event.title,

                category:
                    event.category,

                description:
                    event.description,

                createdAt:
                    Date.now()

            }
        );

        /*
         * جلوگیری از رشد بیش از حد تاریخچه
         */

        if (
            gameHistory.length >
            30
        ) {

            gameHistory =
                gameHistory.slice(
                    -30
                );

        }

        renderEvent();

        await sendMessage(
            "event_update",
            {
                event:
                    currentEvent
            }
        );

        await sendMessage(
            "state_update",
            {
                state:
                    gameState,

                history:
                    gameHistory
            }
        );

    } catch (error) {

        console.error(
            "NEXT EVENT ERROR:",
            error
        );

        /*
         * اگر AI کاملاً شکست خورد
         */

        const fallback =
            AIDirector.chooseEvent(
                gameState
            );

        currentEvent =
            fallback;

        gameState.currentEventId =
            fallback.id;

        gameHistory.push(
            {

                turn:
                    gameState.turn,

                eventId:
                    fallback.id,

                title:
                    fallback.title,

                category:
                    fallback.category,

                description:
                    fallback.description,

                createdAt:
                    Date.now(),

                fallback:
                    true

            }
        );

        renderEvent();

        await sendMessage(
            "event_update",
            {
                event:
                    currentEvent
            }
        );

    } finally {

        generatingEvent =
            false;

    }
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

    if (
        !icon ||
        !category ||
        !title ||
        !description ||
        !choices
    ) {

        return;

    }

    icon.textContent =
        currentEvent.icon ||
        "🎬";

    category.textContent =
        currentEvent.category ||
        "اتفاق";

    title.textContent =
        currentEvent.title ||
        "اتفاق جدید";

    description.textContent =
        currentEvent.description ||
        "";

    choices.innerHTML = "";

    if (
        !Array.isArray(
            currentEvent.choices
        )
    ) {

        return;

    }

    const myTurn =
        gameState &&
        gameState.currentPlayer ===
        playerNumber;

    currentEvent.choices.forEach(
        choice => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "choice";

            button.textContent =
                choice.title ||
                "انتخاب";

            /*
             * فقط بازیکنی که نوبتش است
             * می‌تواند انتخاب کند.
             */

            button.disabled =
                !myTurn ||
                processingChoice ||
                generatingEvent;

            if (!myTurn) {

                button.style.opacity =
                    "0.55";

            }

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

    if (!myTurn) {

        setDirectorMessage(
            "⏳ منتظر تصمیم بازیکن " +
            gameState.currentPlayer +
            "..."
        );

    }
}


/* ==================================================
   CHOOSE EVENT
   ================================================== */

async function chooseEvent(
    choiceId
) {

    if (!currentEvent) {

        return;

    }

    if (!gameState) {

        return;

    }

    /*
     * فقط نوبت خود بازیکن
     */

    if (
        gameState.currentPlayer !==
        playerNumber
    ) {

        return;

    }

    if (processingChoice) {

        return;

    }

    processingChoice =
        true;

    renderEvent();

    /*
     * بازیکن دوم انتخاب را
     * برای میزبان می‌فرستد.
     */

    if (!isHost) {

        await sendMessage(
            "player_choice",
            {

                playerId:
                    playerId,

                choiceId:
                    choiceId

            }
        );

        setDirectorMessage(
            "⏳ تصمیم شما ارسال شد..."
        );

        return;
    }

    /*
     * بازیکن اول مستقیماً
     * روی میزبان اجرا می‌کند.
     */

    await applyChoice(
        1,
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

        processingChoice =
            false;

        return;

    }

    if (!gameState) {

        processingChoice =
            false;

        return;

    }

    /*
     * جلوگیری از انتخاب اشتباه
     */

    if (
        gameState.currentPlayer !==
        selectedPlayer
    ) {

        processingChoice =
            false;

        return;

    }

    const choice =
        currentEvent.choices.find(
            item =>
                item.id ===
                choiceId
        );

    if (!choice) {

        processingChoice =
            false;

        return;

    }

    const country =
        selectedPlayer === 1
            ? gameState.player1
            : gameState.player2;

    /*
     * اعمال پیامد
     */

    applyEffects(
        country,
        choice.effect || {}
    );

    /*
     * ثبت تصمیم در تاریخچه
     */

    gameHistory.push(
        {

            turn:
                gameState.turn,

            player:
                selectedPlayer,

            country:
                country.name,

            choiceId:
                choice.id,

            choiceTitle:
                choice.title,

            message:
                choice.message,

            effect:
                choice.effect || {},

            createdAt:
                Date.now()

        }
    );

    if (
        gameHistory.length >
        30
    ) {

        gameHistory =
            gameHistory.slice(
                -30
            );

    }

    /*
     * نمایش پیام
     */

    setDirectorMessage(
        choice.message ||
        "تصمیم اجرا شد."
    );

    /*
     * نوبت بعدی
     */

    gameState.turn += 1;

    /*
     * تغییر بازیکن
     */

    gameState.currentPlayer =
        selectedPlayer === 1
            ? 2
            : 1;

    currentEvent = null;

    gameState.currentEventId =
        null;

    /*
     * پایان
     */

    if (
        gameState.turn >
        gameState.maxTurns
    ) {

        gameState.gameOver =
            true;

        renderGameState();

        await sendMessage(
            "state_update",
            {

                state:
                    gameState,

                history:
                    gameHistory

            }
        );

        processingChoice =
            false;

        await endGame();

        return;

    }

    /*
     * نمایش وضعیت جدید
     */

    renderGameState();

    /*
     * ارسال وضعیت به بازیکن دوم
     */

    await sendMessage(
        "state_update",
        {

            state:
                gameState,

            history:
                gameHistory

        }
    );

    processingChoice =
        false;

    /*
     * کمی مکث برای حس سینمایی
     */

    if (isHost) {

        setTimeout(
            () => {

                nextEvent();

            },
            1400
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

    if (!country || !effects) {

        return;

    }

    Object.keys(effects)
        .forEach(key => {

            if (
                typeof country[key] !==
                "number"
            ) {

                return;

            }

            const value =
                Number(
                    effects[key]
                );

            if (
                !Number.isFinite(
                    value
                )
            ) {

                return;

            }

            country[key] += value;

        });

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

    const country =
        playerNumber === 2
            ? gameState.player2
            : gameState.player1;

    const values = {

        countryName:
            country.name,

        turnNumber:
            gameState.turn,

        moneyStat:
            Math.round(
                country.money
            ),

        electricityStat:
            Math.round(
                country.electricity
            ),

        economyStat:
            Math.round(
                country.economy
            ),

        popularityStat:
            Math.round(
                country.popularity
            ),

        securityStat:
            Math.round(
                country.security
            ),

        relationsStat:
            Math.round(
                country.relations
            )

    };

    Object.keys(values)
        .forEach(id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.textContent =
                    values[id];

            }

        });

    /*
     * اگر اتفاقی در حال نمایش است
     */

    if (currentEvent) {

        renderEvent();

    } else {

        const myTurn =
            gameState.currentPlayer ===
            playerNumber;

        if (myTurn) {

            setDirectorMessage(
                "🎯 نوبت شماست."
            );

        } else {

            setDirectorMessage(
                "⏳ منتظر تصمیم بازیکن " +
                gameState.currentPlayer +
                "..."
            );

        }

    }
}


/* ==================================================
   DIRECTOR MESSAGE
   ================================================== */

function setDirectorMessage(
    text
) {

    const element =
        document.getElementById(
            "directorMessage"
        );

    if (element) {

        element.textContent =
            text;

    }
}


function updateDirectorMessage() {

    if (!gameState) {

        return;

    }

    if (currentEvent) {

        return;

    }

    const message =
        typeof AIDirector !==
        "undefined" &&
        typeof AIDirector.explain ===
        "function"
            ? AIDirector.explain(
                gameState
            )
            : "کارگردان در حال تحلیل وضعیت بازی است...";

    setDirectorMessage(
        message
    );
}


/* ==================================================
   GAME END
   ================================================== */

async function endGame() {

    if (!gameState) {

        return;

    }

    gameState.gameOver =
        true;

    const score1 =
        calculateScore(
            gameState.player1
        );

    const score2 =
        calculateScore(
            gameState.player2
        );

    let winner =
        "مساوی!";

    if (
        score1 >
        score2
    ) {

        winner =
            "🏆 بازیکن ۱";

    } else if (
        score2 >
        score1
    ) {

        winner =
            "🏆 بازیکن ۲";

    }

    const result = {

        winner:
            winner,

        score1:
            score1,

        score2:
            score2

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

        country.security * 0.8 +

        country.relations * 0.5 -

        country.sanctions * 0.8

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

    const title =
        document.getElementById(
            "resultTitle"
        );

    const description =
        document.getElementById(
            "resultDescription"
        );

    if (title) {

        title.textContent =
            result.winner;

    }

    if (description) {

        description.textContent =
            "امتیاز کشور اول: " +
            result.score1 +
            " | امتیاز کشور دوم: " +
            result.score2;

    }
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

    gameHistory = [];

    processingChoice = false;

    generatingEvent = false;
}


/* ==================================================
   LEAVE ROOM
   ================================================== */

function leaveRoom() {

    backHome();

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