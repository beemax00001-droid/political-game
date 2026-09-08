/* =========================================================
   REPUBLIC OF ABSURDITY
   OFFICE 3D ENGINE v4.0
   CINEMATIC PRESIDENTIAL OFFICE
   NEWS MONITOR + CAMERA EVENTS + DYNAMIC SCREEN
   MOBILE OPTIMIZED
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const VERSION = "4.0";

    const CONFIG = {
        background: 0x050914,
        floor: 0x171c26,
        wall: 0x111827,
        wall2: 0x0b1220,
        wood: 0x382719,
        woodDark: 0x21160f,
        gold: 0xcaa84e,
        leather: 0x17191d,
        metal: 0x777f8c,

        cameraStart: {
            x: 0,
            y: 7.5,
            z: 16
        },

        cameraTarget: {
            x: 0,
            y: 4.2,
            z: -3
        },

        monitorPosition: {
            x: 0,
            y: 5.6,
            z: -5.0
        }
    };

    /* =====================================================
       GLOBALS
    ===================================================== */

    let container = null;

    let scene = null;
    let camera = null;
    let renderer = null;

    let clock = null;

    let officeGroup = null;
    let monitorGroup = null;
    let monitorScreen = null;

    let monitorGlow = null;
    let monitorNewsCanvas = null;
    let monitorNewsTexture = null;

    let cameraAnimating = false;

    let cameraFrom = null;
    let cameraTo = null;

    let targetFrom = null;
    let targetTo = null;

    let animationStart = 0;
    let animationDuration = 1000;

    let currentNews = null;

    let resizeObserver = null;
    let mutationObserver = null;

    let initialized = false;

    /* =====================================================
       HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function clamp(value, min = 0, max = 100) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function safeString(value, fallback = "") {
        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }

        return String(value);
    }

    function escapeText(value) {
        return safeString(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    /* =====================================================
       CONTAINER
    ===================================================== */

    function getContainer() {

        container = $("office3d");

        if (!container) {

            console.warn(
                "[Office3D] #office3d not found."
            );

            return false;
        }

        return true;
    }

    /* =====================================================
       SCENE
    ===================================================== */

    function createScene() {

        scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                CONFIG.background
            );

        scene.fog =
            new THREE.Fog(
                CONFIG.background,
                16,
                45
            );
    }

    /* =====================================================
       CAMERA
    ===================================================== */

    function createCamera() {

        const width =
            Math.max(
                container.clientWidth,
                1
            );

        const height =
            Math.max(
                container.clientHeight,
                1
            );

        camera =
            new THREE.PerspectiveCamera(
                48,
                width / height,
                0.1,
                100
            );

        camera.position.set(
            CONFIG.cameraStart.x,
            CONFIG.cameraStart.y,
            CONFIG.cameraStart.z
        );

        camera.lookAt(
            CONFIG.cameraTarget.x,
            CONFIG.cameraTarget.y,
            CONFIG.cameraTarget.z
        );
    }

    /* =====================================================
       RENDERER
    ===================================================== */

    function createRenderer() {

        renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

        renderer.setSize(
            Math.max(
                container.clientWidth,
                1
            ),
            Math.max(
                container.clientHeight,
                1
            )
        );

        if (
            "outputColorSpace" in renderer
        ) {

            renderer.outputColorSpace =
                THREE.SRGBColorSpace;
        }

        if (
            "toneMapping" in renderer
        ) {

            renderer.toneMapping =
                THREE.ACESFilmicToneMapping;

            renderer.toneMappingExposure =
                1.15;
        }

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        container.innerHTML = "";

        container.appendChild(
            renderer.domElement
        );
    }

    /* =====================================================
       MATERIALS
    ===================================================== */

    function material(
        color,
        roughness = 0.5,
        metalness = 0
    ) {

        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });
    }

    /* =====================================================
       BOX
    ===================================================== */

    function box(
        width,
        height,
        depth,
        color,
        x,
        y,
        z,
        options = {}
    ) {

        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const mat =
            material(
                color,
                options.roughness ??
                    0.5,
                options.metalness ??
                    0
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                mat
            );

        mesh.position.set(
            x,
            y,
            z
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    /* =====================================================
       CYLINDER
    ===================================================== */

    function cylinder(
        radiusTop,
        radiusBottom,
        height,
        color,
        x,
        y,
        z,
        segments = 32
    ) {

        const geometry =
            new THREE.CylinderGeometry(
                radiusTop,
                radiusBottom,
                height,
                segments
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                material(
                    color,
                    0.45
                )
            );

        mesh.position.set(
            x,
            y,
            z
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    /* =====================================================
       FLOOR
    ===================================================== */

    function createFloor() {

        const floor =
            box(
                34,
                0.4,
                30,
                CONFIG.floor,
                0,
                -0.2,
                0,
                {
                    roughness: 0.72
                }
            );

        officeGroup.add(
            floor
        );

        const rug =
            box(
                17,
                0.08,
                10,
                0x202635,
                0,
                0.03,
                2,
                {
                    roughness: 0.95
                }
            );

        officeGroup.add(
            rug
        );
    }

    /* =====================================================
       WALLS
    ===================================================== */

    function createWalls() {

        const back =
            box(
                34,
                14,
                0.4,
                CONFIG.wall,
                0,
                7,
                -8,
                {
                    roughness: 0.8
                }
            );

        officeGroup.add(back);

        const left =
            box(
                0.4,
                14,
                30,
                CONFIG.wall2,
                -17,
                7,
                0
            );

        officeGroup.add(left);

        const right =
            box(
                0.4,
                14,
                30,
                CONFIG.wall2,
                17,
                7,
                0
            );

        officeGroup.add(right);

        createWallPanels();
    }

    /* =====================================================
       WALL PANELS
    ===================================================== */

    function createWallPanels() {

        for (
            let x = -14;
            x <= 14;
            x += 4
        ) {

            const panel =
                box(
                    3.5,
                    10.5,
                    0.12,
                    0x151d2b,
                    x,
                    6.3,
                    -7.77
                );

            officeGroup.add(
                panel
            );
        }
    }

    /* =====================================================
       DESK
    ===================================================== */

    function createDesk() {

        const desk =
            box(
                13,
                0.7,
                4.5,
                CONFIG.wood,
                0,
                3.1,
                -0.4,
                {
                    roughness: 0.34
                }
            );

        officeGroup.add(
            desk
        );

        const front =
            box(
                12,
                2.5,
                0.3,
                CONFIG.woodDark,
                0,
                1.85,
                1.7
            );

        officeGroup.add(
            front
        );

        const legs = [
            [-5.3, 1.45, -1.8],
            [5.3, 1.45, -1.8],
            [-5.3, 1.45, 1.0],
            [5.3, 1.45, 1.0]
        ];

        legs.forEach(
            position => {

                const leg =
                    box(
                        0.35,
                        2.5,
                        0.35,
                        CONFIG.woodDark,
                        ...position
                    );

                officeGroup.add(
                    leg
                );
            }
        );

        createDeskObjects();
    }

    /* =====================================================
       DESK OBJECTS
    ===================================================== */

    function createDeskObjects() {

        const laptop =
            box(
                3.8,
                0.18,
                2.4,
                0x171b22,
                0,
                3.55,
                -1.1,
                {
                    roughness: 0.3,
                    metalness: 0.4
                }
            );

        officeGroup.add(
            laptop
        );

        const keyboard =
            box(
                2.6,
                0.08,
                0.8,
                0x292e38,
                0,
                3.67,
                0.0
            );

        officeGroup.add(
            keyboard
        );

        const phone =
            box(
                1.2,
                0.35,
                1.1,
                0x111318,
                4.0,
                3.62,
                0.2,
                {
                    roughness: 0.3
                }
            );

        officeGroup.add(
            phone
        );

        createFlag(
            -4.2,
            3.8,
            -1.0
        );

        createLamp(
            5.0,
            4.0,
            -1.0
        );
    }

    /* =====================================================
       PRESIDENTIAL CHAIR
    ===================================================== */

    function createChair() {

        const seat =
            box(
                4,
                0.55,
                3.5,
                CONFIG.leather,
                0,
                2.1,
                4.0,
                {
                    roughness: 0.75
                }
            );

        officeGroup.add(
            seat
        );

        const back =
            box(
                4,
                5,
                0.65,
                CONFIG.leather,
                0,
                4.6,
                5.2,
                {
                    roughness: 0.75
                }
            );

        officeGroup.add(
            back
        );

        const base =
            cylinder(
                0.9,
                1.2,
                0.35,
                CONFIG.metal,
                0,
                1.55,
                4.0,
                32
            );

        officeGroup.add(
            base
        );

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const angle =
                i *
                Math.PI *
                2 /
                5;

            const leg =
                box(
                    0.15,
                    0.15,
                    2.2,
                    CONFIG.metal,
                    Math.cos(angle) * 0.9,
                    1.4,
                    4 +
                        Math.sin(angle) *
                        0.9
                );

            leg.rotation.y =
                angle;

            officeGroup.add(
                leg
            );
        }
    }

    /* =====================================================
       BOOKCASE
    ===================================================== */

    function createBookcase() {

        const shelf =
            box(
                5.5,
                8,
                0.65,
                CONFIG.woodDark,
                -11.5,
                4.5,
                -7.2
            );

        officeGroup.add(
            shelf
        );

        for (
            let y = 1.5;
            y <= 7.5;
            y += 1.5
        ) {

            const board =
                box(
                    5,
                    0.15,
                    0.8,
                    CONFIG.wood,
                    -11.5,
                    y,
                    -6.75
                );

            officeGroup.add(
                board
            );

            for (
                let i = 0;
                i < 7;
                i++
            ) {

                const colors = [
                    0x743d3d,
                    0x304e70,
                    0x80663e,
                    0x4b684f,
                    0x6a496a
                ];

                const book =
                    box(
                        0.38,
                        1.15,
                        0.55,
                        colors[
                            i %
                            colors.length
                        ],
                        -13.6 +
                            i * 0.7,
                        y + 0.58,
                        -6.35
                    );

                officeGroup.add(
                    book
                );
            }
        }
    }

    /* =====================================================
       PLANT
    ===================================================== */

    function createPlant() {

        const pot =
            cylinder(
                0.65,
                0.8,
                1.2,
                0x593b2d,
                12,
                1.0,
                -5.8
            );

        officeGroup.add(
            pot
        );

        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const leaf =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.55,
                        12,
                        12
                    ),
                    material(
                        0x1f5b42,
                        0.8
                    )
                );

            const angle =
                i *
                Math.PI *
                2 /
                14;

            leaf.position.set(
                12 +
                    Math.cos(angle) *
                    0.8,
                1.8 +
                    Math.random() *
                    2.0,
                -5.8 +
                    Math.sin(angle) *
                    0.8
            );

            leaf.scale.set(
                0.55,
                1.1,
                0.3
            );

            leaf.rotation.z =
                angle;

            officeGroup.add(
                leaf
            );
        }
    }

    /* =====================================================
       FLAG
    ===================================================== */

    function createFlag(
        x,
        y,
        z
    ) {

        const pole =
            cylinder(
                0.05,
                0.05,
                3.5,
                CONFIG.gold,
                x,
                y,
                z,
                12
            );

        officeGroup.add(
            pole
        );

        const flag =
            box(
                1.9,
                1.1,
                0.06,
                0x263b75,
                x + 0.9,
                y + 1.0,
                z
            );

        officeGroup.add(
            flag
        );
    }

    /* =====================================================
       LAMP
    ===================================================== */

    function createLamp(
        x,
        y,
        z
    ) {

        const stem =
            cylinder(
                0.06,
                0.06,
                2.0,
                CONFIG.metal,
                x,
                y,
                z,
                12
            );

        officeGroup.add(
            stem
        );

        const shade =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.65,
                    0.7,
                    32,
                    1,
                    true
                ),
                material(
                    CONFIG.gold,
                    0.45,
                    0.25
                )
            );

        shade.position.set(
            x,
            y + 1.0,
            z
        );

        officeGroup.add(
            shade
        );

        const light =
            new THREE.PointLight(
                0xffd58a,
                2.2,
                7
            );

        light.position.set(
            x,
            y + 0.7,
            z
        );

        light.castShadow = true;

        officeGroup.add(
            light
        );
    }

    /* =====================================================
       MONITOR FRAME
    ===================================================== */

    function createMonitor() {

        monitorGroup =
            new THREE.Group();

        monitorGroup.position.set(
            0,
            0,
            0
        );

        officeGroup.add(
            monitorGroup
        );

        const outer =
            box(
                8.8,
                5.4,
                0.45,
                0x090c12,
                0,
                5.6,
                -6.0,
                {
                    roughness: 0.25,
                    metalness: 0.7
                }
            );

        monitorGroup.add(
            outer
        );

        createNewsCanvas();

        const screenGeometry =
            new THREE.PlaneGeometry(
                8.1,
                4.65
            );

        monitorScreen =
            new THREE.Mesh(
                screenGeometry,
                new THREE.MeshBasicMaterial({
                    map:
                        monitorNewsTexture,
                    toneMapped: false
                })
            );

        monitorScreen.position.set(
            0,
            5.6,
            -6.24
        );

        monitorGroup.add(
            monitorScreen
        );

        const stand =
            box(
                1.0,
                2.0,
                0.7,
                0x11151d,
                0,
                3.2,
                -6.0,
                {
                    roughness: 0.35,
                    metalness: 0.6
                }
            );

        monitorGroup.add(
            stand
        );

        const base =
            box(
                3.5,
                0.25,
                1.6,
                0x0b0e14,
                0,
                2.25,
                -6.0,
                {
                    roughness: 0.3,
                    metalness: 0.5
                }
            );

        monitorGroup.add(
            base
        );

        monitorGlow =
            new THREE.PointLight(
                0x3b82f6,
                0.8,
                8
            );

        monitorGlow.position.set(
            0,
            5.6,
            -5.0
        );

        officeGroup.add(
            monitorGlow
        );
    }

    /* =====================================================
       NEWS CANVAS
    ===================================================== */

    function createNewsCanvas() {

        monitorNewsCanvas =
            document.createElement(
                "canvas"
            );

        monitorNewsCanvas.width =
            1280;

        monitorNewsCanvas.height =
            720;

        monitorNewsTexture =
            new THREE.CanvasTexture(
                monitorNewsCanvas
            );

        monitorNewsTexture.colorSpace =
            THREE.SRGBColorSpace;

        monitorNewsTexture.anisotropy =
            renderer.capabilities.getMaxAnisotropy();

        drawNewsScreen({
            category:
                "government",

            headline:
                "جمهوری مسخره‌ها",

            description:
                "مرکز فرماندهی دولت",

            severity:
                "NORMAL",

            country:
                "دفتر ریاست جمهوری"
        });
    }

    /* =====================================================
       NEWS SCREEN DRAW
    ===================================================== */

    function drawNewsScreen(
        data
    ) {

        if (
            !monitorNewsCanvas ||
            !monitorNewsTexture
        ) {
            return;
        }

        const canvas =
            monitorNewsCanvas;

        const ctx =
            canvas.getContext(
                "2d"
            );

        const category =
            safeString(
                data.category,
                "government"
            );

        const theme =
            getNewsTheme(
                category
            );

        /* Background */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );

        gradient.addColorStop(
            0,
            theme.background
        );

        gradient.addColorStop(
            1,
            "#05070c"
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        /* Atmospheric shapes */

        for (
            let i = 0;
            i < 18;
            i++
        ) {

            ctx.fillStyle =
                `rgba(${theme.rgb},${0.015 + i * 0.002})`;

            ctx.beginPath();

            ctx.arc(
                Math.random() *
                    canvas.width,
                Math.random() *
                    canvas.height,
                30 +
                    Math.random() *
                    120,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        /* Top bar */

        ctx.fillStyle =
            theme.primary;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            90
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 38px Arial";

        ctx.textAlign =
            "right";

        ctx.fillText(
            "ABSURD NEWS",
            1210,
            58
        );

        /* LIVE */

        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#ef4444";

        ctx.beginPath();

        ctx.arc(
            60,
            45,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 30px Arial";

        ctx.fillText(
            "LIVE",
            88,
            55
        );

        /* Category */

        ctx.fillStyle =
            theme.secondary;

        ctx.font =
            "bold 28px Arial";

        ctx.fillText(
            getCategoryLabel(
                category
            ),
            55,
            145
        );

        /* Headline */

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 54px Arial";

        const headline =
            safeString(
                data.headline,
                "خبر فوری"
            );

        drawWrappedText(
            ctx,
            headline,
            55,
            220,
            1120,
            62,
            3
        );

        /* Description */

        ctx.fillStyle =
            "#cbd5e1";

        ctx.font =
            "30px Arial";

        drawWrappedText(
            ctx,
            safeString(
                data.description,
                "گزارش جدید از مرکز فرماندهی"
            ),
            55,
            410,
            1120,
            42,
            4
        );

        /* Country */

        ctx.fillStyle =
            theme.primary;

        ctx.font =
            "bold 27px Arial";

        ctx.fillText(
            safeString(
                data.country,
                "کشور"
            ),
            55,
            570
        );

        /* Severity */

        const severity =
            safeString(
                data.severity,
                "NORMAL"
            );

        ctx.fillStyle =
            severity === "CRITICAL"
                ? "#ef4444"
                : severity === "HIGH"
                    ? "#f59e0b"
                    : "#22c55e";

        ctx.fillRect(
            55,
            610,
            1170,
            4
        );

        ctx.fillStyle =
            "#94a3b8";

        ctx.font =
            "24px Arial";

        ctx.fillText(
            `STATUS: ${severity}`,
            55,
            660
        );

        ctx.textAlign =
            "right";

        ctx.fillText(
            "REPUBLIC OF ABSURDITY",
            1225,
            660
        );

        monitorNewsTexture.needsUpdate =
            true;
    }

    /* =====================================================
       WRAPPED TEXT
    ===================================================== */

    function drawWrappedText(
        ctx,
        text,
        x,
        y,
        maxWidth,
        lineHeight,
        maxLines
    ) {

        const words =
            safeString(text)
                .split(/\s+/);

        let line = "";
        let lines = [];

        words.forEach(word => {

            const test =
                line
                    ? `${line} ${word}`
                    : word;

            if (
                ctx.measureText(test)
                    .width >
                    maxWidth &&
                line
            ) {

                lines.push(
                    line
                );

                line =
                    word;

            } else {

                line =
                    test;
            }
        });

        if (line) {
            lines.push(line);
        }

        lines =
            lines.slice(
                0,
                maxLines
            );

        lines.forEach(
            (item, index) => {

                ctx.fillText(
                    item,
                    x,
                    y +
                        index *
                        lineHeight
                );
            }
        );
    }

    /* =====================================================
       NEWS THEMES
    ===================================================== */

    function getNewsTheme(
        category
    ) {

        const themes = {

            protest: {
                primary:
                    "#b91c1c",
                secondary:
                    "#f87171",
                background:
                    "#241013",
                rgb:
                    "185,28,28"
            },

            economy: {
                primary:
                    "#15803d",
                secondary:
                    "#4ade80",
                background:
                    "#071a12",
                rgb:
                    "21,128,61"
            },

            environment: {
                primary:
                    "#0f766e",
                secondary:
                    "#2dd4bf",
                background:
                    "#061917",
                rgb:
                    "15,118,110"
            },

            diplomacy: {
                primary:
                    "#2563eb",
                secondary:
                    "#60a5fa",
                background:
                    "#071226",
                rgb:
                    "37,99,235"
            },

            security: {
                primary:
                    "#7c3aed",
                secondary:
                    "#a78bfa",
                background:
                    "#130b24",
                rgb:
                    "124,58,237"
            },

            energy: {
                primary:
                    "#ca8a04",
                secondary:
                    "#facc15",
                background:
                    "#201703",
                rgb:
                    "202,138,4"
            },

            media: {
                primary:
                    "#db2777",
                secondary:
                    "#f472b6",
                background:
                    "#210817",
                rgb:
                    "219,39,119"
            },

            government: {
                primary:
                    "#334155",
                secondary:
                    "#94a3b8",
                background:
                    "#0b111b",
                rgb:
                    "51,65,85"
            }
        };

        return (
            themes[category] ||
            themes.government
        );
    }

    /* =====================================================
       CATEGORY LABEL
    ===================================================== */

    function getCategoryLabel(
        category
    ) {

        const labels = {

            protest:
                "اعتراضات و خیابان",

            economy:
                "اقتصاد",

            environment:
                "محیط زیست",

            diplomacy:
                "دیپلماسی",

            security:
                "امنیت داخلی",

            energy:
                "انرژی",

            media:
                "رسانه",

            politics:
                "سیاست",

            government:
                "دولت"
        };

        return (
            labels[category] ||
            "خبر فوری"
        );
    }

    /* =====================================================
       LIGHTING
    ===================================================== */

    function createLights() {

        const ambient =
            new THREE.HemisphereLight(
                0x9fb7d9,
                0x16120f,
                1.7
            );

        scene.add(
            ambient
        );

        const main =
            new THREE.DirectionalLight(
                0xfff3dc,
                3.2
            );

        main.position.set(
            3,
            14,
            7
        );

        main.castShadow = true;

        main.shadow.mapSize.width =
            2048;

        main.shadow.mapSize.height =
            2048;

        main.shadow.camera.left =
            -20;

        main.shadow.camera.right =
            20;

        main.shadow.camera.top =
            20;

        main.shadow.camera.bottom =
            -20;

        scene.add(
            main
        );

        const blue =
            new THREE.PointLight(
                0x2563eb,
                1.2,
                15
            );

        blue.position.set(
            -9,
            8,
            -4
        );

        scene.add(
            blue
        );

        const warm =
            new THREE.PointLight(
                0xffa24a,
                1.1,
                12
            );

        warm.position.set(
            9,
            6,
            1
        );

        scene.add(
            warm
        );
    }

    /* =====================================================
       OFFICE
    ===================================================== */

    function createOffice() {

        officeGroup =
            new THREE.Group();

        scene.add(
            officeGroup
        );

        createFloor();

        createWalls();

        createDesk();

        createChair();

        createBookcase();

        createPlant();

        createMonitor();
    }

    /* =====================================================
       CAMERA ANIMATION
    ===================================================== */

    function animateCamera(
        position,
        target,
        duration = 1100
    ) {

        if (!camera) return;

        cameraFrom =
            camera.position.clone();

        cameraTo =
            new THREE.Vector3(
                position.x,
                position.y,
                position.z
            );

        targetFrom =
            new THREE.Vector3();

        camera.getWorldDirection(
            targetFrom
        );

        targetFrom
            .multiplyScalar(5)
            .add(
                camera.position
            );

        targetTo =
            new THREE.Vector3(
                target.x,
                target.y,
                target.z
            );

        animationStart =
            performance.now();

        animationDuration =
            duration;

        cameraAnimating =
            true;
    }

    /* =====================================================
       FOCUS MONITOR
    ===================================================== */

    function focusMonitor() {

        animateCamera(
            {
                x: 0,
                y: 6.0,
                z: 7.0
            },
            {
                x: 0,
                y: 5.6,
                z: -5.8
            },
            1250
        );

        if (monitorGlow) {

            monitorGlow.intensity =
                2.8;
        }
    }

    /* =====================================================
       RETURN CAMERA
    ===================================================== */

    function resetCamera() {

        animateCamera(
            {
                x:
                    CONFIG.cameraStart.x,

                y:
                    CONFIG.cameraStart.y,

                z:
                    CONFIG.cameraStart.z
            },
            {
                x:
                    CONFIG.cameraTarget.x,

                y:
                    CONFIG.cameraTarget.y,

                z:
                    CONFIG.cameraTarget.z
            },
            1100
        );

        if (monitorGlow) {

            monitorGlow.intensity =
                0.8;
        }
    }

    /* =====================================================
       UPDATE CAMERA
    ===================================================== */

    function updateCameraAnimation() {

        if (
            !cameraAnimating ||
            !cameraFrom ||
            !cameraTo
        ) {
            return;
        }

        const elapsed =
            performance.now() -
            animationStart;

        let progress =
            clamp(
                elapsed /
                animationDuration,
                0,
                1
            );

        progress =
            easeInOut(
                progress
            );

        camera.position.lerpVectors(
            cameraFrom,
            cameraTo,
            progress
        );

        const target =
            new THREE.Vector3();

        target.lerpVectors(
            targetFrom,
            targetTo,
            progress
        );

        camera.lookAt(
            target
        );

        if (
            progress >= 1
        ) {

            cameraAnimating =
                false;
        }
    }

    /* =====================================================
       DETECT EVENT
    ===================================================== */

    function detectGameEvent() {

        let state = null;

        try {

            if (
                window.RepublicGame &&
                typeof
                    window.RepublicGame
                        .getState ===
                    "function"
            ) {

                state =
                    window.RepublicGame
                        .getState();
            }

        } catch (error) {

            console.warn(
                "[Office3D] state read failed",
                error
            );
        }

        if (
            state &&
            state.currentEvent
        ) {

            return state.currentEvent;
        }

        return null;
    }

    /* =====================================================
       DETECT CATEGORY
    ===================================================== */

    function detectCategory(
        event
    ) {

        const raw =
            (
                safeString(
                    event?.category
                ) +
                " " +
                safeString(
                    event?.type
                ) +
                " " +
                safeString(
                    event?.title
                ) +
                " " +
                safeString(
                    event?.description
                )
            ).toLowerCase();

        if (
            /اعتراض|تجمع|خیابان|protest|riot|demonstration/
                .test(raw)
        ) {
            return "protest";
        }

        if (
            /اقتصاد|تورم|بازار|پول|بانک|economy|market|inflation/
                .test(raw)
        ) {
            return "economy";
        }

        if (
            /طوفان|سیل|زلزله|آب و هوا|اقلیم|محیط|storm|flood|climate|earthquake/
                .test(raw)
        ) {
            return "environment";
        }

        if (
            /دیپلماسی|کشور|تحریم|روابط|diplomacy|sanction|foreign/
                .test(raw)
        ) {
            return "diplomacy";
        }

        if (
            /امنیت|بحران|امنیتی|security|crisis/
                .test(raw)
        ) {
            return "security";
        }

        if (
            /برق|انرژی|سوخت|energy|electric/
                .test(raw)
        ) {
            return "energy";
        }

        if (
            /رسانه|خبر|تلویزیون|media|news/
                .test(raw)
        ) {
            return "media";
        }

        return "government";
    }

    /* =====================================================
       SHOW EVENT ON SCREEN
    ===================================================== */

    function showEvent(
        event
    ) {

        if (!event) return;

        const category =
            detectCategory(
                event
            );

        const state =
            detectGameEvent();

        let countryName =
            "کشور شما";

        try {

            const country =
                state?.countries?.[
                    state?.currentEvent
                        ?.targetCountryCode
                ];

            if (country?.name) {

                countryName =
                    country.name;
            }

        } catch {}

        const severity =
            safeString(
                event.severity,
                "medium"
            ).toUpperCase();

        currentNews = {

            category,

            headline:
                safeString(
                    event.title,
                    "خبر فوری"
                ),

            description:
                safeString(
                    event.description,
                    "گزارش تازه‌ای از مرکز فرماندهی دریافت شد."
                ),

            severity:
                severity === "SEVERE"
                    ? "CRITICAL"
                    : severity === "HIGH"
                        ? "HIGH"
                        : "NORMAL",

            country:
                countryName
        };

        drawNewsScreen(
            currentNews
        );

        focusMonitor();
    }

    /* =====================================================
       MUTATION OBSERVER
    ===================================================== */

    function setupMutationObserver() {

        if (
            mutationObserver
        ) {
            return;
        }

        const watchTargets = [
            $("eventTitle"),
            $("eventDescription"),
            $("decisionCards"),
            $("turnStatus")
        ].filter(Boolean);

        if (!watchTargets.length) {
            return;
        }

        mutationObserver =
            new MutationObserver(
                () => {

                    const event =
                        detectGameEvent();

                    if (event) {

                        showEvent(
                            event
                        );
                    }
                }
            );

        watchTargets.forEach(
            target => {

                mutationObserver.observe(
                    target,
                    {
                        childList: true,
                        subtree: true,
                        characterData: true
                    }
                );
            }
        );
    }

    /* =====================================================
       DECISION CAMERA
    ===================================================== */

    function setupDecisionCamera() {

        document.addEventListener(
            "click",
            event => {

                const card =
                    event.target.closest(
                        "[data-decision-card]"
                    );

                if (!card) return;

                setTimeout(
                    () => {

                        resetCamera();

                    },
                    900
                );
            }
        );
    }

    /* =====================================================
       WINDOW EVENTS
    ===================================================== */

    function setupWindowEvents() {

        window.addEventListener(
            "resize",
            resize
        );

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden
                ) {
                    return;
                }

                resize();
            }
        );
    }

    /* =====================================================
       RESIZE
    ===================================================== */

    function resize() {

        if (
            !renderer ||
            !camera ||
            !container
        ) {
            return;
        }

        const width =
            Math.max(
                container.clientWidth,
                1
            );

        const height =
            Math.max(
                container.clientHeight,
                1
            );

        camera.aspect =
            width /
            height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );
    }

    /* =====================================================
       ANIMATION LOOP
    ===================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );

        updateCameraAnimation();

        if (
            monitorScreen
        ) {

            const time =
                performance.now() *
                0.001;

            monitorScreen.position.y =
                5.6 +
                Math.sin(
                    time * 1.2
                ) *
                0.008;
        }

        if (
            monitorGlow
        ) {

            const time =
                performance.now() *
                0.001;

            monitorGlow.intensity =
                0.8 +
                Math.sin(
                    time * 2
                ) *
                0.08;
        }

        renderer.render(
            scene,
            camera
        );
    }

    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        if (initialized) {
            return;
        }

        if (
            typeof THREE ===
            "undefined"
        ) {

            console.error(
                "[Office3D] Three.js is not loaded."
            );

            return;
        }

        if (!getContainer()) {
            return;
        }

        initialized = true;

        clock =
            new THREE.Clock();

        createScene();

        createCamera();

        createRenderer();

        createLights();

        createOffice();

        setupWindowEvents();

        setupMutationObserver();

        setupDecisionCamera();

        resize();

        animate();

        console.log(
            `%c[Office3D] v${VERSION} READY`,
            "color:#60a5fa;font-weight:bold"
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.Office3D = {

        version:
            VERSION,

        init,

        showEvent,

        showNews:
            showEvent,

        focusMonitor,

        resetCamera,

        drawNewsScreen,

        getScene:
            () => scene,

        getCamera:
            () => camera,

        getRenderer:
            () => renderer
    };

    /* =====================================================
       AUTO START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();