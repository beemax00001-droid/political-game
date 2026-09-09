/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE — 50 STAGE CINEMATIC MULTIPLAYER
   ========================================================= */

(() => {
"use strict";

/* =========================================================
   CONFIG
========================================================= */

const VERSION = "50-STAGE-CINEMATIC";

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 1;
const MAX_STAGES = 50;
const MIN_STAGES = 10;

const SUPABASE_URL =
"https://kkltydnftjwdgqtufdvl.supabase.co";

const SUPABASE_KEY =
"sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const AI_URL =
"https://political-game-ai.tm1190128.workers.dev/";

/* =========================================================
   SUPABASE
========================================================= */

let supabaseClient = null;
let roomChannel = null;
let roomCode = "";
let isHost = false;

if (window.supabase) {
    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
}

/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);

const DOM = {
    bootScreen: $("bootScreen"),
    mainMenu: $("mainMenu"),

    setupScreen: $("setupScreen"),
    joinScreen: $("joinScreen"),
    lobbyScreen: $("lobbyScreen"),
    gameScreen: $("gameScreen"),
    endScreen: $("endScreen"),

    createGameBtn: $("createGameBtn"),
    joinGameBtn: $("joinGameBtn"),

    leaderName: $("leaderName"),
    countrySelect: $("countrySelect"),
    geographySelect: $("geographySelect"),
    confirmSetupBtn: $("confirmSetupBtn"),

    roomCodeInput: $("roomCodeInput"),
    joinLeaderName: $("joinLeaderName"),
    joinCountrySelect: $("joinCountrySelect"),
    joinGeographySelect: $("joinGeographySelect"),
    joinConfirmBtn: $("joinConfirmBtn"),

    roomCodeDisplay: $("roomCodeDisplay"),
    copyRoomBtn: $("copyRoomBtn"),

    playersList: $("playersList"),
    playerCount: $("playerCount"),
    lobbyStatus: $("lobbyStatus"),
    startGameBtn: $("startGameBtn"),

    playerCountry: $("playerCountry"),
    playerLeader: $("playerLeader"),

    statMoney: $("statMoney"),
    statEconomy: $("statEconomy"),
    statElectricity: $("statElectricity"),
    statPopularity: $("statPopularity"),
    statStability: $("statStability"),
    statSanctions: $("statSanctions"),

    worldTension: $("worldTension"),
    worldMarket: $("worldMarket"),
    worldEnergy: $("worldEnergy"),

    turnNumber: $("turnNumber"),
    maxTurns: $("maxTurns"),
    currentTurnPlayer: $("currentTurnPlayer"),
    currentTurnCountry: $("currentTurnCountry"),
    turnMessage: $("turnMessage"),

    newsHeadline: $("newsHeadline"),
    newsText: $("newsText"),

    eventCategory: $("eventCategory"),
    eventTitle: $("eventTitle"),
    eventDescription: $("eventDescription"),

    decisionCards: $("decisionCards"),

    aiThinking: $("aiThinking"),
    aiThinkingText: $("aiThinkingText"),

    consequenceOverlay: $("consequenceOverlay"),
    consequenceTitle: $("consequenceTitle"),
    consequenceStory: $("consequenceStory"),
    consequenceNews: $("consequenceNews"),

    rankingList: $("rankingList"),
    playAgainBtn: $("playAgainBtn"),

    musicToggleBtn: $("musicToggleBtn"),
    fxToggleBtn: $("fxToggleBtn")
};

/* =========================================================
   COUNTRIES
========================================================= */

const COUNTRIES = [
    "جمهوری آفتاب",
    "امپراتوری باران",
    "اتحاد شمال",
    "جمهوری ساحلی",
    "فدراسیون مرکزی",
    "پادشاهی کوهستان",
    "اتحاد جزایر",
    "جمهوری نوین"
];

/* =========================================================
   GEOGRAPHY
========================================================= */

const GEOGRAPHIES = [
    "ساحلی",
    "کوهستانی",
    "بیابانی",
    "شهری",
    "کشاورزی",
    "جزیره‌ای",
    "قطبی",
    "مرزی"
];

/* =========================================================
   STAGE OPTIONS
========================================================= */

const STAGE_OPTIONS = [10, 20, 30, 40, 50];

/* =========================================================
   LOCAL PLAYER
========================================================= */

const localPlayer = {
    id:
        "p_" +
        Math.random()
            .toString(36)
            .slice(2) +
        Date.now(),

    name: "",
    country: "",
    geography: "",
    isHost: false
};

/* =========================================================
   GAME STATE
========================================================= */

let gameState = {
    version: VERSION,

    roomCode: "",

    stageLimit: 10,

    currentStage: 0,

    currentPlayerIndex: 0,

    players: [],

    activeEvent: null,

    activeChoice: null,

    processedChoiceId: null,

    consequence: null,

    history: [],

    pendingConsequences: [],

    resolvedConsequences: [],

    world: {
        tension: 25,
        market: 70,
        energy: 20
    },

    turnStartedAt: 0,

    finished: false,

    started: false,

    phase: "lobby"
};

/* =========================================================
   LOCAL UI STATE
========================================================= */

let uiState = {
    selectedStageLimit: null,

    musicEnabled: true,

    fxEnabled: true,

    processingChoice: false,

    lastRenderedStage: -1
};

/* =========================================================
   UTILS
========================================================= */

function randomId(prefix = "id") {
    return (
        prefix +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10) +
        "_" +
        Date.now()
    );
}

