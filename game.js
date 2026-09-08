/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v2.0
   ---------------------------------------------------------
   FEATURES

   👥 Multiplayer: up to 8 players
   🏳️ Country selection
   🗺️ Geography
   🎥 First-person game shell
   📄 Decision cards
   🤖 AI Director integration
   🧠 Story memory
   🌍 International relations
   🚫 Sanctions
   ⚔️ Fictional war-state diplomacy
   🌪️ Environmental events
   💰 Economy
   📰 News
   🏛️ Political events
   🔗 Chain reactions

   IMPORTANT:
   - This file contains NO secret keys.
   - Supabase publishable key only.
   - AI requests are handled by ai.js.
========================================================= */


/* =========================================================
   1. SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://kkltydnftjwdgqtufdvl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const MAX_PLAYERS = 8;
const MAX_TURNS = 30;

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   2. GLOBAL GAME STATE
========================================================= */

let channel = null;

let roomCode = "";
let playerId = "";
let playerNumber = 0;

let isHost = false;
let joined = false;
let gameStarted = false;

let localPlayer = null;

let gameState = null;
let gameHistory = [];

let currentEvent = null;

let processingChoice = false;
let generatingEvent = false;

let bootFinished = false;


/* =========================================================
   3. COUNTRY DATABASE
========================================================= */

const COUNTRY_DATABASE = {

    USA: {
        name: "آمریکا",
        flag: "🇺🇸",
        region: "North America",
        geography: [
            "coastal",
            "industrial",
            "mixed"
        ],
        base: {
            money: 100,
            electricity: 90,
            economy: 88,
            popularity: 58,
            security: 82,
            relations: 72,
            sanctions: 0
        }
    },

    IRAN: {
        name: "ایران",
        flag: "🇮🇷",
        region: "Middle East",
        geography: [
            "dry",
            "mountain",
            "mixed"
        ],
        base: {
            money: 75,
            electricity: 72,
            economy: 62,
            popularity: 55,
            security: 72,
            relations: 45,
            sanctions: 25
        }
    },

    CANADA: {
        name: "کانادا",
        flag: "🇨🇦",
        region: "North America",
        geography: [
            "cold",
            "coastal",
            "mixed"
        ],
        base: {
            money: 92,
            electricity: 86,
            economy: 80,
            popularity: 68,
            security: 78,
            relations: 75,
            sanctions: 0
        }
    },

    JAPAN: {
        name: "ژاپن",
        flag: "🇯🇵",
        region: "East Asia",
        geography: [
            "island",
            "coastal",
            "industrial"
        ],
        base: {
            money: 88,
            electricity: 84,
            economy: 84,
            popularity: 63,
            security: 75,
            relations: 70,
            sanctions: 0
        }
    },

    GERMANY: {
        name: "آلمان",
        flag: "🇩🇪",
        region: "Europe",
        geography: [
            "industrial",
            "mixed"
        ],
        base: {
            money: 91,
            electricity: 82,
            economy: 86,
            popularity: 60,
            security: 76,
            relations: 80,
            sanctions: 0
        }
    },

    FRANCE: {
        name: "فرانسه",
        flag: "🇫🇷",
        region: "Europe",
        geography: [
            "coastal",
            "agricultural",
            "industrial"
        ],
        base: {
            money: 89,
            electricity: 87,
            economy: 82,
            popularity: 61,
            security: 78,
            relations: 79,
            sanctions: 0
        }
    },

    BRAZIL: {
        name: "برزیل",
        flag: "🇧🇷",
        region: "South America",
        geography: [
            "agricultural",
            "hot",
            "mixed"
        ],
        base: {
            money: 76,
            electricity: 75,
            economy: 68,
            popularity: 64,
            security: 61,
            relations: 60,
            sanctions: 0
        }
    },

    INDIA: {
        name: "هند",
        flag: "🇮🇳",
        region: "South Asia",
        geography: [
            "hot",
            "agricultural",
            "coastal"
        ],
        base: {
            money: 82,
            electricity: 70,
            economy: 73,
            popularity: 58,
            security: 67,
            relations: 62,
            sanctions: 0
        }
    },

    TURKEY: {
        name: "ترکیه",
        flag: "🇹🇷",
        region: "Eurasia",
        geography: [
            "mountain",
            "coastal",
            "mixed"
        ],
        base: {
            money: 70,
            electricity: 76,
            economy: 64,
            popularity: 57,
            security: 69,
            relations: 57,
            sanctions: 4
        }
    },

    EGYPT: {
        name: "مصر",
        flag: "🇪🇬",
        region: "North Africa",
        geography: [
            "dry",
            "hot",
            "agricultural"
        ],
        base: {
            money: 65,
            electricity: 69,
            economy: 58,
            popularity: 54,
            security: 66,
            relations: 55,
            sanctions: 0
        }
    },

    AUSTRALIA: {
        name: "استرالیا",
        flag: "🇦🇺",
        region: "Oceania",
        geography: [
            "coastal",
            "dry",
            "mixed"
        ],
        base: {
            money: 94,
            electricity: 84,
            economy: 82,
            popularity: 65,
            security: 80,
            relations: 77,
            sanctions: 0
        }
    },

    NORWAY: {
        name: "نروژ",
        flag: "🇳🇴",
        region: "Europe",
        geography: [
            "cold",
            "coastal",
            "mountain"
        ],
        base: {
            money: 98,
            electricity: 94,
            economy: 90,
            popularity: 72,
            security: 81,
            relations: 82,
            sanctions: 0
        }
    },

    ITALY: {
        name: "ایتالیا",
        flag: "🇮🇹",
        region: "Europe",
        geography: [
            "coastal",
            "mountain",
            "agricultural"
        ],
        base: {
            money: 78,
            electricity: 78,
            economy: 73,
            popularity: 62,
            security: 72,
            relations: 74,
            sanctions: 0
        }
    },

    SPAIN: {
        name: "اسپانیا",
        flag: "🇪🇸",
        region: "Europe",
        geography: [
            "hot",
            "coastal",
            "agricultural"
        ],
        base: {
            money: 80,
            electricity: 82,
            economy: 76,
            popularity: 63,
            security: 74,
            relations: 76,
            sanctions: 0
        }
    },

    SOUTH_KOREA: {
        name: "کره جنوبی",
        flag: "🇰🇷",
        region: "East Asia",
        geography: [
            "coastal",
            "industrial",
            "mountain"
        ],
        base: {
            money: 86,
            electricity: 86,
            economy: 87,
            popularity: 59,
            security: 77,
            relations: 70,
            sanctions: 0
        }
    }

};


/* =========================================================
   4. GEOGRAPHY DATABASE
========================================================= */

