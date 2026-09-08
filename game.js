/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v4.0
   Multiplayer + AI Director + Consequences
   Supabase Realtime + 3D Office
   ========================================================= */

(() => {
"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const SUPABASE_URL =
"https://kkltydnftjwdgqtufdvl.supabase.co";

const SUPABASE_KEY =
"sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

const MAX_PLAYERS = 8;
const MAX_TURNS = 30;
const VERSION = 4;

/* =========================================================
   GLOBALS
   ========================================================= */

let supabase = null;
let channel = null;

let roomCode = "";
let playerId = "";
let playerNumber = 0;

let isHost = false;
let joined = false;
let gameStarted = false;
let gameOver = false;

let generatingEvent = false;
let processingChoice = false;
let hostProcessingChoice = false;

let currentEvent = null;

let lastRevision = -1;
let stateRevision = 0;

const processedChoices = new Set();

let gameState = createGameState();

/* =========================================================
   HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

function uid(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 9)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp(v, min, max) {
    v = Number(v);
    if (!Number.isFinite(v)) v = min;
    return Math.max(min, Math.min(max, v));
}

function n(v, fallback = 0) {
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
}

function clone(obj) {
    try {
        return structuredClone(obj);
    } catch {
        return JSON.parse(JSON.stringify(obj));
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text ?? "";
}

function show(id) {
    const el = $(id);
    if (el) el.classList.remove("hidden");
}

function hide(id) {
    const el = $(id);
    if (el) el.classList.add("hidden");
}

function toast(message, type = "info") {

    let el = $("toast");

    if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        el.className = "toast";
        document.body.appendChild(el);
    }

    el.textContent = message;
    el.dataset.type = type;
    el.classList.add("show");

    clearTimeout(el._timer);

    el._timer = setTimeout(() => {
        el.classList.remove("show");
    }, 2500);
}

/* =========================================================
   PLAYER ID
   ========================================================= */

playerId =
localStorage.getItem("roa_player_id");

if (!playerId) {

    playerId = uid("player");

    localStorage.setItem(
        "roa_player_id",
        playerId
    );
}

/* =========================================================
   COUNTRIES
   ========================================================= */

const COUNTRIES = [

{
    code:"IR",
    name:"ایران",
    flag:"🇮🇷",
    region:"خاورمیانه",
    geography:[
        "خشک",
        "کوهستانی",
        "ساحلی"
    ]
},

{
    code:"US",
    name:"آمریکا",
    flag:"🇺🇸",
    region:"آمریکای شمالی",
    geography:[
        "متنوع",
        "ساحلی",
        "خشک"
    ]
},

{
    code:"GB",
    name:"بریتانیا",
    flag:"🇬🇧",
    region:"اروپا",
    geography:[
        "جزیره‌ای",
        "مرطوب",
        "ساحلی"
    ]
},

{
    code:"FR",
    name:"فرانسه",
    flag:"🇫🇷",
    region:"اروپا",
    geography:[
        "متنوع",
        "ساحلی",
        "کوهستانی"
    ]
},

{
    code:"DE",
    name:"آلمان",
    flag:"🇩🇪",
    region:"اروپا",
    geography:[
        "معتدل",
        "شهری",
        "جنگلی"
    ]
},

{
    code:"JP",
    name:"ژاپن",
    flag:"🇯🇵",
    region:"آسیا",
    geography:[
        "جزیره‌ای",
        "کوهستانی",
        "ساحلی"
    ]
},

{
    code:"CN",
    name:"چین",
    flag:"🇨🇳",
    region:"آسیا",
    geography:[
        "متنوع",
        "شهری",
        "خشک"
    ]
},

{
    code:"IN",
    name:"هند",
    flag:"🇮🇳",
    region:"آسیا",
    geography:[
        "گرم",
        "متنوع",
        "ساحلی"
    ]
},

{
    code:"BR",
    name:"برزیل",
    flag:"🇧🇷",
    region:"آمریکای جنوبی",
    geography:[
        "جنگلی",
        "گرم",
        "ساحلی"
    ]
},

{
    code:"CA",
    name:"کانادا",
    flag:"🇨🇦",
    region:"آمریکای شمالی",
    geography:[
        "سرد",
        "جنگلی",
        "ساحلی"
    ]
},

{
    code:"AU",
    name:"استرالیا",
    flag:"🇦🇺",
    region:"اقیانوسیه",
    geography:[
        "خشک",
        "ساحلی",
        "گرم"
    ]
},

{
    code:"TR",
    name:"ترکیه",
    flag:"🇹🇷",
    region:"اوراسیا",
    geography:[
        "کوهستانی",
        "ساحلی",
        "خشک"
    ]
},

{
    code:"EG",
    name:"مصر",
    flag:"🇪🇬",
    region:"آفریقا",
    geography:[
        "بیابانی",
        "گرم",
        "رودخانه‌ای"
    ]
},

{
    code:"ZA",
    name:"آفریقای جنوبی",
    flag:"🇿🇦",
    region:"آفریقا",
    geography:[
        "خشک",
        "ساحلی",
        "متنوع"
    ]
},

{
    code:"KR",
    name:"کره جنوبی",
    flag:"🇰🇷",
    region:"آسیا",
    geography:[
        "کوهستانی",
        "شهری",
        "ساحلی"
    ]
}

];

/* =========================================================
   GEOGRAPHY
   ========================================================= */

const GEOGRAPHY = {

خشک:{
    economy:-1,
    climate:7,
    electricity:0,
    crises:[
        "خشکسالی",
        "کمبود آب",
        "گردوغبار"
    ]
},

کوهستانی:{
    economy:1,
    climate:2,
    electricity:2,
    crises:[
        "برف سنگین",
        "اختلال جاده‌ای",
        "رانش زمین"
    ]
},

ساحلی:{
    economy:2,
    climate:5,
    electricity:0,
    crises:[
        "طوفان ساحلی",
        "سیلاب",
        "اختلال بندر"
    ]
},

جزیره‌ای:{
    economy:1,
    climate:7,
    electricity:-1,
    crises:[
        "طوفان",
        "اختلال واردات",
        "اختلال حمل‌ونقل"
    ]
},

مرطوب:{
    economy:1,
    climate:5,
    electricity:0,
    crises:[
        "سیلاب",
        "بارندگی شدید",
        "اختلال کشاورزی"
    ]
},

معتدل:{
    economy:3,
    climate:1,
    electricity:2,
    crises:[
        "اختلال زنجیره تأمین",
        "بارندگی شدید"
    ]
},

جنگلی:{
    economy:1,
    climate:4,
    electricity:1,
    crises:[
        "آتش‌سوزی طبیعی",
        "بارندگی شدید"
    ]
},

شهری:{
    economy:4,
    climate:2,
    electricity:1,
    crises:[
        "اعتصاب",
        "اختلال حمل‌ونقل",
        "قطعی برق"
    ]
},

گرم:{
    economy:0,
    climate:8,
    electricity:-1,
    crises:[
        "موج گرما",
        "مصرف شدید برق",
        "کمبود آب"
    ]
},

متنوع:{
    economy:3,
    climate:3,
    electricity:2,
    crises:[
        "طوفان",
        "بحران انرژی",
        "اختلال کشاورزی"
    ]
},

بیابانی:{
    economy:-1,
    climate:9,
    electricity:-1,
    crises:[
        "خشکسالی",
        "کمبود آب",
        "موج گرما"
    ]
},

رودخانه‌ای:{
    economy:2,
    climate:5,
    electricity:1,
    crises:[
        "سیلاب",
        "آلودگی آب",
        "اختلال کشاورزی"
    ]
},

سرد:{
    economy:0,
    climate:6,
    electricity:-1,
    crises:[
        "موج سرمای شدید",
        "اختلال انرژی",
        "اختلال حمل‌ونقل"
    ]
}

};

/* =========================================================
   STATE
   ========================================================= */

function createGameState() {

    return {

        version:VERSION,

        roomCode:"",
        hostId:playerId,

        stateRevision:0,

        started:false,
        gameOver:false,

        turn:0,
        maxTurns:MAX_TURNS,

        currentPlayerIndex:0,

        players:[],
        countries:[],

        currentEvent:null,

        history:[],
        news:[],
        activeCrises:[],

        relations:{},

        lastConsequence:null,

        world:{
            tension:18,
            economy:62,
            climatePressure:28,
            mediaHeat:20,
            stability:68
        }

    };
}

/* =========================================================
   COUNTRY
   ========================================================= */

function createCountry(
    country,
    leaderName,
    geography
) {

    const geo =
        GEOGRAPHY[geography] ||
        GEOGRAPHY["معتدل"];

    return {

        id:uid("country"),

        leaderName,

        countryCode:country.code,
        countryName:country.name,
        flag:country.flag,
        region:country.region,

        geography,

        money:100,

        electricity:
            clamp(
                70 + geo.electricity * 3,
                0,
                100
            ),

        economy:
            clamp(
                62 + geo.economy * 4,
                0,
                100
            ),

        popularity:60,
        security:65,
        stability:65,

        sanctions:0,
        mediaPressure:15,

        relations:{},
        diplomacy:{},

        activeCrises:[],

        status:"stable",
        alive:true,
        online:true,

        history:[]

    };
}

/* =========================================================
   FINDERS
   ========================================================= */

function getPlayer(id) {

    return gameState.players.find(
        p => p.id === id
    ) || null;
}

function getLocalPlayer() {
    return getPlayer(playerId);
}

function getCountry(code) {

    return gameState.countries.find(
        c => c.countryCode === code
    ) || null;
}

function getCurrentPlayer() {

    return (
        gameState.players[
            gameState.currentPlayerIndex
        ] || null
    );
}

function getCurrentCountry() {

    const player =
        getCurrentPlayer();

    if (!player) return null;

    return getCountry(
        player.countryCode
    );
}

/* =========================================================
   NORMALIZE STATE
   ========================================================= */

function normalizeState(state) {

    state.players =
        Array.isArray(state.players)
            ? state.players
            : [];

    state.countries =
        Array.isArray(state.countries)
            ? state.countries
            : [];

    state.history =
        Array.isArray(state.history)
            ? state.history
            : [];

    state.news =
        Array.isArray(state.news)
            ? state.news
            : [];

    state.activeCrises =
        Array.isArray(state.activeCrises)
            ? state.activeCrises
            : [];

    state.relations =
        state.relations || {};

    state.world =
        state.world || {};

    state.world.tension =
        clamp(state.world.tension,0,100);

    state.world.economy =
        clamp(state.world.economy,0,100);

    state.world.climatePressure =
        clamp(
            state.world.climatePressure,
            0,
            100
        );

    state.world.mediaHeat =
        clamp(
            state.world.mediaHeat,
            0,
            100
        );

    state.world.stability =
        clamp(
            state.world.stability,
            0,
            100
        );

    return state;
}

/* =========================================================
   SUPABASE INIT
   ========================================================= */

function initSupabase() {

    if (!window.supabase) {

        toast(
            "Supabase لود نشده.",
            "error"
        );

        return false;
    }

    if (!supabase) {

        supabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
    }

    return true;
}

/* =========================================================
   CHANNEL
   ========================================================= */

function createChannel(code) {

    if (!initSupabase())
        return null;

    if (channel) {

        try {
            supabase.removeChannel(
                channel
            );
        } catch {}
    }

    channel =
        supabase.channel(
            "political-game:" + code,
            {
                config:{
                    presence:{
                        key:playerId
                    },

                    broadcast:{
                        self:false
                    }
                }
            }
        );

    registerChannelEvents();

    return channel;
}

/* =========================================================
   CHANNEL EVENTS
   ========================================================= */

function registerChannelEvents() {

    if (!channel) return;

    channel

    .on(
        "broadcast",
        {
            event:"room_join_request"
        },
        payload => {

            handleJoinRequest(
                payload?.payload || payload
            );

        }
    )

    .on(
        "broadcast",
        {
            event:"room_join_response"
        },
        payload => {

            handleJoinResponse(
                payload?.payload || payload
            );

        }
    )

    .on(
        "broadcast",
        {
            event:"game_state"
        },
        payload => {

            receiveState(
                payload?.payload || payload
            );

        }
    )

    .on(
        "broadcast",
        {
            event:"player_choice"
        },
        payload => {

            handleChoiceRequest(
                payload?.payload || payload
            );

        }
    )

    .on(
        "broadcast",
        {
            event:"room_ping"
        },
        payload => {

            if (
                payload?.payload?.roomCode ===
                roomCode
            ) {

                renderLobby();

            }

        }
    )

    .on(
        "presence",
        {
            event:"sync"
        },
        () => {

            updatePresence();

        }
    )

    .on(
        "presence",
        {
            event:"join"
        },
        () => {

            updatePresence();

        }
    )

    .on(
        "presence",
        {
            event:"leave"
        },
        () => {

            updatePresence();

        }
    );
}

/* =========================================================
   SUBSCRIBE
   ========================================================= */

async function subscribeChannel() {

    if (!channel)
        return false;

    return new Promise(resolve => {

        let finished = false;

        const timer =
            setTimeout(() => {

                if (finished) return;

                finished = true;

                setConnection(false);

                resolve(false);

            },12000);

        channel.subscribe(
            async status => {

                if (
                    status ===
                    "SUBSCRIBED"
                ) {

                    clearTimeout(timer);

                    try {

                        await channel.track({

                            playerId,

                            playerNumber,

                            online:true,

                            at:Date.now()

                        });

                    } catch {}

                    setConnection(true);

                    if (!finished) {

                        finished = true;

                        resolve(true);

                    }

                }

                if (
                    status ===
                    "CHANNEL_ERROR" ||
                    status ===
                    "TIMED_OUT" ||
                    status ===
                    "CLOSED"
                ) {

                    clearTimeout(timer);

                    setConnection(false);

                    if (!finished) {

                        finished = true;

                        resolve(false);

                    }

                }

            }
        );

    });
}

/* =========================================================
   BROADCAST
   ========================================================= */

async function broadcast(
    event,
    payload
) {

    if (!channel)
        return false;

    try {

        const result =
            await channel.send({

                type:"broadcast",

                event,

                payload

            });

        return (
            result === "ok" ||
            result === undefined
        );

    } catch(error) {

        console.error(
            "Broadcast error:",
            error
        );

        return false;
    }
}

/* =========================================================
   CONNECTION
   ========================================================= */

function setConnection(online) {

    const el =
        $("connectionStatus");

    if (!el) return;

    el.textContent =
        online
            ? "● آنلاین"
            : "● قطع ارتباط";

    el.classList.toggle(
        "offline",
        !online
    );
}

/* =========================================================
   PRESENCE
   ========================================================= */

function updatePresence() {

    if (!channel) return;

    let state = {};

    try {

        state =
            channel.presenceState() || {};

    } catch {

        return;

    }

    const onlineIds =
        new Set();

    Object.keys(state).forEach(
        key => {

            onlineIds.add(key);

            const entries =
                state[key];

            if (
                Array.isArray(entries)
            ) {

                entries.forEach(
                    item => {

                        if (
                            item?.playerId
                        ) {

                            onlineIds.add(
                                item.playerId
                            );

                        }

                    }
                );

            }

        }
    );

    gameState.players.forEach(
        player => {

            player.online =
                onlineIds.has(
                    player.id
                );

        }
    );

    renderPlayers();
}

/* =========================================================
   STATE SYNC
   ========================================================= */

function touchState() {

    if (!isHost) return;

    stateRevision++;

    gameState.stateRevision =
        stateRevision;
}

async function broadcastState(
    reason = "update"
) {

    if (!isHost) return;

    const packet = {

        version:VERSION,

        roomCode,

        revision:
            gameState.stateRevision,

        hostId:playerId,

        reason,

        sentAt:Date.now(),

        state:clone(gameState)

    };

    await broadcast(
        "game_state",
        packet
    );
}

/* =========================================================
   RECEIVE STATE
   ========================================================= */

function receiveState(packet) {

    if (!packet?.state)
        return;

    if (
        packet.roomCode &&
        packet.roomCode !== roomCode
    ) {

        return;
    }

    const revision =
        n(packet.revision,-1);

    if (
        revision <= lastRevision
    ) {

        return;
    }

    lastRevision =
        revision;

    stateRevision =
        Math.max(
            stateRevision,
            revision
        );

    gameState =
        normalizeState(
            clone(packet.state)
        );

    joined =
        gameState.players.some(
            p => p.id === playerId
        ) || joined;

    gameStarted =
        gameState.started;

    gameOver =
        gameState.gameOver;

    currentEvent =
        gameState.currentEvent;

    playerNumber =
        getLocalPlayer()?.number ||
        playerNumber;

    renderAll();

    if (gameOver) {

        setScreen(
            "endScreen"
        );

    } else if (gameStarted) {

        setScreen(
            "gameScreen"
        );

    } else if (joined) {

        setScreen(
            "lobbyScreen"
        );

    }
}

/* =========================================================
   ROOM CODE
   ========================================================= */

function generateRoomCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (
        let i=0;
        i<6;
        i++
    ) {

        code +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }

    return code;
}

/* =========================================================
   CREATE ROOM
   ========================================================= */

async function createRoom() {

    const name =
        $("leaderName")
            ?.value
            ?.trim() ||
        "رئیس بزرگ";

    const countryCode =
        $("countrySelect")
            ?.value;

    const geography =
        $("geographySelect")
            ?.value;

    const country =
        COUNTRIES.find(
            c =>
                c.code ===
                countryCode
        );

    if (!country) {

        toast(
            "کشور را انتخاب کن.",
            "error"
        );

        return;
    }

    if (!geography) {

        toast(
            "جغرافیا را انتخاب کن.",
            "error"
        );

        return;
    }

    roomCode =
        generateRoomCode();

    isHost = true;
    joined = true;

    gameStarted = false;
    gameOver = false;

    playerNumber = 1;

    stateRevision = 0;
    lastRevision = -1;

    gameState =
        createGameState();

    gameState.roomCode =
        roomCode;

    gameState.hostId =
        playerId;

    gameState.players.push({

        id:playerId,

        number:1,

        name,

        countryCode,

        ready:true,

        online:true

    });

    gameState.countries.push(
        createCountry(
            country,
            name,
            geography
        )
    );

    createRelations();

    createChannel(
        roomCode
    );

    const connected =
        await subscribeChannel();

    if (!connected) {

        toast(
            "اتصال به Supabase برقرار نشد.",
            "error"
        );

        return;
    }

    touchState();

    renderAll();

    setScreen(
        "lobbyScreen"
    );

    await broadcastState(
        "room_created"
    );

    toast(
        "اتاق ساخته شد: " +
        roomCode,
        "success"
    );
}

/* =========================================================
   JOIN ROOM
   ========================================================= */

async function joinRoom() {

    const code =
        $("roomCodeInput")
            ?.value
            ?.trim()
            ?.toUpperCase();

    const name =
        $("leaderName")
            ?.value
            ?.trim() ||
        "بازیکن";

    const countryCode =
        $("countrySelect")
            ?.value;

    const geography =
        $("geographySelect")
            ?.value;

    if (!code) {

        toast(
            "کد اتاق را وارد کن.",
            "error"
        );

        return;
    }

    const country =
        COUNTRIES.find(
            c =>
                c.code ===
                countryCode
        );

    if (!country) {

        toast(
            "کشور را انتخاب کن.",
            "error"
        );

        return;
    }

    if (!geography) {

        toast(
            "جغرافیا را انتخاب کن.",
            "error"
        );

        return;
    }

    roomCode = code;

    isHost = false;
    joined = false;

    playerNumber = 0;

    createChannel(
        roomCode
    );

    const connected =
        await subscribeChannel();

    if (!connected) {

        toast(
            "اتصال به اتاق برقرار نشد.",
            "error"
        );

        return;
    }

    setScreen(
        "lobbyScreen"
    );

    setText(
        "roomCodeDisplay",
        roomCode
    );

    setText(
        "lobbyStatus",
        "در حال ورود..."
    );

    await broadcast(
        "room_join_request",
        {

            requestId:
                uid("join"),

            playerId,

            name,

            countryCode,

            geography,

            roomCode,

            sentAt:Date.now()

        }
    );
}

/* =========================================================
   JOIN REQUEST
   ========================================================= */

async function handleJoinRequest(
    request
) {

    if (!isHost)
        return;

    if (!request)
        return;

    if (
        gameState.started
    ) {

        await broadcast(
            "room_join_response",
            {

                playerId:
                    request.playerId,

                requestId:
                    request.requestId,

                accepted:false,

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

        await broadcast(
            "room_join_response",
            {

                playerId:
                    request.playerId,

                requestId:
                    request.requestId,

                accepted:false,

                reason:
                    "اتاق پر است."

            }
        );

        return;
    }

    if (
        gameState.players.some(
            p =>
                p.id ===
                request.playerId
        )
    ) {

        return;
    }

    const country =
        COUNTRIES.find(
            c =>
                c.code ===
                request.countryCode
        );

    if (!country) return;

    if (
        gameState.players.some(
            p =>
                p.countryCode ===
                request.countryCode
        )
    ) {

        await broadcast(
            "room_join_response",
            {

                playerId:
                    request.playerId,

                requestId:
                    request.requestId,

                accepted:false,

                reason:
                    "این کشور قبلاً انتخاب شده."

            }
        );

        return;
    }

    let number = 1;

    while (
        gameState.players.some(
            p =>
                p.number === number
        )
    ) {

        number++;

    }

    const player = {

        id:
            request.playerId,

        number,

        name:
            request.name ||
            `بازیکن ${number}`,

        countryCode:
            request.countryCode,

        ready:true,

        online:true

    };

    gameState.players.push(
        player
    );

    gameState.countries.push(
        createCountry(
            country,
            player.name,
            request.geography
        )
    );

    createRelations();

    touchState();

    await broadcast(
        "room_join_response",
        {

            playerId:
                request.playerId,

            requestId:
                request.requestId,

            accepted:true,

            playerNumber:number,

            roomCode,

            hostId:playerId

        }
    );

    await broadcastState(
        "player_joined"
    );

    renderAll();
}

/* =========================================================
   JOIN RESPONSE
   ========================================================= */

function handleJoinResponse(
    response
) {

    if (!response)
        return;

    if (
        response.playerId !==
        playerId
    ) {

        return;
    }

    if (
        response.accepted === false
    ) {

        toast(
            response.reason ||
            "ورود رد شد.",
            "error"
        );

        setScreen(
            "joinScreen"
        );

        return;
    }

    joined = true;

    isHost =
        response.hostId ===
        playerId;

    playerNumber =
        n(
            response.playerNumber,
            0
        );

    setText(
        "roomCodeDisplay",
        roomCode
    );

    setText(
        "lobbyStatus",
        "با موفقیت وارد اتاق شدی."
    );

    toast(
        "وارد اتاق شدی.",
        "success"
    );
}

/* =========================================================
   RELATIONS
   ========================================================= */

function createRelations() {

    gameState.players.forEach(
        a => {

            gameState.relations[
                a.countryCode
            ] ||= {};

            gameState.players.forEach(
                b => {

                    if (
                        a.countryCode ===
                        b.countryCode
                    ) return;

                    if (
                        gameState.relations[
                            a.countryCode
                        ][
                            b.countryCode
                        ] === undefined
                    ) {

                        gameState.relations[
                            a.countryCode
                        ][
                            b.countryCode
                        ] = 50;

                    }

                }
            );

        }
    );

    gameState.countries.forEach(
        country => {

            country.relations ||= {};

            gameState.countries.forEach(
                other => {

                    if (
                        country.countryCode ===
                        other.countryCode
                    ) return;

                    country.relations[
                        other.countryCode
                    ] ??= 50;

                }
            );

        }
    );
}

function changeRelation(
    from,
    to,
    delta
) {

    if (!from || !to)
        return;

    if (from === to)
        return;

    gameState.relations[from] ||= {};
    gameState.relations[to] ||= {};

    const value =
        clamp(
            n(
                gameState.relations[
                    from
                ][to],
                50
            ) + n(delta),
            -100,
            100
        );

    gameState.relations[
        from
    ][to] = value;

    gameState.relations[
        to
    ][from] = value;

    const a =
        getCountry(from);

    const b =
        getCountry(to);

    if (a)
        a.relations[to] =
            value;

    if (b)
        b.relations[from] =
            value;
}

/* =========================================================
   START
   ========================================================= */

async function startGame() {

    if (!isHost) {

        toast(
            "فقط سازنده می‌تواند بازی را شروع کند.",
            "error"
        );

        return;
    }

    if (
        gameState.players.length < 1
    ) return;

    if (
        gameState.started
    ) return;

    gameState.started = true;
    gameState.gameOver = false;

    gameState.turn = 1;

    gameState.currentPlayerIndex = 0;

    gameState.currentEvent = null;

    gameState.lastConsequence = null;

    gameStarted = true;
    gameOver = false;

    touchState();

    setScreen(
        "gameScreen"
    );

    renderAll();

    await broadcastState(
        "game_started"
    );

    await sleep(600);

    await nextAIEvent();
}

/* =========================================================
   AI EVENT
   ========================================================= */

async function nextAIEvent() {

    if (!isHost)
        return;

    if (
        !gameState.started ||
        gameState.gameOver
    ) return;

    if (
        generatingEvent ||
        hostProcessingChoice
    ) return;

    if (
        gameState.turn >
        MAX_TURNS
    ) {

        finishGame();

        return;
    }

    const player =
        getCurrentPlayer();

    const country =
        getCurrentCountry();

    if (!player || !country) {

        rotateTurn();

        return nextAIEvent();
    }

    generatingEvent = true;

    showAIThinking(
        "هوش مصنوعی در حال ساخت بحران بعدی است..."
    );

    try {

        let raw = null;

        if (
            typeof window.generateAIEvent ===
            "function"
        ) {

            raw =
                await window.generateAIEvent(
                    {

                        turn:
                            gameState.turn,

                        maxTurns:
                            MAX_TURNS,

                        player,

                        country,

                        players:
                            gameState.players,

                        countries:
                            gameState.countries,

                        world:
                            gameState.world,

                        history:
                            gameState.history.slice(-15),

                        news:
                            gameState.news.slice(-10)

                    }
                );

        }

        const event =
            normalizeAIEvent(
                raw,
                player,
                country
            );

        event.eventToken =
            uid("event");

        event.turn =
            gameState.turn;

        event.targetPlayerId =
            player.id;

        currentEvent = event;

        gameState.currentEvent =
            event;

        gameState.history.push({

            kind:"event",

            turn:
                gameState.turn,

            eventId:
                event.id,

            eventToken:
                event.eventToken,

            title:
                event.title,

            type:
                event.type,

            at:
                Date.now()

        });

        gameState.history =
            gameState.history.slice(-100);

        touchState();

        hideAIThinking();

        renderAll();

        await broadcastState(
            "new_event"
        );

    } catch(error) {

        console.error(
            error
        );

        const fallback =
            fallbackEvent(
                player,
                country
            );

        fallback.eventToken =
            uid("event");

        fallback.turn =
            gameState.turn;

        currentEvent =
            fallback;

        gameState.currentEvent =
            fallback;

        touchState();

        hideAIThinking();

        renderAll();

        await broadcastState(
            "fallback_event"
        );

    } finally {

        generatingEvent = false;

        hideAIThinking();

    }
}

/* =========================================================
   AI NORMALIZE
   ========================================================= */

function normalizeAIEvent(
    raw,
    player,
    country
) {

    if (
        !raw ||
        typeof raw !== "object"
    ) {

        return fallbackEvent(
            player,
            country
        );
    }

    let choices =
        Array.isArray(raw.choices)
            ? raw.choices
            : [];

    choices =
        choices
        .slice(0,3)
        .map(
            (choice,index) => {

                return {

                    id:
                        String(
                            choice.id ||
                            "choice_" +
                            (index+1)
                        ),

                    title:
                        String(
                            choice.title ||
                            "تصمیم"
                        ),

                    description:
                        String(
                            choice.description ||
                            "این تصمیم را انتخاب کن."
                        ),

                    effects:
                        normalizeEffects(
                            choice.effects ||
                            {}
                        )

                };

            }
        );

    while (
        choices.length < 3
    ) {

        choices.push({

            id:
                "fallback_" +
                choices.length,

            title:
                [
                    "کمیته تشکیل بده",
                    "تصمیم جسورانه بگیر",
                    "همه‌چیز را عجیب‌تر کن"
                ][
                    choices.length
                ],

            description:
                [
                    "فعلاً بررسی می‌کنیم.",
                    "سریع تصمیم می‌گیری.",
                    "راهی کاملاً غیرمنتظره انتخاب می‌کنی."
                ][
                    choices.length
                ],

            effects:
                [
                    {
                        stability:2,
                        popularity:1
                    },
                    {
                        economy:3,
                        stability:-3
                    },
                    {
                        popularity:6,
                        stability:-6,
                        mediaPressure:8,
                        tension:3
                    }
                ][
                    choices.length
                ]

        });

    }

    return {

        id:
            String(
                raw.id ||
                uid("ai")
            ),

        title:
            String(
                raw.title ||
                "بحران جدید"
            ),

        description:
            String(
                raw.description ||
                "یک اتفاق غیرمنتظره دولت را غافلگیر کرده است."
            ),

        type:
            String(
                raw.type ||
                "politics"
            ),

        targetPlayerId:
            player.id,

        choices

    };
}

/* =========================================================
   FALLBACK EVENT
   ========================================================= */

function fallbackEvent(
    player,
    country
) {

    return {

        id:
            uid("event"),

        title:
            "جلسه اضطراری دولت",

        description:
            `${country.flag} در ${country.countryName} یک بحران عجیب ایجاد شده و همه منتظر تصمیم ${player.name} هستند.`,

        type:
            "politics",

        targetPlayerId:
            player.id,

        choices:[

            {
                id:"committee",

                title:
                    "کمیته تشکیل بده",

                description:
                    "فعلاً همه‌چیز را بررسی کن.",

                effects:{
                    stability:2,
                    popularity:2,
                    economy:-1
                }
            },

            {
                id:"bold",

                title:
                    "تصمیم جسورانه",

                description:
                    "بدون معطلی تصمیم بگیر.",

                effects:{
                    economy:4,
                    popularity:3,
                    stability:-4
                }
            },

            {
                id:"chaos",

                title:
                    "تصمیم کاملاً عجیب",

                description:
                    "کاری کن که هیچ‌کس انتظارش را ندارد.",

                effects:{
                    popularity:7,
                    stability:-7,
                    mediaPressure:10,
                    tension:4
                }
            }

        ]

    };
}

/* =========================================================
   EFFECT NORMALIZE
   ========================================================= */

function normalizeEffects(
    effects
) {

    const result = {};

    const fields = [

        "money",
        "electricity",
        "economy",
        "popularity",
        "security",
        "sanctions",
        "stability",
        "mediaPressure",
        "tension",
        "climatePressure",
        "relation"

    ];

    fields.forEach(
        field => {

            if (
                effects[field] !==
                undefined
            ) {

                result[field] =
                    n(
                        effects[field]
                    );

            }

        }
    );

    if (
        effects.crisis
    ) {

        result.crisis =
            effects.crisis;

    }

    if (
        effects.relations
    ) {

        result.relations =
            effects.relations;

    }

    if (
        effects.diplomacy
    ) {

        result.diplomacy =
            effects.diplomacy;

    }

    return result;
}

/* =========================================================
   CHOICE
   ========================================================= */

function chooseDecision(
    choiceId
) {

    if (
        !gameState.started ||
        gameState.gameOver
    ) return;

    if (
        processingChoice
    ) return;

    const current =
        getCurrentPlayer();

    if (
        !current ||
        current.id !== playerId
    ) {

        toast(
            "الان نوبت تو نیست.",
            "error"
        );

        return;
    }

    if (!currentEvent)
        return;

    const choice =
        currentEvent.choices.find(
            c =>
                c.id ===
                choiceId
        );

    if (!choice)
        return;

    processingChoice = true;

    disableCards(true);

    const request = {

        requestId:
            uid("choice"),

        playerId,

        playerNumber,

        turn:
            gameState.turn,

        eventId:
            currentEvent.id,

        eventToken:
            currentEvent.eventToken,

        choiceId,

        sentAt:
            Date.now()

    };

    if (isHost) {

        handleChoiceRequest(
            request
        );

    } else {

        broadcast(
            "player_choice",
            request
        ).then(ok => {

            if (!ok) {

                processingChoice =
                    false;

                disableCards(
                    false
                );

                toast(
                    "ارسال تصمیم ناموفق بود.",
                    "error"
                );

            }

        });

    }
}

/* =========================================================
   HOST CHOICE VALIDATION
   ========================================================= */

async function handleChoiceRequest(
    request
) {

    if (!isHost)
        return;

    if (
        hostProcessingChoice
    ) return;

    if (
        !gameState.started ||
        gameState.gameOver
    ) return;

    const player =
        getCurrentPlayer();

    if (!player)
        return;

    if (
        request.playerId !==
        player.id
    ) return;

    if (
        n(request.turn) !==
        n(gameState.turn)
    ) return;

    if (!currentEvent)
        return;

    if (
        request.eventId !==
        currentEvent.id
    ) return;

    if (
        request.eventToken !==
        currentEvent.eventToken
    ) return;

    const key =
        request.eventToken +
        ":" +
        request.playerId;

    if (
        processedChoices.has(key)
    ) return;

    const choice =
        currentEvent.choices.find(
            c =>
                c.id ===
                request.choiceId
        );

    if (!choice)
        return;

    processedChoices.add(key);

    if (
        processedChoices.size >
        100
    ) {

        const first =
            processedChoices
                .values()
                .next()
                .value;

        processedChoices.delete(
            first
        );
    }

    await processChoice(
        player,
        choice
    );
}

/* =========================================================
   PROCESS CHOICE
   ========================================================= */

async function processChoice(
    player,
    choice
) {

    if (!isHost)
        return;

    if (
        hostProcessingChoice
    ) return;

    hostProcessingChoice = true;

    try {

        const country =
            getCountry(
                player.countryCode
            );

        if (!country)
            return;

        applyEffects(
            country,
            choice.effects
        );

        handleDiplomacy(
            country,
            choice.effects
        );

        processCrisesAfterChoice(
            country,
            choice.effects
        );

        simulateWorld(
            country,
            choice.effects
        );

        const consequence =
            await getConsequence(
                player,
                country,
                choice
            );

        gameState.lastConsequence = {

            token:
                uid("consequence"),

            playerId:
                player.id,

            title:
                consequence.title,

            text:
                consequence.text,

            npcQuote:
                consequence.npcQuote,

            newsHeadline:
                consequence.newsHeadline,

            newsText:
                consequence.newsText,

            turn:
                gameState.turn

        };

        gameState.history.push({

            kind:"decision",

            turn:
                gameState.turn,

            playerId:
                player.id,

            countryCode:
                country.countryCode,

            choice:
                choice.title,

            eventId:
                currentEvent?.id,

            at:
                Date.now()

        });

        addNews({

            headline:
                consequence.newsHeadline,

            text:
                consequence.newsText,

            type:
                currentEvent?.type ||
                "politics",

            countryCode:
                country.countryCode

        });

        gameState.currentEvent =
            null;

        currentEvent =
            null;

        touchState();

        renderAll();

        await broadcastState(
            "choice_processed"
        );

        showConsequence(
            gameState.lastConsequence
        );

        await sleep(2200);

        if (
            checkEnd()
        ) {

            finishGame();

            return;
        }

        processWorldTick();

        processCrises();

        rotateTurn();

        if (
            gameState.turn >
            MAX_TURNS
        ) {

            finishGame();

            return;
        }

        gameState.lastConsequence =
            null;

        touchState();

        await broadcastState(
            "next_turn"
        );

        await sleep(600);

        await nextAIEvent();

    } catch(error) {

        console.error(
            "Choice error:",
            error
        );

        toast(
            "خطا در پردازش تصمیم.",
            "error"
        );

    } finally {

        hostProcessingChoice =
            false;

        processingChoice =
            false;

        disableCards(
            false
        );
    }
}

/* =========================================================
   EFFECT ENGINE
   ========================================================= */

function applyEffects(
    country,
    effects
) {

    if (!country)
        return;

    const fields = [

        "money",
        "electricity",
        "economy",
        "popularity",
        "security",
        "sanctions",
        "stability",
        "mediaPressure"

    ];

    fields.forEach(
        field => {

            if (
                effects[field] ===
                undefined
            ) return;

            const min =
                field === "money"
                    ? -100
                    : 0;

            country[field] =
                clamp(
                    n(country[field]) +
                    n(effects[field]),
                    min,
                    100
                );

        }
    );

    if (
        effects.tension
    ) {

        gameState.world.tension =
            clamp(
                gameState.world.tension +
                n(effects.tension),
                0,
                100
            );

    }

    if (
        effects.climatePressure
    ) {

        gameState.world.climatePressure =
            clamp(
                gameState.world.climatePressure +
                n(effects.climatePressure),
                0,
                100
            );

    }

    if (
        effects.crisis
    ) {

        addCrisis(
            country,
            String(
                effects.crisis
            )
        );

    }
}

/* =========================================================
   DIPLOMACY
   ========================================================= */

function handleDiplomacy(
    country,
    effects
) {

    if (
        effects.relations &&
        typeof effects.relations ===
        "object"
    ) {

        Object.entries(
            effects.relations
        ).forEach(
            ([target,delta]) => {

                if (
                    getCountry(target)
                ) {

                    changeRelation(
                        country.countryCode,
                        target,
                        n(delta)
                    );

                }

            }
        );
    }

    const diplomacy =
        effects.diplomacy;

    if (!diplomacy)
        return;

    let target =
        diplomacy.target;

    if (
        !target ||
        !getCountry(target)
    ) {

        const candidates =
            gameState.countries
                .filter(
                    c =>
                        c.countryCode !==
                        country.countryCode
                );

        if (candidates.length)
            target =
                candidates[
                    Math.floor(
                        Math.random() *
                        candidates.length
                    )
                ].countryCode;
    }

    const targetCountry =
        getCountry(target);

    if (!targetCountry)
        return;

    const action =
        diplomacy.action;

    if (
        action ===
        "agreement"
    ) {

        changeRelation(
            country.countryCode,
            targetCountry.countryCode,
            15
        );

        country.economy =
            clamp(
                country.economy + 3,
                0,
                100
            );

        targetCountry.economy =
            clamp(
                targetCountry.economy + 2,
                0,
                100
            );

    }

    if (
        action ===
        "sanction"
    ) {

        targetCountry.sanctions =
            clamp(
                targetCountry.sanctions + 8,
                0,
                100
            );

        changeRelation(
            country.countryCode,
            targetCountry.countryCode,
            -15
        );

        gameState.world.tension =
            clamp(
                gameState.world.tension + 6,
                0,
                100
            );

    }

    if (
        action ===
        "statement"
    ) {

        changeRelation(
            country.countryCode,
            targetCountry.countryCode,
            -5
        );

        gameState.world.mediaHeat =
            clamp(
                gameState.world.mediaHeat + 5,
                0,
                100
            );

    }

    if (
        action ===
        "mediation"
    ) {

        changeRelation(
            country.countryCode,
            targetCountry.countryCode,
            10
        );

        gameState.world.tension =
            clamp(
                gameState.world.tension - 4,
                0,
                100
            );

    }
}

/* =========================================================
   CRISIS
   ========================================================= */

function addCrisis(
    country,
    name
) {

    if (!country)
        return;

    const crisisName =
        String(name);

    if (
        country.activeCrises.some(
            c =>
                c.name ===
                crisisName
        )
    ) return;

    const crisis = {

        id:
            uid("crisis"),

        name:
            crisisName,

        countryCode:
            country.countryCode,

        severity:1,

        turns:2,

        createdAt:
            Date.now()

    };

    country.activeCrises.push(
        crisis
    );

    gameState.activeCrises.push(
        crisis
    );
}

function processCrisesAfterChoice(
    country,
    effects
) {

    if (
        n(effects.stability) <
        -5
    ) {

        addCrisis(
            country,
            "بحران اعتماد عمومی"
        );

    }

    if (
        country.electricity <
        25
    ) {

        addCrisis(
            country,
            "بحران انرژی"
        );

    }

    if (
        country.economy <
        25
    ) {

        addCrisis(
            country,
            "بحران اقتصادی"
        );

    }

    if (
        country.popularity <
        20
    ) {

        addCrisis(
            country,
            "بحران محبوبیت دولت"
        );

    }
}

function processCrises() {

    gameState.countries.forEach(
        country => {

            const remaining = [];

            country.activeCrises
                .forEach(
                    crisis => {

                        crisis.turns =
                            n(
                                crisis.turns,
                                1
                            ) - 1;

                        const damage =
                            n(
                                crisis.severity,
                                1
                            );

                        country.economy =
                            clamp(
                                country.economy -
                                damage,
                                0,
                                100
                            );

                        country.stability =
                            clamp(
                                country.stability -
                                damage,
                                0,
                                100
                            );

                        country.popularity =
                            clamp(
                                country.popularity -
                                1,
                                0,
                                100
                            );

                        if (
                            crisis.turns > 0
                        ) {

                            remaining.push(
                                crisis
                            );

                        }

                    }
                );

            country.activeCrises =
                remaining;

        }
    );

    gameState.activeCrises =
        gameState.countries.flatMap(
            c =>
                c.activeCrises
        );
}

/* =========================================================
   WORLD
   ========================================================= */

function simulateWorld(
    country,
    effects
) {

    gameState.world.economy =
        clamp(
            gameState.world.economy +
            (
                n(effects.economy) *
                0.15
            ),
            0,
            100
        );

    gameState.world.mediaHeat =
        clamp(
            gameState.world.mediaHeat +
            (
                n(
                    effects.mediaPressure
                ) * 0.3
            ),
            0,
            100
        );

    gameState.world.stability =
        clamp(
            gameState.world.stability +
            (
                n(effects.stability) *
                0.15
            ),
            0,
            100
        );

    if (
        country.activeCrises.length >
        0
    ) {

        gameState.world.tension =
            clamp(
                gameState.world.tension +
                1,
                0,
                100
            );

    }
}

function processWorldTick() {

    gameState.world.climatePressure =
        clamp(
            gameState.world.climatePressure +
            (
                Math.random() < 0.55
                    ? 1
                    : 0
            ),
            0,
            100
        );

    gameState.world.mediaHeat =
        clamp(
            gameState.world.mediaHeat +
            (
                Math.random() < 0.5
                    ? 1
                    : -1
            ),
            0,
            100
        );

    if (
        gameState.world.climatePressure >
        65 &&
        Math.random() <
        0.25
    ) {

        const country =
            gameState.countries[
                Math.floor(
                    Math.random() *
                    gameState.countries.length
                )
            ];

        if (country) {

            const crises =
                GEOGRAPHY[
                    country.geography
                ]?.crises ||
                [
                    "اختلال محیطی"
                ];

            const crisis =
                crises[
                    Math.floor(
                        Math.random() *
                        crises.length
                    )
                ];

            addCrisis(
                country,
                crisis
            );

            addNews({

                headline:
                    "🌍 هشدار جهانی",

                text:
                    `بحران «${crisis}» در ${country.countryName} ظاهر شد.`,

                type:
                    "environment",

                countryCode:
                    country.countryCode

            });

        }
    }
}

/* =========================================================
   CONSEQUENCE
   ========================================================= */

async function getConsequence(
    player,
    country,
    choice
) {

    if (
        typeof window.generateAIConsequence ===
        "function"
    ) {

        try {

            const result =
                await window.generateAIConsequence({

                    turn:
                        gameState.turn,

                    player,

                    country,

                    choice,

                    world:
                        gameState.world,

                    history:
                        gameState.history.slice(-12),

                    news:
                        gameState.news.slice(-8)

                });

            return normalizeConsequence(
                result,
                player,
                country,
                choice
            );

        } catch(error) {

            console.warn(
                "AI consequence:",
                error
            );

        }
    }

    return fallbackConsequence(
        player,
        country,
        choice
    );
}

function normalizeConsequence(
    raw,
    player,
    country,
    choice
) {

    const fallback =
        fallbackConsequence(
            player,
            country,
            choice
        );

    if (
        !raw ||
        typeof raw !==
        "object"
    ) {

        return fallback;
    }

    return {

        title:
            String(
                raw.title ||
                raw.headline ||
                fallback.title
            ),

        text:
            String(
                raw.text ||
                raw.description ||
                raw.consequence ||
                fallback.text
            ),

        npcQuote:
            String(
                raw.npcQuote ||
                raw.npc ||
                fallback.npcQuote
            ),

        newsHeadline:
            String(
                raw.newsHeadline ||
                raw.headline ||
                fallback.newsHeadline
            ),

        newsText:
            String(
                raw.newsText ||
                raw.news ||
                fallback.newsText
            )

    };
}

function fallbackConsequence(
    player,
    country,
    choice
) {

    const funny = [

        "وزیر اقتصاد گفت همه‌چیز عالی است؛ بعد ماشین حسابش را خاموش کرد.",

        "سخنگوی دولت گفت اوضاع تحت کنترل است و بلافاصله از اتاق خارج شد.",

        "بازار واکنش نشان داد؛ خودش هم نمی‌دانست چرا.",

        "خبرنگاران جلسه فوق‌العاده تشکیل دادند تا درباره جلسه قبلی جلسه تشکیل دهند."

    ][
        Math.floor(
            Math.random() * 4
        )
    ];

    return {

        title:
            "پیامد تصمیم",

        text:
            `${player.name} تصمیم «${choice.title}» را اجرا کرد. ${funny}`,

        npcQuote:
            "مشاور ارشد: رئیس، حداقل الان همه می‌دانند چه کار کردیم.",

        newsHeadline:
            `${country.flag} ${country.countryName}: تصمیم جنجالی دولت`,

        newsText:
            `${country.leaderName} درباره بحران اخیر تصمیم‌گیری کرد و فضای سیاسی کشور تغییر کرد.`

    };
}

/* =========================================================
   NEWS
   ========================================================= */

function addNews(data) {

    gameState.news.unshift({

        id:
            uid("news"),

        headline:
            data.headline,

        text:
            data.text,

        type:
            data.type ||
            "politics",

        countryCode:
            data.countryCode ||
            null,

        at:
            Date.now()

    });

    gameState.news =
        gameState.news.slice(
            0,
            30
        );
}

/* =========================================================
   TURN
   ========================================================= */

function rotateTurn() {

    if (
        !gameState.players.length
    ) return;

    gameState.currentPlayerIndex =
        (
            gameState.currentPlayerIndex +
            1
        ) %
        gameState.players.length;

    if (
        gameState.currentPlayerIndex ===
        0
    ) {

        gameState.turn++;

    }

}

/* =========================================================
   END
   ========================================================= */

function checkEnd() {

    if (
        gameState.turn >=
        MAX_TURNS
    ) {

        return true;

    }

    return false;
}

function finishGame() {

    if (!isHost)
        return;

    if (
        gameState.gameOver
    ) return;

    gameState.gameOver = true;

    gameState.started = false;

    gameOver = true;

    gameStarted = false;

    gameState.currentEvent =
        null;

    currentEvent =
        null;

    touchState();

    renderAll();

    setScreen(
        "endScreen"
    );

    broadcastState(
        "game_over"
    );
}

/* =========================================================
   UI SCREEN
   ========================================================= */

function setScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

                screen.classList.add(
                    "hidden"
                );

            }
        );

    const target =
        $(id);

    if (!target)
        return;

    target.classList.add(
        "active"
    );

    target.classList.remove(
        "hidden"
    );

    if (
        id === "gameScreen"
    ) {

        setTimeout(
            () => {

                try {

                    window.Office3D
                        ?.init?.();

                } catch {}

            },
            100
        );

    }
}