function randomRoomCode() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}

function clamp(value, min, max) {
    return Math.max(
        min,
        Math.min(max, value)
    );
}

function safeText(value) {
    return String(value ?? "")
        .replace(/[<>]/g, "");
}

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function deepClone(obj) {
    return JSON.parse(
        JSON.stringify(obj)
    );
}

/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(screen) {

    const screens = [
        DOM.bootScreen,
        DOM.mainMenu,
        DOM.setupScreen,
        DOM.joinScreen,
        DOM.lobbyScreen,
        DOM.gameScreen,
        DOM.endScreen
    ];

    screens.forEach(el => {
        if (!el) return;

        el.classList.remove(
            "active",
            "screen-enter",
            "screen-exit"
        );
    });

    if (!screen) return;

    screen.classList.add(
        "active",
        "screen-enter"
    );

    setTimeout(() => {
        screen.classList.remove(
            "screen-enter"
        );
    }, 900);
}

/* =========================================================
   TOAST
========================================================= */

function toast(message, type = "info") {

    let container =
        $("toastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "toastContainer";

        document.body.appendChild(
            container
        );
    }

    const item =
        document.createElement("div");

    item.className =
        "toast toast-" + type;

    item.textContent =
        message;

    container.appendChild(item);

    requestAnimationFrame(() => {
        item.classList.add("show");
    });

    setTimeout(() => {

        item.classList.remove(
            "show"
        );

        setTimeout(() => {
            item.remove();
        }, 400);

    }, 3200);
}

/* =========================================================
   FX
========================================================= */

function fxPulse(element) {

    if (!element) return;

    element.classList.remove(
        "stat-pulse"
    );

    void element.offsetWidth;

    element.classList.add(
        "stat-pulse"
    );
}

function screenFlash(type = "normal") {

    const layer =
        document.createElement("div");

    layer.className =
        "cinematic-flash " +
        "flash-" +
        type;

    document.body.appendChild(
        layer
    );

    requestAnimationFrame(() => {
        layer.classList.add("active");
    });

    setTimeout(() => {
        layer.classList.remove("active");
    }, 80);

    setTimeout(() => {
        layer.remove();
    }, 500);
}

/* =========================================================
   COUNTRIES / SELECTS
========================================================= */

function fillSelect(
    select,
    values
) {

    if (!select) return;

    select.innerHTML = "";

    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;

        option.textContent = value;

        select.appendChild(
            option
        );
    });
}

function initializeSelects() {

    fillSelect(
        DOM.countrySelect,
        COUNTRIES
    );

    fillSelect(
        DOM.joinCountrySelect,
        COUNTRIES
    );

    fillSelect(
        DOM.geographySelect,
        GEOGRAPHIES
    );

    fillSelect(
        DOM.joinGeographySelect,
        GEOGRAPHIES
    );
}

