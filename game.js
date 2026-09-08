/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v4.1
   Multiplayer + AI Director + Dynamic Countries
   Supabase Realtime + 3D Office
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://kkltydnftjwdgqtufdvl.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

    const MAX_PLAYERS = 8;
    const MAX_TURNS = 30;
    const VERSION = 4.1;

    /* =====================================================
       GLOBALS
    ===================================================== */

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

    let stateRevision = 0;
    let localRevision = 0;

    const processedChoices = new Set();

    let gameState = null;

    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function uid(prefix = "p") {
        return (
            prefix +
            "_" +
            Math.random().toString(36).slice(2, 8) +
            "_" +
            Date.now().toString(36)
        );
    }

    function clamp(value, min = 0, max = 100) {
        const n = Number(value);
        if (!Number.isFinite(n)) return min;
        return Math.max(min, Math.min(max, n));
    }

    function number(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function clone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch {
            return obj;
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

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value ?? "";
    }

    function show(id) {
        const el = $(id);
        if (!el) return;

        el.classList.remove("hidden");
        el.style.display = "";
    }

    function hide(id) {
        const el = $(id);
        if (!el) return;

        el.classList.add("hidden");
    }

    function toast(message, type = "info") {
        const container = $("toastContainer");

        if (!container) {
            console.log("[TOAST]", message);
            return;
        }

        const item = document.createElement("div");

        item.className = `toast toast-${type}`;
        item.textContent = message;

        container.appendChild(item);

        setTimeout(() => {
            item.classList.add("toast-out");

            setTimeout(() => {
                item.remove();
            }, 300);
        }, 3200);
    }

    /* =====================================================
       PLAYER ID
    ===================================================== */

    function getPlayerId() {
        const key = "roa_player_id";

        let id = localStorage.getItem(key);

        if (!id) {
            id = uid("player");
            localStorage.setItem(key, id);
        }

        return id;
    }

    playerId = getPlayerId();

    /* =====================================================
       COUNTRY DATABASE
    ===================================================== */

    const COUNTRIES = [
        {
            code: "IR",
            name: "ایران",
            flag: "🇮🇷",
            region: "خاورمیانه",
            geography: [
                "کوهستانی",
                "خشک و نیمه‌خشک",
                "ساحلی",
                "کلان‌شهری",
                "ترکیبی"
            ]
        },

        {
            code: "US",
            name: "آمریکا",
            flag: "🇺🇸",
            region: "آمریکای شمالی",
            geography: [
                "ساحلی",
                "دشت‌های وسیع",
                "کوهستانی",
                "کلان‌شهری",
                "ترکیبی"
            ]
        },

        {
            code: "GB",
            name: "انگلستان",
            flag: "🇬🇧",
            region: "اروپا",
            geography: [
                "جزیره‌ای",
                "ساحلی",
                "شهری",
                "بارانی",
                "ترکیبی"
            ]
        },

        {
            code: "FR",
            name: "فرانسه",
            flag: "🇫🇷",
            region: "اروپا",
            geography: [
                "ساحلی",
                "کوهستانی",
                "کشاورزی",
                "کلان‌شهری",
                "ترکیبی"
            ]
        },

        {
            code: "DE",
            name: "آلمان",
            flag: "🇩🇪",
            region: "اروپا",
            geography: [
                "صنعتی",
                "شهری",
                "کوهستانی",
                "کشاورزی",
                "ترکیبی"
            ]
        },

        {
            code: "JP",
            name: "ژاپن",
            flag: "🇯🇵",
            region: "شرق آسیا",
            geography: [
                "جزیره‌ای",
                "کوهستانی",
                "کلان‌شهری",
                "ساحلی",
                "ترکیبی"
            ]
        },

        {
            code: "CN",
            name: "چین",
            flag: "🇨🇳",
            region: "شرق آسیا",
            geography: [
                "کلان‌شهری",
                "صنعتی",
                "کوهستانی",
                "بیابانی",
                "ترکیبی"
            ]
        },

        {
            code: "IN",
            name: "هند",
            flag: "🇮🇳",
            region: "جنوب آسیا",
            geography: [
                "کلان‌شهری",
                "ساحلی",
                "گرم و مرطوب",
                "کشاورزی",
                "ترکیبی"
            ]
        },

        {
            code: "BR",
            name: "برزیل",
            flag: "🇧🇷",
            region: "آمریکای جنوبی",
            geography: [
                "جنگلی",
                "ساحلی",
                "گرمسیری",
                "کلان‌شهری",
                "ترکیبی"
            ]
        },

        {
            code: "CA",
            name: "کانادا",
            flag: "🇨🇦",
            region: "آمریکای شمالی",
            geography: [
                "سردسیر",
                "جنگلی",
                "کوهستانی",
                "ساحلی",
                "ترکیبی"
            ]
        },

        {
            code: "AU",
            name: "استرالیا",
            flag: "🇦🇺",
            region: "اقیانوسیه",
            geography: [
                "خشک",
                "ساحلی",
                "گرمسیری",
                "شهری",
                "ترکیبی"
            ]
        },

        {
            code: "TR",
            name: "ترکیه",
            flag: "🇹🇷",
            region: "اوراسیا",
            geography: [
                "کوهستانی",
                "ساحلی",
                "شهری",
                "خشک",
                "ترکیبی"
            ]
        },

        {
            code: "EG",
            name: "مصر",
            flag: "🇪🇬",
            region: "شمال آفریقا",
            geography: [
                "بیابانی",
                "رودخانه‌ای",
                "ساحلی",
                "کلان‌شهری",
                "ترکیبی"
            ]
        },

        {
            code: "ZA",
            name: "آفریقای جنوبی",
            flag: "🇿🇦",
            region: "آفریقا",
            geography: [
                "ساحلی",
                "خشک",
                "کوهستانی",
                "شهری",
                "ترکیبی"
            ]
        },

        {
            code: "KR",
            name: "کره جنوبی",
            flag: "🇰🇷",
            region: "شرق آسیا",
            geography: [
                "کوهستانی",
                "کلان‌شهری",
                "ساحلی",
                "صنعتی",
                "ترکیبی"
            ]
        }
    ];

    /* =====================================================
       GEOGRAPHY DATA
    ===================================================== */

    const GEOGRAPHY = {

        "کوهستانی": {
            traits: {
                security: 5,
                stability: 3,
                economy: -2
            },
            crises: [
                "رانش زمین",
                "بارش سنگین",
                "مسدود شدن جاده‌های کوهستانی",
                "کمبود زیرساخت"
            ]
        },

        "خشک و نیمه‌خشک": {
            traits: {
                electricity: -3,
                stability: -1,
                economy: -2
            },
            crises: [
                "خشکسالی",
                "کمبود آب",
                "موج گرما",
                "افت تولید کشاورزی"
            ]
        },

        "ساحلی": {
            traits: {
                economy: 4,
                diplomacy: 2
            },
            crises: [
                "طوفان ساحلی",
                "اختلال بندری",
                "افزایش سطح آب",
                "اختلال در تجارت دریایی"
            ]
        },

        "کلان‌شهری": {
            traits: {
                economy: 5,
                mediaPressure: 5,
                stability: -2
            },
            crises: [
                "ترافیک گسترده",
                "اعتراض شهری",
                "قطعی خدمات",
                "بحران مسکن"
            ]
        },

        "ترکیبی": {
            traits: {
                economy: 2,
                stability: 2
            },
            crises: [
                "بحران منطقه‌ای",
                "اختلال زیرساخت",
                "فشار اقتصادی",
                "بحران اقلیمی"
            ]
        },

        "جزیره‌ای": {
            traits: {
                diplomacy: 3,
                economy: 2
            },
            crises: [
                "طوفان دریایی",
                "اختلال واردات",
                "قطع مسیرهای دریایی",
                "کمبود کالا"
            ]
        },

        "شهری": {
            traits: {
                economy: 3,
                mediaPressure: 3
            },
            crises: [
                "قطعی برق",
                "ترافیک",
                "بحران خدمات شهری",
                "افزایش قیمت مسکن"
            ]
        },

        "بارانی": {
            traits: {
                economy: 2,
                stability: 1
            },
            crises: [
                "سیلاب",
                "بارش شدید",
                "اختلال حمل‌ونقل",
                "آسیب زیرساختی"
            ]
        },

        "صنعتی": {
            traits: {
                economy: 6,
                electricity: -2,
                mediaPressure: 2
            },
            crises: [
                "اعتصاب صنعتی",
                "کمبود انرژی",
                "اختلال زنجیره تأمین",
                "آلودگی"
            ]
        },

        "کشاورزی": {
            traits: {
                economy: 3,
                stability: 2
            },
            crises: [
                "خشکسالی",
                "آفت کشاورزی",
                "افت محصول",
                "افزایش قیمت مواد غذایی"
            ]
        },

        "بیابانی": {
            traits: {
                economy: -1,
                electricity: -3
            },
            crises: [
                "طوفان شن",
                "کمبود آب",
                "موج گرما",
                "افت منابع"
            ]
        },

        "گرم و مرطوب": {
            traits: {
                electricity: -2,
                stability: -1
            },
            crises: [
                "موج گرما",
                "سیلاب",
                "فشار شبکه برق",
                "اختلال کشاورزی"
            ]
        },

        "جنگلی": {
            traits: {
                economy: 2,
                climatePressure: -2
            },
            crises: [
                "آتش‌سوزی جنگلی",
                "بارش شدید",
                "اختلال جاده‌ای",
                "بحران زیست‌محیطی"
            ]
        },

        "گرمسیری": {
            traits: {
                economy: 2,
                climatePressure: 2
            },
            crises: [
                "طوفان",
                "بارندگی شدید",
                "موج گرما",
                "آسیب کشاورزی"
            ]
        },

        "سردسیر": {
            traits: {
                electricity: -4,
                economy: -1
            },
            crises: [
                "بوران",
                "یخبندان",
                "افزایش مصرف انرژی",
                "اختلال حمل‌ونقل"
            ]
        },

        "خشک": {
            traits: {
                electricity: -2,
                stability: -1
            },
            crises: [
                "خشکسالی",
                "موج گرما",
                "آتش‌سوزی",
                "کمبود آب"
            ]
        },

        "رودخانه‌ای": {
            traits: {
                economy: 3,
                stability: 1
            },
            crises: [
                "سیلاب",
                "آلودگی آب",
                "اختلال حمل‌ونقل",
                "آسیب زیرساخت"
            ]
        }
    };

    /* =====================================================
       COUNTRY SELECT FIX
       ===================================================== */

    function populateCountrySelect() {

        const select = $("countrySelect");

        if (!select) {
            console.warn(
                "[Republic] countrySelect not found."
            );
            return;
        }

        const previousValue = select.value;

        select.innerHTML = "";

        const placeholder = document.createElement("option");

        placeholder.value = "";
        placeholder.textContent = "🌍 انتخاب کشور...";

        select.appendChild(placeholder);

        COUNTRIES.forEach(country => {

            const option = document.createElement("option");

            option.value = country.code;

            option.textContent =
                `${country.flag} ${country.name}`;

            option.dataset.region = country.region;

            select.appendChild(option);
        });

        if (
            previousValue &&
            COUNTRIES.some(c => c.code === previousValue)
        ) {
            select.value = previousValue;
        }

        updateGeographySelect();

        console.log(
            `[Republic] ${COUNTRIES.length} countries loaded.`
        );
    }

    function updateGeographySelect() {

        const countrySelect = $("countrySelect");
        const geographySelect = $("geographySelect");

        if (!countrySelect || !geographySelect) {
            return;
        }

        const country = COUNTRIES.find(
            c => c.code === countrySelect.value
        );

        geographySelect.innerHTML = "";

        if (!country) {

            const placeholder =
                document.createElement("option");

            placeholder.value = "";
            placeholder.textContent =
                "🗺️ ابتدا کشور را انتخاب کنید...";

            geographySelect.appendChild(placeholder);

            geographySelect.disabled = true;

            return;
        }

        geographySelect.disabled = false;

        const placeholder =
            document.createElement("option");

        placeholder.value = "";
        placeholder.textContent =
            "🗺️ انتخاب شرایط جغرافیایی...";

        geographySelect.appendChild(placeholder);

        country.geography.forEach(geo => {

            const option =
                document.createElement("option");

            option.value = geo;

            option.textContent = geo;

            geographySelect.appendChild(option);
        });
    }

    /* =====================================================
       GAME STATE
    ===================================================== */

    function createGameState() {

        return {

            roomCode: roomCode,

            hostId: playerId,

            stateRevision: 0,

            started: false,

            gameOver: false,

            turn: 0,

            maxTurns: MAX_TURNS,

            currentPlayerIndex: 0,

            players: [],

            countries: {},

            currentEvent: null,

            history: [],

            news: [],

            activeCrises: [],

            relations: {},

            lastConsequence: null,

            world: {

                tension: 10,

                economy: 60,

                climatePressure: 20,

                mediaHeat: 15,

                stability: 70
            }
        };
    }

    function createCountry({
        code,
        name,
        flag,
        geography,
        playerId,
        playerName,
        playerNumber
    }) {

        const geo =
            GEOGRAPHY[geography] || {
                traits: {},
                crises: []
            };

        const traits = geo.traits || {};

        return {

            code,
            name,
            flag,
            geography,

            playerId,
            playerName,
            playerNumber,

            money: 1000,

            electricity: clamp(
                70 + number(traits.electricity, 0)
            ),

            economy: clamp(
                65 + number(traits.economy, 0)
            ),

            popularity: 70,

            security: clamp(
                65 + number(traits.security, 0)
            ),

            stability: clamp(
                70 + number(traits.stability, 0)
            ),

            diplomacy: clamp(
                50 + number(traits.diplomacy, 0)
            ),

            sanctions: 0,

            mediaPressure: clamp(
                10 + number(traits.mediaPressure, 0)
            ),

            relations: {},

            activeCrises: [],

            status: "stable",

            alive: true,

            online: true,

            history: []
        };
    }

    /* =====================================================
       STATE NORMALIZATION
    ===================================================== */

    function normalizeState(state) {

        if (!state || typeof state !== "object") {
            return createGameState();
        }

        state.players =
            Array.isArray(state.players)
                ? state.players
                : [];

        state.countries =
            state.countries &&
            typeof state.countries === "object"
                ? state.countries
                : {};

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
            state.relations &&
            typeof state.relations === "object"
                ? state.relations
                : {};

        state.world =
            state.world &&
            typeof state.world === "object"
                ? state.world
                : {};

        state.world.tension =
            number(state.world.tension, 10);

        state.world.economy =
            number(state.world.economy, 60);

        state.world.climatePressure =
            number(state.world.climatePressure, 20);

        state.world.mediaHeat =
            number(state.world.mediaHeat, 15);

        state.world.stability =
            number(state.world.stability, 70);

        state.turn =
            number(state.turn, 0);

        state.maxTurns =
            number(state.maxTurns, MAX_TURNS);

        state.currentPlayerIndex =
            number(state.currentPlayerIndex, 0);

        state.stateRevision =
            number(state.stateRevision, 0);

        return state;
    }

    /* =====================================================
       RELATIONS
    ===================================================== */

    function createRelations() {

        if (!gameState) return;

        gameState.relations = {};

        const codes =
            Object.keys(gameState.countries);

        codes.forEach(a => {

            gameState.relations[a] = {};

            codes.forEach(b => {

                if (a === b) return;

                gameState.relations[a][b] = {

                    score: 50,

                    trade: 50,

                    diplomatic: 50,

                    tension: 10,

                    sanctions: 0
                };
            });
        });
    }

    function getRelation(countryA, countryB) {

        if (!gameState) return null;

        if (!countryA || !countryB) return null;

        if (!gameState.relations[countryA]) {
            gameState.relations[countryA] = {};
        }

        if (!gameState.relations[countryA][countryB]) {

            gameState.relations[countryA][countryB] = {

                score: 50,

                trade: 50,

                diplomatic: 50,

                tension: 10,

                sanctions: 0
            };
        }

        return gameState.relations[countryA][countryB];
    }

    function changeRelation(
        countryA,
        countryB,
        amount
    ) {

        if (!countryA || !countryB) return;

        const relation =
            getRelation(countryA, countryB);

        if (!relation) return;

        relation.score = clamp(
            relation.score + number(amount, 0),
            -100,
            100
        );

        relation.diplomatic =
            clamp(relation.score);

        relation.tension =
            clamp(100 - relation.score);
    }

    /* =====================================================
       PLAYER HELPERS
    ===================================================== */

    function getPlayerById(id) {

        if (!gameState) return null;

        return gameState.players.find(
            player => player.id === id
        ) || null;
    }

    function getCurrentPlayer() {

        if (!gameState) return null;

        if (!gameState.players.length) {
            return null;
        }

        const index =
            clamp(
                gameState.currentPlayerIndex,
                0,
                gameState.players.length - 1
            );

        return gameState.players[index] || null;
    }

    function getCurrentCountry() {

        const player =
            getCurrentPlayer();

        if (!player) return null;

        return gameState.countries[player.countryCode]
            || null;
    }

    function getMyPlayer() {

        return getPlayerById(playerId);
    }

    function getMyCountry() {

        const player = getMyPlayer();

        if (!player) return null;

        return gameState.countries[player.countryCode]
            || null;
    }

    /* =====================================================
       SUPABASE INITIALIZATION
    ===================================================== */

    function initSupabase() {

        try {

            if (
                !window.supabase ||
                typeof window.supabase.createClient !== "function"
            ) {
                console.error(
                    "[Republic] Supabase library not loaded."
                );

                toast(
                    "اتصال Supabase برقرار نشد.",
                    "error"
                );

                return false;
            }

            supabase =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            return true;

        } catch (error) {

            console.error(
                "[Republic] Supabase init error:",
                error
            );

            toast(
                "خطا در راه‌اندازی شبکه.",
                "error"
            );

            return false;
        }
    }

    /* =====================================================
       CHANNEL SETUP
    ===================================================== */

    function createChannel(code) {

        if (!supabase) {

            if (!initSupabase()) {
                return null;
            }
        }

        if (channel) {

            try {
                supabase.removeChannel(channel);
            } catch {}

            channel = null;
        }

        channel =
            supabase.channel(
                `republic-room-${code}`,
                {
                    config: {

                        presence: {
                            key: playerId
                        },

                        broadcast: {
                            self: false
                        }
                    }
                }
            );

        registerChannelEvents();

        return channel;
    }

    function registerChannelEvents() {

        if (!channel) return;

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
                event: "room_ping"
            },
            payload => {

                if (!payload?.payload) return;

                setConnectionStatus(true);
            }
        );

        channel.on(
            "presence",
            {
                event: "sync"
            },
            () => {

                updatePresencePlayers();
            }
        );

        channel.on(
            "presence",
            {
                event: "join"
            },
            () => {

                updatePresencePlayers();
            }
        );

        channel.on(
            "presence",
            {
                event: "leave"
            },
            () => {

                updatePresencePlayers();
            }
        );
    }

    /* =====================================================
       SUBSCRIBE CHANNEL
    ===================================================== */

    async function subscribeChannel() {

        if (!channel) return false;

        return new Promise(resolve => {

            let finished = false;

            const done = value => {

                if (finished) return;

                finished = true;

                resolve(value);
            };

            channel.subscribe(async status => {

                console.log(
                    "[Republic] channel status:",
                    status
                );

                if (status === "SUBSCRIBED") {

                    setConnectionStatus(true);

                    try {

                        await channel.track({

                            playerId,

                            onlineAt:
                                new Date().toISOString()
                        });

                    } catch (error) {

                        console.warn(
                            "Presence track failed:",
                            error
                        );
                    }

                    done(true);

                } else if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT"
                ) {

                    setConnectionStatus(false);

                    done(false);
                }
            });
        });
    }

    /* =====================================================
       PRESENCE
    ===================================================== */

    function updatePresencePlayers() {

        if (!channel || !gameState) return;

        try {

            const state =
                channel.presenceState();

            const onlineIds =
                new Set();

            Object.values(state || {}).forEach(entries => {

                if (!Array.isArray(entries)) return;

                entries.forEach(entry => {

                    if (entry?.playerId) {
                        onlineIds.add(entry.playerId);
                    }
                });
            });

            gameState.players.forEach(player => {

                player.online =
                    onlineIds.has(player.id);
            });

            renderPlayers();

        } catch (error) {

            console.warn(
                "[Republic] presence error:",
                error
            );
        }
    }

    function setConnectionStatus(online) {

        const el =
            $("connectionStatus");

        if (!el) return;

        if (online) {

            el.textContent = "● آنلاین";

            el.classList.add("online");
            el.classList.remove("offline");

        } else {

            el.textContent = "● آفلاین";

            el.classList.remove("online");
            el.classList.add("offline");
        }
    }

    /* =====================================================
       BROADCAST
    ===================================================== */

    async function broadcast(event, payload) {

        if (!channel) return false;

        try {

            await channel.send({
                type: "broadcast",
                event,
                payload
            });

            return true;

        } catch (error) {

            console.error(
                "[Republic] broadcast error:",
                error
            );

            return false;
        }
    }

    async function broadcastState() {

        if (!isHost || !gameState) return;

        gameState.stateRevision =
            number(gameState.stateRevision, 0) + 1;

        stateRevision =
            gameState.stateRevision;

        localRevision =
            gameState.stateRevision;

        await broadcast(
            "game_state",
            {
                state: clone(gameState)
            }
        );

        renderAll();
    }

    /* =====================================================
       CREATE ROOM
    ===================================================== */

    async function createRoom() {

        const leaderName =
            $("leaderName")?.value.trim();

        const countryCode =
            $("countrySelect")?.value;

        const geography =
            $("geographySelect")?.value;

        if (!leaderName) {

            toast(
                "نام رئیس را وارد کن.",
                "error"
            );

            return;
        }

        if (!countryCode) {

            toast(
                "ابتدا یک کشور انتخاب کن.",
                "error"
            );

            return;
        }

        if (!geography) {

            toast(
                "شرایط جغرافیایی را انتخاب کن.",
                "error"
            );

            return;
        }

        const country =
            COUNTRIES.find(
                c => c.code === countryCode
            );

        if (!country) {

            toast(
                "کشور انتخاب‌شده معتبر نیست.",
                "error"
            );

            return;
        }

        roomCode =
            generateRoomCode();

        playerNumber = 1;

        isHost = true;
        joined = true;

        gameStarted = false;
        gameOver = false;

        gameState =
            createGameState();

        gameState.players.push({

            id: playerId,

            number: 1,

            name: leaderName,

            countryCode: country.code,

            countryName: country.name,

            flag: country.flag,

            geography,

            isHost: true,

            online: true,

            ready: true
        });

        gameState.countries[country.code] =
            createCountry({

                code: country.code,

                name: country.name,

                flag: country.flag,

                geography,

                playerId,

                playerName: leaderName,

                playerNumber: 1
            });

        createRelations();

        const newChannel =
            createChannel(roomCode);

        if (!newChannel) {

            toast(
                "اتصال به سرور ممکن نشد.",
                "error"
            );

            return;
        }

        setScreen("lobbyScreen");

        const subscribed =
            await subscribeChannel();

        if (!subscribed) {

            toast(
                "اتصال به اتاق ناموفق بود.",
                "error"
            );

            return;
        }

        await broadcastState();

        renderLobby();

        toast(
            `اتاق ${roomCode} ساخته شد.`,
            "success"
        );
    }

    /* =====================================================
       ROOM CODE
    ===================================================== */

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

    /* =====================================================
       JOIN ROOM
    ===================================================== */

    async function joinRoom() {

        const code =
            $("roomCodeInput")?.value
                .trim()
                .toUpperCase();

        if (!code) {

            toast(
                "کد اتاق را وارد کن.",
                "error"
            );

            return;
        }

        const leaderName =
            $("leaderName")?.value.trim();

        /*
         * Join screen currently does not contain
         * country selectors.
         *
         * We therefore open setup first so the joining
         * player can choose their country.
         */

        if (!leaderName) {

            toast(
                "ابتدا نام رئیس را وارد کن.",
                "error"
            );

            setScreen("setupScreen");

            return;
        }

        const countryCode =
            $("countrySelect")?.value;

        const geography =
            $("geographySelect")?.value;

        if (!countryCode) {

            toast(
                "برای ورود باید کشور خودت را انتخاب کنی.",
                "error"
            );

            setScreen("setupScreen");

            return;
        }

        if (!geography) {

            toast(
                "شرایط جغرافیایی را انتخاب کن.",
                "error"
            );

            setScreen("setupScreen");

            return;
        }

        roomCode = code;

        isHost = false;
        joined = true;
        gameStarted = false;
        gameOver = false;

        const country =
            COUNTRIES.find(
                c => c.code === countryCode
            );

        if (!country) {

            toast(
                "کشور انتخاب‌شده معتبر نیست.",
                "error"
            );

            return;
        }

        const newChannel =
            createChannel(roomCode);

        if (!newChannel) {

            toast(
                "اتصال به سرور ممکن نشد.",
                "error"
            );

            return;
        }

        setScreen("lobbyScreen");

        const subscribed =
            await subscribeChannel();

        if (!subscribed) {

            toast(
                "اتصال به اتاق ناموفق بود.",
                "error"
            );

            return;
        }

        await broadcast(
            "room_join_request",
            {

                requestId: uid("join"),

                player: {

                    id: playerId,

                    name: leaderName,

                    countryCode:
                        country.code,

                    countryName:
                        country.name,

                    flag:
                        country.flag,

                    geography
                }
            }
        );

        setText(
            "lobbyStatus",
            "درخواست ورود ارسال شد..."
        );
    }

    /* =====================================================
       HOST JOIN REQUEST
    ===================================================== */

    async function handleJoinRequest(data) {

        if (!isHost || !gameState) return;

        const request =
            data?.player;

        if (!request) return;

        const requestId =
            data?.requestId;

        if (gameState.players.length >= MAX_PLAYERS) {

            await broadcast(
                "room_join_response",
                {

                    requestId,

                    accepted: false,

                    playerId: request.id,

                    reason:
                        "ظرفیت اتاق تکمیل است."
                }
            );

            return;
        }

        const existingPlayer =
            gameState.players.find(
                p => p.id === request.id
            );

        if (existingPlayer) {

            await broadcast(
                "room_join_response",
                {

                    requestId,

                    accepted: true,

                    playerId: request.id,

                    state: clone(gameState)
                }
            );

            return;
        }

        const countryAlreadyTaken =
            gameState.players.some(
                p =>
                    p.countryCode ===
                    request.countryCode
            );

        if (countryAlreadyTaken) {

            await broadcast(
                "room_join_response",
                {

                    requestId,

                    accepted: false,

                    playerId: request.id,

                    reason:
                        "این کشور قبلاً توسط بازیکن دیگری انتخاب شده است."
                }
            );

            return;
        }

        const country =
            COUNTRIES.find(
                c => c.code === request.countryCode
            );

        if (!country) {

            await broadcast(
                "room_join_response",
                {

                    requestId,

                    accepted: false,

                    playerId: request.id,

                    reason:
                        "کشور انتخاب‌شده معتبر نیست."
                }
            );

            return;
        }

        const newNumber =
            gameState.players.length + 1;

        const player = {

            id: request.id,

            number: newNumber,

            name:
                request.name ||
                `رئیس ${newNumber}`,

            countryCode:
                country.code,

            countryName:
                country.name,

            flag:
                country.flag,

            geography:
                request.geography,

            isHost: false,

            online: true,

            ready: true
        };

        gameState.players.push(player);

        gameState.countries[country.code] =
            createCountry({

                code: country.code,

                name: country.name,

                flag: country.flag,

                geography:
                    request.geography,

                playerId:
                    request.id,

                playerName:
                    player.name,

                playerNumber:
                    newNumber
            });

        createRelations();

        await broadcast(
            "room_join_response",
            {

                requestId,

                accepted: true,

                playerId:
                    request.id,

                playerNumber:
                    newNumber,

                state:
                    clone(gameState)
            }
        );

        await broadcastState();

        renderLobby();

        toast(
            `${player.name} وارد جمهوری شد.`,
            "success"
        );
    }

    /* =====================================================
       JOIN RESPONSE
    ===================================================== */

    function handleJoinResponse(data) {

        if (!data) return;

        if (
            data.playerId &&
            data.playerId !== playerId
        ) {
            return;
        }

        if (!data.accepted) {

            toast(
                data.reason ||
                "ورود به اتاق رد شد.",
                "error"
            );

            joined = false;

            return;
        }

        if (data.state) {

            gameState =
                normalizeState(
                    clone(data.state)
                );

            stateRevision =
                number(
                    gameState.stateRevision,
                    0
                );

            localRevision =
                stateRevision;

            const me =
                getMyPlayer();

            if (me) {

                playerNumber =
                    me.number;
            }

            renderAll();

            if (gameState.started) {

                gameStarted = true;

                setScreen("gameScreen");

            } else {

                setScreen("lobbyScreen");
            }

            toast(
                "با موفقیت وارد جمهوری شدی.",
                "success"
            );
        }
    }

    /* =====================================================
       RECEIVE GAME STATE
    ===================================================== */

    function handleGameState(data) {

        if (!data?.state) return;

        const incoming =
            normalizeState(
                clone(data.state)
            );

        const incomingRevision =
            number(
                incoming.stateRevision,
                0
            );

        if (
            incomingRevision <
            stateRevision
        ) {
            return;
        }

        stateRevision =
            incomingRevision;

        localRevision =
            incomingRevision;

        gameState =
            incoming;

        gameStarted =
            !!gameState.started;

        gameOver =
            !!gameState.gameOver;

        const me =
            getMyPlayer();

        if (me) {
            playerNumber = me.number;
        }

        renderAll();

        if (gameOver) {

            setScreen("endScreen");

            renderRanking();

        } else if (gameStarted) {

            setScreen("gameScreen");

        } else if (joined) {

            setScreen("lobbyScreen");
        }
    }

    /* =====================================================
       SCREEN MANAGEMENT
    ===================================================== */

    function setScreen(screenId) {

        const screens =
            document.querySelectorAll(".screen");

        screens.forEach(screen => {

            screen.classList.remove("active");

            screen.style.display = "none";
        });

        const target =
            $(screenId);

        if (!target) return;

        target.classList.add("active");

        target.style.display = "flex";
    }

    /* =====================================================
       LOBBY RENDER
    ===================================================== */

    function renderLobby() {

        if (!gameState) return;

        setText(
            "roomCodeDisplay",
            roomCode ||
            gameState.roomCode ||
            "------"
        );

        setText(
            "playerCount",
            `${gameState.players.length} / ${MAX_PLAYERS}`
        );

        renderPlayers();

        const status =
            $("lobbyStatus");

        if (!status) return;

        if (gameState.started) {

            status.textContent =
                "بازی شروع شده است.";

        } else if (
            gameState.players.length === 1
        ) {

            status.textContent =
                "در انتظار بازیکنان دیگر...";

        } else {

            status.textContent =
                `${gameState.players.length} رئیس آماده‌اند.`;
        }

        const startButton =
            $("startGameBtn");

        if (startButton) {

            startButton.style.display =
                isHost &&
                !gameState.started
                    ? ""
                    : "none";
        }
    }

    function renderPlayers() {

        const list =
            $("playersList");

        if (!list || !gameState) return;

        list.innerHTML = "";

        gameState.players.forEach(player => {

            const country =
                gameState.countries[
                    player.countryCode
                ];

            const item =
                document.createElement("div");

            item.className =
                "player-row";

            item.innerHTML = `

                <div class="player-avatar">
                    ${escapeHTML(
                        player.flag || "🌍"
                    )}
                </div>

                <div class="player-info">

                    <strong>
                        ${escapeHTML(
                            player.name
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            player.countryName ||
                            country?.name ||
                            "کشور نامشخص"
                        )}
                    </span>

                </div>

                <div class="player-status ${
                    player.online
                        ? "online"
                        : "offline"
                }">

                    <span></span>

                    ${
                        player.isHost
                            ? "میزبان"
                            : "متصل"
                    }

                </div>
            `;

            list.appendChild(item);
        });
    }

    /* =====================================================
       START GAME
    ===================================================== */

    async function startGame() {

        if (!isHost) {

            toast(
                "فقط میزبان می‌تواند بازی را شروع کند.",
                "error"
            );

            return;
        }

        if (!gameState) return;

        if (gameState.players.length < 1) {

            toast(
                "حداقل یک بازیکن لازم است.",
                "error"
            );

            return;
        }

        if (gameState.started) return;

        gameState.started = true;
        gameState.gameOver = false;

        gameState.turn = 1;

        gameState.currentPlayerIndex = 0;

        gameStarted = true;
        gameOver = false;

        gameState.history.push({

            type: "system",

            text:
                "جمهوری رسماً آغاز شد.",

            turn: 1,

            time:
                Date.now()
        });

        await broadcastState();

        setScreen("gameScreen");

        renderAll();

        await sleep(700);

        if (isHost) {

            await nextAIEvent();
        }
    }

    /* =====================================================
       AI EVENT
    ===================================================== */

    async function nextAIEvent() {

        if (!isHost) return;

        if (!gameState) return;

        if (gameState.gameOver) return;

        if (generatingEvent) return;

        generatingEvent = true;

        showAIThinking(
            "AI Director در حال بررسی وضعیت جهان..."
        );

        try {

            const currentPlayer =
                getCurrentPlayer();

            const currentCountry =
                getCurrentCountry();

            if (
                !currentPlayer ||
                !currentCountry
            ) {
                return;
            }

            let event = null;

            if (
                typeof window.generateAIEvent ===
                "function"
            ) {

                try {

                    event =
                        await window.generateAIEvent(
                            gameState,
                            gameState.history
                        );

                } catch (error) {

                    console.warn(
                        "[Republic] AI event failed:",
                        error
                    );
                }
            }

            event =
                normalizeAIEvent(
                    event,
                    currentPlayer,
                    currentCountry
                );

            gameState.currentEvent = event;

            currentEvent = event;

            gameState.history.push({

                type: "event",

                turn:
                    gameState.turn,

                eventId:
                    event.id,

                title:
                    event.title,

                text:
                    event.description,

                countryCode:
                    currentCountry.code,

                time:
                    Date.now()
            });

            await broadcastState();

            hideAIThinking();

            renderEvent();

        } catch (error) {

            console.error(
                "[Republic] nextAIEvent error:",
                error
            );

            hideAIThinking();

            toast(
                "تولید رویداد با مشکل مواجه شد.",
                "error"
            );

        } finally {

            generatingEvent = false;
        }
    }

    /* =====================================================
       NORMALIZE AI EVENT
    ===================================================== */

    function normalizeAIEvent(
        event,
        player,
        country
    ) {

        const fallbackChoices = [

            {
                id: "choice_1",

                title:
                    "تشکیل جلسه اضطراری",

                description:
                    "مقامات را جمع کن و فعلاً وانمود کن اوضاع تحت کنترل است.",

                effects: {
                    stability: 2,
                    popularity: 1,
                    money: -40
                }
            },

            {
                id: "choice_2",

                title:
                    "اقدام فوری",

                description:
                    "بدون اتلاف وقت یک تصمیم سریع بگیر.",

                effects: {
                    economy: 2,
                    stability: -2,
                    money: -70
                }
            },

            {
                id: "choice_3",

                title:
                    "نادیده گرفتن بحران",

                description:
                    "شاید اگر به آن نگاه نکنی، خودش حل شود.",

                effects: {
                    popularity: -3,
                    stability: -4
                }
            }
        ];

        if (!event || typeof event !== "object") {

            return {

                id: uid("event"),

                title:
                    "یک روز کاملاً عادی در جمهوری",

                description:
                    `${country.name} با یک مشکل عجیب اما قابل مدیریت روبه‌رو شده است.`,

                type:
                    "بحران ملی",

                category:
                    "politics",

                severity:
                    "medium",

                targetPlayerId:
                    player.id,

                actorPlayerId:
                    player.id,

                news:
                    "مقامات هنوز نمی‌دانند دقیقاً چه اتفاقی افتاده است.",

                choices:
                    fallbackChoices
            };
        }

        let choices =
            Array.isArray(event.choices)
                ? event.choices
                : [];

        choices =
            choices.slice(0, 3);

        while (choices.length < 3) {

            choices.push(
                fallbackChoices[
                    choices.length
                ]
            );
        }

        choices =
            choices.map((choice, index) => {

                const fallback =
                    fallbackChoices[index];

                return {

                    id:
                        choice?.id ||
                        `choice_${index + 1}`,

                    title:
                        String(
                            choice?.title ||
                            fallback.title
                        ),

                    description:
                        String(
                            choice?.description ||
                            fallback.description
                        ),

                    effects:
                        normalizeEffects(
                            choice?.effects ||
                            fallback.effects
                        ),

                    targetPlayerId:
                        choice?.targetPlayerId ||
                        null
                };
            });

        return {

            id:
                event.id ||
                uid("event"),

            title:
                String(
                    event.title ||
                    "بحران جدید"
                ),

            description:
                String(
                    event.description ||
                    "یک اتفاق غیرمنتظره در جمهوری رخ داده است."
                ),

            type:
                String(
                    event.type ||
                    "بحران ملی"
                ),

            category:
                String(
                    event.category ||
                    "politics"
                ),

            severity:
                String(
                    event.severity ||
                    "medium"
                ),

            targetPlayerId:
                event.targetPlayerId ||
                player.id,

            actorPlayerId:
                event.actorPlayerId ||
                null,

            news:
                String(
                    event.news ||
                    ""
                ),

            choices
        };
    }

    /* =====================================================
       EFFECT NORMALIZATION
    ===================================================== */

    function normalizeEffects(effects) {

        if (!effects || typeof effects !== "object") {
            return {};
        }

        const result = {};

        const numericKeys = [

            "money",
            "electricity",
            "economy",
            "popularity",
            "security",
            "stability",
            "sanctions",
            "mediaPressure",
            "tension",
            "climatePressure"
        ];

        numericKeys.forEach(key => {

            if (
                effects[key] !== undefined &&
                effects[key] !== null
            ) {

                result[key] =
                    number(
                        effects[key],
                        0
                    );
            }
        });

        if (effects.crisis) {

            result.crisis =
                String(
                    effects.crisis
                );
        }

        if (effects.resolveCrisis) {

            result.resolveCrisis =
                String(
                    effects.resolveCrisis
                );
        }

        if (
            effects.relations &&
            typeof effects.relations === "object"
        ) {

            result.relations =
                clone(
                    effects.relations
                );
        }

        if (
            effects.diplomacy !== undefined
        ) {

            result.diplomacy =
                number(
                    effects.diplomacy
                );
        }

        return result;
    }

    /* =====================================================
       AI THINKING UI
    ===================================================== */

    function showAIThinking(text) {

        const overlay =
            $("aiThinking");

        if (!overlay) return;

        setText(
            "aiThinkingText",
            text ||
            "هوش مصنوعی در حال بررسی سرنوشت جمهوری است..."
        );

        overlay.classList.remove("hidden");

        overlay.style.display = "flex";
    }

    function hideAIThinking() {

        const overlay =
            $("aiThinking");

        if (!overlay) return;

        overlay.classList.add("hidden");
    }

    /* =====================================================
       EVENT RENDER
    ===================================================== */

    function renderEvent() {

        if (!gameState) return;

        const event =
            gameState.currentEvent;

        if (!event) return;

        currentEvent = event;

        setText(
            "turnNumber",
            gameState.turn
        );

        const currentPlayer =
            getCurrentPlayer();

        const currentCountry =
            getCurrentCountry();

        setText(
            "currentPlayerName",
            currentPlayer?.name ||
            "---"
        );

        setText(
            "currentCountryName",
            currentCountry
                ? `${currentCountry.flag} ${currentCountry.name}`
                : "---"
        );

        setText(
            "eventType",
            event.type ||
            "بحران ملی"
        );

        setText(
            "eventTitle",
            event.title
        );

        setText(
            "eventDescription",
            event.description
        );

        const cards =
            document.querySelectorAll(
                "[data-decision-card]"
            );

        cards.forEach((card, index) => {

            const choice =
                event.choices?.[index];

            if (!choice) {

                card.style.display = "none";

                return;
            }

            card.style.display = "";

            const title =
                card.querySelector(
                    "[data-choice-title]"
                );

            const description =
                card.querySelector(
                    "[data-choice-description]"
                );

            if (title) {

                title.textContent =
                    choice.title;
            }

            if (description) {

                description.textContent =
                    choice.description;
            }

            card.disabled =
                !isMyTurn();

            card.classList.toggle(
                "disabled",
                !isMyTurn()
            );
        });

        setText(
            "turnStatus",
            isMyTurn()
                ? "نوبت توست — یک تصمیم انتخاب کن"
                : `نوبت ${currentPlayer?.name || "بازیکن دیگر"} است`
        );

        renderDashboard();
        renderNews();
        renderPlayers();
    }

    function isMyTurn() {

        const current =
            getCurrentPlayer();

        return !!(
            current &&
            current.id === playerId
        );
    }

    /* =====================================================
       DISABLE DECISION CARDS
    ===================================================== */

    function disableCards(disabled = true) {

        const cards =
            document.querySelectorAll(
                "[data-decision-card]"
            );

        cards.forEach(card => {

            card.disabled = disabled;

            card.classList.toggle(
                "disabled",
                disabled
            );
        });
    }

    /* =====================================================
       CHOICE CLICK
    ===================================================== */

    async function chooseDecision(index) {

        if (!gameState) return;

        if (processingChoice) return;

        if (!isMyTurn()) {

            toast(
                "الان نوبت تو نیست.",
                "error"
            );

            return;
        }

        const event =
            gameState.currentEvent;

        if (!event) return;

        const choice =
            event.choices?.[index];

        if (!choice) return;

        const choiceKey =
            `${gameState.turn}:${playerId}:${event.id}:${index}`;

        if (processedChoices.has(choiceKey)) {
            return;
        }

        processedChoices.add(choiceKey);

        processingChoice = true;

        disableCards(true);

        showAIThinking(
            "AI Director در حال پیش‌بینی پیامد تصمیم..."
        );

        if (isHost) {

            await processChoice({

                playerId,

                choiceIndex: index,

                eventId:
                    event.id
            });

        } else {

            await broadcast(
                "player_choice",
                {

                    playerId,

                    choiceIndex: index,

                    eventId:
                        event.id,

                    turn:
                        gameState.turn
                }
            );
        }
    }

    /* =====================================================
       PLAYER CHOICE RECEIVER
    ===================================================== */

    async function handlePlayerChoice(data) {

        if (!isHost || !gameState) return;

        if (!data) return;

        if (
            data.turn !==
            gameState.turn
        ) {
            return;
        }

        const current =
            getCurrentPlayer();

        if (!current) return;

        if (
            data.playerId !==
            current.id
        ) {
            return;
        }

        if (
            !gameState.currentEvent ||
            data.eventId !==
            gameState.currentEvent.id
        ) {
            return;
        }

        await processChoice(data);
    }

    /* =====================================================
       PROCESS CHOICE
    ===================================================== */

    async function processChoice(data) {

        if (!isHost) return;

        if (hostProcessingChoice) return;

        if (!gameState) return;

        hostProcessingChoice = true;

        try {

            const player =
                getPlayerById(
                    data.playerId
                );

            if (!player) return;

            const country =
                gameState.countries[
                    player.countryCode
                ];

            if (!country) return;

            const event =
                gameState.currentEvent;

            if (!event) return;

            const choice =
                event.choices?.[
                    Number(data.choiceIndex)
                ];

            if (!choice) return;

            showAIThinking(
                "تصمیم ثبت شد. پیامدها در حال محاسبه‌اند..."
            );

            const consequence =
                await getAIConsequence(
                    player,
                    country,
                    choice
                );

            const normalized =
                normalizeConsequence(
                    consequence,
                    choice
                );

            applyEffects(
                country,
                normalized.effects
            );

            applyRelations(
                country,
                normalized.relationChanges
            );

            processCrises(
                country
            );

            processWorldTick(
                normalized.effects
            );

            country.history.push({

                turn:
                    gameState.turn,

                event:
                    event.title,

                decision:
                    choice.title,

                consequence:
                    normalized.story,

                time:
                    Date.now()
            });

            gameState.lastConsequence =
                normalized;

            gameState.history.push({

                type: "decision",

                turn:
                    gameState.turn,

                playerId:
                    player.id,

                countryCode:
                    country.code,

                event:
                    event.title,

                decision:
                    choice.title,

                consequence:
                    normalized.story,

                time:
                    Date.now()
            });

            if (normalized.news) {

                addNews(
                    normalized.news
                );
            }

            if (normalized.addCrisis) {

                addCountryCrisis(
                    country,
                    normalized.addCrisis
                );
            }

            if (normalized.resolveCrisis) {

                resolveCountryCrisis(
                    country,
                    normalized.resolveCrisis
                );
            }

            await broadcastState();

            hideAIThinking();

            showConsequence(
                normalized
            );

            await sleep(4500);

            hideConsequence();

            if (
                checkEndCondition()
            ) {

                await endGame();

                return;
            }

            processWorldTick();

            rotateTurn();

            await broadcastState();

            await sleep(700);

            await nextAIEvent();

        } catch (error) {

            console.error(
                "[Republic] processChoice error:",
                error
            );

            hideAIThinking();

            toast(
                "در پردازش تصمیم مشکلی رخ داد.",
                "error"
            );

        } finally {

            processingChoice = false;
            hostProcessingChoice = false;
        }
    }
      /* =====================================================
       AI CONSEQUENCE
    ===================================================== */

    async function getAIConsequence(
        player,
        country,
        choice
    ) {

        let result = null;

        if (
            typeof window.generateAIConsequence ===
            "function"
        ) {

            try {

                result =
                    await window.generateAIConsequence(
                        gameState,
                        gameState.history,
                        {
                            player,
                            country,
                            choice
                        }
                    );

            } catch (error) {

                console.warn(
                    "[Republic] AI consequence failed:",
                    error
                );
            }
        }

        return result;
    }

    /* =====================================================
       NORMALIZE CONSEQUENCE
    ===================================================== */

    function normalizeConsequence(
        consequence,
        choice
    ) {

        const fallbackEffects =
            normalizeEffects(
                choice?.effects || {}
            );

        if (
            !consequence ||
            typeof consequence !== "object"
        ) {

            return {

                title:
                    "پیامد تصمیم",

                story:
                    "تصمیم شما اجرا شد و جمهوری وارد مرحله تازه‌ای شد.",

                npcQuote:
                    "جناب رئیس، فعلاً همه وانمود می‌کنند که برنامه‌ریزی شده بود.",

                newsHeadline:
                    "دولت تصمیم مهمی اتخاذ کرد",

                news:
                    "رسانه‌ها در حال بررسی پیامدهای تصمیم دولت هستند.",

                effects:
                    fallbackEffects,

                relationChanges: {},

                addCrisis: null,

                resolveCrisis: null,

                nextEventHint: ""
            };
        }

        return {

            title:
                String(
                    consequence.title ||
                    "پیامد تصمیم"
                ),

            story:
                String(
                    consequence.story ||
                    consequence.text ||
                    "تصمیم شما پیامدهای غیرمنتظره‌ای ایجاد کرد."
                ),

            npcQuote:
                String(
                    consequence.npcQuote ||
                    consequence.quote ||
                    "مقامات دولتی هنوز در حال تحلیل شرایط هستند."
                ),

            newsHeadline:
                String(
                    consequence.newsHeadline ||
                    consequence.headline ||
                    consequence.news?.headline ||
                    "تیتر فوری: دولت تصمیم تازه‌ای گرفت"
                ),

            news:
                typeof consequence.news === "string"
                    ? consequence.news
                    : String(
                        consequence.news?.text ||
                        consequence.newsText ||
                        "رسانه‌ها در حال واکنش به تصمیم دولت هستند."
                    ),

            effects:
                normalizeEffects(
                    consequence.effects ||
                    fallbackEffects
                ),

            relationChanges:
                consequence.relationChanges &&
                typeof consequence.relationChanges === "object"
                    ? consequence.relationChanges
                    : {},

            addCrisis:
                consequence.addCrisis ||
                null,

            resolveCrisis:
                consequence.resolveCrisis ||
                null,

            nextEventHint:
                String(
                    consequence.nextEventHint ||
                    ""
                )
        };
    }

    /* =====================================================
       APPLY EFFECTS
    ===================================================== */

    function applyEffects(country, effects) {

        if (!country || !effects) return;

        const numericStats = [

            "economy",
            "popularity",
            "security",
            "stability",
            "electricity",
            "diplomacy",
            "sanctions",
            "mediaPressure"
        ];

        numericStats.forEach(stat => {

            if (
                effects[stat] !== undefined
            ) {

                country[stat] =
                    clamp(
                        number(country[stat], 0) +
                        number(effects[stat], 0)
                    );
            }
        });

        if (
            effects.money !== undefined
        ) {

            country.money =
                Math.max(
                    0,
                    number(country.money, 0) +
                    number(effects.money, 0)
                );
        }

        if (
            effects.tension !== undefined
        ) {

            gameState.world.tension =
                clamp(
                    gameState.world.tension +
                    number(effects.tension, 0)
                );
        }

        if (
            effects.climatePressure !== undefined
        ) {

            gameState.world.climatePressure =
                clamp(
                    gameState.world.climatePressure +
                    number(
                        effects.climatePressure,
                        0
                    )
                );
        }

        if (
            effects.crisis
        ) {

            addCountryCrisis(
                country,
                effects.crisis
            );
        }

        if (
            effects.resolveCrisis
        ) {

            resolveCountryCrisis(
                country,
                effects.resolveCrisis
            );
        }

        if (
            effects.diplomacy !== undefined
        ) {

            country.diplomacy =
                clamp(
                    country.diplomacy +
                    number(
                        effects.diplomacy,
                        0
                    )
                );
        }
    }

    /* =====================================================
       RELATION EFFECTS
    ===================================================== */

    function applyRelations(
        country,
        relationChanges
    ) {

        if (
            !country ||
            !relationChanges ||
            typeof relationChanges !== "object"
        ) {
            return;
        }

        Object.entries(
            relationChanges
        ).forEach(([target, value]) => {

            let amount = 0;

            if (
                typeof value === "number"
            ) {

                amount = value;

            } else if (
                typeof value === "object"
            ) {

                amount =
                    number(
                        value.score ??
                        value.amount ??
                        0
                    );
            }

            if (!amount) return;

            changeRelation(
                country.code,
                target,
                amount
            );

            changeRelation(
                target,
                country.code,
                amount
            );
        });
    }

    /* =====================================================
       CRISIS SYSTEM
    ===================================================== */

    function addCountryCrisis(
        country,
        crisis
    ) {

        if (!country || !crisis) return;

        const name =
            typeof crisis === "string"
                ? crisis
                : crisis.name ||
                  crisis.title ||
                  "بحران ناشناخته";

        if (
            country.activeCrises.some(
                c =>
                    String(
                        c.name ||
                        c
                    ) === name
            )
        ) {
            return;
        }

        const crisisObject = {

            id:
                uid("crisis"),

            name,

            severity:
                "medium",

            turns:
                3,

            addedTurn:
                gameState.turn
        };

        country.activeCrises.push(
            crisisObject
        );

        gameState.activeCrises.push({

            countryCode:
                country.code,

            ...crisisObject
        });

        country.stability =
            clamp(
                country.stability - 2
            );

        country.mediaPressure =
            clamp(
                country.mediaPressure + 3
            );
    }

    function resolveCountryCrisis(
        country,
        crisisName
    ) {

        if (!country) return;

        const target =
            String(
                crisisName
            ).toLowerCase();

        country.activeCrises =
            country.activeCrises.filter(
                crisis => {

                    const name =
                        String(
                            crisis.name ||
                            crisis
                        );

                    return (
                        name.toLowerCase() !==
                        target
                    );
                }
            );

        gameState.activeCrises =
            gameState.activeCrises.filter(
                crisis => {

                    if (
                        crisis.countryCode !==
                        country.code
                    ) {
                        return true;
                    }

                    const name =
                        String(
                            crisis.name ||
                            crisis
                        );

                    return (
                        name.toLowerCase() !==
                        target
                    );
                }
            );

        country.stability =
            clamp(
                country.stability + 3
            );
    }

    function processCrises(country) {

        if (!country) return;

        const remaining = [];

        country.activeCrises.forEach(
            crisis => {

                const currentTurns =
                    number(
                        crisis.turns,
                        1
                    ) - 1;

                if (currentTurns <= 0) {

                    country.stability =
                        clamp(
                            country.stability - 1
                        );

                    return;
                }

                remaining.push({

                    ...crisis,

                    turns:
                        currentTurns
                });
            }
        );

        country.activeCrises =
            remaining;

        rebuildGlobalCrises();
    }

    function rebuildGlobalCrises() {

        if (!gameState) return;

        const all = [];

        Object.values(
            gameState.countries
        ).forEach(country => {

            if (
                !Array.isArray(
                    country.activeCrises
                )
            ) {
                return;
            }

            country.activeCrises.forEach(
                crisis => {

                    all.push({

                        countryCode:
                            country.code,

                        ...crisis
                    });
                }
            );
        });

        gameState.activeCrises = all;
    }

    /* =====================================================
       WORLD SIMULATION
    ===================================================== */

    function processWorldTick(extraEffects = {}) {

        if (!gameState) return;

        const world =
            gameState.world;

        world.tension =
            clamp(
                world.tension +
                number(
                    extraEffects.tension,
                    0
                ) +
                (
                    Math.random() > 0.75
                        ? 1
                        : 0
                )
            );

        world.climatePressure =
            clamp(
                world.climatePressure +
                number(
                    extraEffects.climatePressure,
                    0
                ) +
                (
                    Math.random() > 0.82
                        ? 1
                        : 0
                )
            );

        world.mediaHeat =
            clamp(
                world.mediaHeat +
                (
                    Math.random() > 0.65
                        ? 1
                        : -1
                )
            );

        const countries =
            Object.values(
                gameState.countries
            );

        if (countries.length) {

            const averageEconomy =
                countries.reduce(
                    (sum, country) =>
                        sum +
                        number(
                            country.economy,
                            0
                        ),
                    0
                ) / countries.length;

            world.economy =
                clamp(
                    Math.round(
                        averageEconomy
                    )
                );
        }

        world.stability =
            clamp(
                100 -
                Math.round(
                    world.tension * 0.35
                ) -
                Math.round(
                    world.climatePressure * 0.15
                )
            );

        countries.forEach(country => {

            if (
                world.climatePressure > 70 &&
                Math.random() > 0.7
            ) {

                country.stability =
                    clamp(
                        country.stability - 1
                    );

                country.mediaPressure =
                    clamp(
                        country.mediaPressure + 1
                    );
            }

            if (
                world.tension > 70 &&
                Math.random() > 0.75
            ) {

                country.security =
                    clamp(
                        country.security - 1
                    );

                country.diplomacy =
                    clamp(
                        country.diplomacy - 1
                    );
            }

            if (
                world.economy < 35 &&
                Math.random() > 0.65
            ) {

                country.economy =
                    clamp(
                        country.economy - 1
                    );

                country.popularity =
                    clamp(
                        country.popularity - 1
                    );
            }
        });
    }

    /* =====================================================
       TURN ROTATION
    ===================================================== */

    function rotateTurn() {

        if (!gameState) return;

        if (
            gameState.players.length === 0
        ) {
            return;
        }

        gameState.currentPlayerIndex++;

        if (
            gameState.currentPlayerIndex >=
            gameState.players.length
        ) {

            gameState.currentPlayerIndex = 0;

            gameState.turn++;
        }

        if (
            gameState.turn >
            MAX_TURNS
        ) {

            gameState.turn =
                MAX_TURNS;
        }

        gameState.currentEvent = null;

        currentEvent = null;

        processingChoice = false;

        hostProcessingChoice = false;

        processedChoices.clear();

        renderAll();
    }

    /* =====================================================
       END CONDITION
    ===================================================== */

    function checkEndCondition() {

        if (!gameState) return false;

        if (
            gameState.turn >=
            MAX_TURNS
        ) {
            return true;
        }

        const countries =
            Object.values(
                gameState.countries
            );

        if (!countries.length) {
            return false;
        }

        const functioning =
            countries.filter(
                country =>
                    country.alive !== false
            );

        return functioning.length === 0;
    }

    /* =====================================================
       END GAME
    ===================================================== */

    async function endGame() {

        if (!isHost) return;

        if (!gameState) return;

        if (gameState.gameOver) return;

        gameState.gameOver = true;

        gameStarted = false;
        gameOver = true;

        gameState.currentEvent = null;

        gameState.history.push({

            type: "system",

            text:
                "دوران جمهوری به پایان رسید.",

            turn:
                gameState.turn,

            time:
                Date.now()
        });

        await broadcastState();

        setScreen("endScreen");

        renderRanking();
    }

    /* =====================================================
       RANKING
    ===================================================== */

    function calculateScore(country) {

        if (!country) return 0;

        return Math.round(

            number(
                country.economy,
                0
            ) * 1.2 +

            number(
                country.popularity,
                0
            ) * 1.2 +

            number(
                country.stability,
                0
            ) +

            number(
                country.diplomacy,
                0
            ) +

            number(
                country.security,
                0
            ) -

            number(
                country.sanctions,
                0
            ) * 0.8 -

            number(
                country.mediaPressure,
                0
            ) * 0.2
        );
    }

    function getRanking() {

        if (!gameState) return [];

        return Object.values(
            gameState.countries
        )
            .map(country => ({

                ...country,

                score:
                    calculateScore(
                        country
                    )
            }))
            .sort(
                (a, b) =>
                    b.score - a.score
            );
    }

    function renderRanking() {

        const list =
            $("rankingList");

        if (!list || !gameState) return;

        list.innerHTML = "";

        const ranking =
            getRanking();

        ranking.forEach(
            (country, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "ranking-item";

                const medal =
                    index === 0
                        ? "👑"
                        : index === 1
                            ? "🥈"
                            : index === 2
                                ? "🥉"
                                : `${index + 1}`;

                item.innerHTML = `

                    <div class="ranking-position">
                        ${medal}
                    </div>

                    <div class="ranking-country">
                        <strong>
                            ${escapeHTML(
                                country.flag
                            )}
                            ${escapeHTML(
                                country.name
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                country.playerName ||
                                "رئیس ناشناس"
                            )}
                        </span>
                    </div>

                    <div class="ranking-score">
                        ${country.score}
                    </div>

                `;

                list.appendChild(item);
            }
        );
    }

    /* =====================================================
       CONSEQUENCE UI
    ===================================================== */

    function showConsequence(
        consequence
    ) {

        const overlay =
            $("consequenceOverlay");

        if (!overlay) return;

        setText(
            "consequenceTitle",
            consequence.title
        );

        setText(
            "consequenceText",
            consequence.story
        );

        setText(
            "npcQuote",
            consequence.npcQuote
        );

        setText(
            "newsHeadline",
            consequence.newsHeadline
        );

        overlay.classList.remove("hidden");

        overlay.style.display = "flex";
    }

    function hideConsequence() {

        const overlay =
            $("consequenceOverlay");

        if (!overlay) return;

        overlay.classList.add("hidden");
    }

    /* =====================================================
       NEWS SYSTEM
    ===================================================== */

    function addNews(
        news
    ) {

        if (!gameState || !news) return;

        const text =
            typeof news === "string"
                ? news
                : news.text ||
                  news.headline ||
                  "";

        if (!text) return;

        gameState.news.unshift({

            id:
                uid("news"),

            text,

            turn:
                gameState.turn,

            time:
                Date.now()
        });

        gameState.news =
            gameState.news.slice(
                0,
                30
            );
    }

    function renderNews() {

        const list =
            $("newsList");

        if (!list || !gameState) return;

        list.innerHTML = "";

        if (
            !gameState.news.length
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "empty-news";

            empty.textContent =
                "هنوز خبری منتشر نشده...";

            list.appendChild(empty);

            return;
        }

        gameState.news
            .slice(0, 8)
            .forEach(news => {

                const item =
                    document.createElement("div");

                item.className =
                    "news-item";

                item.innerHTML = `

                    <span class="news-turn">
                        نوبت ${escapeHTML(
                            news.turn
                        )}
                    </span>

                    <p>
                        ${escapeHTML(
                            news.text
                        )}
                    </p>

                `;

                list.appendChild(item);
            });
    }

    /* =====================================================
       DASHBOARD
    ===================================================== */

    function renderDashboard() {

        const country =
            getMyCountry();

        if (!country) return;

        updateStat(
            "popularity",
            country.popularity
        );

        updateStat(
            "economy",
            country.economy
        );

        updateStat(
            "stability",
            country.stability
        );

        updateStat(
            "diplomacy",
            country.diplomacy
        );

        updateStat(
            "money",
            country.money,
            false
        );

        updateStat(
            "energy",
            country.electricity,
            false
        );

        const crisisScore =
            Math.min(
                100,
                country.activeCrises.length *
                15 +
                Math.max(
                    0,
                    50 -
                    country.stability
                )
            );

        updateStat(
            "crisis",
            crisisScore
        );

        const world =
            gameState?.world;

        if (world) {

            setText(
                "globalTension",
                Math.round(
                    world.tension
                )
            );

            setText(
                "globalEconomy",
                Math.round(
                    world.economy
                )
            );

            setText(
                "climatePressure",
                Math.round(
                    world.climatePressure
                )
            );
        }
    }

    function updateStat(
        stat,
        value,
        percentage = true
    ) {

        const numeric =
            number(
                value,
                0
            );

        document
            .querySelectorAll(
                `[data-stat-value="${stat}"]`
            )
            .forEach(el => {

                el.textContent =
                    Math.round(
                        numeric
                    );
            });

        document
            .querySelectorAll(
                `[data-stat-bar="${stat}"]`
            )
            .forEach(el => {

                const percent =
                    percentage
                        ? clamp(
                            numeric
                        )
                        : clamp(
                            numeric / 10
                        );

                el.style.width =
                    `${percent}%`;
            });
    }

    /* =====================================================
       RENDER ALL
    ===================================================== */

    function renderAll() {

        if (!gameState) return;

        renderLobby();

        renderPlayers();

        renderDashboard();

        renderNews();

        if (
            gameState.started &&
            !gameState.gameOver
        ) {

            setText(
                "turnNumber",
                gameState.turn
            );

            const current =
                getCurrentPlayer();

            const country =
                getCurrentCountry();

            setText(
                "currentPlayerName",
                current?.name ||
                "---"
            );

            setText(
                "currentCountryName",
                country
                    ? `${country.flag} ${country.name}`
                    : "---"
            );

            if (
                gameState.currentEvent
            ) {

                renderEvent();

            } else {

                setText(
                    "turnStatus",
                    "در حال آماده‌سازی رویداد..."
                );
            }
        }

        if (gameState.gameOver) {

            renderRanking();
        }
    }

    /* =====================================================
       COUNTRY SELECT EVENTS
    ===================================================== */

    function setupCountrySelectors() {

        const countrySelect =
            $("countrySelect");

        const geographySelect =
            $("geographySelect");

        if (!countrySelect) return;

        /*
         * Important:
         * The HTML contains an empty select.
         * We populate it here.
         */

        populateCountrySelect();

        countrySelect.addEventListener(
            "change",
            () => {

                updateGeographySelect();

                const country =
                    COUNTRIES.find(
                        c =>
                            c.code ===
                            countrySelect.value
                    );

                if (country) {

                    console.log(
                        "[Republic] selected country:",
                        country.name
                    );

                    toast(
                        `${country.flag} ${country.name} انتخاب شد.`,
                        "success"
                    );
                }
            }
        );

        if (geographySelect) {

            geographySelect.addEventListener(
                "change",
                () => {

                    if (
                        geographySelect.value
                    ) {

                        console.log(
                            "[Republic] geography:",
                            geographySelect.value
                        );
                    }
                }
            );
        }
    }

    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    function setupButtons() {

        const createButton =
            $("createRoomBtn");

        if (createButton) {

            createButton.addEventListener(
                "click",
                () => {

                    setScreen(
                        "setupScreen"
                    );
                }
            );
        }

        const joinButton =
            $("joinRoomBtn");

        if (joinButton) {

            joinButton.addEventListener(
                "click",
                () => {

                    setScreen(
                        "setupScreen"
                    );

                    /*
                     * The current HTML has only one
                     * setup screen. We ask the player
                     * for their identity/country first.
                     */

                    toast(
                        "نام، کشور و جغرافیا را انتخاب کن؛ سپس وارد اتاق شو.",
                        "info"
                    );

                    const confirmButton =
                        $("confirmSetupBtn");

                    if (confirmButton) {

                        confirmButton.dataset.mode =
                            "join";
                    }
                }
            );
        }

        const confirmButton =
            $("confirmSetupBtn");

        if (confirmButton) {

            confirmButton.addEventListener(
                "click",
                async () => {

                    const mode =
                        confirmButton.dataset.mode;

                    if (mode === "join") {

                        setScreen(
                            "joinScreen"
                        );

                        toast(
                            "حالا کد اتاق را وارد کن.",
                            "info"
                        );

                        return;
                    }

                    await createRoom();
                }
            );
        }

        const joinConfirm =
            $("joinConfirmBtn");

        if (joinConfirm) {

            joinConfirm.addEventListener(
                "click",
                async () => {

                    await joinRoom();
                }
            );
        }

        const startButton =
            $("startGameBtn");

        if (startButton) {

            startButton.addEventListener(
                "click",
                async () => {

                    await startGame();
                }
            );
        }

        const copyButton =
            $("copyRoomBtn");

        if (copyButton) {

            copyButton.addEventListener(
                "click",
                async () => {

                    if (!roomCode) return;

                    try {

                        await navigator.clipboard.writeText(
                            roomCode
                        );

                        toast(
                            "کد اتاق کپی شد.",
                            "success"
                        );

                    } catch {

                        toast(
                            `کد اتاق: ${roomCode}`,
                            "info"
                        );
                    }
                }
            );
        }

        document
            .querySelectorAll(
                "[data-decision-card]"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    async () => {

                        const index =
                            Number(
                                card.dataset.decisionCard
                            );

                        await chooseDecision(
                            index
                        );
                    }
                );
            });
    }

    /* =====================================================
       INPUT HELPERS
    ===================================================== */

    function setupInputs() {

        const roomInput =
            $("roomCodeInput");

        if (roomInput) {

            roomInput.addEventListener(
                "input",
                () => {

                    roomInput.value =
                        roomInput.value
                            .toUpperCase()
                            .replace(
                                /[^A-Z0-9]/g,
                                ""
                            );
                }
            );

            roomInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        $("joinConfirmBtn")
                            ?.click();
                    }
                }
            );
        }

        const leaderInput =
            $("leaderName");

        if (leaderInput) {

            leaderInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        $("confirmSetupBtn")
                            ?.click();
                    }
                }
            );
        }
    }

    /* =====================================================
       BACK NAVIGATION
    ===================================================== */

    function setupNavigation() {

        /*
         * Browser back button should not accidentally
         * destroy the multiplayer state.
         */

        window.addEventListener(
            "beforeunload",
            () => {

                try {

                    if (
                        channel &&
                        typeof channel.untrack ===
                        "function"
                    ) {

                        channel.untrack();
                    }

                } catch {}
            }
        );
    }

    /* =====================================================
       BOOT
    ===================================================== */

    function setupUI() {

        setupCountrySelectors();

        setupButtons();

        setupInputs();

        setupNavigation();

        if (!initSupabase()) {

            console.warn(
                "[Republic] Supabase unavailable."
            );
        }

        /*
         * Initial screen.
         */

        setScreen(
            "mainMenu"
        );

        console.log(
            `%cREPUBLIC OF ABSURDITY v${VERSION}`,
            "font-weight:bold;font-size:16px"
        );

        console.log(
            `[Republic] ${COUNTRIES.length} countries ready.`
        );
    }

    /* =====================================================
       ERROR PROTECTION
    ===================================================== */

    window.addEventListener(
        "error",
        event => {

            console.error(
                "[Republic] Global error:",
                event.error ||
                event.message
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        event => {

            console.error(
                "[Republic] Promise error:",
                event.reason
            );
        }
    );

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.RepublicGame = {

        version:
            VERSION,

        getState:
            () =>
                clone(gameState),

        getCountries:
            () =>
                clone(COUNTRIES),

        getCurrentPlayer:
            () =>
                clone(
                    getCurrentPlayer()
                ),

        getCurrentCountry:
            () =>
                clone(
                    getCurrentCountry()
                ),

        createRoom,

        joinRoom,

        startGame,

        chooseDecision,

        renderAll
    };

    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            setupUI,
            {
                once: true
            }
        );

    } else {

        setupUI();
    }

})();