/* =========================================================
   UI EVENT
   ========================================================= */

function renderEvent() {

    const event =
        gameState.currentEvent ||
        currentEvent;

    if (!event) {

        setText(
            "eventTitle",
            "در انتظار بحران..."
        );

        setText(
            "eventDescription",
            "هوش مصنوعی در حال آماده‌سازی اتفاق بعدی است."
        );

        document
            .querySelectorAll(
                "[data-decision-card]"
            )
            .forEach(
                card => {

                    card.classList.add(
                        "disabled"
                    );

                    card.onclick =
                        null;

                }
            );

        return;
    }

    setText(
        "eventTitle",
        event.title
    );

    setText(
        "eventDescription",
        event.description
    );

    setText(
        "eventType",
        String(
            event.type ||
            "politics"
        ).toUpperCase()
    );

    const myTurn =
        getCurrentPlayer()?.id ===
        playerId;

    document
        .querySelectorAll(
            "[data-decision-card]"
        )
        .forEach(
            (card,index) => {

                const choice =
                    event.choices[
                        index
                    ];

                if (!choice) {

                    card.onclick =
                        null;

                    return;
                }

                const title =
                    card.querySelector(
                        "[data-choice-title]"
                    );

                const desc =
                    card.querySelector(
                        "[data-choice-description]"
                    );

                if (title)
                    title.textContent =
                        choice.title;

                if (desc)
                    desc.textContent =
                        choice.description;

                card.classList.toggle(
                    "disabled",
                    !myTurn ||
                    processingChoice
                );

                card.onclick = () => {

                    if (
                        !card.classList.contains(
                            "disabled"
                        )
                    ) {

                        chooseDecision(
                            choice.id
                        );

                    }

                };

            }
        );
}

