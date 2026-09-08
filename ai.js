/* =========================================================
   REPUBLIC OF ABSURDITY
   AI DIRECTOR v5.0
   Political Events + Consequences
   Cloudflare Worker + HuggingFace
   ========================================================= */

(() => {
    "use strict";

    const VERSION = "5.0";

    const AI_ENDPOINT =
        "https://political-game-ai.tm1190128.workers.dev/";

    const MAX_HISTORY = 12;

    /* =====================================================
       HELPERS
       ===================================================== */

    function safeString(value, fallback = "") {
        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value).slice(0, 1000);
    }

    function number(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n)
            ? n
            : fallback;
    }

    function clamp(value, min, max) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }

    function cleanHistory(history) {
        if (!Array.isArray(history)) {
            return [];
        }

        return history
            .slice(-MAX_HISTORY)
            .map(item => ({
                title: safeString(
                    item?.title,
                    "رویداد"
                ),
                type: safeString(
                    item?.type,
                    "government"
                ),
                description: safeString(
                    item?.description
                )
            }));
    }

    /* =====================================================
       STATE NORMALIZATION
       ===================================================== */

    function normalizePlayer(player) {
        if (!player) {
            return {
                id: "",
                name: "رئیس ناشناس",
                country: "کشور ناشناس",
                geography: "نامشخص",
                money: 50,
                electricity: 50,
                economy: 50,
                popularity: 50,
                relations: 50,
                sanctions: 0
            };
        }

        return {
            id: safeString(player.id),
            name: safeString(
                player.name,
                "رئیس ناشناس"
            ),
            country: safeString(
                player.country,
                "کشور ناشناس"
            ),
            geography: safeString(
                player.geography,
                "نامشخص"
            ),

            money: number(
                player.money,
                50
            ),

            electricity: number(
                player.electricity,
                50
            ),

            economy: number(
                player.economy,
                50
            ),

            popularity: number(
                player.popularity,
                50
            ),

            relations: number(
                player.relations,
                50
            ),

            sanctions: number(
                player.sanctions,
                0
            )
        };
    }

    function buildStateForAI(gameState) {
        const players =
            Array.isArray(
                gameState?.players
            )
                ? gameState.players
                : [];

        const currentIndex =
            number(
                gameState?.currentPlayerIndex,
                0
            );

        const currentPlayer =
            players[currentIndex] ||
            players[0] ||
            null;

        return {
            turn: number(
                gameState?.turn,
                1
            ),

            maxTurns: number(
                gameState?.maxTurns,
                30
            ),

            currentPlayer:
                normalizePlayer(
                    currentPlayer
                ),

            players:
                players.map(
                    normalizePlayer
                ),

            world:
                gameState?.world || {
                    stability: 50,
                    globalEconomy: 50,
                    tension: 30
                },

            activeCrises:
                Array.isArray(
                    gameState?.activeCrises
                )
                    ? gameState.activeCrises
                    : [],

            history:
                cleanHistory(
                    gameState?.history
                )
        };
    }

    /* =====================================================
       WORKER REQUEST
       ===================================================== */

    async function requestAI(
        mode,
        payload
    ) {
        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                25000
            );

        try {
            const response =
                await fetch(
                    AI_ENDPOINT,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            mode,
                            ...payload
                        }),

                        signal:
                            controller.signal
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "AI server error: " +
                    response.status
                );
            }

            const data =
                await response.json();

            if (
                !data ||
                typeof data !==
                    "object"
            ) {
                throw new Error(
                    "Invalid AI response."
                );
            }

            return data;
        } finally {
            clearTimeout(timeout);
        }
    }

    /* =====================================================
       EVENT NORMALIZATION
       ===================================================== */

    function normalizeEffects(
        effects
    ) {
        const source =
            effects &&
            typeof effects === "object"
                ? effects
                : {};

        return {
            money: clamp(
                number(
                    source.money,
                    0
                ),
                -100,
                100
            ),

            electricity: clamp(
                number(
                    source.electricity,
                    0
                ),
                -100,
                100
            ),

            economy: clamp(
                number(
                    source.economy,
                    0
                ),
                -100,
                100
            ),

            popularity: clamp(
                number(
                    source.popularity,
                    0
                ),
                -100,
                100
            ),

            relations: clamp(
                number(
                    source.relations,
                    0
                ),
                -100,
                100
            ),

            sanctions: clamp(
                number(
                    source.sanctions,
                    0
                ),
                -100,
                100
            )
        };
    }

    function normalizeChoice(
        choice,
        index
    ) {
        if (
            typeof choice ===
            "string"
        ) {
            return {
                id:
                    "choice_" +
                    (index + 1),

                title:
                    choice,

                description:
                    "یک تصمیم سیاسی پرریسک.",

                risk:
                    index === 0
                        ? "low"
                        : index === 1
                        ? "medium"
                        : "high",

                effects:
                    {}
            };
        }

        return {
            id:
                safeString(
                    choice?.id,
                    "choice_" +
                        (index + 1)
                ),

            title:
                safeString(
                    choice?.title,
                    "تصمیم " +
                        (index + 1)
                ),

            description:
                safeString(
                    choice?.description,
                    "تصمیم سیاسی"
                ),

            risk:
                safeString(
                    choice?.risk,
                    "medium"
                ),

            effects:
                normalizeEffects(
                    choice?.effects
                )
        };
    }

    function normalizeEvent(
        event,
        gameState
    ) {
        const source =
            event &&
            typeof event === "object"
                ? event
                : {};

        let choices =
            Array.isArray(
                source.choices
            )
                ? source.choices
                : [];

        choices =
            choices
                .slice(0, 3)
                .map(
                    normalizeChoice
                );

        while (
            choices.length < 3
        ) {
            choices.push(
                normalizeChoice(
                    null,
                    choices.length
                )
            );
        }

        const player =
            gameState?.players?.[
                gameState?.currentPlayerIndex ||
                0
            ];

        return {
            id:
                safeString(
                    source.id,
                    "event_" +
                        Date.now()
                ),

            title:
                safeString(
                    source.title,
                    "بحران جدید در کشور"
                ),

            description:
                safeString(
                    source.description,
                    "یک اتفاق غیرمنتظره دولت را مجبور به تصمیم‌گیری کرده است."
                ),

            type:
                safeString(
                    source.type,
                    "government"
                ),

            category:
                safeString(
                    source.category,
                    source.type ||
                        "government"
                ),

            severity:
                clamp(
                    number(
                        source.severity,
                        2
                    ),
                    1,
                    5
                ),

            targetPlayerId:
                safeString(
                    source.targetPlayerId,
                    player?.id || ""
                ),

            actorPlayerId:
                safeString(
                    source.actorPlayerId,
                    ""
                ),

            news:
                safeString(
                    source.news,
                    source.title
                ),

            location:
                safeString(
                    source.location,
                    player?.country ||
                        "کشور"
                ),

            choices
        };
    }

    /* =====================================================
       FALLBACK EVENT
       ===================================================== */

    function createFallbackEvent(
        gameState
    ) {
        const player =
            gameState?.players?.[
                gameState?.currentPlayerIndex ||
                0
            ];

        const country =
            player?.country ||
            "کشور شما";

        const events = [
            {
                title:
                    "بحران عجیب در شبکه برق",

                description:
                    `در ${country} برق چند منطقه بدون توضیح مشخص قطع شده و وزیر انرژی می‌گوید «احتمالاً مشکل از خود برق است».`,

                category:
                    "energy",

                choices: [
                    {
                        title:
                            "تشکیل ستاد بحران",

                        description:
                            "همه متخصصان را جمع می‌کنید.",

                        risk:
                            "low"
                    },

                    {
                        title:
                            "وعده برق رایگان",

                        description:
                            "با یک سخنرانی مشکل را فعلاً سیاسی می‌کنید.",

                        risk:
                            "medium"
                    },

                    {
                        title:
                            "مقصر دانستن ماهواره‌ها",

                        description:
                            "یک توضیح عجیب اما بسیار رسانه‌ای ارائه می‌دهید.",

                        risk:
                            "high"
                    }
                ]
            },

            {
                title:
                    "اعتراض عجیب در پایتخت",

                description:
                    "گروهی از شهروندان با پلاکاردهایی کاملاً نامرتبط جلوی ساختمان دولت تجمع کرده‌اند.",

                category:
                    "protest",

                choices: [
                    {
                        title:
                            "گفت‌وگو با معترضان",

                        description:
                            "نمایندگان دولت وارد مذاکره می‌شوند.",

                        risk:
                            "low"
                    },

                    {
                        title:
                            "کنفرانس خبری",

                        description:
                            "رئیس دولت مستقیماً به رسانه‌ها پاسخ می‌دهد.",

                        risk:
                            "medium"
                    },

                    {
                        title:
                            "نادیده گرفتن ماجرا",

                        description:
                            "دولت وانمود می‌کند اتفاق خاصی رخ نداده است.",

                        risk:
                            "high"
                    }
                ]
            },

            {
                title:
                    "بازار با یک شایعه منفجر شد",

                description:
                    "یک شایعه بی‌منبع باعث شده مردم درباره وضعیت اقتصادی کشور نگران شوند.",

                category:
                    "economy",

                choices: [
                    {
                        title:
                            "شفاف‌سازی فوری",

                        description:
                            "آمار رسمی منتشر می‌کنید.",

                        risk:
                            "low"
                    },

                    {
                        title:
                            "تبلیغات گسترده",

                        description:
                            "کمپین امیدبخش دولت را راه می‌اندازید.",

                        risk:
                            "medium"
                    },

                    {
                        title:
                            "تکذیب شدید",

                        description:
                            "دولت با لحنی بسیار تند شایعه را رد می‌کند.",

                        risk:
                            "high"
                    }
                ]
            }
        ];

        const selected =
            events[
                Math.floor(
                    Math.random() *
                    events.length
                )
            ];

        return normalizeEvent(
            {
                ...selected,

                id:
                    "fallback_" +
                    Date.now(),

                type:
                    selected.category,

                news:
                    selected.title
            },
            gameState
        );
    }

    /* =====================================================
       GENERATE EVENT
       ===================================================== */

    async function generateAIEvent(
        gameState,
        history = []
    ) {
        const state =
            buildStateForAI(
                gameState
            );

        const clean =
            cleanHistory(
                history
            );

        try {
            const response =
                await requestAI(
                    "event",
                    {
                        gameState:
                            state,

                        history:
                            clean
                    }
                );

            const raw =
                response?.event ||
                response?.data ||
                response;

            return normalizeEvent(
                raw,
                gameState
            );
        } catch (error) {
            console.warn(
                "AI event failed:",
                error
            );

            return createFallbackEvent(
                gameState
            );
        }
    }

    /* =====================================================
       CONSEQUENCE NORMALIZATION
       ===================================================== */

    function normalizeConsequence(
        consequence
    ) {
        const source =
            consequence &&
            typeof consequence === "object"
                ? consequence
                : {};

        return {
            title:
                safeString(
                    source.title,
                    "پیامد تصمیم"
                ),

            story:
                safeString(
                    source.story,
                    "تصمیم شما واکنش‌های مختلفی ایجاد کرد."
                ),

            news:
                safeString(
                    source.news,
                    source.title
                ),

            effects:
                normalizeEffects(
                    source.effects
                ),

            relationChanges:
                Array.isArray(
                    source.relationChanges
                )
                    ? source.relationChanges
                        .slice(0, 8)
                        .map(item => ({
                            playerId:
                                safeString(
                                    item?.playerId
                                ),

                            amount:
                                clamp(
                                    number(
                                        item?.amount,
                                        0
                                    ),
                                    -30,
                                    30
                                ),

                            reason:
                                safeString(
                                    item?.reason,
                                    "تغییر روابط"
                                )
                        }))
                    : [],

            addCrisis:
                source.addCrisis
                    ? {
                        title:
                            safeString(
                                source.addCrisis.title
                            ),

                        severity:
                            clamp(
                                number(
                                    source.addCrisis.severity,
                                    1
                                ),
                                1,
                                5
                            )
                    }
                    : null,

            resolveCrisis:
                safeString(
                    source.resolveCrisis
                ),

            nextEventHint:
                safeString(
                    source.nextEventHint
                )
        };
    }

    /* =====================================================
       FALLBACK CONSEQUENCE
       ===================================================== */

    function createFallbackConsequence(
        gameState,
        decision
    ) {
        const choice =
            decision?.choice || {};

        const risk =
            safeString(
                choice.risk,
                "medium"
            );

        if (risk === "low") {
            return {
                title:
                    "تصمیم محتاطانه جواب داد",

                story:
                    "اوضاع کاملاً عالی نشد، اما دولت توانست بحران را بدون ایجاد آشوب بیشتر مدیریت کند.",

                news:
                    "دولت از مدیریت آرام بحران خبر داد.",

                effects: {
                    money: -2,
                    electricity: 1,
                    economy: 2,
                    popularity: 3,
                    relations: 2,
                    sanctions: 0
                },

                relationChanges: [],

                addCrisis: null,

                resolveCrisis: null,

                nextEventHint:
                    "یک اتفاق تازه اما غیرقابل پیش‌بینی"
            };
        }

        if (risk === "high") {
            return {
                title:
                    "تصمیم جسورانه کشور را شوکه کرد",

                story:
                    "تصمیم رئیس باعث واکنش شدید رسانه‌ها شد؛ بخشی از جامعه هیجان‌زده و بخشی دیگر نگران شده‌اند.",

                news:
                    "تصمیم جنجالی دولت در صدر اخبار قرار گرفت.",

                effects: {
                    money: -6,
                    electricity: -2,
                    economy: -2,
                    popularity: -4,
                    relations: -3,
                    sanctions: 2
                },

                relationChanges: [],

                addCrisis: {
                    title:
                        "بحران رسانه‌ای",

                    severity:
                        2
                },

                resolveCrisis: null,

                nextEventHint:
                    "یک واکنش رسانه‌ای یا دیپلماتیک"
            };
        }

        return {
            title:
                "تصمیم دولت نتیجه‌ای غیرمنتظره داشت",

            story:
                "دولت توانست بخشی از مشکل را کنترل کند، اما پیامدهای جانبی تصمیم هنوز مشخص نیست.",

            news:
                "تحلیلگران در حال بررسی تصمیم دولت هستند.",

            effects: {
                money: -3,
                electricity: 0,
                economy: 1,
                popularity: 1,
                relations: 0,
                sanctions: 0
            },

            relationChanges: [],

            addCrisis: null,

            resolveCrisis: null,

            nextEventHint:
                "پیامد جدید مرتبط با تصمیم اخیر"
        };
    }

    /* =====================================================
       GENERATE CONSEQUENCE
       ===================================================== */

    async function generateAIConsequence(
        gameState,
        history = [],
        decision = {}
    ) {
        const state =
            buildStateForAI(
                gameState
            );

        const payloadDecision = {
            player:
                normalizePlayer(
                    decision?.player
                ),

            country:
                safeString(
                    decision?.country,
                    decision?.player
                        ?.country ||
                        ""
                ),

            choice: {
                id:
                    safeString(
                        decision?.choice?.id
                    ),

                title:
                    safeString(
                        decision?.choice?.title
                    ),

                description:
                    safeString(
                        decision?.choice?.description
                    ),

                risk:
                    safeString(
                        decision?.choice?.risk,
                        "medium"
                    )
            }
        };

        try {
            const response =
                await requestAI(
                    "consequence",
                    {
                        gameState:
                            state,

                        history:
                            cleanHistory(
                                history
                            ),

                        decision:
                            payloadDecision
                    }
                );

            const raw =
                response?.consequence ||
                response?.data ||
                response;

            return normalizeConsequence(
                raw
            );
        } catch (error) {
            console.warn(
                "AI consequence failed:",
                error
            );

            return normalizeConsequence(
                createFallbackConsequence(
                    gameState,
                    decision
                )
            );
        }
    }

    /* =====================================================
       DEBUG / PUBLIC API
       ===================================================== */

    window.RepublicAI = {
        version: VERSION,

        generateAIEvent,

        generateAIConsequence,

        normalizeEvent,

        normalizeConsequence,

        createFallbackEvent,

        createFallbackConsequence
    };

    /*
       game.js expects these functions globally.
    */

    window.generateAIEvent =
        generateAIEvent;

    window.generateAIConsequence =
        generateAIConsequence;

    console.log(
        "Republic AI v" +
        VERSION +
        " loaded."
    );
})();