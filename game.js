/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0
   PART 1 / 5
   =========================================================

   CINEMATIC PRESIDENTIAL MULTIPLAYER SIMULATOR

   SYSTEMS
   ---------------------------------------------------------
   ✓ 8 Player Multiplayer
   ✓ 50 Stage Architecture
   ✓ Economy
   ✓ Inflation
   ✓ Electricity
   ✓ Popularity
   ✓ Stability
   ✓ Diplomacy
   ✓ Sanctions
   ✓ World Market
   ✓ World Energy
   ✓ World Tension
   ✓ Institutions
   ✓ Protests
   ✓ Strikes
   ✓ Disasters
   ✓ Media Crises
   ✓ Diplomatic Crises
   ✓ Abstract Geopolitical Conflict
   ✓ Delayed Consequences
   ✓ Crisis Chains
   ✓ Decision Ledger
   ✓ AI Director
   ✓ Cinematic Events
   ✓ Dynamic News
   ✓ Dynamic Music / FX
   ✓ Achievements
   ✓ Multiple Endings

   IMPORTANT
   ---------------------------------------------------------
   This file is intentionally split into 5 parts.
   Paste Part 2 directly below Part 1.
   Do NOT add `})();` between parts.
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIG
       ===================================================== */

    const VERSION =
        "10.0-CINEMATIC";


    const MAX_PLAYERS =
        8;


    const MIN_PLAYERS =
        1;


    const MAX_STAGES =
        50;


    const STAGE_OPTIONS = [
        10,
        20,
        30,
        40,
        50
    ];


    const GAME_NAME =
        "REPUBLIC OF ABSURDITY";


    const GAME_NAME_FA =
        "جمهوری مسخره‌ها";


    const CREATOR =
        "beemax_1";


    /* =====================================================
       SUPABASE
       ===================================================== */

    const SUPABASE_URL =
        "https://kkltydnftjwdgqtufdvl.supabase.co";


    const SUPABASE_KEY =
        "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";


    /* =====================================================
       AI SERVER
       ===================================================== */

    const AI_ENDPOINT =
        "https://political-game-ai.tm1190128.workers.dev/";


    /* =====================================================
       LOCAL STORAGE
       ===================================================== */

    const STORAGE_KEY =
        "republic_absurdity_v10";


    /* =====================================================
       DOM HELPER
       ===================================================== */

    const $ = id =>
        document.getElementById(id);


    const qs = selector =>
        document.querySelector(selector);


    const qsa = selector =>
        Array.from(
            document.querySelectorAll(selector)
        );


    /* =====================================================
       GENERAL UTILITIES
       ===================================================== */

    const sleep = ms =>
        new Promise(
            resolve =>
                setTimeout(resolve, ms)
        );


    const uid = (
        prefix = "id"
    ) => {

        return (
            prefix +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10) +
            "_" +
            Date.now()
                .toString(36)
        );
    };


    const num = (
        value,
        fallback = 0
    ) => {

        const n =
            Number(value);

        return Number.isFinite(n)
            ? n
            : fallback;
    };


    const clamp = (
        value,
        min = 0,
        max = 100
    ) => {

        return Math.max(
            min,
            Math.min(
                max,
                num(value)
            )
        );
    };


    const randomInt = (
        min,
        max
    ) => {

        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;
    };


    const randomFloat = (
        min,
        max
    ) => {

        return (
            Math.random() *
            (max - min)
        ) + min;
    };


    const pick = array => {

        if (
            !Array.isArray(array) ||
            !array.length
        ) {
            return null;
        }

        return array[
            randomInt(
                0,
                array.length - 1
            )
        ];
    };


    const clone = value => {

        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch {

            return null;
        }
    };


    const escapeHTML = value => {

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
    };


    /* =====================================================
       DOM REFERENCES
       ===================================================== */

    const DOM = {

        /* Screens */

        boot:
            $("bootScreen"),

        main:
            $("mainMenu"),

        setup:
            $("setupScreen"),

        join:
            $("joinScreen"),

        lobby:
            $("lobbyScreen"),

        game:
            $("gameScreen"),

        end:
            $("endScreen"),


        /* Main menu */

        create:
            $("createGameBtn"),

        joinBtn:
            $("joinGameBtn"),


        /* Setup */

        leaderName:
            $("leaderName"),

        country:
            $("countrySelect"),

        geography:
            $("geographySelect"),

        confirmSetup:
            $("confirmSetupBtn"),


        /* Join */

        roomCode:
            $("roomCodeInput"),

        joinName:
            $("joinLeaderName"),

        joinCountry:
            $("joinCountrySelect"),

        joinGeography:
            $("joinGeographySelect"),

        confirmJoin:
            $("joinConfirmBtn"),


        /* Lobby */

        roomDisplay:
            $("roomCodeDisplay"),

        copyRoom:
            $("copyRoomBtn"),

        playersList:
            $("playersList"),

        playerCount:
            $("playerCount"),

        lobbyStatus:
            $("lobbyStatus"),

        startGame:
            $("startGameBtn"),


        /* Game */

        office:
            $("office3d"),

        news:
            $("newsText"),

        eventTitle:
            $("eventTitle"),

        eventDescription:
            $("eventDescription"),

        decisionCards:
            $("decisionCards"),

        aiThinking:
            $("aiThinking"),

        consequenceOverlay:
            $("consequenceOverlay"),


        /* Player stats */

        money:
            $("moneyValue"),

        economy:
            $("economyValue"),

        electricity:
            $("electricityValue"),

        popularity:
            $("popularityValue"),

        stability:
            $("stabilityValue"),

        sanctions:
            $("sanctionsValue"),

        relations:
            $("relationsValue"),


        /* Stage */

        stage:
            $("stageValue"),

        stageCounter:
            $("stageCounter"),

        turnIndicator:
            $("turnIndicator"),


        /* World */

        worldTension:
            $("worldTension"),

        worldMarket:
            $("worldMarket"),

        worldEnergy:
            $("worldEnergy"),

        worldDiplomacy:
            $("worldDiplomacy"),


        /* End */

        ranking:
            $("rankingList"),

        playAgain:
            $("playAgainBtn"),


        /* Global */

        toast:
            $("toastContainer"),

        loading:
            $("globalLoading"),

        musicToggle:
            $("musicToggleBtn"),

        fxToggle:
            $("fxToggleBtn")
    };


    /* =====================================================
       LOCAL PLAYER
       ===================================================== */

    const LOCAL = {

        id:
            uid("player"),

        name:
            "",

        country:
            "",

        geography:
            "",

        isHost:
            false,

        connected:
            true
    };


    /* =====================================================
       GAME PHASES
       ===================================================== */

    const PHASES = {

        MENU:
            "menu",

        SETUP:
            "setup",

        LOBBY:
            "lobby",

        PLAYING:
            "playing",

        CONSEQUENCE:
            "consequence",

        STAGE_TRANSITION:
            "stage_transition",

        ENDED:
            "ended"
    };


    /* =====================================================
       WORLD STATE
       ===================================================== */

    const DEFAULT_WORLD = {

        tension:
            25,

        market:
            70,

        energy:
            20,

        diplomacy:
            65,

        publicMood:
            60,

        mediaNoise:
            20,

        regionalStability:
            70,

        globalTrust:
            60,

        inflation:
            18,

        foodSecurity:
            75,

        climatePressure:
            25
    };


    /* =====================================================
       INSTITUTIONS
       ===================================================== */

    const INSTITUTION_TEMPLATES = [

        {
            id:
                "executive",

            name:
                "شورای اجرایی جمهوری",

            power:
                75
        },

        {
            id:
                "parliament",

            name:
                "مجلس جمهوری",

            power:
                70
        },

        {
            id:
                "judiciary",

            name:
                "دیوان داوری",

            power:
                60
        },

        {
            id:
                "media",

            name:
                "رسانه ملی خیالی",

            power:
                55
        },

        {
            id:
                "business",

            name:
                "اتحادیه بازرگانان",

            power:
                65
        },

        {
            id:
                "citizens",

            name:
                "شورای شهروندان",

            power:
                80
        },

        {
            id:
                "regional",

            name:
                "شورای منطقه‌ای",

            power:
                50
        },

        {
            id:
                "academia",

            name:
                "شورای دانشگاه‌ها",

            power:
                40
        }
    ];


    function createInstitutions() {

        const result = {};


        INSTITUTION_TEMPLATES.forEach(
            item => {

                result[item.id] = {

                    id:
                        item.id,

                    name:
                        item.name,

                    power:
                        item.power,

                    approval:
                        55,

                    trust:
                        55,

                    pressure:
                        0,

                    mood:
                        "neutral",

                    history:
                        []
                };
            }
        );


        return result;
    }


    /* =====================================================
       COUNTRIES
       ===================================================== */

    const COUNTRIES = [

        {
            id:
                "aurora",

            name:
                "جمهوری آئورورا",

            flag:
                "🟦",

            description:
                "کشوری صنعتی با اقتصاد متنوع و ساختار اداری قدرتمند.",

            bonuses: {

                economy:
                    5,

                diplomacy:
                    4
            }
        },


        {
            id:
                "veloria",

            name:
                "اتحاد ولوریا",

            flag:
                "🟥",

            description:
                "قدرت تجاری و رسانه‌ای منطقه.",

            bonuses: {

                money:
                    120,

                popularity:
                    3
            }
        },


        {
            id:
                "nordica",

            name:
                "جمهوری نوردیکا",

            flag:
                "⬜",

            description:
                "کشوری سردسیر با زیرساخت انرژی قوی.",

            bonuses: {

                electricity:
                    8,

                stability:
                    3
            }
        },


        {
            id:
                "solaria",

            name:
                "فدراسیون سولاریا",

            flag:
                "🟨",

            description:
                "کشوری فناوری‌محور با ظرفیت انرژی بالا.",

            bonuses: {

                electricity:
                    10,

                economy:
                    3
            }
        },


        {
            id:
                "meridia",

            name:
                "جمهوری مریدیا",

            flag:
                "🟩",

            description:
                "اقتصادی متکی بر کشاورزی و صادرات.",

            bonuses: {

                money:
                    80,

                economy:
                    4
            }
        },


        {
            id:
                "montara",

            name:
                "اتحاد مونتارا",

            flag:
                "🟪",

            description:
                "کشوری کوهستانی با ثبات اجتماعی بالا.",

            bonuses: {

                stability:
                    7,

                relations:
                    3
            }
        },


        {
            id:
                "pacifica",

            name:
                "جمهوری پاسیفیکا",

            flag:
                "🌊",

            description:
                "اقتصاد دریایی و تجارت بین‌المللی گسترده.",

            bonuses: {

                money:
                    100,

                relations:
                    5
            }
        },


        {
            id:
                "eastara",

            name:
                "اتحاد ایستارا",

            flag:
                "🟧",

            description:
                "بازار داخلی بزرگ و جمعیت فعال.",

            bonuses: {

                popularity:
                    6,

                economy:
                    2
            }
        },


        {
            id:
                "novara",

            name:
                "جمهوری نووارا",

            flag:
                "⬛",

            description:
                "کشوری کوچک اما بسیار فعال در دیپلماسی.",

            bonuses: {

                relations:
                    8,

                popularity:
                    2
            }
        },


        {
            id:
                "federalis",

            name:
                "فدراسیون فدرالیس",

            flag:
                "🟫",

            description:
                "کشوری با صنعت و نظام اداری گسترده.",

            bonuses: {

                economy:
                    6,

                stability:
                    2
            }
        }
    ];


    /* =====================================================
       GEOGRAPHIES
       ===================================================== */

    const GEOGRAPHIES = [

        {
            id:
                "capital",

            name:
                "پایتخت",

            icon:
                "🏛️",

            description:
                "مرکز سیاسی و اداری کشور.",

            effects: {

                stability:
                    4,

                popularity:
                    2
            }
        },


        {
            id:
                "coast",

            name:
                "ساحلی",

            icon:
                "🌊",

            description:
                "منطقه‌ای وابسته به تجارت و مسیرهای دریایی.",

            effects: {

                money:
                    50,

                relations:
                    3
            }
        },


        {
            id:
                "mountain",

            name:
                "کوهستانی",

            icon:
                "⛰️",

            description:
                "منطقه‌ای دشوار برای دسترسی اما نسبتاً باثبات.",

            effects: {

                stability:
                    5,

                economy:
                    -2
            }
        },


        {
            id:
                "desert",

            name:
                "بیابانی",

            icon:
                "🏜️",

            description:
                "منطقه‌ای گرم و کم‌آب.",

            effects: {

                electricity:
                    -3,

                economy:
                    2
            }
        },


        {
            id:
                "forest",

            name:
                "جنگلی",

            icon:
                "🌲",

            description:
                "منطقه‌ای سرسبز با منابع طبیعی.",

            effects: {

                stability:
                    2,

                economy:
                    3
            }
        },


        {
            id:
                "industrial",

            name:
                "صنعتی",

            icon:
                "🏭",

            description:
                "مرکز کارخانه‌ها و تولید صنعتی.",

            effects: {

                economy:
                    7,

                electricity:
                    -4
            }
        },


        {
            id:
                "agriculture",

            name:
                "کشاورزی",

            icon:
                "🌾",

            description:
                "منطقه‌ای متکی بر تولید مواد غذایی.",

            effects: {

                economy:
                    3,

                popularity:
                    3
            }
        },


        {
            id:
                "border",

            name:
                "مرزی",

            icon:
                "🗺️",

            description:
                "منطقه‌ای حساس از نظر روابط خارجی.",

            effects: {

                relations:
                    -2,

                stability:
                    -2
            }
        }
    ];


    /* =====================================================
       EVENT CATEGORIES
       ===================================================== */

    const EVENT_TYPES = {

        ECONOMY:
            "economy",

        INFLATION:
            "inflation",

        ENERGY:
            "energy",

        PUBLIC:
            "public",

        PROTEST:
            "protest",

        STRIKE:
            "strike",

        DIPLOMACY:
            "diplomacy",

        SANCTIONS:
            "sanctions",

        REGIONAL:
            "regional",

        CONFLICT:
            "conflict",

        WEATHER:
            "weather",

        FLOOD:
            "flood",

        MEDIA:
            "media",

        POLITICS:
            "politics",

        INSTITUTION:
            "institution",

        FOOD:
            "food",

        WATER:
            "water",

        INFRASTRUCTURE:
            "infrastructure",

        ABSURD:
            "absurd",

        SPECIAL:
            "special"
    };


    /* =====================================================
       PLAYER FACTORY
       ===================================================== */

    function createPlayer(options = {}) {

        const player = {

            id:
                options.id ||
                uid("player"),

            name:
                options.name ||
                "رئیس‌جمهور ناشناس",

            country:
                options.country ||
                COUNTRIES[0].id,

            geography:
                options.geography ||
                GEOGRAPHIES[0].id,

            isHost:
                Boolean(
                    options.isHost
                ),

            connected:
                true,


            stats: {

                money:
                    1000,

                economy:
                    70,

                electricity:
                    75,

                popularity:
                    60,

                stability:
                    65,

                sanctions:
                    0,

                relations:
                    60
            },


            reputation:
                50,


            score:
                0,


            decisions:
                0,


            victories:
                0,


            losses:
                0,


            crisisCount:
                0,


            solvedCrises:
                0,


            currentTurn:
                false,


            achievements:
                [],


            flags:
                {},


            ledger:
                [],


            milestones:
                [],


            history:
                [],


            relationships:
                {},


            createdAt:
                Date.now()
        };


        applyCountryBonus(
            player
        );


        return player;
    }


    /* =====================================================
       COUNTRY BONUS
       ===================================================== */

    function applyCountryBonus(
        player
    ) {

        if (
            !player ||
            !player.stats
        ) {
            return;
        }


        const country =
            COUNTRIES.find(
                item =>
                    item.id ===
                    player.country
            );


        const geography =
            GEOGRAPHIES.find(
                item =>
                    item.id ===
                    player.geography
            );


        if (
            country &&
            country.bonuses
        ) {

            Object.entries(
                country.bonuses
            ).forEach(
                ([key, value]) => {

                    if (
                        key in
                        player.stats
                    ) {

                        player.stats[key] +=
                            num(value);
                    }
                }
            );
        }


        if (
            geography &&
            geography.effects
        ) {

            Object.entries(
                geography.effects
            ).forEach(
                ([key, value]) => {

                    if (
                        key in
                        player.stats
                    ) {

                        player.stats[key] +=
                            num(value);
                    }
                }
            );
        }


        normalizePlayerStats(
            player
        );
    }


    /* =====================================================
       NORMALIZE PLAYER STATS
       ===================================================== */

    function normalizePlayerStats(
        player
    ) {

        if (
            !player ||
            !player.stats
        ) {
            return;
        }


        player.stats.money =
            Math.round(
                num(
                    player.stats.money,
                    1000
                )
            );


        player.stats.economy =
            clamp(
                player.stats.economy
            );


        player.stats.electricity =
            clamp(
                player.stats.electricity
            );


        player.stats.popularity =
            clamp(
                player.stats.popularity
            );


        player.stats.stability =
            clamp(
                player.stats.stability
            );


        player.stats.relations =
            clamp(
                player.stats.relations
            );


        player.stats.sanctions =
            Math.max(
                0,
                num(
                    player.stats.sanctions
                )
            );
    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    let STATE = {

        version:
            VERSION,

        phase:
            PHASES.MENU,


        roomCode:
            null,

        hostId:
            null,


        stageLimit:
            30,

        stage:
            0,

        turnIndex:
            0,

        turnPlayerId:
            null,


        revision:
            0,

        actionId:
            0,


        startedAt:
            null,

        endedAt:
            null,


        players:
            [],


        stageVotes:
            {},


        currentEvent:
            null,

        currentConsequence:
            null,


        world:
            clone(
                DEFAULT_WORLD
            ),


        institutions:
            createInstitutions(),


        relations:
            {},


        activeCrises:
            [],


        delayedConsequences:
            [],


        ledger:
            [],


        history:
            [],


        usedEventIds:
            [],


        milestoneHistory:
            [],


        achievements:
            [],


        worldEvents:
            [],


        ended:
            false,


        finalReason:
            "",


        winnerId:
            null
    };


    /* =====================================================
       RUNTIME
       ===================================================== */

    let SUPABASE_CLIENT =
        null;


    let ROOM_CHANNEL =
        null;


    let REALTIME_READY =
        false;


    let CURRENT_EVENT =
        null;


    let CURRENT_CONSEQUENCE =
        null;


    let TURN_TIMER =
        null;


    let TURN_TIMER_VALUE =
        0;


    let AI_LOCK =
        false;


    let EVENT_LOCK =
        false;


    let DECISION_LOCK =
        false;


    let CINEMATIC_LOCK =
        false;


    let MUSIC_ENABLED =
        true;


    let FX_ENABLED =
        true;


    let AUDIO_CONTEXT =
        null;


    let AUDIO_MASTER =
        null;


    let AMBIENT_OSCILLATOR =
        null;


    let AMBIENT_GAIN =
        null;


    /* =====================================================
       CURRENT PLAYER HELPERS
       ===================================================== */

    function getPlayer(
        id
    ) {

        return (
            STATE.players.find(
                player =>
                    player.id === id
            ) ||
            null
        );
    }


    function getLocalPlayer() {

        return getPlayer(
            LOCAL.id
        );
    }


    function getCurrentTurnPlayer() {

        return getPlayer(
            STATE.turnPlayerId
        );
    }


    function getCountry(
        id
    ) {

        return (
            COUNTRIES.find(
                item =>
                    item.id === id
            ) ||
            null
        );
    }


    function getGeography(
        id
    ) {

        return (
            GEOGRAPHIES.find(
                item =>
                    item.id === id
            ) ||
            null
        );
    }


    function isHost() {

        return (
            STATE.hostId ===
            LOCAL.id
        );
    }


    function isMyTurn() {

        return (
            STATE.turnPlayerId ===
            LOCAL.id
        );
    }


    /* =====================================================
       RELATIONS
       ===================================================== */

    function initializeRelations() {

        STATE.relations = {};


        STATE.players.forEach(
            player => {

                STATE.relations[
                    player.id
                ] = {};

                STATE.players.forEach(
                    other => {

                        if (
                            player.id ===
                            other.id
                        ) {
                            return;
                        }


                        STATE.relations[
                            player.id
                        ][
                            other.id
                        ] = 50;
                    }
                );
            }
        );
    }


    /* =====================================================
       STATE NORMALIZATION
       ===================================================== */

    function normalizePlayer(
        input
    ) {

        const base =
            createPlayer({

                id:
                    input?.id,

                name:
                    input?.name,

                country:
                    input?.country,

                geography:
                    input?.geography,

                isHost:
                    input?.isHost
            });


        const player = {

            ...base,

            ...input,


            stats: {

                ...base.stats,

                ...(input?.stats || {})
            },


            achievements:
                Array.isArray(
                    input?.achievements
                )
                    ? input.achievements
                    : [],


            flags:
                input?.flags &&
                typeof input.flags ===
                    "object"
                    ? input.flags
                    : {},


            ledger:
                Array.isArray(
                    input?.ledger
                )
                    ? input.ledger
                    : [],


            milestones:
                Array.isArray(
                    input?.milestones
                )
                    ? input.milestones
                    : [],


            history:
                Array.isArray(
                    input?.history
                )
                    ? input.history
                    : [],


            relationships:
                input?.relationships &&
                typeof input.relationships ===
                    "object"
                    ? input.relationships
                    : {}
        };


        normalizePlayerStats(
            player
        );


        return player;
    }


    function normalizeState(
        incoming
    ) {

        if (
            !incoming ||
            typeof incoming !==
                "object"
        ) {
            return;
        }


        STATE = {

            ...STATE,

            ...incoming,


            players:
                Array.isArray(
                    incoming.players
                )
                    ? incoming.players.map(
                        normalizePlayer
                    )
                    : STATE.players,


            world: {

                ...clone(
                    DEFAULT_WORLD
                ),

                ...(incoming.world || {})
            },


            institutions:
                incoming.institutions &&
                typeof incoming.institutions ===
                    "object"
                    ? incoming.institutions
                    : createInstitutions(),


            relations:
                incoming.relations &&
                typeof incoming.relations ===
                    "object"
                    ? incoming.relations
                    : {},


            activeCrises:
                Array.isArray(
                    incoming.activeCrises
                )
                    ? incoming.activeCrises
                    : [],


            delayedConsequences:
                Array.isArray(
                    incoming.delayedConsequences
                )
                    ? incoming.delayedConsequences
                    : [],


            ledger:
                Array.isArray(
                    incoming.ledger
                )
                    ? incoming.ledger
                    : [],


            history:
                Array.isArray(
                    incoming.history
                )
                    ? incoming.history
                    : [],


            usedEventIds:
                Array.isArray(
                    incoming.usedEventIds
                )
                    ? incoming.usedEventIds
                    : [],


            milestoneHistory:
                Array.isArray(
                    incoming.milestoneHistory
                )
                    ? incoming.milestoneHistory
                    : [],


            achievements:
                Array.isArray(
                    incoming.achievements
                )
                    ? incoming.achievements
                    : []
        };


        CURRENT_EVENT =
            STATE.currentEvent ||
            null;


        CURRENT_CONSEQUENCE =
            STATE.currentConsequence ||
            null;
    }


    /* =====================================================
       LOCAL STATE
       ===================================================== */

    function saveLocalState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({

                    local:
                        LOCAL,

                    state:
                        STATE
                })
            );

        } catch (
            error
        ) {

            console.warn(
                "Save failed:",
                error
            );
        }
    }


    function loadLocalState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!raw) {
                return null;
            }


            return JSON.parse(
                raw
            );

        } catch {

            return null;
        }
    }


    function clearLocalState() {

        try {

            localStorage.removeItem(
                STORAGE_KEY
            );

        } catch {}
    }


    /* =====================================================
       RESET GAME
       ===================================================== */

    function resetGame() {

        STATE = {

            version:
                VERSION,

            phase:
                PHASES.MENU,

            roomCode:
                null,

            hostId:
                null,

            stageLimit:
                30,

            stage:
                0,

            turnIndex:
                0,

            turnPlayerId:
                null,

            revision:
                0,

            actionId:
                0,

            startedAt:
                null,

            endedAt:
                null,

            players:
                [],

            stageVotes:
                {},

            currentEvent:
                null,

            currentConsequence:
                null,

            world:
                clone(
                    DEFAULT_WORLD
                ),

            institutions:
                createInstitutions(),

            relations:
                {},

            activeCrises:
                [],

            delayedConsequences:
                [],

            ledger:
                [],

            history:
                [],

            usedEventIds:
                [],

            milestoneHistory:
                [],

            achievements:
                [],

            worldEvents:
                [],

            ended:
                false,

            finalReason:
                "",

            winnerId:
                null
        };


        CURRENT_EVENT =
            null;


        CURRENT_CONSEQUENCE =
            null;


        AI_LOCK =
            false;


        EVENT_LOCK =
            false;


        DECISION_LOCK =
            false;


        CINEMATIC_LOCK =
            false;


        if (TURN_TIMER) {

            clearInterval(
                TURN_TIMER
            );

            TURN_TIMER =
                null;
        }


        saveLocalState();
    }


    /* =====================================================
       PART 1 PUBLIC DEBUG API
       ===================================================== */

    window.RepublicGame =
        window.RepublicGame ||
        {};


    Object.assign(
        window.RepublicGame,
        {

            version:
                VERSION,

            getState:
                () =>
                    clone(
                        STATE
                    ),

            getLocalPlayer:
                () =>
                    clone(
                        LOCAL
                    ),

            getPlayers:
                () =>
                    clone(
                        STATE.players
                    ),

            getCountries:
                () =>
                    clone(
                        COUNTRIES
                    ),

            getGeographies:
                () =>
                    clone(
                        GEOGRAPHIES
                    ),

            reset:
                resetGame
        }
    );


    /* =====================================================
       PART 1 END
       -----------------------------------------------------
       PART 2 MUST BE PASTED DIRECTLY BELOW.
       DO NOT CLOSE THE IIFE HERE.
       ===================================================== */
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0
   PART 2 / 8
   EVENT SYSTEM + WORLD EVENTS + EVENT FACTORY
   ========================================================= */

/* =========================================================
   EVENT UTILITIES
========================================================= */

function makeChoice(id, title, description, effects, meta = {}) {
    return {
        id,
        title,
        description,
        effects: {
            money: num(effects.money, 0),
            electricity: num(effects.electricity, 0),
            economy: num(effects.economy, 0),
            popularity: num(effects.popularity, 0),
            stability: num(effects.stability, 0),
            sanctions: num(effects.sanctions, 0),
            relations: num(effects.relations, 0),
            tension: num(effects.tension, 0),
            market: num(effects.market, 0),
            energy: num(effects.energy, 0),
            diplomacy: num(effects.diplomacy, 0),
            publicMood: num(effects.publicMood, 0),
            mediaNoise: num(effects.mediaNoise, 0),
            regionalStability: num(effects.regionalStability, 0),
            globalTrust: num(effects.globalTrust, 0),
            inflation: num(effects.inflation, 0),
            foodSecurity: num(effects.foodSecurity, 0),
            climatePressure: num(effects.climatePressure, 0)
        },
        meta: {
            risk: meta.risk || "medium",
            style: meta.style || "balanced",
            delayed: meta.delayed || false,
            reputation: num(meta.reputation, 0),
            score: num(meta.score, 0),
            crisis: meta.crisis || null,
            milestone: meta.milestone || null
        }
    };
}

function makeEvent(config) {
    const choices = Array.isArray(config.choices)
        ? config.choices.slice(0, 3)
        : [];

    while (choices.length < 3) {
        choices.push(
            makeChoice(
                "auto_" + choices.length,
                "تصمیم اضطراری",
                "یک تصمیم محتاطانه برای کنترل شرایط.",
                {
                    money: -20,
                    stability: 1,
                    popularity: 1
                }
            )
        );
    }

    return {
        id: config.id || uid("event"),
        title: config.title || "بحران ناشناخته",
        description: config.description || "شرایطی غیرمنتظره در کشور شکل گرفته است.",
        type: config.type || "special",
        category: config.category || "general",
        severity: config.severity || 2,

        targetPlayerId: config.targetPlayerId || null,
        actorPlayerId: config.actorPlayerId || null,

        country: config.country || null,
        geography: config.geography || null,

        news: config.news || config.title || "خبر فوری",
        ticker: config.ticker || "خبر فوری جمهوری مسخره‌ها",

        atmosphere: config.atmosphere || "normal",

        choices,

        tags: Array.isArray(config.tags)
            ? config.tags
            : [],

        generatedBy: config.generatedBy || "local-director",

        createdAt: Date.now()
    };
}


/* =========================================================
   EVENT EFFECT BUILDER
========================================================= */

function effects(data = {}) {
    return {
        money: num(data.money, 0),
        electricity: num(data.electricity, 0),
        economy: num(data.economy, 0),
        popularity: num(data.popularity, 0),
        stability: num(data.stability, 0),
        sanctions: num(data.sanctions, 0),
        relations: num(data.relations, 0),

        tension: num(data.tension, 0),
        market: num(data.market, 0),
        energy: num(data.energy, 0),
        diplomacy: num(data.diplomacy, 0),

        publicMood: num(data.publicMood, 0),
        mediaNoise: num(data.mediaNoise, 0),
        regionalStability: num(data.regionalStability, 0),
        globalTrust: num(data.globalTrust, 0),

        inflation: num(data.inflation, 0),
        foodSecurity: num(data.foodSecurity, 0),
        climatePressure: num(data.climatePressure, 0)
    };
}


/* =========================================================
   EVENT PERSONALIZATION
========================================================= */

function personalizeEvent(event, player) {
    if (!event || !player) {
        return event;
    }

    const country = getCountry(player.country);
    const geography = getGeography(player.geography);

    const countryName = country
        ? country.name
        : player.country || "کشور شما";

    const geographyName = geography
        ? geography.name
        : player.geography || "منطقه مرکزی";

    event.targetPlayerId = player.id;
    event.country = countryName;
    event.geography = geographyName;

    event.title = String(event.title)
        .replaceAll("{country}", countryName)
        .replaceAll("{geography}", geographyName);

    event.description = String(event.description)
        .replaceAll("{country}", countryName)
        .replaceAll("{geography}", geographyName);

    event.news = String(event.news)
        .replaceAll("{country}", countryName)
        .replaceAll("{geography}", geographyName);

    event.ticker = String(event.ticker)
        .replaceAll("{country}", countryName)
        .replaceAll("{geography}", geographyName);

    return event;
}


/* =========================================================
   GEOGRAPHY MODIFIERS
========================================================= */

function getGeographyEventModifier(player, type) {
    const geography = player && player.geography
        ? player.geography
        : "capital";

    const map = {
        coast: {
            weather: 2,
            flood: 4,
            diplomacy: 2,
            trade: 3
        },

        mountain: {
            weather: 3,
            infrastructure: 3,
            energy: 2,
            border: 2
        },

        desert: {
            water: 5,
            energy: 2,
            food: 3,
            weather: 2
        },

        forest: {
            weather: 3,
            flood: 3,
            climate: 4,
            agriculture: 2
        },

        industrial: {
            economy: 3,
            energy: 5,
            pollution: 4,
            strike: 3
        },

        agriculture: {
            food: 5,
            water: 4,
            weather: 4,
            inflation: 2
        },

        border: {
            diplomacy: 5,
            tension: 5,
            sanctions: 2,
            regional: 4
        },

        capital: {
            politics: 5,
            media: 5,
            protest: 4,
            institution: 4
        }
    };

    return num(
        map[geography] && map[geography][type],
        0
    );
}


/* =========================================================
   BASE EVENT LIBRARY
========================================================= */