function disableCards(
    disabled
) {

    document
        .querySelectorAll(
            "[data-decision-card]"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "disabled",
                    disabled
                );

                if (disabled)
                    card.onclick =
                        null;

            }
        );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const local =
        getLocalPlayer();

    const country =
        local
            ? getCountry(
                local.countryCode
            )
            : getCurrentCountry();

    if (!country)
        return;

    setText(
        "turnNumber",
        `${gameState.turn} / ${MAX_TURNS}`
    );

    setText(
        "currentPlayerName",
        getCurrentPlayer()?.name ||
        "—"
    );

    const activeCountry =
        getCurrentCountry();

    setText(
        "currentCountryName",
        activeCountry
            ? `${activeCountry.flag} ${activeCountry.countryName}`
            : "—"
    );

    setText(
        "turnStatus",
        getCurrentPlayer()?.id ===
        playerId
            ? "نوبت توست"
            : `نوبت ${getCurrentPlayer()?.name || "بازیکن"} است`
    );

    updateStat(
        "money",
        country.money
    );

    updateStat(
        "electricity",
        country.electricity
    );

    updateStat(
        "economy",
        country.economy
    );

    updateStat(
        "popularity",
        country.popularity
    );

    updateStat(
        "security",
        country.security
    );

    updateStat(
        "stability",
        country.stability
    );

    updateStat(
        "globalTension",
        gameState.world.tension
    );

    updateStat(
        "globalEconomy",
        gameState.world.economy
    );

    updateStat(
        "climatePressure",
        gameState.world.climatePressure
    );
}

