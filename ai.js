/* =========================================================
   REPUBLIC OF ABSURDITY
   AI DIRECTOR v2.0

   وظیفه:
   - ارتباط بازی با AI Worker
   - ساخت اتفاق‌های جدید
   - اعتبارسنجی جواب AI
   - جلوگیری از خراب شدن بازی
   - آماده‌سازی سیستم پیامد تصمیمات
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const AI_SERVER =
        "https://political-game-ai.tm1190128.workers.dev";

    const REQUEST_TIMEOUT = 30000;


    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    function safeString(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }

        return String(value).trim();
    }


    function clampNumber(value, min, max, fallback = 0) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return Math.max(min, Math.min(max, number));
    }


    function createId(prefix = "ai") {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }


    /* =====================================================
       JSON CLEANER
    ===================================================== */

    function cleanAIText(text) {

        if (typeof text !== "string") {
            return text;
        }

        let result = text.trim();

        // حذف ```json و ```
        result = result
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        return result;
    }


    function extractJSON(value) {

        if (!value) {
            return null;
        }

        if (typeof value === "object") {
            return value;
        }

        const cleaned = cleanAIText(value);

        try {
            return JSON.parse(cleaned);
        } catch (error) {
            // ادامه می‌دهیم و JSON داخل متن را پیدا می‌کنیم
        }

        const firstObject = cleaned.indexOf("{");
        const lastObject = cleaned.lastIndexOf("}");

        if (
            firstObject !== -1 &&
            lastObject !== -1 &&
            lastObject > firstObject
        ) {

            const possibleJSON =
                cleaned.slice(firstObject, lastObject + 1);

            try {
                return JSON.parse(possibleJSON);
            } catch (error) {
                return null;
            }
        }

        return null;
    }


    /* =====================================================
       HTTP REQUEST
    ===================================================== */

    async function requestAI(payload) {

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, REQUEST_TIMEOUT);


        try {

            const response = await fetch(AI_SERVER, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload),

                signal: controller.signal
            });


            const rawText = await response.text();

            let data = null;

            try {
                data = JSON.parse(rawText);
            } catch (error) {
                data = extractJSON(rawText);
            }


            if (!response.ok) {

                throw new Error(
                    "AI Server Error: " +
                    response.status
                );
            }


            if (!data) {
                throw new Error("AI returned invalid JSON");
            }


            return data;

        } catch (error) {

            if (error.name === "AbortError") {
                throw new Error("AI request timed out");
            }

            throw error;

        } finally {

            clearTimeout(timeout);
        }
    }


    /* =====================================================
       GET AI RESULT
    ===================================================== */

    function unwrapResult(data) {

        if (!data) {
            return null;
        }

        // حالت:
        // { ok:true, result:{...} }

        if (data.result && typeof data.result === "object") {
            return data.result;
        }

        // حالت:
        // { data:{...} }

        if (data.data && typeof data.data === "object") {
            return data.data;
        }

        // خود object
        return data;
    }


    /* =====================================================
       EFFECT NORMALIZER
    ===================================================== */

    function normalizeEffects(effects) {

        if (!effects || typeof effects !== "object") {
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

        for (const stat of allowedStats) {

            if (
                effects[stat] !== undefined &&
                effects[stat] !== null
            ) {

                const value = Number(effects[stat]);

                if (Number.isFinite(value)) {

                    result[stat] =
                        Math.max(-100, Math.min(100, value));
                }
            }
        }


        return result;
    }


    /* =====================================================
       CHOICE NORMALIZER
    ===================================================== */

    function normalizeChoice(choice, index) {

        if (!choice || typeof choice !== "object") {
            return null;
        }


        const title =
            safeString(
                choice.title,
                "تصمیم " + (index + 1)
            );


        const description =
            safeString(
                choice.description,
                "این تصمیم را اجرا کن."
            );


        return {

            id:
                safeString(
                    choice.id,
                    "choice_" + (index + 1)
                ),

            title,

            description,

            effects:
                normalizeEffects(choice.effects),

            targetPlayerId:
                choice.targetPlayerId
                    ? safeString(choice.targetPlayerId)
                    : null
        };
    }


    /* =====================================================
       EVENT NORMALIZER
    ===================================================== */

    function normalizeEvent(raw) {

        const event = unwrapResult(raw);

        if (!event || typeof event !== "object") {
            throw new Error("AI event is not an object");
        }


        let choices = Array.isArray(event.choices)
            ? event.choices
            : [];


        choices = choices
            .slice(0, 3)
            .map(normalizeChoice)
            .filter(Boolean);


        // بازی فعلاً دقیقاً 3 انتخاب می‌خواهد
        if (choices.length !== 3) {
            throw new Error(
                "AI must return exactly 3 choices"
            );
        }


        // جلوگیری از ID تکراری
        const usedIds = new Set();

        choices = choices.map((choice, index) => {

            let id = choice.id;

            if (usedIds.has(id)) {
                id = "choice_" + (index + 1);
            }

            usedIds.add(id);

            return {
                ...choice,
                id
            };
        });


        return {

            id:
                safeString(
                    event.id,
                    createId("event")
                ),

            title:
                safeString(
                    event.title,
                    "یک اتفاق عجیب رخ داد"
                ),

            description:
                safeString(
                    event.description,
                    "شرایط کشور تغییر کرده است."
                ),

            type:
                safeString(
                    event.type,
                    "normal"
                ),

            category:
                safeString(
                    event.category,
                    "general"
                ),

            severity:
                clampNumber(
                    event.severity,
                    1,
                    10,
                    5
                ),

            targetPlayerId:
                event.targetPlayerId
                    ? safeString(event.targetPlayerId)
                    : null,

            actorPlayerId:
                event.actorPlayerId
                    ? safeString(event.actorPlayerId)
                    : null,

            news:
                safeString(
                    event.news,
                    ""
                ),

            choices
        };
    }


    /* =====================================================
       BUILD SMALL GAME STATE
    ===================================================== */

    function prepareGameState(gameState) {

        if (!gameState || typeof gameState !== "object") {
            return {};
        }


        return {

            version:
                gameState.version || 2,

            turn:
                gameState.turn || 1,

            maxTurns:
                gameState.maxTurns || 30,

            currentPlayerIndex:
                gameState.currentPlayerIndex || 0,

            currentPlayer:
                gameState.currentPlayer || null,

            players:
                Array.isArray(gameState.players)
                    ? gameState.players
                    : [],

            countries:
                gameState.countries || {},

            relations:
                gameState.relations || {},

            world:
                gameState.world || {},

            activeCrises:
                Array.isArray(gameState.activeCrises)
                    ? gameState.activeCrises.slice(-15)
                    : [],

            recentNews:
                Array.isArray(gameState.recentNews)
                    ? gameState.recentNews.slice(-15)
                    : [],

            history:
                Array.isArray(gameState.history)
                    ? gameState.history.slice(-15)
                    : []
        };
    }


    /* =====================================================
       PREPARE HISTORY
    ===================================================== */

    function prepareHistory(history) {

        if (!Array.isArray(history)) {
            return [];
        }


        return history
            .slice(-20)
            .map(item => {

                if (!item || typeof item !== "object") {
                    return null;
                }

                return {

                    turn:
                        item.turn || null,

                    playerId:
                        item.playerId || null,

                    playerName:
                        item.playerName || null,

                    countryName:
                        item.countryName || null,

                    eventTitle:
                        item.eventTitle || null,

                    choiceTitle:
                        item.choiceTitle || null,

                    effects:
                        item.effects || {},

                    timestamp:
                        item.timestamp || null
                };
            })
            .filter(Boolean);
    }


    /* =====================================================
       GENERATE EVENT
    ===================================================== */

    async function generateAIEvent(gameState, history = []) {

        const preparedState =
            prepareGameState(gameState);

        const preparedHistory =
            prepareHistory(history);


        const payload = {

            mode: "event",

            gameState:
                preparedState,

            history:
                preparedHistory
        };


        try {

            const response =
                await requestAI(payload);


            const event =
                normalizeEvent(response);


            return event;

        } catch (error) {

            console.warn(
                "[AI DIRECTOR] Event generation failed:",
                error
            );


            // اگر AI خراب شد بازی متوقف نشود
            return createFallbackEvent(
                preparedState
            );
        }
    }


    /* =====================================================
       GENERATE CONSEQUENCE
       برای مرحله بعدی بازی
    ===================================================== */

    async function generateAIConsequence(
        gameState,
        history = [],
        decision = {}
    ) {

        const payload = {

            mode: "consequence",

            gameState:
                prepareGameState(gameState),

            history:
                prepareHistory(history),

            decision
        };


        try {

            const response =
                await requestAI(payload);


            return normalizeConsequence(response);

        } catch (error) {

            console.warn(
                "[AI DIRECTOR] Consequence generation failed:",
                error
            );


            return createFallbackConsequence(
                decision
            );
        }
    }


    /* =====================================================
       CONSEQUENCE NORMALIZER
    ===================================================== */

    function normalizeConsequence(raw) {

        const data = unwrapResult(raw);


        if (!data || typeof data !== "object") {
            throw new Error(
                "Invalid consequence"
            );
        }


        return {

            title:
                safeString(
                    data.title,
                    "پیامد تصمیم"
                ),

            story:
                safeString(
                    data.story,
                    "تصمیم شما روی شرایط کشور تأثیر گذاشت."
                ),

            news:
                safeString(
                    data.news,
                    ""
                ),

            effects:
                normalizeEffects(data.effects),

            relationChanges:
                data.relationChanges &&
                typeof data.relationChanges === "object"
                    ? data.relationChanges
                    : {},

            addCrisis:
                data.addCrisis || null,

            resolveCrisis:
                data.resolveCrisis || null,

            nextEventHint:
                safeString(
                    data.nextEventHint,
                    ""
                )
        };
    }


    /* =====================================================
       FALLBACK EVENT
    ===================================================== */

    function createFallbackEvent(gameState = {}) {

        const player =
            gameState.currentPlayer || {};

        const geography =
            safeString(
                player.geographyName,
                "منطقه"
            );


        const world =
            gameState.world || {};


        let title =
            "جلسه اضطراری دولت";


        let description =
            "گزارش‌های تازه نشان می‌دهند شرایط کشور نیاز به یک تصمیم فوری دارد.";


        let type =
            "normal";


        let category =
            "politics";


        // بر اساس وضعیت جهان تغییر کند
        if ((world.climatePressure || 0) >= 60) {

            title =
                "هشدار اقلیمی";

            description =
                "افزایش فشار اقلیمی باعث ایجاد یک مشکل تازه در کشور شده است.";

            type =
                "environment";

            category =
                "environment";

        } else if ((world.globalEconomy || 65) <= 40) {

            title =
                "بحران اقتصادی";

            description =
                "افت اقتصاد جهانی فشار تازه‌ای بر بازار داخلی وارد کرده است.";

            type =
                "economy";

            category =
                "economy";

        } else if (
            player.popularity !== undefined &&
            player.popularity <= 35
        ) {

            title =
                "افت محبوبیت دولت";

            description =
                "افزایش نارضایتی عمومی دولت را مجبور به واکنش سریع کرده است.";

            type =
                "politics";

            category =
                "politics";

        }


        return {

            id:
                createId("fallback"),

            title,

            description:
                description +
                " جغرافیای " +
                geography +
                " نیز در شدت آن نقش دارد.",

            type,

            category,

            severity: 5,

            targetPlayerId:
                player.playerId || null,

            actorPlayerId:
                player.playerId || null,

            news:
                "خبر فوری: دولت در حال بررسی یک تصمیم مهم است.",

            choices: [

                {
                    id: "fallback_1",

                    title:
                        "اقدام فوری",

                    description:
                        "دولت منابعی را برای کنترل سریع مشکل اختصاص می‌دهد.",

                    effects: {

                        money: -8,

                        economy: 4,

                        popularity: 3,

                        security: 1
                    },

                    targetPlayerId:
                        player.playerId || null
                },

                {
                    id: "fallback_2",

                    title:
                        "صبر و بررسی",

                    description:
                        "دولت فعلاً شرایط را زیر نظر می‌گیرد.",

                    effects: {

                        money: 2,

                        popularity: -3,

                        economy: 1
                    },

                    targetPlayerId:
                        player.playerId || null
                },

                {
                    id: "fallback_3",

                    title:
                        "درخواست همکاری",

                    description:
                        "دولت برای حل مشکل از سایر کشورها درخواست همکاری می‌کند.",

                    effects: {

                        money: -3,

                        relations: 6,

                        economy: 2,

                        popularity: 1
                    },

                    targetPlayerId:
                        player.playerId || null
                }
            ]
        };
    }


    /* =====================================================
       FALLBACK CONSEQUENCE
    ===================================================== */

    function createFallbackConsequence(decision = {}) {

        return {

            title:
                "پیامد تصمیم دولت",

            story:
                "تصمیم شما اجرا شد و شرایط کشور وارد مرحله جدیدی شد.",

            news:
                "خبر فوری: تصمیم دولت واکنش‌های مختلفی ایجاد کرد.",

            effects:
                normalizeEffects(
                    decision.effects || {}
                ),

            relationChanges:
                {},

            addCrisis:
                null,

            resolveCrisis:
                null,

            nextEventHint:
                "واکنش عمومی و اقتصادی به تصمیم اخیر بررسی شود."
        };
    }


    /* =====================================================
       HEALTH CHECK
    ===================================================== */

    async function checkAIServer() {

        try {

            const response =
                await fetch(
                    AI_SERVER,
                    {
                        method: "GET"
                    }
                );


            if (!response.ok) {
                return false;
            }


            const data =
                await response.json();


            return data &&
                data.online === true;

        } catch (error) {

            console.warn(
                "[AI DIRECTOR] Server unavailable",
                error
            );

            return false;
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.generateAIEvent =
        generateAIEvent;

    window.generateAIConsequence =
        generateAIConsequence;

    window.checkAIServer =
        checkAIServer;


    window.AIDirector = {

        generateEvent:
            generateAIEvent,

        generateConsequence:
            generateAIConsequence,

        checkServer:
            checkAIServer,

        fallbackEvent:
            createFallbackEvent,

        fallbackConsequence:
            createFallbackConsequence,

        version:
            "2.0"
    };


    console.log(
        "🤖 Republic of Absurdity AI Director v2.0 loaded"
    );

})();