const EVENT_LIBRARY = [

    /* =====================================================
       ECONOMY
    ===================================================== */

    {
        id: "economy_market_shock",
        type: "economy",
        category: "economy",
        severity: 3,
        tags: ["market", "economy"],

        title: "شوک ناگهانی بازار",
        description:
            "بازارهای داخلی با موجی از بی‌اعتمادی روبه‌رو شده‌اند و قیمت برخی کالاها با سرعت زیادی تغییر کرده است.",

        news:
            "بازار داخلی وارد وضعیت ناپایدار شده است.",

        ticker:
            "خبر فوری | شاخص بازار در وضعیت نوسانی قرار گرفت",

        choices: [
            makeChoice(
                "support_market",
                "حمایت فوری",
                "دولت بخشی از منابع خود را برای آرام‌کردن بازار اختصاص می‌دهد.",
                effects({
                    money: -130,
                    economy: 7,
                    popularity: 3,
                    market: 6,
                    inflation: -2
                }),
                {
                    risk: "low",
                    style: "economic"
                }
            ),

            makeChoice(
                "wait_market",
                "صبر و نظارت",
                "دولت فعلاً دخالت گسترده نمی‌کند و بازار را زیر نظر می‌گیرد.",
                effects({
                    economy: -3,
                    popularity: -2,
                    market: -2,
                    stability: 1
                }),
                {
                    risk: "medium",
                    style: "neutral"
                }
            ),

            makeChoice(
                "reform_market",
                "اصلاح ساختاری",
                "دولت به‌جای تزریق منابع، یک بسته اصلاحی بلندمدت معرفی می‌کند.",
                effects({
                    money: -70,
                    economy: 4,
                    popularity: -3,
                    stability: 4,
                    market: 3
                }),
                {
                    risk: "high",
                    style: "strategic",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       INFLATION
    ===================================================== */

    {
        id: "inflation_price_rise",
        type: "inflation",
        category: "economy",
        severity: 4,
        tags: ["inflation", "prices"],

        title: "موج افزایش قیمت‌ها",
        description:
            "قیمت کالاهای روزمره بالا رفته و مردم نسبت به آینده اقتصادی کشور نگران شده‌اند.",

        news:
            "افزایش قیمت‌ها به یکی از مهم‌ترین خبرهای روز تبدیل شد.",

        ticker:
            "اقتصاد | موج جدید افزایش قیمت‌ها در بازار",

        choices: [
            makeChoice(
                "price_support",
                "حمایت از مصرف‌کننده",
                "دولت برای مدتی بخشی از هزینه کالاهای ضروری را پوشش می‌دهد.",
                effects({
                    money: -160,
                    popularity: 7,
                    inflation: -5,
                    foodSecurity: 4
                }),
                {
                    risk: "low",
                    style: "popular"
                }
            ),

            makeChoice(
                "market_control",
                "کنترل بازار",
                "دولت نظارت بر زنجیره توزیع را شدیدتر می‌کند.",
                effects({
                    money: -80,
                    popularity: 2,
                    inflation: -3,
                    market: 4,
                    stability: 2
                }),
                {
                    risk: "medium",
                    style: "administrative"
                }
            ),

            makeChoice(
                "economic_reform",
                "اصلاح اقتصادی",
                "دولت تصمیم سخت‌تری می‌گیرد و اصلاحات اقتصادی را آغاز می‌کند.",
                effects({
                    economy: 8,
                    popularity: -8,
                    stability: 3,
                    inflation: -6,
                    market: 5
                }),
                {
                    risk: "high",
                    style: "reform",
                    delayed: true,
                    score: 15
                }
            )
        ]
    },


    /* =====================================================
       FOOD
    ===================================================== */

    {
        id: "food_shortage",
        type: "food",
        category: "food",
        severity: 4,
        tags: ["food", "inflation"],

        title: "اختلال در زنجیره تأمین غذا",
        description:
            "اختلال در حمل‌ونقل و توزیع باعث کاهش موقت عرضه برخی کالاهای غذایی شده است.",

        news:
            "بازار مواد غذایی با اختلال مواجه شد.",

        ticker:
            "هشدار اقتصادی | زنجیره تأمین مواد غذایی دچار مشکل شد",

        choices: [
            makeChoice(
                "food_reserve",
                "استفاده از ذخایر",
                "دولت از ذخایر موجود برای آرام‌کردن بازار استفاده می‌کند.",
                effects({
                    money: -100,
                    foodSecurity: 10,
                    popularity: 5,
                    inflation: -3
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "import_food",
                "واردات اضطراری",
                "دولت برای جبران کمبود، مسیرهای تجاری جدید فعال می‌کند.",
                effects({
                    money: -120,
                    foodSecurity: 12,
                    relations: 3,
                    diplomacy: 2
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "domestic_production",
                "تولید داخلی",
                "دولت منابع را به تولیدکنندگان داخلی اختصاص می‌دهد.",
                effects({
                    money: -80,
                    foodSecurity: 5,
                    economy: 4,
                    popularity: 2,
                    stability: 3
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       ENERGY
    ===================================================== */

    {
        id: "energy_crisis",
        type: "energy",
        category: "energy",
        severity: 4,
        tags: ["energy", "infrastructure"],

        title: "بحران انرژی",
        description:
            "مصرف انرژی از ظرفیت فعلی عبور کرده و شبکه با فشار زیادی روبه‌رو شده است.",

        news:
            "شبکه انرژی کشور در وضعیت هشدار قرار گرفت.",

        ticker:
            "انرژی | مصرف از ظرفیت شبکه عبور کرد",

        choices: [
            makeChoice(
                "energy_budget",
                "تزریق بودجه",
                "بودجه فوری برای افزایش ظرفیت شبکه اختصاص داده می‌شود.",
                effects({
                    money: -150,
                    electricity: 12,
                    energy: -8,
                    economy: 4
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "temporary_limits",
                "مدیریت مصرف",
                "محدودیت موقت مصرف برای عبور از بحران اجرا می‌شود.",
                effects({
                    electricity: 7,
                    popularity: -5,
                    economy: -2,
                    energy: -5
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "green_transition",
                "گذار انرژی",
                "دولت سرمایه‌گذاری بلندمدتی برای تغییر ساختار انرژی آغاز می‌کند.",
                effects({
                    money: -110,
                    electricity: 5,
                    economy: 7,
                    energy: -10,
                    climatePressure: -4
                }),
                {
                    risk: "high",
                    delayed: true,
                    score: 12
                }
            )
        ]
    },


    /* =====================================================
       WATER
    ===================================================== */

    {
        id: "water_crisis",
        type: "water",
        category: "resources",
        severity: 4,
        tags: ["water", "climate"],

        title: "بحران آب",
        description:
            "کاهش منابع آبی و افزایش مصرف، فشار زیادی بر شهرها و مناطق مختلف وارد کرده است.",

        news:
            "سطح ذخایر آبی به محدوده هشدار رسید.",

        ticker:
            "منابع | بحران آب به موضوع اصلی کشور تبدیل شد",

        choices: [
            makeChoice(
                "water_investment",
                "سرمایه‌گذاری آبی",
                "دولت پروژه‌های فوری مدیریت آب را فعال می‌کند.",
                effects({
                    money: -130,
                    water: 0,
                    stability: 5,
                    popularity: 3,
                    climatePressure: -3
                }),
                {
                    risk: "low",
                    delayed: true
                }
            ),

            makeChoice(
                "water_limits",
                "مدیریت مصرف",
                "مصرف آب برای مدتی کنترل می‌شود.",
                effects({
                    popularity: -5,
                    stability: 3,
                    economy: -2,
                    foodSecurity: -1
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "regional_water_deal",
                "توافق منطقه‌ای",
                "دولت با مناطق همسایه وارد مذاکره برای مدیریت مشترک منابع می‌شود.",
                effects({
                    relations: 8,
                    diplomacy: 7,
                    stability: 3,
                    foodSecurity: 4
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       PROTEST
    ===================================================== */

    {
        id: "public_protest",
        type: "protest",
        category: "public",
        severity: 4,
        tags: ["public", "media", "politics"],

        title: "موج اعتراضات مدنی",
        description:
            "گروه‌هایی از شهروندان در چند نقطه کشور نسبت به شرایط اقتصادی و خدمات عمومی اعتراض کرده‌اند.",

        news:
            "اعتراضات مدنی به یکی از مهم‌ترین اخبار کشور تبدیل شد.",

        ticker:
            "جامعه | اعتراضات مدنی در چند منطقه ادامه دارد",

        choices: [
            makeChoice(
                "dialogue",
                "گفت‌وگو",
                "دولت نمایندگان گروه‌های مختلف را برای گفت‌وگو دعوت می‌کند.",
                effects({
                    popularity: 6,
                    stability: 7,
                    publicMood: 8,
                    mediaNoise: -3
                }),
                {
                    risk: "low",
                    style: "dialogue"
                }
            ),

            makeChoice(
                "public_package",
                "بسته فوری اجتماعی",
                "دولت بخشی از بودجه را به مطالبات عمومی اختصاص می‌دهد.",
                effects({
                    money: -140,
                    popularity: 9,
                    stability: 4,
                    publicMood: 7,
                    economy: -2
                }),
                {
                    risk: "medium",
                    style: "popular"
                }
            ),

            makeChoice(
                "investigation",
                "کمیته بررسی",
                "یک کمیته مستقل برای بررسی ریشه‌های نارضایتی تشکیل می‌شود.",
                effects({
                    popularity: 2,
                    stability: 5,
                    mediaNoise: -4,
                    publicMood: 5
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       STRIKE
    ===================================================== */

    {
        id: "national_strike",
        type: "strike",
        category: "public",
        severity: 3,
        tags: ["strike", "economy"],

        title: "اعتصاب گسترده",
        description:
            "بخشی از کارکنان و فعالان اقتصادی در اعتراض به شرایط کاری فعالیت خود را متوقف کرده‌اند.",

        news:
            "اختلال در فعالیت برخی بخش‌های اقتصادی گزارش شد.",

        ticker:
            "اقتصاد | اعتصاب بخشی از فعالان اقتصادی ادامه دارد",

        choices: [
            makeChoice(
                "negotiate_strike",
                "مذاکره فوری",
                "دولت با نمایندگان اعتصاب‌کنندگان وارد مذاکره می‌شود.",
                effects({
                    stability: 7,
                    popularity: 4,
                    economy: 2,
                    publicMood: 5
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "economic_package",
                "پیشنهاد اقتصادی",
                "یک بسته اقتصادی برای حل بخشی از اختلافات ارائه می‌شود.",
                effects({
                    money: -100,
                    economy: 5,
                    stability: 5,
                    popularity: 3
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "wait_and_watch",
                "انتظار",
                "دولت فعلاً وارد تصمیم بزرگ نمی‌شود.",
                effects({
                    economy: -5,
                    popularity: -5,
                    stability: -3,
                    mediaNoise: 4
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       DIPLOMACY
    ===================================================== */

    {
        id: "diplomatic_freeze",
        type: "diplomacy",
        category: "diplomacy",
        severity: 3,
        tags: ["diplomacy", "relations"],

        title: "سردی روابط دیپلماتیک",
        description:
            "یکی از کشورهای همسایه روابط خود با دولت شما را کاهش داده و مذاکرات رسمی را متوقف کرده است.",

        news:
            "روابط دیپلماتیک با یک کشور منطقه وارد مرحله سردی شد.",

        ticker:
            "دیپلماسی | مذاکرات رسمی متوقف شد",

        choices: [
            makeChoice(
                "diplomatic_mission",
                "فرستادن هیئت دیپلماتیک",
                "هیئتی برای کاهش تنش و بازکردن مسیر گفت‌وگو اعزام می‌شود.",
                effects({
                    money: -50,
                    relations: 10,
                    diplomacy: 10,
                    tension: -6,
                    globalTrust: 4
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "public_statement",
                "بیانیه رسمی",
                "دولت موضع خود را با یک بیانیه شفاف اعلام می‌کند.",
                effects({
                    popularity: 4,
                    relations: -2,
                    diplomacy: 2,
                    mediaNoise: 3
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "regional_mediation",
                "میانجی منطقه‌ای",
                "از یک بازیگر منطقه‌ای برای میانجیگری کمک گرفته می‌شود.",
                effects({
                    money: -40,
                    relations: 6,
                    diplomacy: 8,
                    tension: -8,
                    regionalStability: 4
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       SANCTIONS
    ===================================================== */

    {
        id: "economic_sanctions",
        type: "sanctions",
        category: "diplomacy",
        severity: 5,
        tags: ["sanctions", "economy"],

        title: "تحریم اقتصادی",
        description:
            "چند شریک تجاری محدودیت‌هایی اقتصادی علیه کشور شما اعمال کرده‌اند و هزینه تجارت افزایش یافته است.",

        news:
            "محدودیت‌های تجاری جدید علیه کشور اعلام شد.",

        ticker:
            "اقتصاد جهانی | محدودیت‌های تجاری جدید اعلام شد",

        choices: [
            makeChoice(
                "negotiate_sanctions",
                "مذاکره",
                "دولت مسیر مذاکره و کاهش تنش را فعال می‌کند.",
                effects({
                    money: -70,
                    sanctions: -7,
                    relations: 7,
                    diplomacy: 10,
                    globalTrust: 5,
                    tension: -5
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "diversify_trade",
                "تنوع تجاری",
                "دولت مسیرهای تجاری جدیدی ایجاد می‌کند.",
                effects({
                    money: -120,
                    economy: 6,
                    sanctions: -3,
                    market: 5,
                    relations: 4
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            ),

            makeChoice(
                "domestic_resilience",
                "اقتصاد مقاوم",
                "دولت منابع را به تقویت ظرفیت داخلی اختصاص می‌دهد.",
                effects({
                    money: -100,
                    economy: 8,
                    stability: 4,
                    popularity: -2,
                    sanctions: -2
                }),
                {
                    risk: "high",
                    delayed: true,
                    score: 15
                }
            )
        ]
    },


    /* =====================================================
       REGIONAL TENSION
    ===================================================== */

    {
        id: "border_tension",
        type: "regional",
        category: "geopolitics",
        severity: 4,
        tags: ["border", "diplomacy", "tension"],

        title: "تنش مرزی",
        description:
            "تنش سیاسی در یک منطقه مرزی افزایش یافته و رسانه‌ها درباره آینده روابط منطقه‌ای گمانه‌زنی می‌کنند.",

        news:
            "تنش سیاسی در منطقه مرزی افزایش یافت.",

        ticker:
            "منطقه | سطح تنش سیاسی افزایش پیدا کرد",

        choices: [
            makeChoice(
                "regional_dialogue",
                "گفت‌وگوی منطقه‌ای",
                "دولت پیشنهاد نشست منطقه‌ای برای کاهش تنش می‌دهد.",
                effects({
                    money: -40,
                    relations: 9,
                    diplomacy: 11,
                    tension: -10,
                    regionalStability: 8
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "border_monitoring",
                "افزایش نظارت",
                "دولت سطح پایش و هماهنگی مدنی در منطقه را افزایش می‌دهد.",
                effects({
                    money: -60,
                    stability: 5,
                    tension: -3,
                    popularity: 2
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "international_mediation",
                "میانجیگری بین‌المللی",
                "دولت از نهادهای بین‌المللی برای کاهش تنش کمک می‌گیرد.",
                effects({
                    money: -30,
                    relations: 6,
                    diplomacy: 12,
                    tension: -12,
                    globalTrust: 7
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            )
        ]
    },


    /* =====================================================
       ABSTRACT CONFLICT
    ===================================================== */

    {
        id: "regional_hostility",
        type: "conflict",
        category: "geopolitics",
        severity: 5,
        tags: ["conflict", "diplomacy", "crisis"],

        title: "افزایش خصومت منطقه‌ای",
        description:
            "روابط چند بازیگر منطقه‌ای وارد مرحله‌ای بسیار پرتنش شده و بازار و فضای سیاسی کشور نیز تحت تأثیر قرار گرفته است.",

        news:
            "سطح خصومت سیاسی در منطقه افزایش یافت.",

        ticker:
            "بحران منطقه‌ای | دولت‌ها خواستار کاهش تنش شدند",

        choices: [
            makeChoice(
                "peace_initiative",
                "ابتکار صلح",
                "دولت یک طرح چندجانبه برای کاهش تنش پیشنهاد می‌کند.",
                effects({
                    money: -70,
                    diplomacy: 15,
                    relations: 12,
                    tension: -14,
                    regionalStability: 10,
                    globalTrust: 8
                }),
                {
                    risk: "medium",
                    delayed: true,
                    score: 20
                }
            ),

            makeChoice(
                "neutral_position",
                "موضع بی‌طرف",
                "دولت از ورود مستقیم به اختلافات خودداری می‌کند.",
                effects({
                    stability: 5,
                    relations: 2,
                    tension: -3,
                    globalTrust: 2,
                    popularity: 2
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "economic_shield",
                "سپر اقتصادی",
                "دولت منابع را برای کاهش اثرات اقتصادی بحران اختصاص می‌دهد.",
                effects({
                    money: -150,
                    economy: 5,
                    market: 7,
                    stability: 6,
                    tension: 1
                }),
                {
                    risk: "medium"
                }
            )
        ]
    },


    /* =====================================================
       WEATHER
    ===================================================== */

    {
        id: "major_storm",
        type: "weather",
        category: "climate",
        severity: 4,
        tags: ["weather", "climate"],

        title: "طوفان شدید",
        description:
            "یک سامانه آب‌وهوایی شدید بخش‌هایی از کشور را تحت تأثیر قرار داده و زیرساخت‌ها نیازمند مدیریت فوری هستند.",

        news:
            "سامانه آب‌وهوایی شدید وارد کشور شد.",

        ticker:
            "هواشناسی | هشدار سامانه شدید جوی",

        choices: [
            makeChoice(
                "emergency_budget",
                "بودجه اضطراری",
                "منابع فوری برای پشتیبانی از مناطق آسیب‌دیده اختصاص می‌یابد.",
                effects({
                    money: -120,
                    stability: 7,
                    popularity: 6,
                    climatePressure: -2
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "infrastructure_focus",
                "تمرکز زیرساختی",
                "دولت منابع را روی زیرساخت‌های حساس متمرکز می‌کند.",
                effects({
                    money: -90,
                    electricity: 5,
                    economy: 4,
                    stability: 5
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            ),

            makeChoice(
                "regional_coordination",
                "هماهنگی منطقه‌ای",
                "دولت از مناطق همسایه برای مدیریت بحران کمک می‌گیرد.",
                effects({
                    money: -40,
                    relations: 8,
                    diplomacy: 5,
                    stability: 6,
                    regionalStability: 4
                }),
                {
                    risk: "medium"
                }
            )
        ]
    },


    /* =====================================================
       FLOOD
    ===================================================== */

    {
        id: "urban_flood",
        type: "flood",
        category: "climate",
        severity: 4,
        tags: ["flood", "infrastructure"],

        title: "سیلاب شهری",
        description:
            "بارش سنگین باعث ایجاد اختلال در برخی مناطق شهری و فشار بر زیرساخت‌های عمومی شده است.",

        news:
            "سامانه‌های شهری برای مدیریت سیلاب فعال شدند.",

        ticker:
            "هشدار | مدیریت سیلاب در چند منطقه آغاز شد",

        choices: [
            makeChoice(
                "rapid_response",
                "واکنش سریع",
                "دولت بودجه اضطراری را برای مدیریت بحران اختصاص می‌دهد.",
                effects({
                    money: -100,
                    stability: 8,
                    popularity: 7
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "infrastructure_repair",
                "بازسازی",
                "دولت علاوه بر مدیریت فوری، تعمیرات زیرساختی را آغاز می‌کند.",
                effects({
                    money: -140,
                    stability: 5,
                    economy: 6,
                    climatePressure: -3
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            ),

            makeChoice(
                "prevention_plan",
                "طرح پیشگیری",
                "به‌جای هزینه سنگین فوری، یک برنامه بلندمدت پیشگیری طراحی می‌شود.",
                effects({
                    money: -60,
                    stability: 2,
                    economy: 3,
                    climatePressure: -6
                }),
                {
                    risk: "high",
                    delayed: true,
                    score: 12
                }
            )
        ]
    },


    /* =====================================================
       MEDIA
    ===================================================== */

    {
        id: "media_scandal",
        type: "media",
        category: "politics",
        severity: 3,
        tags: ["media", "scandal"],

        title: "رسوایی رسانه‌ای",
        description:
            "اسناد و گزارش‌هایی درباره عملکرد یکی از نهادهای دولتی منتشر شده و فضای رسانه‌ای کشور ملتهب شده است.",

        news:
            "یک پرونده رسانه‌ای بزرگ فضای سیاسی کشور را تحت تأثیر قرار داد.",

        ticker:
            "رسانه | پرونده جنجالی جدید منتشر شد",

        choices: [
            makeChoice(
                "transparent_response",
                "شفاف‌سازی",
                "دولت اطلاعات موجود را منتشر کرده و روند بررسی را علنی می‌کند.",
                effects({
                    popularity: 5,
                    stability: 6,
                    mediaNoise: -8,
                    globalTrust: 4
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "independent_review",
                "بررسی مستقل",
                "پرونده به یک کمیته مستقل سپرده می‌شود.",
                effects({
                    stability: 8,
                    mediaNoise: -5,
                    popularity: 3
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            ),

            makeChoice(
                "political_defense",
                "دفاع سیاسی",
                "دولت از عملکرد خود دفاع می‌کند و پرونده را سیاسی می‌داند.",
                effects({
                    popularity: 1,
                    mediaNoise: 7,
                    stability: -4,
                    relations: -2
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       PARLIAMENT
    ===================================================== */

    {
        id: "parliament_dispute",
        type: "politics",
        category: "institutions",
        severity: 3,
        tags: ["parliament", "politics"],

        title: "اختلاف در پارلمان",
        description:
            "اختلاف بر سر یک طرح اقتصادی باعث شده روند تصمیم‌گیری در پارلمان کند شود.",

        news:
            "اختلاف سیاسی در پارلمان افزایش یافت.",

        ticker:
            "سیاست داخلی | اختلاف نمایندگان بر سر طرح اقتصادی",

        choices: [
            makeChoice(
                "coalition",
                "ائتلاف‌سازی",
                "دولت برای پیدا کردن نقطه مشترک با گروه‌های مختلف مذاکره می‌کند.",
                effects({
                    money: -30,
                    stability: 8,
                    popularity: 2,
                    relations: 5
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "public_explanation",
                "توضیح عمومی",
                "دولت جزئیات طرح را برای افکار عمومی توضیح می‌دهد.",
                effects({
                    popularity: 6,
                    mediaNoise: -2,
                    stability: 3
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "wait_vote",
                "انتظار برای رأی",
                "دولت از مداخله بیشتر خودداری می‌کند.",
                effects({
                    stability: -2,
                    economy: -2,
                    mediaNoise: 3
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       INSTITUTIONAL CRISIS
    ===================================================== */

    {
        id: "institutional_deadlock",
        type: "institution",
        category: "institutions",
        severity: 4,
        tags: ["institution", "politics"],

        title: "بن‌بست نهادی",
        description:
            "چند نهاد مهم بر سر مسئولیت یک تصمیم اختلاف پیدا کرده‌اند و روند اداره کشور کند شده است.",

        news:
            "اختلاف میان نهادهای اصلی وارد مرحله جدیدی شد.",

        ticker:
            "حکمرانی | بن‌بست میان چند نهاد دولتی",

        choices: [
            makeChoice(
                "coordination_council",
                "شورای هماهنگی",
                "یک نشست مشترک برای تعیین مسیر مشترک برگزار می‌شود.",
                effects({
                    money: -25,
                    stability: 9,
                    relations: 6,
                    popularity: 2
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "clear_authority",
                "تعیین مسئولیت",
                "مسئولیت هر نهاد به‌صورت شفاف مشخص می‌شود.",
                effects({
                    stability: 7,
                    economy: 3,
                    popularity: -1
                }),
                {
                    risk: "medium",
                    delayed: true
                }
            ),

            makeChoice(
                "political_pressure",
                "فشار سیاسی",
                "دولت تلاش می‌کند سریع‌تر تصمیم را از مسیر سیاسی پیش ببرد.",
                effects({
                    stability: -3,
                    popularity: 4,
                    mediaNoise: 5,
                    relations: -3
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       INFRASTRUCTURE
    ===================================================== */

    {
        id: "infrastructure_failure",
        type: "infrastructure",
        category: "infrastructure",
        severity: 4,
        tags: ["infrastructure", "economy"],

        title: "اختلال زیرساختی",
        description:
            "اختلال در بخشی از زیرساخت‌های عمومی باعث کاهش موقت بهره‌وری اقتصادی شده است.",

        news:
            "اختلال زیرساختی در چند منطقه گزارش شد.",

        ticker:
            "زیرساخت | اختلال موقت در خدمات عمومی",

        choices: [
            makeChoice(
                "repair_now",
                "تعمیر فوری",
                "منابع فوری برای بازگرداندن خدمات اختصاص داده می‌شود.",
                effects({
                    money: -100,
                    economy: 5,
                    stability: 6,
                    electricity: 4
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "upgrade_system",
                "ارتقای سیستم",
                "دولت همزمان با تعمیر، سیستم را به شکل اساسی ارتقا می‌دهد.",
                effects({
                    money: -150,
                    economy: 8,
                    stability: 7,
                    electricity: 7
                }),
                {
                    risk: "medium",
                    delayed: true,
                    score: 14
                }
            ),

            makeChoice(
                "temporary_management",
                "مدیریت موقت",
                "دولت با منابع محدود شرایط را تا زمان رفع مشکل مدیریت می‌کند.",
                effects({
                    money: -30,
                    economy: -3,
                    stability: 1,
                    electricity: -3
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       ABSURD
    ===================================================== */

    {
        id: "absurd_bureaucracy",
        type: "absurd",
        category: "absurd",
        severity: 2,
        tags: ["absurd", "fun"],

        title: "بحران عجیب فرم شماره ۷",
        description:
            "یک اداره اعلام کرده بدون فرم شماره ۷ هیچ کاری انجام نمی‌شود؛ مشکل اینجاست که هیچ‌کس نمی‌داند فرم شماره ۷ دقیقاً چیست.",

        news:
            "بحران عجیب فرم شماره ۷ کشور را درگیر کرد.",

        ticker:
            "خبر عجیب | کسی نمی‌داند فرم شماره ۷ کجاست",

        choices: [
            makeChoice(
                "find_form",
                "پیدا کردن فرم",
                "دولت یک تیم ویژه برای پیدا کردن فرم تشکیل می‌دهد.",
                effects({
                    money: -20,
                    popularity: 3,
                    stability: 2
                }),
                {
                    risk: "low"
                }
            ),

            makeChoice(
                "cancel_form",
                "لغو فرم",
                "دولت اعلام می‌کند از امروز فرم شماره ۷ وجود خارجی ندارد.",
                effects({
                    popularity: 7,
                    stability: 5,
                    mediaNoise: 3
                }),
                {
                    risk: "medium"
                }
            ),

            makeChoice(
                "create_form",
                "ساخت فرم جدید",
                "دولت یک فرم جدید طراحی می‌کند که حتی از قبلی هم پیچیده‌تر است.",
                effects({
                    money: -10,
                    popularity: -4,
                    mediaNoise: 6,
                    stability: -2
                }),
                {
                    risk: "high"
                }
            )
        ]
    },


    /* =====================================================
       ABSURD MARKET
    ===================================================== */

    {
        id: "absurd_currency",
        type: "absurd",
        category: "economy",
      /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0
   PART 3 / 8
   DECISION ENGINE + STATS + RELATIONS + INSTITUTIONS
   ========================================================= */


/* =========================================================
   SAFE STATE HELPERS
========================================================= */

function ensureStateCollections() {

    if (!STATE.players) {
        STATE.players = [];
    }

    if (!Array.isArray(STATE.history)) {
        STATE.history = [];
    }

    if (!Array.isArray(STATE.ledger)) {
        STATE.ledger = [];
    }

    if (!Array.isArray(STATE.delayedConsequences)) {
        STATE.delayedConsequences = [];
    }

    if (!Array.isArray(STATE.activeCrises)) {
        STATE.activeCrises = [];
    }

    if (!Array.isArray(STATE.worldEvents)) {
        STATE.worldEvents = [];
    }

    if (!Array.isArray(STATE.milestoneHistory)) {
        STATE.milestoneHistory = [];
    }

    if (!Array.isArray(STATE.achievements)) {
        STATE.achievements = [];
    }

    if (!STATE.institutions) {
        STATE.institutions = createInstitutions();
    }

    if (!STATE.relations) {
        STATE.relations = {};
    }

    if (!STATE.world) {
        STATE.world = clone(DEFAULT_WORLD);
    }
}


/* =========================================================
   SAFE PLAYER NORMALIZATION
========================================================= */

function ensurePlayerCollections(player) {

    if (!player) {
        return;
    }

    if (!Array.isArray(player.decisions)) {
        player.decisions = [];
    }

    if (!Array.isArray(player.achievements)) {
        player.achievements = [];
    }

    if (!Array.isArray(player.ledger)) {
        player.ledger = [];
    }

    if (!Array.isArray(player.milestones)) {
        player.milestones = [];
    }

    if (!Array.isArray(player.history)) {
        player.history = [];
    }

    if (!Array.isArray(player.relationships)) {
        player.relationships = [];
    }

    if (!Array.isArray(player.flags)) {
        player.flags = [];
    }

    player.score = num(
        player.score,
        0
    );

    player.reputation = num(
        player.reputation,
        50
    );

    player.victories = num(
        player.victories,
        0
    );

    player.losses = num(
        player.losses,
        0
    );

    player.crisisCount = num(
        player.crisisCount,
        0
    );

    player.solvedCrises = num(
        player.solvedCrises,
        0
    );
}


/* =========================================================
   STAT KEYS
========================================================= */

const PLAYER_STAT_KEYS = [
    "money",
    "economy",
    "electricity",
    "popularity",
    "stability",
    "sanctions",
    "relations"
];

const WORLD_STAT_KEYS = [
    "tension",
    "market",
    "energy",
    "diplomacy",
    "publicMood",
    "mediaNoise",
    "regionalStability",
    "globalTrust",
    "inflation",
    "foodSecurity",
    "climatePressure"
];


/* =========================================================
   STAT LIMITS
========================================================= */

function normalizeWorldStats() {

    ensureStateCollections();

    const world = STATE.world;

    for (
        const key
        of WORLD_STAT_KEYS
    ) {

        if (
            typeof world[key] !== "number" ||
            Number.isNaN(world[key])
        ) {
            world[key] =
                num(
                    DEFAULT_WORLD[key],
                    0
                );
        }

        /*
         * Money-like world values are not used here.
         * All world indicators are percentages/indexes.
         */
        world[key] = clamp(
            world[key],
            0,
            100
        );
    }
}


function normalizePlayerStatsSafe(player) {

    if (!player) {
        return;
    }

    ensurePlayerCollections(player);

    /*
     * Money is deliberately allowed to go negative temporarily,
     * but we prevent impossible NaN/Infinity values.
     */
    player.money = num(
        player.money,
        1000
    );

    if (
        !Number.isFinite(
            player.money
        )
    ) {
        player.money = 1000;
    }

    const boundedStats = [
        "economy",
        "electricity",
        "popularity",
        "stability",
        "sanctions",
        "relations"
    ];

    for (
        const key
        of boundedStats
    ) {

        player[key] = clamp(
            num(
                player[key],
                50
            ),
            0,
            100
        );
    }
}


/* =========================================================
   RELATION KEY
========================================================= */

function relationKey(
    playerAId,
    playerBId
) {

    if (
        !playerAId ||
        !playerBId
    ) {
        return null;
    }

    if (
        playerAId === playerBId
    ) {
        return null;
    }

    return [
        String(playerAId),
        String(playerBId)
    ]
        .sort()
        .join("::");
}


/* =========================================================
   INITIALIZE PLAYER RELATIONS
========================================================= */

function ensurePlayerRelations() {

    ensureStateCollections();

    const players =
        Array.isArray(STATE.players)
            ? STATE.players
            : [];

    if (!STATE.relations) {
        STATE.relations = {};
    }

    for (
        let i = 0;
        i < players.length;
        i++
    ) {

        const a =
            players[i];

        if (!a) {
            continue;
        }

        ensurePlayerCollections(a);

        for (
            let j = i + 1;
            j < players.length;
            j++
        ) {

            const b =
                players[j];

            if (!b) {
                continue;
            }

            const key =
                relationKey(
                    a.id,
                    b.id
                );

            if (!key) {
                continue;
            }

            if (
                typeof STATE.relations[key]
                !== "number"
            ) {
                STATE.relations[key] = 50;
            }
        }
    }
}


/* =========================================================
   GET RELATION
========================================================= */

function getPlayerRelation(
    playerAId,
    playerBId
) {

    if (
        playerAId === playerBId
    ) {
        return 100;
    }

    ensurePlayerRelations();

    const key =
        relationKey(
            playerAId,
            playerBId
        );

    if (!key) {
        return 50;
    }

    return clamp(
        num(
            STATE.relations[key],
            50
        ),
        0,
        100
    );
}


/* =========================================================
   SET RELATION
========================================================= */

function setPlayerRelation(
    playerAId,
    playerBId,
    value
) {

    if (
        !playerAId ||
        !playerBId ||
        playerAId === playerBId
    ) {
        return;
    }

    ensurePlayerRelations();

    const key =
        relationKey(
            playerAId,
            playerBId
        );

    if (!key) {
        return;
    }

    STATE.relations[key] =
        clamp(
            num(value, 50),
            0,
            100
        );
}


/* =========================================================
   CHANGE RELATION
========================================================= */

function changePlayerRelation(
    playerAId,
    playerBId,
    delta
) {

    const current =
        getPlayerRelation(
            playerAId,
            playerBId
        );

    const next =
        clamp(
            current +
            num(delta, 0),
            0,
            100
        );

    setPlayerRelation(
        playerAId,
        playerBId,
        next
    );

    return next;
}


/* =========================================================
   RELATION LABEL
========================================================= */

function getRelationLabel(value) {

    const v =
        num(value, 50);

    if (v >= 85) {
        return "متحد";
    }

    if (v >= 70) {
        return "دوست";
    }

    if (v >= 55) {
        return "مثبت";
    }

    if (v >= 45) {
        return "خنثی";
    }

    if (v >= 30) {
        return "سرد";
    }

    if (v >= 15) {
        return "تنش‌آلود";
    }

    return "خصمانه";
}


/* =========================================================
   INSTITUTION SAFE ACCESS
========================================================= */

function getInstitution(
    institutionId
) {

    ensureStateCollections();

    const institutions =
        STATE.institutions;

    if (
        Array.isArray(institutions)
    ) {

        return institutions.find(
            item =>
                item &&
                (
                    item.id === institutionId ||
                    item.key === institutionId
                )
        ) || null;
    }

    if (
        institutions &&
        typeof institutions === "object"
    ) {

        if (
            institutions[institutionId]
        ) {
            return institutions[
                institutionId
            ];
        }
    }

    return null;
}


/* =========================================================
   INSTITUTION SCORE NORMALIZATION
========================================================= */

function normalizeInstitutions() {

    ensureStateCollections();

    if (
        !Array.isArray(
            STATE.institutions
        )
    ) {
        return;
    }

    for (
        const institution
        of STATE.institutions
    ) {

        if (!institution) {
            continue;
        }

        institution.trust =
            clamp(
                num(
                    institution.trust,
                    50
                ),
                0,
                100
            );

        institution.support =
            clamp(
                num(
                    institution.support,
                    50
                ),
                0,
                100
            );

        institution.influence =
            clamp(
                num(
                    institution.influence,
                    50
                ),
                0,
                100
            );

        if (
            typeof institution.mood
            !== "string"
        ) {
            institution.mood =
                "neutral";
        }
    }
}


/* =========================================================
   INSTITUTION MOOD
========================================================= */

function updateInstitutionMood(
    institution
) {

    if (!institution) {
        return;
    }

    const support =
        num(
            institution.support,
            50
        );

    if (support >= 75) {
        institution.mood =
            "supportive";
    }
    else if (support >= 55) {
        institution.mood =
            "positive";
    }
    else if (support >= 45) {
        institution.mood =
            "neutral";
    }
    else if (support >= 25) {
        institution.mood =
            "concerned";
    }
    else {
        institution.mood =
            "opposed";
    }
}


/* =========================================================
   CHANGE INSTITUTION
========================================================= */

function changeInstitution(
    institutionId,
    changes = {}
) {

    const institution =
        getInstitution(
            institutionId
        );

    if (!institution) {
        return null;
    }

    institution.trust =
        clamp(
            num(
                institution.trust,
                50
            ) +
            num(
                changes.trust,
                0
            ),
            0,
            100
        );

    institution.support =
        clamp(
            num(
                institution.support,
                50
            ) +
            num(
                changes.support,
                0
            ),
            0,
            100
        );

    institution.influence =
        clamp(
            num(
                institution.influence,
                50
            ) +
            num(
                changes.influence,
                0
            ),
            0,
            100
        );

    updateInstitutionMood(
        institution
    );

    return institution;
}


/* =========================================================
   INSTITUTION EFFECTS BY EVENT TYPE
========================================================= */

function applyInstitutionEventEffects(
    event,
    choice
) {

    if (
        !event ||
        !choice
    ) {
        return;
    }

    ensureStateCollections();
    normalizeInstitutions();

    const type =
        event.type;

    const positive =
        num(
            choice.effects.stability,
            0
        ) +
        num(
            choice.effects.popularity,
            0
        ) +
        num(
            choice.effects.economy,
            0
        );

    const negative =
        num(
            choice.effects.sanctions,
            0
        ) +
        Math.abs(
            Math.min(
                0,
                num(
                    choice.effects.stability,
                    0
                )
            )
        );

    if (type === "economy") {

        changeInstitution(
            "business",
            {
                support:
                    positive - negative,
                trust: 1
            }
        );

        changeInstitution(
            "parliament",
            {
                support:
                    positive / 2
            }
        );
    }

    if (type === "inflation") {

        changeInstitution(
            "business",
            {
                support:
                    num(
                        choice.effects.economy,
                        0
                    ),
                trust:
                    num(
                        choice.effects.market,
                        0
                    ) / 2
            }
        );

        changeInstitution(
            "public",
            {
                support:
                    num(
                        choice.effects.popularity,
                        0
                    )
            }
        );
    }

    if (
        type === "protest" ||
        type === "strike"
    ) {

        changeInstitution(
            "civil",
            {
                support:
                    positive,
                trust:
                    positive / 2
            }
        );

        changeInstitution(
            "media",
            {
                support:
                    num(
                        choice.effects.mediaNoise,
                        0
                    ) * -1,
                trust:
                    num(
                        choice.effects.popularity,
                        0
                    )
            }
        );
    }

    if (
        type === "diplomacy" ||
        type === "sanctions" ||
        type === "regional" ||
        type === "conflict"
    ) {

        changeInstitution(
            "executive",
            {
                support:
                    num(
                        choice.effects.diplomacy,
                        0
                    ) / 2
            }
        );

        changeInstitution(
            "academia",
            {
                trust:
                    num(
                        choice.effects.globalTrust,
                        0
                    ) / 2
            }
        );
    }

    if (
        type === "media"
    ) {

        changeInstitution(
            "media",
            {
                trust:
                    num(
                        choice.effects.popularity,
                        0
                    ),
                support:
                    -num(
                        choice.effects.mediaNoise,
                        0
                    )
            }
        );

        changeInstitution(
            "judiciary",
            {
                trust:
                    num(
                        choice.effects.stability,
                        0
                    ) / 2
            }
        );
    }

    if (
        type === "institution" ||
        type === "politics"
    ) {

        changeInstitution(
            "parliament",
            {
                support:
                    num(
                        choice.effects.stability,
                        0
                    ),
                trust:
                    num(
                        choice.effects.relations,
                        0
                    ) / 2
            }
        );

        changeInstitution(
            "judiciary",
            {
                trust:
                    num(
                        choice.effects.stability,
                        0
                    ) / 2
            }
        );
    }

    if (
        type === "weather" ||
        type === "flood" ||
        type === "water"
    ) {

        changeInstitution(
            "civil",
            {
                support:
                    positive,
                trust:
                    positive / 2
            }
        );

        changeInstitution(
            "academia",
            {
                support:
                    num(
                        choice.effects.climatePressure,
                        0
                    ) * -1
            }
        );
    }

    normalizeInstitutions();
}


/* =========================================================
   APPLY PLAYER EFFECTS
========================================================= */

function applyPlayerEffects(
    player,
    effectData = {}
) {

    if (!player) {
        return {};
    }

    ensurePlayerCollections(
        player
    );

    const before = {
        money:
            num(player.money, 0),

        economy:
            num(player.economy, 0),

        electricity:
            num(player.electricity, 0),

        popularity:
            num(player.popularity, 0),

        stability:
            num(player.stability, 0),

        sanctions:
            num(player.sanctions, 0),

        relations:
            num(player.relations, 0)
    };

    player.money =
        num(player.money, 0) +
        num(effectData.money, 0);

    player.economy =
        clamp(
            num(player.economy, 50) +
            num(effectData.economy, 0),
            0,
            100
        );

    player.electricity =
        clamp(
            num(player.electricity, 50) +
            num(effectData.electricity, 0),
            0,
            100
        );

    player.popularity =
        clamp(
            num(player.popularity, 50) +
            num(effectData.popularity, 0),
            0,
            100
        );

    player.stability =
        clamp(
            num(player.stability, 50) +
            num(effectData.stability, 0),
            0,
            100
        );

    player.sanctions =
        clamp(
            num(player.sanctions, 0) +
            num(effectData.sanctions, 0),
            0,
            100
        );

    player.relations =
        clamp(
            num(player.relations, 50) +
            num(effectData.relations, 0),
            0,
            100
        );

    normalizePlayerStatsSafe(
        player
    );

    return {
        money:
            player.money - before.money,

        economy:
            player.economy - before.economy,

        electricity:
            player.electricity -
            before.electricity,

        popularity:
            player.popularity -
            before.popularity,

        stability:
            player.stability -
            before.stability,

        sanctions:
            player.sanctions -
            before.sanctions,

        relations:
            player.relations -
            before.relations
    };
}


/* =========================================================
   APPLY WORLD EFFECTS
========================================================= */

function applyWorldEffects(
    effectData = {}
) {

    ensureStateCollections();

    normalizeWorldStats();

    const world =
        STATE.world;

    const before = {};

    for (
        const key
        of WORLD_STAT_KEYS
    ) {
        before[key] =
            num(
                world[key],
                0
            );
    }

    for (
        const key
        of WORLD_STAT_KEYS
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                effectData,
                key
            )
        ) {

            world[key] =
                num(
                    world[key],
                    0
                ) +
                num(
                    effectData[key],
                    0
                );
        }
    }

    normalizeWorldStats();

    const delta = {};

    for (
        const key
        of WORLD_STAT_KEYS
    ) {

        delta[key] =
            world[key] -
            before[key];
    }

    return delta;
}


/* =========================================================
   APPLY CROSS-PLAYER RELATIONS
========================================================= */

function applyChoiceRelations(
    player,
    choice
) {

    if (
        !player ||
        !choice
    ) {
        return;
    }

    ensurePlayerRelations();

    /*
     * A diplomatic choice may influence
     * relations with other players.
     */
    const diplomacyDelta =
        num(
            choice.effects.relations,
            0
        );

    if (
        diplomacyDelta === 0
    ) {
        return;
    }

    for (
        const other
        of STATE.players
    ) {

        if (
            !other ||
            other.id === player.id
        ) {
            continue;
        }

        /*
         * Smaller effect per external player.
         */
        const delta =
            clamp(
                diplomacyDelta * 0.25,
                -8,
                8
            );

        changePlayerRelation(
            player.id,
            other.id,
            delta
        );
    }
}


/* =========================================================
   WORLD EFFECT TRANSLATION
========================================================= */

function deriveWorldEffects(
    playerEffects = {}
) {

    return {

        /*
         * Economy affects market.
         */
        market:
            num(
                playerEffects.economy,
                0
            ) * 0.20,

        /*
         * Sanctions affect global trust
         * and market.
         */
        globalTrust:
            -num(
                playerEffects.sanctions,
                0
            ) * 0.35,

        /*
         * Popularity influences public mood.
         */
        publicMood:
            num(
                playerEffects.popularity,
                0
            ) * 0.25,

        /*
         * Stability influences regional stability.
         */
        regionalStability:
            num(
                playerEffects.stability,
                0
            ) * 0.20,

        /*
         * Diplomatic relations reduce tension.
         */
        tension:
            -num(
                playerEffects.relations,
                0
            ) * 0.15
    };
}


/* =========================================================
   SCORE CALCULATION
========================================================= */

function calculateDecisionScore(
    player,
    choice,
    event
) {

    if (
        !player ||
        !choice
    ) {
        return 0;
    }

    const e =
        choice.effects || {};

    let score = 0;

    score +=
        num(e.economy, 0) * 2;

    score +=
        num(e.stability, 0) * 2;

    score +=
        num(e.popularity, 0) * 1.5;

    score +=
        num(e.relations, 0) * 1.5;

    score +=
        num(e.electricity, 0);

    score +=
        num(e.money, 0) / 50;

    score -=
        num(e.sanctions, 0) * 2;

    /*
     * Difficult events reward smart handling.
     */
    if (
        event &&
        num(event.severity, 0) >= 4
    ) {
        score *= 1.25;
    }

    /*
     * Delayed strategic choices receive
     * a small bonus.
     */
    if (
        choice.meta &&
        choice.meta.delayed
    ) {
        score += 3;
    }

    score +=
        num(
            choice.meta &&
            choice.meta.score,
            0
        );

    return Math.round(
        score
    );
}


/* =========================================================
   DECISION RECORD
========================================================= */

function createDecisionRecord(
    player,
    event,
    choice,
    playerDelta,
    worldDelta
) {

    return {

        id:
            uid("decision"),

        playerId:
            player.id,

        stage:
            STATE.stage,

        eventId:
            event.id,

        eventTitle:
            event.title,

        eventType:
            event.type,

        choiceId:
            choice.id,

        choiceTitle:
            choice.title,

        choiceDescription:
            choice.description,

        playerDelta:
            clone(
                playerDelta
            ),

        worldDelta:
            clone(
                worldDelta
            ),

        score:
            calculateDecisionScore(
                player,
                choice,
                event
            ),

        timestamp:
            Date.now()
    };
}


/* =========================================================
   PLAYER LEDGER ENTRY
========================================================= */

function addPlayerLedgerEntry(
    player,
    record
) {

    if (
        !player ||
        !record
    ) {
        return;
    }

    ensurePlayerCollections(
        player
    );

    player.ledger.push({
        id:
            record.id,

        stage:
            record.stage,

        title:
            record.eventTitle,

        decision:
            record.choiceTitle,

        score:
            record.score,

        effects:
            clone(
                record.playerDelta
            ),

        timestamp:
            record.timestamp
    });

    if (
        player.ledger.length > 150
    ) {
        player.ledger =
            player.ledger.slice(-120);
    }
}


/* =========================================================
   GLOBAL LEDGER ENTRY
========================================================= */

function addGlobalLedgerEntry(
    record
) {

    ensureStateCollections();

    STATE.ledger.push(
        clone(record)
    );

    if (
        STATE.ledger.length > 300
    ) {
        STATE.ledger =
            STATE.ledger.slice(-250);
    }
}


/* =========================================================
   PLAYER DECISION HISTORY
========================================================= */

function addPlayerDecision(
    player,
    record
) {

    if (
        !player ||
        !record
    ) {
        return;
    }

    ensurePlayerCollections(
        player
    );

    player.decisions.push({
        id:
            record.id,

        stage:
            record.stage,

        eventId:
            record.eventId,

        eventTitle:
            record.eventTitle,

        choiceId:
            record.choiceId,

        choiceTitle:
            record.choiceTitle,

        score:
            record.score,

        timestamp:
            record.timestamp
    });

    player.history.push({
        type:
            "decision",

        stage:
            record.stage,

        title:
            record.choiceTitle,

        event:
            record.eventTitle,

        timestamp:
            record.timestamp
    });

    if (
        player.decisions.length > 100
    ) {
        player.decisions =
            player.decisions.slice(-80);
    }

    if (
        player.history.length > 150
    ) {
        player.history =
            player.history.slice(-120);
    }
}


/* =========================================================
   APPLY REPUTATION
========================================================= */

function updatePlayerReputation(
    player,
    choice,
    event,
    decisionScore
) {

    if (
        !player
    ) {
        return;
    }

    let delta =
        num(
            choice &&
            choice.meta &&
            choice.meta.reputation,
            0
        );

    /*
     * Good stability/popularity outcomes
     * improve reputation.
     */
    if (
        choice &&
        choice.effects
    ) {

        delta +=
            num(
                choice.effects.stability,
                0
            ) * 0.20;

        delta +=
            num(
                choice.effects.popularity,
                0
            ) * 0.20;

        delta -=
            num(
                choice.effects.sanctions,
                0
            ) * 0.25;
    }

    if (
        event &&
        event.severity >= 4 &&
        decisionScore > 10
    ) {
        delta += 2;
    }

    player.reputation =
        clamp(
            num(
                player.reputation,
                50
            ) +
            delta,
            0,
            100
        );
}


/* =========================================================
   APPLY SCORE
========================================================= */

function applyDecisionScore(
    player,
    score
) {

    if (!player) {
        return;
    }

    player.score =
        Math.max(
            0,
            num(
                player.score,
                0
            ) +
            num(score, 0)
        );
}


/* =========================================================
   CRISIS HANDLING AFTER DECISION
========================================================= */

function processDecisionCrisis(
    player,
    event,
    choice
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return;
    }

    /*
     * Some decisions solve the current crisis.
     */
    const choiceId =
        String(
            choice.id || ""
        );

    const solvesKeywords = [
        "dialogue",
        "negotiate",
        "invest",
        "repair",
        "transparent",
        "independent",
        "peace",
        "coordination",
        "upgrade",
        "support",
        "prevention"
    ];

    let shouldResolve =
        false;

    for (
        const keyword
        of solvesKeywords
    ) {

        if (
            choiceId
                .toLowerCase()
                .includes(keyword)
        ) {
            shouldResolve = true;
            break;
        }
    }

    /*
     * Strong stability decisions can also
     * count as crisis management.
     */
    if (
        num(
            choice.effects.stability,
            0
        ) >= 7
    ) {
        shouldResolve = true;
    }

    if (
        shouldResolve
    ) {

        const crisis =
            STATE.activeCrises.find(
                item =>
                    item &&
                    item.active &&
                    item.playerId === player.id &&
                    item.eventId === event.id
            );

        if (crisis) {
            resolveCrisis(
                crisis.id,
                player.id
            );
        }
    }
}


/* =========================================================
   CREATE CRISIS IF NECESSARY
========================================================= */

function processNewCrisis(
    player,
    event,
    choice
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return;
    }

    /*
     * High severity events can create
     * persistent crises.
     */
    const severe =
        num(
            event.severity,
            0
        ) >= 4;

    const negative =
        num(
            choice.effects.stability,
            0
        ) < -2 ||
        num(
            choice.effects.economy,
            0
        ) < -3 ||
        num(
            choice.effects.popularity,
            0
        ) < -4;

    if (
        !severe &&
        !negative
    ) {
        return;
    }

    /*
     * Do not duplicate the same active crisis.
     */
    const duplicate =
        STATE.activeCrises.some(
            crisis =>
                crisis &&
                crisis.active &&
                crisis.playerId === player.id &&
                crisis.eventId === event.id
        );

    if (
        duplicate
    ) {
        return;
    }

    const crisis =
        createCrisisFromEvent(
            event,
            player
        );

    if (!crisis) {
        return;
    }

    addCrisis(
        crisis
    );

    player.crisisCount =
        num(
            player.crisisCount,
            0
        ) + 1;
}


/* =========================================================
   DELAYED CONSEQUENCE CREATION
========================================================= */

function processDelayedDecision(
    player,
    event,
    choice
) {

    const delayed =
        createDelayedConsequence(
            player,
            event,
            choice
        );

    if (!delayed) {
        return;
    }

    addDelayedConsequence(
        delayed
    );
}


/* =========================================================
   WORLD EVENT CREATION FROM DECISION
========================================================= */

function createWorldEventFromDecision(
    player,
    event,
    choice,
    worldDelta
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return;
    }

    const meaningful =
        Math.abs(
            num(worldDelta.tension, 0)
        ) >= 2 ||
        Math.abs(
            num(worldDelta.market, 0)
        ) >= 2 ||
        Math.abs(
            num(worldDelta.diplomacy, 0)
        ) >= 2 ||
        Math.abs(
            num(worldDelta.globalTrust, 0)
        ) >= 2;

    if (!meaningful) {
        return;
    }

    addWorldEvent({
        title:
            choice.title,

        type:
            event.type,

        description:
            `تصمیم دولت ${player.country || "کشور"} اثراتی بر وضعیت جهان گذاشت.`
    });
}


/* =========================================================
   APPLY FULL DECISION
========================================================= */

function applyDecision(
    player,
    event,
    choice
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return {
            ok: false,
            reason: "missing-data"
        };
    }

    if (
        !choice.effects
    ) {
        return {
            ok: false,
            reason: "missing-effects"
        };
    }

    ensureStateCollections();
    ensurePlayerCollections(
        player
    );

    normalizePlayerStatsSafe(
        player
    );

    normalizeWorldStats();

    /*
     * 1. Player effects.
     */
    const playerDelta =
        applyPlayerEffects(
            player,
            choice.effects
        );

    /*
     * 2. World effects.
     */
    const translatedWorld =
        deriveWorldEffects(
            playerDelta
        );

    const combinedWorldEffects = {
        ...choice.effects,
        ...translatedWorld
    };

    const worldDelta =
        applyWorldEffects(
            combinedWorldEffects
        );

    /*
     * 3. Cross-player diplomacy.
     */
    applyChoiceRelations(
        player,
        choice
    );

    /*
     * 4. Institutions.
     */
    applyInstitutionEventEffects(
        event,
        choice
    );

    /*
     * 5. Score.
     */
    const decisionScore =
        calculateDecisionScore(
            player,
            choice,
            event
        );

    applyDecisionScore(
        player,
        decisionScore
    );

    /*
     * 6. Reputation.
     */
    updatePlayerReputation(
        player,
        choice,
        event,
        decisionScore
    );

    /*
     * 7. Crisis logic.
     */
    processDecisionCrisis(
        player,
        event,
        choice
    );

    processNewCrisis(
        player,
        event,
        choice
    );

    /*
     * 8. Delayed consequences.
     */
    processDelayedDecision(
        player,
        event,
        choice
    );

    /*
     * 9. Decision record.
     */
    const record =
        createDecisionRecord(
            player,
            event,
            choice,
            playerDelta,
            worldDelta
        );

    /*
     * 10. Histories.
     */
    addPlayerDecision(
        player,
        record
    );

    addPlayerLedgerEntry(
        player,
        record
    );

    addGlobalLedgerEntry(
        record
    );

    /*
     * 11. World history.
     */
    createWorldEventFromDecision(
        player,
        event,
        choice,
        worldDelta
    );

    /*
     * 12. Mark event.
     */
    markEventUsed(
        event
    );

    /*
     * 13. Global pressure.
     */
    updateWorldPressure();

    updateCrisisPressure();

    /*
     * 14. Milestones / achievements.
     */
    checkPlayerMilestones(
        player,
        event,
        choice,
        record
    );

    checkAchievements(
        player
    );

    /*
     * 15. Final normalization.
     */
    normalizePlayerStatsSafe(
        player
    );

    normalizeWorldStats();

    normalizeInstitutions();

    /*
     * 16. Save locally.
     */
    saveLocalState();

    return {
        ok: true,

        record,

        playerDelta,

        worldDelta,

        decisionScore,

        reputation:
            player.reputation,

        playerScore:
            player.score
    };
}


/* =========================================================
   MILESTONE DEFINITIONS
========================================================= */

const MILESTONE_DEFINITIONS = [

    {
        id: "first_decision",
        title: "اولین تصمیم",
        description:
            "اولین تصمیم مهم ریاست‌جمهوری را ثبت کردی.",
        condition:
            player =>
                player.decisions.length >= 1,
        reward: 10
    },

    {
        id: "five_decisions",
        title: "پنج تصمیم",
        description:
            "پنج تصمیم سیاسی و اقتصادی ثبت شد.",
        condition:
            player =>
                player.decisions.length >= 5,
        reward: 20
    },

    {
        id: "ten_decisions",
        title: "مدیر بحران",
        description:
            "ده تصمیم در شرایط مختلف گرفته شد.",
        condition:
            player =>
                player.decisions.length >= 10,
        reward: 30
    },

    {
        id: "stable_country",
        title: "ثبات ملی",
        description:
            "ثبات کشور به سطح بالایی رسید.",
        condition:
            player =>
                player.stability >= 85,
        reward: 25
    },

    {
        id: "economic_recovery",
        title: "بازگشت اقتصاد",
        description:
            "اقتصاد کشور به سطح بسیار خوبی رسید.",
        condition:
            player =>
                player.economy >= 85,
        reward: 30
    },

    {
        id: "popular_leader",
        title: "رئیس‌جمهور محبوب",
        description:
            "محبوبیت دولت به سطح بالایی رسید.",
        condition:
            player =>
                player.popularity >= 85,
        reward: 30
    },

    {
        id: "diplomatic_power",
        title: "قدرت دیپلماسی",
        description:
            "روابط خارجی کشور تقویت شد.",
        condition:
            player =>
                player.relations >= 85,
        reward: 30
    },

    {
        id: "crisis_survivor",
        title: "بازمانده بحران",
        description:
            "حداقل سه بحران را پشت سر گذاشتی.",
        condition:
            player =>
                player.solvedCrises >= 3,
        reward: 40
    }
];


/* =========================================================
   CHECK PLAYER MILESTONES
========================================================= */

function checkPlayerMilestones(
    player,
    event,
    choice,
    record
) {

    if (!player) {
        return;
    }

    ensurePlayerCollections(
        player
    );

    for (
        const milestone
        of MILESTONE_DEFINITIONS
    ) {

        if (
            !milestone ||
            !milestone.id
        ) {
            continue;
        }

        if (
            player.milestones.includes(
                milestone.id
            )
        ) {
            continue;
        }

        let achieved =
            false;

        try {
            achieved =
                Boolean(
                    milestone.condition(
                        player
                    )
                );
        }
        catch (error) {
            achieved = false;
        }

        if (!achieved) {
            continue;
        }

        player.milestones.push(
            milestone.id
        );

        player.score +=
            num(
                milestone.reward,
                0
            );

        STATE.milestoneHistory.push({
            id:
                uid("milestone"),

            playerId:
                player.id,

            milestoneId:
                milestone.id,

            title:
                milestone.title,

            stage:
                STATE.stage,

            timestamp:
                Date.now()
        });

        /*
         * Keep a visible history.
         */
        player.history.push({
            type:
                "milestone",

            title:
                milestone.title,

            description:
                milestone.description,

            stage:
                STATE.stage,

            timestamp:
                Date.now()
        });
    }
}


/* =========================================================
   ACHIEVEMENT DEFINITIONS
========================================================= */

const ACHIEVEMENT_DEFINITIONS = [

    {
        id: "economic_master",
        title: "استاد اقتصاد",
        description:
            "اقتصاد را حداقل به 90 رساندی.",
        condition:
            player =>
                player.economy >= 90,
        reward: 50
    },

    {
        id: "peace_builder",
        title: "معمار صلح",
        description:
            "روابط خارجی را حداقل به 90 رساندی.",
        condition:
            player =>
                player.relations >= 90,
        reward: 50
    },

    {
        id: "people_first",
        title: "مردم اول",
        description:
            "محبوبیت را حداقل به 90 رساندی.",
        condition:
            player =>
                player.popularity >= 90,
        reward: 50
    },

    {
        id: "strong_state",
        title: "دولت باثبات",
        description:
            "ثبات کشور به 90 رسید.",
        condition:
            player =>
                player.stability >= 90,
        reward: 50
    },

    {
        id: "survive_ten",
        title: "ده مرحله دوام",
        description:
            "تا مرحله دهم زنده ماندی.",
        condition:
            player =>
                STATE.stage >= 10,
        reward: 40
    },

    {
        id: "survive_twenty",
        title: "بیست مرحله",
        description:
            "تا مرحله بیستم ادامه دادی.",
        condition:
            player =>
                STATE.stage >= 20,
        reward: 60
    },

    {
        id: "survive_fifty",
        title: "جمهوری افسانه‌ای",
        description:
            "تمام پنجاه مرحله را پشت سر گذاشتی.",
        condition:
            player =>
                STATE.stage >= 50,
        reward: 150
    }
];


/* =========================================================
   CHECK ACHIEVEMENTS
========================================================= */

function checkAchievements(
    player
) {

    if (!player) {
        return [];
    }

    ensurePlayerCollections(
        player
    );

    const unlocked = [];

    for (
        const achievement
        of ACHIEVEMENT_DEFINITIONS
    ) {

        if (
            !achievement ||
            !achievement.id
        ) {
            continue;
        }

        if (
            player.achievements.includes(
                achievement.id
            )
        ) {
            continue;
        }

        let passed =
            false;

        try {
            passed =
                Boolean(
                    achievement.condition(
                        player
                    )
                );
        }
        catch (error) {
            passed = false;
        }

        if (!passed) {
            continue;
        }

        player.achievements.push(
            achievement.id
        );

        player.score +=
            num(
                achievement.reward,
                0
            );

        unlocked.push(
            achievement
        );

        player.history.push({
            type:
                "achievement",

            title:
                achievement.title,

            description:
                achievement.description,

            stage:
                STATE.stage,

            timestamp:
                Date.now()
        });
    }

    return unlocked;
}


/* =========================================================
   PROCESS ALL PLAYERS ACHIEVEMENTS
========================================================= */

function checkAllAchievements() {

    if (
        !Array.isArray(
            STATE.players
        )
    ) {
        return [];
    }

    const unlocked = [];

    for (
        const player
        of STATE.players
    ) {

        if (!player) {
            continue;
        }

        const result =
            checkAchievements(
                player
            );

        if (
            result.length
        ) {
            unlocked.push(
                ...result.map(
                    item => ({
                        playerId:
                            player.id,

                        achievement:
                            item
                    })
                )
            );
        }
    }

    return unlocked;
}


/* =========================================================
   DECISION QUALITY
========================================================= */

function getDecisionQuality(
    record
) {

    if (!record) {
        return {
            label: "نامشخص",
            className: "neutral"
        };
    }

    const score =
        num(
            record.score,
            0
        );

    if (score >= 25) {
        return {
            label: "استثنایی",
            className: "excellent"
        };
    }

    if (score >= 15) {
        return {
            label: "بسیار خوب",
            className: "great"
        };
    }

    if (score >= 7) {
        return {
            label: "قابل قبول",
            className: "good"
        };
    }

    if (score >= 0) {
        return {
            label: "متوسط",
            className: "neutral"
        };
    }

    return {
        label: "پرریسک",
        className: "danger"
    };
}


/* =========================================================
   PLAYER OVERALL SCORE
========================================================= */

function calculatePlayerFinalScore(
    player
) {

    if (!player) {
        return 0;
    }

    const statsScore =
        (
            num(player.economy, 0) +
            num(player.electricity, 0) +
            num(player.popularity, 0) +
            num(player.stability, 0) +
            num(player.relations, 0)
        ) * 2;

    const moneyScore =
        Math.max(
            -500,
            Math.min(
                1000,
                num(
                    player.money,
                    0
                )
            )
        ) / 10;

    const reputationScore =
        num(
            player.reputation,
            50
        ) * 2;

    const crisisScore =
        num(
            player.solvedCrises,
            0
        ) * 20;

    const achievementScore =
        Array.isArray(
            player.achievements
        )
            ? player.achievements.length * 25
            : 0;

    const milestoneScore =
        Array.isArray(
            player.milestones
        )
            ? player.milestones.length * 15
            : 0;

    return Math.round(
        Math.max(
            0,
            num(player.score, 0) +
            statsScore +
            moneyScore +
            reputationScore +
            crisisScore +
            achievementScore +
            milestoneScore
        )
    );
}


/* =========================================================
   RANK PLAYERS
========================================================= */

function rankPlayers() {

    if (
        !Array.isArray(
            STATE.players
        )
    ) {
        return [];
    }

    return STATE.players
        .map(
            player => ({
                player,
                finalScore:
                    calculatePlayerFinalScore(
                        player
                    )
            })
        )
        .sort(
            (a, b) =>
                b.finalScore -
                a.finalScore
        );
}


/* =========================================================
   DELAYED CONSEQUENCE ENGINE
========================================================= */

function processDueDelayedConsequences() {

    ensureStateCollections();

    const due =
        getDueDelayedConsequences();

    if (!due.length) {
        return [];
    }

    const results = [];

    for (
        const item
        of due
    ) {

        if (!item) {
            continue;
        }

        const player =
            getPlayer(
                item.playerId
            );

        if (!player) {
            markDelayedConsequenceDone(
                item.id
            );
            continue;
        }

        /*
         * Find the original decision.
         */
        const original =
            player.decisions.find(
                decision =>
                    decision &&
                    decision.id === item.eventId
            );

        /*
         * Generate a deterministic,
         * non-graphic consequence.
         */
        const consequence =
            createDelayedOutcome(
                player,
                item
            );

        if (
            consequence
        ) {

            const playerDelta =
                applyPlayerEffects(
                    player,
                    consequence.effects
                );

            const worldDelta =
                applyWorldEffects(
                    consequence.effects
                );

            player.score +=
                num(
                    consequence.score,
                    0
                );

            player.history.push({
                type:
                    "delayed",

                title:
                    consequence.title,

                description:
                    consequence.description,

                stage:
                    STATE.stage,

                timestamp:
                    Date.now()
            });

            STATE.history.push({
                type:
                    "delayed",

                playerId:
                    player.id,

                title:
                    consequence.title,

                stage:
                    STATE.stage,

                timestamp:
                    Date.now()
            });

            results.push({
                item,
                consequence,
                playerDelta,
                worldDelta,
                original
            });
        }

        markDelayedConsequenceDone(
            item.id
        );
    }

    normalizeWorldStats();

    for (
        const player
        of STATE.players
    ) {
        normalizePlayerStatsSafe(
            player
        );
    }

    saveLocalState();

    return results;
}


/* =========================================================
   DELAYED OUTCOME CREATOR
========================================================= */

function createDelayedOutcome(
    player,
    item
) {

    if (
        !player ||
        !item
    ) {
        return null;
    }

    const choiceId =
        String(
            item.choiceId || ""
        );

    /*
     * Economic reform.
     */
    if (
        choiceId ===
        "economic_reform"
    ) {

        return {
            title:
                "اثر اصلاحات اقتصادی",

            description:
                "بخشی از اصلاحات اقتصادی که قبلاً آغاز شده بود، اکنون نتیجه خود را نشان داده است.",

            effects:
                effects({
                    economy: 7,
                    inflation: -5,
                    market: 4,
                    popularity: 2
                }),

            score:
                20
        };
    }

    /*
     * Green transition.
     */
    if (
        choiceId ===
        "green_transition"
    ) {

        return {
            title:
                "نتیجه گذار انرژی",

            description:
                "سرمایه‌گذاری قبلی در زیرساخت انرژی شروع به کاهش فشار روی شبکه کرده است.",

            effects:
                effects({
                    electricity: 8,
                    economy: 4,
                    energy: -8,
                    climatePressure: -5
                }),

            score:
                25
        };
    }

    /*
     * Domestic production.
     */
    if (
        choiceId ===
        "domestic_production"
    ) {

        return {
            title:
                "افزایش ظرفیت تولید داخلی",

            description:
                "برنامه قبلی تولید داخلی باعث شده عرضه برخی کالاها بهتر شود.",

            effects:
                effects({
                    economy: 5,
                    foodSecurity: 7,
                    inflation: -3,
                    popularity: 3
                }),

            score:
                18
        };
    }

    /*
     * Infrastructure upgrade.
     */
    if (
        choiceId ===
        "upgrade_system"
    ) {

        return {
            title:
                "زیرساخت جدید آماده شد",

            description:
                "ارتقای زیرساختی که قبلاً آغاز شده بود، بخشی از مشکلات خدمات عمومی را کاهش داده است.",

            effects:
                effects({
                    economy: 6,
                    electricity: 7,
                    stability: 6
                }),

            score:
                22
        };
    }

    /*
     * Prevention.
     */
    if (
        choiceId ===
        "prevention_plan"
    ) {

        return {
            title:
                "اثر طرح پیشگیری",

            description:
                "برنامه پیشگیرانه قبلی باعث کاهش فشار بحران‌های آب‌وهوایی شده است.",

            effects:
                effects({
                    stability: 4,
                    climatePressure: -8,
                    economy: 3
                }),

            score:
                20
        };
    }

    /*
     * Default delayed outcome.
     */
    return {
        title:
            "پیامد تصمیم قبلی",

        description:
            "یکی از تصمیم‌های قبلی شما اکنون اثر جدیدی بر شرایط کشور گذاشته است.",

        effects:
            effects({
                stability: 2,
                popularity: 2,
                economy: 2
            }),

        score:
            8
    };
}


/* =========================================================
   GAME HEALTH CHECK
========================================================= */

function runGameIntegrityCheck() {

    const problems = [];

    ensureStateCollections();

    if (
        !Array.isArray(
            STATE.players
        )
    ) {
        problems.push(
            "players-not-array"
        );
    }

    if (
        STATE.stage < 0 ||
        STATE.stage > MAX_STAGES
    ) {
        problems.push(
            "invalid-stage"
        );
    }

    if (
        !STAGE_OPTIONS.includes(
            num(
                STATE.stageLimit,
                30
            )
        )
    ) {
        problems.push(
            "invalid-stage-limit"
        );
    }

    for (
        const player
        of STATE.players
    ) {

        if (!player) {
            problems.push(
                "null-player"
            );
            continue;
        }

        if (!player.id) {
            problems.push(
                "player-without-id"
            );
        }

        normalizePlayerStatsSafe(
            player
        );
    }

    normalizeWorldStats();
    normalizeInstitutions();
    ensurePlayerRelations();

    return {
        ok:
            problems.length === 0,

        problems
    };
}


/* =========================================================
   PUBLIC DECISION API
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.decisions = {

        apply:
            applyDecision,

        score:
            calculateDecisionScore,

        quality:
            getDecisionQuality,

        rank:
            rankPlayers,

        finalScore:
            calculatePlayerFinalScore
    };

    window.RepublicGame.relations = {

        get:
            getPlayerRelation,

        set:
            setPlayerRelation,

        change:
            changePlayerRelation,

        label:
            getRelationLabel
    };

    window.RepublicGame.institutions = {

        get:
            getInstitution,

        change:
            changeInstitution,

        normalize:
            normalizeInstitutions
    };

    window.RepublicGame.crises = {

        process:
            processDueDelayedConsequences
    };

    window.RepublicGame.integrity =
        runGameIntegrityCheck;
}


/* =========================================================
   PART 3 END
   =========================================================

   DO NOT ADD `})();`

   PART 4 WILL CONTINUE DIRECTLY BELOW.

   PART 4:
   - SUPABASE CONNECTION
   - ROOM CREATION
   - JOIN ROOM
   - PRESENCE
   - BROADCAST
   - HOST AUTHORITY
   - PLAYER SYNCHRONIZATION
   - REALTIME MESSAGE HANDLER

========================================================= */
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0-CINEMATIC
   PART 4 / 8
   REALTIME • ROOMS • PRESENCE • HOST AUTHORITY
   ========================================================= */

/* =========================================================
   4.0 — REALTIME STATE
========================================================= */

const REALTIME_VERSION = "10.0-RT";

const RT = {
    client: null,
    channel: null,

    roomCode: null,
    connected: false,
    subscribed: false,

    isHost: false,
    hostId: null,

    reconnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 8,

    lastHeartbeat: 0,
    lastStateBroadcast: 0,

    pendingJoinRequests: [],
    processedMessages: new Set(),

    presenceTimer: null,
    heartbeatTimer: null,

    initialized: false
};


/* =========================================================
   4.1 — SUPABASE CONFIG
========================================================= */

const SUPABASE_CONFIG = {
    url:
        "https://kkltydnftjwdgqtufdvl.supabase.co",

    publishableKey:
        "sb_publishable_MB7iy1qpKxJf83gwh1TsjA_Bs0Ox6Bk"
};


/* =========================================================
   4.2 — SAFE SUPABASE CLIENT CREATION
========================================================= */

function initRealtimeClient() {

    if (RT.client) {
        return RT.client;
    }

    if (
        typeof window === "undefined" ||
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {
        console.error(
            "[RepublicGame] Supabase client is unavailable."
        );

        showToastSafe(
            "ارتباط آنلاین در دسترس نیست.",
            "error"
        );

        return null;
    }

    try {

        RT.client =
            window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.publishableKey,
                {
                    realtime: {
                        params: {
                            eventsPerSecond: 20
                        }
                    }
                }
            );

        RT.initialized = true;

        return RT.client;

    } catch (error) {

        console.error(
            "[RepublicGame] Supabase init failed:",
            error
        );

        RT.client = null;

        return null;
    }
}


/* =========================================================
   4.3 — SAFE UI HELPERS
========================================================= */

function showToastSafe(
    message,
    type = "info"
) {

    try {

        if (
            typeof window !== "undefined" &&
            typeof window.showToast === "function"
        ) {
            window.showToast(
                message,
                type
            );

            return;
        }

        const container =
            document.getElementById(
                "toastContainer"
            );

        if (!container) {
            return;
        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast toast-${type}`;

        toast.textContent = message;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 3000);

    } catch (error) {

        console.warn(
            "[RepublicGame] Toast error:",
            error
        );
    }
}


/* =========================================================
   4.4 — ROOM CODE
========================================================= */

function generateRoomCode(
    length = 6
) {

    const alphabet =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (
        let i = 0;
        i < length;
        i++
    ) {

        result +=
            alphabet[
                Math.floor(
                    Math.random() *
                    alphabet.length
                )
            ];
    }

    return result;
}


function normalizeRoomCode(code) {

    return String(code || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 12);
}


function getRoomTopic(roomCode) {

    const clean =
        normalizeRoomCode(roomCode);

    return `republic-absurdity-room-${clean}`;
}


/* =========================================================
   4.5 — PLAYER ID
========================================================= */

function createPlayerId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return (
        "p_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


function getOrCreateLocalPlayerId() {

    const key =
        "republic_absurdity_player_id";

    try {

        const existing =
            localStorage.getItem(key);

        if (existing) {
            return existing;
        }

        const created =
            createPlayerId();

        localStorage.setItem(
            key,
            created
        );

        return created;

    } catch {

        return createPlayerId();
    }
}


/* =========================================================
   4.6 — GAME INSTANCE ID
========================================================= */

function createGameInstanceId() {

    return (
        "game_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


/* =========================================================
   4.7 — CURRENT PLAYER HELPERS
========================================================= */

function getCurrentPlayerId() {

    if (
        typeof GAME !== "undefined" &&
        GAME &&
        GAME.localPlayerId
    ) {
        return GAME.localPlayerId;
    }

    if (
        typeof STATE !== "undefined" &&
        STATE &&
        STATE.localPlayerId
    ) {
        return STATE.localPlayerId;
    }

    return getOrCreateLocalPlayerId();
}


function getCurrentPlayer() {

    if (
        typeof STATE === "undefined" ||
        !STATE ||
        !Array.isArray(STATE.players)
    ) {
        return null;
    }

    const id =
        getCurrentPlayerId();

    return (
        STATE.players.find(
            player =>
                player &&
                player.id === id
        ) ||
        null
    );
}


/* =========================================================
   4.8 — ROOM SNAPSHOT
========================================================= */

function createRoomSnapshot() {

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return null;
    }

    return {
        version:
            typeof VERSION !== "undefined"
                ? VERSION
                : "10.0",

        roomCode:
            RT.roomCode,

        hostId:
            RT.hostId,

        gameStarted:
            !!STATE.gameStarted,

        phase:
            STATE.phase || "lobby",

        stage:
            Number(STATE.stage || 0),

        maxStages:
            Number(STATE.maxStages || 10),

        currentTurnIndex:
            Number(
                STATE.currentTurnIndex || 0
            ),

        players:
            Array.isArray(STATE.players)
                ? STATE.players
                    .map(sanitizePlayerForNetwork)
                : [],

        world:
            STATE.world
                ? sanitizeWorldForNetwork(
                    STATE.world
                )
                : null,

        institutions:
            Array.isArray(
                STATE.institutions
            )
                ? STATE.institutions
                : [],

        event:
            STATE.currentEvent || null,

        history:
            Array.isArray(STATE.history)
                ? STATE.history.slice(-30)
                : [],

        timestamp:
            Date.now()
    };
}


/* =========================================================
   4.9 — NETWORK SANITIZATION
========================================================= */

function sanitizePlayerForNetwork(
    player
) {

    if (!player) {
        return null;
    }

    return {
        id: player.id,

        name:
            String(
                player.name ||
                player.leaderName ||
                "بازیکن"
            ).slice(0, 40),

        leaderName:
            String(
                player.leaderName ||
                player.name ||
                "رئیس"
            ).slice(0, 40),

        country:
            String(
                player.country ||
                "کشور ناشناخته"
            ).slice(0, 50),

        geography:
            String(
                player.geography ||
                "نامشخص"
            ).slice(0, 50),

        isHost:
            !!player.isHost,

        connected:
            player.connected !== false,

        ready:
            !!player.ready,

        alive:
            player.alive !== false,

        stats: player.stats
            ? {
                money:
                    Number(
                        player.stats.money || 0
                    ),

                economy:
                    Number(
                        player.stats.economy || 0
                    ),

                electricity:
                    Number(
                        player.stats.electricity || 0
                    ),

                popularity:
                    Number(
                        player.stats.popularity || 0
                    ),

                stability:
                    Number(
                        player.stats.stability || 0
                    ),

                sanctions:
                    Number(
                        player.stats.sanctions || 0
                    ),

                relations:
                    Number(
                        player.stats.relations || 0
                    )
            }
            : null,

        score:
            Number(player.score || 0),

        reputation:
            Number(player.reputation || 0),

        milestones:
            Array.isArray(player.milestones)
                ? player.milestones.slice(-20)
                : [],

        achievements:
            Array.isArray(player.achievements)
                ? player.achievements.slice(-20)
                : []
    };
}


function sanitizeWorldForNetwork(
    world
) {

    return {
        tension:
            Number(world.tension || 0),

        market:
            Number(world.market || 0),

        energy:
            Number(world.energy || 0),

        diplomacy:
            Number(world.diplomacy || 0),

        pressure:
            Number(world.pressure || 0)
    };
}


/* =========================================================
   4.10 — NETWORK MESSAGE ID
========================================================= */

function createNetworkMessageId(
    type
) {

    return (
        type +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


/* =========================================================
   4.11 — BROADCAST
========================================================= */

async function broadcastMessage(
    type,
    data = {},
    options = {}
) {

    if (
        !RT.channel ||
        !RT.subscribed
    ) {
        return false;
    }

    const message = {

        id:
            createNetworkMessageId(type),

        type,

        senderId:
            getCurrentPlayerId(),

        hostId:
            RT.hostId,

        roomCode:
            RT.roomCode,

        timestamp:
            Date.now(),

        ...data
    };

    try {

        const response =
            await RT.channel.send({
                type: "broadcast",

                event:
                    options.event ||
                    "game_message",

                payload:
                    message
            });

        if (
            response &&
            response !== "ok"
        ) {
            console.warn(
                "[RepublicGame] Broadcast response:",
                response
            );
        }

        return true;

    } catch (error) {

        console.error(
            "[RepublicGame] Broadcast failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   4.12 — PRESENCE PAYLOAD
========================================================= */

function buildPresencePayload() {

    const player =
        getCurrentPlayer();

    return {

        playerId:
            getCurrentPlayerId(),

        name:
            player?.name ||
            player?.leaderName ||
            "بازیکن",

        country:
            player?.country ||
            "نامشخص",

        geography:
            player?.geography ||
            "نامشخص",

        isHost:
            !!RT.isHost,

        ready:
            !!player?.ready,

        gameStarted:
            !!STATE?.gameStarted,

        stage:
            Number(
                STATE?.stage || 0
            ),

        phase:
            STATE?.phase || "lobby",

        onlineAt:
            new Date().toISOString()
    };
}


/* =========================================================
   4.13 — TRACK PRESENCE
========================================================= */

async function trackPresence() {

    if (
        !RT.channel ||
        !RT.subscribed
    ) {
        return false;
    }

    try {

        const result =
            await RT.channel.track(
                buildPresencePayload()
            );

        return (
            result === "ok" ||
            result === undefined
        );

    } catch (error) {

        console.warn(
            "[RepublicGame] Presence track failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   4.14 — PRESENCE → PLAYERS
========================================================= */

function getPresencePlayers() {

    if (!RT.channel) {
        return [];
    }

    try {

        const state =
            RT.channel.presenceState();

        const result = [];

        Object.keys(state || {})
            .forEach(key => {

                const entries =
                    state[key];

                if (
                    !Array.isArray(entries)
                ) {
                    return;
                }

                entries.forEach(entry => {

                    if (
                        entry &&
                        entry.playerId
                    ) {
                        result.push(entry);
                    }
                });
            });

        return result;

    } catch (error) {

        console.warn(
            "[RepublicGame] Presence read failed:",
            error
        );

        return [];
    }
}


/* =========================================================
   4.15 — PRESENCE SYNC
========================================================= */

function handlePresenceSync() {

    const presencePlayers =
        getPresencePlayers();

    if (
        !Array.isArray(presencePlayers)
    ) {
        return;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return;
    }

    if (
        !Array.isArray(STATE.players)
    ) {
        STATE.players = [];
    }

    presencePlayers.forEach(
        presencePlayer => {

            const existing =
                STATE.players.find(
                    player =>
                        player.id ===
                        presencePlayer.playerId
                );

            if (existing) {

                existing.connected = true;

                if (
                    presencePlayer.name
                ) {
                    existing.name =
                        presencePlayer.name;
                }

                if (
                    presencePlayer.country
                ) {
                    existing.country =
                        presencePlayer.country;
                }

                if (
                    presencePlayer.geography
                ) {
                    existing.geography =
                        presencePlayer.geography;
                }

                existing.ready =
                    !!presencePlayer.ready;
            }
        }
    );

    if (
        typeof renderLobbyPlayers ===
        "function"
    ) {
        renderLobbyPlayers();
    }

    if (
        typeof updateGameUI ===
        "function"
    ) {
        updateGameUI();
    }
}


/* =========================================================
   4.16 — PRESENCE JOIN
========================================================= */

function handlePresenceJoin(
    payload
) {

    const joined =
        payload?.newPresences || [];

    joined.forEach(entry => {

        if (
            !entry ||
            !entry.playerId
        ) {
            return;
        }

        if (
            typeof STATE === "undefined" ||
            !STATE
        ) {
            return;
        }

        if (
            !Array.isArray(STATE.players)
        ) {
            STATE.players = [];
        }

        const existing =
            STATE.players.find(
                player =>
                    player.id ===
                    entry.playerId
            );

        if (existing) {

            existing.connected = true;

        } else if (
            !STATE.gameStarted
        ) {

            STATE.players.push({

                id:
                    entry.playerId,

                name:
                    entry.name ||
                    "بازیکن",

                leaderName:
                    entry.name ||
                    "رئیس",

                country:
                    entry.country ||
                    "نامشخص",

                geography:
                    entry.geography ||
                    "نامشخص",

                isHost:
                    !!entry.isHost,

                connected: true,

                ready:
                    !!entry.ready
            });

            if (
                typeof ensurePlayerCollections ===
                "function"
            ) {
                ensurePlayerCollections(
                    STATE.players[
                        STATE.players.length - 1
                    ]
                );
            }
        }
    });

    handlePresenceSync();
}


/* =========================================================
   4.17 — PRESENCE LEAVE
========================================================= */

function handlePresenceLeave(
    payload
) {

    const left =
        payload?.leftPresences || [];

    left.forEach(entry => {

        if (
            !entry ||
            !entry.playerId
        ) {
            return;
        }

        if (
            typeof STATE === "undefined" ||
            !STATE ||
            !Array.isArray(STATE.players)
        ) {
            return;
        }

        const player =
            STATE.players.find(
                item =>
                    item.id ===
                    entry.playerId
            );

        if (player) {

            player.connected = false;
        }
    });

    handlePresenceSync();

    /*
     * Host migration is handled separately.
     */
    if (
        RT.hostId &&
        left.some(
            entry =>
                entry &&
                entry.playerId ===
                RT.hostId
        )
    ) {
        scheduleHostElection();
    }
}


/* =========================================================
   4.18 — HOST ELECTION
========================================================= */

let hostElectionTimer = null;


function scheduleHostElection() {

    if (hostElectionTimer) {
        clearTimeout(hostElectionTimer);
    }

    hostElectionTimer =
        setTimeout(
            () => {

                hostElectionTimer =
                    null;

                electHostIfNeeded();

            },
            700
        );
}


function electHostIfNeeded() {

    if (
        !RT.channel ||
        !RT.subscribed
    ) {
        return;
    }

    const online =
        getPresencePlayers()
            .filter(
                player =>
                    player &&
                    player.playerId
            )
            .sort(
                (a, b) =>
                    String(
                        a.playerId
                    ).localeCompare(
                        String(b.playerId)
                    )
            );

    if (!online.length) {
        return;
    }

    const candidate =
        online[0];

    if (!candidate) {
        return;
    }

    RT.hostId =
        candidate.playerId;

    RT.isHost =
        candidate.playerId ===
        getCurrentPlayerId();

    syncHostFlagsLocally();

    /*
     * Only the elected host announces the result.
     * This prevents every client from broadcasting
     * a different host at the same time.
     */
    if (RT.isHost) {

        broadcastMessage(
            "host_changed",
            {
                hostId:
                    RT.hostId
            }
        );

        broadcastStateSnapshot();
    }

    trackPresence();
}


function syncHostFlagsLocally() {

    if (
        typeof STATE === "undefined" ||
        !STATE ||
        !Array.isArray(STATE.players)
    ) {
        return;
    }

    STATE.players.forEach(
        player => {

            if (!player) {
                return;
            }

            player.isHost =
                player.id ===
                RT.hostId;
        }
    );

    if (
        typeof renderLobbyPlayers ===
        "function"
    ) {
        renderLobbyPlayers();
    }
}


/* =========================================================
   4.19 — AUTHORITATIVE HOST CHECK
========================================================= */

function isLocalHost() {

    return (
        RT.isHost &&
        RT.hostId ===
            getCurrentPlayerId()
    );
}


function requireHost(
    actionName = "این عملیات"
) {

    if (isLocalHost()) {
        return true;
    }

    showToastSafe(
        `${actionName} فقط توسط میزبان انجام می‌شود.`,
        "warning"
    );

    return false;
}


/* =========================================================
   4.20 — CHANNEL SETUP
========================================================= */

function attachRealtimeListeners(
    channel
) {

    if (!channel) {
        return;
    }

    channel
        .on(
            "broadcast",
            {
                event: "game_message"
            },
            payload => {

                handleRealtimeMessage(
                    payload
                );
            }
        )

        .on(
            "presence",
            {
                event: "sync"
            },
            () => {

                handlePresenceSync();
            }
        )

        .on(
            "presence",
            {
                event: "join"
            },
            payload => {

                handlePresenceJoin(
                    payload
                );
            }
        )

        .on(
            "presence",
            {
                event: "leave"
            },
            payload => {

                handlePresenceLeave(
                    payload
                );
            }
        );
}


/* =========================================================
   4.21 — JOIN CHANNEL
========================================================= */

async function connectToRoom(
    roomCode
) {

    const client =
        initRealtimeClient();

    if (!client) {
        return false;
    }

    const normalized =
        normalizeRoomCode(
            roomCode
        );

    if (!normalized) {

        showToastSafe(
            "کد اتاق معتبر نیست.",
            "error"
        );

        return false;
    }

    /*
     * Remove previous channel safely.
     */
    if (RT.channel) {

        try {
            await client.removeChannel(
                RT.channel
            );
        } catch (error) {
            console.warn(
                "[RepublicGame] Previous channel cleanup:",
                error
            );
        }
    }

    RT.channel = null;
    RT.connected = false;
    RT.subscribed = false;

    RT.roomCode =
        normalized;

    RT.reconnectAttempts = 0;

    const topic =
        getRoomTopic(
            normalized
        );

    try {

        RT.channel =
            client.channel(
                topic,
                {
                    config: {
                        broadcast: {
                            self: false,
                            ack: true
                        },

                        presence: {
                            key:
                                getCurrentPlayerId()
                        }
                    }
                }
            );

        attachRealtimeListeners(
            RT.channel
        );

        await new Promise(
            (resolve, reject) => {

                let settled = false;

                const finish = (
                    callback
                ) => {

                    if (settled) {
                        return;
                    }

                    settled = true;

                    callback();
                };

                RT.channel.subscribe(
                    async (
                        status,
                        error
                    ) => {

                        if (
                            status ===
                            "SUBSCRIBED"
                        ) {

                            RT.connected =
                                true;

                            RT.subscribed =
                                true;

                            RT.reconnectAttempts =
                                0;

                            await trackPresence();

                            finish(
                                resolve
                            );

                            return;
                        }

                        if (
                            status ===
                                "CHANNEL_ERROR" ||
                            status ===
                                "TIMED_OUT" ||
                            status ===
                                "CLOSED"
                        ) {

                            console.error(
                                "[RepublicGame] Realtime status:",
                                status,
                                error
                            );

                            finish(
                                () =>
                                    reject(
                                        error ||
                                        new Error(
                                            status
                                        )
                                    )
                            );
                        }
                    }
                );
            }
        );

        startRealtimeHeartbeat();

        return true;

    } catch (error) {

        console.error(
            "[RepublicGame] Room connection failed:",
            error
        );

        RT.connected = false;
        RT.subscribed = false;

        showToastSafe(
            "اتصال به اتاق برقرار نشد.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   4.22 — CREATE ROOM
========================================================= */

async function createRoom() {

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        console.error(
            "[RepublicGame] STATE unavailable."
        );

        return false;
    }

    const playerId =
        getOrCreateLocalPlayerId();

    STATE.localPlayerId =
        playerId;

    if (
        !Array.isArray(STATE.players)
    ) {
        STATE.players = [];
    }

    let roomCode =
        generateRoomCode();

    /*
     * No database is used here.
     * The room exists while connected clients
     * share the Realtime topic.
     */

    RT.roomCode =
        roomCode;

    RT.hostId =
        playerId;

    RT.isHost = true;

    STATE.roomCode =
        roomCode;

    STATE.localPlayerId =
        playerId;

    STATE.gameStarted =
        false;

    STATE.phase =
        "lobby";

    const success =
        await connectToRoom(
            roomCode
        );

    if (!success) {
        return false;
    }

    ensureLocalPlayerInState();

    syncHostFlagsLocally();

    await trackPresence();

    await broadcastMessage(
        "room_created",
        {
            snapshot:
                createRoomSnapshot()
        }
    );

    broadcastStateSnapshot();

    updateRoomUI();

    return true;
}


/* =========================================================
   4.23 — ENSURE LOCAL PLAYER
========================================================= */

function ensureLocalPlayerInState() {

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return null;
    }

    if (
        !Array.isArray(STATE.players)
    ) {
        STATE.players = [];
    }

    const playerId =
        getCurrentPlayerId();

    let player =
        STATE.players.find(
            item =>
                item &&
                item.id === playerId
        );

    if (!player) {

        const leaderName =
            STATE.setup?.leaderName ||
            STATE.leaderName ||
            "رئیس";

        const country =
            STATE.setup?.country ||
            STATE.country ||
            "کشور مسخره";

        const geography =
            STATE.setup?.geography ||
            STATE.geography ||
            "نامشخص";

        player = {

            id:
                playerId,

            name:
                leaderName,

            leaderName:
                leaderName,

            country:
                country,

            geography:
                geography,

            isHost:
                RT.isHost,

            connected:
                true,

            ready:
                false,

            alive:
                true,

            stats: {

                money: 1000,
                economy: 70,
                electricity: 75,
                popularity: 60,
                stability: 65,
                sanctions: 0,
                relations: 50
            },

            score: 0,

            reputation: 0,

            milestones: [],

            achievements: [],

            relations: {},

            ledger: [],

            decisionHistory: [],

            delayedConsequences: [],

            crises: []
        };

        STATE.players.push(
            player
        );
    }

    ensurePlayerCollections(
        player
    );

    STATE.localPlayerId =
        playerId;

    return player;
}


/* =========================================================
   4.24 — JOIN ROOM
========================================================= */

async function joinRoom(
    roomCode,
    playerData = {}
) {

    const normalized =
        normalizeRoomCode(
            roomCode
        );

    if (!normalized) {

        showToastSafe(
            "کد اتاق را وارد کنید.",
            "warning"
        );

        return false;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return false;
    }

    const playerId =
        getOrCreateLocalPlayerId();

    STATE.localPlayerId =
        playerId;

    STATE.setup = {
        leaderName:
            playerData.leaderName ||
            "رئیس",

        country:
            playerData.country ||
            "کشور مسخره",

        geography:
            playerData.geography ||
            "نامشخص"
    };

    const success =
        await connectToRoom(
            normalized
        );

    if (!success) {
        return false;
    }

    RT.isHost = false;

    RT.hostId = null;

    ensureLocalPlayerInState();

    /*
     * Ask the current host for the authoritative snapshot.
     */
    await broadcastMessage(
        "join_request",
        {
            player: {
                id:
                    playerId,

                name:
                    STATE.setup.leaderName,

                leaderName:
                    STATE.setup.leaderName,

                country:
                    STATE.setup.country,

                geography:
                    STATE.setup.geography
            }
        }
    );

    await trackPresence();

    updateRoomUI();

    return true;
}


/* =========================================================
   4.25 — JOIN REQUEST
========================================================= */

function handleJoinRequest(
    message
) {

    if (!isLocalHost()) {
        return;
    }

    const incoming =
        message?.player;

    if (
        !incoming ||
        !incoming.id
    ) {
        return;
    }

    if (
        incoming.id ===
        getCurrentPlayerId()
    ) {
        return;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return;
    }

    if (
        STATE.gameStarted
    ) {

        broadcastMessage(
            "join_rejected",
            {
                targetId:
                    incoming.id,

                reason:
                    "بازی شروع شده است."
            }
        );

        return;
    }

    if (
        !Array.isArray(STATE.players)
    ) {
        STATE.players = [];
    }

    if (
        STATE.players.length >=
        MAX_PLAYERS
    ) {

        broadcastMessage(
            "join_rejected",
            {
                targetId:
                    incoming.id,

                reason:
                    "اتاق پر است."
            }
        );

        return;
    }

    let player =
        STATE.players.find(
            item =>
                item &&
                item.id ===
                incoming.id
        );

    if (!player) {

        player = {

            id:
                incoming.id,

            name:
                incoming.name ||
                "بازیکن",

            leaderName:
                incoming.leaderName ||
                incoming.name ||
                "رئیس",

            country:
                incoming.country ||
                "کشور مسخره",

            geography:
                incoming.geography ||
                "نامشخص",

            isHost: false,

            connected: true,

            ready: false,

            alive: true,

            stats: {

                money: 1000,
                economy: 70,
                electricity: 75,
                popularity: 60,
                stability: 65,
                sanctions: 0,
                relations: 50
            },

            score: 0,

            reputation: 0,

            milestones: [],

            achievements: [],

            relations: {},

            ledger: [],

            decisionHistory: [],

            delayedConsequences: [],

            crises: []
        };

        ensurePlayerCollections(
            player
        );

        STATE.players.push(
            player
        );

    } else {

        player.connected = true;

        player.name =
            incoming.name ||
            player.name;

        player.leaderName =
            incoming.leaderName ||
            player.leaderName;

        player.country =
            incoming.country ||
            player.country;

        player.geography =
            incoming.geography ||
            player.geography;
    }

    /*
     * Send the authoritative snapshot
     * only to the joining player.
     */
    broadcastMessage(
        "room_snapshot",
        {
            targetId:
                incoming.id,

            snapshot:
                createRoomSnapshot()
        }
    );

    broadcastMessage(
        "player_joined",
        {
            player:
                sanitizePlayerForNetwork(
                    player
                )
        }
    );

    updateRoomUI();
}


/* =========================================================
   4.26 — APPLY ROOM SNAPSHOT
========================================================= */

function applyRoomSnapshot(
    snapshot
) {

    if (
        !snapshot ||
        typeof snapshot !== "object"
    ) {
        return false;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return false;
    }

    if (
        snapshot.roomCode &&
        RT.roomCode &&
        normalizeRoomCode(
            snapshot.roomCode
        ) !==
        normalizeRoomCode(
            RT.roomCode
        )
    ) {
        return false;
    }

    STATE.roomCode =
        snapshot.roomCode ||
        RT.roomCode;

    RT.roomCode =
        STATE.roomCode;

    RT.hostId =
        snapshot.hostId ||
        RT.hostId;

    RT.isHost =
        RT.hostId ===
        getCurrentPlayerId();

    if (
        Array.isArray(
            snapshot.players
        )
    ) {

        STATE.players =
            snapshot.players.map(
                player => {

                    ensurePlayerCollections(
                        player
                    );

                    return player;
                }
            );
    }

    STATE.gameStarted =
        !!snapshot.gameStarted;

    STATE.phase =
        snapshot.phase ||
        STATE.phase ||
        "lobby";

    STATE.stage =
        Number(
            snapshot.stage ||
            STATE.stage ||
            0
        );

    STATE.maxStages =
        Number(
            snapshot.maxStages ||
            STATE.maxStages ||
            10
        );

    STATE.currentTurnIndex =
        Number(
            snapshot.currentTurnIndex ||
            0
        );

    if (snapshot.world) {

        STATE.world = {
            ...(STATE.world || {}),
            ...snapshot.world
        };
    }

    if (
        Array.isArray(
            snapshot.institutions
        )
    ) {

        STATE.institutions =
            snapshot.institutions;
    }

    if (
        Array.isArray(
            snapshot.history
        )
    ) {

        STATE.history =
            snapshot.history;
    }

    STATE.currentEvent =
        snapshot.event ||
        null;

    ensureLocalPlayerInState();

    syncHostFlagsLocally();

    updateRoomUI();

    if (
        typeof updateGameUI ===
        "function"
    ) {
        updateGameUI();
    }

    return true;
}


/* =========================================================
   4.27 — STATE BROADCAST
========================================================= */

async function broadcastStateSnapshot() {

    if (!isLocalHost()) {
        return false;
    }

    const now =
        Date.now();

    /*
     * Prevent accidental broadcast storms.
     */
    if (
        now -
        RT.lastStateBroadcast <
        80
    ) {
        return false;
    }

    RT.lastStateBroadcast =
        now;

    return broadcastMessage(
        "state_snapshot",
        {
            snapshot:
                createRoomSnapshot()
        }
    );
}


/* =========================================================
   4.28 — PLAYER JOINED
========================================================= */

function handlePlayerJoined(
    message
) {

    const incoming =
        message?.player;

    if (
        !incoming ||
        !incoming.id
    ) {
        return;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return;
    }

    if (
        !Array.isArray(STATE.players)
    ) {
        STATE.players = [];
    }

    const existing =
        STATE.players.find(
            player =>
                player &&
                player.id ===
                incoming.id
        );

    if (!existing) {

        const player = {
            ...incoming
        };

        ensurePlayerCollections(
            player
        );

        STATE.players.push(
            player
        );

    } else {

        Object.assign(
            existing,
            incoming
        );

        ensurePlayerCollections(
            existing
        );
    }

    updateRoomUI();

    showToastSafe(
        `${incoming.name || "یک بازیکن"} وارد جمهوری شد.`,
        "success"
    );

    /*
     * Host immediately distributes a fresh snapshot.
     */
    if (isLocalHost()) {
        broadcastStateSnapshot();
    }
}


/* =========================================================
   4.29 — PLAYER LEFT
========================================================= */

function handlePlayerLeft(
    message
) {

    const playerId =
        message?.playerId;

    if (!playerId) {
        return;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE ||
        !Array.isArray(STATE.players)
    ) {
        return;
    }

    const player =
        STATE.players.find(
            item =>
                item &&
                item.id ===
                playerId
        );

    if (player) {

        player.connected =
            false;
    }

    updateRoomUI();
}


/* =========================================================
   4.30 — JOIN REJECTION
========================================================= */

function handleJoinRejected(
    message
) {

    if (
        message?.targetId !==
        getCurrentPlayerId()
    ) {
        return;
    }

    showToastSafe(
        message.reason ||
        "ورود به اتاق رد شد.",
        "error"
    );

    if (
        RT.client &&
        RT.channel
    ) {

        try {

            RT.client.removeChannel(
                RT.channel
            );

        } catch {}
    }

    RT.channel = null;
    RT.connected = false;
    RT.subscribed = false;
}


/* =========================================================
   4.31 — HOST CHANGED
========================================================= */

function handleHostChanged(
    message
) {

    if (!message?.hostId) {
        return;
    }

    RT.hostId =
        message.hostId;

    RT.isHost =
        RT.hostId ===
        getCurrentPlayerId();

    syncHostFlagsLocally();

    trackPresence();

    updateRoomUI();
}


/* =========================================================
   4.32 — START GAME REQUEST
========================================================= */

function requestStartGame() {

    if (isLocalHost()) {

        startGameAuthoritatively();

        return;
    }

    broadcastMessage(
        "start_request",
        {
            requesterId:
                getCurrentPlayerId()
        }
    );

    showToastSafe(
        "درخواست شروع برای میزبان ارسال شد.",
        "info"
    );
}


/* =========================================================
   4.33 — HOST START
========================================================= */

function startGameAuthoritatively() {

    if (
        !requireHost(
            "شروع بازی"
        )
    ) {
        return false;
    }

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return false;
    }

    if (
        !Array.isArray(
            STATE.players
        ) ||
        STATE.players.length < MIN_PLAYERS
    ) {

        showToastSafe(
            "حداقل یک بازیکن لازم است.",
            "warning"
        );

        return false;
    }

    STATE.gameStarted =
        true;

    STATE.phase =
        "game";

    STATE.stage =
        1;

    STATE.currentTurnIndex =
        0;

    if (
        typeof ensureStateCollections ===
        "function"
    ) {
        ensureStateCollections();
    }

    STATE.currentEvent =
        null;

    broadcastMessage(
        "game_started",
        {
            snapshot:
                createRoomSnapshot()
        }
    );

    broadcastStateSnapshot();

    if (
        typeof startGameLocal ===
        "function"
    ) {

        startGameLocal();
    }

    trackPresence();

    return true;
}


/* =========================================================
   4.34 — REQUEST STAGE CHANGE
========================================================= */

function requestStageChange(
    stages
) {

    const value =
        Number(stages);

    if (
        !Number.isFinite(value)
    ) {
        return false;
    }

    const allowed =
        [10, 20, 30, 40, 50];

    if (
        !allowed.includes(value)
    ) {

        showToastSafe(
            "تعداد مراحل باید ۱۰، ۲۰، ۳۰، ۴۰ یا ۵۰ باشد.",
            "warning"
        );

        return false;
    }

    if (isLocalHost()) {

        setStageCountAuthoritatively(
            value
        );

        return true;
    }

    broadcastMessage(
        "stage_vote",
        {
            playerId:
                getCurrentPlayerId(),

            stages:
                value
        }
    );

    showToastSafe(
        `رأی شما برای ${value} مرحله ثبت شد.`,
        "info"
    );

    return true;
}


/* =========================================================
   4.35 — AUTHORITATIVE STAGE COUNT
========================================================= */

function setStageCountAuthoritatively(
    stages
) {

    if (
        !requireHost(
            "تغییر تعداد مراحل"
        )
    ) {
        return false;
    }

    const value =
        Number(stages);

    if (
        ![10, 20, 30, 40, 50]
            .includes(value)
    ) {
        return false;
    }

    STATE.maxStages =
        value;

    broadcastMessage(
        "stage_count_changed",
        {
            stages:
                value
        }
    );

    broadcastStateSnapshot();

    updateRoomUI();

    return true;
}


/* =========================================================
   4.36 — START REQUEST HANDLER
========================================================= */

function handleStartRequest(
    message
) {

    if (!isLocalHost()) {
        return;
    }

    if (
        message?.requesterId
    ) {

        showToastSafe(
            "یک بازیکن درخواست شروع بازی داد.",
            "info"
        );
    }

    startGameAuthoritatively();
}


/* =========================================================
   4.37 — STAGE VOTE HANDLER
========================================================= */

function handleStageVote(
    message
) {

    if (!isLocalHost()) {
        return;
    }

    if (
        !message?.playerId ||
        !message?.stages
    ) {
        return;
    }

    /*
     * The host currently accepts the latest valid vote.
     * A later part can replace this with a full
     * majority-voting system without changing Realtime.
     */

    STATE.stageSelection =
        STATE.stageSelection ||
        {};

    STATE.stageSelection[
        message.playerId
    ] =
        Number(message.stages);

    updateStageVoteUI();

    /*
     * If all currently connected players voted,
     * host selects the majority.
     */
    const onlinePlayers =
        STATE.players.filter(
            player =>
                player &&
                player.connected !== false
        );

    const votes =
        onlinePlayers
            .map(
                player =>
                    STATE.stageSelection[
                        player.id
                    ]
            )
            .filter(
                value =>
                    [10, 20, 30, 40, 50]
                        .includes(
                            Number(value)
                        )
            );

    if (
        votes.length >=
        onlinePlayers.length &&
        votes.length > 0
    ) {

        const counts = {};

        votes.forEach(
            value => {

                counts[value] =
                    (counts[value] || 0) +
                    1;
            }
        );

        let winner =
            votes[0];

        Object.keys(counts)
            .forEach(value => {

                if (
                    counts[value] >
                    counts[winner]
                ) {
                    winner =
                        Number(value);
                }
            });

        setStageCountAuthoritatively(
            Number(winner)
        );
    }
}


/* =========================================================
   4.38 — STAGE COUNT HANDLER
========================================================= */

function handleStageCountChanged(
    message
) {

    const stages =
        Number(
            message?.stages
        );

    if (
        ![10, 20, 30, 40, 50]
            .includes(stages)
    ) {
        return;
    }

    STATE.maxStages =
        stages;

    if (
        typeof updateStageSelectorUI ===
        "function"
    ) {
        updateStageSelectorUI(
            stages
        );
    }

    showToastSafe(
        `بازی روی ${stages} مرحله تنظیم شد.`,
        "success"
    );
}


/* =========================================================
   4.39 — GAME STARTED HANDLER
========================================================= */

function handleGameStarted(
    message
) {

    const snapshot =
        message?.snapshot;

    if (snapshot) {
        applyRoomSnapshot(
            snapshot
        );
    }

    STATE.gameStarted =
        true;

    STATE.phase =
        "game";

    if (
        typeof startGameLocal ===
        "function"
    ) {
        startGameLocal();
    }

    trackPresence();
}


/* =========================================================
   4.40 — STATE SNAPSHOT HANDLER
========================================================= */

function handleStateSnapshot(
    message
) {

    /*
     * Ignore our own snapshot if it somehow returns.
     */
    if (
        message?.senderId ===
        getCurrentPlayerId()
    ) {
        return;
    }

    if (
        message?.snapshot
    ) {

        applyRoomSnapshot(
            message.snapshot
        );
    }
}


/* =========================================================
   4.41 — GENERIC REALTIME MESSAGE HANDLER
   IMPORTANT:
   Do NOT redefine/reassign this function later.
========================================================= */

async function handleRealtimeMessage(
    payload
) {

    const message =
        payload?.payload;

    if (
        !message ||
        typeof message !== "object"
    ) {
        return;
    }

    if (
        message.roomCode &&
        RT.roomCode &&
        normalizeRoomCode(
            message.roomCode
        ) !==
        normalizeRoomCode(
            RT.roomCode
        )
    ) {
        return;
    }

    if (
        message.id &&
        RT.processedMessages.has(
            message.id
        )
    ) {
        return;
    }

    if (message.id) {

        RT.processedMessages.add(
            message.id
        );

        /*
         * Prevent unlimited memory growth.
         */
        if (
            RT.processedMessages.size >
            500
        ) {

            const first =
                RT.processedMessages
                    .values()
                    .next()
                    .value;

            if (first) {
                RT.processedMessages.delete(
                    first
                );
            }
        }
    }

    switch (
        message.type
    ) {

        case "room_created":

            if (
                message.snapshot
            ) {
                applyRoomSnapshot(
                    message.snapshot
                );
            }

            break;


        case "join_request":

            handleJoinRequest(
                message
            );

            break;


        case "room_snapshot":

            if (
                message.targetId ===
                getCurrentPlayerId()
            ) {

                applyRoomSnapshot(
                    message.snapshot
                );
            }

            break;


        case "player_joined":

            handlePlayerJoined(
                message
            );

            break;


        case "player_left":

            handlePlayerLeft(
                message
            );

            break;


        case "join_rejected":

            handleJoinRejected(
                message
            );

            break;


        case "host_changed":

            handleHostChanged(
                message
            );

            break;


        case "start_request":

            handleStartRequest(
                message
            );

            break;


        case "game_started":

            handleGameStarted(
                message
            );

            break;


        case "state_snapshot":

            handleStateSnapshot(
                message
            );

            break;


        case "stage_vote":

            handleStageVote(
                message
            );

            break;


        case "stage_count_changed":

            handleStageCountChanged(
                message
            );

            break;


        /*
         * Part 5/6 will add the authoritative
         * event / decision / consequence handlers.
         */

        default:

            /*
             * Give the rest of the engine a chance
             * to handle custom messages.
             */
            if (
                typeof handleGameNetworkMessage ===
                "function"
            ) {

                await handleGameNetworkMessage(
                    message
                );
            }

            break;
    }
}


/* =========================================================
   4.42 — HEARTBEAT
========================================================= */

function startRealtimeHeartbeat() {

    stopRealtimeHeartbeat();

    RT.heartbeatTimer =
        setInterval(
            async () => {

                if (
                    !RT.subscribed
                ) {
                    return;
                }

                RT.lastHeartbeat =
                    Date.now();

                await trackPresence();

            },
            12000
        );
}


function stopRealtimeHeartbeat() {

    if (
        RT.heartbeatTimer
    ) {

        clearInterval(
            RT.heartbeatTimer
        );

        RT.heartbeatTimer =
            null;
    }
}


/* =========================================================
   4.43 — LEAVE ROOM
========================================================= */

async function leaveRoom() {

    stopRealtimeHeartbeat();

    if (
        RT.channel
    ) {

        try {

            await RT.channel.untrack();

        } catch {}
    }

    if (
        isLocalHost() &&
        RT.channel
    ) {

        await broadcastMessage(
            "player_left",
            {
                playerId:
                    getCurrentPlayerId()
            }
        );
    }

    if (
        RT.client &&
        RT.channel
    ) {

        try {

            await RT.client.removeChannel(
                RT.channel
            );

        } catch (error) {

            console.warn(
                "[RepublicGame] removeChannel:",
                error
            );
        }
    }

    RT.channel = null;
    RT.connected = false;
    RT.subscribed = false;
    RT.roomCode = null;
    RT.hostId = null;
    RT.isHost = false;

    if (
        typeof STATE !== "undefined" &&
        STATE
    ) {

        STATE.roomCode =
            null;

        STATE.gameStarted =
            false;

        STATE.phase =
            "menu";
    }

    updateRoomUI();
}


/* =========================================================
   4.44 — DISCONNECT HANDLER
========================================================= */

function handleRealtimeDisconnect() {

    RT.connected = false;
    RT.subscribed = false;

    stopRealtimeHeartbeat();

    if (
        typeof STATE !== "undefined" &&
        STATE &&
        Array.isArray(STATE.players)
    ) {

        const local =
            STATE.players.find(
                player =>
                    player.id ===
                    getCurrentPlayerId()
            );

        if (local) {
            local.connected = false;
        }
    }

    showToastSafe(
        "ارتباط با اتاق قطع شد؛ تلاش برای اتصال مجدد...",
        "warning"
    );

    scheduleRealtimeReconnect();
}


/* =========================================================
   4.45 — RECONNECT
========================================================= */

function scheduleRealtimeReconnect() {

    if (
        RT.reconnecting ||
        !RT.roomCode
    ) {
        return;
    }

    if (
        RT.reconnectAttempts >=
        RT.maxReconnectAttempts
    ) {

        showToastSafe(
            "اتصال مجدد ناموفق بود.",
            "error"
        );

        return;
    }

    RT.reconnecting = true;

    const attempt =
        RT.reconnectAttempts++;

    const delay =
        Math.min(
            1000 *
                Math.pow(
                    1.6,
                    attempt
                ),
            10000
        );

    setTimeout(
        async () => {

            RT.reconnecting =
                false;

            if (!RT.roomCode) {
                return;
            }

            const room =
                RT.roomCode;

            const success =
                await connectToRoom(
                    room
                );

            if (success) {

                RT.reconnectAttempts =
                    0;

                showToastSafe(
                    "ارتباط دوباره برقرار شد.",
                    "success"
                );

                await broadcastMessage(
                    "reconnected",
                    {
                        playerId:
                            getCurrentPlayerId()
                    }
                );

                if (
                    isLocalHost()
                ) {
                    broadcastStateSnapshot();
                }

            } else {

                scheduleRealtimeReconnect();
            }

        },
        delay
    );
}


/* =========================================================
   4.46 — PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            if (
                RT.roomCode &&
                !RT.subscribed
            ) {

                scheduleRealtimeReconnect();

            } else if (
                RT.subscribed
            ) {

                trackPresence();

                if (
                    isLocalHost()
                ) {
                    broadcastStateSnapshot();
                }
            }
        }
    }
);


/* =========================================================
   4.47 — BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        /*
         * Supabase handles socket closure.
         * Do not perform slow async work here.
         */
        stopRealtimeHeartbeat();
    }
);


/* =========================================================
   4.48 — ROOM UI
========================================================= */

function updateRoomUI() {

    try {

        const roomDisplay =
            document.getElementById(
                "roomCodeDisplay"
            );

        if (
            roomDisplay &&
            RT.roomCode
        ) {

            roomDisplay.textContent =
                RT.roomCode;
        }

        const playerCount =
            document.getElementById(
                "playerCount"
            );

        if (
            playerCount &&
            typeof STATE !== "undefined" &&
            STATE &&
            Array.isArray(
                STATE.players
            )
        ) {

            const count =
                STATE.players.filter(
                    player =>
                        player &&
                        player.connected !== false
                ).length;

            playerCount.textContent =
                `${count}/${MAX_PLAYERS}`;
        }

        if (
            typeof renderLobbyPlayers ===
            "function"
        ) {

            renderLobbyPlayers();
        }

    } catch (error) {

        console.warn(
            "[RepublicGame] Room UI update:",
            error
        );
    }
}


/* =========================================================
   4.49 — COPY ROOM CODE
========================================================= */

async function copyRoomCode() {

    if (!RT.roomCode) {

        showToastSafe(
            "کدی برای کپی وجود ندارد.",
            "warning"
        );

        return false;
    }

    try {

        await navigator.clipboard.writeText(
            RT.roomCode
        );

        showToastSafe(
            "کد اتاق کپی شد.",
            "success"
        );

        return true;

    } catch {

        /*
         * Mobile fallback.
         */
        try {

            const input =
                document.createElement(
                    "input"
                );

            input.value =
                RT.roomCode;

            input.style.position =
                "fixed";

            input.style.opacity =
                "0";

            document.body.appendChild(
                input
            );

            input.select();

            document.execCommand(
                "copy"
            );

            input.remove();

            showToastSafe(
                "کد اتاق کپی شد.",
                "success"
            );

            return true;

        } catch {

            showToastSafe(
                `کد اتاق: ${RT.roomCode}`,
                "info"
            );

            return false;
        }
    }
}


/* =========================================================
   4.50 — STAGE VOTE UI
========================================================= */

function updateStageVoteUI() {

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return;
    }

    const selected =
        STATE.stageSelection?.[
            getCurrentPlayerId()
        ];

    if (!selected) {
        return;
    }

    const buttons =
        document.querySelectorAll(
            ".stage-option"
        );

    buttons.forEach(
        button => {

            const value =
                Number(
                    button.dataset.stage
                );

            button.classList.toggle(
                "selected",
                value ===
                    Number(selected)
            );
        }
    );

    const label =
        document.querySelector(
            ".stage-selected-text"
        );

    if (label) {

        label.textContent =
            `انتخاب شما: ${selected} مرحله`;

        label.classList.add(
            "selected"
        );
    }
}


/* =========================================================
   4.51 — REALTIME DEBUG API
========================================================= */

window.RepublicRealtime = {

    version:
        REALTIME_VERSION,

    state:
        RT,

    init:
        initRealtimeClient,

    createRoom,

    joinRoom,

    connectToRoom,

    leaveRoom,

    broadcast:
        broadcastMessage,

    broadcastState:
        broadcastStateSnapshot,

    trackPresence,

    getPresencePlayers,

    getCurrentPlayerId,

    getCurrentPlayer,

    isHost:
        isLocalHost,

    requestStartGame,

    requestStageChange,

    copyRoomCode
};


/* =========================================================
   PART 4 END
   Part 5 continues:
   EVENT SYNCHRONIZATION + TURN AUTHORITY
   + AI EVENT LOCK + DECISION BROADCAST
   ========================================================= */

// DO NOT ADD `})();` HERE.
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0-CINEMATIC
   PART 5 / 8

   EVENT SYNC
   TURN AUTHORITY
   EVENT LOCK
   DECISION SYNC
   DUPLICATE PROTECTION
   ========================================================= */


/* =========================================================
   5.0 — NETWORK GAME STATE
========================================================= */

const NET_GAME = {

    eventLock: false,

    eventLockId: null,

    eventLockOwner: null,

    eventRequestId: null,

    decisionLocks: new Set(),

    processedEvents: new Set(),

    processedDecisions: new Set(),

    processedTurns: new Set(),

    turnNonce: 0,

    lastAuthoritativeStage: 0,

    lastAuthoritativeTurn: 0,

    pendingDecision:
        null,

    awaitingEvent:
        false,

    awaitingDecision:
        false
};


/* =========================================================
   5.1 — SAFE NUMBER
========================================================= */

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


/* =========================================================
   5.2 — SAFE ARRAY
========================================================= */

function safeArray(
    value
) {

    return Array.isArray(value)
        ? value
        : [];
}


/* =========================================================
   5.3 — CURRENT TURN PLAYER
========================================================= */

function getCurrentTurnPlayer() {

    if (
        typeof STATE === "undefined" ||
        !STATE ||
        !Array.isArray(
            STATE.players
        )
    ) {
        return null;
    }

    const index =
        safeNumber(
            STATE.currentTurnIndex,
            0
        );

    return (
        STATE.players[index] ||
        null
    );
}


/* =========================================================
   5.4 — CURRENT TURN PLAYER ID
========================================================= */

function getCurrentTurnPlayerId() {

    const player =
        getCurrentTurnPlayer();

    return player?.id || null;
}


/* =========================================================
   5.5 — IS MY TURN
========================================================= */

function isMyTurn() {

    return (
        getCurrentTurnPlayerId() ===
        getCurrentPlayerId()
    );
}


/* =========================================================
   5.6 — TURN TOKEN
========================================================= */

function createTurnToken() {

    return [
        safeNumber(
            STATE?.stage,
            0
        ),

        safeNumber(
            STATE?.currentTurnIndex,
            0
        ),

        safeNumber(
            NET_GAME.turnNonce,
            0
        )
    ].join(":");
}


/* =========================================================
   5.7 — EVENT TOKEN
========================================================= */

function createEventToken(
    event,
    stage,
    turnIndex
) {

    if (!event) {
        return null;
    }

    return [
        String(
            event.id ||
            "event"
        ),

        safeNumber(
            stage,
            STATE?.stage || 0
        ),

        safeNumber(
            turnIndex,
            STATE?.currentTurnIndex || 0
        )
    ].join(":");
}


/* =========================================================
   5.8 — DECISION TOKEN
========================================================= */

function createDecisionToken(
    eventId,
    playerId,
    choiceId
) {

    return [
        String(
            eventId ||
            "event"
        ),

        String(
            playerId ||
            "player"
        ),

        String(
            choiceId ||
            "choice"
        )
    ].join(":");
}


/* =========================================================
   5.9 — EVENT ALREADY PROCESSED
========================================================= */

function hasProcessedEvent(
    token
) {

    if (!token) {
        return false;
    }

    return NET_GAME.processedEvents.has(
        token
    );
}


/* =========================================================
   5.10 — MARK EVENT PROCESSED
========================================================= */

function markEventProcessed(
    token
) {

    if (!token) {
        return;
    }

    NET_GAME.processedEvents.add(
        token
    );

    /*
     * Keep memory bounded.
     */
    if (
        NET_GAME.processedEvents.size >
        300
    ) {

        const first =
            NET_GAME.processedEvents
                .values()
                .next()
                .value;

        if (first) {
            NET_GAME.processedEvents.delete(
                first
            );
        }
    }
}


/* =========================================================
   5.11 — DECISION DUPLICATE PROTECTION
========================================================= */

function hasProcessedDecision(
    token
) {

    return (
        !!token &&
        NET_GAME.processedDecisions.has(
            token
        )
    );
}


function markDecisionProcessed(
    token
) {

    if (!token) {
        return;
    }

    NET_GAME.processedDecisions.add(
        token
    );

    if (
        NET_GAME.processedDecisions.size >
        500
    ) {

        const first =
            NET_GAME.processedDecisions
                .values()
                .next()
                .value;

        if (first) {
            NET_GAME.processedDecisions.delete(
                first
            );
        }
    }
}


/* =========================================================
   5.12 — EVENT NORMALIZATION
========================================================= */

function normalizeNetworkEvent(
    event
) {

    if (
        !event ||
        typeof event !== "object"
    ) {
        return null;
    }

    const choices =
        safeArray(
            event.choices
        ).slice(0, 3);

    return {

        id:
            String(
                event.id ||
                `event_${Date.now()}`
            ),

        title:
            String(
                event.title ||
                "رویداد فوری"
            ).slice(0, 160),

        description:
            String(
                event.description ||
                "یک اتفاق غیرمنتظره کشور را تحت تأثیر قرار داده است."
            ).slice(0, 1200),

        type:
            String(
                event.type ||
                "political"
            ),

        category:
            String(
                event.category ||
                event.type ||
                "general"
            ),

        severity:
            safeNumber(
                event.severity,
                2
            ),

        targetPlayerId:
            event.targetPlayerId ||
            null,

        actorPlayerId:
            event.actorPlayerId ||
            null,

        news:
            String(
                event.news ||
                event.title ||
                "خبر فوری"
            ).slice(0, 300),

        choices:
            choices.map(
                (choice, index) => {

                    const safeChoice =
                        choice || {};

                    return {

                        id:
                            String(
                                safeChoice.id ||
                                `choice_${index + 1}`
                            ),

                        title:
                            String(
                                safeChoice.title ||
                                `تصمیم ${index + 1}`
                            ).slice(0, 120),

                        description:
                            String(
                                safeChoice.description ||
                                ""
                            ).slice(0, 600),

                        effects:
                            safeChoice.effects ||
                            {},

                        relations:
                            safeChoice.relations ||
                            {},

                        risk:
                            safeNumber(
                                safeChoice.risk,
                                0
                            ),

                        reward:
                            safeNumber(
                                safeChoice.reward,
                                0
                            )
                    };
                }
            ),

        stage:
            safeNumber(
                event.stage,
                STATE?.stage || 0
            ),

        turnIndex:
            safeNumber(
                event.turnIndex,
                STATE?.currentTurnIndex || 0
            )
    };
}


/* =========================================================
   5.13 — ENSURE THREE CHOICES
========================================================= */

function ensureThreeChoices(
    event
) {

    if (!event) {
        return event;
    }

    if (
        !Array.isArray(
            event.choices
        )
    ) {
        event.choices = [];
    }

    while (
        event.choices.length < 3
    ) {

        const index =
            event.choices.length + 1;

        event.choices.push({

            id:
                `fallback_choice_${index}`,

            title:
                `تصمیم ${index}`,

            description:
                "یک تصمیم محتاطانه برای مدیریت شرایط.",

            effects: {
                stability: 1
            },

            relations: {},

            risk: 0,

            reward: 0
        });
    }

    event.choices =
        event.choices.slice(0, 3);

    return event;
}


/* =========================================================
   5.14 — EVENT TARGET CHECK
========================================================= */

function isEventForLocalPlayer(
    event
) {

    if (!event) {
        return false;
    }

    if (
        !event.targetPlayerId
    ) {
        return true;
    }

    return (
        event.targetPlayerId ===
        getCurrentPlayerId()
    );
}


/* =========================================================
   5.15 — EVENT AUTHORITY
========================================================= */

function canGenerateEvent() {

    /*
     * Only host generates the authoritative event.
     */
    return isLocalHost();
}


/* =========================================================
   5.16 — EVENT REQUEST
========================================================= */

async function requestNextEvent() {

    if (
        typeof STATE === "undefined" ||
        !STATE
    ) {
        return false;
    }

    if (!STATE.gameStarted) {
        return false;
    }

    if (
        STATE.phase ===
        "ended"
    ) {
        return false;
    }

    if (!canGenerateEvent()) {

        await broadcastMessage(
            "event_request",
            {
                requesterId:
                    getCurrentPlayerId(),

                stage:
                    STATE.stage,

                turnIndex:
                    STATE.currentTurnIndex
            }
        );

        return false;
    }

    return generateAuthoritativeEvent();
}


/* =========================================================
   5.17 — EVENT REQUEST HANDLER
========================================================= */

async function handleEventRequest(
    message
) {

    if (!isLocalHost()) {
        return;
    }

    if (
        !STATE.gameStarted
    ) {
        return;
    }

    /*
     * Ignore stale requests.
     */
    if (
        safeNumber(
            message?.stage,
            -1
        ) !==
        safeNumber(
            STATE.stage,
            0
        )
    ) {
        return;
    }

    if (
        safeNumber(
            message?.turnIndex,
            -1
        ) !==
        safeNumber(
            STATE.currentTurnIndex,
            0
        )
    ) {
        return;
    }

    await generateAuthoritativeEvent();
}


/* =========================================================
   5.18 — AI EVENT LOCK
========================================================= */

function acquireEventLock() {

    if (
        NET_GAME.eventLock
    ) {
        return null;
    }

    const lockId =
        createNetworkMessageId(
            "event_lock"
        );

    NET_GAME.eventLock =
        true;

    NET_GAME.eventLockId =
        lockId;

    NET_GAME.eventLockOwner =
        getCurrentPlayerId();

    NET_GAME.eventRequestId =
        lockId;

    return lockId;
}


/* =========================================================
   5.19 — RELEASE EVENT LOCK
========================================================= */

function releaseEventLock() {

    NET_GAME.eventLock =
        false;

    NET_GAME.eventLockId =
        null;

    NET_GAME.eventLockOwner =
        null;

    NET_GAME.eventRequestId =
        null;
}


/* =========================================================
   5.20 — AUTHORITATIVE EVENT GENERATION
========================================================= */

async function generateAuthoritativeEvent() {

    if (
        !isLocalHost()
    ) {
        return false;
    }

    if (
        NET_GAME.eventLock
    ) {
        return false;
    }

    if (
        !STATE.gameStarted
    ) {
        return false;
    }

    if (
        STATE.phase ===
        "event"
    ) {
        return false;
    }

    const currentPlayer =
        getCurrentTurnPlayer();

    if (!currentPlayer) {

        console.error(
            "[RepublicGame] No current turn player."
        );

        return false;
    }

    const lockId =
        acquireEventLock();

    if (!lockId) {
        return false;
    }

    STATE.phase =
        "generating_event";

    NET_GAME.awaitingEvent =
        true;

    /*
     * Notify clients that the AI is thinking.
     */
    await broadcastMessage(
        "event_thinking",
        {
            stage:
                STATE.stage,

            turnIndex:
                STATE.currentTurnIndex,

            targetPlayerId:
                currentPlayer.id
        }
    );

    try {

        let event = null;

        /*
         * Use existing AI Director if available.
         */
        if (
            typeof generateAIEvent ===
            "function"
        ) {

            event =
                await generateAIEvent(
                    STATE,
                    safeArray(
                        STATE.history
                    )
                );
        }

        /*
         * Fallback if AI failed.
         */
        if (!event) {

            event =
                createEmergencyEvent(
                    currentPlayer
                );
        }

        event =
            normalizeNetworkEvent(
                event
            );

        event =
            ensureThreeChoices(
                event
            );

        event.stage =
            STATE.stage;

        event.turnIndex =
            STATE.currentTurnIndex;

        event.targetPlayerId =
            event.targetPlayerId ||
            currentPlayer.id;

        const token =
            createEventToken(
                event,
                STATE.stage,
                STATE.currentTurnIndex
            );

        if (
            hasProcessedEvent(
                token
            )
        ) {

            releaseEventLock();

            return false;
        }

        markEventProcessed(
            token
        );

        STATE.currentEvent =
            event;

        STATE.phase =
            "event";

        NET_GAME.awaitingEvent =
            false;

        /*
         * Broadcast the single authoritative event.
         */
        await broadcastMessage(
            "authoritative_event",
            {
                event,

                stage:
                    STATE.stage,

                turnIndex:
                    STATE.currentTurnIndex,

                eventToken:
                    token,

                targetPlayerId:
                    event.targetPlayerId
            }
        );

        /*
         * Render host immediately.
         */
        presentAuthoritativeEvent(
            event
        );

        releaseEventLock();

        return true;

    } catch (error) {

        console.error(
            "[RepublicGame] Event generation failed:",
            error
        );

        const fallback =
            createEmergencyEvent(
                currentPlayer
            );

        const normalized =
            normalizeNetworkEvent(
                fallback
            );

        normalized.stage =
            STATE.stage;

        normalized.turnIndex =
            STATE.currentTurnIndex;

        normalized.targetPlayerId =
            currentPlayer.id;

        const token =
            createEventToken(
                normalized,
                STATE.stage,
                STATE.currentTurnIndex
            );

        markEventProcessed(
            token
        );

        STATE.currentEvent =
            normalized;

        STATE.phase =
            "event";

        NET_GAME.awaitingEvent =
            false;

        await broadcastMessage(
            "authoritative_event",
            {
                event:
                    normalized,

                stage:
                    STATE.stage,

                turnIndex:
                    STATE.currentTurnIndex,

                eventToken:
                    token,

                fallback: true
            }
        );

        presentAuthoritativeEvent(
            normalized
        );

        releaseEventLock();

        return true;
    }
}


/* =========================================================
   5.21 — EMERGENCY EVENT
========================================================= */

function createEmergencyEvent(
    player
) {

    return {

        id:
            `emergency_${Date.now()}`,

        title:
            "جلسه اضطراری دولت",

        description:
            `${player?.country || "کشور"} با یک بحران ناگهانی در مدیریت داخلی روبه‌رو شده است و شورای دولت منتظر تصمیم رئیس‌جمهور است.`,

        type:
            "political",

        category:
            "emergency",

        severity:
            2,

        targetPlayerId:
            player?.id || null,

        news:
            "خبر فوری: جلسه اضطراری دولت تشکیل شد.",

        choices: [

            {
                id:
                    "emergency_council",

                title:
                    "تشکیل شورای بحران",

                description:
                    "گروهی از نهادهای مختلف برای بررسی سریع وضعیت تشکیل دهید.",

                effects: {
                    stability: 4,
                    popularity: 1
                },

                relations: {
                    executive: 2,
                    parliament: 1
                }
            },

            {
                id:
                    "public_statement",

                title:
                    "بیانیه عمومی",

                description:
                    "رئیس‌جمهور مستقیماً با مردم درباره وضعیت صحبت کند.",

                effects: {
                    popularity: 4,
                    stability: -1
                },

                relations: {
                    public: 3,
                    media: 2
                }
            },

            {
                id:
                    "wait_report",

                title:
                    "صبر برای گزارش کامل",

                description:
                    "پیش از هر اقدام، اطلاعات بیشتری جمع‌آوری کنید.",

                effects: {
                    stability: 2,
                    economy: 1
                },

                relations: {
                    executive: 1,
                    academia: 1
                }
            }
        ]
    };
}


/* =========================================================
   5.22 — PRESENT EVENT
========================================================= */

function presentAuthoritativeEvent(
    event
) {

    if (!event) {
        return;
    }

    STATE.currentEvent =
        event;

    STATE.phase =
        "event";

    NET_GAME.awaitingEvent =
        false;

    NET_GAME.awaitingDecision =
        isMyTurn() &&
        isEventForLocalPlayer(
            event
        );

    /*
     * Existing UI renderer.
     */
    if (
        typeof renderEvent ===
        "function"
    ) {

        renderEvent(
            event
        );

    } else if (
        typeof showEvent ===
        "function"
    ) {

        showEvent(
            event
        );
    }

    /*
     * Existing cinematic system.
     */
    if (
        window.Office3D &&
        typeof window.Office3D.showEvent ===
        "function"
    ) {

        try {
            window.Office3D.showEvent(
                event
            );
        } catch (error) {
            console.warn(
                "[RepublicGame] Office3D event:",
                error
            );
        }
    }

    updateTurnUI();

    trackPresenceSafe();
}


/* =========================================================
   5.23 — AUTHORITATIVE EVENT HANDLER
========================================================= */

function handleAuthoritativeEvent(
    message
) {

    if (
        !message ||
        !message.event
    ) {
        return;
    }

    const event =
        normalizeNetworkEvent(
            message.event
        );

    if (!event) {
        return;
    }

    const token =
        message.eventToken ||
        createEventToken(
            event,
            message.stage,
            message.turnIndex
        );

    /*
     * Ignore duplicate event packets.
     */
    if (
        hasProcessedEvent(
            token
        )
    ) {

        /*
         * If the event is already our current
         * event, just make sure UI is visible.
         */
        if (
            STATE.currentEvent &&
            STATE.currentEvent.id ===
                event.id
        ) {
            presentAuthoritativeEvent(
                STATE.currentEvent
            );
        }

        return;
    }

    markEventProcessed(
        token
    );

    /*
     * Reject stale stages.
     */
    if (
        safeNumber(
            message.stage,
            STATE.stage
        ) !==
        safeNumber(
            STATE.stage,
            0
        )
    ) {
        return;
    }

    STATE.currentEvent =
        event;

    STATE.phase =
        "event";

    NET_GAME.eventLock =
        false;

    NET_GAME.awaitingEvent =
        false;

    presentAuthoritativeEvent(
        event
    );
}


/* =========================================================
   5.24 — EVENT THINKING HANDLER
========================================================= */

function handleEventThinking(
    message
) {

    if (
        message?.stage !==
        STATE?.stage
    ) {
        return;
    }

    NET_GAME.awaitingEvent =
        true;

    if (
        typeof setAIThinking ===
        "function"
    ) {

        setAIThinking(
            true
        );
    }

    const loader =
        document.getElementById(
            "aiThinking"
        );

    if (loader) {

        loader.classList.add(
            "active"
        );
    }
}


/* =========================================================
   5.25 — CHOICE VALIDATION
========================================================= */

function findChoiceById(
    event,
    choiceId
) {

    if (
        !event ||
        !choiceId
    ) {
        return null;
    }

    return (
        safeArray(
            event.choices
        ).find(
            choice =>
                choice &&
                String(
                    choice.id
                ) ===
                String(choiceId)
        ) ||
        null
    );
}


/* =========================================================
   5.26 — CAN SUBMIT DECISION
========================================================= */

function canSubmitDecision(
    choiceId
) {

    if (
        !STATE ||
        !STATE.gameStarted
    ) {
        return false;
    }

    if (
        STATE.phase !==
        "event"
    ) {
        return false;
    }

    if (!isMyTurn()) {
        return false;
    }

    const event =
        STATE.currentEvent;

    if (!event) {
        return false;
    }

    if (
        !isEventForLocalPlayer(
            event
        )
    ) {
        return false;
    }

    const choice =
        findChoiceById(
            event,
            choiceId
        );

    if (!choice) {
        return false;
    }

    const token =
        createDecisionToken(
            event.id,
            getCurrentPlayerId(),
            choice.id
        );

    if (
        hasProcessedDecision(
            token
        )
    ) {
        return false;
    }

    if (
        NET_GAME.decisionLocks.has(
            token
        )
    ) {
        return false;
    }

    return true;
}


/* =========================================================
   5.27 — SUBMIT DECISION
========================================================= */

async function submitDecision(
    choiceId
) {

    if (
        !canSubmitDecision(
            choiceId
        )
    ) {

        showToastSafe(
            "این تصمیم در حال حاضر قابل ثبت نیست.",
            "warning"
        );

        return false;
    }

    const event =
        STATE.currentEvent;

    const choice =
        findChoiceById(
            event,
            choiceId
        );

    const playerId =
        getCurrentPlayerId();

    const token =
        createDecisionToken(
            event.id,
            playerId,
            choice.id
        );

    NET_GAME.decisionLocks.add(
        token
    );

    NET_GAME.pendingDecision = {

        token,

        eventId:
            event.id,

        playerId,

        choiceId:
            choice.id,

        submittedAt:
            Date.now()
    };

    /*
     * Immediately lock the local UI.
     */
    disableDecisionButtons();

    if (
        typeof showDecisionSelection ===
        "function"
    ) {

        showDecisionSelection(
            choice.id
        );
    }

    /*
     * Send the decision to the host.
     */
    if (
        isLocalHost()
    ) {

        handleDecisionRequest({

            type:
                "decision_request",

            senderId:
                playerId,

            eventId:
                event.id,

            playerId,

            choiceId:
                choice.id,

            decisionToken:
                token
        });

        return true;
    }

    await broadcastMessage(
        "decision_request",
        {
            eventId:
                event.id,

            playerId,

            choiceId:
                choice.id,

            decisionToken:
                token
        }
    );

    showToastSafe(
        "تصمیم شما برای میزبان ارسال شد.",
        "info"
    );

    return true;
}


/* =========================================================
   5.28 — DECISION REQUEST HANDLER
========================================================= */

function handleDecisionRequest(
    message
) {

    if (!isLocalHost()) {
        return;
    }

    if (
        !message ||
        !message.eventId ||
        !message.playerId ||
        !message.choiceId
    ) {
        return;
    }

    /*
     * Only the player whose turn it is
     * may submit the decision.
     */
    if (
        message.playerId !==
        getCurrentTurnPlayerId()
    ) {

        broadcastMessage(
            "decision_rejected",
            {
                targetId:
                    message.playerId,

                reason:
                    "نوبت این بازیکن نیست."
            }
        );

        return;
    }

    const event =
        STATE.currentEvent;

    if (
        !event ||
        event.id !==
        message.eventId
    ) {

        broadcastMessage(
            "decision_rejected",
            {
                targetId:
                    message.playerId,

                reason:
                    "رویداد دیگر معتبر نیست."
            }
        );

        return;
    }

    const choice =
        findChoiceById(
            event,
            message.choiceId
        );

    if (!choice) {

        broadcastMessage(
            "decision_rejected",
            {
                targetId:
                    message.playerId,

                reason:
                    "تصمیم نامعتبر است."
            }
        );

        return;
    }

    const token =
        message.decisionToken ||
        createDecisionToken(
            event.id,
            message.playerId,
            choice.id
        );

    if (
        hasProcessedDecision(
            token
        )
    ) {

        return;
    }

    /*
     * Mark before applying.
     * This prevents duplicate packets from
     * applying the same decision twice.
     */
    markDecisionProcessed(
        token
    );

    NET_GAME.awaitingDecision =
        false;

    STATE.phase =
        "resolving";

    const player =
        STATE.players.find(
            item =>
                item &&
                item.id ===
                message.playerId
        );

    if (!player) {
        return;
    }

    /*
     * Apply exactly once.
     */
    let result = null;

    try {

        if (
            typeof applyDecision ===
            "function"
        ) {

            result =
                applyDecision(
                    player,
                    event,
                    choice
                );
        }

    } catch (error) {

        console.error(
            "[RepublicGame] applyDecision failed:",
            error
        );

        result = {

            success: false,

            error:
                error.message ||
                "decision-error"
        };
    }

    /*
     * Broadcast authoritative result.
     */
    broadcastDecisionResult(
        player,
        event,
        choice,
        result,
        token
    );
}


/* =========================================================
   5.29 — DECISION RESULT
========================================================= */

async function broadcastDecisionResult(
    player,
    event,
    choice,
    result,
    token
) {

    const safeResult =
        result || {};

    await broadcastMessage(
        "decision_result",
        {

            eventId:
                event.id,

            playerId:
                player.id,

            choiceId:
                choice.id,

            decisionToken:
                token,

            result:
                safeResult,

            playerSnapshot:
                sanitizePlayerForNetwork(
                    player
                ),

            world:
                STATE.world
                    ? sanitizeWorldForNetwork(
                        STATE.world
                    )
                    : null,

            stage:
                STATE.stage,

            turnIndex:
                STATE.currentTurnIndex
        }
    );

    /*
     * Host also applies the visual result locally.
     */
    handleDecisionResult({
        payload: {
            type:
                "decision_result",

            eventId:
                event.id,

            playerId:
                player.id,

            choiceId:
                choice.id,

            decisionToken:
                token,

            result:
                safeResult,

            playerSnapshot:
                sanitizePlayerForNetwork(
                    player
                ),

            world:
                STATE.world
                    ? sanitizeWorldForNetwork(
                        STATE.world
                    )
                    : null,

            stage:
                STATE.stage,

            turnIndex:
                STATE.currentTurnIndex
        }
    });

    /*
     * Continue the game only after the
     * authoritative decision has been broadcast.
     */
    setTimeout(
        () => {

            if (
                isLocalHost()
            ) {
                continueAfterDecision();
            }

        },
        650
    );
}


/* =========================================================
   5.30 — DECISION RESULT HANDLER
========================================================= */

function handleDecisionResult(
    payload
) {

    const message =
        payload?.payload ||
        payload;

    if (!message) {
        return;
    }

    const token =
        message.decisionToken ||
        createDecisionToken(
            message.eventId,
            message.playerId,
            message.choiceId
        );

    /*
     * We already processed it locally as host.
     * For clients, this is the first time.
     */
    const already =
        hasProcessedDecision(
            token
        );

    if (
        !already
    ) {

        markDecisionProcessed(
            token
        );
    }

    const player =
        STATE.players.find(
            item =>
                item &&
                item.id ===
                message.playerId
        );

    /*
     * Apply authoritative player snapshot.
     */
    if (
        player &&
        message.playerSnapshot
    ) {

        Object.assign(
            player,
            message.playerSnapshot
        );

        ensurePlayerCollections(
            player
        );
    }

    /*
     * Apply authoritative world snapshot.
     */
    if (
        message.world
    ) {

        STATE.world = {

            ...(STATE.world || {}),

            ...message.world
        };
    }

    NET_GAME.awaitingDecision =
        false;

    NET_GAME.pendingDecision =
        null;

    /*
     * Visual result.
     */
    if (
        typeof showDecisionResult ===
        "function"
    ) {

        showDecisionResult(
            message.result
        );
    }

    if (
        typeof updateGameUI ===
        "function"
    ) {

        updateGameUI();
    }

    if (
        window.Office3D &&
        typeof window.Office3D.showNews ===
        "function"
    ) {

        try {

            const result =
                message.result || {};

            window.Office3D.showNews({

                title:
                    result.title ||
                    "نتیجه تصمیم",

                description:
                    result.description ||
                    result.story ||
                    "نتیجه تصمیم ثبت شد.",

                news:
                    result.news ||
                    "خبر فوری: تصمیم دولت اجرا شد."
            });

        } catch (error) {

            console.warn(
                "[RepublicGame] Office3D result:",
                error
            );
        }
    }

    updateTurnUI();
}


/* =========================================================
   5.31 — DECISION REJECTED
========================================================= */

function handleDecisionRejected(
    message
) {

    if (
        message?.targetId !==
        getCurrentPlayerId()
    ) {
        return;
    }

    NET_GAME.pendingDecision =
        null;

    NET_GAME.awaitingDecision =
        true;

    if (
        message.reason
    ) {

        showToastSafe(
            message.reason,
            "warning"
        );
    }

    enableDecisionButtons();
}


/* =========================================================
   5.32 — DISABLE DECISION BUTTONS
========================================================= */

function disableDecisionButtons() {

    const buttons =
        document.querySelectorAll(
            ".decision-card"
        );

    buttons.forEach(
        button => {

            button.classList.add(
                "locked"
            );

            button.setAttribute(
                "aria-disabled",
                "true"
            );
        }
    );
}


/* =========================================================
   5.33 — ENABLE DECISION BUTTONS
========================================================= */

function enableDecisionButtons() {

    const buttons =
        document.querySelectorAll(
            ".decision-card"
        );

    buttons.forEach(
        button => {

            button.classList.remove(
                "locked"
            );

            button.removeAttribute(
                "aria-disabled"
            );
        }
    );
}


/* =========================================================
   5.34 — TURN ADVANCE
========================================================= */

function calculateNextTurnIndex() {

    const players =
        safeArray(
            STATE.players
        );

    if (!players.length) {
        return 0;
    }

    let next =
        safeNumber(
            STATE.currentTurnIndex,
            0
        ) + 1;

    /*
     * Skip disconnected players.
     */
    let safety = 0;

    while (
        safety <
            players.length &&
        players[
            next %
            players.length
        ]?.connected === false
    ) {

        next++;
        safety++;
    }

    return (
        next %
        players.length
    );
}


/* =========================================================
   5.35 — AUTHORITATIVE TURN ADVANCE
========================================================= */

async function continueAfterDecision() {

    if (
        !isLocalHost()
    ) {
        return;
    }

    if (
        STATE.phase !==
        "resolving"
    ) {
        return;
    }

    /*
     * Delayed consequences from previous decisions.
     */
    try {

        if (
            typeof processDueDelayedConsequences ===
            "function"
        ) {

            processDueDelayedConsequences();
        }

    } catch (error) {

        console.warn(
            "[RepublicGame] Delayed consequence processing:",
            error
        );
    }

    const nextIndex =
        calculateNextTurnIndex();

    let nextStage =
        safeNumber(
            STATE.stage,
            1
        );

    /*
     * A full cycle = next stage.
     */
    if (
        nextIndex <=
        safeNumber(
            STATE.currentTurnIndex,
            0
        )
    ) {

        nextStage++;
    }

    /*
     * End condition.
     */
    if (
        nextStage >
        safeNumber(
            STATE.maxStages,
            30
        )
    ) {

        finishGameAuthoritatively();

        return;
    }

    STATE.currentTurnIndex =
        nextIndex;

    STATE.stage =
        nextStage;

    STATE.currentEvent =
        null;

    STATE.phase =
        "turn_transition";

    NET_GAME.turnNonce++;

    const turnToken =
        createTurnToken();

    NET_GAME.processedTurns.add(
        turnToken
    );

    /*
     * Broadcast exact next turn.
     */
    await broadcastMessage(
        "turn_advanced",
        {
            stage:
                STATE.stage,

            turnIndex:
                STATE.currentTurnIndex,

            turnPlayerId:
                getCurrentTurnPlayerId(),

            turnToken,

            maxStages:
                STATE.maxStages
        }
    );

    broadcastStateSnapshot();

    /*
     * Give cinematic transition time.
     */
    playStageTransitionSafe();

    setTimeout(
        () => {

            if (
                isLocalHost()
            ) {

                beginAuthoritativeTurn();
            }

        },
        900
    );
}


/* =========================================================
   5.36 — TURN HANDLER
========================================================= */

function handleTurnAdvanced(
    message
) {

    if (!message) {
        return;
    }

    const stage =
        safeNumber(
            message.stage,
            0
        );

    const turnIndex =
        safeNumber(
            message.turnIndex,
            0
        );

    /*
     * Reject old turn packets.
     */
    if (
        stage <
        safeNumber(
            STATE.stage,
            0
        )
    ) {
        return;
    }

    if (
        stage ===
            safeNumber(
                STATE.stage,
                0
            ) &&
        turnIndex <
            safeNumber(
                STATE.currentTurnIndex,
                0
            )
    ) {
        return;
    }

    const token =
        message.turnToken ||
        `${stage}:${turnIndex}`;

    if (
        NET_GAME.processedTurns.has(
            token
        )
    ) {

        updateTurnUI();

        return;
    }

    NET_GAME.processedTurns.add(
        token
    );

    STATE.stage =
        stage;

    STATE.currentTurnIndex =
        turnIndex;

    STATE.currentEvent =
        null;

    STATE.phase =
        "turn_transition";

    NET_GAME.lastAuthoritativeStage =
        stage;

    NET_GAME.lastAuthoritativeTurn =
        turnIndex;

    NET_GAME.awaitingEvent =
        false;

    NET_GAME.awaitingDecision =
        false;

    NET_GAME.pendingDecision =
        null;

    enableDecisionButtons();

    updateTurnUI();

    playStageTransitionSafe();

    trackPresenceSafe();

    /*
     * Only host generates the event.
     */
    if (
        isLocalHost()
    ) {

        setTimeout(
            () => {

                beginAuthoritativeTurn();

            },
            900
        );
    }
}


/* =========================================================
   5.37 — BEGIN TURN
========================================================= */

async function beginAuthoritativeTurn() {

    if (
        !isLocalHost()
    ) {
        return;
    }

    if (
        !STATE.gameStarted
    ) {
        return;
    }

    const currentPlayer =
        getCurrentTurnPlayer();

    if (!currentPlayer) {
        return;
    }

    STATE.phase =
        "turn";

    updateTurnUI();

    await broadcastMessage(
        "turn_started",
        {
            stage:
                STATE.stage,

            turnIndex:
                STATE.currentTurnIndex,

            playerId:
                currentPlayer.id
        }
    );

    /*
     * Small cinematic delay before AI event.
     */
    setTimeout(
        () => {

            if (
                isLocalHost() &&
                STATE.phase ===
                    "turn"
            ) {

                generateAuthoritativeEvent();
            }

        },
        650
    );
}


/* =========================================================
   5.38 — TURN START HANDLER
========================================================= */

function handleTurnStarted(
    message
) {

    if (!message) {
        return;
    }

    STATE.phase =
        "turn";

    updateTurnUI();

    if (
        message.playerId ===
        getCurrentPlayerId()
    ) {

        showToastSafe(
            "نوبت شماست.",
            "success"
        );

    } else {

        const player =
            STATE.players.find(
                item =>
                    item &&
                    item.id ===
                    message.playerId
            );

        if (player) {

            showToastSafe(
                `نوبت ${player.name || player.leaderName} است.`,
                "info"
            );
        }
    }
}


/* =========================================================
   5.39 — TURN UI
========================================================= */

function updateTurnUI() {

    try {

        const currentPlayer =
            getCurrentTurnPlayer();

        const localId =
            getCurrentPlayerId();

        const indicator =
            document.getElementById(
                "turnIndicator"
            );

        if (indicator) {

            if (
                currentPlayer &&
                currentPlayer.id ===
                    localId
            ) {

                indicator.textContent =
                    "نوبت شما";

                indicator.classList.add(
                    "my-turn"
                );

            } else {

                indicator.textContent =
                    currentPlayer
                        ? `نوبت ${currentPlayer.name || currentPlayer.leaderName}`
                        : "در انتظار نوبت";

                indicator.classList.remove(
                    "my-turn"
                );
            }
        }

        const stageValue =
            document.getElementById(
                "stageValue"
            );

        if (stageValue) {

            stageValue.textContent =
                String(
                    safeNumber(
                        STATE.stage,
                        0
                    )
                );
        }

        const stageCounter =
            document.getElementById(
                "stageCounter"
            );

        if (stageCounter) {

            stageCounter.textContent =
                `${safeNumber(
                    STATE.stage,
                    0
                )} / ${safeNumber(
                    STATE.maxStages,
                    30
                )}`;
        }

        const localTurn =
            isMyTurn();

        if (
            localTurn &&
            STATE.phase ===
                "event"
        ) {

            enableDecisionButtons();

        } else {

            disableDecisionButtons();
        }

    } catch (error) {

        console.warn(
            "[RepublicGame] Turn UI:",
            error
        );
    }
}


/* =========================================================
   5.40 — CINEMATIC TRANSITION
========================================================= */

function playStageTransitionSafe() {

    try {

        const transition =
            document.createElement(
                "div"
            );

        transition.className =
            "stage-transition";

        transition.innerHTML = `
            <div class="stage-number-pop">
                مرحله
                <strong>
                    ${safeNumber(
                        STATE?.stage,
                        0
                    )}
                </strong>
            </div>
        `;

        document.body.appendChild(
            transition
        );

        requestAnimationFrame(
            () => {

                transition.classList.add(
                    "active"
                );
            }
        );

        setTimeout(
            () => {

                transition.classList.remove(
                    "active"
                );

                setTimeout(
                    () => {
                        transition.remove();
                    },
                    500
                );

            },
            900
        );

    } catch (error) {

        console.warn(
            "[RepublicGame] Transition:",
            error
        );
    }
}


/* =========================================================
   5.41 — PRESENCE SAFE
========================================================= */

async function trackPresenceSafe() {

    try {

        if (
            typeof trackPresence ===
            "function"
        ) {

            await trackPresence();
        }

    } catch (error) {

        console.warn(
            "[RepublicGame] Presence update:",
            error
        );
    }
}


/* =========================================================
   5.42 — FINISH GAME
========================================================= */

function finishGameAuthoritatively() {

    if (
        !isLocalHost()
    ) {
        return;
    }

    STATE.phase =
        "ended";

    STATE.gameStarted =
        false;

    const ranking =
        typeof rankPlayers ===
            "function"
            ? rankPlayers()
            : [];

    broadcastMessage(
        "game_finished",
        {
            ranking
        }
    );

    broadcastStateSnapshot();

    showFinalResultsSafe(
        ranking
    );
}


/* =========================================================
   5.43 — GAME FINISHED HANDLER
========================================================= */

function handleGameFinished(
    message
) {

    STATE.phase =
        "ended";

    STATE.gameStarted =
        false;

    if (
        Array.isArray(
            message?.ranking
        )
    ) {

        STATE.ranking =
            message.ranking;
    }

    showFinalResultsSafe(
        STATE.ranking ||
        []
    );
}


/* =========================================================
   5.44 — FINAL RESULTS SAFE
========================================================= */

function showFinalResultsSafe(
    ranking
) {

    try {

        if (
            typeof showEndScreen ===
            "function"
        ) {

            showEndScreen(
                ranking
            );

            return;
        }

        const endScreen =
            document.getElementById(
                "endScreen"
            );

        if (!endScreen) {
            return;
        }

        endScreen.classList.add(
            "active"
        );

    } catch (error) {

        console.warn(
            "[RepublicGame] End screen:",
            error
        );
    }
}


/* =========================================================
   5.45 — NETWORK MESSAGE EXTENSION
========================================================= */

async function handleGameNetworkMessage(
    message
) {

    if (
        !message ||
        !message.type
    ) {
        return;
    }

    switch (
        message.type
    ) {

        case "event_request":

            await handleEventRequest(
                message
            );

            break;


        case "event_thinking":

            handleEventThinking(
                message
            );

            break;


        case "authoritative_event":

            handleAuthoritativeEvent(
                message
            );

            break;


        case "decision_request":

            handleDecisionRequest(
                message
            );

            break;


        case "decision_result":

            handleDecisionResult(
                {
                    payload:
                        message
                }
            );

            break;


        case "decision_rejected":

            handleDecisionRejected(
                message
            );

            break;


        case "turn_advanced":

            handleTurnAdvanced(
                message
            );

            break;


        case "turn_started":

            handleTurnStarted(
                message
            );

            break;


        case "game_finished":

            handleGameFinished(
                message
            );

            break;


        default:

            /*
             * Unknown messages are intentionally ignored.
             * This keeps future protocol versions compatible.
             */

            break;
    }
}


/* =========================================================
   5.46 — PUBLIC NETWORK API
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.network = {

        isMyTurn,

        getCurrentTurnPlayer,

        getCurrentTurnPlayerId,

        requestNextEvent,

        submitDecision,

        beginTurn:
            beginAuthoritativeTurn,

        updateTurnUI,

        finish:
            finishGameAuthoritatively
    };
}


/* =========================================================
   5.47 — PART 5 END
=========================================================

   DO NOT ADD `})();`

   PART 6 WILL CONTINUE DIRECTLY BELOW.

   PART 6:
   - AI DIRECTOR
   - CONSEQUENCE GENERATION
   - CRISIS CHAINS
   - DELAYED EVENTS
   - WORLD EVENTS
   - NEWS
   - AI FALLBACKS

========================================================= */
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v10.0-CINEMATIC
   PART 6 / 8

   AI DIRECTOR
   CONSEQUENCES
   CRISIS CHAINS
   DELAYED EVENTS
   WORLD EVENTS
   NEWS
   AI FALLBACKS
   ========================================================= */


/* =========================================================
   6.0 — AI DIRECTOR STATE
========================================================= */

const AI_DIRECTOR = {

    version:
        "10.0-CINEMATIC",

    busy: false,

    requestId: null,

    lastEventId: null,

    lastConsequenceId: null,

    eventAttempts: 0,

    consequenceAttempts: 0,

    maxAttempts: 2,

    cooldownUntil: 0,

    recentCategories: [],

    recentEventIds: [],

    recentTitles: [],

    crisisChainDepth: 0,

    maxCrisisChainDepth: 4
};


/* =========================================================
   6.1 — AI TIME GUARD
========================================================= */

function aiCanRun() {

    return (
        Date.now() >=
        safeNumber(
            AI_DIRECTOR.cooldownUntil,
            0
        )
    );
}


/* =========================================================
   6.2 — AI COOLDOWN
========================================================= */

function setAICooldown(
    milliseconds = 250
) {

    AI_DIRECTOR.cooldownUntil =
        Date.now() +
        Math.max(
            0,
            Number(milliseconds) || 0
        );
}


/* =========================================================
   6.3 — AI REQUEST ID
========================================================= */

function createAIRequestId(
    type
) {

    return (
        "ai_" +
        String(type || "request") +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
}


/* =========================================================
   6.4 — AI GAME SNAPSHOT
========================================================= */

function createAIGameSnapshot() {

    const players =
        safeArray(
            STATE?.players
        );

    return {

        stage:
            safeNumber(
                STATE?.stage,
                0
            ),

        maxStages:
            safeNumber(
                STATE?.maxStages,
                30
            ),

        phase:
            STATE?.phase ||
            "unknown",

        currentTurnIndex:
            safeNumber(
                STATE?.currentTurnIndex,
                0
            ),

        currentPlayerId:
            getCurrentTurnPlayerId(),

        players:
            players.map(
                player =>
                    sanitizeAIPlayer(
                        player
                    )
            ),

        world:
            STATE?.world
                ? {
                    ...STATE.world
                }
                : {},

        institutions:
            safeArray(
                STATE?.institutions
            ).map(
                institution => ({
                    id:
                        institution?.id,

                    name:
                        institution?.name,

                    mood:
                        safeNumber(
                            institution?.mood,
                            0
                        ),

                    trust:
                        safeNumber(
                            institution?.trust,
                            0
                        )
                })
            ),

        currentEvent:
            STATE?.currentEvent
                ? {
                    id:
                        STATE.currentEvent.id,

                    title:
                        STATE.currentEvent.title,

                    category:
                        STATE.currentEvent.category,

                    severity:
                        STATE.currentEvent.severity
                }
                : null,

        history:
            safeArray(
                STATE?.history
            ).slice(-15),

        crises:
            collectActiveCrises(),

        delayedConsequences:
            collectUpcomingConsequences()
    };
}


/* =========================================================
   6.5 — AI PLAYER SANITIZER
========================================================= */

function sanitizeAIPlayer(
    player
) {

    if (!player) {
        return null;
    }

    return {

        id:
            player.id,

        name:
            player.name ||
            player.leaderName ||
            "بازیکن",

        country:
            player.country ||
            "کشور",

        geography:
            player.geography ||
            "نامشخص",

        isHost:
            !!player.isHost,

        connected:
            player.connected !== false,

        stats: {

            money:
                safeNumber(
                    player.stats?.money,
                    1000
                ),

            economy:
                safeNumber(
                    player.stats?.economy,
                    70
                ),

            electricity:
                safeNumber(
                    player.stats?.electricity,
                    75
                ),

            popularity:
                safeNumber(
                    player.stats?.popularity,
                    60
                ),

            stability:
                safeNumber(
                    player.stats?.stability,
                    65
                ),

            sanctions:
                safeNumber(
                    player.stats?.sanctions,
                    0
                ),

            relations:
                safeNumber(
                    player.stats?.relations,
                    50
                )
        },

        score:
            safeNumber(
                player.score,
                0
            ),

        reputation:
            safeNumber(
                player.reputation,
                0
            )
    };
}


/* =========================================================
   6.6 — ACTIVE CRISES
========================================================= */

function collectActiveCrises() {

    const result = [];

    safeArray(
        STATE?.players
    ).forEach(
        player => {

            safeArray(
                player?.crises
            ).forEach(
                crisis => {

                    if (
                        crisis &&
                        !crisis.resolved
                    ) {

                        result.push({

                            playerId:
                                player.id,

                            id:
                                crisis.id,

                            title:
                                crisis.title,

                            severity:
                                safeNumber(
                                    crisis.severity,
                                    1
                                ),

                            type:
                                crisis.type ||
                                "general",

                            stage:
                                safeNumber(
                                    crisis.stage,
                                    STATE?.stage
                                )
                        });
                    }
                }
            );
        }
    );

    return result.slice(-20);
}


/* =========================================================
   6.7 — UPCOMING CONSEQUENCES
========================================================= */

function collectUpcomingConsequences() {

    const result = [];

    safeArray(
        STATE?.players
    ).forEach(
        player => {

            safeArray(
                player?.delayedConsequences
            ).forEach(
                item => {

                    if (
                        item &&
                        !item.done
                    ) {

                        result.push({

                            playerId:
                                player.id,

                            id:
                                item.id,

                            choiceId:
                                item.choiceId,

                            dueStage:
                                safeNumber(
                                    item.dueStage,
                                    0
                                ),

                            title:
                                item.title ||
                                "پیامد"
                        });
                    }
                }
            );
        }
    );

    return result.slice(-20);
}


/* =========================================================
   6.8 — AI HISTORY CONTEXT
========================================================= */

function createAIHistoryContext() {

    return safeArray(
        STATE?.history
    )
        .slice(-12)
        .map(
            item => ({

                stage:
                    item?.stage,

                playerId:
                    item?.playerId,

                eventId:
                    item?.eventId,

                choiceId:
                    item?.choiceId,

                category:
                    item?.category,

                score:
                    item?.score
            })
        );
}


/* =========================================================
   6.9 — EVENT DIVERSITY
========================================================= */

function rememberAIEvent(
    event
) {

    if (!event) {
        return;
    }

    if (
        event.id
    ) {

        AI_DIRECTOR.recentEventIds
            .push(
                event.id
            );
    }

    if (
        event.title
    ) {

        AI_DIRECTOR.recentTitles
            .push(
                event.title
            );
    }

    if (
        event.category
    ) {

        AI_DIRECTOR.recentCategories
            .push(
                event.category
            );
    }

    AI_DIRECTOR.recentEventIds =
        AI_DIRECTOR.recentEventIds
            .slice(-20);

    AI_DIRECTOR.recentTitles =
        AI_DIRECTOR.recentTitles
            .slice(-20);

    AI_DIRECTOR.recentCategories =
        AI_DIRECTOR.recentCategories
            .slice(-12);
}


/* =========================================================
   6.10 — DUPLICATE EVENT CHECK
========================================================= */

function isAIEventDuplicate(
    event
) {

    if (!event) {
        return false;
    }

    if (
        event.id &&
        AI_DIRECTOR.recentEventIds.includes(
            event.id
        )
    ) {
        return true;
    }

    const title =
        String(
            event.title || ""
        ).trim();

    if (
        title &&
        AI_DIRECTOR.recentTitles.includes(
            title
        )
    ) {
        return true;
    }

    return false;
}


/* =========================================================
   6.11 — EVENT SANITIZER
========================================================= */

function sanitizeAIEvent(
    rawEvent
) {

    if (!rawEvent) {
        return null;
    }

    const event =
        normalizeNetworkEvent(
            rawEvent
        );

    if (!event) {
        return null;
    }

    ensureThreeChoices(
        event
    );

    /*
     * AI is never allowed to decide the
     * authoritative stage or turn.
     */
    event.stage =
        safeNumber(
            STATE.stage,
            0
        );

    event.turnIndex =
        safeNumber(
            STATE.currentTurnIndex,
            0
        );

    event.targetPlayerId =
        event.targetPlayerId ||
        getCurrentTurnPlayerId();

    /*
     * Prevent malformed severity.
     */
    event.severity =
        Math.max(
            1,
            Math.min(
                5,
                safeNumber(
                    event.severity,
                    2
                )
            )
        );

    return event;
}


/* =========================================================
   6.12 — SAFE AI EVENT
========================================================= */

async function requestAIEventSafe() {

    if (
        typeof generateAIEvent !==
        "function"
    ) {

        return null;
    }

    if (
        !aiCanRun()
    ) {
        return null;
    }

    const snapshot =
        createAIGameSnapshot();

    const history =
        createAIHistoryContext();

    AI_DIRECTOR.requestId =
        createAIRequestId(
            "event"
        );

    AI_DIRECTOR.eventAttempts++;

    try {

        const result =
            await generateAIEvent(
                snapshot,
                history
            );

        setAICooldown(
            250
        );

        return result || null;

    } catch (error) {

        console.warn(
            "[RepublicGame] AI event request failed:",
            error
        );

        setAICooldown(
            600
        );

        return null;
    }
}


/* =========================================================
   6.13 — AI EVENT WITH FALLBACK
========================================================= */

async function generateSmartEvent(
    player
) {

    let event = null;

    /*
     * Try AI first.
     */
    for (
        let attempt = 0;
        attempt <
            AI_DIRECTOR.maxAttempts;
        attempt++
    ) {

        event =
            await requestAIEventSafe();

        event =
            sanitizeAIEvent(
                event
            );

        if (
            event &&
            !isAIEventDuplicate(
                event
            )
        ) {
            break;
        }

        event = null;
    }

    /*
     * Local deterministic fallback.
     */
    if (!event) {

        event =
            createDynamicFallbackEvent(
                player
            );
    }

    event =
        sanitizeAIEvent(
            event
        );

    if (!event) {

        event =
            createEmergencyEvent(
                player
            );

        event =
            sanitizeAIEvent(
                event
            );
    }

    rememberAIEvent(
        event
    );

    return event;
}


/* =========================================================
   6.14 — DYNAMIC FALLBACK EVENT
========================================================= */

function createDynamicFallbackEvent(
    player
) {

    const candidates = [

        {
            category:
                "economy",

            title:
                "بازار وارد مرحله عجیبی شد",

            description:
                "بازار داخلی تحت تأثیر یک موج ناگهانی از تغییر قیمت‌ها قرار گرفته و دولت باید واکنش نشان دهد.",

            news:
                "خبر فوری: بازار داخلی وارد وضعیت غیرعادی شد.",

            choices: [

                {
                    id:
                        "market_monitoring",

                    title:
                        "نظارت بر بازار",

                    description:
                        "گزارش‌های روزانه از وضعیت بازار دریافت کنید.",

                    effects: {
                        economy: 3,
                        stability: 2,
                        popularity: 1
                    }
                },

                {
                    id:
                        "support_consumers",

                    title:
                        "حمایت از مصرف‌کنندگان",

                    description:
                        "یک برنامه موقت برای کاهش فشار هزینه‌های عمومی اجرا کنید.",

                    effects: {
                        money: -80,
                        popularity: 5,
                        economy: -1
                    }
                },

                {
                    id:
                        "wait_market",

                    title:
                        "صبر برای آرام شدن بازار",

                    description:
                        "فعلاً مداخله نکنید و روند بازار را بررسی کنید.",

                    effects: {
                        money: 20,
                        popularity: -2,
                        stability: -1
                    }
                }
            ]
        },

        {
            category:
                "diplomacy",

            title:
                "پیام غیرمنتظره دیپلماتیک",

            description:
                "یک کشور دیگر پیشنهاد گفت‌وگوی جدیدی درباره روابط منطقه‌ای داده است.",

            news:
                "خبر فوری: پیشنهاد گفت‌وگوی دیپلماتیک دریافت شد.",

            choices: [

                {
                    id:
                        "open_dialogue",

                    title:
                        "پذیرش گفت‌وگو",

                    description:
                        "کانال ارتباطی جدیدی ایجاد کنید.",

                    effects: {
                        popularity: 1,
                        stability: 2
                    },

                    relations: {
                        public: 1,
                        executive: 2
                    }
                },

                {
                    id:
                        "limited_dialogue",

                    title:
                        "گفت‌وگوی محدود",

                    description:
                        "مذاکره را با چارچوب مشخص آغاز کنید.",

                    effects: {
                        stability: 3,
                        economy: 1
                    },

                    relations: {
                        executive: 2,
                        parliament: 1
                    }
                },

                {
                    id:
                        "decline",

                    title:
                        "رد پیشنهاد",

                    description:
                        "فعلاً تغییری در سیاست خارجی ایجاد نکنید.",

                    effects: {
                        popularity: 2,
                        stability: -2
                    },

                    relations: {
                        executive: -1
                    }
                }
            ]
        },

        {
            category:
                "energy",

            title:
                "فشار ناگهانی روی شبکه انرژی",

            description:
                "مصرف انرژی افزایش یافته و کارشناسان درباره فشار بر زیرساخت هشدار داده‌اند.",

            news:
                "خبر فوری: شبکه انرژی با افزایش فشار روبه‌رو شد.",

            choices: [

                {
                    id:
                        "energy_saving",

                    title:
                        "طرح صرفه‌جویی",

                    description:
                        "یک برنامه موقت برای کاهش مصرف اجرا کنید.",

                    effects: {
                        electricity: 6,
                        stability: 2,
                        popularity: -1
                    }
                },

                {
                    id:
                        "infrastructure_budget",

                    title:
                        "سرمایه‌گذاری فوری",

                    description:
                        "بودجه بیشتری برای زیرساخت اختصاص دهید.",

                    effects: {
                        money: -120,
                        electricity: 10,
                        economy: 3
                    }
                },

                {
                    id:
                        "normal_operation",

                    title:
                        "ادامه وضعیت عادی",

                    description:
                        "فعلاً برنامه ویژه‌ای اجرا نکنید.",

                    effects: {
                        money: 15,
                        electricity: -5,
                        stability: -2
                    }
                }
            ]
        },

        {
            category:
                "media",

            title:
                "بحث داغ رسانه‌ای",

            description:
                "یک گزارش رسانه‌ای بحث گسترده‌ای درباره عملکرد دولت ایجاد کرده است.",

            news:
                "خبر فوری: گزارش جدید دولت را در مرکز توجه قرار داد.",

            choices: [

                {
                    id:
                        "transparent_briefing",

                    title:
                        "گزارش شفاف",

                    description:
                        "اطلاعات رسمی بیشتری منتشر کنید.",

                    effects: {
                        popularity: 4,
                        stability: 2
                    },

                    relations: {
                        media: 4,
                        public: 2
                    }
                },

                {
                    id:
                        "expert_review",

                    title:
                        "بررسی کارشناسی",

                    description:
                        "موضوع را به گروهی از کارشناسان مستقل بسپارید.",

                    effects: {
                        economy: 2,
                        stability: 3
                    },

                    relations: {
                        academia: 4
                    }
                },

                {
                    id:
                        "ignore_noise",

                    title:
                        "بی‌توجهی",

                    description:
                        "تمرکز دولت را روی برنامه‌های جاری نگه دارید.",

                    effects: {
                        economy: 2,
                        popularity: -3
                    },

                    relations: {
                        media: -3
                    }
                }
            ]
        }
    ];

    /*
     * Try to avoid repeating the same category.
     */
    const available =
        candidates.filter(
            item =>
                !AI_DIRECTOR
                    .recentCategories
                    .slice(-3)
                    .includes(
                        item.category
                    )
        );

    const pool =
        available.length
            ? available
            : candidates;

    const selected =
        pool[
            Math.floor(
                Math.random() *
                pool.length
            )
        ];

    return {

        id:
            `fallback_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 7)}`,

        ...selected,

        severity:
            2,

        targetPlayerId:
            player?.id ||
            getCurrentTurnPlayerId()
    };
}


/* =========================================================
   6.15 — CONSEQUENCE SNAPSHOT
========================================================= */

function createAIConsequenceSnapshot(
    player,
    event,
    choice
) {

    return {

        stage:
            safeNumber(
                STATE?.stage,
                0
            ),

        player:
            sanitizeAIPlayer(
                player
            ),

        event: {

            id:
                event?.id,

            title:
                event?.title,

            category:
                event?.category,

            severity:
                event?.severity,

            description:
                event?.description
        },

        choice: {

            id:
                choice?.id,

            title:
                choice?.title,

            description:
                choice?.description,

            effects:
                choice?.effects || {}
        },

        world:
            STATE?.world
                ? {
                    ...STATE.world
                }
                : {},

        institutions:
            safeArray(
                STATE?.institutions
            ),

        history:
            createAIHistoryContext(),

        crises:
            collectActiveCrises()
    };
}


/* =========================================================
   6.16 — SAFE AI CONSEQUENCE
========================================================= */

async function requestAIConsequenceSafe(
    player,
    event,
    choice
) {

    if (
        typeof generateAIConsequence !==
        "function"
    ) {
        return null;
    }

    if (
        !aiCanRun()
    ) {
        return null;
    }

    const snapshot =
        createAIConsequenceSnapshot(
            player,
            event,
            choice
        );

    const history =
        createAIHistoryContext();

    AI_DIRECTOR.requestId =
        createAIRequestId(
            "consequence"
        );

    AI_DIRECTOR.consequenceAttempts++;

    try {

        const result =
            await generateAIConsequence(
                snapshot,
                history,
                {
                    player:
                        sanitizeAIPlayer(
                            player
                        ),

                    country:
                        player?.country,

                    choice:
                        choice
                }
            );

        setAICooldown(
            250
        );

        return result || null;

    } catch (error) {

        console.warn(
            "[RepublicGame] AI consequence failed:",
            error
        );

        setAICooldown(
            600
        );

        return null;
    }
}


/* =========================================================
   6.17 — CONSEQUENCE SANITIZER
========================================================= */

function sanitizeAIConsequence(
    raw,
    player,
    choice
) {

    const result =
        raw &&
        typeof raw === "object"
            ? raw
            : {};

    return {

        id:
            String(
                result.id ||
                `consequence_${Date.now()}`
            ),

        title:
            String(
                result.title ||
                "نتیجه تصمیم"
            ).slice(0, 160),

        story:
            String(
                result.story ||
                result.description ||
                "تصمیم دولت وارد مرحله اجرا شد."
            ).slice(0, 1200),

        description:
            String(
                result.description ||
                result.story ||
                "نتیجه تصمیم ثبت شد."
            ).slice(0, 1200),

        news:
            String(
                result.news ||
                "خبر فوری: تصمیم دولت اجرا شد."
            ).slice(0, 300),

        effects:
            result.effects &&
            typeof result.effects ===
                "object"
                ? result.effects
                : {},

        relationChanges:
            result.relationChanges &&
            typeof result.relationChanges ===
                "object"
                ? result.relationChanges
                : {},

        addCrisis:
            result.addCrisis ||
            null,

        resolveCrisis:
            result.resolveCrisis ||
            null,

        nextEventHint:
            String(
                result.nextEventHint ||
                ""
            ).slice(0, 300),

        playerId:
            player?.id ||
            null,

        choiceId:
            choice?.id ||
            null
    };
}


/* =========================================================
   6.18 — FALLBACK CONSEQUENCE
========================================================= */

function createFallbackConsequence(
    player,
    event,
    choice
) {

    const choiceEffects =
        choice?.effects &&
        typeof choice.effects ===
            "object"
            ? choice.effects
            : {};

    const effectsCopy = {
        ...choiceEffects
    };

    return {

        id:
            `fallback_consequence_${Date.now()}`,

        title:
            "نتیجه تصمیم دولت",

        story:
            `تصمیم «${choice?.title || "تصمیم دولت"}» در کشور ${player?.country || "کشور"} اجرا شد و آثار آن به تدریج در شاخص‌های کشور دیده می‌شود.`,

        description:
            "نتیجه اولیه تصمیم ثبت شد و بخشی از پیامدها ممکن است در مراحل بعدی ظاهر شوند.",

        news:
            `خبر فوری: ${choice?.title || "تصمیم دولت"} وارد مرحله اجرا شد.`,

        effects:
            effectsCopy,

        relationChanges:
            choice?.relations || {},

        addCrisis:
            null,

        resolveCrisis:
            null,

        nextEventHint:
            "",

        playerId:
            player?.id,

        choiceId:
            choice?.id
    };
}


/* =========================================================
   6.19 — CREATE SMART CONSEQUENCE
========================================================= */

async function generateSmartConsequence(
    player,
    event,
    choice
) {

    let consequence = null;

    for (
        let attempt = 0;
        attempt <
            AI_DIRECTOR.maxAttempts;
        attempt++
    ) {

        const raw =
            await requestAIConsequenceSafe(
                player,
                event,
                choice
            );

        consequence =
            sanitizeAIConsequence(
                raw,
                player,
                choice
            );

        if (
            consequence &&
            consequence.title
        ) {
            break;
        }

        consequence = null;
    }

    if (!consequence) {

        consequence =
            createFallbackConsequence(
                player,
                event,
                choice
            );
    }

    AI_DIRECTOR.lastConsequenceId =
        consequence.id;

    return consequence;
}


/* =========================================================
   6.20 — APPLY AI CONSEQUENCE SAFELY
========================================================= */

function applyAIConsequenceSafely(
    player,
    event,
    choice,
    consequence
) {

    if (
        !player ||
        !event ||
        !choice ||
        !consequence
    ) {
        return null;
    }

    /*
     * First apply the normal deterministic
     * decision engine.
     */
    let decisionResult = null;

    try {

        if (
            typeof applyDecision ===
            "function"
        ) {

            decisionResult =
                applyDecision(
                    player,
                    event,
                    choice
                );
        }

    } catch (error) {

        console.error(
            "[RepublicGame] Base decision error:",
            error
        );

        decisionResult = {
            success: false,
            error:
                error.message ||
                "base-decision-error"
        };
    }

    /*
     * Then apply only normalized AI effects.
     * AI never replaces the authoritative state.
     */
    const aiEffects =
        normalizeAIEffects(
            consequence.effects
        );

    if (
        Object.keys(
            aiEffects
        ).length
    ) {

        applyPlayerEffects(
            player,
            aiEffects
        );
    }

    /*
     * Relations.
     */
    if (
        consequence.relationChanges &&
        typeof applyChoiceRelations ===
            "function"
    ) {

        applyChoiceRelations(
            player,
            consequence.relationChanges
        );
    }

    /*
     * Crisis.
     */
    if (
        consequence.addCrisis &&
        typeof createCrisisFromEvent ===
            "function"
    ) {

        try {

            const crisis =
                createCrisisFromEvent(
                    player,
                    {
                        ...event,

                        crisis:
                            consequence.addCrisis
                    }
                );

            if (
                crisis &&
                typeof addCrisis ===
                    "function"
            ) {

                addCrisis(
                    player,
                    crisis
                );
            }

        } catch (error) {

            console.warn(
                "[RepublicGame] AI crisis:",
                error
            );
        }
    }

    /*
     * Resolve an existing crisis.
     */
    if (
        consequence.resolveCrisis &&
        typeof resolveCrisis ===
            "function"
    ) {

        try {

            resolveCrisis(
                player,
                consequence.resolveCrisis
            );

        } catch (error) {

            console.warn(
                "[RepublicGame] AI crisis resolve:",
                error
            );
        }
    }

    /*
     * Save delayed consequence if requested.
     */
    if (
        consequence.nextEventHint &&
        typeof createDelayedConsequence ===
            "function"
    ) {

        try {

            const delayed =
                createDelayedConsequence(
                    player,
                    {
                        eventId:
                            event.id,

                        choiceId:
                            choice.id,

                        title:
                            consequence.nextEventHint,

                        dueStage:
                            safeNumber(
                                STATE.stage,
                                0
                            ) + 2
                    }
                );

            if (
                delayed &&
                typeof addDelayedConsequence ===
                    "function"
            ) {

                addDelayedConsequence(
                    player,
                    delayed
                );
            }

        } catch (error) {

            console.warn(
                "[RepublicGame] delayed AI consequence:",
                error
            );
        }
    }

    return {

        ...decisionResult,

        aiConsequence:
            consequence,

        aiEffects
    };
}


/* =========================================================
   6.21 — AI EFFECT NORMALIZATION
========================================================= */

function normalizeAIEffects(
    effectsInput
) {

    const source =
        effectsInput &&
        typeof effectsInput ===
            "object"
            ? effectsInput
            : {};

    const allowed = [

        "money",
        "economy",
        "electricity",
        "popularity",
        "stability",
        "sanctions",
        "relations",

        "inflation",
        "foodSecurity",
        "energy",
        "climatePressure",
        "market"
    ];

    const result = {};

    allowed.forEach(
        key => {

            if (
                Object.prototype.hasOwnProperty.call(
                    source,
                    key
                )
            ) {

                const value =
                    Number(
                        source[key]
                    );

                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    result[key] =
                        Math.max(
                            -1000,
                            Math.min(
                                1000,
                                value
                            )
                        );
                }
            }
        }
    );

    return result;
}


/* =========================================================
   6.22 — WORLD EVENT CREATOR
========================================================= */

function createAIWorldEvent(
    event,
    consequence
) {

    if (
        typeof addWorldEvent !==
        "function"
    ) {
        return null;
    }

    const worldEvent = {

        id:
            `world_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 7)}`,

        stage:
            safeNumber(
                STATE.stage,
                0
            ),

        sourceEvent:
            event?.id ||
            null,

        title:
            consequence?.title ||
            event?.title ||
            "رویداد جهانی",

        description:
            consequence?.story ||
            event?.description ||
            "",

        category:
            event?.category ||
            "world",

        createdAt:
            Date.now()
    };

    try {

        addWorldEvent(
            worldEvent
        );

    } catch (error) {

        console.warn(
            "[RepublicGame] World event failed:",
            error
        );
    }

    return worldEvent;
}


/* =========================================================
   6.23 — NEWS PACKET
========================================================= */

function createNewsPacket(
    event,
    consequence
) {

    return {

        headline:
            consequence?.news ||
            event?.news ||
            event?.title ||
            "خبر فوری",

        title:
            consequence?.title ||
            event?.title ||
            "خبر",

        body:
            consequence?.story ||
            consequence?.description ||
            event?.description ||
            "",

        category:
            event?.category ||
            "general",

        stage:
            safeNumber(
                STATE.stage,
                0
            ),

        timestamp:
            Date.now()
    };
}


/* =========================================================
   6.24 — SHOW NEWS
========================================================= */

function showCinematicNews(
    packet
) {

    if (!packet) {
        return;
    }

    const newsElement =
        document.getElementById(
            "newsText"
        ) ||
        document.getElementById(
            "newsHeadline"
        );

    if (newsElement) {

        newsElement.textContent =
            packet.headline;
    }

    const description =
        document.getElementById(
            "newsDescription"
        );

    if (description) {

        description.textContent =
            packet.body;
    }

    if (
        window.Office3D &&
        typeof window.Office3D.showNews ===
            "function"
    ) {

        try {

            window.Office3D.showNews(
                packet
            );

        } catch (error) {

            console.warn(
                "[RepublicGame] 3D news:",
                error
            );
        }
    }

    /*
     * Cinematic flash.
     */
    try {

        const flash =
            document.createElement(
                "div"
            );

        flash.className =
            "cinematic-flash flash-gold";

        document.body.appendChild(
            flash
        );

        requestAnimationFrame(
            () => {
                flash.classList.add(
                    "active"
                );
            }
        );

        setTimeout(
            () => {

                flash.classList.remove(
                    "active"
                );

                setTimeout(
                    () => {
                        flash.remove();
                    },
                    350
                );

            },
            250
        );

    } catch {}
}


/* =========================================================
   6.25 — CONSEQUENCE PIPELINE
========================================================= */

async function runConsequencePipeline(
    player,
    event,
    choice
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return null;
    }

    const requestId =
        createAIRequestId(
            "pipeline"
        );

    AI_DIRECTOR.busy =
        true;

    try {

        const consequence =
            await generateSmartConsequence(
                player,
                event,
                choice
            );

        const result =
            applyAIConsequenceSafely(
                player,
                event,
                choice,
                consequence
            );

        const news =
            createNewsPacket(
                event,
                consequence
            );

        showCinematicNews(
            news
        );

        createAIWorldEvent(
            event,
            consequence
        );

        /*
         * Store consequence in history.
         */
        if (
            Array.isArray(
                STATE.history
            )
        ) {

            STATE.history.push({

                id:
                    requestId,

                type:
                    "consequence",

                stage:
                    STATE.stage,

                playerId:
                    player.id,

                eventId:
                    event.id,

                choiceId:
                    choice.id,

                title:
                    consequence.title,

                timestamp:
                    Date.now()
            });

            STATE.history =
                STATE.history.slice(-100);
        }

        return {

            consequence,

            result,

            news
        };

    } finally {

        AI_DIRECTOR.busy =
            false;
    }
}


/* =========================================================
   6.26 — AI CRISIS CHAIN
========================================================= */

function shouldCreateCrisisChain(
    event,
    choice,
    result
) {

    if (!event) {
        return false;
    }

    const severity =
        safeNumber(
            event.severity,
            1
        );

    if (
        severity < 4
    ) {
        return false;
    }

    if (
        AI_DIRECTOR.crisisChainDepth >=
        AI_DIRECTOR.maxCrisisChainDepth
    ) {
        return false;
    }

    const stability =
        safeNumber(
            getCurrentTurnPlayer()
                ?.stats?.stability,
            65
        );

    return (
        stability < 35 ||
        !!result?.aiConsequence?.addCrisis
    );
}


/* =========================================================
   6.27 — CRISIS CHAIN
========================================================= */

function scheduleCrisisChain(
    player,
    event
) {

    if (
        !player ||
        !event
    ) {
        return;
    }

    AI_DIRECTOR.crisisChainDepth++;

    const dueStage =
        safeNumber(
            STATE.stage,
            0
        ) + 1;

    const crisisData = {

        id:
            `chain_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 7)}`,

        title:
            "بحران ثانویه",

        type:
            event.category ||
            "general",

        severity:
            Math.min(
                5,
                safeNumber(
                    event.severity,
                    2
                )
            ),

        stage:
            STATE.stage,

        dueStage,

        resolved:
            false,

        sourceEventId:
            event.id
    };

    try {

        if (
            typeof addCrisis ===
            "function"
        ) {

            addCrisis(
                player,
                crisisData
            );
        }

    } catch (error) {

        console.warn(
            "[RepublicGame] Crisis chain:",
            error
        );
    }
}


/* =========================================================
   6.28 — DELAYED CONSEQUENCE RUNNER
========================================================= */

function runDelayedConsequencePipeline() {

    if (
        typeof processDueDelayedConsequences !==
        "function"
    ) {
        return [];
    }

    try {

        const results =
            processDueDelayedConsequences();

        /*
         * Normalize the returned list so
         * later UI code can consume it safely.
         */
        return safeArray(
            results
        );

    } catch (error) {

        console.warn(
            "[RepublicGame] Delayed pipeline:",
            error
        );

        return [];
    }
}


/* =========================================================
   6.29 — MILESTONE WORLD EVENTS
========================================================= */

function handleMilestoneWorldEvents() {

    const stage =
        safeNumber(
            STATE?.stage,
            0
        );

    if (
        ![10, 20, 30, 40, 50]
            .includes(stage)
    ) {
        return;
    }

    const key =
        `milestone_${stage}`;

    if (
        STATE.milestoneEvents &&
        STATE.milestoneEvents[key]
    ) {
        return;
    }

    if (
        !STATE.milestoneEvents
    ) {

        STATE.milestoneEvents = {};
    }

    STATE.milestoneEvents[key] =
        true;

    const milestoneEvent = {

        id:
            key,

        stage,

        title:
            stage === 50
                ? "پایان بزرگ جمهوری"
                : `نقطه عطف مرحله ${stage}`,

        description:
            `جمهوری به مرحله ${stage} رسیده است. تصمیم‌های گذشته اکنون در تصویر بزرگ‌تری از کشور دیده می‌شوند.`,

        category:
            "milestone",

        news:
            `خبر ویژه: جمهوری به مرحله ${stage} رسید.`,

        timestamp:
            Date.now()
    };

    if (
        Array.isArray(
            STATE.history
        )
    ) {

        STATE.history.push(
            milestoneEvent
        );

        STATE.history =
            STATE.history.slice(-100);
    }

    showCinematicNews(
        createNewsPacket(
            milestoneEvent,
            null
        )
    );
}


/* =========================================================
   6.30 — AI STAGE HOOK
========================================================= */

function onStageStartedAI() {

    handleMilestoneWorldEvents();

    const delayed =
        runDelayedConsequencePipeline();

    if (
        delayed.length
    ) {

        delayed.forEach(
            item => {

                if (
                    item?.title
                ) {

                    showCinematicNews({

                        headline:
                            "پیامد تصمیم قبلی",

                        title:
                            item.title,

                        body:
                            item.description ||
                            "اثر یک تصمیم قبلی اکنون آشکار شده است.",

                        category:
                            "consequence",

                        stage:
                            STATE.stage
                    });
                }
            }
        );
    }
}


/* =========================================================
   6.31 — PATCH TURN START
========================================================= */

const originalBeginAuthoritativeTurn =
    beginAuthoritativeTurn;

beginAuthoritativeTurn =
    async function () {

        if (
            typeof onStageStartedAI ===
            "function"
        ) {

            try {

                onStageStartedAI();

            } catch (error) {

                console.warn(
                    "[RepublicGame] AI stage hook:",
                    error
                );
            }
        }

        return originalBeginAuthoritativeTurn();
    };


/* =========================================================
   6.32 — AI DECISION PIPELINE HELPER
========================================================= */

async function runAuthoritativeAIDecision(
    player,
    event,
    choice
) {

    if (
        !player ||
        !event ||
        !choice
    ) {
        return null;
    }

    const result =
        await runConsequencePipeline(
            player,
            event,
            choice
        );

    if (
        shouldCreateCrisisChain(
            event,
            choice,
            result?.result
        )
    ) {

        scheduleCrisisChain(
            player,
            event
        );
    }

    return result;
}


/* =========================================================
   6.33 — AI DIRECTOR STATUS
========================================================= */

function getAIDirectorStatus() {

    return {

        version:
            AI_DIRECTOR.version,

        busy:
            AI_DIRECTOR.busy,

        eventAttempts:
            AI_DIRECTOR.eventAttempts,

        consequenceAttempts:
            AI_DIRECTOR.consequenceAttempts,

        lastEventId:
            AI_DIRECTOR.lastEventId,

        lastConsequenceId:
            AI_DIRECTOR.lastConsequenceId,

        crisisChainDepth:
            AI_DIRECTOR.crisisChainDepth,

        recentCategories:
            AI_DIRECTOR.recentCategories
                .slice(-5)
    };
}


/* =========================================================
   6.34 — PUBLIC AI API
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.ai = {

        status:
            getAIDirectorStatus,

        event:
            generateSmartEvent,

        consequence:
            generateSmartConsequence,

        news:
            showCinematicNews,

        snapshot:
            createAIGameSnapshot
    };
}


/* =========================================================
   6.35 — PART 6 END
=========================================================

   DO NOT ADD `})();`

   PART 7 WILL CONTINUE DIRECTLY BELOW.

   PART 7:
   - COMPLETE UI BINDING
   - MENU / SETUP / JOIN / LOBBY
   - DECISION CARDS
   - CINEMATIC ANIMATIONS
   - 3D OFFICE CONNECTION
   - MUSIC / FX CONTROLS
   - MOBILE UI
   - FINAL GAME FLOW

========================================================= */
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE — PART 7 / 8
   COMPLETE UI + CINEMATIC FLOW
   =========================================================

   PART 7 CONTENT
   ---------------------------------------------------------
   ✓ UI binding
   ✓ Main menu
   ✓ Setup screen
   ✓ Join screen
   ✓ Lobby
   ✓ Stage selector
   ✓ Player list
   ✓ Game HUD
   ✓ Stats
   ✓ World status
   ✓ Event dossier
   ✓ Three decision cards
   ✓ Decision animations
   ✓ Consequence overlay
   ✓ 3D Office connection
   ✓ Music / FX controls
   ✓ Mobile controls
   ✓ Toast system
   ✓ Loading system
   ✓ Cinematic transitions
   ✓ Keyboard shortcuts
   ✓ Safe DOM initialization

   IMPORTANT:
   DO NOT ADD `})();`
   PART 8 WILL CLOSE THE IIFE.
========================================================= */


/* =========================================================
   7.00 — UI STATE
========================================================= */

const UI_STATE = {

    initialized: false,

    currentScreen: null,

    selectedDecision: null,

    isAnimating: false,

    decisionLocked: false,

    lastRenderedEventId: null,

    lastRenderedStage: null,

    lastRenderedTurn: null,

    lastConsequenceId: null,

    musicEnabled: true,

    fxEnabled: true,

    mobileMode: false,

    renderQueued: false

};


/* =========================================================
   7.01 — DOM CACHE
========================================================= */

const UI = {

    boot:
        document.getElementById("bootScreen"),

    main:
        document.getElementById("mainMenu"),

    setup:
        document.getElementById("setupScreen"),

    joinScreen:
        document.getElementById("joinScreen"),

    lobby:
        document.getElementById("lobbyScreen"),

    game:
        document.getElementById("gameScreen"),

    end:
        document.getElementById("endScreen"),

    intro3d:
        document.getElementById("intro3dScene"),

    office3d:
        document.getElementById("office3d"),

    creator:
        document.getElementById("creatorCredit"),

    create:
        document.getElementById("createGameBtn"),

    joinButton:
        document.getElementById("joinGameBtn"),

    confirmSetup:
        document.getElementById("confirmSetupBtn"),

    confirmJoin:
        document.getElementById("joinConfirmBtn"),

    startGame:
        document.getElementById("startGameBtn"),

    copyRoom:
        document.getElementById("copyRoomBtn"),

    music:
        document.getElementById("musicToggleBtn"),

    fx:
        document.getElementById("fxToggleBtn"),

    playAgain:
        document.getElementById("playAgainBtn"),

    leaderName:
        document.getElementById("leaderName"),

    country:
        document.getElementById("countrySelect"),

    geography:
        document.getElementById("geographySelect"),

    roomCode:
        document.getElementById("roomCodeInput"),

    joinLeaderName:
        document.getElementById("joinLeaderName"),

    joinCountry:
        document.getElementById("joinCountrySelect"),

    joinGeography:
        document.getElementById("joinGeographySelect"),

    roomDisplay:
        document.getElementById("roomCodeDisplay"),

    playersList:
        document.getElementById("playersList"),

    playerCount:
        document.getElementById("playerCount"),

    lobbyStatus:
        document.getElementById("lobbyStatus"),

    money:
        document.getElementById("moneyValue"),

    economy:
        document.getElementById("economyValue"),

    electricity:
        document.getElementById("electricityValue"),

    popularity:
        document.getElementById("popularityValue"),

    stability:
        document.getElementById("stabilityValue"),

    sanctions:
        document.getElementById("sanctionsValue"),

    relations:
        document.getElementById("relationsValue"),

    stage:
        document.getElementById("stageValue"),

    stageCounter:
        document.getElementById("stageCounter"),

    turnIndicator:
        document.getElementById("turnIndicator"),

    worldTension:
        document.getElementById("worldTension"),

    worldMarket:
        document.getElementById("worldMarket"),

    worldEnergy:
        document.getElementById("worldEnergy"),

    worldDiplomacy:
        document.getElementById("worldDiplomacy"),

    economyBar:
        document.getElementById("economyBar"),

    electricityBar:
        document.getElementById("electricityBar"),

    popularityBar:
        document.getElementById("popularityBar"),

    stabilityBar:
        document.getElementById("stabilityBar"),

    newsTitle:
        document.getElementById("newsTitle"),

    newsText:
        document.getElementById("newsText"),

    newsBadge:
        document.getElementById("newsBadge"),

    eventTitle:
        document.getElementById("eventTitle"),

    eventDescription:
        document.getElementById("eventDescription"),

    eventType:
        document.getElementById("eventType"),

    eventSeverity:
        document.getElementById("eventSeverity"),

    decisionCards:
        document.getElementById("decisionCards"),

    aiThinking:
        document.getElementById("aiThinking"),

    consequence:
        document.getElementById("consequenceOverlay"),

    ranking:
        document.getElementById("rankingList"),

    toast:
        document.getElementById("toastContainer"),

    loading:
        document.getElementById("globalLoading")

};


/* =========================================================
   7.02 — DOM SAFETY HELPERS
========================================================= */

function uiExists(element) {

    return !!element;

}


function uiText(element, value) {

    if (!element) {

        return;

    }

    element.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(value);

}


function uiHTML(element, value) {

    if (!element) {

        return;

    }

    element.innerHTML =
        value === undefined ||
        value === null
            ? ""
            : String(value);

}


function uiClass(element, className, enabled) {

    if (!element || !className) {

        return;

    }

    element.classList.toggle(
        className,
        !!enabled
    );

}


function uiAttr(element, name, value) {

    if (!element) {

        return;

    }

    if (
        value === null ||
        value === undefined
    ) {

        element.removeAttribute(name);

        return;

    }

    element.setAttribute(
        name,
        String(value)
    );

}


/* =========================================================
   7.03 — SCREEN MANAGEMENT
========================================================= */

function showScreen(screen) {

    if (!screen) {

        return;

    }

    const screens =
        document.querySelectorAll(
            ".screen"
        );

    screens.forEach(
        (item) => {

            item.classList.remove(
                "active",
                "screen-active"
            );

            item.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );

    screen.classList.add(
        "active",
        "screen-active",
        "screen-enter"
    );

    screen.setAttribute(
        "aria-hidden",
        "false"
    );

    UI_STATE.currentScreen =
        screen;

    setTimeout(
        () => {

            screen.classList.remove(
                "screen-enter"
            );

        },
        650
    );

}


/* =========================================================
   7.04 — LOADING SYSTEM
========================================================= */

function setGlobalLoading(
    active,
    text = "در حال پردازش..."
) {

    if (!UI.loading) {

        return;

    }

    uiClass(
        UI.loading,
        "active",
        active
    );

    const label =
        UI.loading.querySelector(
            "[data-loading-text]"
        );

    if (label) {

        uiText(
            label,
            text
        );

    }

}


/* =========================================================
   7.05 — TOAST SYSTEM
========================================================= */

function showToast(
    message,
    type = "info",
    duration = 2800
) {

    if (!UI.toast) {

        return;

    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast toast-" +
        String(type);

    toast.innerHTML =

        '<span class="toast-icon"></span>' +

        '<span class="toast-message"></span>';

    const messageNode =
        toast.querySelector(
            ".toast-message"
        );

    uiText(
        messageNode,
        message
    );

    UI.toast.appendChild(
        toast
    );

    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

            setTimeout(
                () => {

                    toast.remove();

                },
                400
            );

        },
        duration
    );

}


/* =========================================================
   7.06 — INPUT HELPERS
========================================================= */

function getInputValue(
    element
) {

    if (!element) {

        return "";

    }

    return String(
        element.value || ""
    ).trim();

}


function normalizeUIName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 32);

}


function normalizeUICountry(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .slice(0, 80);

}


function normalizeUIGeography(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .slice(0, 80);

}


/* =========================================================
   7.07 — SETUP VALIDATION
========================================================= */

function validateSetupUI() {

    const name =
        normalizeUIName(
            getInputValue(
                UI.leaderName
            )
        );

    const country =
        normalizeUICountry(
            getInputValue(
                UI.country
            )
        );

    const geography =
        normalizeUIGeography(
            getInputValue(
                UI.geography
            )
        );

    if (!name) {

        showToast(
            "نام رئیس‌جمهور را وارد کنید.",
            "warning"
        );

        UI.leaderName?.focus();

        return null;

    }

    if (!country) {

        showToast(
            "کشور را انتخاب کنید.",
            "warning"
        );

        return null;

    }

    if (!geography) {

        showToast(
            "منطقه جغرافیایی را انتخاب کنید.",
            "warning"
        );

        return null;

    }

    return {

        name,
        country,
        geography

    };

}


/* =========================================================
   7.08 — JOIN VALIDATION
========================================================= */

function validateJoinUI() {

    const roomCode =
        getInputValue(
            UI.roomCode
        )
            .toUpperCase()
            .replace(/\s+/g, "");

    const name =
        normalizeUIName(
            getInputValue(
                UI.joinLeaderName
            )
        );

    const country =
        normalizeUICountry(
            getInputValue(
                UI.joinCountry
            )
        );

    const geography =
        normalizeUIGeography(
            getInputValue(
                UI.joinGeography
            )
        );

    if (!roomCode) {

        showToast(
            "کد اتاق را وارد کنید.",
            "warning"
        );

        UI.roomCode?.focus();

        return null;

    }

    if (!name) {

        showToast(
            "نام رئیس‌جمهور را وارد کنید.",
            "warning"
        );

        return null;

    }

    if (!country) {

        showToast(
            "کشور را انتخاب کنید.",
            "warning"
        );

        return null;

    }

    if (!geography) {

        showToast(
            "منطقه جغرافیایی را انتخاب کنید.",
            "warning"
        );

        return null;

    }

    return {

        roomCode,
        name,
        country,
        geography

    };

}


/* =========================================================
   7.09 — CREATE GAME UI
========================================================= */

async function handleCreateGameUI() {

    const data =
        validateSetupUI();

    if (!data) {

        return;

    }

    try {

        setGlobalLoading(
            true,
            "در حال ساخت جمهوری..."
        );

        const result =
            await createRoom(
                data
            );

        if (
            result === false
        ) {

            throw new Error(
                "CREATE_ROOM_FAILED"
            );

        }

        showScreen(
            UI.lobby
        );

        showToast(
            "جمهوری شما ساخته شد.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "[UI] create room:",
            error
        );

        showToast(
            "ساخت اتاق انجام نشد.",
            "error"
        );

    }
    finally {

        setGlobalLoading(
            false
        );

    }

}


/* =========================================================
   7.10 — JOIN GAME UI
========================================================= */

async function handleJoinGameUI() {

    const data =
        validateJoinUI();

    if (!data) {

        return;

    }

    try {

        setGlobalLoading(
            true,
            "در حال ورود به جمهوری..."
        );

        const result =
            await joinRoom(
                data
            );

        if (
            result === false
        ) {

            throw new Error(
                "JOIN_ROOM_FAILED"
            );

        }

        showScreen(
            UI.lobby
        );

        showToast(
            "با موفقیت وارد اتاق شدید.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "[UI] join room:",
            error
        );

        showToast(
            "ورود به اتاق انجام نشد.",
            "error"
        );

    }
    finally {

        setGlobalLoading(
            false
        );

    }

}


/* =========================================================
   7.11 — LOBBY PLAYER ROW
========================================================= */

function createLobbyPlayerRow(
    player,
    index
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "player-row";

    if (
        player &&
        player.isHost
    ) {

        row.classList.add(
            "host-player"
        );

    }

    if (
        player &&
        STATE &&
        player.id === STATE.localPlayerId
    ) {

        row.classList.add(
            "me-player"
        );

    }

    const country =
        player?.country ||
        "کشور ناشناخته";

    const geography =
        player?.geography ||
        "منطقه نامشخص";

    const name =
        player?.name ||
        `رئیس‌جمهور ${index + 1}`;

    row.innerHTML =

        '<div class="player-avatar">' +

            String(index + 1).padStart(
                2,
                "0"
            ) +

        '</div>' +

        '<div class="player-info">' +

            '<div class="player-name"></div>' +

            '<div class="player-country"></div>' +

        '</div>' +

        '<div class="player-status"></div>';

    uiText(
        row.querySelector(
            ".player-name"
        ),
        name
    );

    uiText(
        row.querySelector(
            ".player-country"
        ),
        country +
        " • " +
        geography
    );

    const status =
        row.querySelector(
            ".player-status"
        );

    if (
        player &&
        player.isHost
    ) {

        uiText(
            status,
            "HOST"
        );

        status.classList.add(
            "host-badge"
        );

    }
    else if (
        player &&
        player.id ===
        STATE?.localPlayerId
    ) {

        uiText(
            status,
            "YOU"
        );

        status.classList.add(
            "me-badge"
        );

    }
    else {

        uiText(
            status,
            player?.connected === false
                ? "OFFLINE"
                : "ONLINE"
        );

    }

    return row;

}


/* =========================================================
   7.12 — LOBBY RENDER
========================================================= */

function renderLobbyUI() {

    if (!STATE) {

        return;

    }

    const players =
        Array.isArray(
            STATE.players
        )
            ? STATE.players
            : [];

    if (UI.roomDisplay) {

        uiText(
            UI.roomDisplay,
            STATE.roomCode ||
            "------"
        );

    }

    if (UI.playerCount) {

        uiText(
            UI.playerCount,
            players.length +
            " / " +
            (
                typeof MAX_PLAYERS !==
                "undefined"
                    ? MAX_PLAYERS
                    : 8
            )
        );

    }

    if (UI.playersList) {

        UI.playersList.innerHTML = "";

        players.forEach(
            (
                player,
                index
            ) => {

                UI.playersList.appendChild(
                    createLobbyPlayerRow(
                        player,
                        index
                    )
                );

            }
        );

    }

    if (UI.lobbyStatus) {

        if (
            players.length < 1
        ) {

            uiText(
                UI.lobbyStatus,
                "در انتظار بازیکنان..."
            );

        }
        else if (
            STATE.isHost
        ) {

            uiText(
                UI.lobbyStatus,
                players.length >= 2
                    ? "اتاق آماده شروع است."
                    : "می‌توانید بازیکنان بیشتری دعوت کنید."
            );

        }
        else {

            uiText(
                UI.lobbyStatus,
                "منتظر تصمیم میزبان..."
            );

        }

    }

    if (UI.startGame) {

        UI.startGame.disabled =
            !STATE.isHost ||
            players.length < 1;

    }

}


/* =========================================================
   7.13 — STAGE SELECTOR
========================================================= */

function getSelectedStageCount() {

    const options =
        document.querySelectorAll(
            ".stage-option"
        );

    let selected =
        Number(
            STATE?.settings?.maxStages ||
            STATE?.maxStages ||
            10
        );

    options.forEach(
        (option) => {

            if (
                option.classList.contains(
                    "selected"
                )
            ) {

                const value =
                    Number(
                        option.dataset.stage
                    );

                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    selected =
                        value;

                }

            }

        }
    );

    return selected;

}


function updateStageSelectorUI(
    value
) {

    const options =
        document.querySelectorAll(
            ".stage-option"
        );

    options.forEach(
        (option) => {

            const stage =
                Number(
                    option.dataset.stage
                );

            option.classList.toggle(
                "selected",
                stage === value
            );

        }
    );

    const label =
        document.querySelector(
            ".stage-selected-text"
        );

    if (label) {

        uiText(
            label,
            "طول شبیه‌سازی: " +
            value +
            " مرحله"
        );

        label.classList.add(
            "selected"
        );

    }

}


function bindStageSelectorUI() {

    const options =
        document.querySelectorAll(
            ".stage-option"
        );

    options.forEach(
        (option) => {

            option.addEventListener(
                "click",
                () => {

                    const value =
                        Number(
                            option.dataset.stage
                        );

                    if (
                        !Number.isFinite(
                            value
                        )
                    ) {

                        return;

                    }

                    updateStageSelectorUI(
                        value
                    );

                    if (
                        STATE.settings
                    ) {

                        STATE.settings.maxStages =
                            value;

                    }

                    STATE.maxStages =
                        value;

                    showToast(
                        value +
                        " مرحله انتخاب شد.",
                        "info",
                        1800
                    );

                }
            );

        }
    );

}


/* =========================================================
   7.14 — GAME STATS
========================================================= */

function renderGameStatsUI() {

    const player =
        typeof getCurrentLocalPlayer ===
        "function"
            ? getCurrentLocalPlayer()
            : null;

    if (!player) {

        return;

    }

    const stats =
        player.stats ||
        {};

    uiText(
        UI.money,
        Math.round(
            safeNumber(
                stats.money,
                0
            )
        )
    );

    uiText(
        UI.economy,
        Math.round(
            safeNumber(
                stats.economy,
                0
            )
        )
    );

    uiText(
        UI.electricity,
        Math.round(
            safeNumber(
                stats.electricity,
                0
            )
        )
    );

    uiText(
        UI.popularity,
        Math.round(
            safeNumber(
                stats.popularity,
                0
            )
        )
    );

    uiText(
        UI.stability,
        Math.round(
            safeNumber(
                stats.stability,
                0
            )
        )
    );

    uiText(
        UI.sanctions,
        Math.round(
            safeNumber(
                stats.sanctions,
                0
            )
        )
    );

    const relations =
        safeNumber(
            player.reputation,
            0
        );

    uiText(
        UI.relations,
        Math.round(
            relations
        )
    );

    renderBar(
        UI.economyBar,
        stats.economy
    );

    renderBar(
        UI.electricityBar,
        stats.electricity
    );

    renderBar(
        UI.popularityBar,
        stats.popularity
    );

    renderBar(
        UI.stabilityBar,
        stats.stability
    );

}


/* =========================================================
   7.15 — BAR RENDER
========================================================= */

function renderBar(
    element,
    value
) {

    if (!element) {

        return;

    }

    const numeric =
        Math.max(
            0,
            Math.min(
                100,
                safeNumber(
                    value,
                    0
                )
            )
        );

    element.style.width =
        numeric +
        "%";

}


/* =========================================================
   7.16 — WORLD STATUS
========================================================= */

function renderWorldStatusUI() {

    const world =
        STATE?.world ||
        {};

    const stats =
        world.stats ||
        world ||
        {};

    uiText(
        UI.worldTension,
        Math.round(
            safeNumber(
                stats.tension,
                0
            )
        )
    );

    uiText(
        UI.worldMarket,
        Math.round(
            safeNumber(
                stats.market,
                0
            )
        )
    );

    uiText(
        UI.worldEnergy,
        Math.round(
            safeNumber(
                stats.energy,
                0
            )
        )
    );

    uiText(
        UI.worldDiplomacy,
        Math.round(
            safeNumber(
                stats.diplomacy,
                0
            )
        )
    );

}


/* =========================================================
   7.17 — STAGE / TURN
========================================================= */

function renderStageUI() {

    const stage =
        safeNumber(
            STATE?.currentStage,
            1
        );

    const maxStages =
        safeNumber(
            STATE?.maxStages ||
            STATE?.settings?.maxStages,
            10
        );

    uiText(
        UI.stage,
        stage
    );

    uiText(
        UI.stageCounter,
        stage +
        " / " +
        maxStages
    );

    const turnPlayer =
        typeof getCurrentTurnPlayer ===
        "function"
            ? getCurrentTurnPlayer()
            : null;

    if (turnPlayer) {

        uiText(
            UI.turnIndicator,
            "نوبت: " +
            (
                turnPlayer.name ||
                turnPlayer.country ||
                "بازیکن"
            )
        );

    }
    else {

        uiText(
            UI.turnIndicator,
            "در انتظار نوبت..."
        );

    }

}


/* =========================================================
   7.18 — NEWS RENDER
========================================================= */

function renderNewsUI(
    event
) {

    if (!event) {

        return;

    }

    const news =
        event.news ||
        event.headline ||
        event.title ||
        "خبر فوری";

    const description =
        event.newsText ||
        event.description ||
        "";

    uiText(
        UI.newsTitle,
        news
    );

    uiText(
        UI.newsText,
        description
    );

    uiText(
        UI.newsBadge,
        "LIVE"
    );

    if (
        window.Office3D &&
        typeof window.Office3D.showNews ===
        "function"
    ) {

        try {

            window.Office3D.showNews(
                event
            );

        }
        catch (error) {

            console.warn(
                "[Office3D] news:",
                error
            );

        }

    }

}


/* =========================================================
   7.19 — EVENT RENDER
========================================================= */

function renderEventUI(
    event
) {

    if (!event) {

        uiText(
            UI.eventTitle,
            "در انتظار رویداد..."
        );

        uiText(
            UI.eventDescription,
            "هوش مصنوعی در حال بررسی وضعیت جمهوری است."
        );

        return;

    }

    uiText(
        UI.eventTitle,
        event.title ||
        "بحران جدید"
    );

    uiText(
        UI.eventDescription,
        event.description ||
        "رویداد جدیدی در حال شکل‌گیری است."
    );

    uiText(
        UI.eventType,
        event.type ||
        event.category ||
        "UNKNOWN"
    );

    uiText(
        UI.eventSeverity,
        event.severity ||
        "NORMAL"
    );

    renderNewsUI(
        event
    );

    if (
        window.Office3D &&
        typeof window.Office3D.showEvent ===
        "function"
    ) {

        try {

            window.Office3D.showEvent(
                event
            );

        }
        catch (error) {

            console.warn(
                "[Office3D] event:",
                error
            );

        }

    }

}


/* =========================================================
   7.20 — CHOICE NORMALIZER
========================================================= */

function ensureThreeChoices(
    event
) {

    if (!event) {

        return [];

    }

    if (
        !Array.isArray(
            event.choices
        )
    ) {

        event.choices = [];

    }

    const fallbackChoices = [

        {

            id: "choice_a",

            title: "اقدام فوری",

            description:
                "دولت یک اقدام سریع و کنترل‌شده انجام می‌دهد.",

            effects: {}

        },

        {

            id: "choice_b",

            title: "مذاکره",

            description:
                "دولت ابتدا تلاش می‌کند بحران را از مسیر مذاکره مدیریت کند.",

            effects: {}

        },

        {

            id: "choice_c",

            title: "صبر استراتژیک",

            description:
                "دولت فعلاً از تصمیم شدید خودداری می‌کند و شرایط را زیر نظر می‌گیرد.",

            effects: {}

        }

    ];

    while (
        event.choices.length <
        3
    ) {

        event.choices.push(
            fallbackChoices[
                event.choices.length
            ]
        );

    }

    event.choices =
        event.choices
            .slice(0, 3)
            .map(
                (
                    choice,
                    index
                ) => {

                    const safe =
                        choice &&
                        typeof choice ===
                        "object"
                            ? choice
                            : {};

                    return {

                        ...safe,

                        id:
                            safe.id ||
                            (
                                "choice_" +
                                (
                                    index + 1
                                )
                            ),

                        title:
                            safe.title ||
                            (
                                "گزینه " +
                                (
                                    index + 1
                                )
                            ),

                        description:
                            safe.description ||
                            "تصمیم خود را اجرا کنید."

                    };

                }
            );

    return event.choices;

}


/* =========================================================
   7.21 — DECISION CARD
========================================================= */

function createDecisionCard(
    choice,
    index,
    event
) {

    const card =
        document.createElement(
            "button"
        );

    card.type =
        "button";

    card.className =
        "decision-card";

    card.dataset.choiceId =
        choice.id;

    card.dataset.index =
        String(index);

    card.innerHTML =

        '<div class="decision-number">' +

            String(
                index + 1
            ).padStart(
                2,
                "0"
            ) +

        '</div>' +

        '<div class="decision-content">' +

            '<div class="decision-title"></div>' +

            '<div class="decision-description"></div>' +

        '</div>' +

        '<div class="decision-arrow">›</div>';

    uiText(
        card.querySelector(
            ".decision-title"
        ),
        choice.title
    );

    uiText(
        card.querySelector(
            ".decision-description"
        ),
        choice.description
    );

    card.addEventListener(
        "click",
        () => {

            handleDecisionCardClick(
                card,
                choice,
                event
            );

        }
    );

    return card;

}


/* =========================================================
   7.22 — DECISION CARD RENDER
========================================================= */

function renderDecisionCardsUI(
    event
) {

    if (!UI.decisionCards) {

        return;

    }

    UI.decisionCards.innerHTML =
        "";

    UI_STATE.selectedDecision =
        null;

    UI_STATE.decisionLocked =
        false;

    const choices =
        ensureThreeChoices(
            event
        );

    choices.forEach(
        (
            choice,
            index
        ) => {

            const card =
                createDecisionCard(
                    choice,
                    index,
                    event
                );

            UI.decisionCards.appendChild(
                card
            );

            setTimeout(
                () => {

                    card.classList.add(
                        "visible"
                    );

                },
                180 +
                index * 150
            );

        }
    );

}


/* =========================================================
   7.23 — DECISION CLICK
========================================================= */

async function handleDecisionCardClick(
    card,
    choice,
    event
) {

    if (
        UI_STATE.decisionLocked ||
        UI_STATE.isAnimating
    ) {

        return;

    }

    const player =
        typeof getCurrentLocalPlayer ===
        "function"
            ? getCurrentLocalPlayer()
            : null;

    if (!player) {

        showToast(
            "بازیکن فعلی پیدا نشد.",
            "error"
        );

        return;

    }

    const turnPlayer =
        typeof getCurrentTurnPlayer ===
        "function"
            ? getCurrentTurnPlayer()
            : null;

    if (
        turnPlayer &&
        turnPlayer.id !==
        player.id
    ) {

        showToast(
            "فعلاً نوبت شما نیست.",
            "warning"
        );

        return;

    }

    UI_STATE.decisionLocked =
        true;

    UI_STATE.selectedDecision =
        choice.id;

    UI_STATE.isAnimating =
        true;

    const cards =
        UI.decisionCards
            ? UI.decisionCards.querySelectorAll(
                ".decision-card"
            )
            : [];

    cards.forEach(
        (item) => {

            if (
                item === card
            ) {

                item.classList.add(
                    "selected"
                );

            }
            else {

                item.classList.add(
                    "retreat"
                );

            }

        }
    );

    if (
        window.Office3D &&
        typeof window.Office3D.selectDecision ===
        "function"
    ) {

        try {

            window.Office3D.selectDecision(
                choice
            );

        }
        catch (error) {

            console.warn(
                "[Office3D] decision:",
                error
            );

        }

    }

    playUIFX(
        "decision"
    );

    await sleepUI(
        650
    );

    try {

        await commitDecisionFromUI(
            player,
            event,
            choice
        );

    }
    catch (error) {

        console.error(
            "[UI] decision:",
            error
        );

        UI_STATE.decisionLocked =
            false;

        UI_STATE.isAnimating =
            false;

        cards.forEach(
            (item) => {

                item.classList.remove(
                    "selected",
                    "retreat"
                );

            }
        );

        showToast(
            "اجرای تصمیم با خطا مواجه شد.",
            "error"
        );

    }

}


/* =========================================================
   7.24 — DECISION COMMIT
========================================================= */

async function commitDecisionFromUI(
    player,
    event,
    choice
) {

    if (
        typeof submitDecision ===
        "function"
    ) {

        const result =
            await submitDecision(
                player.id,
                event.id,
                choice.id
            );

        if (
            result === false
        ) {

            throw new Error(
                "SUBMIT_DECISION_FAILED"
            );

        }

        return result;

    }

    if (
        typeof runAuthoritativeAIDecision ===
        "function"
    ) {

        return await runAuthoritativeAIDecision(
            player,
            event,
            choice
        );

    }

    if (
        typeof applyDecision ===
        "function"
    ) {

        const result =
            await applyDecision(
                player,
                event,
                choice
            );

        if (
            typeof showConsequenceUI ===
            "function"
        ) {

            showConsequenceUI(
                result
            );

        }

        return result;

    }

    throw new Error(
        "NO_DECISION_ENGINE"
    );

}


/* =========================================================
   7.25 — CONSEQUENCE UI
========================================================= */

function showConsequenceUI(
    consequence
) {

    if (!consequence) {

        return;

    }

    if (
        UI.consequence
    ) {

        UI.consequence.classList.add(
            "active",
            "consequence-enter"
        );

        const title =
            UI.consequence.querySelector(
                "[data-consequence-title]"
            );

        const text =
            UI.consequence.querySelector(
                "[data-consequence-text]"
            );

        const news =
            UI.consequence.querySelector(
                "[data-consequence-news]"
            );

        uiText(
            title,
            consequence.title ||
            "نتیجه تصمیم"
        );

        uiText(
            text,
            consequence.story ||
            consequence.description ||
            "تصمیم شما اثر خود را بر جمهوری گذاشت."
        );

        uiText(
            news,
            consequence.news ||
            ""
        );

    }

    playUIFX(
        "consequence"
    );

    if (
        window.Office3D &&
        typeof window.Office3D.showNews ===
        "function"
    ) {

        try {

            window.Office3D.showNews(
                consequence
            );

        }
        catch (error) {

            console.warn(
                "[Office3D] consequence:",
                error
            );

        }

    }

}


function hideConsequenceUI() {

    if (!UI.consequence) {

        return;

    }

    UI.consequence.classList.remove(
        "active",
        "consequence-enter"
    );

}


/* =========================================================
   7.26 — MUSIC / FX
========================================================= */

function playUIFX(
    type
) {

    if (
        !UI_STATE.fxEnabled
    ) {

        return;

    }

    try {

        if (
            window.Office3D &&
            typeof window.Office3D.playFX ===
            "function"
        ) {

            window.Office3D.playFX(
                type
            );

        }

    }
    catch (error) {

        console.debug(
            "[FX]",
            error
        );

    }

}


function toggleMusicUI() {

    UI_STATE.musicEnabled =
        !UI_STATE.musicEnabled;

    uiClass(
        document.body,
        "music-off",
        !UI_STATE.musicEnabled
    );

    try {

        if (
            window.Office3D
        ) {

            if (
                UI_STATE.musicEnabled &&
                typeof window.Office3D.startMusic ===
                "function"
            ) {

                window.Office3D.startMusic();

            }
            else if (
                !UI_STATE.musicEnabled &&
                typeof window.Office3D.stopMusic ===
                "function"
            ) {

                window.Office3D.stopMusic();

            }

        }

    }
    catch (error) {

        console.warn(
            "[Music]",
            error
        );

    }

    showToast(
        UI_STATE.musicEnabled
            ? "موسیقی فعال شد."
            : "موسیقی خاموش شد.",
        "info",
        1600
    );

}


function toggleFXUI() {

    UI_STATE.fxEnabled =
        !UI_STATE.fxEnabled;

    uiClass(
        document.body,
        "fx-off",
        !UI_STATE.fxEnabled
    );

    showToast(
        UI_STATE.fxEnabled
            ? "افکت‌ها فعال شدند."
            : "افکت‌ها خاموش شدند.",
        "info",
        1600
    );

}


/* =========================================================
   7.27 — COPY ROOM
========================================================= */

async function copyRoomCodeUI() {

    const code =
        String(
            STATE?.roomCode ||
            ""
        );

    if (!code) {

        return;

    }

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                code
            );

        }
        else {

            const temp =
                document.createElement(
                    "textarea"
                );

            temp.value =
                code;

            document.body.appendChild(
                temp
            );

            temp.select();

            document.execCommand(
                "copy"
            );

            temp.remove();

        }

        showToast(
            "کد اتاق کپی شد.",
            "success",
            1800
        );

    }
    catch (error) {

        console.warn(
            "[Clipboard]",
            error
        );

        showToast(
            "کپی کد انجام نشد.",
            "error"
        );

    }

}


/* =========================================================
   7.28 — END SCREEN
========================================================= */

function renderEndScreenUI() {

    if (!UI.ranking) {

        return;

    }

    const players =
        Array.isArray(
            STATE?.players
        )
            ? STATE.players.slice()
            : [];

    let ranking = [];

    if (
        typeof rankPlayers ===
        "function"
    ) {

        try {

            ranking =
                rankPlayers();

        }
        catch (error) {

            console.warn(
                "[Ranking]",
                error
            );

        }

    }

    if (
        !Array.isArray(
            ranking
        ) ||
        ranking.length === 0
    ) {

        ranking =
            players
                .map(
                    (player) => {

                        let score = 0;

                        if (
                            typeof calculatePlayerFinalScore ===
                            "function"
                        ) {

                            try {

                                score =
                                    calculatePlayerFinalScore(
                                        player
                                    );

                            }
                            catch (_) {}

                        }

                        return {

                            ...player,

                            finalScore:
                                safeNumber(
                                    score,
                                    0
                                )

                        };

                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        safeNumber(
                            b.finalScore,
                            0
                        ) -
                        safeNumber(
                            a.finalScore,
                            0
                        )
                );

    }

    UI.ranking.innerHTML =
        "";

    ranking.forEach(
        (
            player,
            index
        ) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "ranking-row";

            row.innerHTML =

                '<div class="ranking-place"></div>' +

                '<div class="ranking-player">' +

                    '<div class="ranking-name"></div>' +

                    '<div class="ranking-country"></div>' +

                '</div>' +

                '<div class="ranking-score"></div>';

            uiText(
                row.querySelector(
                    ".ranking-place"
                ),
                "#" +
                (
                    index + 1
                )
            );

            uiText(
                row.querySelector(
                    ".ranking-name"
                ),
                player.name ||
                "رئیس‌جمهور"
            );

            uiText(
                row.querySelector(
                    ".ranking-country"
                ),
                player.country ||
                "کشور ناشناخته"
            );

            uiText(
                row.querySelector(
                    ".ranking-score"
                ),
                Math.round(
                    safeNumber(
                        player.finalScore,
                        player.score
                    )
                )
            );

            UI.ranking.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   7.29 — GAME RENDER
========================================================= */

function renderGameUI() {

    renderGameStatsUI();

    renderWorldStatusUI();

    renderStageUI();

    const event =
        STATE?.currentEvent ||
        STATE?.event ||
        null;

    if (event) {

        renderEventUI(
            event
        );

        if (
            UI_STATE.lastRenderedEventId !==
            event.id
        ) {

            UI_STATE.lastRenderedEventId =
                event.id;

            renderDecisionCardsUI(
                event
            );

        }

    }

    const currentTurn =
        STATE?.currentTurn;

    if (
        UI_STATE.lastRenderedTurn !==
        currentTurn
    ) {

        UI_STATE.lastRenderedTurn =
            currentTurn;

        document.body.classList.add(
            "turn-change"
        );

        setTimeout(
            () => {

                document.body.classList.remove(
                    "turn-change"
                );

            },
            800
        );

    }

}


/* =========================================================
   7.30 — LOBBY / GAME / END ROUTER
========================================================= */

function refreshGameUI() {

    if (!STATE) {

        return;

    }

    renderLobbyUI();

    const phase =
        STATE.phase ||
        STATE.status ||
        "menu";

    if (
        phase === "lobby"
    ) {

        showScreen(
            UI.lobby
        );

        return;

    }

    if (
        phase === "playing" ||
        phase === "event" ||
        phase === "decision" ||
        phase === "consequence"
    ) {

        showScreen(
            UI.game
        );

        renderGameUI();

        if (
            phase === "consequence" &&
            STATE.lastConsequence
        ) {

            showConsequenceUI(
                STATE.lastConsequence
            );

        }

        return;

    }

    if (
        phase === "ended" ||
        phase === "finished"
    ) {

        renderEndScreenUI();

        showScreen(
            UI.end
        );

    }

}


/* =========================================================
   7.31 — MAIN MENU EVENTS
========================================================= */

function bindMainMenuUI() {

    if (UI.create) {

        UI.create.addEventListener(
            "click",
            () => {

                playUIFX(
                    "click"
                );

                showScreen(
                    UI.setup
                );

            }
        );

    }

    if (UI.joinButton) {

        UI.joinButton.addEventListener(
            "click",
            () => {

                playUIFX(
                    "click"
                );

                /*
                 * IMPORTANT FIX:
                 * Part 7 previously could overwrite UI.join
                 * with the button itself.
                 *
                 * Always use joinScreen here.
                 */

                showScreen(
                    UI.joinScreen
                );

            }
        );

    }

}


/* =========================================================
   7.32 — SETUP EVENTS
========================================================= */

function bindSetupUI() {

    if (UI.confirmSetup) {

        UI.confirmSetup.addEventListener(
            "click",
            handleCreateGameUI
        );

    }

}


/* =========================================================
   7.33 — JOIN EVENTS
========================================================= */

function bindJoinUI() {

    if (UI.confirmJoin) {

        UI.confirmJoin.addEventListener(
            "click",
            handleJoinGameUI
        );

    }

}


/* =========================================================
   7.34 — LOBBY EVENTS
========================================================= */

function bindLobbyUI() {

    if (UI.copyRoom) {

        UI.copyRoom.addEventListener(
            "click",
            copyRoomCodeUI
        );

    }

    if (UI.startGame) {

        UI.startGame.addEventListener(
            "click",
            async () => {

                if (
                    !STATE?.isHost
                ) {

                    showToast(
                        "فقط میزبان می‌تواند بازی را شروع کند.",
                        "warning"
                    );

                    return;

                }

                try {

                    setGlobalLoading(
                        true,
                        "در حال آغاز شبیه‌سازی..."
                    );

                    await startGame();

                }
                catch (error) {

                    console.error(
                        "[Game Start]",
                        error
                    );

                    showToast(
                        "شروع بازی ناموفق بود.",
                        "error"
                    );

                }
                finally {

                    setGlobalLoading(
                        false
                    );

                }

            }
        );

    }

}


/* =========================================================
   7.35 — GAME CONTROLS
========================================================= */

function bindGameControlsUI() {

    if (UI.music) {

        UI.music.addEventListener(
            "click",
            toggleMusicUI
        );

    }

    if (UI.fx) {

        UI.fx.addEventListener(
            "click",
            toggleFXUI
        );

    }

}


/* =========================================================
   7.36 — END CONTROLS
========================================================= */

function bindEndUI() {

    if (UI.playAgain) {

        UI.playAgain.addEventListener(
            "click",
            () => {

                playUIFX(
                    "click"
                );

                window.location.reload();

            }
        );

    }

}


/* =========================================================
   7.37 — KEYBOARD DECISIONS
========================================================= */

function bindKeyboardUI() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                UI_STATE.currentScreen !==
                UI.game
            ) {

                return;

            }

            if (
                UI_STATE.decisionLocked
            ) {

                return;

            }

            const key =
                String(
                    event.key
                );

            if (
                key !== "1" &&
                key !== "2" &&
                key !== "3"
            ) {

                return;

            }

            const index =
                Number(key) - 1;

            const cards =
                UI.decisionCards
                    ? UI.decisionCards.querySelectorAll(
                        ".decision-card"
                    )
                    : [];

            const card =
                cards[index];

            if (card) {

                card.click();

            }

        }
    );

}


/* =========================================================
   7.38 — RESPONSIVE UI
========================================================= */

function updateResponsiveUI() {

    const width =
        window.innerWidth ||
        9999;

    UI_STATE.mobileMode =
        width <= 760;

    document.body.classList.toggle(
        "mobile-mode",
        UI_STATE.mobileMode
    );

}


/* =========================================================
   7.39 — RESIZE
========================================================= */

function bindResizeUI() {

    window.addEventListener(
        "resize",
        () => {

            updateResponsiveUI();

            if (
                window.Office3D &&
                typeof window.Office3D.resize ===
                "function"
            ) {

                try {

                    window.Office3D.resize();

                }
                catch (_) {}

            }

        }
    );

}


/* =========================================================
   7.40 — 3D INTRO
========================================================= */

function initializeIntro3DUI() {

    if (
        !UI.intro3d ||
        !window.Office3D
    ) {

        return;

    }

    try {

        if (
            typeof window.Office3D.init ===
            "function"
        ) {

            window.Office3D.init(
                UI.intro3d
            );

        }

    }
    catch (error) {

        console.warn(
            "[Office3D] intro init:",
            error
        );

    }

}


/* =========================================================
   7.41 — 3D OFFICE
========================================================= */

function initializeOffice3DUI() {

    if (
        !UI.office3d ||
        !window.Office3D
    ) {

        return;

    }

    try {

        if (
            typeof window.Office3D.init ===
            "function"
        ) {

            window.Office3D.init(
                UI.office3d
            );

        }

    }
    catch (error) {

        console.warn(
            "[Office3D] office init:",
            error
        );

    }

}


/* =========================================================
   7.42 — CINEMATIC EVENT TRANSITION
========================================================= */

function playEventCinematicUI() {

    UI_STATE.isAnimating =
        true;

    document.body.classList.add(
        "cinematic-event"
    );

    setTimeout(
        () => {

            document.body.classList.add(
                "cinematic-flash",
                "flash-normal"
            );

        },
        80
    );

    setTimeout(
        () => {

            document.body.classList.remove(
                "cinematic-flash",
                "flash-normal"
            );

        },
        500
    );

    setTimeout(
        () => {

            document.body.classList.remove(
                "cinematic-event"
            );

            UI_STATE.isAnimating =
                false;

        },
        850
    );

}


/* =========================================================
   7.43 — STAGE TRANSITION
========================================================= */

function playStageTransitionUI(
    stage
) {

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "stage-transition";

    overlay.innerHTML =

        '<div class="stage-transition-inner">' +

            '<div class="stage-transition-small">' +
                'REPUBLIC OF ABSURDITY' +
            '</div>' +

            '<div class="stage-number-pop">' +
                String(stage) +
            '</div>' +

            '<div class="stage-transition-label">' +
                'مرحله جدید' +
            '</div>' +

        '</div>';

    document.body.appendChild(
        overlay
    );

    requestAnimationFrame(
        () => {

            overlay.classList.add(
                "active"
            );

        }
    );

    setTimeout(
        () => {

            overlay.classList.remove(
                "active"
            );

            setTimeout(
                () => {

                    overlay.remove();

                },
                500
            );

        },
        1100
    );

}


/* =========================================================
   7.44 — STATE PHASE UI
========================================================= */

function handleStatePhaseUI() {

    const phase =
        STATE?.phase ||
        "";

    if (
        phase === "lobby"
    ) {

        renderLobbyUI();

        showScreen(
            UI.lobby
        );

        return;

    }

    if (
        phase === "playing" ||
        phase === "event" ||
        phase === "decision" ||
        phase === "consequence"
    ) {

        if (
            UI_STATE.lastRenderedStage !==
            STATE.currentStage
        ) {

            UI_STATE.lastRenderedStage =
                STATE.currentStage;

            playStageTransitionUI(
                STATE.currentStage
            );

        }

        showScreen(
            UI.game
        );

        renderGameUI();

        return;

    }

    if (
        phase === "ended" ||
        phase === "finished"
    ) {

        renderEndScreenUI();

        showScreen(
            UI.end
        );

    }

}


/* =========================================================
   7.45 — STATE OBSERVER
========================================================= */

function installStateObserverUI() {

    if (
        !STATE ||
        typeof STATE !== "object"
    ) {

        return;

    }

    /*
     * Lightweight polling keeps this compatible
     * with the existing engine without changing
     * the STATE architecture.
     */

    let lastPhase =
        STATE.phase;

    let lastEventId =
        STATE.currentEvent?.id ||
        null;

    let lastStage =
        STATE.currentStage;

    const observer =
        () => {

            try {

                const phase =
                    STATE.phase;

                const eventId =
                    STATE.currentEvent?.id ||
                    null;

                const stage =
                    STATE.currentStage;

                if (
                    phase !==
                    lastPhase
                ) {

                    lastPhase =
                        phase;

                    handleStatePhaseUI();

                }

                if (
                    eventId !==
                    lastEventId
                ) {

                    lastEventId =
                        eventId;

                    if (
                        eventId
                    ) {

                        playEventCinematicUI();

                    }

                }

                if (
                    stage !==
                    lastStage
                ) {

                    lastStage =
                        stage;

                    renderStageUI();

                }

                if (
                    phase === "lobby"
                ) {

                    renderLobbyUI();

                }
                else if (
                    phase === "playing" ||
                    phase === "event" ||
                    phase === "decision" ||
                    phase === "consequence"
                ) {

                    renderGameUI();

                }

            }
            catch (error) {

                console.warn(
                    "[UI Observer]",
                    error
                );

            }

            setTimeout(
                observer,
                400
            );

        };

    observer();

}


/* =========================================================
   7.46 — INITIAL UI
========================================================= */

function initializeRepublicUI() {

    if (
        UI_STATE.initialized
    ) {

        return;

    }

    UI_STATE.initialized =
        true;

    /*
     * Safety fix for the previous duplicate
     * `UI.join` property problem.
     */

    UI.join =
        UI.joinScreen;

    updateResponsiveUI();

    bindMainMenuUI();

    bindSetupUI();

    bindJoinUI();

    bindLobbyUI();

    bindGameControlsUI();

    bindEndUI();

    bindKeyboardUI();

    bindStageSelectorUI();

    bindResizeUI();

    initializeIntro3DUI();

    /*
     * Office 3D is initialized lazily when
     * the actual game screen becomes active.
     */

    if (
        UI.creator
    ) {

        uiText(
            UI.creator,
            "سازنده: beemax_1"
        );

    }

    if (
        UI.main
    ) {

        showScreen(
            UI.main
        );

    }

    if (
        STATE &&
        STATE.phase
    ) {

        handleStatePhaseUI();

    }

    installStateObserverUI();

}


/* =========================================================
   7.47 — SAFE DOM READY
========================================================= */

function bootRepublicUI() {

    try {

        initializeRepublicUI();

    }
    catch (error) {

        console.error(
            "[Republic UI] boot:",
            error
        );

        showToast(
            "خطای اولیه رابط بازی. صفحه را دوباره بارگذاری کنید.",
            "error",
            5000
        );

    }

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        bootRepublicUI,
        {
            once: true
        }
    );

}
else {

    bootRepublicUI();

}


/* =========================================================
   7.48 — OFFICE LAZY INITIALIZATION
========================================================= */

let OFFICE_UI_INITIALIZED =
    false;


function ensureOffice3DForGameUI() {

    if (
        OFFICE_UI_INITIALIZED
    ) {

        return;

    }

    if (
        !UI.office3d ||
        !window.Office3D
    ) {

        return;

    }

    try {

        initializeOffice3DUI();

        OFFICE_UI_INITIALIZED =
            true;

    }
    catch (error) {

        console.warn(
            "[Office3D] lazy:",
            error
        );

    }

}


/* =========================================================
   7.49 — PATCH GAME SCREEN ACTIVATION
========================================================= */

const originalHandleStatePhaseUI =
    handleStatePhaseUI;

handleStatePhaseUI =
    function () {

        const phase =
            STATE?.phase ||
            "";

        if (
            phase === "playing" ||
            phase === "event" ||
            phase === "decision" ||
            phase === "consequence"
        ) {

            ensureOffice3DForGameUI();

        }

        return originalHandleStatePhaseUI();

    };


/* =========================================================
   7.50 — PUBLIC UI API
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.ui = {

        state:
            UI_STATE,

        dom:
            UI,

        showScreen,

        toast:
            showToast,

        loading:
            setGlobalLoading,

        renderLobby:
            renderLobbyUI,

        renderGame:
            renderGameUI,

        renderEnd:
            renderEndScreenUI,

        refresh:
            refreshGameUI,

        consequence:
            showConsequenceUI,

        hideConsequence:
            hideConsequenceUI,

        stage:
            updateStageSelectorUI,

        music:
            toggleMusicUI,

        fx:
            toggleFXUI

    };

}


/* =========================================================
   PART 7 END
=========================================================

   IMPORTANT:
   DO NOT ADD `})();`

   PART 8 / FINAL WILL CONTINUE DIRECTLY BELOW.

   PART 8:
   - FINAL GAME LOOP
   - AI EVENT GENERATION
   - TURN ADVANCE
   - CONSEQUENCE FLOW
   - DELAYED EVENTS
   - END GAME
   - LOCAL SAVE / LOAD
   - FINAL INTEGRITY CHECK
   - ERROR GUARDS
   - DEBUG API
   - FINAL IIFE CLOSURE

========================================================= */
  /* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE — PART 8 / FINAL
   =========================================================

   FINAL SYSTEM
   ---------------------------------------------------------
   ✓ AI EVENT GENERATION
   ✓ TURN ENGINE
   ✓ EVENT FLOW
   ✓ CONSEQUENCE FLOW
   ✓ DELAYED CONSEQUENCES
   ✓ CRISIS CHAINS
   ✓ WORLD EVENTS
   ✓ STAGE ADVANCEMENT
   ✓ END GAME
   ✓ FINAL SCORE
   ✓ LOCAL SAVE
   ✓ LOCAL RESTORE
   ✓ ERROR GUARDS
   ✓ PERFORMANCE LOOP
   ✓ DEBUG API
   ✓ FINAL INTEGRITY CHECK
   ✓ FINAL IIFE CLOSURE

========================================================= */


/* =========================================================
   8.00 — FINAL ENGINE STATE
========================================================= */

const R8_ENGINE = {

    running: false,

    busy: false,

    eventLock: false,

    decisionLock: false,

    endingLock: false,

    loopStarted: false,

    lastTick: 0,

    lastSave: 0,

    lastEventId: null,

    lastStage: null,

    lastTurn: null,

    eventRequestId: 0,

    saveVersion: "8.0-final"

};


/* =========================================================
   8.01 — SAFE SLEEP
========================================================= */

function sleepUI(ms) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                Math.max(
                    0,
                    safeNumber(
                        ms,
                        0
                    )
                )
            );

        }
    );

}


/* =========================================================
   8.02 — SAFE ARRAY
========================================================= */

function safeArray(value) {

    return Array.isArray(value)
        ? value
        : [];

}


/* =========================================================
   8.03 — SAFE NUMBER
========================================================= */

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}


/* =========================================================
   8.04 — CURRENT PLAYER
========================================================= */

function getCurrentLocalPlayer() {

    if (!STATE) {

        return null;

    }

    const players =
        safeArray(
            STATE.players
        );

    const localId =
        STATE.localPlayerId;

    if (!localId) {

        return players[0] || null;

    }

    return (
        players.find(
            player =>
                player &&
                player.id === localId
        ) ||
        null
    );

}


/* =========================================================
   8.05 — CURRENT TURN PLAYER
========================================================= */

function getCurrentTurnPlayer() {

    if (!STATE) {

        return null;

    }

    const players =
        safeArray(
            STATE.players
        );

    if (
        players.length === 0
    ) {

        return null;

    }

    const turnIndex =
        safeNumber(
            STATE.currentTurn,
            0
        );

    return (
        players[
            Math.max(
                0,
                Math.min(
                    turnIndex,
                    players.length - 1
                )
            )
        ] ||
        players[0]
    );

}


/* =========================================================
   8.06 — EVENT ID
========================================================= */

function createR8EventId() {

    return (

        "evt_" +

        Date.now().toString(36) +

        "_" +

        Math.random()
            .toString(36)
            .slice(2, 9)

    );

}


/* =========================================================
   8.07 — EVENT NORMALIZER
========================================================= */

function normalizeR8Event(
    event,
    player
) {

    const source =
        event &&
        typeof event === "object"
            ? event
            : {};

    const normalized = {

        ...source,

        id:
            source.id ||
            createR8EventId(),

        title:
            source.title ||
            "رویداد فوق‌العاده",

        description:
            source.description ||
            "شرایط جدیدی در جمهوری شکل گرفته است.",

        type:
            source.type ||
            source.category ||
            "political",

        category:
            source.category ||
            source.type ||
            "political",

        severity:
            source.severity ||
            "NORMAL",

        targetPlayerId:
            source.targetPlayerId ||
            player?.id ||
            null,

        choices:
            safeArray(
                source.choices
            ).slice(
                0,
                3
            ),

        news:
            source.news ||
            source.title ||
            "خبر فوری",

        createdAt:
            source.createdAt ||
            Date.now()

    };

    if (
        typeof ensureThreeChoices ===
        "function"
    ) {

        ensureThreeChoices(
            normalized
        );

    }

    return normalized;

}


/* =========================================================
   8.08 — FALLBACK EVENT
========================================================= */

function createR8FallbackEvent(
    player
) {

    const country =
        player?.country ||
        "جمهوری";

    return normalizeR8Event(
        {

            id:
                createR8EventId(),

            title:
                "جلسه اضطراری کابینه",

            description:
                "گزارش‌های جدید نشان می‌دهند که چند شاخص مهم جمهوری هم‌زمان در حال تغییر هستند. شورای اجرایی از رئیس‌جمهور تصمیم فوری می‌خواهد.",

            type:
                "government",

            category:
                "political",

            severity:
                "MEDIUM",

            news:
                "جلسه اضطراری دولت در " +
                country,

            choices: [

                {

                    id:
                        "economic_reform",

                    title:
                        "اصلاح اقتصادی",

                    description:
                        "دولت بخشی از منابع را برای اصلاح وضعیت اقتصادی اختصاص می‌دهد.",

                    effects: {

                        money:
                            -60,

                        economy:
                            7,

                        popularity:
                            -2

                    }

                },

                {

                    id:
                        "public_support",

                    title:
                        "حمایت عمومی",

                    description:
                        "دولت تمرکز خود را روی آرام‌کردن فضای اجتماعی و افزایش اعتماد عمومی می‌گذارد.",

                    effects: {

                        money:
                            -30,

                        popularity:
                            7,

                        stability:
                            3

                    }

                },

                {

                    id:
                        "wait_and_see",

                    title:
                        "صبر استراتژیک",

                    description:
                        "دولت فعلاً تصمیم بزرگ نمی‌گیرد و شرایط را زیر نظر نگه می‌دارد.",

                    effects: {

                        economy:
                            -2,

                        stability:
                            2

                    }

                }

            ]

        },

        player
    );

}


/* =========================================================
   8.09 — AI EVENT REQUEST
========================================================= */

async function generateR8Event() {

    if (
        !STATE ||
        !STATE.players ||
        STATE.players.length === 0
    ) {

        return null;

    }

    const player =
        getCurrentTurnPlayer();

    if (!player) {

        return null;

    }

    const requestId =
        ++R8_ENGINE.eventRequestId;

    const history =
        safeArray(
            STATE.history
        ).slice(
            -18
        );

    const gameState = {

        stage:
            safeNumber(
                STATE.currentStage,
                1
            ),

        maxStages:
            safeNumber(
                STATE.maxStages ||
                STATE.settings?.maxStages,
                10
            ),

        currentTurn:
            safeNumber(
                STATE.currentTurn,
                0
            ),

        currentPlayer:
            player,

        players:
            safeArray(
                STATE.players
            ).map(
                item => ({

                    id:
                        item.id,

                    name:
                        item.name,

                    country:
                        item.country,

                    geography:
                        item.geography,

                    stats:
                        item.stats

                })
            ),

        world:
            STATE.world,

        crises:
            safeArray(
                STATE.crises
            ).slice(
                -10
            ),

        institutions:
            STATE.institutions,

        history

    };

    try {

        let event = null;

        if (
            typeof generateAIEvent ===
            "function"
        ) {

            event =
                await generateAIEvent(
                    gameState,
                    history
                );

        }
        else if (
            window.RepublicGame?.ai &&
            typeof window.RepublicGame.ai.event ===
            "function"
        ) {

            event =
                await window.RepublicGame.ai.event(
                    gameState,
                    history
                );

        }

        if (
            requestId !==
            R8_ENGINE.eventRequestId
        ) {

            return null;

        }

        return normalizeR8Event(
            event ||
            createR8FallbackEvent(
                player
            ),
            player
        );

    }
    catch (error) {

        console.warn(
            "[AI Event] fallback:",
            error
        );

        return createR8FallbackEvent(
            player
        );

    }

}


/* =========================================================
   8.10 — BROADCAST HELPER
========================================================= */

async function r8Broadcast(
    event,
    payload
) {

    try {

        if (
            typeof broadcastMessage ===
            "function"
        ) {

            return await broadcastMessage(
                event,
                payload
            );

        }

    }
    catch (error) {

        console.warn(
            "[Broadcast]",
            error
        );

    }

    return false;

}


/* =========================================================
   8.11 — PUBLISH CURRENT EVENT
========================================================= */

async function publishR8Event(
    event
) {

    if (!STATE) {

        return false;

    }

    STATE.currentEvent =
        normalizeR8Event(
            event,
            getCurrentTurnPlayer()
        );

    STATE.event =
        STATE.currentEvent;

    STATE.phase =
        "decision";

    STATE.status =
        "decision";

    if (!Array.isArray(
        STATE.history
    )) {

        STATE.history = [];

    }

    STATE.history.push({

        id:
            "history_" +
            STATE.currentEvent.id,

        type:
            "event",

        eventId:
            STATE.currentEvent.id,

        title:
            STATE.currentEvent.title,

        stage:
            STATE.currentStage,

        turn:
            STATE.currentTurn,

        timestamp:
            Date.now()

    });

    STATE.history =
        STATE.history.slice(
            -120
        );

    await r8Broadcast(
        "game_event",
        {

            event:
                STATE.currentEvent,

            stage:
                STATE.currentStage,

            turn:
                STATE.currentTurn

        }
    );

    return true;

}


/* =========================================================
   8.12 — EVENT GENERATION FLOW
========================================================= */

async function generateAndPublishR8Event() {

    if (
        R8_ENGINE.eventLock ||
        R8_ENGINE.endingLock
    ) {

        return null;

    }

    if (
        !STATE ||
        STATE.phase === "ended" ||
        STATE.phase === "finished"
    ) {

        return null;

    }

    R8_ENGINE.eventLock =
        true;

    try {

        setGlobalLoading(
            true,
            "هوش مصنوعی در حال طراحی رویداد..."
        );

        if (UI?.aiThinking) {

            UI.aiThinking.classList.add(
                "active"
            );

        }

        const event =
            await generateR8Event();

        if (!event) {

            throw new Error(
                "EVENT_GENERATION_FAILED"
            );

        }

        await sleepUI(
            350
        );

        await publishR8Event(
            event
        );

        UI_STATE.lastRenderedEventId =
            null;

        if (
            typeof refreshGameUI ===
            "function"
        ) {

            refreshGameUI();

        }

        return event;

    }
    catch (error) {

        console.error(
            "[Event Engine]",
            error
        );

        const fallback =
            createR8FallbackEvent(
                getCurrentTurnPlayer()
            );

        await publishR8Event(
            fallback
        );

        return fallback;

    }
    finally {

        if (UI?.aiThinking) {

            UI.aiThinking.classList.remove(
                "active"
            );

        }

        setGlobalLoading(
            false
        );

        R8_ENGINE.eventLock =
            false;

    }

}


/* =========================================================
   8.13 — CONSEQUENCE GENERATION
========================================================= */

async function generateR8Consequence(
    player,
    event,
    choice
) {

    const gameState = {

        stage:
            STATE?.currentStage,

        maxStages:
            STATE?.maxStages,

        currentTurn:
            STATE?.currentTurn,

        player,

        players:
            safeArray(
                STATE?.players
            ),

        world:
            STATE?.world,

        institutions:
            STATE?.institutions,

        crises:
            STATE?.crises,

        history:
            safeArray(
                STATE?.history
            ).slice(
                -20
            )

    };

    try {

        if (
            typeof generateAIConsequence ===
            "function"
        ) {

            return await generateAIConsequence(
                gameState,
                gameState.history,
                {

                    player,
                    country:
                        player?.country,

                    choice

                }
            );

        }

        if (
            window.RepublicGame?.ai &&
            typeof window.RepublicGame.ai.consequence ===
            "function"
        ) {

            return await window.RepublicGame.ai.consequence(
                gameState,
                gameState.history,
                {

                    player,
                    country:
                        player?.country,

                    choice

                }
            );

        }

    }
    catch (error) {

        console.warn(
            "[AI Consequence]",
            error
        );

    }

    return {

        id:
            "con_" +
            Date.now().toString(36),

        title:
            "نتیجه تصمیم",

        story:
            "تصمیم رئیس‌جمهور وارد مرحله اجرا شد و آثار آن در وضعیت جمهوری ثبت شد.",

        news:
            "تصمیم جدید دولت اعلام شد.",

        effects:
            choice?.effects ||
            {},

        relationChanges:
            choice?.relationChanges ||
            {},

        addCrisis:
            null,

        resolveCrisis:
            null,

        nextEventHint:
            null

    };

}


/* =========================================================
   8.14 — AUTHORITATIVE DECISION
========================================================= */

async function runAuthoritativeAIDecision(
    player,
    event,
    choice
) {

    if (
        R8_ENGINE.decisionLock
    ) {

        return null;

    }

    R8_ENGINE.decisionLock =
        true;

    try {

        if (
            STATE?.isHost !== true
        ) {

            /*
             * Non-host clients wait for the
             * authoritative result.
             */

            return null;

        }

        const consequence =
            await generateR8Consequence(
                player,
                event,
                choice
            );

        let result = null;

        if (
            typeof applyDecision ===
            "function"
        ) {

            result =
                await applyDecision(
                    player,
                    event,
                    choice
                );

        }

        if (
            result &&
            typeof result === "object"
        ) {

            result.consequence =
                result.consequence ||
                consequence;

        }
        else {

            result = {

                consequence,

                playerId:
                    player.id,

                eventId:
                    event.id,

                choiceId:
                    choice.id

            };

        }

        STATE.lastConsequence =
            result.consequence ||
            consequence;

        STATE.phase =
            "consequence";

        STATE.status =
            "consequence";

        await r8Broadcast(
            "decision_result",
            {

                playerId:
                    player.id,

                eventId:
                    event.id,

                choiceId:
                    choice.id,

                consequence:
                    STATE.lastConsequence,

                stage:
                    STATE.currentStage,

                turn:
                    STATE.currentTurn

            }
        );

        showConsequenceUI(
            STATE.lastConsequence
        );

        await sleepUI(
            2600
        );

        hideConsequenceUI();

        return result;

    }
    finally {

        R8_ENGINE.decisionLock =
            false;

    }

}


/* =========================================================
   8.15 — DECISION SUBMISSION
========================================================= */

async function submitDecision(
    playerId,
    eventId,
    choiceId
) {

    if (
        !STATE
    ) {

        return false;

    }

    if (
        STATE.phase === "ended" ||
        STATE.phase === "finished"
    ) {

        return false;

    }

    const player =
        safeArray(
            STATE.players
        ).find(
            item =>
                item &&
                item.id === playerId
        );

    const event =
        STATE.currentEvent;

    if (
        !player ||
        !event
    ) {

        return false;

    }

    if (
        event.id !== eventId
    ) {

        return false;

    }

    const choice =
        safeArray(
            event.choices
        ).find(
            item =>
                item &&
                item.id === choiceId
        );

    if (!choice) {

        return false;

    }

    const turnPlayer =
        getCurrentTurnPlayer();

    if (
        turnPlayer &&
        turnPlayer.id !==
        player.id
    ) {

        return false;

    }

    if (
        STATE.isHost
    ) {

        return await runAuthoritativeAIDecision(
            player,
            event,
            choice
        );

    }

    await r8Broadcast(
        "submit_decision",
        {

            playerId,

            eventId,

            choiceId

        }
    );

    return true;

}


/* =========================================================
   8.16 — ADVANCE TURN
========================================================= */

async function advanceTurn() {

    if (
        !STATE
    ) {

        return false;

    }

    const players =
        safeArray(
            STATE.players
        );

    if (
        players.length === 0
    ) {

        return false;

    }

    const current =
        safeNumber(
            STATE.currentTurn,
            0
        );

    let next =
        current + 1;

    let nextStage =
        safeNumber(
            STATE.currentStage,
            1
        );

    if (
        next >=
        players.length
    ) {

        next = 0;

        nextStage++;

    }

    const maxStages =
        safeNumber(
            STATE.maxStages ||
            STATE.settings?.maxStages,
            10
        );

    if (
        nextStage >
        maxStages
    ) {

        return await endR8Game();

    }

    STATE.currentTurn =
        next;

    STATE.currentStage =
        nextStage;

    STATE.currentEvent =
        null;

    STATE.event =
        null;

    STATE.lastConsequence =
        null;

    STATE.phase =
        "playing";

    STATE.status =
        "playing";

    await r8Broadcast(
        "turn_advanced",
        {

            currentTurn:
                STATE.currentTurn,

            currentStage:
                STATE.currentStage

        }
    );

    if (
        typeof processDueDelayedConsequences ===
        "function"
    ) {

        try {

            processDueDelayedConsequences();

        }
        catch (error) {

            console.warn(
                "[Delayed]",
                error
            );

        }

    }

    if (
        typeof createWorldEventFromDecision ===
        "function"
    ) {

        try {

            /*
             * World event processing remains
             * abstract and narrative.
             */

        }
        catch (_) {}

    }

    if (
        typeof refreshGameUI ===
        "function"
    ) {

        refreshGameUI();

    }

    playStageTransitionUI(
        STATE.currentStage
    );

    return true;

}


/* =========================================================
   8.17 — HOST TURN LOOP
========================================================= */

async function runR8HostTurn() {

    if (
        !STATE ||
        STATE.isHost !== true
    ) {

        return;

    }

    if (
        R8_ENGINE.busy ||
        R8_ENGINE.endingLock
    ) {

        return;

    }

    if (
        STATE.phase === "ended" ||
        STATE.phase === "finished"
    ) {

        return;

    }

    R8_ENGINE.busy =
        true;

    try {

        const turnPlayer =
            getCurrentTurnPlayer();

        if (!turnPlayer) {

            return;

        }

        /*
         * If there is no event, generate one.
         */

        if (
            !STATE.currentEvent
        ) {

            STATE.phase =
                "event";

            STATE.status =
                "event";

            if (
                typeof refreshGameUI ===
                "function"
            ) {

                refreshGameUI();

            }

            await sleepUI(
                450
            );

            await generateAndPublishR8Event();

            return;

        }

        /*
         * If event exists, wait for the
         * player to decide.
         */

        if (
            STATE.phase ===
            "decision"
        ) {

            return;

        }

        /*
         * Consequence has been displayed.
         * Move to next turn.
         */

        if (
            STATE.phase ===
            "consequence"
        ) {

            await sleepUI(
                1800
            );

            await advanceTurn();

        }

    }
    catch (error) {

        console.error(
            "[Host Loop]",
            error
        );

    }
    finally {

        R8_ENGINE.busy =
            false;

    }

}


/* =========================================================
   8.18 — LOCAL SAVE SNAPSHOT
========================================================= */

function createR8SaveSnapshot() {

    if (!STATE) {

        return null;

    }

    const players =
        safeArray(
            STATE.players
        );

    return {

        version:
            R8_ENGINE.saveVersion,

        timestamp:
            Date.now(),

        roomCode:
            STATE.roomCode ||
            null,

        phase:
            STATE.phase ||
            "menu",

        currentStage:
            STATE.currentStage,

        currentTurn:
            STATE.currentTurn,

        maxStages:
            STATE.maxStages ||
            STATE.settings?.maxStages,

        world:
            STATE.world,

        players:
            players.map(
                player => ({

                    id:
                        player.id,

                    name:
                        player.name,

                    country:
                        player.country,

                    geography:
                        player.geography,

                    stats:
                        player.stats,

                    reputation:
                        player.reputation,

                    score:
                        player.score,

                    achievements:
                        player.achievements,

                    crises:
                        player.crises,

                    relations:
                        player.relations,

                    institutions:
                        player.institutions,

                    ledger:
                        player.ledger,

                    decisions:
                        player.decisions

                })
            ),

        history:
            safeArray(
                STATE.history
            ).slice(
                -120
            ),

        crises:
            safeArray(
                STATE.crises
            ),

        institutions:
            STATE.institutions

    };

}


/* =========================================================
   8.19 — LOCAL SAVE
========================================================= */

function saveR8LocalState() {

    try {

        const snapshot =
            createR8SaveSnapshot();

        if (!snapshot) {

            return false;

        }

        localStorage.setItem(
            "republic_absurdity_save",
            JSON.stringify(
                snapshot
            )
        );

        R8_ENGINE.lastSave =
            Date.now();

        return true;

    }
    catch (error) {

        console.warn(
            "[Local Save]",
            error
        );

        return false;

    }

}


/* =========================================================
   8.20 — LOCAL LOAD CHECK
========================================================= */

function hasR8LocalSave() {

    try {

        return !!localStorage.getItem(
            "republic_absurdity_save"
        );

    }
    catch (_) {

        return false;

    }

}


/* =========================================================
   8.21 — CLEAR LOCAL SAVE
========================================================= */

function clearR8LocalSave() {

    try {

        localStorage.removeItem(
            "republic_absurdity_save"
        );

        return true;

    }
    catch (_) {

        return false;

    }

}


/* =========================================================
   8.22 — END GAME
========================================================= */

async function endR8Game() {

    if (
        R8_ENGINE.endingLock
    ) {

        return false;

    }

    R8_ENGINE.endingLock =
        true;

    try {

        if (!STATE) {

            return false;

        }

        STATE.phase =
            "ended";

        STATE.status =
            "ended";

        STATE.currentEvent =
            null;

        STATE.event =
            null;

        const players =
            safeArray(
                STATE.players
            );

        players.forEach(
            (player) => {

                if (
                    typeof calculatePlayerFinalScore ===
                    "function"
                ) {

                    try {

                        player.finalScore =
                            calculatePlayerFinalScore(
                                player
                            );

                    }
                    catch (_) {

                        player.finalScore =
                            safeNumber(
                                player.score,
                                0
                            );

                    }

                }
                else {

                    player.finalScore =
                        safeNumber(
                            player.score,
                            0
                        );

                }

            }
        );

        players.sort(
            (
                a,
                b
            ) =>
                safeNumber(
                    b.finalScore,
                    0
                ) -
                safeNumber(
                    a.finalScore,
                    0
                )
        );

        STATE.ranking =
            players.map(
                (
                    player,
                    index
                ) => ({

                    rank:
                        index + 1,

                    playerId:
                        player.id,

                    name:
                        player.name,

                    country:
                        player.country,

                    score:
                        player.finalScore

                })
            );

        saveR8LocalState();

        await r8Broadcast(
            "game_finished",
            {

                ranking:
                    STATE.ranking,

                stage:
                    STATE.currentStage

            }
        );

        renderEndScreenUI();

        showScreen(
            UI.end
        );

        playUIFX(
            "consequence"
        );

        return true;

    }
    catch (error) {

        console.error(
            "[End Game]",
            error
        );

        return false;

    }
    finally {

        R8_ENGINE.endingLock =
            false;

    }

}


/* =========================================================
   8.23 — START GAME SAFETY
========================================================= */

async function startGame() {

    if (!STATE) {

        return false;

    }

    if (
        !STATE.isHost
    ) {

        return false;

    }

    const players =
        safeArray(
            STATE.players
        );

    if (
        players.length === 0
    ) {

        return false;

    }

    const selectedStages =
        safeNumber(
            STATE.maxStages ||
            STATE.settings?.maxStages,
            10
        );

    STATE.maxStages =
        Math.max(
            10,
            Math.min(
                50,
                selectedStages
            )
        );

    if (!STATE.settings) {

        STATE.settings = {};

    }

    STATE.settings.maxStages =
        STATE.maxStages;

    STATE.currentStage =
        1;

    STATE.currentTurn =
        0;

    STATE.currentEvent =
        null;

    STATE.event =
        null;

    STATE.lastConsequence =
        null;

    STATE.phase =
        "playing";

    STATE.status =
        "playing";

    await r8Broadcast(
        "game_started",
        {

            maxStages:
                STATE.maxStages,

            currentStage:
                STATE.currentStage,

            currentTurn:
                STATE.currentTurn

        }
    );

    refreshGameUI();

    playStageTransitionUI(
        1
    );

    await sleepUI(
        1000
    );

    await generateAndPublishR8Event();

    saveR8LocalState();

    return true;

}


/* =========================================================
   8.24 — PERIODIC SAVE
========================================================= */

function runR8PeriodicSave() {

    if (
        !STATE
    ) {

        return;

    }

    const now =
        Date.now();

    if (
        now -
        R8_ENGINE.lastSave <
        5000
    ) {

        return;

    }

    if (
        STATE.phase === "playing" ||
        STATE.phase === "event" ||
        STATE.phase === "decision" ||
        STATE.phase === "consequence"
    ) {

        saveR8LocalState();

    }

}


/* =========================================================
   8.25 — FINAL GAME LOOP
========================================================= */

function startR8GameLoop() {

    if (
        R8_ENGINE.loopStarted
    ) {

        return;

    }

    R8_ENGINE.loopStarted =
        true;

    R8_ENGINE.running =
        true;

    const loop =
        async (
            timestamp
        ) => {

            try {

                const delta =
                    R8_ENGINE.lastTick
                        ? timestamp -
                          R8_ENGINE.lastTick
                        : 0;

                R8_ENGINE.lastTick =
                    timestamp;

                /*
                 * Keep the game loop lightweight.
                 * Three.js has its own renderer loop.
                 */

                if (
                    delta >= 0
                ) {

                    runR8PeriodicSave();

                }

                /*
                 * Only the host drives authoritative
                 * event/turn progression.
                 */

                if (
                    STATE?.isHost === true
                ) {

                    await runR8HostTurn();

                }

            }
            catch (error) {

                console.error(
                    "[R8 Loop]",
                    error
                );

            }

            if (
                R8_ENGINE.running
            ) {

                window.requestAnimationFrame(
                    loop
                );

            }

        };

    window.requestAnimationFrame(
        loop
    );

}


/* =========================================================
   8.26 — GLOBAL ERROR GUARD
========================================================= */

window.addEventListener(
    "error",
    (event) => {

        try {

            console.error(
                "[RepublicGame Error]",
                event.error ||
                event.message
            );

            if (
                UI_STATE.currentScreen ===
                UI.game
            ) {

                showToast(
                    "یک خطای داخلی رخ داد؛ بازی در حال ادامه است.",
                    "error",
                    3000
                );

            }

        }
        catch (_) {}

    }
);


window.addEventListener(
    "unhandledrejection",
    (event) => {

        try {

            console.error(
                "[RepublicGame Promise]",
                event.reason
            );

        }
        catch (_) {}

    }
);


/* =========================================================
   8.27 — VISIBILITY SAFETY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            saveR8LocalState();

        }

    }
);


/* =========================================================
   8.28 — BEFORE UNLOAD SAVE
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            saveR8LocalState();

        }
        catch (_) {}

    }
);


/* =========================================================
   8.29 — FINAL INTEGRITY
========================================================= */

function runR8FinalIntegrityCheck() {

    const report = {

        ok:
            true,

        errors:
            [],

        warnings:
            [],

        checks:
            {}

    };

    const check =
        (
            name,
            condition,
            warning = false
        ) => {

            report.checks[name] =
                !!condition;

            if (!condition) {

                if (warning) {

                    report.warnings.push(
                        name
                    );

                }
                else {

                    report.errors.push(
                        name
                    );

                    report.ok =
                        false;

                }

            }

        };

    check(
        "STATE",
        !!STATE
    );

    check(
        "PLAYERS_ARRAY",
        Array.isArray(
            STATE?.players
        )
    );

    check(
        "WORLD_STATE",
        !!STATE?.world,
        true
    );

    check(
        "CURRENT_STAGE",
        Number.isFinite(
            Number(
                STATE?.currentStage
            )
        ),
        true
    );

    check(
        "UI_MAIN",
        !!UI.main,
        true
    );

    check(
        "UI_GAME",
        !!UI.game,
        true
    );

    check(
        "AI_EVENT_FUNCTION",
        typeof generateAIEvent ===
        "function",
        true
    );

    check(
        "AI_CONSEQUENCE_FUNCTION",
        typeof generateAIConsequence ===
        "function",
        true
    );

    check(
        "OFFICE3D",
        !!window.Office3D,
        true
    );

    return report;

}


/* =========================================================
   8.30 — DEBUG API
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.final = {

        version:
            R8_ENGINE.saveVersion,

        state:
            R8_ENGINE,

        generateEvent:
            generateAndPublishR8Event,

        submitDecision,

        advanceTurn,

        endGame:
            endR8Game,

        startGame,

        save:
            saveR8LocalState,

        hasSave:
            hasR8LocalSave,

        clearSave:
            clearR8LocalSave,

        integrity:
            runR8FinalIntegrityCheck

    };

}


/* =========================================================
   8.31 — START FINAL LOOP
========================================================= */

startR8GameLoop();


/* =========================================================
   8.32 — INITIAL FINAL REFRESH
========================================================= */

try {

    if (
        STATE
    ) {

        refreshGameUI();

    }

}
catch (error) {

    console.warn(
        "[Final Refresh]",
        error
    );

}


/* =========================================================
   8.33 — FINAL READY EVENT
========================================================= */

try {

    window.dispatchEvent(
        new CustomEvent(
            "republicgame:ready",
            {

                detail: {

                    version:
                        R8_ENGINE.saveVersion,

                    integrity:
                        runR8FinalIntegrityCheck()

                }

            }
        )
    );

}
catch (_) {}


/* =========================================================
   8.34 — FINAL PUBLIC DEBUG
========================================================= */

if (
    window.RepublicGame
) {

    window.RepublicGame.debug = {

        state:
            () => STATE,

        player:
            () => getCurrentLocalPlayer(),

        turn:
            () => getCurrentTurnPlayer(),

        event:
            () => STATE?.currentEvent,

        integrity:
            runR8FinalIntegrityCheck,

        save:
            saveR8LocalState,

        clearSave:
            clearR8LocalSave

    };

}


/* =========================================================
   8.35 — FINAL IIFE CLOSURE
========================================================= */

})();


/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE — COMPLETE
   VERSION 8.0 FINAL
========================================================= */