/* ==================================================
   REPUBLIC OF ABSURDITY
   AI DIRECTOR
   REAL AI + VALIDATION + FALLBACK
   ================================================== */


/* ==================================================
   AI SERVER
================================================== */

const AI_SERVER =
    "https://political-game-ai.tm1190128.workers.dev";


/* ==================================================
   CONSTANTS
================================================== */

const AI_MAX_CHOICES = 3;


/* ==================================================
   UTILITY
================================================== */

function safeNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function cleanText(value, fallback = "") {

    if (
        typeof value !== "string"
    ) {

        return fallback;

    }

    const text =
        value
            .trim()
            .replace(/\s+/g, " ");

    return text || fallback;
}


function createChoiceId(
    index
) {

    return (
        "choice_" +
        Date.now() +
        "_" +
        index +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 7)
    );
}


/* ==================================================
   VALIDATE EFFECT
================================================== */

function validateEffect(
    effect
) {

    if (
        !effect ||
        typeof effect !== "object" ||
        Array.isArray(effect)
    ) {

        return {};

    }

    const allowedStats = [

        "money",
        "electricity",
        "economy",
        "popularity",
        "security",
        "relations",
        "sanctions"

    ];

    const result = {};

    allowedStats.forEach(
        key => {

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(effect, key)
            ) {

                const value =
                    Number(
                        effect[key]
                    );

                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    /*
                     * جلوگیری از اثرات
                     * غیرعادی بیش از حد
                     */

                    result[key] =
                        Math.max(
                            -100,
                            Math.min(
                                100,
                                value
                            )
                        );

                }

            }

        }
    );

    return result;
}


/* ==================================================
   VALIDATE CHOICE
================================================== */

function validateChoice(
    choice,
    index
) {

    if (
        !choice ||
        typeof choice !== "object"
    ) {

        return null;

    }

    const title =
        cleanText(
            choice.title
        );

    if (!title) {

        return null;

    }

    let id =
        cleanText(
            choice.id
        );

    if (!id) {

        id =
            createChoiceId(
                index
            );

    }

    return {

        id: id,

        title:
            title.substring(
                0,
                180
            ),

        effect:
            validateEffect(
                choice.effect
            ),

        message:
            cleanText(
                choice.message,
                "تصمیم اجرا شد."
            ).substring(
                0,
                500
            )

    };
}


/* ==================================================
   VALIDATE AI EVENT
================================================== */

function validateAIEvent(
    data
) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        return null;

    }

    const title =
        cleanText(
            data.title
        );

    const description =
        cleanText(
            data.description
        );

    if (
        !title ||
        !description
    ) {

        return null;

    }

    if (
        !Array.isArray(
            data.choices
        )
    ) {

        return null;

    }

    /*
     * دقیقاً سه انتخاب
     */

    if (
        data.choices.length <
        AI_MAX_CHOICES
    ) {

        return null;

    }

    const choices = [];

    for (
        let i = 0;
        i < AI_MAX_CHOICES;
        i++
    ) {

        const choice =
            validateChoice(
                data.choices[i],
                i
            );

        if (!choice) {

            return null;

        }

        choices.push(
            choice
        );

    }

    return {

        id:
            cleanText(
                data.id,
                "ai_" +
                Date.now()
            ),

        icon:
            cleanText(
                data.icon,
                "🎬"
            ).substring(
                0,
                10
            ),

        category:
            cleanText(
                data.category,
                "اتفاق"
            ).substring(
                0,
                60
            ),

        title:
            title.substring(
                0,
                180
            ),

        description:
            description.substring(
                0,
                1000
            ),

        choices:
            choices

    };
}


/* ==================================================
   BUILD AI REQUEST
================================================== */

function buildAIRequest(
    gameState,
    history
) {

    return {

        gameState:
            gameState || {},

        history:
            Array.isArray(history)
                ? history.slice(-30)
                : []

    };
}


/* ==================================================
   REAL AI
================================================== */

