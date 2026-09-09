/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE — FINAL EDITION
   Multiplayer + AI Director + Consequences
   Supabase Realtime + Cinematic Office
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const VERSION = "FINAL";

    const MAX_PLAYERS = 8;
    const MAX_TURNS = 30;

    const SUPABASE_URL =
        "https://kkltydnftjwdgqtufdvl.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_MB7iy1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

    const ROOM_PREFIX = "absurdity-room-";


    /* =====================================================
       SUPABASE
    ===================================================== */

    let supabaseClient = null;

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {
        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
    }


    /* =====================================================
       DOM
    ===================================================== */

    const $ = id =>
        document.getElementById(id);


    /* =====================================================
       HELPERS
    ===================================================== */

    const clamp = (
        value,
        min = 0,
        max = 100
    ) => {

        const n = Number(value);

        if (!Number.isFinite(n)) {
            return min;
        }

        return Math.max(
            min,
            Math.min(max, n)
        );

    };


    const number = (
        value,
        fallback = 0
    ) => {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : fallback;

    };


    const text = (
        value,
        fallback = ""
    ) => {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value).trim();

    };


    const clone = object => {

        try {
            return JSON.parse(
                JSON.stringify(object)
            );
        } catch (_) {
            return object;
        }

    };


    const random = array => {

        if (
            !Array.isArray(array) ||
            !array.length
        ) {
            return null;
        }

        return array[
            Math.floor(
                Math.random() * array.length
            )
        ];

    };


    const uid = prefix => {

        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    };


    const roomCode = () => {

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

    };


    const normalizeRoom = value => {

        return text(
            value
        )
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);

    };


    /* =====================================================
       COUNTRIES
    ===================================================== */

    const COUNTRIES = [

        "جمهوری آفتاب",
        "اتحاد شمال",
        "فدراسیون شرق",
        "پادشاهی مهتاب",
        "جمهوری کوهستان",
        "اتحاد جزایر",
        "سرزمین سبز",
        "جمهوری مرکزی",
        "امپراتوری قهوه",
        "اتحاد دریایی",
        "جمهوری طلایی",
        "کشور آبی",
        "فدراسیون غرب",
        "جمهوری صحرا",
        "اتحاد رودخانه‌ها",
        "جمهوری آینده"

    ];


    const GEOGRAPHIES = [

        "جزیره‌ای",
        "کوهستانی",
        "ساحلی",
        "بیابانی",
        "سرسبز",
        "شهری"

    ];


    /* =====================================================
       LOCAL PLAYER
    ===================================================== */

    const storedId =
        localStorage.getItem(
            "absurdity_player_id"
        );


    const localPlayer = {

        id:
            storedId ||
            uid("player"),

        leader: "",

        country: "",

        geography: "",

        money: 1000,

        economy: 70,

        electricity: 75,

        popularity: 60,

        stability: 65,

        sanctions: 0,

        relations: 50,

        tension: 25,

        score: 0,

        online: true

    };


    localStorage.setItem(
        "absurdity_player_id",
        localPlayer.id
    );


    /* =====================================================
       GAME STATE
    ===================================================== */

    const gameState = {

        roomCode: "",

        hostId: "",

        started: false,

        finished: false,

        turn: 1,

        currentPlayerIndex: 0,

        stateVersion: 0,

        updatedAt: Date.now(),

        players: [],

        history: [],

        currentEvent: null,

        currentChoice: null,

        currentConsequence: null,

        world: {

            tension: 25,

            market: 70,

            energy: 20,

            media: 50,

            climate: 30,

            globalStability: 70

        }

    };


    /* =====================================================
       RUNTIME
    ===================================================== */

    let channel = null;

    let subscribed = false;

    let gameStarted = false;

    let aiBusy = false;

    let joining = false;

    let startingGame = false;

    let processingChoice = false;

    let transitionLock = false;

    let presenceTimer = null;


    /* =====================================================
       TOAST
    ===================================================== */

    function toast(
        message,
        type = "info",
        duration = 3200
    ) {

        const container =
            $("toastContainer");

        if (!container) {
            return;
        }

        const item =
            document.createElement(
                "div"
            );

        item.className =
            `toast toast-${type}`;

        item.textContent =
            message;

        container.appendChild(item);

        requestAnimationFrame(() => {

            item.classList.add(
                "show"
            );

        });

        setTimeout(() => {

            item.classList.remove(
                "show"
            );

            setTimeout(
                () => item.remove(),
                300
            );

        }, duration);

    }


    /* =====================================================
       LOADING
    ===================================================== */

    function loading(
        visible,
        message = "در حال آماده‌سازی..."
    ) {

        const layer =
            $("globalLoading");

        if (!layer) {
            return;
        }

        layer.classList.toggle(
            "hidden",
            !visible
        );

        const label =
            layer.querySelector(
                ".loading-text"
            );

        if (label) {
            label.textContent =
                message;
        }

    }


    /* =====================================================
       SCREEN SYSTEM
    ===================================================== */

    function showScreen(
        id,
        animate = true
    ) {

        const screens =
            document.querySelectorAll(
                ".screen"
            );

        screens.forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

            }
        );


        const target =
            $(id);

        if (!target) {
            return;
        }


        target.classList.add(
            "active"
        );


        if (animate) {

            target.classList.remove(
                "screen-enter"
            );

            void target.offsetWidth;

            target.classList.add(
                "screen-enter"
            );

        }

    }


    /* =====================================================
       INPUT HELPERS
    ===================================================== */

    function valueOf(id) {

        const element =
            $(id);

        return element
            ? text(element.value)
            : "";

    }


    function setValue(
        id,
        value
    ) {

        const element =
            $(id);

        if (element) {
            element.value =
                value;
        }

    }


    /* =====================================================
       PLAYER HELPERS
    ===================================================== */

    function currentPlayer() {

        return (
            gameState.players[
                gameState.currentPlayerIndex
            ] ||
            gameState.players[0] ||
            null
        );

    }


    function getPlayer(id) {

        return gameState.players.find(
            player =>
                player.id === id
        );

    }


    function isHost() {

        return (
            gameState.hostId ===
            localPlayer.id
        );

    }


    function isMyTurn() {

        const current =
            currentPlayer();

        return Boolean(
            current &&
            current.id ===
            localPlayer.id
        );

    }


    /* =====================================================
       PLAYER CREATION
    ===================================================== */

    function createPlayer(
        leader,
        country,
        geography,
        id = localPlayer.id
    ) {

        return {

            id,

            leader:
                text(
                    leader,
                    "رئیس ناشناس"
                ).slice(0, 40),

            country:
                text(
                    country,
                    "جمهوری آفتاب"
                ),

            geography:
                text(
                    geography,
                    "شهری"
                ),

            money: 1000,

            economy:
                randomStart(65, 78),

            electricity:
                randomStart(65, 85),

            popularity:
                randomStart(52, 72),

            stability:
                randomStart(55, 75),

            sanctions: 0,

            relations:
                randomStart(42, 62),

            tension:
                randomStart(15, 35),

            score: 0,

            online: true

        };

    }


    function randomStart(
        min,
        max
    ) {

        return Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min;

    }


    /* =====================================================
       SELECTORS
    ===================================================== */

    function populateSelectors() {

        const countrySelectors = [
            $("countrySelect"),
            $("joinCountrySelect")
        ];

        const geographySelectors = [
            $("geographySelect"),
            $("joinGeographySelect")
        ];


        countrySelectors.forEach(
            select => {

                if (!select) {
                    return;
                }

                select.innerHTML =
                    `<option value="">انتخاب کشور</option>`;

                COUNTRIES.forEach(
                    country => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            country;

                        option.textContent =
                            country;

                        select.appendChild(
                            option
                        );

                    }
                );

            }
        );


        geographySelectors.forEach(
            select => {

                if (!select) {
                    return;
                }

                select.innerHTML =
                    `<option value="">انتخاب جغرافیا</option>`;

                GEOGRAPHIES.forEach(
                    geography => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            geography;

                        option.textContent =
                            geography;

                        select.appendChild(
                            option
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       CHANNEL
    ===================================================== */

    async function setupChannel(
        code
    ) {

        if (!supabaseClient) {

            toast(
                "اتصال آنلاین آماده نیست.",
                "error"
            );

            return false;

        }


        if (channel) {

            try {
                await supabaseClient.removeChannel(
                    channel
                );
            } catch (_) {}

            channel = null;

        }


        const topic =
            ROOM_PREFIX +
            normalizeRoom(code);


        channel =
            supabaseClient.channel(
                topic,
                {
                    config: {

                        broadcast: {
                            self: false
                        },

                        presence: {
                            key:
                                localPlayer.id
                        }

                    }
                }
            );


        /*
         * Game state
         */

        channel.on(
            "broadcast",
            {
                event: "game_state"
            },
            payload => {

                receiveGameState(
                    payload?.payload
                );

            }
        );


        /*
         * Join request
         */

        channel.on(
            "broadcast",
            {
                event: "join_request"
            },
            payload => {

                handleJoinRequest(
                    payload?.payload
                );

            }
        );


        /*
         * Join accepted
         */

        channel.on(
            "broadcast",
            {
                event: "join_response"
            },
            payload => {

                handleJoinResponse(
                    payload?.payload
                );

            }
        );


        /*
         * Start signal
         */

        channel.on(
            "broadcast",
            {
                event: "start_game"
            },
            payload => {

                if (
                    payload?.payload?.state
                ) {

                    receiveGameState(
                        payload.payload.state
                    );

                }

            }
        );


        /*
         * Choice animation event
         */

        channel.on(
            "broadcast",
            {
                event: "choice_result"
            },
            payload => {

                if (
                    payload?.payload?.state
                ) {

                    receiveGameState(
                        payload.payload.state
                    );

                }

            }
        );


        /*
         * Room pulse
         */

        channel.on(
            "broadcast",
            {
                event: "room_ping"
            },
            () => {

                updateLobbyPresence();

            }
        );


        /*
         * Presence
         */

        channel.on(
            "presence",
            {
                event: "sync"
            },
            () => {

                updateLobbyPresence();

            }
        );


        channel.on(
            "presence",
            {
                event: "join"
            },
            () => {

                updateLobbyPresence();

            }
        );


        channel.on(
            "presence",
            {
                event: "leave"
            },
            () => {

                updateLobbyPresence();

            }
        );


        return new Promise(
            resolve => {

                channel.subscribe(
                    async status => {

                        if (
                            status ===
                            "SUBSCRIBED"
                        ) {

                            subscribed =
                                true;

                            try {

                                await channel.track(
                                    {
                                        id:
                                            localPlayer.id,

                                        leader:
                                            localPlayer.leader,

                                        country:
                                            localPlayer.country,

                                        online_at:
                                            new Date()
                                                .toISOString()
                                    }
                                );

                            } catch (_) {}


                            resolve(
                                true
                            );

                        }


                        if (
                            status ===
                            "CHANNEL_ERROR" ||
                            status ===
                            "TIMED_OUT"
                        ) {

                            subscribed =
                                false;

                            resolve(
                                false
                            );

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       BROADCAST
    ===================================================== */

    async function broadcast(
        event,
        payload
    ) {

        if (
            !channel ||
            !subscribed
        ) {
            return false;
        }


        try {

            await channel.send({

                type:
                    "broadcast",

                event,

                payload

            });

            return true;

        } catch (error) {

            console.warn(
                "[Broadcast]",
                error
            );

            return false;

        }

    }


    /* =====================================================
       CREATE ROOM
    ===================================================== */

    async function createRoom() {

        if (
            !supabaseClient
        ) {

            toast(
                "Supabase در دسترس نیست.",
                "error"
            );

            return;

        }


        const leader =
            valueOf(
                "leaderName"
            );

        const country =
            valueOf(
                "countrySelect"
            );

        const geography =
            valueOf(
                "geographySelect"
            );


        if (!leader) {

            toast(
                "اول اسم رئیس را وارد کن.",
                "warning"
            );

            return;

        }


        if (!country) {

            toast(
                "اول کشور را انتخاب کن.",
                "warning"
            );

            return;

        }


        if (!geography) {

            toast(
                "اول جغرافیا را انتخاب کن.",
                "warning"
            );

            return;

        }


        loading(
            true,
            "در حال ساخت جمهوری شما..."
        );


        try {

            localPlayer.leader =
                leader;

            localPlayer.country =
                country;

            localPlayer.geography =
                geography;


            let code =
                roomCode();


            let connected =
                await setupChannel(
                    code
                );


            if (!connected) {

                throw new Error(
                    "اتصال به اتاق برقرار نشد."
                );

            }


            gameState.roomCode =
                code;

            gameState.hostId =
                localPlayer.id;

            gameState.started =
                false;

            gameState.finished =
                false;

            gameState.turn =
                1;

            gameState.currentPlayerIndex =
                0;

            gameState.stateVersion =
                1;

            gameState.players = [

                createPlayer(
                    leader,
                    country,
                    geography
                )

            ];


            localPlayer.money =
                gameState.players[0].money;


            showScreen(
                "lobbyScreen"
            );


            renderLobby();

            broadcastState();

            toast(
                "اتاق با موفقیت ساخته شد.",
                "success"
            );

        } catch (error) {

            console.error(
                error
            );

            toast(
                "ساخت اتاق ناموفق بود.",
                "error"
            );

        } finally {

            loading(
                false
            );

        }

    }


    /* =====================================================
       JOIN ROOM
    ===================================================== */

    async function joinRoom() {

        if (joining) {
            return;
        }

        joining = true;


        const code =
            normalizeRoom(
                valueOf(
                    "roomCodeInput"
                )
            );


        const leader =
            valueOf(
                "joinLeaderName"
            ) ||
            valueOf(
                "leaderName"
            );


        const country =
            valueOf(
                "joinCountrySelect"
            ) ||
            valueOf(
                "countrySelect"
            );


        const geography =
            valueOf(
                "joinGeographySelect"
            ) ||
            valueOf(
                "geographySelect"
            );


        if (code.length !== 6) {

            toast(
                "کد اتاق باید ۶ کاراکتر باشد.",
                "warning"
            );

            joining = false;

            return;

        }


        if (!leader) {

            toast(
                "اول اسم رئیس را وارد کن.",
                "warning"
            );

            joining = false;

            return;

        }


        if (!country) {

            toast(
                "کشور را انتخاب کن.",
                "warning"
            );

            joining = false;

            return;

        }


        if (!geography) {

            toast(
                "جغرافیا را انتخاب کن.",
                "warning"
            );

            joining = false;

            return;

        }


        loading(
            true,
            "در حال ورود به اتاق..."
        );


        try {

            localPlayer.leader =
                leader;

            localPlayer.country =
                country;

            localPlayer.geography =
                geography;


            const connected =
                await setupChannel(
                    code
                );


            if (!connected) {

                throw new Error(
                    "اتصال برقرار نشد."
                );

            }


            gameState.roomCode =
                code;


            /*
             * از میزبان وضعیت می‌خواهیم
             */

            await broadcast(
                "join_request",
                {

                    player: {

                        id:
                            localPlayer.id,

                        leader,

                        country,

                        geography

                    }

                }
            );


            showScreen(
                "lobbyScreen"
            );


            $("lobbyStatus").textContent =
                "در انتظار تأیید میزبان...";


            setTimeout(
                () => {

                    if (
                        !gameState.hostId
                    ) {

                        toast(
                            "اگر میزبان آنلاین نیست، کد اتاق را بررسی کن.",
                            "warning"
                        );

                    }

                },
                6000
            );


        } catch (error) {

            console.error(
                error
            );

            toast(
                "ورود به اتاق انجام نشد.",
                "error"
            );

        } finally {

            loading(
                false
            );

            joining = false;

        }

    }


    /* =====================================================
       JOIN REQUEST — HOST
    ===================================================== */

    function handleJoinRequest(
        payload
    ) {

        if (!isHost()) {
            return;
        }


        if (
            !payload ||
            !payload.player
        ) {
            return;
        }


        const incoming =
            payload.player;


        if (
            gameState.players.some(
                player =>
                    player.id ===
                    incoming.id
            )
        ) {

            broadcastState();

            return;

        }


        if (
            gameState.players.length >=
            MAX_PLAYERS
        ) {

            broadcast(
                "join_response",
                {

                    accepted: false,

                    reason:
                        "اتاق پر است."

                }
            );

            return;

        }


        const player =
            createPlayer(
                incoming.leader,
                incoming.country,
                incoming.geography,
                incoming.id
            );


        gameState.players.push(
            player
        );


        gameState.stateVersion++;

        gameState.updatedAt =
            Date.now();


        broadcast(
            "join_response",
            {

                accepted: true,

                state:
                    clone(
                        gameState
                    )

            }
        );


        broadcastState();

        renderLobby();

        toast(
            `${player.leader} وارد اتاق شد.`,
            "success"
        );

    }


    /* =====================================================
       JOIN RESPONSE
    ===================================================== */

    function handleJoinResponse(
        payload
    ) {

        if (
            !payload ||
            !payload.accepted
        ) {

            toast(
                payload?.reason ||
                "ورود به اتاق رد شد.",
                "error"
            );

            return;

        }


        if (payload.state) {

            receiveGameState(
                payload.state
            );

        }


        toast(
            "به جمهوری مسخره‌ها خوش آمدی.",
            "success"
        );

    }


    /* =====================================================
       BROADCAST STATE
    ===================================================== */

    async function broadcastState() {

        if (!isHost()) {
            return;
        }


        gameState.stateVersion++;

        gameState.updatedAt =
            Date.now();


        await broadcast(
            "game_state",
            clone(
                gameState
            )
        );

    }


    /* =====================================================
       RECEIVE STATE
    ===================================================== */

    function receiveGameState(
        incoming
    ) {

        if (
            !incoming ||
            typeof incoming !==
            "object"
        ) {
            return;
        }


        const incomingVersion =
            number(
                incoming.stateVersion,
                0
            );


        if (
            incomingVersion <
            gameState.stateVersion
        ) {
            return;
        }


        Object.assign(
            gameState,
            clone(
                incoming
            )
        );


        gameStarted =
            Boolean(
                gameState.started
            );


        /*
         * Local player را از state پیدا می‌کنیم
         */

        const me =
            getPlayer(
                localPlayer.id
            );


        if (me) {

            Object.assign(
                localPlayer,
                me
            );

        }


        renderEverything();


        /*
         * بازی تمام شده
         */

        if (
            gameState.finished
        ) {

            showEndScreen();

            return;

        }


        /*
         * بازی شروع شده
         */

        if (
            gameState.started
        ) {

            if (
                !$("gameScreen")?.classList.contains(
                    "active"
                )
            ) {

                showScreen(
                    "gameScreen"
                );

            }

        } else {

            if (
                !$("lobbyScreen")?.classList.contains(
                    "active"
                )
            ) {

                showScreen(
                    "lobbyScreen"
                );

            }

        }


        /*
         * رویداد فعلی
         */

        if (
            gameState.currentEvent
        ) {

            renderEvent(
                gameState.currentEvent
            );

        }


        /*
         * پیامد
         */

        if (
            gameState.currentConsequence
        ) {

            showConsequence(
                gameState.currentConsequence,
                false
            );

        }

    }


    /* =====================================================
       PRESENCE
    ===================================================== */

    function updateLobbyPresence() {

        renderLobby();

        if (
            gameState.roomCode &&
            channel
        ) {

            broadcast(
                "room_ping",
                {
                    from:
                        localPlayer.id
                }
            );

        }

    }


    /* =====================================================
       START GAME
    ===================================================== */

    async function startGame() {

        if (
            !isHost() ||
            startingGame
        ) {
            return;
        }


        if (
            gameState.players.length < 1
        ) {
            return;
        }


        startingGame = true;


        const button =
            $("startGameBtn");


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "در حال شروع...";

        }


        try {

            gameState.started =
                true;

            gameState.finished =
                false;

            gameState.turn =
                1;

            gameState.currentPlayerIndex =
                0;

            gameState.currentEvent =
                null;

            gameState.currentChoice =
                null;

            gameState.currentConsequence =
                null;

            gameState.history =
                [];

            gameState.world = {

                tension: 25,

                market: 70,

                energy: 20,

                media: 50,

                climate: 30,

                globalStability: 70

            };


            gameState.players.forEach(
                player => {

                    player.online =
                        true;

                }
            );


            showScreen(
                "gameScreen"
            );


            renderEverything();


            await broadcast(
                "start_game",
                {
                    state:
                        clone(
                            gameState
                        )
                }
            );


            await broadcastState();


            /*
             * کمی تأخیر سینمایی
             */

            setTimeout(
                () => {

                    hostGenerateNextEvent();

                },
                1100
            );


        } catch (error) {

            console.error(
                error
            );

            toast(
                "شروع بازی با خطا مواجه شد.",
                "error"
            );

        } finally {

            startingGame = false;

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "شروع بازی";

            }

        }

    }


    /* =====================================================
       GENERATE NEXT EVENT
    ===================================================== */

    async function hostGenerateNextEvent() {

        if (
            !isHost() ||
            !gameState.started ||
            gameState.finished ||
            aiBusy
        ) {
            return;
        }


        if (
            gameState.turn >
            MAX_TURNS
        ) {

            finishGame();

            return;

        }


        const player =
            currentPlayer();


        if (!player) {
            return;
        }


        aiBusy = true;


        showAIThinking(
            true,
            "مدیر جهان در حال طراحی بحران بعدی..."
        );


        try {

            let event;


            if (
                window.RepublicAI &&
                typeof
                window.RepublicAI.generateAIEvent ===
                "function"
            ) {

                event =
                    await window.RepublicAI.generateAIEvent(
                        gameState,
                        gameState.history
                    );

            } else if (
                typeof window.generateAIEvent ===
                "function"
            ) {

                event =
                    await window.generateAIEvent(
                        gameState,
                        gameState.history
                    );

            }


            if (!event) {

                event = {
                    id:
                        uid("event"),

                    title:
                        "اتفاق غیرمنتظره",

                    description:
                        "یک اتفاق تازه در جهان رخ داده است.",

                    category:
                        "absurd",

                    severity: 2,

                    news:
                        "خبر فوری: وضعیت جهان دوباره تغییر کرد.",

                    targetPlayerId:
                        player.id,

                    choices: [

                        {
                            title:
                                "واکنش سریع",

                            description:
                                "دولت سریعاً وارد عمل می‌شود.",

                            effects: {
                                money: -40,
                                popularity: 4,
                                stability: 3
                            }

                        },

                        {
                            title:
                                "احتیاط",

                            description:
                                "دولت فعلاً شرایط را بررسی می‌کند.",

                            effects: {
                                popularity: 1,
                                stability: 2
                            }

                        },

                        {
                            title:
                                "نادیده گرفتن",

                            description:
                                "دولت واکنش خاصی نشان نمی‌دهد.",

                            effects: {
                                popularity: -5,
                                stability: -4
                            }

                        }

                    ]

                };

            }


            /*
             * رویداد همیشه برای بازیکن نوبت فعلی است
             */

            event.targetPlayerId =
                player.id;


            gameState.currentEvent =
                event;

            gameState.currentChoice =
                null;

            gameState.currentConsequence =
                null;


            renderEvent(
                event
            );


            showScreen(
                "gameScreen"
            );


            /*
             * ارسال به همه
             */

            await broadcastState();


            /*
             * افکت 3D
             */

            if (
                window.Office3D &&
                typeof
                window.Office3D.showEvent ===
                "function"
            ) {

                window.Office3D.showEvent(
                    event
                );

            }


        } catch (error) {

            console.error(
                "[EVENT]",
                error
            );

            toast(
                "مدیر جهان موقتاً گیج شد! رویداد جایگزین فعال شد.",
                "warning"
            );


            const fallback =
                createEmergencyEvent(
                    player
                );


            gameState.currentEvent =
                fallback;


            renderEvent(
                fallback
            );


            await broadcastState();

        } finally {

            aiBusy = false;

            showAIThinking(
                false
            );

        }

    }


    /* =====================================================
       EMERGENCY EVENT
    ===================================================== */

    function createEmergencyEvent(
        player
    ) {

        return {

            id:
                uid("emergency"),

            title:
                random([
                    "بازار ناگهان تغییر کرد",
                    "خبر فوری از پایتخت",
                    "بحران جدید روی میز رئیس",
                    "یک صبح کاملاً عجیب",
                    "جلسه اضطراری کابینه"
                ]),

            description:
                random([
                    "مقام‌ها از یک تغییر ناگهانی در وضعیت کشور خبر می‌دهند.",
                    "رسانه‌ها در حال بررسی یک اتفاق غیرمنتظره هستند.",
                    "کابینه برای تصمیم‌گیری فوری تشکیل جلسه داده است."
                ]),

            category:
                random([
                    "economy",
                    "media",
                    "politics",
                    "absurd"
                ]),

            severity: 2,

            news:
                "ABSURD NEWS — خبر فوری از پایتخت.",

            targetPlayerId:
                player.id,

            choices: [

                {
                    title:
                        "اقدام فوری",

                    description:
                        "دولت سریع واکنش نشان می‌دهد.",

                    effects: {
                        money: -60,
                        stability: 5,
                        popularity: 3
                    }

                },

                {
                    title:
                        "بررسی بیشتر",

                    description:
                        "دولت قبل از تصمیم نهایی اطلاعات بیشتری جمع می‌کند.",

                    effects: {
                        stability: 2,
                        popularity: 1
                    }

                },

                {
                    title:
                        "نادیده گرفتن",

                    description:
                        "دولت تصمیم می‌گیرد فعلاً واکنش نشان ندهد.",

                    effects: {
                        popularity: -5,
                        stability: -5
                    }

                }

            ]

        };

    }


    /* =====================================================
       RENDER EVENT
    ===================================================== */

    function renderEvent(
        event
    ) {

        if (!event) {
            return;
        }


        const category =
            text(
                event.category,
                "absurd"
            );


        const categoryData =
            window.RepublicAI?.categories?.[
                category
            ];


        setText(
            "eventCategory",
            categoryData
                ? categoryData.label
                : "خبر فوری"
        );


        setText(
            "eventTitle",
            event.title
        );


        setText(
            "eventDescription",
            event.description
        );


        setText(
            "newsHeadline",
            event.title
        );


        setText(
            "newsText",
            event.news ||
            event.description
        );


        renderDecisionCards(
            event.choices || []
        );


        setText(
            "turnMessage",
            isMyTurn()
                ? "نوبت شماست — تصمیم بگیرید."
                : `نوبت ${currentPlayer()?.leader || "بازیکن"} است.`
        );


        updateTurnIndicator();

    }


    /* =====================================================
       DECISION CARDS
    ===================================================== */

    function renderDecisionCards(
        choices
    ) {

        const container =
            $("decisionCards");

        if (!container) {
            return;
        }


        container.innerHTML = "";


        choices
            .slice(0, 3)
            .forEach(
                (choice, index) => {

                    const card =
                        document.createElement(
                            "button"
                        );


                    card.type =
                        "button";


                    card.className =
                        "decision-card";


                    card.dataset.index =
                        String(index);


                    card.innerHTML = `

                        <span class="decision-number">
                            ${index + 1}
                        </span>

                        <span class="decision-content">

                            <strong>
                                ${escapeHTML(
                                    choice.title ||
                                    `تصمیم ${index + 1}`
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    choice.description ||
                                    ""
                                )}
                            </small>

                        </span>

                        <span class="decision-arrow">
                            ←
                        </span>

                    `;


                    card.addEventListener(
                        "click",
                        () => {

                            chooseDecision(
                                index
                            );

                        }
                    );


                    container.appendChild(
                        card
                    );


                    /*
                     * ورود کارت‌ها یکی یکی
                     */

                    setTimeout(
                        () => {

                            card.classList.add(
                                "visible"
                            );

                        },
                        120 +
                        index * 180
                    );

                }
            );

    }


    /* =====================================================
       CHOOSE DECISION
    ===================================================== */

    async function chooseDecision(
        index
    ) {

        if (
            processingChoice ||
            !isMyTurn() ||
            !gameState.currentEvent
        ) {

            if (!isMyTurn()) {

                toast(
                    "فعلاً نوبت شما نیست.",
                    "warning"
                );

            }

            return;

        }


        const choice =
            gameState.currentEvent
                .choices?.[index];


        if (!choice) {
            return;
        }


        processingChoice =
            true;


        animateSelectedCard(
            index
        );


        gameState.currentChoice = {

            playerId:
                localPlayer.id,

            choiceIndex:
                index,

            choice:
                clone(choice),

            timestamp:
                Date.now()

        };


        /*
         * فقط بازیکن صاحب نوبت
         * پیامد را تولید می‌کند.
         */

        if (!isHost()) {

            await broadcast(
                "choice_made",
                {

                    playerId:
                        localPlayer.id,

                    choiceIndex:
                        index,

                    choice:
                        clone(choice)

                }
            );


            /*
             * میزبان باید choice_made را بگیرد.
             * اگر listener نبود، پایین اضافه شده.
             */

            setTimeout(
                () => {

                    processingChoice =
                        false;

                },
                1200
            );

            return;

        }


        await processChoice(
            localPlayer.id,
            index,
            choice
        );

    }


    /* =====================================================
       CHOICE MADE LISTENER
    ===================================================== */

    function setupChoiceListener() {

        if (!channel) {
            return;
        }


        channel.on(
            "broadcast",
            {
                event: "choice_made"
            },
            payload => {

                if (!isHost()) {
                    return;
                }


                const data =
                    payload?.payload;


                if (!data) {
                    return;
                }


                processChoice(
                    data.playerId,
                    data.choiceIndex,
                    data.choice
                );

            }
        );

    }


    /* =====================================================
       PROCESS CHOICE
    ===================================================== */

    async function processChoice(
        playerId,
        index,
        choice
    ) {

        if (
            !isHost() ||
            gameState.finished
        ) {
            return;
        }


        if (
            gameState.currentChoice
                ?.processed
        ) {
            return;
        }


        const player =
            getPlayer(
                playerId
            );


        if (!player) {
            return;
        }


        if (
            currentPlayer()?.id !==
            playerId
        ) {
            return;
        }


        gameState.currentChoice = {

            playerId,

            choiceIndex:
                index,

            choice:
                clone(choice),

            processed:
                true,

            timestamp:
                Date.now()

        };


        showAIThinking(
            true,
            "مدیر جهان در حال محاسبه پیامد تصمیم..."
        );


        try {

            let consequence;


            if (
                window.RepublicAI &&
                typeof
                window.RepublicAI.generateAIConsequence ===
                "function"
            ) {

                consequence =
                    await window.RepublicAI.generateAIConsequence(
                        gameState,
                        gameState.history,
                        {
                            player:
                                clone(player),

                            country:
                                player.country,

                            choice:
                                clone(choice)
                        }
                    );

            } else {

                consequence = {

                    title:
                        "پیامد تصمیم",

                    story:
                        "تصمیم شما روی وضعیت کشور اثر گذاشت.",

                    news:
                        "خبر فوری: پیامد تصمیم در حال بررسی است.",

                    effects:
                        choice.effects || {}

                };

            }


            applyEffects(
                player,
                consequence?.effects ||
                choice.effects ||
                {}
            );


            updateWorldAfterDecision(
                player,
                consequence
            );


            const historyItem = {

                turn:
                    gameState.turn,

                playerId:
                    player.id,

                playerName:
                    player.leader,

                country:
                    player.country,

                eventId:
                    gameState.currentEvent?.id,

                title:
                    gameState.currentEvent?.title,

                category:
                    gameState.currentEvent?.category,

                choiceIndex:
                    index,

                choiceTitle:
                    choice.title,

                consequenceTitle:
                    consequence?.title ||
                    "",

                timestamp:
                    Date.now()

            };


            gameState.history.push(
                historyItem
            );


            if (
                gameState.history.length >
                40
            ) {

                gameState.history =
                    gameState.history.slice(
                        -40
                    );

            }


            gameState.currentConsequence =
                consequence;


            gameState.currentEvent =
                gameState.currentEvent;


            showConsequence(
                consequence,
                true
            );


            await broadcast(
                "choice_result",
                {

                    state:
                        clone(
                            gameState
                        )

                }
            );


            await broadcastState();


            /*
             * چند ثانیه برای نمایش پیامد
             */

            setTimeout(
                () => {

                    if (
                        gameState.finished
                    ) {
                        return;
                    }


                    finishTurn();

                },
                4800
            );


        } catch (error) {

            console.error(
                "[CONSEQUENCE]",
                error
            );


            const fallback = {

                title:
                    "تصمیم ثبت شد",

                story:
                    "تصمیم شما ثبت شد و کشور وارد مرحله بعدی شد.",

                news:
                    "ABSURD NEWS — دولت واکنش خود را اعلام کرد.",

                effects:
                    choice.effects || {}

            };


            applyEffects(
                player,
                fallback.effects
            );


            gameState.currentConsequence =
                fallback;


            showConsequence(
                fallback,
                true
            );


            await broadcastState();


            setTimeout(
                finishTurn,
                4000
            );

        } finally {

            showAIThinking(
                false
            );

        }

    }


    /* =====================================================
       APPLY EFFECTS
    ===================================================== */

    function applyEffects(
        player,
        effects
    ) {

        if (!player) {
            return;
        }


        const safeEffects =
            effects || {};


        player.money +=
            number(
                safeEffects.money,
                0
            );


        player.economy =
            clamp(
                player.economy +
                number(
                    safeEffects.economy,
                    0
                )
            );


        player.electricity =
            clamp(
                player.electricity +
                number(
                    safeEffects.electricity,
                    0
                )
            );


        player.popularity =
            clamp(
                player.popularity +
                number(
                    safeEffects.popularity,
                    0
                )
            );


        player.stability =
            clamp(
                player.stability +
                number(
                    safeEffects.stability,
                    0
                )
            );


        player.sanctions =
            clamp(
                player.sanctions +
                number(
                    safeEffects.sanctions,
                    0
                ),
                0,
                100
            );


        player.relations =
            clamp(
                player.relations +
                number(
                    safeEffects.relations,
                    0
                )
            );


        player.tension =
            clamp(
                player.tension +
                number(
                    safeEffects.tension,
                    0
                )
            );


        /*
         * پول هیچ‌وقت منفی نمی‌شود
         */

        player.money =
            Math.max(
                0,
                Math.round(
                    player.money
                )
            );


        /*
         * امتیاز
         */

        player.score =
            calculatePlayerScore(
                player
            );

    }


    /* =====================================================
       WORLD SIMULATION
    ===================================================== */

    function updateWorldAfterDecision(
        player,
        consequence
    ) {

        const effects =
            consequence?.effects ||
            {};


        gameState.world.tension =
            clamp(
                gameState.world.tension +
                number(
                    effects.tension,
                    0
                ) *
                0.55
            );


        gameState.world.market =
            clamp(
                gameState.world.market +
                number(
                    effects.economy,
                    0
                ) *
                0.30
            );


        gameState.world.energy =
            clamp(
                gameState.world.energy +
                (
                    50 -
                    number(
                        player.electricity,
                        50
                    )
                ) *
                0.08
            );


        gameState.world.media =
            clamp(
                gameState.world.media +
                (
                    50 -
                    number(
                        player.popularity,
                        50
                    )
                ) *
                0.04
            );


        gameState.world.climate =
            clamp(
                gameState.world.climate +
                randomBetween(
                    -2,
                    3
                )
            );


        gameState.world.globalStability =
            clamp(
                100 -
                (
                    gameState.world.tension *
                    0.5
                ) -
                (
                    gameState.world.climate *
                    0.2
                )
            );

    }


    function randomBetween(
        min,
        max
    ) {

        return (
            Math.random() *
            (max - min)
        ) + min;

    }


    /* =====================================================
       FINISH TURN
    ===================================================== */

    async function finishTurn() {

        if (
            !isHost() ||
            gameState.finished
        ) {
            return;
        }


        gameState.currentConsequence =
            null;

        gameState.currentChoice =
            null;


        /*
         * نوبت بعدی
         */

        gameState.currentPlayerIndex++;


        /*
         * اگر همه یک نوبت گرفتند
         */

        if (
            gameState.currentPlayerIndex >=
            gameState.players.length
        ) {

            gameState.currentPlayerIndex =
                0;

            gameState.turn++;


            /*
             * جهان خودش تغییر می‌کند
             */

            simulateWorldTick();

        }


        /*
         * پایان
         */

        if (
            gameState.turn >
            MAX_TURNS
        ) {

            finishGame();

            return;

        }


        await broadcastState();


        /*
         * فاصله کوتاه برای حس سینمایی
         */

        setTimeout(
            () => {

                hostGenerateNextEvent();

            },
            1000
        );

    }


    /* =====================================================
       WORLD TICK
    ===================================================== */

    function simulateWorldTick() {

        const world =
            gameState.world;


        world.tension =
            clamp(
                world.tension +
                randomBetween(
                    -4,
                    5
                )
            );


        world.market =
            clamp(
                world.market +
                randomBetween(
                    -5,
                    5
                )
            );


        world.energy =
            clamp(
                world.energy +
                randomBetween(
                    -4,
                    5
                )
            );


        world.media =
            clamp(
                world.media +
                randomBetween(
                    -3,
                    4
                )
            );


        world.climate =
            clamp(
                world.climate +
                randomBetween(
                    -2,
                    3
                )
            );


        world.globalStability =
            clamp(
                100 -
                world.tension * 0.55 -
                world.climate * 0.15
            );


        /*
         * اثر جهان روی کشورها
         */

        gameState.players.forEach(
            player => {

                if (
                    world.market < 35
                ) {

                    player.economy =
                        clamp(
                            player.economy - 2
                        );

                }


                if (
                    world.tension > 70
                ) {

                    player.relations =
                        clamp(
                            player.relations - 2
                        );

                }


                if (
                    world.energy > 70
                ) {

                    player.electricity =
                        clamp(
                            player.electricity - 2
                        );

                }


                player.score =
                    calculatePlayerScore(
                        player
                    );

            }
        );

    }


    /* =====================================================
       SCORE
    ===================================================== */

    function calculatePlayerScore(
        player
    ) {

        return Math.round(

            player.money * 0.015 +

            player.economy * 1.4 +

            player.electricity * 0.7 +

            player.popularity * 1.2 +

            player.stability * 1.3 +

            player.relations * 0.7 -

            player.sanctions * 0.8 -

            player.tension * 0.5

        );

    }


    /* =====================================================
       FINISH GAME
    ===================================================== */

    async function finishGame() {

        if (
            !isHost() ||
            gameState.finished
        ) {
            return;
        }


        gameState.finished =
            true;

        gameState.started =
            false;


        gameState.players.forEach(
            player => {

                player.score =
                    calculatePlayerScore(
                        player
                    );

            }
        );


        gameState.players.sort(
            (a, b) =>
                b.score -
                a.score
        );


        await broadcastState();


        showEndScreen();

    }


    /* =====================================================
       END SCREEN
    ===================================================== */

    function showEndScreen() {

        gameStarted =
            false;


        showScreen(
            "endScreen"
        );


        const container =
            $("rankingList");


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        gameState.players
            .slice()
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            )
            .forEach(
                (player, index) => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "ranking-row";


                    row.innerHTML = `

                        <span class="ranking-position">
                            ${index + 1}
                        </span>

                        <span class="ranking-player">

                            <strong>
                                ${escapeHTML(
                                    player.leader
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    player.country
                                )}
                            </small>

                        </span>

                        <span class="ranking-score">
                            ${Math.round(
                                player.score
                            )}
                        </span>

                    `;


                    container.appendChild(
                        row
                    );

                }
            );

    }


    /* =====================================================
       CONSEQUENCE UI
    ===================================================== */

    function showConsequence(
        consequence,
        animate = true
    ) {

        const overlay =
            $("consequenceOverlay");


        if (!overlay) {
            return;
        }


        setText(
            "consequenceTitle",
            consequence?.title ||
            "پیامد تصمیم"
        );


        setText(
            "consequenceStory",
            consequence?.story ||
            ""
        );


        setText(
            "consequenceNews",
            consequence?.news ||
            ""
        );


        overlay.classList.remove(
            "hidden"
        );


        if (animate) {

            overlay.classList.remove(
                "consequence-enter"
            );

            void overlay.offsetWidth;

            overlay.classList.add(
                "consequence-enter"
            );

        }

    }


    function hideConsequence() {

        const overlay =
            $("consequenceOverlay");

        if (overlay) {

            overlay.classList.add(
                "hidden"
            );

        }

    }


    /* =====================================================
       AI THINKING
    ===================================================== */

    function showAIThinking(
        visible,
        message =
            "مدیر جهان در حال فکر کردن..."
    ) {

        const element =
            $("aiThinking");

        if (!element) {
            return;
        }


        element.classList.toggle(
            "hidden",
            !visible
        );


        setText(
            "aiThinkingText",
            message
        );

    }


    /* =====================================================
       CARD ANIMATION
    ===================================================== */

    function animateSelectedCard(
        index
    ) {

        const cards =
            document.querySelectorAll(
                ".decision-card"
            );


        cards.forEach(
            (card, i) => {

                if (i === index) {

                    card.classList.add(
                        "selected"
                    );

                } else {

                    card.classList.add(
                        "retreat"
                    );

                }

            }
        );


        if (
            window.Office3D &&
            typeof
            window.Office3D.focusMonitor ===
            "function"
        ) {

            setTimeout(
                () => {

                    window.Office3D.focusMonitor();

                },
                350
            );

        }

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function renderDashboard() {

        const player =
            getPlayer(
                localPlayer.id
            ) ||
            currentPlayer();


        if (!player) {
            return;
        }


        setText(
            "playerCountry",
            player.country
        );


        setText(
            "playerLeader",
            player.leader
        );


        setText(
            "statMoney",
            formatMoney(
                player.money
            )
        );


        setText(
            "statEconomy",
            Math.round(
                player.economy
            )
        );


        setText(
            "statElectricity",
            Math.round(
                player.electricity
            )
        );


        setText(
            "statPopularity",
            Math.round(
                player.popularity
            )
        );


        setText(
            "statStability",
            Math.round(
                player.stability
            )
        );


        setText(
            "statSanctions",
            Math.round(
                player.sanctions
            )
        );


        setText(
            "worldTension",
            Math.round(
                gameState.world.tension
            )
        );


        setText(
            "worldMarket",
            Math.round(
                gameState.world.market
            )
        );


        setText(
            "worldEnergy",
            Math.round(
                gameState.world.energy
            )
        );


        setText(
            "worldStability",
            Math.round(
                gameState.world.globalStability
            )
        );


        setText(
            "turnNumber",
            gameState.turn
        );


        setText(
            "maxTurns",
            MAX_TURNS
        );

    }


    /* =====================================================
       TURN INDICATOR
    ===================================================== */

    function updateTurnIndicator() {

        const player =
            currentPlayer();


        if (!player) {
            return;
        }


        setText(
            "currentTurnPlayer",
            player.leader
        );


        setText(
            "currentTurnCountry",
            player.country
        );


        const message =
            $("turnMessage");


        if (message) {

            message.classList.toggle(
                "my-turn",
                isMyTurn()
            );

        }

    }


    /* =====================================================
       NEWS
    ===================================================== */

    function renderNews() {

        const event =
            gameState.currentEvent;


        if (!event) {
            return;
        }


        setText(
            "newsHeadline",
            event.title
        );


        setText(
            "newsText",
            event.news ||
            event.description
        );


        if (
            window.Office3D &&
            typeof
            window.Office3D.drawNewsScreen ===
            "function"
        ) {

            window.Office3D.drawNewsScreen(
                event
            );

        }

    }


    /* =====================================================
       LOBBY
    ===================================================== */

    function renderLobby() {

        setText(
            "roomCodeDisplay",
            gameState.roomCode ||
            "------"
        );


        setText(
            "playerCount",
            `${gameState.players.length}/${MAX_PLAYERS}`
        );


        const list =
            $("playersList");


        if (!list) {
            return;
        }


        list.innerHTML = "";


        gameState.players.forEach(
            (player, index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "player-row";


                const isPlayerHost =
                    player.id ===
                    gameState.hostId;


                const isMe =
                    player.id ===
                    localPlayer.id;


                row.innerHTML = `

                    <div class="player-avatar">
                        ${index + 1}
                    </div>

                    <div class="player-info">

                        <strong>
                            ${escapeHTML(
                                player.leader
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                player.country
                            )}
                        </small>

                    </div>

                    <div class="player-badges">

                        ${
                            isPlayerHost
                                ? `<span class="host-badge">HOST</span>`
                                : ""
                        }

                        ${
                            isMe
                                ? `<span class="me-badge">YOU</span>`
                                : ""
                        }

                    </div>

                `;


                list.appendChild(
                    row
                );

            }
        );


        const status =
            $("lobbyStatus");


        if (status) {

            if (gameState.started) {

                status.textContent =
                    "بازی در حال اجراست.";

            } else if (isHost()) {

                status.textContent =
                    gameState.players.length === 1
                        ? "منتظر بازیکنان دیگر یا شروع بازی..."
                        : "همه آماده‌اند؛ می‌توانید بازی را شروع کنید.";

            } else {

                status.textContent =
                    "منتظر شروع بازی توسط میزبان...";

            }

        }


        const startButton =
            $("startGameBtn");


        if (startButton) {

            startButton.style.display =
                isHost()
                    ? ""
                    : "none";

        }

    }


    /* =====================================================
       RENDER EVERYTHING
    ===================================================== */

    function renderEverything() {

        renderDashboard();

        renderNews();

        renderLobby();

        updateTurnIndicator();

    }


    /* =====================================================
       TEXT
    ===================================================== */

    function setText(
        id,
        value
    ) {

        const element =
            $(id);

        if (element) {

            element.textContent =
                text(
                    value,
                    ""
                );

        }

    }


    /* =====================================================
       MONEY
    ===================================================== */

    function formatMoney(
        value
    ) {

        const n =
            Math.round(
                number(
                    value,
                    0
                )
            );


        return (
            n.toLocaleString(
                "fa-IR"
            ) +
            " M"
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return text(
            value
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


    /* =====================================================
       COPY ROOM
    ===================================================== */

    async function copyRoomCode() {

        const code =
            gameState.roomCode;


        if (!code) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                code
            );


            toast(
                "کد اتاق کپی شد.",
                "success"
            );

        } catch (_) {

            toast(
                `کد اتاق: ${code}`,
                "info",
                5000
            );

        }

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function bindNavigation() {

        /*
         * CREATE
         */

        $("createGameBtn")
            ?.addEventListener(
                "click",
                () => {

                    showScreen(
                        "setupScreen"
                    );

                }
            );


        /*
         * JOIN
         */

        $("joinGameBtn")
            ?.addEventListener(
                "click",
                () => {

                    showScreen(
                        "joinScreen"
                    );

                }
            );


        /*
         * CREATE CONFIRM
         */

        $("confirmSetupBtn")
            ?.addEventListener(
                "click",
                createRoom
            );


        /*
         * JOIN CONFIRM
         */

        $("joinConfirmBtn")
            ?.addEventListener(
                "click",
                joinRoom
            );


        /*
         * START
         */

        $("startGameBtn")
            ?.addEventListener(
                "click",
                startGame
            );


        /*
         * COPY
         */

        $("copyRoomBtn")
            ?.addEventListener(
                "click",
                copyRoomCode
            );


        /*
         * PLAY AGAIN
         */

        $("playAgainBtn")
            ?.addEventListener(
                "click",
                () => {

                    location.reload();

                }
            );


        /*
         * BACK BUTTONS
         */

        document
            .querySelectorAll(
                "[data-back]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            showScreen(
                                button.dataset.back
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       MUSIC / FX HOOKS
    ===================================================== */

    function setupAudioControls() {

        const music =
            $("musicToggleBtn");

        const fx =
            $("fxToggleBtn");


        if (music) {

            music.addEventListener(
                "click",
                () => {

                    document.body.classList.toggle(
                        "music-off"
                    );

                    music.classList.toggle(
                        "active"
                    );

                    window.dispatchEvent(
                        new CustomEvent(
                            "republic:music-toggle",
                            {
                                detail: {
                                    enabled:
                                        !document.body.classList.contains(
                                            "music-off"
                                        )
                                }
                            }
                        )
                    );

                }
            );

        }


        if (fx) {

            fx.addEventListener(
                "click",
                () => {

                    document.body.classList.toggle(
                        "fx-off"
                    );

                    fx.classList.toggle(
                        "active"
                    );

                }
            );

        }

    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    function bindKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.target &&
                    (
                        event.target.tagName ===
                        "INPUT" ||
                        event.target.tagName ===
                        "TEXTAREA" ||
                        event.target.tagName ===
                        "SELECT"
                    )
                ) {
                    return;
                }


                if (
                    !gameState.currentEvent ||
                    !isMyTurn()
                ) {
                    return;
                }


                if (
                    event.key === "1" ||
                    event.key === "2" ||
                    event.key === "3"
                ) {

                    chooseDecision(
                        Number(
                            event.key
                        ) - 1
                    );

                }

            }
        );

    }


    /* =====================================================
       ONLINE / OFFLINE
    ===================================================== */

    function setupConnectionEvents() {

        window.addEventListener(
            "online",
            () => {

                localPlayer.online =
                    true;

                toast(
                    "اتصال اینترنت برگشت.",
                    "success"
                );

            }
        );


        window.addEventListener(
            "offline",
            () => {

                localPlayer.online =
                    false;

                toast(
                    "اتصال اینترنت قطع شد.",
                    "warning"
                );

            }
        );

    }


    /* =====================================================
       BEFORE UNLOAD
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            try {

                if (
                    channel
                ) {

                    channel.untrack();

                }

            } catch (_) {}

        }
    );


    /* =====================================================
       BOOT
    ===================================================== */

    async function boot() {

        console.log(
            `Republic of Absurdity ${VERSION}`
        );


        populateSelectors();

        bindNavigation();

        setupAudioControls();

        bindKeyboard();

        setupConnectionEvents();


        /*
         * Choice listener باید بعد از
         * ساخت channel فعال شود.
         *
         * برای اینکه join/create بعداً
         * آن را داشته باشند، از observer ساده
         * استفاده می‌کنیم.
         */

        const originalSetupChannel =
            setupChannel;


        /*
         * شروع انیمیشن بوت
         */

        setTimeout(
            () => {

                const bootScreen =
                    $("bootScreen");

                if (bootScreen) {

                    bootScreen.classList.add(
                        "boot-complete"
                    );

                }

            },
            1600
        );


        /*
         * راه‌اندازی 3D
         */

        setTimeout(
            () => {

                if (
                    window.Office3D &&
                    typeof
                    window.Office3D.init ===
                    "function"
                ) {

                    try {

                        window.Office3D.init();

                    } catch (error) {

                        console.warn(
                            "Office3D:",
                            error
                        );

                    }

                }

            },
            100
        );


        /*
         * Loading اولیه
         */

        setTimeout(
            () => {

                const boot =
                    $("bootScreen");

                const menu =
                    $("mainMenu");


                if (boot) {

                    boot.classList.add(
                        "fade-out"
                    );

                }


                setTimeout(
                    () => {

                        if (boot) {

                            boot.style.display =
                                "none";

                        }

                        if (menu) {

                            menu.classList.add(
                                "active"
                            );

                        }

                    },
                    650
                );

            },
            2200
        );


        /*
         * presence pulse
         */

        presenceTimer =
            setInterval(
                () => {

                    if (
                        channel &&
                        subscribed
                    ) {

                        try {

                            channel.track({

                                id:
                                    localPlayer.id,

                                leader:
                                    localPlayer.leader,

                                country:
                                    localPlayer.country,

                                online_at:
                                    new Date()
                                        .toISOString()

                            });

                        } catch (_) {}

                    }

                },
                15000
            );

    }


    /* =====================================================
       PATCH CHANNEL SETUP
       اضافه کردن listener انتخاب
    ===================================================== */

    const originalSetup =
        setupChannel;


    setupChannel =
        async function(code) {

            const result =
                await originalSetup(
                    code
                );


            if (
                result &&
                channel
            ) {

                setupChoiceListener();

            }


            return result;

        };


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.RepublicGame = {

        version: VERSION,

        state:
            gameState,

        player:
            localPlayer,

        createRoom,

        joinRoom,

        startGame,

        chooseDecision,

        showScreen,

        toast,

        renderEverything,

        finishGame

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
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }

})();