/* =========================================================
   STAGE SELECTION UI
========================================================= */

function createStageSelector() {

    if (!DOM.confirmSetupBtn) {
        return;
    }

    const parent =
        DOM.confirmSetupBtn.parentElement;

    if (!parent) return;

    if ($("stageSelector")) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "stageSelector";

    wrapper.className =
        "stage-selector";

    wrapper.innerHTML = `
        <div class="stage-selector-title">
            تعداد مراحل جمهوری
        </div>

        <div class="stage-selector-subtitle">
            قبل از شروع، بازیکن‌ها تعیین می‌کنند بازی چند مرحله داشته باشد.
        </div>

        <div class="stage-options">
            ${STAGE_OPTIONS.map(n => `
                <button
                    type="button"
                    class="stage-option"
                    data-stage="${n}">
                    <strong>${n}</strong>
                    <span>مرحله</span>
                </button>
            `).join("")}
        </div>

        <div class="stage-selected-text">
            هنوز تعداد مراحل انتخاب نشده
        </div>
    `;

    parent.insertBefore(
        wrapper,
        DOM.confirmSetupBtn
    );

    wrapper
        .querySelectorAll(
            ".stage-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const amount =
                        Number(
                            button.dataset.stage
                        );

                    selectStageLimit(
                        amount
                    );
                }
            );
        });
}

function selectStageLimit(amount) {

    if (
        !STAGE_OPTIONS.includes(amount)
    ) {
        return;
    }

    uiState.selectedStageLimit =
        amount;

    document
        .querySelectorAll(
            ".stage-option"
        )
        .forEach(btn => {

            btn.classList.toggle(
                "selected",
                Number(
                    btn.dataset.stage
                ) === amount
            );
        });

    const text =
        document.querySelector(
            ".stage-selected-text"
        );

    if (text) {

        text.textContent =
            `بازی شما ${amount} مرحله خواهد داشت`;

        text.classList.add(
            "selected"
        );
    }

    fxPulse(text);

    toast(
        `تعداد مراحل روی ${amount} تنظیم شد`,
        "success"
    );
}

/* =========================================================
   PLAYER FACTORY
========================================================= */

function createPlayer(
    data = {}
) {

    return {

        id:
            data.id ||
            randomId("player"),

        name:
            safeText(
                data.name ||
                "رئیس جمهور"
            ),

        country:
            safeText(
                data.country ||
                COUNTRIES[0]
            ),

        geography:
            safeText(
                data.geography ||
                GEOGRAPHIES[0]
            ),

        isHost:
            Boolean(
                data.isHost
            ),

        money: 1000,

        economy: 70,

        electricity: 75,

        popularity: 60,

        stability: 65,

        sanctions: 0,

        score: 0,

        decisions: 0,

        consequences: 0
    };
}

/* =========================================================
   CREATE ROOM
========================================================= */

async function createRoom() {

    const name =
        DOM.leaderName?.value
            ?.trim();

    if (!name) {

        toast(
            "نام رئیس جمهور را وارد کن",
            "error"
        );

        return;
    }

    if (
        !uiState.selectedStageLimit
    ) {

        toast(
            "اول تعداد مراحل را انتخاب کن",
            "error"
        );

        const selector =
            $("stageSelector");

        selector?.classList.add(
            "attention"
        );

        setTimeout(() => {
            selector?.classList.remove(
                "attention"
            );
        }, 900);

        return;
    }

    localPlayer.name =
        name;

    localPlayer.country =
        DOM.countrySelect?.value ||
        COUNTRIES[0];

    localPlayer.geography =
        DOM.geographySelect?.value ||
        GEOGRAPHIES[0];

    localPlayer.isHost =
        true;

    isHost = true;

    roomCode =
        randomRoomCode();

    gameState =
        createInitialGameState();

    gameState.roomCode =
        roomCode;

    gameState.stageLimit =
        uiState.selectedStageLimit;

    gameState.players = [
        createPlayer({
            id: localPlayer.id,
            name: localPlayer.name,
            country: localPlayer.country,
            geography: localPlayer.geography,
            isHost: true
        })
    ];

    gameState.phase =
        "lobby";

    gameState.started =
        false;

    showScreen(
        DOM.lobbyScreen
    );

    if (DOM.roomCodeDisplay) {
        DOM.roomCodeDisplay.textContent =
            roomCode;
    }

    await connectRoom();

    renderLobby();

    toast(
        `اتاق ${roomCode} ساخته شد`,
        "success"
    );
}