async function generateAIEvent(
    gameState = {},
    history = []
) {

    try {

        const requestBody =
            buildAIRequest(
                gameState,
                history
            );


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => {

                    controller.abort();

                },
                25000
            );


        let response;

        try {

            response =
                await fetch(
                    AI_SERVER,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            ),

                        signal:
                            controller.signal

                    }
                );

        } finally {

            clearTimeout(
                timeout
            );

        }


        if (!response.ok) {

            const errorText =
                await response
                    .text()
                    .catch(
                        () => ""
                    );

            throw new Error(
                "AI Server Error " +
                response.status +
                (
                    errorText
                        ? ": " +
                          errorText
                        : ""
                )
            );

        }


        const rawText =
            await response.text();


        if (!rawText) {

            throw new Error(
                "AI server returned empty response"
            );

        }


        let data;

        try {

            data =
                JSON.parse(
                    rawText
                );

        } catch {

            throw new Error(
                "AI server returned invalid JSON"
            );

        }


        /*
         * Worker ممکن است
         * خطا را داخل JSON برگرداند.
         */

        if (
            data &&
            data.error
        ) {

            throw new Error(
                cleanText(
                    data.details ||
                    data.error,
                    "Unknown AI error"
                )
            );

        }


        /*
         * اعتبارسنجی کامل
         */

        const validEvent =
            validateAIEvent(
                data
            );


        if (!validEvent) {

            throw new Error(
                "AI response format is invalid"
            );

        }


        console.log(
            "AI EVENT:",
            validEvent
        );


        return validEvent;

    } catch (error) {

        console.error(
            "REAL AI ERROR:",
            error
        );


        /*
         * AI خراب شد؟
         * بازی نباید متوقف شود.
         */

        return getFallbackEvent(
            gameState
        );

    }

}


/* ==================================================
   FALLBACK EVENT
================================================== */

function getFallbackEvent(
    state = {}
) {

    let fallback;

    /*
     * وضعیت بازیکن فعلی را بررسی می‌کنیم،
     * نه همیشه بازیکن اول.
     */

    const currentPlayer =
        Number(
            state.currentPlayer
        ) === 2
            ? 2
            : 1;


    const country =
        currentPlayer === 2
            ? (
                state.player2 ||
                {}
            )
            : (
                state.player1 ||
                {}
            );


    /*
     * بحران برق
     */

    if (
        safeNumber(
            country.electricity,
            80
        ) <= 35
    ) {

        fallback =
            cloneEvent(
                AIDirector.events.electricity
            );

    }


    /*
     * بحران اقتصادی
     */

    else if (
        safeNumber(
            country.economy,
            70
        ) <= 35
    ) {

        fallback =
            cloneEvent(
                AIDirector.events.economy
            );

    }


    /*
     * محبوبیت پایین
     */

    else if (
        safeNumber(
            country.popularity,
            60
        ) <= 30
    ) {

        fallback =
            cloneEvent(
                AIDirector.events.publicUnrest
            );

    }


    /*
     * روابط بسیار بد
     */

    else if (
        safeNumber(
            country.relations,
            50
        ) <= 15
    ) {

        fallback =
            cloneEvent(
                AIDirector.events.diplomaticCrisis
            );

    }


    /*
     * تحریم زیاد
     */

    else if (
        safeNumber(
            country.sanctions,
            0
        ) >= 60
    ) {

        fallback =
            cloneEvent(
                AIDirector.events.sanctions
            );

    }


    /*
     * اتفاق عادی
     */

    else {

        const normalEvents = [

            AIDirector.events.media,

            AIDirector.events.minister,

            AIDirector.events.neighbor,

            AIDirector.events.market

        ];

        fallback =
            cloneEvent(
                normalEvents[
                    Math.floor(
                        Math.random() *
                        normalEvents.length
                    )
                ]
            );

    }


    /*
     * شناسه متفاوت برای هر بار fallback
     */

    fallback.id =
        "fallback_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 7);


    return fallback;
}


/* ==================================================
   CLONE EVENT
================================================== */

function cloneEvent(
    event
) {

    return JSON.parse(
        JSON.stringify(
            event
        )
    );

}


/* ==================================================
   FALLBACK AI DIRECTOR
================================================== */

