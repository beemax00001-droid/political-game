/* =========================================================
   REPUBLIC OF ABSURDITY
   AI DIRECTOR — FINAL EDITION
   Dynamic Events + Consequences + Fallback Director
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const VERSION = "FINAL";

    const AI_ENDPOINT =
        "https://political-game-ai.tm1190128.workers.dev/";

    const REQUEST_TIMEOUT = 18000;


    /* =====================================================
       UTILITIES
    ===================================================== */

    const clamp = (value, min = 0, max = 100) => {
        const n = Number(value);

        if (!Number.isFinite(n)) {
            return min;
        }

        return Math.max(min, Math.min(max, n));
    };


    const safeNumber = (value, fallback = 0) => {
        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : fallback;
    };


    const cleanText = (value, fallback = "") => {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value)
            .replace(/\u0000/g, "")
            .trim();
    };


    const randomItem = array => {
        if (!Array.isArray(array) || !array.length) {
            return null;
        }

        return array[
            Math.floor(Math.random() * array.length)
        ];
    };


    const randomInt = (min, max) => {
        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    };


    const makeId = prefix => {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8)
        );
    };


    /* =====================================================
       EVENT CATEGORIES
    ===================================================== */

    const EVENT_CATEGORIES = {

        economy: {
            label: "اقتصاد",
            icon: "₿"
        },

        inflation: {
            label: "تورم و قیمت",
            icon: "%"
        },

        energy: {
            label: "انرژی",
            icon: "⚡"
        },

        environment: {
            label: "محیط زیست",
            icon: "◆"
        },

        social: {
            label: "جامعه",
            icon: "◎"
        },

        protest: {
            label: "اعتراضات",
            icon: "!"
        },

        diplomacy: {
            label: "دیپلماسی",
            icon: "◇"
        },

        security: {
            label: "تنش بین‌المللی",
            icon: "◈"
        },

        media: {
            label: "رسانه",
            icon: "◉"
        },

        politics: {
            label: "سیاست داخلی",
            icon: "♜"
        },

        technology: {
            label: "فناوری",
            icon: "⌁"
        },

        absurd: {
            label: "اتفاق عجیب",
            icon: "?"
        }

    };


    /* =====================================================
       FALLBACK EVENT DATABASE
    ===================================================== */

    const EVENTS = [

        /* ================= ECONOMY ================= */

        {
            category: "economy",
            type: "economic_crisis",
            severity: 3,

            title:
                "بازار وارد مرحله‌ای عجیب شد",

            description:
                "شاخص‌های اقتصادی نوسان شدیدی نشان می‌دهند و مردم منتظر واکنش دولت هستند.",

            news:
                "بازارهای داخلی با نوسان غیرمنتظره روبه‌رو شدند.",

            choices: [

                {
                    title: "بسته حمایتی فوری",
                    description:
                        "دولت بخشی از ذخایر خود را برای آرام کردن بازار اختصاص می‌دهد.",
                    effects: {
                        money: -100,
                        economy: 7,
                        popularity: 5,
                        stability: 4
                    }
                },

                {
                    title: "سیاست ریاضتی",
                    description:
                        "هزینه‌های دولتی کاهش پیدا می‌کند.",
                    effects: {
                        money: 80,
                        economy: 3,
                        popularity: -7,
                        stability: -2
                    }
                },

                {
                    title: "هیچ کاری نکن",
                    description:
                        "دولت تصمیم می‌گیرد فعلاً فقط بازار را زیر نظر بگیرد.",
                    effects: {
                        economy: -5,
                        popularity: -3,
                        stability: -4
                    }
                }

            ]
        },


        /* ================= INFLATION ================= */

        {
            category: "inflation",
            type: "inflation",
            severity: 3,

            title:
                "قیمت‌ها دوباره بالا رفتند",

            description:
                "افزایش هزینه‌های زندگی به تیتر اول رسانه‌ها تبدیل شده است.",

            news:
                "شاخص قیمت‌ها در چند بخش اصلی اقتصاد افزایش پیدا کرد.",

            choices: [

                {
                    title: "کنترل اضطراری قیمت‌ها",
                    description:
                        "دولت برای مدت کوتاهی بازار را تحت نظارت شدید قرار می‌دهد.",
                    effects: {
                        money: -70,
                        economy: 3,
                        popularity: 7
                    }
                },

                {
                    title: "کمک مستقیم به مردم",
                    description:
                        "دولت بسته حمایتی عمومی ارائه می‌کند.",
                    effects: {
                        money: -120,
                        popularity: 10,
                        economy: -2
                    }
                },

                {
                    title: "آزاد گذاشتن بازار",
                    description:
                        "دولت دخالت مستقیم نمی‌کند.",
                    effects: {
                        money: 20,
                        economy: -4,
                        popularity: -8
                    }
                }

            ]
        },


        /* ================= ENERGY ================= */

        {
            category: "energy",
            type: "energy_crisis",
            severity: 4,

            title:
                "شبکه انرژی تحت فشار است",

            description:
                "مصرف انرژی از ظرفیت عادی عبور کرده و احتمال محدودیت وجود دارد.",

            news:
                "مقام‌های انرژی از فشار بی‌سابقه روی شبکه خبر دادند.",

            choices: [

                {
                    title: "مدیریت مصرف",
                    description:
                        "دولت برنامه کاهش مصرف عمومی را اجرا می‌کند.",
                    effects: {
                        electricity: 9,
                        popularity: -2,
                        stability: 3
                    }
                },

                {
                    title: "سرمایه‌گذاری فوری",
                    description:
                        "بودجه سنگینی به زیرساخت انرژی اختصاص می‌یابد.",
                    effects: {
                        money: -150,
                        electricity: 16,
                        economy: 5
                    }
                },

                {
                    title: "نادیده گرفتن بحران",
                    description:
                        "دولت امیدوار است شرایط خودبه‌خود بهتر شود.",
                    effects: {
                        electricity: -14,
                        popularity: -5,
                        stability: -7
                    }
                }

            ]
        },


        /* ================= ENVIRONMENT ================= */

        {
            category: "environment",
            type: "natural_event",
            severity: 3,

            title:
                "هشدار آب‌وهوایی صادر شد",

            description:
                "یک سامانه شدید آب‌وهوایی بخش‌هایی از کشور را تحت تأثیر قرار داده است.",

            news:
                "مرکز هواشناسی وضعیت اضطراری را اعلام کرد.",

            choices: [

                {
                    title: "فعال کردن ستاد بحران",
                    description:
                        "منابع دولت برای آماده‌سازی مناطق درگیر اختصاص می‌یابد.",
                    effects: {
                        money: -60,
                        stability: 7,
                        popularity: 4
                    }
                },

                {
                    title: "هشدار عمومی",
                    description:
                        "دولت فقط اطلاع‌رسانی گسترده انجام می‌دهد.",
                    effects: {
                        popularity: 2,
                        stability: 2
                    }
                },

                {
                    title: "صبر کردن",
                    description:
                        "دولت فعلاً مداخله نمی‌کند.",
                    effects: {
                        stability: -8,
                        popularity: -5
                    }
                }

            ]
        },


        /* ================= PROTEST ================= */

        {
            category: "protest",
            type: "social_unrest",
            severity: 4,

            title:
                "موج اعتراضات در چند شهر شکل گرفت",

            description:
                "گروه‌هایی از شهروندان نسبت به شرایط اقتصادی و اجتماعی اعتراض دارند و رسانه‌ها لحظه‌به‌لحظه وضعیت را دنبال می‌کنند.",

            news:
                "تصاویر تجمعات در صدر اخبار داخلی قرار گرفت.",

            choices: [

                {
                    title: "گفت‌وگوی ملی",
                    description:
                        "دولت نمایندگان مختلف جامعه را برای گفت‌وگو دعوت می‌کند.",
                    effects: {
                        popularity: 6,
                        stability: 8,
                        money: -30
                    }
                },

                {
                    title: "بسته اقتصادی",
                    description:
                        "دولت برای کاهش فشار معیشتی برنامه جدیدی اعلام می‌کند.",
                    effects: {
                        money: -120,
                        economy: 5,
                        popularity: 7
                    }
                },

                {
                    title: "نادیده گرفتن",
                    description:
                        "دولت تصمیم می‌گیرد واکنش رسمی محدودی داشته باشد.",
                    effects: {
                        popularity: -9,
                        stability: -10
                    }
                }

            ]
        },


        /* ================= DIPLOMACY ================= */

        {
            category: "diplomacy",
            type: "diplomatic_offer",
            severity: 2,

            title:
                "پیشنهاد مذاکره روی میز قرار گرفت",

            description:
                "یک کشور خارجی پیشنهاد کرده است درباره یک اختلاف اقتصادی و سیاسی مذاکره شود.",

            news:
                "دیپلمات‌ها از احتمال آغاز یک دور مذاکره خبر دادند.",

            choices: [

                {
                    title: "پذیرش مذاکره",
                    description:
                        "کانال گفت‌وگو فعال می‌شود.",
                    effects: {
                        relations: 8,
                        stability: 4,
                        economy: 3
                    }
                },

                {
                    title: "مذاکره با شرط",
                    description:
                        "دولت برای ورود به مذاکرات چند شرط تعیین می‌کند.",
                    effects: {
                        relations: 3,
                        popularity: 3,
                        stability: 2
                    }
                },

                {
                    title: "رد پیشنهاد",
                    description:
                        "دولت فعلاً حاضر به مذاکره نیست.",
                    effects: {
                        relations: -7,
                        tension: 6,
                        stability: -2
                    }
                }

            ]
        },


        /* ================= INTERNATIONAL TENSION ================= */

        {
            category: "security",
            type: "international_tension",
            severity: 5,

            title:
                "تنش بین‌المللی افزایش یافت",

            description:
                "اختلاف میان چند کشور باعث افزایش نگرانی در بازارها و رسانه‌های جهان شده است.",

            news:
                "شبکه‌های خبری از افزایش تنش در منطقه گزارش می‌دهند.",

            choices: [

                {
                    title: "پیشنهاد میانجی‌گری",
                    description:
                        "کشور شما تلاش می‌کند طرف‌ها را به گفت‌وگو دعوت کند.",
                    effects: {
                        relations: 8,
                        tension: -8,
                        stability: 5
                    }
                },

                {
                    title: "بیانیه بی‌طرفانه",
                    description:
                        "دولت موضع محتاطانه‌ای اتخاذ می‌کند.",
                    effects: {
                        relations: 2,
                        tension: -2,
                        popularity: 2
                    }
                },

                {
                    title: "موضع تند",
                    description:
                        "دولت موضع سیاسی محکمی اعلام می‌کند.",
                    effects: {
                        relations: -6,
                        tension: 9,
                        popularity: 4,
                        stability: -3
                    }
                }

            ]
        },


        /* ================= MEDIA ================= */

        {
            category: "media",
            type: "media_scandal",
            severity: 3,

            title:
                "رسوایی رسانه‌ای دولت را غافلگیر کرد",

            description:
                "یک گزارش جنجالی در رسانه‌ها منتشر شده و افکار عمومی منتظر توضیح دولت است.",

            news:
                "هشتگ جدیدی درباره دولت در شبکه‌های خبری ترند شد.",

            choices: [

                {
                    title: "شفاف‌سازی کامل",
                    description:
                        "دولت تمام اطلاعات قابل انتشار را ارائه می‌کند.",
                    effects: {
                        popularity: 5,
                        stability: 5
                    }
                },

                {
                    title: "کمیته بررسی",
                    description:
                        "یک کمیته مستقل برای بررسی موضوع تشکیل می‌شود.",
                    effects: {
                        popularity: 3,
                        money: -30,
                        stability: 4
                    }
                },

                {
                    title: "بی‌اهمیت دانستن خبر",
                    description:
                        "دولت گزارش را جدی نمی‌گیرد.",
                    effects: {
                        popularity: -8,
                        stability: -5
                    }
                }

            ]
        },


        /* ================= TECHNOLOGY ================= */

        {
            category: "technology",
            type: "technology_boom",
            severity: 2,

            title:
                "یک فناوری جدید توجه جهان را جلب کرد",

            description:
                "شرکت‌های داخلی پیشنهاد کرده‌اند دولت برای توسعه فناوری جدید سرمایه‌گذاری کند.",

            news:
                "سرمایه‌گذاران درباره آینده فناوری جدید هیجان‌زده هستند.",

            choices: [

                {
                    title: "سرمایه‌گذاری بزرگ",
                    description:
                        "دولت بودجه قابل توجهی اختصاص می‌دهد.",
                    effects: {
                        money: -100,
                        economy: 10,
                        popularity: 3
                    }
                },

                {
                    title: "حمایت محدود",
                    description:
                        "دولت حمایت اولیه ارائه می‌کند.",
                    effects: {
                        money: -40,
                        economy: 5
                    }
                },

                {
                    title: "عدم دخالت",
                    description:
                        "دولت بازار را به بخش خصوصی واگذار می‌کند.",
                    effects: {
                        economy: 2
                    }
                }

            ]
        },


        /* ================= POLITICS ================= */

        {
            category: "politics",
            type: "political_crisis",
            severity: 4,

            title:
                "ائتلاف سیاسی دولت ترک برداشت",

            description:
                "چند مقام و جریان سیاسی درباره سیاست‌های اخیر دولت اختلاف پیدا کرده‌اند.",

            news:
                "جلسه فوق‌العاده کابینه پشت درهای بسته برگزار شد.",

            choices: [

                {
                    title: "تشکیل ائتلاف جدید",
                    description:
                        "دولت برای حفظ ثبات با گروه‌های مختلف مذاکره می‌کند.",
                    effects: {
                        popularity: 3,
                        stability: 8,
                        money: -30
                    }
                },

                {
                    title: "تغییر چند وزیر",
                    description:
                        "دولت برای کاهش فشار سیاسی تغییراتی انجام می‌دهد.",
                    effects: {
                        stability: 4,
                        popularity: 2
                    }
                },

                {
                    title: "ایستادگی",
                    description:
                        "رئیس دولت تصمیم می‌گیرد عقب‌نشینی نکند.",
                    effects: {
                        popularity: 5,
                        stability: -8
                    }
                }

            ]
        },


        /* ================= ABSURD ================= */

        {
            category: "absurd",
            type: "absurd_event",
            severity: 1,

            title:
                "وزارتخانه یک تصمیم کاملاً عجیب گرفت",

            description:
                "یک بخش دولتی اعلام کرده است که از این پس جلسات رسمی با قرعه‌کشی برگزار می‌شوند.",

            news:
                "خبر عجیب دولت فضای رسانه‌ای کشور را تسخیر کرد.",

            choices: [

                {
                    title: "تأیید رسمی",
                    description:
                        "دولت تصمیم را به یک سیاست رسمی تبدیل می‌کند.",
                    effects: {
                        popularity: 5,
                        stability: -2
                    }
                },

                {
                    title: "لغو فوری",
                    description:
                        "دولت اعلام می‌کند این تصمیم اشتباه بوده است.",
                    effects: {
                        stability: 3,
                        popularity: 1
                    }
                },

                {
                    title: "تشکیل کمیته",
                    description:
                        "موضوع به یک کمیته ویژه سپرده می‌شود.",
                    effects: {
                        money: -10,
                        stability: 1
                    }
                }

            ]
        }

    ];


    /* =====================================================
       REQUEST WITH TIMEOUT
    ===================================================== */

    async function requestAI(payload) {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT
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

                        body:
                            JSON.stringify(payload),

                        signal:
                            controller.signal
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "AI HTTP " +
                    response.status
                );
            }

            const data =
                await response.json();

            return data;

        } finally {

            clearTimeout(timeout);

        }

    }


    /* =====================================================
       JSON EXTRACTION
    ===================================================== */

    function extractJSON(value) {

        if (!value) {
            return null;
        }

        if (typeof value === "object") {
            return value;
        }

        let text =
            cleanText(value);

        text =
            text
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        try {
            return JSON.parse(text);
        } catch (_) {}

        const first =
            text.indexOf("{");

        const last =
            text.lastIndexOf("}");

        if (
            first !== -1 &&
            last !== -1 &&
            last > first
        ) {

            try {

                return JSON.parse(
                    text.slice(
                        first,
                        last + 1
                    )
                );

            } catch (_) {}

        }

        return null;
    }


    /* =====================================================
       NORMALIZE EFFECTS
    ===================================================== */

    function normalizeEffects(effects = {}) {

        const result = {};

        const numericKeys = [
            "money",
            "electricity",
            "economy",
            "popularity",
            "stability",
            "relations",
            "sanctions",
            "tension"
        ];

        for (const key of numericKeys) {

            if (
                Object.prototype.hasOwnProperty.call(
                    effects,
                    key
                )
            ) {

                const value =
                    safeNumber(
                        effects[key],
                        0
                    );

                result[key] =
                    Math.round(
                        clamp(value, -100, 100)
                    );

            }

        }

        return result;
    }


    /* =====================================================
       NORMALIZE CHOICE
    ===================================================== */

    function normalizeChoice(choice, index) {

        const fallback =
            EVENTS[0].choices[index] ||
            {
                title:
                    "تصمیم دولت",

                description:
                    "یک تصمیم مهم برای کشور.",

                effects: {}
            };

        return {

            id:
                cleanText(
                    choice?.id,
                    "choice_" + (index + 1)
                ),

            title:
                cleanText(
                    choice?.title,
                    fallback.title
                ).slice(0, 100),

            description:
                cleanText(
                    choice?.description,
                    fallback.description
                ).slice(0, 300),

            effects:
                normalizeEffects(
                    choice?.effects ||
                    {}
                )

        };

    }


    /* =====================================================
       NORMALIZE EVENT
    ===================================================== */

    function normalizeEvent(raw, gameState = {}) {

        const fallback =
            randomItem(EVENTS);

        if (!raw || typeof raw !== "object") {
            raw = {};
        }

        let choices =
            Array.isArray(raw.choices)
                ? raw.choices
                : [];

        if (choices.length < 3) {

            choices = [
                ...choices
            ];

            while (choices.length < 3) {

                choices.push(
                    fallback.choices[
                        choices.length
                    ] ||
                    EVENTS[0].choices[
                        choices.length
                    ]
                );

            }

        }

        choices =
            choices
                .slice(0, 3)
                .map(normalizeChoice);


        let category =
            cleanText(
                raw.category,
                fallback.category
            ).toLowerCase();

        if (
            !EVENT_CATEGORIES[category]
        ) {
            category =
                fallback.category;
        }


        let severity =
            Math.round(
                clamp(
                    safeNumber(
                        raw.severity,
                        fallback.severity
                    ),
                    1,
                    5
                )
            );


        return {

            id:
                cleanText(
                    raw.id,
                    makeId("event")
                ),

            title:
                cleanText(
                    raw.title,
                    fallback.title
                ).slice(0, 160),

            description:
                cleanText(
                    raw.description,
                    fallback.description
                ).slice(0, 700),

            type:
                cleanText(
                    raw.type,
                    fallback.type
                ),

            category,

            severity,

            targetPlayerId:
                cleanText(
                    raw.targetPlayerId,
                    gameState.players?.[
                        gameState.currentPlayerIndex || 0
                    ]?.id ||
                    ""
                ),

            actorPlayerId:
                cleanText(
                    raw.actorPlayerId,
                    ""
                ),

            news:
                cleanText(
                    raw.news,
                    fallback.news
                ).slice(0, 300),

            choices

        };

    }


    /* =====================================================
       NORMALIZE CONSEQUENCE
    ===================================================== */

    function normalizeConsequence(raw) {

        if (!raw || typeof raw !== "object") {
            raw = {};
        }

        return {

            title:
                cleanText(
                    raw.title,
                    "پیامد تصمیم"
                ).slice(0, 150),

            story:
                cleanText(
                    raw.story,
                    "تصمیم شما روی وضعیت کشور تأثیر گذاشت."
                ).slice(0, 700),

            news:
                cleanText(
                    raw.news,
                    "رسانه‌ها در حال بررسی پیامد تصمیم هستند."
                ).slice(0, 300),

            effects:
                normalizeEffects(
                    raw.effects || {}
                ),

            relationChanges:
                raw.relationChanges &&
                typeof raw.relationChanges === "object"
                    ? raw.relationChanges
                    : {},

            addCrisis:
                cleanText(
                    raw.addCrisis,
                    ""
                ),

            resolveCrisis:
                cleanText(
                    raw.resolveCrisis,
                    ""
                ),

            nextEventHint:
                cleanText(
                    raw.nextEventHint,
                    ""
                )

        };

    }


    /* =====================================================
       GAME STATE SNAPSHOT
    ===================================================== */

    function makeSnapshot(gameState) {

        const player =
            gameState?.players?.[
                gameState.currentPlayerIndex || 0
            ] || {};

        return {

            turn:
                safeNumber(
                    gameState?.turn,
                    1
                ),

            year:
                2026 +
                Math.floor(
                    safeNumber(
                        gameState?.turn,
                        1
                    ) / 10
                ),

            currentPlayer: {

                id:
                    player.id || "",

                leader:
                    player.leader || "",

                country:
                    player.country || "",

                geography:
                    player.geography || "",

                money:
                    safeNumber(
                        player.money,
                        1000
                    ),

                economy:
                    safeNumber(
                        player.economy,
                        70
                    ),

                electricity:
                    safeNumber(
                        player.electricity,
                        75
                    ),

                popularity:
                    safeNumber(
                        player.popularity,
                        60
                    ),

                stability:
                    safeNumber(
                        player.stability,
                        65
                    ),

                sanctions:
                    safeNumber(
                        player.sanctions,
                        0
                    )

            },

            world:
                gameState?.world
                    ? {
                        tension:
                            safeNumber(
                                gameState.world.tension,
                                25
                            ),

                        market:
                            safeNumber(
                                gameState.world.market,
                                70
                            ),

                        energy:
                            safeNumber(
                                gameState.world.energy,
                                20
                            )
                    }
                    : {},

            players:
                Array.isArray(
                    gameState?.players
                )
                    ? gameState.players.map(
                        p => ({
                            id: p.id,
                            country: p.country,
                            geography: p.geography,
                            economy: safeNumber(p.economy),
                            popularity: safeNumber(p.popularity),
                            stability: safeNumber(p.stability)
                        })
                    )
                    : [],

            history:
                Array.isArray(
                    gameState?.history
                )
                    ? gameState.history
                        .slice(-8)
                        .map(item => ({
                            title:
                                item.title ||
                                item.eventTitle ||
                                "",
                            category:
                                item.category ||
                                "",
                            choice:
                                item.choiceTitle ||
                                ""
                        }))
                    : []

        };

    }


    /* =====================================================
       AI EVENT
    ===================================================== */

    async function generateAIEvent(
        gameState,
        history = []
    ) {

        const snapshot =
            makeSnapshot(
                gameState
            );

        try {

            const response =
                await requestAI({

                    mode: "event",

                    gameState:
                        snapshot,

                    history:
                        history.slice(-10),

                    instruction:
                        `
تو مدیر جهان یک بازی سیاسی طنز و استراتژیک هستی.

برای کشور بازیکن یک اتفاق جذاب و غیرقابل‌پیش‌بینی بساز.

موضوعات مجاز:
اقتصاد، تورم، افزایش قیمت،
انرژی، محیط زیست،
اعتراضات اجتماعی،
رسانه،
رسوایی سیاسی،
فناوری،
دیپلماسی،
تنش بین‌المللی،
بحران‌های جهانی،
و اتفاقات کاملاً عجیب و طنز.

اگر تنش یا جنگ رخ می‌دهد،
فقط آن را به صورت یک بحران خبری،
دیپلماتیک و استراتژیک نمایش بده.
هیچ جزئیات عملیاتی یا گرافیکی ارائه نکن.

حتماً دقیقاً ۳ انتخاب متفاوت بده.

انتخاب‌ها باید واقعاً متفاوت باشند:
یکی امن،
یکی پرریسک،
یکی عجیب یا خلاقانه.

خروجی فقط JSON باشد.
`
                });


            const raw =
                extractJSON(
                    response?.result ||
                    response?.data ||
                    response
                );


            if (
                raw &&
                typeof raw === "object"
            ) {

                return normalizeEvent(
                    raw,
                    gameState
                );

            }

        } catch (error) {

            console.warn(
                "[AI Director]",
                error
            );

        }


        return generateFallbackEvent(
            gameState
        );

    }


    /* =====================================================
       AI CONSEQUENCE
    ===================================================== */

    async function generateAIConsequence(
        gameState,
        history = [],
        decision = {}
    ) {

        const snapshot =
            makeSnapshot(
                gameState
            );

        try {

            const response =
                await requestAI({

                    mode: "consequence",

                    gameState:
                        snapshot,

                    history:
                        history.slice(-10),

                    decision: {

                        title:
                            cleanText(
                                decision.choice?.title
                            ),

                        description:
                            cleanText(
                                decision.choice?.description
                            ),

                        effects:
                            normalizeEffects(
                                decision.choice?.effects ||
                                {}
                            )

                    },

                    instruction:
                        `
پیامد تصمیم بازیکن را برای یک بازی
سیاسی، استراتژیک و طنز بنویس.

پیامد باید منطقی ولی گاهی غافلگیرکننده باشد.

می‌تواند روی اقتصاد،
محبوبیت،
ثبات،
انرژی،
روابط خارجی،
فشار خارجی،
بازار جهانی
و تنش جهانی اثر بگذارد.

اگر اتفاق بین‌المللی یا درگیری رخ می‌دهد،
آن را فقط به شکل خبر، وضعیت سیاسی
و پیامد استراتژیک بیان کن.

از توصیف گرافیکی خشونت خودداری کن.

خروجی فقط JSON باشد.
`
                });


            const raw =
                extractJSON(
                    response?.result ||
                    response?.data ||
                    response
                );


            if (
                raw &&
                typeof raw === "object"
            ) {

                return normalizeConsequence(
                    raw
                );

            }

        } catch (error) {

            console.warn(
                "[AI Consequence]",
                error
            );

        }


        return generateFallbackConsequence(
            gameState,
            decision
        );

    }


    /* =====================================================
       FALLBACK EVENT DIRECTOR
    ===================================================== */

    function generateFallbackEvent(
        gameState
    ) {

        const player =
            gameState?.players?.[
                gameState.currentPlayerIndex || 0
            ] || {};

        const economy =
            safeNumber(
                player.economy,
                70
            );

        const popularity =
            safeNumber(
                player.popularity,
                60
            );

        const electricity =
            safeNumber(
                player.electricity,
                75
            );

        const tension =
            safeNumber(
                gameState?.world?.tension,
                25
            );


        /*
         * انتخاب هوشمند بر اساس وضعیت جهان
         */

        let candidates =
            EVENTS.slice();


        if (economy < 40) {

            candidates =
                EVENTS.filter(
                    e =>
                        e.category === "economy" ||
                        e.category === "inflation" ||
                        e.category === "social"
                );

        } else if (
            electricity < 40
        ) {

            candidates =
                EVENTS.filter(
                    e =>
                        e.category === "energy" ||
                        e.category === "environment"
                );

        } else if (
            popularity < 35
        ) {

            candidates =
                EVENTS.filter(
                    e =>
                        e.category === "protest" ||
                        e.category === "media" ||
                        e.category === "politics"
                );

        } else if (
            tension > 65
        ) {

            candidates =
                EVENTS.filter(
                    e =>
                        e.category === "security" ||
                        e.category === "diplomacy"
                );

        }


        if (!candidates.length) {
            candidates = EVENTS;
        }


        const template =
            randomItem(
                candidates
            );


        /*
         * کپی کامل
         */

        const event =
            JSON.parse(
                JSON.stringify(template)
            );


        event.id =
            makeId("fallback");

        event.targetPlayerId =
            player.id || "";


        /*
         * کمی تنوع تصادفی
         */

        event.severity =
            clamp(
                safeNumber(
                    event.severity,
                    2
                ) +
                randomInt(-1, 1),
                1,
                5
            );


        return normalizeEvent(
            event,
            gameState
        );

    }


    /* =====================================================
       FALLBACK CONSEQUENCE
    ===================================================== */

    function generateFallbackConsequence(
        gameState,
        decision = {}
    ) {

        const choice =
            decision.choice || {};

        const effects =
            normalizeEffects(
                choice.effects || {}
            );


        let tone =
            "خنثی";


        const total =
            Object.values(
                effects
            ).reduce(
                (sum, value) =>
                    sum + safeNumber(value),
                0
            );


        if (total >= 10) {
            tone = "مثبت";
        }

        if (total <= -10) {
            tone = "منفی";
        }


        const stories = {

            positive: [
                "تصمیم دولت بهتر از انتظار بازار عمل کرد و فضای عمومی کمی آرام‌تر شد.",
                "واکنش‌ها نسبت به تصمیم دولت عمدتاً مثبت بود.",
                "تصمیم شما یک اثر زنجیره‌ای غیرمنتظره اما مفید ایجاد کرد."
            ],

            negative: [
                "پیامدهای تصمیم سریع‌تر از چیزی که دولت انتظار داشت ظاهر شدند.",
                "رسانه‌ها واکنش متفاوتی نشان دادند و فشار سیاسی افزایش پیدا کرد.",
                "تصمیم دولت باعث شد چند مشکل جدید همزمان روی میز قرار بگیرد."
            ],

            neutral: [
                "تصمیم دولت فعلاً وضعیت را در حالت انتظار نگه داشت.",
                "بازار هنوز در حال بررسی پیامدهای تصمیم است.",
                "نتیجه تصمیم نه کاملاً مثبت بود و نه کاملاً منفی."
            ]

        };


        const key =
            tone === "مثبت"
                ? "positive"
                : tone === "منفی"
                    ? "negative"
                    : "neutral";


        const story =
            randomItem(
                stories[key]
            );


        return {

            title:
                tone === "مثبت"
                    ? "تصمیم جواب داد"
                    : tone === "منفی"
                        ? "پیامد غیرمنتظره"
                        : "نتیجه هنوز مشخص نیست",

            story,

            news:
                "ABSURD NEWS: واکنش‌ها به تصمیم دولت ادامه دارد.",

            effects,

            relationChanges: {},

            addCrisis: "",

            resolveCrisis: "",

            nextEventHint:
                randomItem([
                    "بازار همچنان ناپایدار است.",
                    "رسانه‌ها احتمال بحران بعدی را مطرح کرده‌اند.",
                    "یک بازیگر خارجی در حال بررسی وضعیت است.",
                    "دولت باید برای تصمیم بعدی آماده باشد."
                ])

        };

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.RepublicAI = {

        version: VERSION,

        generateAIEvent,

        generateAIConsequence,

        generateFallbackEvent,

        generateFallbackConsequence,

        normalizeEvent,

        normalizeConsequence,

        normalizeEffects,

        categories:
            EVENT_CATEGORIES,

        eventCount:
            EVENTS.length

    };


    /*
     * سازگاری با game.js قبلی
     */

    window.generateAIEvent =
        generateAIEvent;

    window.generateAIConsequence =
        generateAIConsequence;


    console.log(
        "Republic AI Director " +
        VERSION +
        " loaded."
    );

})();