function updateStat(
    name,
    value
) {

    document
        .querySelectorAll(
            `[data-stat-value="${name}"]`
        )
        .forEach(
            el => {

                el.textContent =
                    Math.round(
                        n(value)
                    );

            }
        );

    document
        .querySelectorAll(
            `[data-stat-bar="${name}"]`
        )
        .forEach(
            bar => {

                bar.style.width =
                    clamp(
                        value,
                        0,
                        100
                    ) +
                    "%";

            }
        );
}

/* =========================================================
   PLAYERS
   ========================================================= */

function renderPlayers() {

    const list =
        $("playersList");

    if (!list)
        return;

    list.innerHTML = "";

    gameState.players.forEach(
        player => {

            const country =
                getCountry(
                    player.countryCode
                );

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "player-item";

            if (
                getCurrentPlayer()?.id ===
                player.id
            ) {

                item.classList.add(
                    "active"
                );

            }

            item.innerHTML = `

                <div class="player-avatar">
                    ${country?.flag || "👤"}
                </div>

                <div class="player-info">

                    <strong>
                        ${escapeHTML(
                            player.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            country?.countryName ||
                            "بدون کشور"
                        )}
                    </span>

                </div>

                <div class="player-status ${
                    player.online
                        ? "online"
                        : "offline"
                }">

                    ${
                        player.online
                            ? "●"
                            : "○"
                    }

                </div>
            `;

            list.appendChild(
                item
            );

        }
    );

    setText(
        "playerCount",
        `${gameState.players.length} / ${MAX_PLAYERS}`
    );

    const start =
        $("startGameBtn");

    if (start) {

        start.style.display =
            isHost &&
            !gameState.started
                ? ""
                : "none";

    }
}