const GEOGRAPHY_DATABASE = {

    coastal: {
        name: "ساحلی",
        icon: "🌊",
        events: [
            "طوفان دریایی",
            "سیلاب ساحلی",
            "اختلال بندر",
            "بحران حمل‌ونقل دریایی",
            "افزایش فعالیت گردشگری"
        ]
    },

    mountain: {
        name: "کوهستانی",
        icon: "🏔️",
        events: [
            "بارش سنگین",
            "مسدود شدن مسیرهای کوهستانی",
            "زلزله",
            "بحران حمل‌ونقل",
            "گردشگری کوهستانی"
        ]
    },

    dry: {
        name: "خشک",
        icon: "🏜️",
        events: [
            "خشکسالی",
            "کمبود آب",
            "موج گرما",
            "بحران کشاورزی",
            "افت منابع آبی"
        ]
    },

    cold: {
        name: "سرد",
        icon: "❄️",
        events: [
            "موج سرمای شدید",
            "افزایش مصرف انرژی",
            "اختلال حمل‌ونقل",
            "یخبندان",
            "بحران گرمایش"
        ]
    },

    hot: {
        name: "گرم",
        icon: "☀️",
        events: [
            "موج گرما",
            "افزایش مصرف برق",
            "آتش‌سوزی طبیعی",
            "افت تولید کشاورزی",
            "بحران آب"
        ]
    },

    island: {
        name: "جزیره‌ای",
        icon: "🏝️",
        events: [
            "طوفان دریایی",
            "اختلال واردات",
            "مشکل حمل‌ونقل دریایی",
            "افزایش قیمت کالا",
            "رونق گردشگری"
        ]
    },

    industrial: {
        name: "صنعتی",
        icon: "🏭",
        events: [
            "اختلال کارخانه‌ها",
            "آلودگی صنعتی",
            "اعتصاب کارگری",
            "رونق تولید",
            "بحران انرژی"
        ]
    },

    agricultural: {
        name: "کشاورزی",
        icon: "🌾",
        events: [
            "خشکسالی",
            "محصول پربازده",
            "آفت کشاورزی",
            "افزایش قیمت غذا",
            "بحران صادرات"
        ]
    },

    mixed: {
        name: "چندمنطقه‌ای",
        icon: "🗺️",
        events: [
            "بحران منطقه‌ای",
            "تغییر شدید آب‌وهوا",
            "اختلال حمل‌ونقل",
            "بحران انرژی",
            "رونق اقتصادی"
        ]
    }

};


/* =========================================================
   5. PLAYER ID
========================================================= */

function createPlayerId() {

    return (
        "p_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


playerId = createPlayerId();


/* =========================================================
   6. DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = $(id);

    if (target) {
        target.classList.add("active");
    }
}


function toast(message, duration = 3000) {

    const element = $("toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        element.classList.remove("show");
    }, duration);
}


/* =========================================================
   7. BOOT
========================================================= */

function bootGame() {

    const progress = $("bootProgress");
    const text = $("bootText");

    if (!progress || !text) return;

    const steps = [
        [20, "در حال بررسی سیستم..."],
        [45, "در حال آماده‌سازی جهان..."],
        [70, "در حال اتصال به جمهوری..."],
        [90, "در حال آماده‌سازی AI Director..."],
        [100, "جمهوری آماده است."]
    ];

    let index = 0;

    const timer = setInterval(() => {

        if (index >= steps.length) {

            clearInterval(timer);

            setTimeout(() => {

                bootFinished = true;
                showScreen("menuScreen");

            }, 350);

            return;
        }

        progress.style.width = steps[index][0] + "%";
        text.textContent = steps[index][1];

        index++;

    }, 450);
}


/* =========================================================
   8. COUNTRY HELPERS
========================================================= */

function getCountry(code) {

    return COUNTRY_DATABASE[code] || {
        name: "کشور ناشناخته",
        flag: "🏳️",
        region: "Unknown",
        geography: ["mixed"],
        base: {
            money: 70,
            electricity: 70,
            economy: 70,
            popularity: 60,
            security: 60,
            relations: 50,
            sanctions: 0
        }
    };
}


function getGeography(code) {

    return GEOGRAPHY_DATABASE[code] ||
        GEOGRAPHY_DATABASE.mixed;
}


function createCountryState({
    playerId,
    playerNumber,
    leaderName,
    countryCode,
    geography
}) {

    const country = getCountry(countryCode);

    const base = country.base;

    return {

        playerId,
        playerNumber,

        leaderName,
        countryCode,

        countryName: country.name,
        flag: country.flag,

        region: country.region,

        geography,

        geographyName:
            getGeography(geography).name,

        money: base.money,
        electricity: base.electricity,
        economy: base.economy,
        popularity: base.popularity,
        security: base.security,
        relations: base.relations,
        sanctions: base.sanctions,

        activeCrises: [],

        diplomacy: {},

        status: "stable",

        alive: true

    };
}


/* =========================================================
   9. GAME STATE
========================================================= */

function createGameState() {

    return {

        version: 2,

        roomCode,

        turn: 1,

        maxTurns: MAX_TURNS,

        started: false,

        gameOver: false,

        currentPlayerIndex: 0,

        players: [],

        countries: {},

        currentEvent: null,

        history: [],

        news: [],

        activeCrises: [],

        relations: {},

        world: {

            globalTension: 15,

            globalEconomy: 65,

            climatePressure: 25,

            mediaPressure: 20,

            diplomaticPressure: 20

        },

        createdAt:
            new Date().toISOString()

    };
}


/* =========================================================
   10. RELATION KEY
========================================================= */

function relationKey(a, b) {

    if (!a || !b) return "";

    return [a, b]
        .sort()
        .join("::");
}


/* =========================================================
   11. INITIAL RELATIONS
========================================================= */

function initializeRelations(state) {

    if (!state || !state.players) return;

    state.relations = state.relations || {};

    for (let i = 0; i < state.players.length; i++) {

        for (let j = i + 1; j < state.players.length; j++) {

            const a =
                state.players[i].playerId;

            const b =
                state.players[j].playerId;

            const key =
                relationKey(a, b);

            if (!state.relations[key]) {

                state.relations[key] = {

                    playerA: a,
                    playerB: b,

                    value: 50,

                    trade: false,

                    alliance: false,

                    sanctions: false,

                    conflict: false,

                    diplomaticStatus: "normal",

                    history: []

                };

            }

        }

    }

}


/* =========================================================
   12. LOCAL PLAYER
========================================================= */

function getLocalPlayer() {

    if (!gameState || !gameState.players) {
        return null;
    }

    return gameState.players.find(
        player =>
            player.playerId === playerId
    ) || null;
}


/* =========================================================
   13. CURRENT PLAYER
========================================================= */

function getCurrentPlayer() {

    if (!gameState) return null;

    return gameState.players[
        gameState.currentPlayerIndex
    ] || null;
}


/* =========================================================
   14. SETUP DATA
========================================================= */

function readSetupForm() {

    const leaderName =
        $("leaderName")?.value.trim();

    const countryCode =
        $("countrySelect")?.value;

    const geography =
        $("geographySelect")?.value;

    if (!leaderName) {

        toast("نام رئیس را وارد کن.");

        return null;
    }

    if (!countryCode) {

        toast("کشور را انتخاب کن.");

        return null;
    }

    if (!geography) {

        toast("جغرافیا را انتخاب کن.");

        return null;
    }

    return {
        leaderName,
        countryCode,
        geography
    };
}


/* =========================================================
   15. CREATE ROOM
========================================================= */

async function createRoom() {

    const data = readSetupForm();

    if (!data) return;

    isHost = true;

    joined = false;
    gameStarted = false;

    roomCode =
        generateRoomCode();

    gameState =
        createGameState();

    localPlayer =
        createCountryState({
            playerId,
            playerNumber: 1,
            leaderName: data.leaderName,
            countryCode: data.countryCode,
            geography: data.geography
        });

    gameState.players.push(
        localPlayer
    );

    gameState.countries[
        playerId
    ] = localPlayer;

    initializeRelations(gameState);

    try {

        await connectToRoom();

        joined = true;

        renderLobby();

        showScreen("lobbyScreen");

        toast(
            "اتاق ساخته شد. کد را برای بازیکنان دیگر بفرست."
        );

    } catch (error) {

        console.error(error);

        toast(
            "ساخت اتاق ناموفق بود."
        );

    }

}


/* =========================================================
   16. GENERATE ROOM CODE
========================================================= */

function generateRoomCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (let i = 0; i < 6; i++) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }

    return result;
}