/* =========================================================
   JOIN ROOM
========================================================= */

async function joinRoom() {

    const code =
        DOM.roomCodeInput?.value
            ?.trim()
            .toUpperCase();

    const name =
        DOM.joinLeaderName?.value
            ?.trim();

    if (!code) {

        toast(
            "کد اتاق را وارد کن",
            "error"
        );

        return;
    }

    if (!name) {

        toast(
            "نام رئیس جمهور را وارد کن",
            "error"
        );

        return;
    }

    localPlayer.name =
        name;

    localPlayer.country =
        DOM.joinCountrySelect?.value ||
        COUNTRIES[0];

    localPlayer.geography =
        DOM.joinGeographySelect?.value ||
        GEOGRAPHIES[0];

    localPlayer.isHost =
        false;

    isHost = false;

    roomCode = code;

    showScreen(
        DOM.lobbyScreen
    );

    if (DOM.roomCodeDisplay) {
        DOM.roomCodeDisplay.textContent =
            roomCode;
    }

    await connectRoom();

    toast(
        "در حال ورود به جمهوری...",
        "info"
    );
}

/* =========================================================
   INITIAL STATE
========================================================= */

function createInitialGameState() {

    return {

        version: VERSION,

        roomCode: "",

        stageLimit: 10,

        currentStage: 0,

        currentPlayerIndex: 0,

        players: [],

        activeEvent: null,

        activeChoice: null,

        processedChoiceId: null,

        consequence: null,

        history: [],

        pendingConsequences: [],

        resolvedConsequences: [],

        world: {

            tension: 25,

            market: 70,

            energy: 20

        },

        turnStartedAt: 0,

        finished: false,

        started: false,

        phase: "lobby"
    };
}

/* =========================================================
   CONNECT ROOM
========================================================= */

async function connectRoom() {

    if (!supabaseClient) {

        toast(
            "Supabase در دسترس نیست",
            "error"
        );

        return;
    }

    if (roomChannel) {

        try {
            await supabaseClient
                .removeChannel(
                    roomChannel
                );
        } catch {}
    }

    roomChannel =
        supabaseClient.channel(
            `republic-${roomCode}`,
            {
                config: {
                    broadcast: {
                        self: true,
                        ack: true
                    }
                }
            }
        );

    roomChannel
        .on(
            "broadcast",
            {
                event:
                    "GAME_STATE"
            },
            payload => {

                if (
                    !payload?.payload
                        ?.state
                ) {
                    return;
                }

                receiveGameState(
                    payload.payload.state
                );
            }
        )
        .on(
            "broadcast",
            {
                event:
                    "PLAYER_JOIN"
            },
            payload => {

                if (!isHost) {
                    return;
                }

                if (
                    payload?.payload
                        ?.player
                ) {

                    addPlayer(
                        payload.payload.player
                    );
                }
            }
        )
        .on(
            "broadcast",
            {
                event:
                    "REQUEST_STATE"
            },
            () => {

                if (
                    isHost &&
                    gameState
                ) {

                    broadcastState();
                }
            }
        )
        .on(
            "broadcast",
            {
                event:
                    "PLAYER_ACTION"
            },
            payload => {

                if (!isHost) {
                    return;
                }

                handleRemoteAction(
                    payload?.payload
                );
            }
        )
        .on(
            "broadcast",
            {
                event:
                    "START_REQUEST"
            },
            payload => {

                if (!isHost) {
                    return;
                }

                const requested =
                    Number(
                        payload?.payload
                            ?.stageLimit
                    );

                if (
                    STAGE_OPTIONS.includes(
                        requested
                    )
                ) {

                    gameState.stageLimit =
                        requested;

                    startGame();
                }
            }
        )
        .subscribe(
            async status => {

                if (
                    status !==
                    "SUBSCRIBED"
                ) {
                    return;
                }

                if (isHost) {

                    await sleep(250);

                    broadcastState();

                } else {

                    await roomChannel.send({
                        type:
                            "broadcast",
                        event:
                            "PLAYER_JOIN",
                        payload: {
                            player:
                                createPlayer({
                                    id:
                                        localPlayer.id,
                                    name:
                                        localPlayer.name,
                                    country:
                                        localPlayer.country,
                                    geography:
                                        localPlayer.geography,
                                    isHost:
                                        false
                                })
                        }
                    });

                    await sleep(250);

                    await roomChannel.send({
                        type:
                            "broadcast",
                        event:
                            "REQUEST_STATE",
                        payload: {}
                    });
                }
            }
        );
}