/* =========================================================
   NEWS UI
   ========================================================= */

function renderNews() {

    const list =
        $("newsList");

    if (!list)
        return;

    list.innerHTML = "";

    gameState.news
        .slice(0,12)
        .forEach(
            news => {

                const item =
                    document.createElement(
                        "article"
                    );

                item.className =
                    "news-item";

                item.innerHTML = `

                    <div class="news-type">

                        ${escapeHTML(
                            String(
                                news.type ||
                                "NEWS"
                            ).toUpperCase()
                        )}

                    </div>

                    <h4>
                        ${escapeHTML(
                            news.headline
                        )}
                    </h4>

                    <p>
                        ${escapeHTML(
                            news.text
                        )}
                    </p>

                `;

                list.appendChild(
                    item
                );

            }
        );
}

/* =========================================================
   CONSEQUENCE UI
   ========================================================= */

function showConsequence(
    consequence
) {

    if (!consequence)
        return;

    setText(
        "consequenceTitle",
        consequence.title
    );

    setText(
        "consequenceText",
        consequence.text
    );

    setText(
        "npcQuote",
        consequence.npcQuote
    );

    setText(
        "newsHeadline",
        consequence.newsHeadline
    );

    show(
        "consequenceOverlay"
    );

    clearTimeout(
        showConsequence.timer
    );

    showConsequence.timer =
        setTimeout(
            () => {

                hide(
                    "consequenceOverlay"
                );

            },
            2300
        );
}