/* =========================================================
   17. JOIN ROOM
========================================================= */

async function joinRoom() {

    const input =
        $("roomCodeInput");

    const code =
        input?.value
            .trim()
            .toUpperCase();

    if (!code || code.length < 4) {

        toast("کد اتاق معتبر نیست.");

        return;
    }

    roomCode = code;

    isHost = false;

    showScreen("setupScreen");

    toast(
        "مشخصات رئیس و کشور خودت را انتخاب کن."
    );

    $("confirmSetupBtn").onclick =
        async function () {

            const data =
                readSetupForm();

            if (!data) return;

            await joinExistingRoom(data);

        };

}


/* =========================================================
   18. JOIN EXISTING ROOM
========================================================= */

async function joinExistingRoom(data) {

    localPlayer =
        createCountryState({
            playerId,
            playerNumber: 0,
            leaderName: data.leaderName,
            countryCode: data.countryCode,
            geography: data.geography
        });

    try {

        await connectToRoom();

        joined = true;

        await sendBroadcast(
            "room_join_request",
            {
                playerId,
                player: localPlayer
            }
        );

        showScreen("lobbyScreen");

        $("lobbyStatus").textContent =
            "درخواست ورود ارسال شد؛ منتظر رئیس اتاق...";

    } catch (error) {

        console.error(error);

        toast(
            "اتصال به اتاق ناموفق بود."
        );

    }

}


/* =========================================================
   19. CONNECT TO SUPABASE ROOM
========================================================= */

