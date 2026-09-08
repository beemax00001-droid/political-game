/* ==================================================
   REPUBLIC OF ABSURDITY
   AI DIRECTOR
   ================================================== */

const AIDirector = {

    /*
     * وضعیت را بررسی می‌کند و اتفاق مناسب
     * را انتخاب می‌کند.
     */

    chooseEvent(state) {

        const country = state.player1;

        // بحران برق
        if (country.electricity <= 35) {

            return this.events.electricity;
        }

        // اقتصاد ضعیف
        if (country.economy <= 35) {

            return this.events.economy;
        }

        // محبوبیت پایین
        if (country.popularity <= 30) {

            return this.events.publicUnrest;
        }

        // روابط خیلی بد
        if (country.relations <= 15) {

            return this.events.diplomaticCrisis;
        }

        // تحریم شدید
        if (country.sanctions >= 60) {

            return this.events.sanctions;
        }

        // در غیر این صورت اتفاق تصادفی
        const normalEvents = [
            this.events.media,
            this.events.minister,
            this.events.neighbor,
            this.events.market
        ];

        return normalEvents[
            Math.floor(
                Math.random() * normalEvents.length
            )
        ];
    },


    /*
     * اتفاقات بازی
     */

    events: {

        electricity: {

            id: "electricity_crisis",

            icon: "⚡",

            category: "بحران زیرساخت",

            title: "برق کشور رفت!",

            description:
                "چراغ‌های چند شهر خاموش شده‌اند. بیمارستان‌ها وارد وضعیت اضطراری شده‌اند و وزیر انرژی با یک پوشه‌ی خالی وارد دفتر شما شده است.",

            choices: [

                {
                    id: "repair",

                    title:
                        "💰 پول خرج کن و شبکه را تعمیر کن",

                    effect: {

                        money: -30,

                        electricity: +25,

                        popularity: +5
                    },

                    message:
                        "شبکه برق با هزینه زیادی پایدار شد."
                },

                {
                    id: "ignore",

                    title:
                        "😐 فعلاً کاری نکن",

                    effect: {

                        electricity: -20,

                        popularity: -10
                    },

                    message:
                        "برق همچنان ناپایدار است."
                }

            ]
        },


        economy: {

            id: "economic_crisis",

            icon: "📉",

            category: "اقتصاد",

            title: "اقتصاد دارد غر می‌زند!",

            description:
                "بازار آرام نیست. قیمت‌ها بالا رفته‌اند و مشاور اقتصادی شما پیشنهادهایش را روی یک دستمال نوشته است.",

            choices: [

                {
                    id: "invest",

                    title:
                        "💰 سرمایه‌گذاری اضطراری",

                    effect: {

                        money: -25,

                        economy: +20,

                        popularity: +3
                    },

                    message:
                        "اقتصاد کمی نفس کشید."
                },

                {
                    id: "tax",

                    title:
                        "💸 افزایش مالیات",

                    effect: {

                        money: +20,

                        popularity: -15,

                        economy: -5
                    },

                    message:
                        "خزانه پرتر شد؛ مردم خوشحال نیستند."
                }

            ]
        },


        publicUnrest: {

            id: "public_unrest",

            icon: "👥",

            category: "جامعه",

            title: "مردم سؤال دارند!",

            description:
                "در شهرها مردم درباره عملکرد دولت بحث می‌کنند. رسانه‌ها هم هر پنج دقیقه یک شایعه جدید منتشر می‌کنند.",

            choices: [

                {
                    id: "speech",

                    title:
                        "🎤 سخنرانی ملی",

                    effect: {

                        popularity: +12,

                        money: -5
                    },

                    message:
                        "سخنرانی تا حدی اوضاع را آرام کرد."
                },

                {
                    id: "ignore",

                    title:
                        "🙈 نادیده بگیر",

                    effect: {

                        popularity: -15,

                        security: -5
                    },

                    message:
                        "بی‌توجهی دولت اوضاع را بدتر کرد."
                }

            ]
        },


        diplomaticCrisis: {

            id: "diplomatic_crisis",

            icon: "🌍",

            category: "دیپلماسی",

            title: "رابطه با کشور مقابل خراب شد!",

            description:
                "یک پیام عجیب در رسانه‌ها منتشر شده و کشور مقابل خواستار توضیح فوری شده است.",

            choices: [

                {
                    id: "negotiate",

                    title:
                        "🤝 مذاکره",

                    effect: {

                        relations: +20,

                        money: -10
                    },

                    message:
                        "مذاکرات موفقیت نسبی داشت."
                },

                {
                    id: "aggressive",

                    title:
                        "📢 پاسخ تند",

                    effect: {

                        relations: -20,

                        popularity: +5,

                        security: +3
                    },

                    message:
                        "تنش بیشتر شد."
                }

            ]
        },


        sanctions: {

            id: "sanctions",

            icon: "🚫",

            category: "تحریم",

            title: "تحریم‌های جدید!",

            description:
                "کشور مقابل بخشی از مبادلات اقتصادی را محدود کرده است.",

            choices: [

                {
                    id: "negotiate",

                    title:
                        "🤝 مذاکره برای رفع تحریم",

                    effect: {

                        relations: +15,

                        sanctions: -20
                    },

                    message:
                        "بخشی از محدودیت‌ها کاهش یافت."
                },

                {
                    id: "adapt",

                    title:
                        "🔧 سازگار شو",

                    effect: {

                        economy: -5,

                        sanctions: +5,

                        security: +5
                    },

                    message:
                        "کشور سعی کرد خودش را با شرایط جدید وفق دهد."
                }

            ]
        },


        media: {

            id: "media_chaos",

            icon: "📺",

            category: "رسانه",

            title: "یک شایعه عجیب منتشر شد!",

            description:
                "یک مجری تلویزیونی جمله‌ای گفته که هیچ‌کس دقیقاً نمی‌داند منظورش چه بوده؛ بازار اما آن را کاملاً جدی گرفته است.",

            choices: [

                {
                    id: "clarify",

                    title:
                        "📢 تکذیب رسمی",

                    effect: {

                        popularity: +5,

                        economy: +5
                    },

                    message:
                        "اوضاع کمی آرام شد."
                },

                {
                    id: "ignore",

                    title:
                        "🤷 بی‌خیال",

                    effect: {

                        popularity: -5,

                        economy: -5
                    },

                    message:
                        "شایعه بزرگ‌تر شد."
                }

            ]
        },


        minister: {

            id: "minister_problem",

            icon: "🧑‍💼",

            category: "دولت",

            title: "وزیر استعفا داد!",

            description:
                "وزیر مربوطه نامه استعفایش را تحویل داده و تنها توضیحش این بوده: «دیگه حوصله ندارم.»",

            choices: [

                {
                    id: "accept",

                    title:
                        "✋ استعفا را قبول کن",

                    effect: {

                        popularity: +3,

                        economy: -5
                    },

                    message:
                        "وزیر جدید باید پیدا شود."
                },

                {
                    id: "convince",

                    title:
                        "🗣️ متقاعدش کن بماند",

                    effect: {

                        money: -10,

                        popularity: +2
                    },

                    message:
                        "وزیر فعلاً ماند."
                }

            ]
        },


        neighbor: {

            id: "neighbor",

            icon: "😡",

            category: "همسایه",

            title: "همسایه ناراحت است!",

            description:
                "کشور همسایه از یک توییت عجیب ناراحت شده و خواستار توضیح شده است.",

            choices: [

                {
                    id: "apologize",

                    title:
                        "🤝 عذرخواهی دیپلماتیک",

                    effect: {

                        relations: +10,

                        popularity: -2
                    },

                    message:
                        "تنش کاهش پیدا کرد."
                },

                {
                    id: "deny",

                    title:
                        "📢 تکذیب کن",

                    effect: {

                        relations: -10,

                        popularity: +3
                    },

                    message:
                        "تنش ادامه پیدا کرد."
                }

            ]
        },


        market: {

            id: "market",

            icon: "📊",

            category: "بازار",

            title: "بازار یک تصمیم عجیب گرفته!",

            description:
                "شاخص بازار بدون دلیل مشخصی بالا و پایین می‌شود و هیچ‌کس نمی‌داند چرا.",

            choices: [

                {
                    id: "support",

                    title:
                        "💰 حمایت اضطراری",

                    effect: {

                        money: -15,

                        economy: +10
                    },

                    message:
                        "بازار آرام‌تر شد."
                },

                {
                    id: "wait",

                    title:
                        "⏳ صبر کن",

                    effect: {

                        economy: -5,

                        money: +5
                    },

                    message:
                        "فعلاً صبر کردی."
                }

            ]
        }

    },


    /*
     * متن کوتاه برای پنل AI
     */

    explain(state) {

        const country = state.player1;

        if (country.electricity < 30) {
            return "برق کشور در وضعیت خطرناک قرار دارد.";
        }

        if (country.economy < 30) {
            return "اقتصاد کشور نیاز به توجه فوری دارد.";
        }

        if (country.popularity < 30) {
            return "محبوبیت دولت در حال سقوط است.";
        }

        if (country.sanctions > 60) {
            return "تحریم‌ها فشار زیادی ایجاد کرده‌اند.";
        }

        return "فعلاً بحران فوری دیده نمی‌شود؛ اما اوضاع می‌تواند هر لحظه عجیب شود.";
    }

};