/* =========================================================
   AI THINKING
   ========================================================= */

function showAIThinking(
    text
) {

    setText(
        "aiThinkingText",
        text ||
        "هوش مصنوعی در حال فکر کردن..."
    );

    show(
        "aiThinking"
    );
}

function hideAIThinking() {

    hide(
        "aiThinking"
    );
}

/* =========================================================
   RANKING
   ========================================================= */

function renderRanking() {

    const list =
        $("rankingList");

    if (!list)
        return;

    const ranking =
        gameState.players
            .map(
                player => {

                    const country =
                        getCountry(
                            player.countryCode
                        );

                    if (!country) {

                        return {
                            player,
                            country:null,
                            score:0
                        };

                    }

                    const score =
                        country.economy * .25 +
                        country.popularity * .25 +
                        country.stability * .20 +
                        country.security * .15 +
                        country.electricity * .10 +
                        Math.max(
                            0,
                            country.money
                        ) * .05;

                    return {
                        player,
                        country,
                        score
                    };

                }
            )
            .sort(
                (a,b) =>
                    b.score -
                    a.score
            );

    list.innerHTML = "";

    ranking.forEach(
        (entry,index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "ranking-item";

            item.innerHTML = `

                <div class="ranking-position">
                    ${index + 1}
                </div>

                <div class="ranking-flag">
                    ${entry.country?.flag || "👤"}
                </div>

                <div class="ranking-info">

                    <strong>
                        ${escapeHTML(
                            entry.player.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            entry.country?.countryName ||
                            "نامشخص"
                        )}
                    </span>

                </div>

                <div class="ranking-score">
                    ${Math.round(
                        entry.score
                    )}
                </div>

            `;

            list.appendChild(
                item
            );

        }
    );
}