async function connectToRoom() {

    if (!roomCode) {
        throw new Error(
            "ROOM_CODE_MISSING"
        );
    }

    if (channel) {

        try {
            await supabaseClient
                .removeChannel(channel);
        } catch (_) {}

        channel = null;
    }

    const topic =
        "political-game-" +
        roomCode.toUpperCase();

    channel =
        supabaseClient.channel(topic, {

            config: {

                presence: {
                    key: playerId
                }

            }

        });


    /* -----------------------------------------------------
       BROADCAST EVENTS
    ----------------------------------------------------- */

    channel.on(
        "broadcast",
        {
            event: "room_join_request"
        },
        payload => {

            if (!isHost) return;

            handleJoinRequest(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "room_join_response"
        },
        payload => {

            if (isHost) return;

            handleJoinResponse(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_state"
        },
        payload => {

            handleGameState(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_start"
        },
        payload => {

            handleGameStart(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "event_update"
        },
        payload => {

            handleEventUpdate(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "player_choice"
        },
        payload => {

            if (!isHost) return;

            handlePlayerChoice(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "news_update"
        },
        payload => {

            handleNewsUpdate(
                payload?.payload
            );

        }
    );


    channel.on(
        "broadcast",
        {
            event: "game_over"
        },
        payload => {

            handleGameOver(
                payload?.payload
            );

        }
    );


    /* -----------------------------------------------------
       PRESENCE
    ----------------------------------------------------- */

    channel.on(
        "presence",
        {
            event: "sync"
        },
        () => {

            renderPresence();

        }
    );


    channel.on(
        "presence",
        {
            event: "join"
        },
        () => {

            renderPresence();

        }
    );


    channel.on(
        "presence",
        {
            event: "leave"
        },
        () => {

            renderPresence();

        }
    );


    /* -----------------------------------------------------
       SUBSCRIBE
    ----------------------------------------------------- */

    await new Promise(
        (resolve, reject) => {

            const timeout =
                setTimeout(() => {

                    reject(
                        new Error(
                            "SUPABASE_TIMEOUT"
                        )
                    );

                }, 12000);


            channel.subscribe(
                async status => {

                    console.log(
                        "Supabase status:",
                        status
                    );

                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        clearTimeout(timeout);

                        await channel.track({

                            playerId,

                            leaderName:
                                localPlayer?.leaderName ||
                                "",

                            countryCode:
                                localPlayer?.countryCode ||
                                "",

                            countryName:
                                localPlayer?.countryName ||
                                "",

                            flag:
                                localPlayer?.flag ||
                                "",

                            playerNumber:
                                localPlayer?.playerNumber ||
                                0,

                            isHost,

                            onlineAt:
                                new Date()
                                    .toISOString()

                        });

                        resolve();

                    }


                    if (
                        status ===
                        "CHANNEL_ERROR"
                    ) {

                        clearTimeout(timeout);

                        reject(
                            new Error(
                                "SUPABASE_CHANNEL_ERROR"
                            )
                        );

                    }


                    if (
                        status ===
                        "TIMED_OUT"
                    ) {

                        clearTimeout(timeout);

                        reject(
                            new Error(
                                "SUPABASE_TIMED_OUT"
                            )
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   20. SEND BROADCAST
========================================================= */

async function sendBroadcast(
    event,
    payload
) {

    if (!channel) {

        console.warn(
            "Broadcast skipped: no channel",
            event
        );

        return false;
    }

    try {

        const result =
            await channel.send({

                type: "broadcast",

                event,

                payload

            });


        if (result !== "ok") {

            console.warn(
                "Broadcast result:",
                result
            );

        }

        return result === "ok";

    } catch (error) {

        console.error(
            "Broadcast failed:",
            event,
            error
        );

        return false;

    }

}


/* =========================================================
   21. HOST RECEIVES JOIN REQUEST
========================================================= */

async function handleJoinRequest(payload) {

    if (!isHost || !gameState) {
        return;
    }

    if (!payload?.player) {
        return;
    }

    if (gameStarted) {

        await sendBroadcast(
            "room_join_response",
            {
                accepted: false,
                targetPlayerId:
                    payload.playerId,
                reason:
                    "بازی شروع شده است."
            }
        );

        return;
    }


    if (
        gameState.players.length >=
        MAX_PLAYERS
    ) {

        await sendBroadcast(
            "room_join_response",
            {
                accepted: false,
                targetPlayerId:
                    payload.playerId,
                reason:
                    "اتاق پر است."
            }
        );

        return;
    }


    const exists =
        gameState.players.some(
            p =>
                p.playerId ===
                payload.playerId
        );


    if (exists) {
        return;
    }


    const playerNumber =
        gameState.players.length + 1;


    const incoming =
        payload.player;


    incoming.playerNumber =
        playerNumber;


    gameState.players.push(
        incoming
    );


    gameState.countries[
        incoming.playerId
    ] = incoming;


    initializeRelations(
        gameState
    );


    await sendBroadcast(
        "room_join_response",
        {
            accepted: true,

            targetPlayerId:
                incoming.playerId,

            playerNumber,

            state:
                gameState
        }
    );


    await broadcastFullState();

    renderLobby();

}


/* =========================================================
   22. PLAYER RECEIVES JOIN RESPONSE
========================================================= */

function handleJoinResponse(payload) {

    if (
        !payload ||
        payload.targetPlayerId !==
        playerId
    ) {
        return;
    }


    if (!payload.accepted) {

        toast(
            payload.reason ||
            "ورود به اتاق رد شد."
        );

        showScreen("joinScreen");

        return;
    }


    playerNumber =
        payload.playerNumber;


    gameState =
        sanitizeIncomingState(
            payload.state
        );


    if (gameState) {

        localPlayer =
            gameState.players.find(
                p =>
                    p.playerId ===
                    playerId
            ) || localPlayer;

        renderLobby();

        toast(
            "با موفقیت وارد اتاق شدی."
        );

    }

}


/* =========================================================
   23. FULL STATE
========================================================= */

async function broadcastFullState() {

    if (!isHost || !gameState) {
        return;
    }

    await sendBroadcast(
        "game_state",
        {
            state:
                gameState
        }
    );

}


/* =========================================================
   24. RECEIVE GAME STATE
========================================================= */

function handleGameState(payload) {

    if (!payload?.state) return;

    gameState =
        sanitizeIncomingState(
            payload.state
        );


    localPlayer =
        getLocalPlayer();


    renderLobby();


    if (gameState.started) {

        gameStarted = true;

        renderGame();

    }

}


/* =========================================================
   25. START GAME
========================================================= */

async function startGame() {

    if (!isHost) {

        toast(
            "فقط رئیس اتاق می‌تواند بازی را شروع کند."
        );

        return;
    }


    if (!gameState) return;


    if (
        gameState.players.length <
        1
    ) {

        toast(
            "حداقل یک بازیکن لازم است."
        );

        return;
    }


    gameState.started = true;
    gameStarted = true;

    gameState.currentPlayerIndex = 0;


    initializeRelations(
        gameState
    );


    await sendBroadcast(
        "game_start",
        {
            state:
                gameState
        }
    );


    await broadcastFullState();


    renderGame();


    setTimeout(() => {

        nextAIEvent();

    }, 800);

}


/* =========================================================
   26. GAME START RECEIVED
========================================================= */

function handleGameStart(payload) {

    if (!payload?.state) return;


    gameState =
        sanitizeIncomingState(
            payload.state
        );


    gameStarted = true;

    localPlayer =
        getLocalPlayer();


    renderGame();

}


/* =========================================================
   27. RENDER GAME
========================================================= */

function renderGame() {

    if (!gameState) return;


    showScreen("gameScreen");


    localPlayer =
        getLocalPlayer();


    if (!localPlayer) return;


    $("hudFlag").textContent =
        localPlayer.flag || "🏳️";


    $("hudCountryName").textContent =
        localPlayer.countryName ||
        "کشور";


    $("hudLeaderName").textContent =
        localPlayer.leaderName ||
        "رئیس";


    $("countryWallName").textContent =
        (
            localPlayer.countryName ||
            "جمهوری"
        ).toUpperCase();


    $("turnNumber").textContent =
        gameState.turn || 1;


    renderCountryStats();

    renderRoomPlayers();

    renderCurrentEvent();

    renderNews();

}


/* =========================================================
   28. RENDER STATS
========================================================= */

function renderCountryStats() {

    if (!localPlayer) return;


    $("moneyStat").textContent =
        Math.round(
            localPlayer.money
        );


    $("electricityStat").textContent =
        Math.round(
            localPlayer.electricity
        );


    $("economyStat").textContent =
        Math.round(
            localPlayer.economy
        );


    $("popularityStat").textContent =
        Math.round(
            localPlayer.popularity
        );


    $("securityStat").textContent =
        Math.round(
            localPlayer.security
        );


    $("relationsStat").textContent =
        Math.round(
            localPlayer.relations
        );

}


/* =========================================================
   29. RENDER ROOM PLAYERS
========================================================= */

function renderRoomPlayers() {

    const container =
        $("roomPlayers");

    if (!container) return;


    container.innerHTML = "";


    if (
        !gameState ||
        !gameState.players
    ) {
        return;
    }


    gameState.players.forEach(
        player => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "room-player";


            const relation =
                player.playerId ===
                playerId
                    ? "شما"
                    : "رئیس کشور";


            item.innerHTML = `
                <strong>
                    ${escapeHTML(
                        player.flag || "🏳️"
                    )}
                    ${escapeHTML(
                        player.countryName ||
                        "کشور"
                    )}
                </strong>

                <small>
                    ${escapeHTML(
                        relation
                    )}
                </small>
            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   30. RENDER LOBBY
========================================================= */

function renderLobby() {

    showScreen("lobbyScreen");


    if ($("roomCodeDisplay")) {

        $("roomCodeDisplay")
            .textContent =
            roomCode || "------";

    }


    const players =
        gameState?.players || [];


    if ($("playerCount")) {

        $("playerCount")
            .textContent =
            `${players.length} / ${MAX_PLAYERS}`;

    }


    const list =
        $("playersList");


    if (!list) return;


    list.innerHTML = "";


    players.forEach(
        player => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "player-item";


            item.innerHTML = `

                <div class="player-number">
                    رئیس شماره
                    ${player.playerNumber}
                </div>

                <strong>
                    ${escapeHTML(
                        player.flag || "🏳️"
                    )}
                    ${escapeHTML(
                        player.countryName ||
                        "کشور"
                    )}
                </strong>

                <small>
                    رئیس:
                    ${escapeHTML(
                        player.leaderName ||
                        "ناشناس"
                    )}
                </small>

            `;


            list.appendChild(
                item
            );

        }
    );


    if ($("startGameBtn")) {

        $("startGameBtn")
            .style.display =
            isHost
                ? "block"
                : "none";

    }


    if ($("lobbyStatus")) {

        $("lobbyStatus")
            .textContent =
            isHost
                ? "بازیکنان می‌توانند وارد شوند. وقتی آماده بودی بازی را شروع کن."
                : "منتظر شروع بازی توسط رئیس اتاق...";

    }

}


/* =========================================================
   31. PRESENCE
========================================================= */

function renderPresence() {

    if (!channel) return;

    try {

        const state =
            channel.presenceState();

        console.log(
            "Presence:",
            state
        );

    } catch (error) {

        console.warn(
            "Presence render error:",
            error
        );

    }

}


/* =========================================================
   32. NEXT AI EVENT
========================================================= */

async function nextAIEvent() {

    if (!isHost) return;

    if (!gameState) return;

    if (generatingEvent) return;

    if (gameState.gameOver) return;


    generatingEvent = true;


    showAIThinking(
        true
    );


    try {

        const stateForAI =
            buildAIState();


        const historyForAI =
            gameHistory.slice(
                -40
            );


        let event = null;


        if (
            typeof window.generateAIEvent ===
            "function"
        ) {

            event =
                await window.generateAIEvent(
                    stateForAI,
                    historyForAI
                );

        }


        if (!isValidAIEvent(event)) {

            event =
                createEmergencyEvent();

        }


        currentEvent =
            event;


        gameState.currentEvent =
            event;


        gameHistory.push({

            type: "event",

            turn:
                gameState.turn,

            playerId:
                getCurrentPlayer()?.playerId ||
                null,

            event

        });


        gameState.history =
            gameHistory.slice(
                -60
            );


        await sendBroadcast(
            "event_update",
            {
                event,
                turn:
                    gameState.turn,
                state:
                    gameState
            }
        );


        renderGame();


    } catch (error) {

        console.error(
            "AI EVENT ERROR:",
            error
        );


        currentEvent =
            createEmergencyEvent();


        gameState.currentEvent =
            currentEvent;


        renderGame();

    } finally {

        generatingEvent = false;

        showAIThinking(
            false
        );

    }

}


/* =========================================================
   33. BUILD AI STATE
========================================================= */

function buildAIState() {

    if (!gameState) return null;


    return {

        version:
            gameState.version,

        turn:
            gameState.turn,

        maxTurns:
            gameState.maxTurns,

        currentPlayerIndex:
            gameState.currentPlayerIndex,

        currentPlayer:
            getCurrentPlayer(),

        players:
            gameState.players,

        countries:
            gameState.countries,

        relations:
            gameState.relations,

        world:
            gameState.world,

        activeCrises:
            gameState.activeCrises,

        recentNews:
            gameState.news.slice(-10),

        history:
            gameState.history.slice(-40)

    };

}


/* =========================================================
   34. VALIDATE AI EVENT
========================================================= */

function isValidAIEvent(event) {

    if (!event) return false;


    if (
        typeof event.title !==
        "string"
    ) {
        return false;
    }


    if (
        typeof event.description !==
        "string"
    ) {
        return false;
    }


    if (
        !Array.isArray(
            event.choices
        )
    ) {
        return false;
    }


    if (
        event.choices.length !== 3
    ) {
        return false;
    }


    return event.choices.every(
        choice => {

            return (
                choice &&
                typeof choice.id ===
                    "string" &&
                typeof choice.title ===
                    "string"
            );

        }
    );

}


/* =========================================================
   35. EMERGENCY EVENT
========================================================= */

function createEmergencyEvent() {

    const player =
        getCurrentPlayer();


    const geo =
        getGeography(
            player?.geography
        );


    const possible =
        geo?.events || [
            "یک بحران عجیب"
        ];


    const situation =
        possible[
            Math.floor(
                Math.random() *
                possible.length
            )
        ];


    return {

        id:
            "emergency_" +
            Date.now(),

        title:
            situation,

        description:
            `گزارش‌های اولیه از ${situation} در ${player?.countryName || "کشور شما"} منتشر شده است. دولت باید تصمیم بگیرد چگونه واکنش نشان دهد.`,

        type:
            "environmental",

        targetPlayerId:
            player?.playerId || null,

        choices: [

            {
                id: "respond",
                title: "واکنش فوری",
                description:
                    "دولت منابع بیشتری برای کنترل بحران اختصاص دهد.",
                effects: {
                    money: -10,
                    popularity: 3,
                    economy: 1
                }
            },

            {
                id: "wait",
                title: "صبر و بررسی",
                description:
                    "فعلاً منتظر اطلاعات بیشتر بمان.",
                effects: {
                    money: 0,
                    popularity: -3,
                    security: -2
                }
            },

            {
                id: "media",
                title: "کنترل رسانه‌ای",
                description:
                    "تمرکز دولت را روی مدیریت افکار عمومی بگذار.",
                effects: {
                    money: -3,
                    popularity: 5,
                    relations: -1
                }
            }

        ]

    };

}


/* =========================================================
   36. RENDER EVENT
========================================================= */

function renderCurrentEvent() {

    const cards =
        $("decisionCards");

    if (!cards) return;


    cards.innerHTML = "";


    const event =
        currentEvent ||
        gameState?.currentEvent;


    if (!event) {

        cards.innerHTML = `

            <div class="paper-card loading-card">

                <div class="paper-loader"></div>

                <span>
                    منتظر اتفاق بعدی...
                </span>

            </div>

        `;

        return;
    }


    const current =
        getCurrentPlayer();


    const isMyTurn =
        current &&
        current.playerId ===
        playerId;


    event.choices.forEach(
        (choice, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "paper-card";


            if (!isMyTurn) {

                card.classList.add(
                    "disabled"
                );

            }


            const title =
                escapeHTML(
                    choice.title ||
                    `تصمیم ${index + 1}`
                );


            const description =
                escapeHTML(
                    choice.description ||
                    "تصمیم دولت"
                );


            card.innerHTML = `

                <div class="paper-number">
                    پرونده ${index + 1}
                </div>

                <h3>
                    ${title}
                </h3>

                <p>
                    ${description}
                </p>

                <div class="paper-choice">
                    ${isMyTurn
                        ? "انتخاب"
                        : "منتظر نوبت"}
                </div>

            `;


            if (isMyTurn) {

                card.addEventListener(
                    "click",
                    () => {

                        chooseDecision(
                            choice.id
                        );

                    }
                );

            }


            cards.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   37. CHOOSE DECISION
========================================================= */

async function chooseDecision(
    choiceId
) {

    if (processingChoice) return;


    if (!gameState) return;


    const current =
        getCurrentPlayer();


    if (!current) return;


    if (
        current.playerId !==
        playerId
    ) {

        toast(
            `الان نوبت ${current.countryName} است.`
        );

        return;

    }


    const event =
        currentEvent ||
        gameState.currentEvent;


    if (!event) return;


    const choice =
        event.choices.find(
            c =>
                c.id ===
                choiceId
        );


    if (!choice) {

        toast(
            "این تصمیم دیگر معتبر نیست."
        );

        return;

    }


    processingChoice = true;


    disableDecisionCards();


    if (isHost) {

        await applyChoice(
            playerId,
            choiceId
        );

    } else {

        await sendBroadcast(
            "player_choice",
            {
                playerId,

                choiceId,

                turn:
                    gameState.turn,

                eventId:
                    event.id
            }
        );

        toast(
            "تصمیم ارسال شد..."
        );

    }

}


/* =========================================================
   38. DISABLE CARDS
========================================================= */

function disableDecisionCards() {

    document
        .querySelectorAll(
            ".paper-card"
        )
        .forEach(
            card => {

                card.classList.add(
                    "disabled"
                );

            }
        );

}


/* =========================================================
   39. HOST RECEIVES CHOICE
========================================================= */

async function handlePlayerChoice(
    payload
) {

    if (!isHost) return;


    if (!payload) return;


    if (
        payload.turn !==
        gameState.turn
    ) {

        return;

    }


    const current =
        getCurrentPlayer();


    if (!current) return;


    if (
        current.playerId !==
        payload.playerId
    ) {

        return;

    }


    await applyChoice(
        payload.playerId,
        payload.choiceId
    );

}


/* =========================================================
   40. APPLY CHOICE
========================================================= */

async function applyChoice(
    selectedPlayerId,
    choiceId
) {

    if (!isHost) return;


    const event =
        currentEvent ||
        gameState.currentEvent;


    if (!event) return;


    const player =
        gameState.players.find(
            p =>
                p.playerId ===
                selectedPlayerId
        );


    if (!player) return;


    const choice =
        event.choices.find(
            c =>
                c.id ===
                choiceId
        );


    if (!choice) return;


    /* -----------------------------------------------------
       EFFECTS
    ----------------------------------------------------- */

    const effects =
        normalizeEffects(
            choice.effects
        );


    applyEffects(
        player,
        effects
    );


    /* -----------------------------------------------------
       SPECIAL DIPLOMATIC EFFECTS
    ----------------------------------------------------- */

    handleDiplomaticAction(
        player,
        choice
    );


    /* -----------------------------------------------------
       ACTIVE CRISES
    ----------------------------------------------------- */

    if (
        event.type &&
        event.type !==
            "normal"
    ) {

        const crisis = {

            id:
                event.id,

            title:
                event.title,

            playerId:
                player.playerId,

            turn:
                gameState.turn,

            type:
                event.type

        };


        gameState.activeCrises.push(
            crisis
        );


        player.activeCrises =
            player.activeCrises || [];


        player.activeCrises.push(
            crisis
        );

    }


    /* -----------------------------------------------------
       HISTORY
    ----------------------------------------------------- */

    const historyEntry = {

        type:
            "decision",

        turn:
            gameState.turn,

        playerId:
            player.playerId,

        country:
            player.countryName,

        eventTitle:
            event.title,

        eventId:
            event.id,

        choiceId,

        choiceTitle:
            choice.title,

        effects,

        timestamp:
            new Date()
                .toISOString()

    };


    gameHistory.push(
        historyEntry
    );


    gameState.history =
        gameHistory.slice(
            -60
        );


    /* -----------------------------------------------------
       NEWS
    ----------------------------------------------------- */

    const news =
        createDecisionNews(
            player,
            event,
            choice
        );


    addNews(
        news
    );


    /* -----------------------------------------------------
       TURN
    ----------------------------------------------------- */

    gameState.currentPlayerIndex =
        (
            gameState.currentPlayerIndex +
            1
        ) %
        gameState.players.length;


    gameState.turn++;


    currentEvent = null;

    gameState.currentEvent = null;


    /* -----------------------------------------------------
       END CHECK
    ----------------------------------------------------- */

    if (
        gameState.turn >
        gameState.maxTurns
    ) {

        await finishGame();

        return;

    }


    /* -----------------------------------------------------
       BROADCAST
    ----------------------------------------------------- */

    await broadcastFullState();


    await sendBroadcast(
        "news_update",
        {
            news
        }
    );


    processingChoice = false;


    renderGame();


    /* -----------------------------------------------------
       NEXT EVENT
    ----------------------------------------------------- */

    setTimeout(
        () => {

            nextAIEvent();

        },
        900
    );

}


/* =========================================================
   41. EFFECT NORMALIZATION
========================================================= */

function normalizeEffects(
    effects
) {

    const allowed = [

        "money",
        "electricity",
        "economy",
        "popularity",
        "security",
        "relations",
        "sanctions"

    ];


    const result = {};


    if (!effects || typeof effects !== "object") {
        return result;
    }


    allowed.forEach(
        key => {

            const value =
                Number(
                    effects[key]
                );


            if (
                Number.isFinite(value)
            ) {

                result[key] =
                    clamp(
                        value,
                        -100,
                        100
                    );

            }

        }
    );


    return result;

}


/* =========================================================
   42. APPLY EFFECTS
========================================================= */

function applyEffects(
    player,
    effects
) {

    Object.keys(
        effects
    ).forEach(
        key => {

            if (
                typeof player[key] !==
                "number"
            ) {
                return;
            }


            player[key] =
                clamp(
                    player[key] +
                    effects[key],
                    0,
                    100
                );

        }
    );


    if (
        player.money < 0
    ) {
        player.money = 0;
    }


    updatePlayerStatus(
        player
    );

}


/* =========================================================
   43. PLAYER STATUS
========================================================= */

function updatePlayerStatus(
    player
) {

    if (
        player.economy < 20 ||
        player.money < 15
    ) {

        player.status =
            "economic_crisis";

    } else if (
        player.popularity < 20
    ) {

        player.status =
            "political_crisis";

    } else if (
        player.security < 20
    ) {

        player.status =
            "unstable";

    } else {

        player.status =
            "stable";

    }

}


/* =========================================================
   44. DIPLOMATIC ACTIONS
========================================================= */

function handleDiplomaticAction(
    actor,
    choice
) {

    if (!choice) return;


    const text =
        (
            (
                choice.title ||
                ""
            ) +
            " " +
            (
                choice.description ||
                ""
            )
        ).toLowerCase();


    const diplomacyWords = {

        sanction: [
            "تحریم",
            "sanction"
        ],

        war: [
            "اعلام جنگ",
            "جنگ",
            "war"
        ],

        peace: [
            "صلح",
            "مذاکره",
            "peace",
            "negotiate"
        ],

        trade: [
            "تجارت",
            "trade"
        ]

    };


    if (
        containsAny(
            text,
            diplomacyWords.sanction
        )
    ) {

        applySanctionAction(
            actor
        );

    }


    if (
        containsAny(
            text,
            diplomacyWords.war
        )
    ) {

        applyConflictAction(
            actor
        );

    }


    if (
        containsAny(
            text,
            diplomacyWords.peace
        )
    ) {

        improveDiplomacy(
            actor
        );

    }


    if (
        containsAny(
            text,
            diplomacyWords.trade
        )
    ) {

        improveTrade(
            actor
        );

    }

}


/* =========================================================
   45. SANCTIONS
========================================================= */

function applySanctionAction(
    actor
) {

    const target =
        findDiplomaticTarget(
            actor
        );


    if (!target) return;


    const key =
        relationKey(
            actor.playerId,
            target.playerId
        );


    const relation =
        gameState.relations[key];


    if (!relation) return;


    relation.sanctions = true;

    relation.value =
        clamp(
            relation.value - 20,
            0,
            100
        );


    relation.diplomaticStatus =
        "sanctioned";


    target.sanctions =
        clamp(
            target.sanctions + 10,
            0,
            100
        );


    target.economy =
        clamp(
            target.economy - 5,
            0,
            100
        );


    addNews(
        `${actor.countryName} روابط اقتصادی خود با ${target.countryName} را محدود کرد.`
    );

}


/* =========================================================
   46. FICTIONAL CONFLICT STATE
========================================================= */

function applyConflictAction(
    actor
) {

    const target =
        findDiplomaticTarget(
            actor
        );


    if (!target) return;


    const key =
        relationKey(
            actor.playerId,
            target.playerId
        );


    const relation =
        gameState.relations[key];


    if (!relation) return;


    relation.conflict =
        true;

    relation.alliance =
        false;

    relation.trade =
        false;

    relation.value =
        clamp(
            relation.value - 40,
            0,
            100
        );


    relation.diplomaticStatus =
        "conflict";


    gameState.world.globalTension =
        clamp(
            gameState.world.globalTension + 12,
            0,
            100
        );


    actor.relations =
        clamp(
            actor.relations - 6,
            0,
            100
        );


    target.relations =
        clamp(
            target.relations - 8,
            0,
            100
        );


    addNews(
        `بحران دیپلماتیک میان ${actor.countryName} و ${target.countryName} وارد مرحله‌ای بسیار جدی شد.`
    );

}


/* =========================================================
   47. PEACE
========================================================= */

function improveDiplomacy(
    actor
) {

    const target =
        findDiplomaticTarget(
            actor
        );


    if (!target) return;


    const key =
        relationKey(
            actor.playerId,
            target.playerId
        );


    const relation =
        gameState.relations[key];


    if (!relation) return;


    relation.value =
        clamp(
            relation.value + 15,
            0,
            100
        );


    relation.conflict =
        false;

    relation.sanctions =
        false;


    relation.diplomaticStatus =
        "improving";


    actor.relations =
        clamp(
            actor.relations + 3,
            0,
            100
        );


    target.relations =
        clamp(
            target.relations + 3,
            0,
            100
        );

}


/* =========================================================
   48. TRADE
========================================================= */

function improveTrade(
    actor
) {

    const target =
        findDiplomaticTarget(
            actor
        );


    if (!target) return;


    const key =
        relationKey(
            actor.playerId,
            target.playerId
        );


    const relation =
        gameState.relations[key];


    if (!relation) return;


    relation.trade = true;

    relation.value =
        clamp(
            relation.value + 8,
            0,
            100
        );


    actor.economy =
        clamp(
            actor.economy + 2,
            0,
            100
        );


    target.economy =
        clamp(
            target.economy + 2,
            0,
            100
        );

}


/* =========================================================
   49. FIND DIPLOMATIC TARGET
========================================================= */

function findDiplomaticTarget(
    actor
) {

    if (
        !gameState ||
        !gameState.players
    ) {
        return null;
    }


    const others =
        gameState.players.filter(
            p =>
                p.playerId !==
                actor.playerId
        );


    if (!others.length) {
        return null;
    }


    /*
       Later AI will explicitly provide
       targetPlayerId.

       For now, choose the most
       diplomatically relevant country.
    */

    const sorted =
        [...others].sort(
            (a, b) => {

                const ra =
                    gameState.relations[
                        relationKey(
                            actor.playerId,
                            a.playerId
                        )
                    ]?.value ?? 50;


                const rb =
                    gameState.relations[
                        relationKey(
                            actor.playerId,
                            b.playerId
                        )
                    ]?.value ?? 50;


                return ra - rb;

            }
        );


    return sorted[0] || null;

}


/* =========================================================
   50. NEWS
========================================================= */

function createDecisionNews(
    player,
    event,
    choice
) {

    return `${player.countryName}: ${choice.title} در واکنش به «${event.title}»`;

}


function addNews(
    text
) {

    if (!gameState) return;


    const news = {

        text,

        turn:
            gameState.turn,

        timestamp:
            new Date()
                .toISOString()

    };


    gameState.news.push(
        news
    );


    gameState.news =
        gameState.news.slice(
            -30
        );


    renderNews();

}


function renderNews() {

    const element =
        $("newsText");

    if (!element) return;


    const latest =
        gameState?.news?.[
            gameState.news.length - 1
        ];


    if (!latest) {

        element.textContent =
            "در انتظار اولین خبر...";

        return;

    }


    element.textContent =
        latest.text;

}


/* =========================================================
   51. NEWS RECEIVED
========================================================= */

function handleNewsUpdate(
    payload
) {

    if (!payload?.news) {
        return;
    }


    if (!gameState) return;


    gameState.news =
        gameState.news || [];


    gameState.news.push(
        payload.news
    );


    gameState.news =
        gameState.news.slice(
            -30
        );


    renderNews();

}


/* =========================================================
   52. EVENT RECEIVED
========================================================= */

function handleEventUpdate(
    payload
) {

    if (!payload) return;


    currentEvent =
        payload.event ||
        null;


    if (
        payload.state
    ) {

        gameState =
            sanitizeIncomingState(
                payload.state
            );

    }


    processingChoice = false;


    renderGame();

}


/* =========================================================
   53. AI THINKING
========================================================= */

function showAIThinking(
    visible
) {

    const element =
        $("aiThinking");

    if (!element) return;


    element.classList.toggle(
        "hidden",
        !visible
    );

}


/* =========================================================
   54. GAME OVER
========================================================= */

async function finishGame() {

    if (!isHost) return;


    gameState.gameOver =
        true;


    const ranking =
        [...gameState.players]
            .map(
                player => ({

                    player,

                    score:
                        calculateScore(
                            player
                        )

                })
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );


    const winner =
        ranking[0]?.player ||
        null;


    const result = {

        winnerId:
            winner?.playerId ||
            null,

        winnerName:
            winner?.countryName ||
            "هیچ‌کس",

        ranking

    };


    await sendBroadcast(
        "game_over",
        {
            result,
            state:
                gameState
        }
    );


    handleGameOver({
        result,
        state:
            gameState
    });

}


/* =========================================================
   55. SCORE
========================================================= */

function calculateScore(
    player
) {

    if (!player) return 0;


    return Math.round(

        player.money * 0.25 +

        player.economy * 0.20 +

        player.popularity * 0.15 +

        player.security * 0.15 +

        player.electricity * 0.10 +

        player.relations * 0.10 +

        (100 - player.sanctions) * 0.05

    );

}


/* =========================================================
   56. HANDLE GAME OVER
========================================================= */

function handleGameOver(
    payload
) {

    gameState =
        payload?.state ||
        gameState;


    gameStarted = false;


    showScreen(
        "endScreen"
    );


    const result =
        payload?.result;


    if ($("endTitle")) {

        $("endTitle")
            .textContent =
            "پایان جمهوری";

    }


    if ($("endDescription")) {

        $("endDescription")
            .textContent =
            result?.winnerName
                ? `در این دوره، ${result.winnerName} بالاترین امتیاز را به دست آورد.`
                : "تاریخ قضاوت خواهد کرد.";

    }


    const container =
        $("finalResults");


    if (!container) return;


    container.innerHTML = "";


    const ranking =
        result?.ranking || [];


    ranking.forEach(
        (entry, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "result-row";


            row.innerHTML = `

                <span>
                    #${index + 1}
                    ${escapeHTML(
                        entry.player.flag ||
                        "🏳️"
                    )}
                    ${escapeHTML(
                        entry.player.countryName ||
                        "کشور"
                    )}
                </span>

                <strong>
                    ${entry.score}
                </strong>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   57. SANITIZE INCOMING STATE
========================================================= */

function sanitizeIncomingState(
    state
) {

    if (!state) return null;


    try {

        return JSON.parse(
            JSON.stringify(
                state
            )
        );

    } catch (_) {

        return state;

    }

}


/* =========================================================
   58. CLAMP
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            Number(value) || 0
        )
    );

}


/* =========================================================
   59. CONTAINS ANY
========================================================= */

function containsAny(
    text,
    values
) {

    return values.some(
        value =>
            text.includes(
                value
            )
    );

}


/* =========================================================
   60. ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   61. COPY ROOM CODE
========================================================= */

async function copyRoomCode() {

    if (!roomCode) return;


    try {

        await navigator.clipboard.writeText(
            roomCode
        );

        toast(
            "کد اتاق کپی شد."
        );

    } catch (_) {

        toast(
            `کد اتاق: ${roomCode}`
        );

    }

}


/* =========================================================
   62. RETURN TO MENU
========================================================= */

async function returnToMenu() {

    try {

        if (channel) {

            await channel.untrack();

            await supabaseClient
                .removeChannel(
                    channel
                );

        }

    } catch (_) {}


    channel = null;

    roomCode = "";

    playerNumber = 0;

    isHost = false;

    joined = false;

    gameStarted = false;

    localPlayer = null;

    gameState = null;

    gameHistory = [];

    currentEvent = null;

    processingChoice = false;

    generatingEvent = false;


    showScreen(
        "menuScreen"
    );

}


/* =========================================================
   63. BUTTON EVENTS
========================================================= */

function setupUI() {

    /* -----------------------------------------------------
       CREATE ROOM
    ----------------------------------------------------- */

    $("createRoomBtn")
        ?.addEventListener(
            "click",
            () => {

                isHost = true;

                showScreen(
                    "setupScreen"
                );

            }
        );


    /* -----------------------------------------------------
       JOIN ROOM
    ----------------------------------------------------- */

    $("joinRoomBtn")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "joinScreen"
                );

            }
        );


    /* -----------------------------------------------------
       CONFIRM SETUP
    ----------------------------------------------------- */

    $("confirmSetupBtn")
        ?.addEventListener(
            "click",
            async () => {

                if (isHost) {

                    await createRoom();

                } else {

                    const data =
                        readSetupForm();

                    if (!data) return;

                    await joinExistingRoom(
                        data
                    );

                }

            }
        );


    /* -----------------------------------------------------
       JOIN CONFIRM
    ----------------------------------------------------- */

    $("joinConfirmBtn")
        ?.addEventListener(
            "click",
            async () => {

                await joinRoom();

            }
        );


    /* -----------------------------------------------------
       JOIN BACK
    ----------------------------------------------------- */

    $("joinBackBtn")
        ?.addEventListener(
            "click",
            () => {

                showScreen(
                    "menuScreen"
                );

            }
        );


    /* -----------------------------------------------------
       START GAME
    ----------------------------------------------------- */

    $("startGameBtn")
        ?.addEventListener(
            "click",
            async () => {

                await startGame();

            }
        );


    /* -----------------------------------------------------
       COPY ROOM
    ----------------------------------------------------- */

    $("copyRoomBtn")
        ?.addEventListener(
            "click",
            async () => {

                await copyRoomCode();

            }
        );


    /* -----------------------------------------------------
       EVENT CLOSE
    ----------------------------------------------------- */

    $("closeEventBtn")
        ?.addEventListener(
            "click",
            () => {

                $("eventOverlay")
                    ?.classList.add(
                        "hidden"
                    );

            }
        );


    /* -----------------------------------------------------
       RESTART
    ----------------------------------------------------- */

    $("restartBtn")
        ?.addEventListener(
            "click",
            async () => {

                await returnToMenu();

            }
        );

}


/* =========================================================
   64. EVENT OVERLAY
========================================================= */

function showEventOverlay(
    event,
    effects = null
) {

    if (!event) return;


    const overlay =
        $("eventOverlay");


    if (!overlay) return;


    $("eventTitle")
        .textContent =
        event.title ||
        "اتفاق جدید";


    $("eventDescription")
        .textContent =
        event.description ||
        "";


    const effectsContainer =
        $("eventEffects");


    if (
        effectsContainer &&
        effects
    ) {

        effectsContainer.innerHTML = "";


        Object.entries(
            effects
        ).forEach(
            ([key, value]) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "effect-item " +
                    (
                        value >= 0
                            ? "positive"
                            : "negative"
                    );


                item.textContent =
                    `${key}: ${
                        value >= 0
                            ? "+"
                            : ""
                    }${value}`;


                effectsContainer.appendChild(
                    item
                );

            }
        );

    }


    overlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   65. STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupUI();

        bootGame();

        console.log(
            "Republic of Absurdity v2.0 initialized."
        );

    }
);


/* =========================================================
   66. GLOBAL DEBUG API
   ---------------------------------------------------------
   Useful during development.
========================================================= */

window.RepublicGame = {

    getState: () =>
        gameState,

    getPlayer: () =>
        localPlayer,

    getRoom: () =>
        roomCode,

    getHistory: () =>
        gameHistory,

    forceAIEvent: () =>
        nextAIEvent(),

    returnToMenu: () =>
        returnToMenu()

};