/* =========================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v5.0
   Multiplayer + AI Director + Dynamic World
   Supabase Realtime + Cinematic 3D Office
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
       ===================================================== */

    const VERSION = "5.0";
    const MAX_PLAYERS = 8;
    const MAX_TURNS = 30;

    const SUPABASE_URL =
        "https://kkltydnftjwdgqtufdvl.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_MB7i1qpKxjF83gwh1TsjA_Bs0Ox6Bk";

    const AI_EVENT_FN =
        window.generateAIEvent;

    const AI_CONSEQUENCE_FN =
        window.generateAIConsequence;


    /* =====================================================
       SUPABASE
       ===================================================== */

    let supabase = null;
    let channel = null;

    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
        }
    } catch (error) {
        console.error("Supabase initialization failed:", error);
    }


    /* =====================================================
       LOCAL PLAYER
       ===================================================== */

    const localPlayer = {
        id:
            "p_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8),

        name: "رئیس",

        country: "",

        geography: "",

        isHost: false,

        joinedAt: Date.now()
    };


    /* =====================================================
       GAME STATE
       ===================================================== */

    let gameState = {
        version: VERSION,

        roomCode: "",

        hostId: "",

        started: false,

        turn: 0,

        currentPlayerIndex: 0,

        stateVersion: 0,

        updatedAt: Date.now(),

        players: [],

        history: [],

        currentEvent: null,

        currentChoice: null,

        world: {
            tension: 20,
            stability: 70,
            economy: 70,
            mediaHeat: 20,
            globalPopularity: 50
        }
    };


    let gameStarted = false;

    let aiBusy = false;

    let joiningRoom = false;

    let stateSequence = 0;

    let lastRenderedStateVersion = -1;


    /* =====================================================
       COUNTRY DATA
       ===================================================== */

    const COUNTRIES = [
        {
            id: "iran",
            name: "ایران",
            flag: "🇮🇷"
        },
        {
            id: "usa",
            name: "آمریکا",
            flag: "🇺🇸"
        },
        {
            id: "france",
            name: "فرانسه",
            flag: "🇫🇷"
        },
        {
            id: "germany",
            name: "آلمان",
            flag: "🇩🇪"
        },
        {
            id: "uk",
            name: "بریتانیا",
            flag: "🇬🇧"
        },
        {
            id: "japan",
            name: "ژاپن",
            flag: "🇯🇵"
        },
        {
            id: "china",
            name: "چین",
            flag: "🇨🇳"
        },
        {
            id: "turkey",
            name: "ترکیه",
            flag: "🇹🇷"
        },
        {
            id: "canada",
            name: "کانادا",
            flag: "🇨🇦"
        },
        {
            id: "italy",
            name: "ایتالیا",
            flag: "🇮🇹"
        },
        {
            id: "spain",
            name: "اسپانیا",
            flag: "🇪🇸"
        },
        {
            id: "india",
            name: "هند",
            flag: "🇮🇳"
        },
        {
            id: "brazil",
            name: "برزیل",
            flag: "🇧🇷"
        },
        {
            id: "australia",
            name: "استرالیا",
            flag: "🇦🇺"
        },
        {
            id: "egypt",
            name: "مصر",
            flag: "🇪🇬"
        },
        {
            id: "norway",
            name: "نروژ",
            flag: "🇳🇴"
        }
    ];


    const GEOGRAPHIES = [
        {
            id: "coast",
            name: "ساحلی",
            description: "دریا، بندر، تجارت و طوفان‌های احتمالی"
        },
        {
            id: "mountain",
            name: "کوهستانی",
            description: "ارتفاعات، سرمای شدید و مسیرهای دشوار"
        },
        {
            id: "desert",
            name: "بیابانی",
            description: "گرما، کم‌آبی و بحران انرژی"
        },
        {
            id: "temperate",
            name: "معتدل",
            description: "کشاورزی، شهرهای بزرگ و اقتصاد متنوع"
        },
        {
            id: "tropical",
            name: "گرمسیری",
            description: "رطوبت، بارندگی و پدیده‌های طبیعی"
        },
        {
            id: "island",
            name: "جزیره‌ای",
            description: "تجارت دریایی و وابستگی به مسیرهای کشتیرانی"
        }
    ];


    /* =====================================================
       HELPERS
       ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function safeText(value) {
        return String(value ?? "");
    }


    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    function randomFrom(array) {
        if (!Array.isArray(array) || !array.length) {
            return null;
        }

        return array[
            Math.floor(Math.random() * array.length)
        ];
    }


    function generateRoomCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let code = "";

        for (let i = 0; i < 6; i++) {
            code += chars[
                Math.floor(Math.random() * chars.length)
            ];
        }

        return code;
    }


    function deepClone(object) {
        try {
            return JSON.parse(JSON.stringify(object));
        } catch {
            return object;
        }
    }


    function getCountryName(id) {
        const country = COUNTRIES.find(
            item => item.id === id
        );

        return country ? country.name : id || "نامشخص";
    }


    function getCountryFlag(id) {
        const country = COUNTRIES.find(
            item => item.id === id
        );

        return country ? country.flag : "🌍";
    }


    function getGeographyName(id) {
        const geography = GEOGRAPHIES.find(
            item => item.id === id
        );

        return geography ? geography.name : id || "نامشخص";
    }


    function getLocalPlayer() {
        return gameState.players.find(
            player => player.id === localPlayer.id
        ) || null;
    }


    function getCurrentPlayer() {
        return gameState.players[
            gameState.currentPlayerIndex
        ] || null;
    }


    function isLocalTurn() {
        const current = getCurrentPlayer();

        return !!(
            current &&
            current.id === localPlayer.id
        );
    }


    function isHost() {
        return localPlayer.id === gameState.hostId;
    }


    function touchState() {
        gameState.stateVersion =
            Number(gameState.stateVersion || 0) + 1;

        gameState.updatedAt = Date.now();

        stateSequence = gameState.stateVersion;
    }


    /* =====================================================
       SCREEN SYSTEM
       ===================================================== */

    function setScreen(screenId) {
        document
            .querySelectorAll(".screen")
            .forEach(screen => {
                screen.classList.remove("active");
            });

        const target = $(screenId);

        if (target) {
            target.classList.add("active");
        }

        document.body.dataset.screen = screenId;
    }


    function showToast(message, type = "info") {
        const container = $("toastContainer");

        if (!container) {
            return;
        }

        const toast = document.createElement("div");

        toast.className =
            "toast toast-" + type;

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
    }


    function setLoading(show, text = "در حال پردازش...") {
        const loading = $("globalLoading");

        if (!loading) {
            return;
        }

        loading.classList.toggle("active", !!show);

        const label =
            loading.querySelector(".loading-text");

        if (label) {
            label.textContent = text;
        }
    }


    function setLobbyStatus(text) {
        const element = $("lobbyStatus");

        if (element) {
            element.textContent = text;
        }
    }


    /* =====================================================
       LOCAL SETUP
       ===================================================== */

    function readSetupForm() {
        const name =
            $("leaderName")?.value?.trim();

        const country =
            $("countrySelect")?.value;

        const geography =
            $("geographySelect")?.value;

        if (!name) {
            showToast(
                "اول اسم رئیس را وارد کن!",
                "error"
            );

            return false;
        }

        if (!country) {
            showToast(
                "یک کشور انتخاب کن!",
                "error"
            );

            return false;
        }

        if (!geography) {
            showToast(
                "جغرافیای کشور را انتخاب کن!",
                "error"
            );

            return false;
        }

        localPlayer.name = name;
        localPlayer.country = country;
        localPlayer.geography = geography;

        return true;
    }


    function initializeGameState() {
        gameState = {
            version: VERSION,

            roomCode: generateRoomCode(),

            hostId: localPlayer.id,

            started: false,

            turn: 0,

            currentPlayerIndex: 0,

            stateVersion: 1,

            updatedAt: Date.now(),

            players: [
                createPlayerFromLocal()
            ],

            history: [],

            currentEvent: null,

            currentChoice: null,

            world: {
                tension: 20,
                stability: 70,
                economy: 70,
                mediaHeat: 20,
                globalPopularity: 50
            }
        };

        stateSequence = 1;
    }


    function createPlayerFromLocal() {
        return {
            id: localPlayer.id,

            name: localPlayer.name,

            country: localPlayer.country,

            geography: localPlayer.geography,

            isHost: localPlayer.isHost,

            money: 100,

            electricity: 80,

            economy: 70,

            popularity: 60,

            relations: 50,

            sanctions: 0,

            stability: 70,

            crises: [],

            score: 0,

            alive: true,

            joinedAt: localPlayer.joinedAt
        };
    }


    /* =====================================================
       CHANNEL
       ===================================================== */

    async function createChannel(roomCode) {
        if (!supabase) {
            throw new Error(
                "Supabase در دسترس نیست."
            );
        }

        if (channel) {
            try {
                await supabase.removeChannel(channel);
            } catch {}
        }

        channel = supabase.channel(
            "political-room-" + roomCode,
            {
                config: {
                    broadcast: {
                        self: true
                    },
                    presence: {
                        key: localPlayer.id
                    }
                }
            }
        );

        registerChannelListeners();

        const result =
            await channel.subscribe(
                async status => {
                    console.log(
                        "Realtime:",
                        status
                    );

                    if (status === "SUBSCRIBED") {
                        await announcePresence();

                        if (isHost()) {
                            setTimeout(() => {
                                broadcastState();
                            }, 300);
                        }
                    }
                }
            );

        return result;
    }


    function registerChannelListeners() {
        if (!channel) {
            return;
        }


        /* ---------------------------------------------
           GAME STATE
           --------------------------------------------- */

        channel.on(
            "broadcast",
            {
                event: "game_state"
            },
            payload => {
                const incoming =
                    payload?.payload?.state;

                if (!incoming) {
                    return;
                }

                receiveGameState(incoming);
            }
        );


        /* ---------------------------------------------
           JOIN REQUEST
           --------------------------------------------- */

        channel.on(
            "broadcast",
            {
                event: "join_request"
            },
            payload => {
                if (!isHost()) {
                    return;
                }

                const request =
                    payload?.payload;

                if (!request?.player) {
                    return;
                }

                handleJoinRequest(
                    request.player
                );
            }
        );


        /* ---------------------------------------------
           JOIN RESPONSE
           --------------------------------------------- */

        channel.on(
            "broadcast",
            {
                event: "join_response"
            },
            payload => {
                const response =
                    payload?.payload;

                if (!response) {
                    return;
                }

                if (
                    response.targetId !==
                    localPlayer.id
                ) {
                    return;
                }

                if (response.accepted) {
                    receiveGameState(
                        response.state
                    );

                    showToast(
                        "با موفقیت وارد اتاق شدی!",
                        "success"
                    );
                } else {
                    joiningRoom = false;

                    showToast(
                        response.reason ||
                        "ورود به اتاق ممکن نبود.",
                        "error"
                    );
                }
            }
        );


        /* ---------------------------------------------
           PLAYER CHOICE
           --------------------------------------------- */

        channel.on(
            "broadcast",
            {
                event: "player_choice"
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

                processRemoteChoice(data);
            }
        );


        /* ---------------------------------------------
           FORCE START
           --------------------------------------------- */

        channel.on(
            "broadcast",
            {
                event: "game_started"
            },
            payload => {
                const state =
                    payload?.payload?.state;

                if (state) {
                    receiveGameState(state);
                }
            }
        );


        /* ---------------------------------------------
           PRESENCE
           --------------------------------------------- */

        channel.on(
            "presence",
            {
                event: "sync"
            },
            () => {
                renderLobby();

                if (isHost()) {
                    setTimeout(() => {
                        broadcastState();
                    }, 250);
                }
            }
        );

        channel.on(
            "presence",
            {
                event: "join"
            },
            () => {
                renderLobby();

                if (isHost()) {
                    setTimeout(() => {
                        broadcastState();
                    }, 250);
                }
            }
        );

        channel.on(
            "presence",
            {
                event: "leave"
            },
            () => {
                renderLobby();

                if (isHost()) {
                    setTimeout(() => {
                        broadcastState();
                    }, 250);
                }
            }
        );
    }


    /* =====================================================
       PRESENCE
       ===================================================== */

    async function announcePresence() {
        if (!channel) {
            return;
        }

        try {
            await channel.track({
                id: localPlayer.id,

                name: localPlayer.name,

                country: localPlayer.country,

                joinedAt: localPlayer.joinedAt,

                online: true
            });
        } catch (error) {
            console.warn(
                "Presence failed:",
                error
            );
        }
    }


    /* =====================================================
       BROADCAST
       ===================================================== */

    async function broadcast(event, payload) {
        if (!channel) {
            return;
        }

        try {
            await channel.send({
                type: "broadcast",

                event,

                payload
            });
        } catch (error) {
            console.error(
                "Broadcast error:",
                error
            );
        }
    }


    async function broadcastState() {
        if (!channel) {
            return;
        }

        await broadcast(
            "game_state",
            {
                state: deepClone(gameState)
            }
        );
    }


    /* =====================================================
       CREATE ROOM
       ===================================================== */

    async function createRoom() {
        if (!readSetupForm()) {
            return;
        }

        setLoading(
            true,
            "در حال ساخت اتاق..."
        );

        localPlayer.isHost = true;

        initializeGameState();

        try {
            await createChannel(
                gameState.roomCode
            );

            renderLobby();

            setScreen("lobbyScreen");

            showToast(
                "اتاق ساخته شد!",
                "success"
            );

            setLobbyStatus(
                "منتظر بازیکنان دیگر..."
            );

            await broadcastState();
        } catch (error) {
            console.error(error);

            showToast(
                "ساخت اتاق ناموفق بود.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }


    /* =====================================================
       JOIN ROOM
       ===================================================== */

    async function joinRoom() {
        const code =
            $("roomCodeInput")
                ?.value
                ?.trim()
                ?.toUpperCase();

        if (!code || code.length < 4) {
            showToast(
                "کد اتاق را وارد کن.",
                "error"
            );

            return;
        }

        if (!readSetupForm()) {
            return;
        }

        joiningRoom = true;

        setLoading(
            true,
            "در حال اتصال به اتاق..."
        );

        localPlayer.isHost = false;

        gameState.roomCode = code;

        try {
            await createChannel(code);

            await broadcast(
                "join_request",
                {
                    player: createPlayerFromLocal()
                }
            );

            setScreen("lobbyScreen");

            setLobbyStatus(
                "درخواست ورود ارسال شد..."
            );

            setTimeout(() => {
                if (joiningRoom) {
                    setLoading(false);
                }
            }, 2500);
        } catch (error) {
            console.error(error);

            joiningRoom = false;

            showToast(
                "اتصال به اتاق ناموفق بود.",
                "error"
            );

            setLoading(false);
        }
    }


    /* =====================================================
       JOIN REQUEST HANDLER
       ===================================================== */

    async function handleJoinRequest(player) {
        if (!isHost()) {
            return;
        }

        if (gameState.started) {
            await broadcast(
                "join_response",
                {
                    targetId: player.id,

                    accepted: false,

                    reason:
                        "بازی شروع شده و ورود بازیکن جدید ممکن نیست."
                }
            );

            return;
        }

        if (
            gameState.players.length >=
            MAX_PLAYERS
        ) {
            await broadcast(
                "join_response",
                {
                    targetId: player.id,

                    accepted: false,

                    reason:
                        "اتاق پر است."
                }
            );

            return;
        }

        const exists =
            gameState.players.some(
                p => p.id === player.id
            );

        if (!exists) {
            gameState.players.push({
                ...player,

                money: 100,

                electricity: 80,

                economy: 70,

                popularity: 60,

                relations: 50,

                sanctions: 0,

                stability: 70,

                crises: [],

                score: 0,

                alive: true
            });
        }

        touchState();

        await broadcast(
            "join_response",
            {
                targetId: player.id,

                accepted: true,

                state: deepClone(gameState)
            }
        );

        await broadcastState();

        renderLobby();

        showToast(
            `${player.name} وارد اتاق شد.`,
            "success"
        );
    }


    /* =====================================================
       RECEIVE STATE
       ===================================================== */

    function receiveGameState(incoming) {
        if (!incoming) {
            return;
        }

        const incomingVersion =
            Number(
                incoming.stateVersion || 0
            );

        const currentVersion =
            Number(
                gameState.stateVersion || 0
            );

        /*
         * جلوگیری از اینکه state قدیمی
         * وضعیت جدید را خراب کند.
         */

        if (
            incomingVersion <
            currentVersion
        ) {
            return;
        }

        gameState =
            deepClone(incoming);

        stateSequence =
            incomingVersion;

        lastRenderedStateVersion =
            incomingVersion;

        joiningRoom = false;

        renderAll();

        /*
         * مهم:
         * اگر بازی شروع شده، همه کلاینت‌ها
         * باید خودشان وارد gameScreen شوند.
         */

        if (
            gameState.started &&
            !gameStarted
        ) {
            gameStarted = true;

            setLoading(false);

            setScreen("gameScreen");

            setTimeout(() => {
                if (
                    gameState.currentEvent
                ) {
                    renderEvent(
                        gameState.currentEvent
                    );
                }
            }, 150);
        }

        if (!gameState.started) {
            gameStarted = false;

            if (
                document
                    .querySelector(
                        "#lobbyScreen.active"
                    ) === null &&
                !document
                    .querySelector(
                        "#mainMenu.active"
                    )
            ) {
                setScreen("lobbyScreen");
            }
        }
    }


    /* =====================================================
       LOBBY
       ===================================================== */

    function renderLobby() {
        const code =
            $("roomCodeDisplay");

        if (code) {
            code.textContent =
                gameState.roomCode || "------";
        }

        const count =
            $("playerCount");

        if (count) {
            count.textContent =
                `${gameState.players.length}/${MAX_PLAYERS}`;
        }

        const list =
            $("playersList");

        if (!list) {
            return;
        }

        list.innerHTML = "";

        gameState.players.forEach(
            (player, index) => {
                const item =
                    document.createElement("div");

                item.className =
                    "player-lobby-item";

                item.innerHTML = `
                    <div class="player-avatar">
                        ${safeText(
                            getCountryFlag(
                                player.country
                            )
                        )}
                    </div>

                    <div class="player-lobby-info">
                        <strong>
                            ${safeText(player.name)}
                        </strong>

                        <span>
                            ${safeText(
                                getCountryName(
                                    player.country
                                )
                            )}
                            ·
                            ${safeText(
                                getGeographyName(
                                    player.geography
                                )
                            )}
                        </span>
                    </div>

                    <div class="player-lobby-badge">
                        ${
                            player.id ===
                            gameState.hostId
                                ? "👑 میزبان"
                                : "بازیکن"
                        }
                    </div>
                `;

                list.appendChild(item);
            }
        );

        const startButton =
            $("startGameBtn");

        if (startButton) {
            startButton.disabled =
                !isHost() ||
                gameState.players.length < 1 ||
                gameState.started;

            startButton.style.display =
                isHost()
                    ? ""
                    : "none";
        }

        if (isHost()) {
            setLobbyStatus(
                gameState.players.length > 1
                    ? "همه آماده‌اند؟ بازی را شروع کن!"
                    : "منتظر بازیکنان دیگر..."
            );
        }
    }


    /* =====================================================
       START GAME
       ===================================================== */

    async function startGame() {
        if (!isHost()) {
            showToast(
                "فقط میزبان می‌تواند بازی را شروع کند.",
                "error"
            );

            return;
        }

        if (gameState.started) {
            return;
        }

        /*
         * اول state را تغییر می‌دهیم.
         * بعد broadcast می‌کنیم.
         * و مهم‌تر از همه:
         * میزبان خودش هم screen را عوض می‌کند.
         */

        gameState.started = true;

        gameState.turn = 1;

        gameState.currentPlayerIndex = 0;

        gameState.currentEvent = null;

        gameState.currentChoice = null;

        gameState.history = [];

        touchState();

        gameStarted = true;

        setScreen("gameScreen");

        renderAll();

        await broadcast(
            "game_started",
            {
                state: deepClone(gameState)
            }
        );

        await broadcastState();

        showToast(
            "بازی شروع شد! 🎬",
            "success"
        );

        setTimeout(() => {
            generateNextEvent();
        }, 700);
    }


    /* =====================================================
       EVENT GENERATION
       ===================================================== */

    async function generateNextEvent() {
        if (!isHost()) {
            return;
        }

        if (!gameState.started) {
            return;
        }

        if (aiBusy) {
            return;
        }

        const current =
            getCurrentPlayer();

        if (!current) {
            return;
        }

        aiBusy = true;

        showAIThinking(true);

        gameState.currentEvent = null;

        gameState.currentChoice = null;

        touchState();

        await broadcastState();

        try {
            let event = null;

            if (typeof AI_EVENT_FN === "function") {
                event =
                    await AI_EVENT_FN(
                        deepClone(gameState),
                        deepClone(
                            gameState.history
                        )
                    );
            }

            event =
                normalizeEvent(
                    event,
                    current
                );

            gameState.currentEvent = event;

            gameState.currentChoice = null;

            gameState.history.push({
                type: "event",

                turn: gameState.turn,

                event: deepClone(event),

                timestamp: Date.now()
            });

            if (
                gameState.history.length >
                80
            ) {
                gameState.history =
                    gameState.history.slice(-80);
            }

            touchState();

            renderAll();

            await broadcastState();
        } catch (error) {
            console.error(
                "AI event error:",
                error
            );

            const fallback =
                createFallbackEvent(
                    current
                );

            gameState.currentEvent =
                fallback;

            touchState();

            renderAll();

            await broadcastState();
        } finally {
            aiBusy = false;

            showAIThinking(false);
        }
    }


    /* =====================================================
       EVENT NORMALIZATION
       ===================================================== */

    function normalizeEvent(event, currentPlayer) {
        if (!event || typeof event !== "object") {
            return createFallbackEvent(
                currentPlayer
            );
        }

        const choices =
            Array.isArray(event.choices)
                ? event.choices
                : [];

        const cleanChoices =
            choices
                .slice(0, 3)
                .map(
                    (choice, index) => ({
                        id:
                            choice?.id ||
                            `choice_${index + 1}`,

                        title:
                            safeText(
                                choice?.title ||
                                `تصمیم ${index + 1}`
                            ),

                        description:
                            safeText(
                                choice?.description ||
                                "یک تصمیم مهم بگیر."
                            ),

                        risk:
                            safeText(
                                choice?.risk ||
                                "نامشخص"
                            ),

                        tone:
                            safeText(
                                choice?.tone ||
                                "neutral"
                            )
                    })
                );

        while (
            cleanChoices.length < 3
        ) {
            const index =
                cleanChoices.length + 1;

            cleanChoices.push({
                id:
                    `choice_${index}`,

                title:
                    [
                        "اقدام فوری",
                        "مذاکره",
                        "فعلاً صبر کنیم"
                    ][index - 1],

                description:
                    "این گزینه را برای مدیریت بحران انتخاب کن.",

                risk:
                    "متوسط",

                tone:
                    "neutral"
            });
        }

        return {
            id:
                safeText(
                    event.id ||
                    "event_" + Date.now()
                ),

            title:
                safeText(
                    event.title ||
                    "یک اتفاق عجیب در کشور رخ داده است!"
                ),

            description:
                safeText(
                    event.description ||
                    "مشاوران منتظر تصمیم رئیس هستند."
                ),

            type:
                safeText(
                    event.type ||
                    "political"
                ),

            category:
                safeText(
                    event.category ||
                    event.type ||
                    "government"
                ),

            severity:
                safeText(
                    event.severity ||
                    "medium"
                ),

            targetPlayerId:
                event.targetPlayerId ||
                currentPlayer.id,

            actorPlayerId:
                event.actorPlayerId ||
                null,

            news:
                safeText(
                    event.news ||
                    event.title ||
                    "خبر فوری"
                ),

            choices:
                cleanChoices,

            timestamp:
                Date.now()
        };
    }


    function createFallbackEvent(player) {
        const templates = [
            {
                title:
                    "جلسه اضطراری کابینه",
                description:
                    "سه مشاور با سه گزارش متفاوت وارد دفتر شده‌اند و هر سه اصرار دارند که گزارش خودشان مهم‌تر است.",
                category:
                    "government"
            },
            {
                title:
                    "بحران عجیب اقتصادی",
                description:
                    "بازار امروز رفتاری غیرقابل توضیح دارد و وزیر اقتصاد درخواست جلسه فوری کرده است.",
                category:
                    "economy"
            },
            {
                title:
                    "خبر فوری رسانه‌ها",
                description:
                    "یک خبر غیرمنتظره در شبکه‌های خبری پخش شده و همه منتظر واکنش رئیس هستند.",
                category:
                    "media"
            }
        ];

        const template =
            randomFrom(templates);

        return {
            id:
                "fallback_" + Date.now(),

            title:
                template.title,

            description:
                template.description,

            type:
                template.category,

            category:
                template.category,

            severity:
                "medium",

            targetPlayerId:
                player.id,

            actorPlayerId:
                null,

            news:
                template.title,

            choices: [
                {
                    id: "choice_1",
                    title: "واکنش فوری",
                    description:
                        "دولت سریعاً وارد عمل شود.",
                    risk: "متوسط",
                    tone: "aggressive"
                },
                {
                    id: "choice_2",
                    title: "مذاکره و آرام‌سازی",
                    description:
                        "قبل از هر تصمیم، طرف‌های مختلف را دعوت کنیم.",
                    risk: "کم",
                    tone: "diplomatic"
                },
                {
                    id: "choice_3",
                    title: "فعلاً سکوت",
                    description:
                        "فعلاً هیچ واکنش رسمی نشان ندهیم.",
                    risk: "نامشخص",
                    tone: "neutral"
                }
            ],

            timestamp:
                Date.now()
        };
    }


    /* =====================================================
       EVENT RENDER
       ===================================================== */

    function renderEvent(event) {
        if (!event) {
            return;
        }

        const title =
            $("eventTitle");

        if (title) {
            title.textContent =
                event.title;
        }

        const description =
            $("eventDescription");

        if (description) {
            description.textContent =
                event.description;
        }

        const news =
            $("newsHeadline");

        if (news) {
            news.textContent =
                event.news ||
                event.title;
        }

        const category =
            $("newsCategory");

        if (category) {
            category.textContent =
                event.category ||
                "خبر فوری";
        }

        const cards =
            $("decisionCards");

        if (!cards) {
            return;
        }

        cards.innerHTML = "";

        const current =
            getCurrentPlayer();

        const canChoose =
            !!(
                current &&
                current.id ===
                    localPlayer.id
            );

        event.choices.forEach(
            (choice, index) => {
                const card =
                    document.createElement("button");

                card.type = "button";

                card.className =
                    "decision-card";

                card.dataset.decisionCard =
                    choice.id;

                card.dataset.index =
                    String(index);

                if (!canChoose) {
                    card.classList.add(
                        "disabled"
                    );
                }

                card.innerHTML = `
                    <span class="decision-number">
                        ${index + 1}
                    </span>

                    <span class="decision-content">
                        <strong>
                            ${safeText(choice.title)}
                        </strong>

                        <small>
                            ${safeText(choice.description)}
                        </small>
                    </span>

                    <span class="decision-risk">
                        ${safeText(choice.risk)}
                    </span>
                `;

                if (canChoose) {
                    card.addEventListener(
                        "click",
                        () => {
                            chooseDecision(
                                choice.id
                            );
                        }
                    );
                }

                cards.appendChild(card);
            }
        );

        const turnStatus =
            $("turnStatus");

        if (turnStatus) {
            turnStatus.textContent =
                canChoose
                    ? "نوبت توست — تصمیم بگیر"
                    : `نوبت ${current?.name || "بازیکن دیگر"} است`;
        }

        const office =
            window.Office3D;

        if (
            office &&
            typeof office.showEvent ===
                "function"
        ) {
            office.showEvent(event);
        }
    }


    /* =====================================================
       CHOOSE DECISION
       ===================================================== */

    async function chooseDecision(choiceId) {
        if (!gameState.currentEvent) {
            return;
        }

        if (!isLocalTurn()) {
            showToast(
                "الان نوبت تو نیست!",
                "error"
            );

            return;
        }

        const choice =
            gameState.currentEvent.choices
                .find(
                    item =>
                        item.id ===
                        choiceId
                );

        if (!choice) {
            return;
        }

        /*
         * میزبان مستقیماً پردازش می‌کند.
         * بازیکن دیگر انتخاب را برای میزبان می‌فرستد.
         */

        const payload = {
            playerId:
                localPlayer.id,

            eventId:
                gameState.currentEvent.id,

            choice:
                deepClone(choice),

            timestamp:
                Date.now()
        };

        if (isHost()) {
            await processRemoteChoice(
                payload
            );
        } else {
            await broadcast(
                "player_choice",
                payload
            );

            lockDecisionCards(
                choiceId
            );

            showToast(
                "تصمیمت ارسال شد...",
                "success"
            );
        }
    }


    function lockDecisionCards(selectedId) {
        document
            .querySelectorAll(
                "[data-decision-card]"
            )
            .forEach(card => {
                card.disabled = true;

                if (
                    card.dataset.decisionCard ===
                    selectedId
                ) {
                    card.classList.add(
                        "selected"
                    );
                } else {
                    card.classList.add(
                        "retreat"
                    );
                }
            });
    }


    /* =====================================================
       REMOTE CHOICE
       ===================================================== */

    async function processRemoteChoice(data) {
        if (!isHost()) {
            return;
        }

        if (!gameState.currentEvent) {
            return;
        }

        if (
            data.eventId !==
            gameState.currentEvent.id
        ) {
            return;
        }

        const current =
            getCurrentPlayer();

        if (
            !current ||
            current.id !== data.playerId
        ) {
            return;
        }

        const choice =
            gameState.currentEvent.choices
                .find(
                    item =>
                        item.id ===
                        data.choice?.id
                );

        if (!choice) {
            return;
        }

        await processChoice(
            current,
            choice
        );
    }


    /* =====================================================
       PROCESS CHOICE
       ===================================================== */

    async function processChoice(
        player,
        choice
    ) {
        if (!isHost()) {
            return;
        }

        if (aiBusy) {
            return;
        }

        aiBusy = true;

        showAIThinking(true);

        gameState.currentChoice = {
            playerId:
                player.id,

            choice:
                deepClone(choice)
        };

        touchState();

        renderAll();

        await broadcastState();

        try {
            let consequence = null;

            if (
                typeof AI_CONSEQUENCE_FN ===
                "function"
            ) {
                consequence =
                    await AI_CONSEQUENCE_FN(
                        deepClone(gameState),
                        deepClone(
                            gameState.history
                        ),
                        {
                            player:
                                deepClone(player),

                            country:
                                getCountryName(
                                    player.country
                                ),

                            choice:
                                deepClone(choice)
                        }
                    );
            }

            consequence =
                normalizeConsequence(
                    consequence
                );

            applyConsequence(
                player.id,
                consequence
            );

            gameState.history.push({
                type:
                    "decision",

                turn:
                    gameState.turn,

                playerId:
                    player.id,

                playerName:
                    player.name,

                choice:
                    deepClone(choice),

                consequence:
                    deepClone(consequence),

                timestamp:
                    Date.now()
            });

            touchState();

            renderAll();

            await broadcastState();

            showConsequence(
                consequence
            );

            setTimeout(
                async () => {
                    await finishTurn();
                },
                3200
            );
        } catch (error) {
            console.error(
                "Consequence error:",
                error
            );

            const fallback =
                createFallbackConsequence(
                    choice
                );

            applyConsequence(
                player.id,
                fallback
            );

            gameState.history.push({
                type:
                    "decision",

                turn:
                    gameState.turn,

                playerId:
                    player.id,

                choice:
                    deepClone(choice),

                consequence:
                    deepClone(fallback),

                timestamp:
                    Date.now()
            });

            touchState();

            renderAll();

            await broadcastState();

            showConsequence(
                fallback
            );

            setTimeout(
                async () => {
                    await finishTurn();
                },
                3200
            );
        } finally {
            aiBusy = false;

            showAIThinking(false);
        }
    }
  /* =====================================================
   REPUBLIC OF ABSURDITY
   GAME ENGINE v5.0
   PART 2 / 2
   ===================================================== */

    /* =====================================================
       CONSEQUENCE NORMALIZATION
       ===================================================== */

    function normalizeConsequence(consequence) {
        if (!consequence || typeof consequence !== "object") {
            return createFallbackConsequence(
                gameState.currentChoice?.choice
            );
        }

        const rawEffects =
            consequence.effects || {};

        const effects = {
            money: Number(rawEffects.money || 0),
            electricity: Number(rawEffects.electricity || 0),
            economy: Number(rawEffects.economy || 0),
            popularity: Number(rawEffects.popularity || 0),
            relations: Number(rawEffects.relations || 0),
            sanctions: Number(rawEffects.sanctions || 0),
            stability: Number(rawEffects.stability || 0)
        };

        const relationChanges =
            consequence.relationChanges &&
            typeof consequence.relationChanges === "object"
                ? consequence.relationChanges
                : {};

        return {
            title:
                safeText(
                    consequence.title ||
                    "نتیجه تصمیم"
                ),

            story:
                safeText(
                    consequence.story ||
                    "تصمیم رئیس پیامدهایی به همراه داشت."
                ),

            news:
                safeText(
                    consequence.news ||
                    consequence.title ||
                    "خبر فوری"
                ),

            effects,

            relationChanges,

            addCrisis:
                consequence.addCrisis || null,

            resolveCrisis:
                consequence.resolveCrisis || null,

            nextEventHint:
                safeText(
                    consequence.nextEventHint || ""
                )
        };
    }


    function createFallbackConsequence(choice) {
        return {
            title:
                "تصمیم ثبت شد",

            story:
                `رئیس تصمیم «${safeText(
                    choice?.title || "تصمیم"
                )}» را اجرا کرد. اوضاع فعلاً تحت کنترل است، اما مشاوران می‌گویند ماجرا هنوز تمام نشده.`,

            news:
                "خبر فوری: دولت تصمیم مهمی اتخاذ کرد.",

            effects: {
                money: -3,
                electricity: 0,
                economy: 2,
                popularity: 1,
                relations: 1,
                sanctions: 0,
                stability: 1
            },

            relationChanges: {},

            addCrisis: null,

            resolveCrisis: null,

            nextEventHint:
                "واکنش رسانه‌ها ممکن است در نوبت بعدی ظاهر شود."
        };
    }


    /* =====================================================
       APPLY CONSEQUENCE
       ===================================================== */

    function applyConsequence(
        playerId,
        consequence
    ) {
        const player =
            gameState.players.find(
                p => p.id === playerId
            );

        if (!player) {
            return;
        }

        const effects =
            consequence.effects || {};

        player.money =
            clamp(
                player.money +
                Number(effects.money || 0),
                -100,
                1000
            );

        player.electricity =
            clamp(
                player.electricity +
                Number(effects.electricity || 0),
                0,
                100
            );

        player.economy =
            clamp(
                player.economy +
                Number(effects.economy || 0),
                0,
                100
            );

        player.popularity =
            clamp(
                player.popularity +
                Number(effects.popularity || 0),
                0,
                100
            );

        player.relations =
            clamp(
                player.relations +
                Number(effects.relations || 0),
                0,
                100
            );

        player.sanctions =
            clamp(
                player.sanctions +
                Number(effects.sanctions || 0),
                0,
                100
            );

        player.stability =
            clamp(
                player.stability +
                Number(effects.stability || 0),
                0,
                100
            );


        /* ---------------------------------------------
           CRISIS
           --------------------------------------------- */

        if (!Array.isArray(player.crises)) {
            player.crises = [];
        }

        if (consequence.addCrisis) {
            const crisis =
                typeof consequence.addCrisis === "string"
                    ? {
                        id:
                            "crisis_" +
                            Date.now(),
                        title:
                            consequence.addCrisis,
                        severity:
                            "medium"
                    }
                    : {
                        id:
                            consequence.addCrisis.id ||
                            "crisis_" + Date.now(),

                        title:
                            consequence.addCrisis.title ||
                            "بحران جدید",

                        severity:
                            consequence.addCrisis.severity ||
                            "medium"
                    };

            const exists =
                player.crises.some(
                    c => c.title === crisis.title
                );

            if (!exists) {
                player.crises.push(crisis);
            }
        }

        if (consequence.resolveCrisis) {
            const title =
                typeof consequence.resolveCrisis === "string"
                    ? consequence.resolveCrisis
                    : consequence.resolveCrisis.title;

            player.crises =
                player.crises.filter(
                    crisis =>
                        crisis.title !== title
                );
        }


        /* ---------------------------------------------
           RELATIONS
           --------------------------------------------- */

        applyRelations(
            playerId,
            consequence.relationChanges
        );


        /* ---------------------------------------------
           SCORE
           --------------------------------------------- */

        player.score =
            calculatePlayerScore(player);
    }


    function applyRelations(
        sourcePlayerId,
        relationChanges
    ) {
        if (
            !relationChanges ||
            typeof relationChanges !== "object"
        ) {
            return;
        }

        Object.entries(
            relationChanges
        ).forEach(
            ([targetId, value]) => {
                const target =
                    gameState.players.find(
                        p => p.id === targetId
                    );

                if (!target) {
                    return;
                }

                const change =
                    Number(value || 0);

                const source =
                    gameState.players.find(
                        p => p.id === sourcePlayerId
                    );

                if (source) {
                    source.relations =
                        clamp(
                            source.relations +
                            change,
                            0,
                            100
                        );
                }

                target.relations =
                    clamp(
                        target.relations +
                        Math.round(change * 0.5),
                        0,
                        100
                    );
            }
        );
    }


    /* =====================================================
       WORLD SIMULATION
       ===================================================== */

    function simulateWorld() {
        const world =
            gameState.world;

        if (!world) {
            return;
        }

        const activePlayers =
            gameState.players.filter(
                p => p.alive !== false
            );

        if (!activePlayers.length) {
            return;
        }

        let tensionDelta =
            Math.floor(
                Math.random() * 7
            ) - 3;

        let stabilityDelta =
            Math.floor(
                Math.random() * 5
            ) - 2;

        let mediaDelta =
            Math.floor(
                Math.random() * 7
            ) - 2;


        activePlayers.forEach(
            player => {
                if (player.sanctions > 0) {
                    player.economy =
                        clamp(
                            player.economy -
                            1,
                            0,
                            100
                        );
                }

                if (player.electricity < 25) {
                    player.economy =
                        clamp(
                            player.economy -
                            2,
                            0,
                            100
                        );
                }

                if (player.popularity < 20) {
                    player.stability =
                        clamp(
                            player.stability -
                            1,
                            0,
                            100
                        );
                }

                player.score =
                    calculatePlayerScore(
                        player
                    );
            }
        );


        world.tension =
            clamp(
                world.tension +
                tensionDelta,
                0,
                100
            );

        world.stability =
            clamp(
                world.stability +
                stabilityDelta,
                0,
                100
            );

        world.mediaHeat =
            clamp(
                world.mediaHeat +
                mediaDelta,
                0,
                100
            );


        world.economy =
            Math.round(
                activePlayers.reduce(
                    (sum, p) =>
                        sum +
                        p.economy,
                    0
                ) /
                activePlayers.length
            );


        world.globalPopularity =
            Math.round(
                activePlayers.reduce(
                    (sum, p) =>
                        sum +
                        p.popularity,
                    0
                ) /
                activePlayers.length
            );
    }


    /* =====================================================
       FINISH TURN
       ===================================================== */

    async function finishTurn() {
        if (!isHost()) {
            return;
        }

        gameState.currentEvent = null;

        gameState.currentChoice = null;

        simulateWorld();

        /*
         * بررسی پایان بازی
         */

        if (
            gameState.turn >= MAX_TURNS
        ) {
            await endGame(
                "تعداد نوبت‌ها به پایان رسید."
            );

            return;
        }

        /*
         * بازیکن بعدی
         */

        gameState.currentPlayerIndex =
            (
                gameState.currentPlayerIndex +
                1
            ) %
            gameState.players.length;

        gameState.turn += 1;

        touchState();

        renderAll();

        await broadcastState();

        /*
         * کمی مکث برای حس سینمایی
         */

        setTimeout(
            () => {
                generateNextEvent();
            },
            900
        );
    }


    /* =====================================================
       SCORE
       ===================================================== */

    function calculatePlayerScore(player) {
        if (!player) {
            return 0;
        }

        const money =
            Math.max(
                0,
                player.money
            );

        const score =
            Math.round(
                player.popularity * 1.5 +
                player.economy * 1.2 +
                player.stability * 1.1 +
                player.relations * 0.7 +
                player.electricity * 0.4 +
                money * 0.15 -
                player.sanctions * 1.2 -
                player.crises.length * 4
            );

        return Math.max(
            0,
            score
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

        if (!overlay) {
            return;
        }

        const title =
            overlay.querySelector(
                ".consequence-title"
            );

        const story =
            overlay.querySelector(
                ".consequence-story"
            );

        const news =
            overlay.querySelector(
                ".consequence-news"
            );

        if (title) {
            title.textContent =
                consequence.title;
        }

        if (story) {
            story.textContent =
                consequence.story;
        }

        if (news) {
            news.textContent =
                consequence.news;
        }

        const effects =
            overlay.querySelector(
                ".consequence-effects"
            );

        if (effects) {
            effects.innerHTML = "";

            Object.entries(
                consequence.effects || {}
            ).forEach(
                ([key, value]) => {
                    const number =
                        Number(value || 0);

                    if (!number) {
                        return;
                    }

                    const item =
                        document.createElement("span");

                    item.className =
                        number > 0
                            ? "effect-positive"
                            : "effect-negative";

                    const labels = {
                        money: "💰 پول",
                        electricity: "⚡ برق",
                        economy: "📈 اقتصاد",
                        popularity: "⭐ محبوبیت",
                        relations: "🤝 روابط",
                        sanctions: "⚠️ تحریم",
                        stability: "🛡️ ثبات"
                    };

                    item.textContent =
                        `${labels[key] || key}: ${
                            number > 0
                                ? "+"
                                : ""
                        }${number}`;

                    effects.appendChild(item);
                }
            );
        }

        overlay.classList.add("active");

        setTimeout(() => {
            overlay.classList.remove("active");
        }, 3000);
    }


    /* =====================================================
       AI THINKING
       ===================================================== */

    function showAIThinking(show) {
        const element =
            $("aiThinking");

        if (!element) {
            return;
        }

        element.classList.toggle(
            "active",
            !!show
        );
    }


    /* =====================================================
       DASHBOARD
       ===================================================== */

    function renderDashboard() {
        const player =
            getLocalPlayer();

        if (!player) {
            return;
        }

        const values = {
            money:
                player.money,

            electricity:
                player.electricity,

            economy:
                player.economy,

            popularity:
                player.popularity,

            relations:
                player.relations,

            sanctions:
                player.sanctions,

            stability:
                player.stability
        };


        Object.entries(values)
            .forEach(
                ([key, value]) => {
                    const direct =
                        $(
                            key +
                            "Value"
                        );

                    if (direct) {
                        direct.textContent =
                            Math.round(value);
                    }

                    const bar =
                        $(
                            key +
                            "Bar"
                        );

                    if (bar) {
                        bar.style.width =
                            `${clamp(
                                Number(value),
                                0,
                                100
                            )}%`;
                    }
                }
            );


        const turn =
            $("turnNumber");

        if (turn) {
            turn.textContent =
                gameState.turn;
        }


        const current =
            getCurrentPlayer();

        const currentName =
            $("currentPlayerName");

        if (currentName) {
            currentName.textContent =
                current
                    ? current.name
                    : "—";
        }


        const country =
            $("playerCountry");

        if (country) {
            country.textContent =
                `${getCountryFlag(
                    player.country
                )} ${getCountryName(
                    player.country
                )}`;
        }
    }


    /* =====================================================
       WORLD STATUS
       ===================================================== */

    function renderWorldStatus() {
        const world =
            gameState.world;

        if (!world) {
            return;
        }

        const map = {
            worldTension:
                world.tension,

            worldStability:
                world.stability,

            worldEconomy:
                world.economy,

            mediaHeat:
                world.mediaHeat
        };


        Object.entries(map)
            .forEach(
                ([id, value]) => {
                    const element =
                        $(id);

                    if (element) {
                        element.textContent =
                            Math.round(value);
                    }

                    const bar =
                        $(id + "Bar");

                    if (bar) {
                        bar.style.width =
                            `${clamp(
                                Number(value),
                                0,
                                100
                            )}%`;
                    }
                }
            );
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

        const headline =
            $("newsHeadline");

        if (headline) {
            headline.textContent =
                event.news ||
                event.title;
        }

        const category =
            $("newsCategory");

        if (category) {
            category.textContent =
                event.category ||
                "خبر فوری";
        }

        const ticker =
            $("newsTicker");

        if (ticker) {
            ticker.textContent =
                `خبر فوری • ${
                    event.title
                } • جمهوری مسخره‌ها`;
        }
    }


    /* =====================================================
       FULL RENDER
       ===================================================== */

    function renderAll() {
        renderLobby();

        renderDashboard();

        renderWorldStatus();

        renderNews();

        if (gameState.currentEvent) {
            renderEvent(
                gameState.currentEvent
            );
        }

        const current =
            getCurrentPlayer();

        const turnStatus =
            $("turnStatus");

        if (turnStatus && current) {
            turnStatus.textContent =
                current.id === localPlayer.id
                    ? "نوبت توست"
                    : `نوبت ${current.name}`;
        }
    }


    /* =====================================================
       END GAME
       ===================================================== */

    async function endGame(reason) {
        if (!isHost()) {
            return;
        }

        gameState.started = false;

        gameState.currentEvent = null;

        gameState.currentChoice = null;

        gameState.players.forEach(
            player => {
                player.score =
                    calculatePlayerScore(
                        player
                    );
            }
        );

        gameState.endReason =
            reason ||
            "بازی به پایان رسید.";

        touchState();

        gameStarted = false;

        await broadcastState();

        renderRanking();

        setScreen("endScreen");
    }


    function renderRanking() {
        const container =
            $("rankingList");

        if (!container) {
            return;
        }

        const players =
            [...gameState.players]
                .sort(
                    (a, b) =>
                        calculatePlayerScore(b) -
                        calculatePlayerScore(a)
                );

        container.innerHTML = "";

        players.forEach(
            (player, index) => {
                const item =
                    document.createElement("div");

                item.className =
                    "ranking-item";

                item.innerHTML = `
                    <div class="ranking-position">
                        ${
                            index === 0
                                ? "🏆"
                                : index + 1
                        }
                    </div>

                    <div class="ranking-country">
                        ${safeText(
                            getCountryFlag(
                                player.country
                            )
                        )}
                    </div>

                    <div class="ranking-info">
                        <strong>
                            ${safeText(
                                player.name
                            )}
                        </strong>

                        <span>
                            ${safeText(
                                getCountryName(
                                    player.country
                                )
                            )}
                        </span>
                    </div>

                    <div class="ranking-score">
                        ${calculatePlayerScore(
                            player
                        )}
                    </div>
                `;

                container.appendChild(item);
            }
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

            showToast(
                "کد اتاق کپی شد 📋",
                "success"
            );
        } catch {
            showToast(
                `کد اتاق: ${code}`,
                "info"
            );
        }
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    function bindNavigation() {

        /* Main menu create */

        const createButton =
            $("createGameBtn") ||
            $("startGameBtn");

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


        /* Setup confirmation */

        const confirmSetup =
            $("confirmSetupBtn");

        if (confirmSetup) {
            confirmSetup.addEventListener(
                "click",
                () => {
                    if (!readSetupForm()) {
                        return;
                    }

                    setScreen(
                        "lobbyScreen"
                    );

                    createRoom();
                }
            );
        }


        /* Join button */

        const joinButton =
            $("joinGameBtn");

        if (joinButton) {
            joinButton.addEventListener(
                "click",
                () => {
                    setScreen(
                        "joinScreen"
                    );
                }
            );
        }


        /* Join confirmation */

        const joinConfirm =
            $("joinConfirmBtn");

        if (joinConfirm) {
            joinConfirm.addEventListener(
                "click",
                () => {
                    joinRoom();
                }
            );
        }


        /* Start game in lobby */

        const lobbyStart =
            $("startGameBtn");

        if (
            lobbyStart &&
            lobbyStart !== createButton
        ) {
            lobbyStart.addEventListener(
                "click",
                () => {
                    startGame();
                }
            );
        }


        /* Copy room */

        const copyButton =
            $("copyRoomBtn");

        if (copyButton) {
            copyButton.addEventListener(
                "click",
                copyRoomCode
            );
        }


        /* Back buttons */

        document
            .querySelectorAll(
                "[data-back]"
            )
            .forEach(
                button => {
                    button.addEventListener(
                        "click",
                        () => {
                            setScreen(
                                button.dataset.back
                            );
                        }
                    );
                }
            );


        /* Restart */

        const restart =
            $("restartGameBtn");

        if (restart) {
            restart.addEventListener(
                "click",
                () => {
                    location.reload();
                }
            );
        }
    }


    /* =====================================================
       SELECT OPTIONS
       ===================================================== */

    function populateSelectors() {
        const countrySelect =
            $("countrySelect");

        if (countrySelect) {
            countrySelect.innerHTML =
                `<option value="">
                    انتخاب کشور
                </option>`;

            COUNTRIES.forEach(
                country => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        country.id;

                    option.textContent =
                        `${country.flag} ${country.name}`;

                    countrySelect.appendChild(
                        option
                    );
                }
            );
        }


        const geographySelect =
            $("geographySelect");

        if (geographySelect) {
            geographySelect.innerHTML =
                `<option value="">
                    انتخاب جغرافیا
                </option>`;

            GEOGRAPHIES.forEach(
                geography => {
                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        geography.id;

                    option.textContent =
                        geography.name;

                    option.title =
                        geography.description;

                    geographySelect.appendChild(
                        option
                    );
                }
            );
        }
    }


    /* =====================================================
       BOOT
       ===================================================== */

    function boot() {
        populateSelectors();

        bindNavigation();

        const bootScreen =
            $("bootScreen");

        if (bootScreen) {
            setTimeout(
                () => {
                    bootScreen.classList.add(
                        "hidden"
                    );

                    setScreen(
                        "mainMenu"
                    );
                },
                900
            );
        } else {
            setScreen(
                "mainMenu"
            );
        }

        console.log(
            `%cRepublic of Absurdity v${VERSION}`,
            "font-size:20px;font-weight:bold"
        );

        console.log(
            "Game engine initialized."
        );
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.RepublicGame = {

        version: VERSION,

        getState() {
            return deepClone(
                gameState
            );
        },

        getLocalPlayer() {
            return deepClone(
                getLocalPlayer()
            );
        },

        getCurrentPlayer() {
            return deepClone(
                getCurrentPlayer()
            );
        },

        isHost() {
            return isHost();
        },

        isLocalTurn() {
            return isLocalTurn();
        },

        showToast,

        setScreen,

        generateNextEvent,

        startGame,

        createRoom,

        joinRoom,

        getCountryName,

        getGeographyName
    };


    /* =====================================================
       ERROR PROTECTION
       ===================================================== */

    window.addEventListener(
        "error",
        event => {
            console.error(
                "Game runtime error:",
                event.error ||
                event.message
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "Unhandled promise:",
                event.reason
            );
        }
    );


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            boot
        );
    } else {
        boot();
    }

})();