/* =========================================================
   LOBBY
   ========================================================= */

function renderLobby() {

    setText(
        "roomCodeDisplay",
        roomCode || "------"
    );

    setText(
        "playerCount",
        `${gameState.players.length} / ${MAX_PLAYERS}`
    );

    renderPlayers();

}

/* =========================================================
   AI OVERLAY / ALL RENDER
   ========================================================= */

function renderAll() {

    renderLobby();

    renderEvent();

    renderDashboard();

    renderPlayers();

    renderNews();

    if (
        gameState.gameOver
    ) {

        renderRanking();

    }

    if (
        gameState.lastConsequence
    ) {

        showConsequence(
            gameState.lastConsequence
        );

    }
}

/* =========================================================
   UI SETUP
   ========================================================= */

function setupUI() {

    const createBtn =
        $("createRoomBtn");

    if (createBtn) {

        createBtn.onclick =
            () => {

                setScreen(
                    "setupScreen"
                );

            };

    }

    const joinBtn =
        $("joinRoomBtn");

    if (joinBtn) {

        joinBtn.onclick =
            () => {

                setScreen(
                    "joinScreen"
                );

            };

    }

    const confirm =
        $("confirmSetupBtn");

    if (confirm) {

        confirm.onclick =
            createRoom;

    }

    const joinConfirm =
        $("joinConfirmBtn");

    if (joinConfirm) {

        joinConfirm.onclick =
            joinRoom;

    }

    const start =
        $("startGameBtn");

    if (start) {

        start.onclick =
            startGame;

    }

    const copy =
        $("copyRoomBtn");

    if (copy) {

        copy.onclick =
            async () => {

                if (!roomCode)
                    return;

                try {

                    await navigator
                        .clipboard
                        .writeText(
                            roomCode
                        );

                    toast(
                        "کد اتاق کپی شد.",
                        "success"
                    );

                } catch {

                    toast(
                        roomCode,
                        "info"
                    );

                }

            };

    }

    /* کشور → جغرافیا */

    const countrySelect =
        $("countrySelect");

    const geographySelect =
        $("geographySelect");

    if (
        countrySelect &&
        geographySelect
    ) {

        countrySelect.onchange =
            () => {

                const country =
                    COUNTRIES.find(
                        c =>
                            c.code ===
                            countrySelect.value
                    );

                if (!country)
                    return;

                geographySelect.innerHTML =
                    "";

                country.geography
                    .forEach(
                        geo => {

                            const option =
                                document.createElement(
                                    "option"
                                );

                            option.value =
                                geo;

                            option.textContent =
                                geo;

                            geographySelect
                                .appendChild(
                                    option
                                );

                        }
                    );

            };

        countrySelect.onchange();

    }

    /* دکمه‌های تصمیم عمداً
       listener سراسری ندارند. */

}

/* =========================================================
   BOOT
   ========================================================= */

function boot() {

    setupUI();

    setConnection(
        false
    );

    hideAIThinking();

    hide(
        "consequenceOverlay"
    );

    setScreen(
        "bootScreen"
    );

    setTimeout(
        () => {

            setScreen(
                "mainMenu"
            );

        },
        900
    );

    /* Debug API */

    window.RepublicGame = {

        state:
            () =>
                clone(
                    gameState
                ),

        room:
            () =>
                roomCode,

        player:
            () =>
                playerId,

        createRoom,

        joinRoom,

        startGame,

        chooseDecision,

        nextAIEvent

    };
}

/* =========================================================
   ERROR PROTECTION
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Republic Game:",
            event.error ||
            event.message
        );

    }
);

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Republic Game Promise:",
            event.reason
        );

    }
);

/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        boot,
        {
            once:true
        }
    );

} else {

    boot();

}

})();