/* =========================================================
   ADD PLAYER
========================================================= */

function addPlayer(player) {

    if (!player?.id) {
        return;
    }

    const exists =
        gameState.players.some(
            p => p.id === player.id
        );

    if (exists) {
        return;
    }

    if (
        gameState.players.length >=
        MAX_PLAYERS
    ) {

        toast(
            "ظرفیت اتاق پر است",
            "error"
        );

        return;
    }

    gameState.players.push(
        createPlayer(player)
    );

    gameState.players =
        normalizePlayers(
            gameState.players
        );

    broadcastState();

    renderLobby();

    toast(
        `${player.name} وارد جمهوری شد`,
        "success"
    );
}

/* =========================================================
   NORMALIZE PLAYERS
========================================================= */

function normalizePlayers(players) {

    return players.map(
        (p, index) => {

            const player =
                createPlayer(p);

            player.isHost =
                Boolean(
                    p.isHost ||
                    index === 0
                );

            player.money =
                Number(
                    p.money ??
                    1000
                );

            player.economy =
                Number(
                    p.economy ??
                    70
                );

            player.electricity =
                Number(
                    p.electricity ??
                    75
                );

            player.popularity =
                Number(
                    p.popularity ??
                    60
                );

            player.stability =
                Number(
                    p.stability ??
                    65
                );

            player.sanctions =
                Number(
                    p.sanctions ??
                    0
                );

            player.score =
                Number(
                    p.score ??
                    0
                );

            player.decisions =
                Number(
                    p.decisions ??
                    0
                );

            player.consequences =
                Number(
                    p.consequences ??
                    0
                );

            return player;
        }
    );
}

/* =========================================================
   BROADCAST
========================================================= */

async function broadcastState() {

    if (
        !roomChannel ||
        !gameState
    ) {
        return;
    }

    try {

        await roomChannel.send({
            type:
                "broadcast",

            event:
                "GAME_STATE",

            payload: {
                state:
                    deepClone(
                        gameState
                    )
            }
        });

    } catch (error) {

        console.error(
            "broadcastState",
            error
        );
    }
}

/* =========================================================
   RECEIVE STATE
========================================================= */

function receiveGameState(state) {

    if (!state) {
        return;
    }

    const oldStage =
        gameState.currentStage;

    gameState =
        deepClone(state);

    gameState.players =
        normalizePlayers(
            gameState.players ||
            []
        );

    const me =
        gameState.players.find(
            p =>
                p.id ===
                localPlayer.id
        );

    if (me) {

        localPlayer.name =
            me.name;

        localPlayer.country =
            me.country;

        localPlayer.geography =
            me.geography;
    }

    if (
        !gameState.started
    ) {

        showScreen(
            DOM.lobbyScreen
        );

        renderLobby();

        return;
    }

    if (
        gameState.finished
    ) {

        showScreen(
            DOM.endScreen
        );

        renderEnd();

        return;
    }

    showScreen(
        DOM.gameScreen
    );

    renderEverything();

    if (
        oldStage !==
        gameState.currentStage
    ) {

        stageTransition();
    }
}

/* =========================================================
   START GAME
========================================================= */