const AIDirector = {


    /* ==================================================
       CHOOSE EVENT
    ================================================== */

    chooseEvent(
        state = {}
    ) {

        return getFallbackEvent(
            state
        );

    },


    /* ==================================================
       EVENTS
    ================================================== */

    events: {


        /* ==============================================
           ELECTRICITY
        ============================================== */

        electricity: {

            id:
                "electricity_crisis",

            icon:
                "⚡",

            category:
                "بحران زیرساخت",

            title:
                "برق کشور رفت!",

            description:
                "چند شهر خاموش شده‌اند و وزیر انرژی با یک پوشه خالی وارد دفتر شما شده است.",

            choices: [

                {

                    id:
                        "repair",

                    title:
                        "💰 پول خرج کن و شبکه را تعمیر کن",

                    effect: {

                        money:
                            -30,

                        electricity:
                            25,

                        popularity:
                            5

                    },

                    message:
                        "شبکه برق با هزینه زیادی پایدار شد."

                },


                {

                    id:
                        "ignore",

                    title:
                        "😐 فعلاً کاری نکن",

                    effect: {

                        electricity:
                            -20,

                        popularity:
                            -10

                    },

                    message:
                        "برق همچنان ناپایدار است."

                },


                {

                    id:
                        "emergency",

                    title:
                        "⚡ برنامه اضطراری اجرا کن",

                    effect: {

                        money:
                            -10,

                        electricity:
                            10,

                        security:
                            -3

                    },

                    message:
                        "برق موقتاً برگشت اما زیرساخت همچنان مشکل دارد."

                }

            ]

        },


        /* ==============================================
           ECONOMY
        ============================================== */

        economy: {

            id:
                "economic_crisis",

            icon:
                "📉",

            category:
                "اقتصاد",

            title:
                "اقتصاد دارد غر می‌زند!",

            description:
                "قیمت‌ها بالا رفته‌اند و مشاور اقتصادی پیشنهادهایش را روی یک دستمال نوشته است.",

            choices: [

                {

                    id:
                        "invest",

                    title:
                        "💰 سرمایه‌گذاری اضطراری",

                    effect: {

                        money:
                            -25,

                        economy:
                            20,

                        popularity:
                            3

                    },

                    message:
                        "اقتصاد کمی نفس کشید."

                },


                {

                    id:
                        "tax",

                    title:
                        "💸 افزایش مالیات",

                    effect: {

                        money:
                            20,

                        popularity:
                            -15,

                        economy:
                            -5

                    },

                    message:
                        "خزانه پرتر شد؛ مردم خوشحال نیستند."

                },


                {

                    id:
                        "wait",

                    title:
                        "⏳ فعلاً صبر کن",

                    effect: {

                        economy:
                            -8,

                        money:
                            5

                    },

                    message:
                        "دولت تصمیم گرفت فعلاً دخالت نکند."

                }

            ]

        },


        /* ==============================================
           PUBLIC UNREST
        ============================================== */

        publicUnrest: {

            id:
                "public_unrest",

            icon:
                "👥",

            category:
                "جامعه",

            title:
                "مردم سؤال دارند!",

            description:
                "مردم درباره عملکرد دولت بحث می‌کنند و رسانه‌ها هر پنج دقیقه یک شایعه جدید منتشر می‌کنند.",

            choices: [

                {

                    id:
                        "speech",

                    title:
                        "🎤 سخنرانی ملی",

                    effect: {

                        popularity:
                            12,

                        money:
                            -5

                    },

                    message:
                        "سخنرانی تا حدی اوضاع را آرام کرد."

                },


                {

                    id:
                        "ignore",

                    title:
                        "🙈 نادیده بگیر",

                    effect: {

                        popularity:
                            -15,

                        security:
                            -5

                    },

                    message:
                        "بی‌توجهی دولت اوضاع را بدتر کرد."

                },


                {

                    id:
                        "reform",

                    title:
                        "📝 وعده اصلاحات فوری",

                    effect: {

                        popularity:
                            8,

                        money:
                            -12,

                        economy:
                            -2

                    },

                    message:
                        "مردم امیدوار شدند، اما حالا منتظر نتیجه هستند."

                }

            ]

        },


        /* ==============================================
           DIPLOMATIC CRISIS
        ============================================== */

        diplomaticCrisis: {

            id:
                "diplomatic_crisis",

            icon:
                "🌍",

            category:
                "دیپلماسی",

            title:
                "رابطه با کشور مقابل خراب شد!",

            description:
                "یک پیام عجیب در رسانه‌ها منتشر شده و کشور مقابل خواستار توضیح فوری شده است.",

            choices: [

                {

                    id:
                        "negotiate",

                    title:
                        "🤝 مذاکره",

                    effect: {

                        relations:
                            20,

                        money:
                            -10

                    },

                    message:
                        "مذاکرات موفقیت نسبی داشت."

                },


                {

                    id:
                        "aggressive",

                    title:
                        "📢 پاسخ تند",

                    effect: {

                        relations:
                            -20,

                        popularity:
                            5,

                        security:
                            3

                    },

                    message:
                        "تنش بیشتر شد."

                },


                {

                    id:
                        "media",

                    title:
                        "📺 کمپین رسانه‌ای",

                    effect: {

                        popularity:
                            6,

                        relations:
                            -8,

                        money:
                            -5

                    },

                    message:
                        "افکار عمومی داخلی تغییر کرد اما روابط خارجی آسیب دید."

                }

            ]

        },


        /* ==============================================
           SANCTIONS
        ============================================== */

        sanctions: {

            id:
                "sanctions",

            icon:
                "🚫",

            category:
                "تحریم",

            title:
                "تحریم‌های جدید!",

            description:
                "کشور مقابل بخشی از مبادلات اقتصادی را محدود کرده است.",

            choices: [

                {

                    id:
                        "negotiate",

                    title:
                        "🤝 مذاکره برای رفع تحریم",

                    effect: {

                        relations:
                            15,

                        sanctions:
                            -20

                    },

                    message:
                        "بخشی از محدودیت‌ها کاهش یافت."

                },


                {

                    id:
                        "adapt",

                    title:
                        "🔧 سازگار شو",

                    effect: {

                        economy:
                            -5,

                        sanctions:
                            5,

                        security:
                            5

                    },

                    message:
                        "کشور خودش را با شرایط جدید وفق داد."

                },


                {

                    id:
                        "trade",

                    title:
                        "💼 پیدا کردن بازار جدید",

                    effect: {

                        money:
                            -10,

                        economy:
                            8,

                        relations:
                            -3

                    },

                    message:
                        "بازارهای جدید پیدا شدند اما روابط پیچیده‌تر شد."

                }

            ]

        },


        /* ==============================================
           MEDIA
        ============================================== */

        media: {

            id:
                "media_chaos",

            icon:
                "📺",

            category:
                "رسانه",

            title:
                "یک شایعه عجیب منتشر شد!",

            description:
                "یک مجری تلویزیونی جمله‌ای گفته که هیچ‌کس دقیقاً نمی‌داند منظورش چه بوده؛ بازار اما آن را کاملاً جدی گرفته است.",

            choices: [

                {

                    id:
                        "clarify",

                    title:
                        "📢 تکذیب رسمی",

                    effect: {

                        popularity:
                            5,

                        economy:
                            5

                    },

                    message:
                        "اوضاع کمی آرام شد."

                },


                {

                    id:
                        "ignore",

                    title:
                        "🤷 بی‌خیال",

                    effect: {

                        popularity:
                            -5,

                        economy:
                            -5

                    },

                    message:
                        "شایعه بزرگ‌تر شد."

                },


                {

                    id:
                        "investigate",

                    title:
                        "🔎 بررسی منبع شایعه",

                    effect: {

                        money:
                            -5,

                        security:
                            4,

                        popularity:
                            2

                    },

                    message:
                        "منبع شایعه پیدا نشد اما دولت اطلاعات بیشتری به دست آورد."

                }

            ]

        },


        /* ==============================================
           MINISTER
        ============================================== */

        minister: {

            id:
                "minister_problem",

            icon:
                "🧑‍💼",

            category:
                "دولت",

            title:
                "وزیر استعفا داد!",

            description:
                "وزیر مربوطه نامه استعفایش را تحویل داده و تنها توضیحش این بوده: «دیگه حوصله ندارم.»",

            choices: [

                {

                    id:
                        "accept",

                    title:
                        "✋ استعفا را قبول کن",

                    effect: {

                        popularity:
                            3,

                        economy:
                            -5

                    },

                    message:
                        "وزیر جدید باید پیدا شود."

                },


                {

                    id:
                        "convince",

                    title:
                        "🗣️ متقاعدش کن بماند",

                    effect: {

                        money:
                            -10,

                        popularity:
                            2

                    },

                    message:
                        "وزیر فعلاً ماند."

                },


                {

                    id:
                        "replace",

                    title:
                        "🔄 فوراً جایگزینش کن",

                    effect: {

                        money:
                            -15,

                        security:
                            3,

                        economy:
                            3

                    },

                    message:
                        "وزیر جدید با وعده‌های عجیب وارد کابینه شد."

                }

            ]

        },


        /* ==============================================
           NEIGHBOR
        ============================================== */

        neighbor: {

            id:
                "neighbor",

            icon:
                "😡",

            category:
                "همسایه",

            title:
                "همسایه ناراحت است!",

            description:
                "کشور همسایه از یک توییت عجیب ناراحت شده و خواستار توضیح شده است.",

            choices: [

                {

                    id:
                        "apologize",

                    title:
                        "🤝 عذرخواهی دیپلماتیک",

                    effect: {

                        relations:
                            10,

                        popularity:
                            -2

                    },

                    message:
                        "تنش کاهش پیدا کرد."

                },


                {

                    id:
                        "deny",

                    title:
                        "📢 تکذیب کن",

                    effect: {

                        relations:
                            -10,

                        popularity:
                            3

                    },

                    message:
                        "تنش ادامه پیدا کرد."

                },


                {

                    id:
                        "invite",

                    title:
                        "🍽️ دعوت به گفت‌وگو",

                    effect: {

                        money:
                            -5,

                        relations:
                            12

                    },

                    message:
                        "دو کشور تصمیم گرفتند فعلاً با هم حرف بزنند."

                }

            ]

        },


        /* ==============================================
           MARKET
        ============================================== */

        market: {

            id:
                "market",

            icon:
                "📊",

            category:
                "بازار",

            title:
                "بازار یک تصمیم عجیب گرفته!",

            description:
                "شاخص بازار بدون دلیل مشخصی بالا و پایین می‌شود و هیچ‌کس نمی‌داند چرا.",

            choices: [

                {

                    id:
                        "support",

                    title:
                        "💰 حمایت اضطراری",

                    effect: {

                        money:
                            -15,

                        economy:
                            10

                    },

                    message:
                        "بازار آرام‌تر شد."

                },


                {

                    id:
                        "wait",

                    title:
                        "⏳ صبر کن",

                    effect: {

                        economy:
                            -5,

                        money:
                            5

                    },

                    message:
                        "فعلاً صبر کردی."

                },


                {

                    id:
                        "announce",

                    title:
                        "📢 اعلام برنامه اقتصادی",

                    effect: {

                        popularity:
                            4,

                        economy:
                            4,

                        money:
                            -8

                    },

                    message:
                        "بازار برای مدتی آرام‌تر شد."

                }

            ]

        }

    },


    /* ==================================================
       EXPLAIN
    ================================================== */

    explain(
        state = {}
    ) {

        const currentPlayer =
            Number(
                state.currentPlayer
            ) === 2
                ? 2
                : 1;


        const country =
            currentPlayer === 2
                ? (
                    state.player2 ||
                    {}
                )
                : (
                    state.player1 ||
                    {}
                );


        if (
            safeNumber(
                country.electricity,
                80
            ) < 30
        ) {

            return
                "⚡ برق کشور در وضعیت خطرناک قرار دارد.";

        }


        if (
            safeNumber(
                country.economy,
                70
            ) < 30
        ) {

            return
                "📉 اقتصاد کشور نیاز به توجه فوری دارد.";

        }


        if (
            safeNumber(
                country.popularity,
                60
            ) < 30
        ) {

            return
                "👥 محبوبیت دولت در حال سقوط است.";

        }


        if (
            safeNumber(
                country.sanctions,
                0
            ) > 60
        ) {

            return
                "🚫 تحریم‌ها فشار زیادی ایجاد کرده‌اند.";

        }


        if (
            safeNumber(
                country.relations,
                50
            ) < 20
        ) {

            return
                "🌍 روابط خارجی کشور متشنج شده است.";

        }


        return
            "🤖 فعلاً بحران فوری دیده نمی‌شود؛ اما در جمهوری مسخره‌ها هیچ‌چیز برای مدت زیادی عادی نمی‌ماند.";

    }

};


/* ==================================================
   GLOBAL ACCESS
================================================== */

window.generateAIEvent =
    generateAIEvent;

window.AIDirector =
    AIDirector;