function requestStartGame() {

    if (
        !isHost &&
        roomChannel
    ) {

        const selected =
            gameState.stageLimit ||
            uiState.selectedStageLimit ||
            10;

        roomChannel.send({

            type:
                "broadcast",

            event:
                "START_REQUEST",

            payload: {
                stageLimit:
                    selected
            }
        });

        toast(
            "درخواست شروع ارسال شد",
            "info"
        );

        return;
    }

    startGame();
}

async function startGame() {

    if (!isHost) {
        return;
    }

    if (
        gameState.players.length <
        MIN_PLAYERS
    ) {

        toast(
            "حداقل یک بازیکن لازم است",
            "error"
        );

        return;
    }

    const limit =
        Number(
            gameState.stageLimit
        );

    if (
        !STAGE_OPTIONS.includes(
            limit
        )
    ) {

        gameState.stageLimit =
            10;
    }

    gameState.started =
        true;

    gameState.finished =
        false;

    gameState.phase =
        "game";

    gameState.currentStage =
        0;

    gameState.currentPlayerIndex =
        0;

    gameState.history = [];

    gameState.pendingConsequences = [];

    gameState.resolvedConsequences = [];

    gameState.activeEvent = null;

    gameState.activeChoice = null;

    gameState.consequence = null;

    gameState.turnStartedAt =
        Date.now();

    gameState.players =
        normalizePlayers(
            gameState.players
        );

    showScreen(
        DOM.gameScreen
    );

    renderEverything();

    broadcastState();

    await sleep(900);

    await hostGenerateNextTurn();
}

/* =========================================================
   CURRENT PLAYER
========================================================= */

function getCurrentPlayer() {

    return (
        gameState.players[
            gameState.currentPlayerIndex
        ] ||
        gameState.players[0]
    );
}

function getLocalPlayer() {

    return (
        gameState.players.find(
            p =>
                p.id ===
                localPlayer.id
        ) ||
        null
    );
}

/* =========================================================
   TURN CHECK
========================================================= */

function isMyTurn() {

    const current =
        getCurrentPlayer();

    return Boolean(
        current &&
        current.id ===
        localPlayer.id
    );
}

/* =========================================================
   STAGE TRANSITION
========================================================= */

function stageTransition() {

    screenFlash(
        "normal"
    );

    document.body.classList.add(
        "stage-transition"
    );

    setTimeout(() => {

        document.body.classList.remove(
            "stage-transition"
        );

    }, 1100);

    if (
        DOM.turnNumber
    ) {

        DOM.turnNumber.classList.add(
            "stage-number-pop"
        );

        setTimeout(() => {

            DOM.turnNumber.classList.remove(
                "stage-number-pop"
            );

        }, 900);
    }
}

/* =========================================================
   HOST TURN ENGINE
========================================================= */

async function hostGenerateNextTurn() {

    if (!isHost) {
        return;
    }

    if (
        gameState.currentStage >=
        gameState.stageLimit
    ) {

        finishGame();

        return;
    }

    const current =
        getCurrentPlayer();

    if (!current) {
        return;
    }

    gameState.phase =
        "event";

    gameState.activeChoice =
        null;

    gameState.processedChoiceId =
        null;

    gameState.consequence =
        null;

    gameState.turnStartedAt =
        Date.now();

    /*
     * هر چند مرحله یک پیامد قدیمی برمی‌گردد.
     */
    const consequence =
        selectPendingConsequence();

    if (consequence) {

        await createConsequenceEvent(
            consequence
        );

        broadcastState();

        return;
    }

    /*
     * رویداد عادی
     */
    showAIThinking(
        "مدیر هوش مصنوعی در حال طراحی بحران جدید..."
    );

    let event = null;

    try {

        if (
            window.RepublicAI &&
            typeof
                window.RepublicAI
                    .generateAIEvent ===
                "function"
        ) {

            event =
                await window.RepublicAI
                    .generateAIEvent(
                        createAIState(),
                        gameState.history
                    );
        }

    } catch (error) {

        console.warn(
            "AI event failed",
            error
        );
    }

    if (
        !event ||
        !Array.is