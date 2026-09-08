/* =========================================================
   REPUBLIC OF ABSURDITY
   OFFICE 3D ENGINE v5.0
   ========================================================= */

(() => {
    "use strict";

    if (!window.THREE) {
        console.error("Three.js is not loaded.");
        return;
    }

    const VERSION = "5.0";

    let initialized = false;

    let scene;
    let camera;
    let renderer;
    let clock;

    let officeRoot;
    let desk;
    let monitor;
    let monitorScreen;
    let dossier;
    let decisionGroup;

    let introScene;
    let introCamera;
    let introRenderer;

    let monitorCanvas;
    let monitorTexture;

    let eventTimer = 0;
    let cameraTween = null;

    const animatedObjects = [];
    const floatingObjects = [];

    const DEFAULT_CAMERA = {
        x: 0,
        y: 2.75,
        z: 8.8,
        lookX: 0,
        lookY: 2.2,
        lookZ: 0
    };

    const MONITOR_CAMERA = {
        x: 0,
        y: 2.65,
        z: 5.0,
        lookX: 0,
        lookY: 2.35,
        lookZ: -1.7
    };

    /* =====================================================
       HELPERS
       ===================================================== */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function hexColor(hex) {
        return new THREE.Color(hex);
    }

    function safeText(value) {
        return String(value || "")
            .replace(/[<>]/g, "")
            .slice(0, 160);
    }

    function getContainer(id) {
        return document.getElementById(id);
    }

    /* =====================================================
       MATERIALS
       ===================================================== */

    function createMaterial(color, options = {}) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: options.roughness ?? 0.65,
            metalness: options.metalness ?? 0
        });
    }

    function goldMaterial() {
        return createMaterial(0xD4AF37, {
            roughness: 0.25,
            metalness: 0.85
        });
    }

    function darkWoodMaterial() {
        return createMaterial(0x24170F, {
            roughness: 0.48,
            metalness: 0.05
        });
    }

    function marbleMaterial() {
        return createMaterial(0x77736A, {
            roughness: 0.32,
            metalness: 0.02
        });
    }

    /* =====================================================
       BASIC MESH HELPERS
       ===================================================== */

    function box(
        width,
        height,
        depth,
        material,
        x = 0,
        y = 0,
        z = 0
    ) {
        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    function cylinder(
        radiusTop,
        radiusBottom,
        height,
        material,
        x = 0,
        y = 0,
        z = 0,
        segments = 32
    ) {
        const geometry = new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            segments
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    function sphere(
        radius,
        material,
        x = 0,
        y = 0,
        z = 0
    ) {
        const geometry = new THREE.SphereGeometry(
            radius,
            32,
            20
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    /* =====================================================
       OFFICE
       ===================================================== */

    function createOffice() {
        officeRoot = new THREE.Group();
        scene.add(officeRoot);

        createFloor();
        createWalls();
        createCeilingLights();
        createDesk();
        createChair();
        createBookcase();
        createPlant();
        createFlag();
        createLamp();
        createMonitor();
        createDecorations();

        return officeRoot;
    }

    function createFloor() {
        const floor = box(
            18,
            0.3,
            18,
            createMaterial(0x15110E, {
                roughness: 0.8
            }),
            0,
            -0.15,
            0
        );

        officeRoot.add(floor);

        const rug = box(
            8.5,
            0.08,
            5.8,
            createMaterial(0x171B22, {
                roughness: 0.95
            }),
            0,
            0.04,
            0.6
        );

        officeRoot.add(rug);

        const rugBorder = box(
            8.8,
            0.04,
            6.1,
            goldMaterial(),
            0,
            0.085,
            0.6
        );

        rugBorder.scale.y = 0.25;
        officeRoot.add(rugBorder);
    }

    function createWalls() {
        const wallMaterial = createMaterial(0x11151C, {
            roughness: 0.75
        });

        const leftWall = box(
            0.25,
            6,
            14,
            wallMaterial,
            -7,
            3,
            0
        );

        const rightWall = box(
            0.25,
            6,
            14,
            wallMaterial,
            7,
            3,
            0
        );

        const backWall = box(
            14,
            6,
            0.25,
            wallMaterial,
            0,
            3,
            -5.5
        );

        officeRoot.add(
            leftWall,
            rightWall,
            backWall
        );

        for (let i = -5; i <= 5; i += 2.5) {
            const panel = box(
                2.0,
                3.8,
                0.12,
                createMaterial(0x1C222B, {
                    roughness: 0.58
                }),
                i,
                3.0,
                -5.34
            );

            officeRoot.add(panel);

            const trim = box(
                2.1,
                0.055,
                0.08,
                goldMaterial(),
                i,
                4.9,
                -5.25
            );

            officeRoot.add(trim);
        }

        const emblem = createEmblem();

        emblem.position.set(
            0,
            3.75,
            -5.08
        );

        emblem.scale.setScalar(1.15);

        officeRoot.add(emblem);
    }

    function createEmblem() {
        const group = new THREE.Group();

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(
                0.72,
                0.07,
                16,
                64
            ),
            goldMaterial()
        );

        group.add(ring);

        const center = sphere(
            0.34,
            createMaterial(0x102A43, {
                roughness: 0.35
            })
        );

        group.add(center);

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;

            const ray = box(
                0.055,
                0.55,
                0.055,
                goldMaterial()
            );

            ray.position.x = Math.cos(angle) * 0.72;
            ray.position.y = Math.sin(angle) * 0.72;

            ray.rotation.z = angle;

            group.add(ray);
        }

        return group;
    }

    /* =====================================================
       DESK
       ===================================================== */

    function createDesk() {
        desk = new THREE.Group();

        const top = box(
            5.7,
            0.28,
            2.15,
            darkWoodMaterial(),
            0,
            1.65,
            0.2
        );

        desk.add(top);

        const marbleTop = box(
            5.45,
            0.045,
            1.95,
            marbleMaterial(),
            0,
            1.805,
            0.2
        );

        desk.add(marbleTop);

        const front = box(
            5.25,
            1.05,
            0.18,
            darkWoodMaterial(),
            0,
            1.08,
            1.13
        );

        desk.add(front);

        const leftLeg = box(
            0.25,
            1.45,
            1.75,
            darkWoodMaterial(),
            -2.55,
            0.75,
            0.2
        );

        const rightLeg = box(
            0.25,
            1.45,
            1.75,
            darkWoodMaterial(),
            2.55,
            0.75,
            0.2
        );

        desk.add(
            leftLeg,
            rightLeg
        );

        const goldLine = box(
            5.25,
            0.035,
            0.035,
            goldMaterial(),
            0,
            1.46,
            1.04
        );

        desk.add(goldLine);

        desk.position.z = 0.35;

        officeRoot.add(desk);

        createDeskObjects();
    }

    function createDeskObjects() {
        const penHolder = cylinder(
            0.14,
            0.17,
            0.28,
            createMaterial(0x151515, {
                roughness: 0.35,
                metalness: 0.65
            }),
            -1.8,
            1.99,
            0.2
        );

        desk.add(penHolder);

        for (let i = 0; i < 3; i++) {
            const pen = cylinder(
                0.018,
                0.018,
                0.45,
                goldMaterial(),
                -1.8 + i * 0.06,
                2.28,
                0.2
            );

            pen.rotation.z = 0.12 + i * 0.08;

            desk.add(pen);
        }

        const coffeeCup = cylinder(
            0.18,
            0.15,
            0.32,
            createMaterial(0xE8E3D7, {
                roughness: 0.4
            }),
            1.75,
            1.99,
            0.35
        );

        desk.add(coffeeCup);

        const coffee = cylinder(
            0.14,
            0.14,
            0.012,
            createMaterial(0x23160F),
            1.75,
            2.15,
            0.35
        );

        desk.add(coffee);

        createDossier();
    }

    /* =====================================================
       DOSSIER
       ===================================================== */

    function createDossier() {
        dossier = new THREE.Group();

        const cover = box(
            1.55,
            0.075,
            1.05,
            createMaterial(0x162A3D, {
                roughness: 0.5
            })
        );

        dossier.add(cover);

        const goldStrip = box(
            1.55,
            0.018,
            0.07,
            goldMaterial(),
            0,
            0.06,
            0
        );

        dossier.add(goldStrip);

        const label = box(
            0.5,
            0.025,
            0.23,
            createMaterial(0xD4AF37),
            0,
            0.07,
            0
        );

        dossier.add(label);

        dossier.position.set(
            0,
            1.98,
            0.72
        );

        desk.add(dossier);

        createDecisionCards();
    }

    function createDecisionCards() {
        decisionGroup = new THREE.Group();

        for (let i = 0; i < 3; i++) {
            const card = new THREE.Group();

            const body = box(
                1.35,
                0.035,
                1.9,
                createMaterial(
                    i === 0
                        ? 0x102A43
                        : i === 1
                        ? 0x332B18
                        : 0x25191B,
                    {
                        roughness: 0.5
                    }
                )
            );

            card.add(body);

            const stripe = box(
                1.1,
                0.025,
                0.06,
                goldMaterial(),
                0,
                0.04,
                -0.55
            );

            card.add(stripe);

            card.position.set(
                (i - 1) * 1.55,
                0.15,
                0
            );

            card.rotation.x = -0.35;

            card.visible = false;

            card.userData.index = i;

            decisionGroup.add(card);
        }

        decisionGroup.position.set(
            0,
            2.2,
            0.65
        );

        officeRoot.add(decisionGroup);
    }

    /* =====================================================
       CHAIR
       ===================================================== */

    function createChair() {
        const chair = new THREE.Group();

        const seat = box(
            1.7,
            0.25,
            1.55,
            createMaterial(0x111217, {
                roughness: 0.62
            }),
            0,
            1.05,
            3.0
        );

        chair.add(seat);

        const back = box(
            1.7,
            2.15,
            0.25,
            createMaterial(0x111217, {
                roughness: 0.62
            }),
            0,
            2.0,
            3.7
        );

        chair.add(back);

        const pole = cylinder(
            0.09,
            0.12,
            1.0,
            createMaterial(0x25282E, {
                metalness: 0.8,
                roughness: 0.3
            }),
            0,
            0.55,
            3
        );

        chair.add(pole);

        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;

            const leg = box(
                0.08,
                0.08,
                0.9,
                createMaterial(0x25282E, {
                    metalness: 0.8,
                    roughness: 0.3
                }),
                Math.cos(angle) * 0.4,
                0.18,
                3 + Math.sin(angle) * 0.4
            );

            leg.rotation.y = angle;

            chair.add(leg);
        }

        officeRoot.add(chair);
    }

    /* =====================================================
       BOOKCASE
       ===================================================== */

    function createBookcase() {
        const shelf = new THREE.Group();

        const frameMaterial = darkWoodMaterial();

        const left = box(
            0.2,
            4.3,
            0.55,
            frameMaterial,
            -1.9,
            2.3,
            -4.85
        );

        const right = box(
            0.2,
            4.3,
            0.55,
            frameMaterial,
            1.9,
            2.3,
            -4.85
        );

        shelf.add(
            left,
            right
        );

        for (let i = 0; i < 5; i++) {
            const board = box(
                3.9,
                0.16,
                0.55,
                frameMaterial,
                0,
                0.55 + i * 0.9,
                -4.85
            );

            shelf.add(board);

            for (let j = 0; j < 7; j++) {
                const bookHeight =
                    0.42 +
                    Math.random() * 0.28;

                const book = box(
                    0.16 + Math.random() * 0.09,
                    bookHeight,
                    0.35,
                    createMaterial(
                        [
                            0x182D43,
                            0x46321F,
                            0x351F28,
                            0x293A2D
                        ][j % 4],
                        {
                            roughness: 0.7
                        }
                    ),
                    -1.55 + j * 0.48,
                    0.78 + i * 0.9 + bookHeight / 2,
                    -4.84
                );

                shelf.add(book);
            }
        }

        officeRoot.add(shelf);
    }

    /* =====================================================
       PLANT
       ===================================================== */

    function createPlant() {
        const plant = new THREE.Group();

        const pot = cylinder(
            0.38,
            0.48,
            0.65,
            createMaterial(0x25231F, {
                roughness: 0.8
            }),
            0,
            0.4,
            0
        );

        plant.add(pot);

        for (let i = 0; i < 9; i++) {
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.18,
                    12,
                    8
                ),
                createMaterial(0x31543B, {
                    roughness: 0.85
                })
            );

            const angle = i * 0.7;

            leaf.scale.set(
                1.5,
                0.45,
                0.7
            );

            leaf.position.set(
                Math.cos(angle) * 0.28,
                0.95 + (i % 3) * 0.2,
                Math.sin(angle) * 0.28
            );

            leaf.rotation.y = angle;

            plant.add(leaf);

            animatedObjects.push({
                object: leaf,
                type: "leaf",
                phase: i * 0.5
            });
        }

        plant.position.set(
            -5.3,
            0,
            -3.7
        );

        officeRoot.add(plant);
    }

    /* =====================================================
       FLAG
       ===================================================== */

    function createFlag() {
        const group = new THREE.Group();

        const pole = cylinder(
            0.035,
            0.035,
            3.4,
            goldMaterial(),
            0,
            1.7,
            0
        );

        group.add(pole);

        const flag = box(
            1.15,
            0.65,
            0.025,
            createMaterial(0x102A43, {
                roughness: 0.7
            }),
            0.58,
            2.65,
            0
        );

        group.add(flag);

        group.position.set(
            4.7,
            0,
            -4.7
        );

        officeRoot.add(group);

        animatedObjects.push({
            object: flag,
            type: "flag",
            phase: 0
        });
    }

    /* =====================================================
       LAMP
       ===================================================== */

    function createLamp() {
        const group = new THREE.Group();

        const stem = cylinder(
            0.035,
            0.05,
            1.35,
            createMaterial(0x22252A, {
                metalness: 0.8,
                roughness: 0.25
            }),
            0,
            0.67,
            0
        );

        group.add(stem);

        const shade = cylinder(
            0.35,
            0.2,
            0.28,
            goldMaterial(),
            0,
            1.4,
            0
        );

        group.add(shade);

        const bulb = sphere(
            0.11,
            createMaterial(0xFFF2BF, {
                emissive: 0xD4AF37,
                emissiveIntensity: 2
            }),
            0,
            1.22,
            0
        );

        group.add(bulb);

        const light = new THREE.PointLight(
            0xFFE7AA,
            2.3,
            5
        );

        light.position.set(
            0,
            1.15,
            0
        );

        group.add(light);

        group.position.set(
            2.1,
            1.82,
            0.1
        );

        officeRoot.add(group);

        animatedObjects.push({
            object: light,
            type: "lamp",
            phase: 0
        });
    }

    /* =====================================================
       MONITOR
       ===================================================== */

    function createMonitor() {
        monitor = new THREE.Group();

        const frame = box(
            3.7,
            2.3,
            0.18,
            createMaterial(0x090B0E, {
                roughness: 0.35,
                metalness: 0.5
            })
        );

        monitor.add(frame);

        monitorCanvas = document.createElement("canvas");

        monitorCanvas.width = 1024;
        monitorCanvas.height = 640;

        monitorTexture =
            new THREE.CanvasTexture(
                monitorCanvas
            );

        monitorTexture.colorSpace =
            THREE.SRGBColorSpace;

        monitorScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(
                3.25,
                1.88
            ),
            new THREE.MeshBasicMaterial({
                map: monitorTexture
            })
        );

        monitorScreen.position.z = 0.105;

        monitor.add(monitorScreen);

        const stand = box(
            0.22,
            0.9,
            0.22,
            createMaterial(0x15171A, {
                roughness: 0.4,
                metalness: 0.65
            }),
            0,
            -1.55,
            0
        );

        monitor.add(stand);

        const base = box(
            1.35,
            0.12,
            0.65,
            createMaterial(0x15171A, {
                roughness: 0.4,
                metalness: 0.65
            }),
            0,
            -1.98,
            0
        );

        monitor.add(base);

        monitor.position.set(
            0,
            3.0,
            -0.75
        );

        officeRoot.add(monitor);

        drawNewsScreen(null);
    }

    /* =====================================================
       DECORATIONS
       ===================================================== */

    function createDecorations() {
        for (let i = 0; i < 5; i++) {
            const sphereLight = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.035,
                    10,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xD4AF37
                })
            );

            sphereLight.position.set(
                -4 + i * 2,
                4.85,
                -5.15
            );

            officeRoot.add(sphereLight);

            floatingObjects.push({
                object: sphereLight,
                phase: i * 0.9
            });
        }
    }

    /* =====================================================
       LIGHTING
       ===================================================== */

    function createLighting() {
        const ambient = new THREE.HemisphereLight(
            0xB8C7D9,
            0x17110C,
            1.15
        );

        scene.add(ambient);

        const key = new THREE.DirectionalLight(
            0xFFF1D0,
            3.0
        );

        key.position.set(
            4,
            7,
            5
        );

        key.castShadow = true;

        key.shadow.mapSize.width = 2048;
        key.shadow.mapSize.height = 2048;

        key.shadow.camera.near = 0.1;
        key.shadow.camera.far = 25;

        scene.add(key);

        const rim = new THREE.PointLight(
            0x2B6EA6,
            4,
            13
        );

        rim.position.set(
            -4,
            3.8,
            -3
        );

        scene.add(rim);

        const gold = new THREE.PointLight(
            0xD4AF37,
            2,
            8
        );

        gold.position.set(
            3,
            2.5,
            1
        );

        scene.add(gold);
    }

    /* =====================================================
       NEWS SCREEN
       ===================================================== */

    function detectCategory(event) {
        if (!event) return "government";

        const text = (
            String(event.category || "") +
            " " +
            String(event.type || "") +
            " " +
            String(event.title || "") +
            " " +
            String(event.description || "")
        ).toLowerCase();

        if (
            text.includes("اعتراض") ||
            text.includes("protest")
        ) return "protest";

        if (
            text.includes("اقتصاد") ||
            text.includes("تورم") ||
            text.includes("econom")
        ) return "economy";

        if (
            text.includes("طوفان") ||
            text.includes("سیل") ||
            text.includes("زلزله") ||
            text.includes("storm") ||
            text.includes("flood")
        ) return "environment";

        if (
            text.includes("دیپلما") ||
            text.includes("تحریم") ||
            text.includes("دولت") ||
            text.includes("diplom")
        ) return "diplomacy";

        if (
            text.includes("انرژی") ||
            text.includes("برق") ||
            text.includes("energy")
        ) return "energy";

        if (
            text.includes("رسانه") ||
            text.includes("خبر") ||
            text.includes("media")
        ) return "media";

        if (
            text.includes("امنیت") ||
            text.includes("بحران") ||
            text.includes("security")
        ) return "security";

        return "government";
    }

    function categoryLabel(category) {
        const labels = {
            protest: "اعتراضات داخلی",
            economy: "اقتصاد",
            environment: "بحران محیطی",
            diplomacy: "دیپلماسی",
            energy: "انرژی",
            media: "رسانه",
            security: "وضعیت امنیتی",
            government: "دولت"
        };

        return labels[category] || "دولت";
    }

    function categoryAccent(category) {
        const colors = {
            protest: "#D4AF37",
            economy: "#5BA7D1",
            environment: "#61A56B",
            diplomacy: "#8E9AD0",
            energy: "#E4B84A",
            media: "#B98AD9",
            security: "#B42318",
            government: "#D4AF37"
        };

        return colors[category] || "#D4AF37";
    }

    function drawNewsScreen(event) {
        if (!monitorCanvas) return;

        const ctx =
            monitorCanvas.getContext("2d");

        const width =
            monitorCanvas.width;

        const height =
            monitorCanvas.height;

        const category =
            detectCategory(event);

        const accent =
            categoryAccent(category);

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );

        gradient.addColorStop(
            0,
            "#070A10"
        );

        gradient.addColorStop(
            1,
            "#132337"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        ctx.fillStyle =
            accent;

        ctx.fillRect(
            0,
            0,
            width,
            18
        );

        ctx.fillStyle =
            "#F3F1E8";

        ctx.font =
            "bold 46px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "ABSURD NEWS",
            42,
            70
        );

        ctx.fillStyle =
            "#FF4D4D";

        ctx.beginPath();

        ctx.arc(
            930,
            57,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#FFFFFF";

        ctx.font =
            "bold 26px Arial";

        ctx.fillText(
            "LIVE",
            840,
            66
        );

        ctx.fillStyle =
            accent;

        ctx.font =
            "bold 30px Arial";

        ctx.fillText(
            categoryLabel(category),
            42,
            125
        );

        const title =
            safeText(
                event?.title ||
                "در انتظار خبر جدید..."
            );

        const description =
            safeText(
                event?.description ||
                "مرکز فرماندهی منتظر تصمیم رئیس است."
            );

        ctx.fillStyle =
            "#F3F1E8";

        ctx.font =
            "bold 39px Arial";

        wrapText(
            ctx,
            title,
            42,
            190,
            900,
            48,
            3
        );

        ctx.fillStyle =
            "#C6CBD3";

        ctx.font =
            "24px Arial";

        wrapText(
            ctx,
            description,
            42,
            350,
            900,
            34,
            5
        );

        ctx.strokeStyle =
            accent;

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            42,
            525
        );

        ctx.lineTo(
            980,
            525
        );

        ctx.stroke();

        ctx.fillStyle =
            "#9CA4B1";

        ctx.font =
            "20px Arial";

        ctx.fillText(
            "REPUBLIC OF ABSURDITY • PRESIDENTIAL DESK",
            42,
            575
        );

        monitorTexture.needsUpdate = true;
    }

    function wrapText(
        ctx,
        text,
        x,
        y,
        maxWidth,
        lineHeight,
        maxLines
    ) {
        const words =
            text.split(" ");

        let line = "";
        let lineCount = 0;

        for (let i = 0; i < words.length; i++) {
            const test =
                line + words[i] + " ";

            const metrics =
                ctx.measureText(test);

            if (
                metrics.width > maxWidth &&
                line
            ) {
                ctx.fillText(
                    line,
                    x,
                    y
                );

                line = words[i] + " ";
                y += lineHeight;
                lineCount++;

                if (
                    lineCount >= maxLines
                ) {
                    return;
                }
            } else {
                line = test;
            }
        }

        if (lineCount < maxLines) {
            ctx.fillText(
                line,
                x,
                y
            );
        }
    }

    /* =====================================================
       CAMERA
       ===================================================== */

    function animateCamera(
        target,
        duration = 900
    ) {
        if (!camera) return;

        cameraTween = {
            startTime: performance.now(),
            duration,

            from: {
                position: camera.position.clone(),
                look: new THREE.Vector3(
                    0,
                    2.2,
                    0
                )
            },

            to: {
                position: new THREE.Vector3(
                    target.x,
                    target.y,
                    target.z
                ),

                look: new THREE.Vector3(
                    target.lookX,
                    target.lookY,
                    target.lookZ
                )
            }
        };
    }

    function updateCameraTween() {
        if (!cameraTween) return;

        const now =
            performance.now();

        const elapsed =
            now -
            cameraTween.startTime;

        const raw =
            clamp(
                elapsed /
                cameraTween.duration,
                0,
                1
            );

        const t =
            easeInOut(raw);

        camera.position.lerpVectors(
            cameraTween.from.position,
            cameraTween.to.position,
            t
        );

        const look =
            new THREE.Vector3().lerpVectors(
                cameraTween.from.look,
                cameraTween.to.look,
                t
            );

        camera.lookAt(look);

        if (raw >= 1) {
            cameraTween = null;
        }
    }

    function focusMonitor() {
        animateCamera(
            MONITOR_CAMERA,
            1050
        );
    }

    function resetCamera() {
        animateCamera(
            DEFAULT_CAMERA,
            1000
        );
    }

    /* =====================================================
       EVENT ANIMATION
       ===================================================== */

    function showEvent(event) {
        if (!initialized) return;

        drawNewsScreen(event);

        focusMonitor();

        animateDossier();

        setTimeout(() => {
            animateDecisionCards();
        }, 750);
    }

    function animateDossier() {
        if (!dossier) return;

        dossier.visible = true;

        dossier.position.y =
            1.98;

        const start =
            performance.now();

        const duration =
            700;

        function tick() {
            const t =
                clamp(
                    (performance.now() - start) /
                    duration,
                    0,
                    1
                );

            const e =
                1 -
                Math.pow(1 - t, 3);

            dossier.position.y =
                lerp(
                    1.85,
                    2.25,
                    e
                );

            dossier.rotation.z =
                Math.sin(t * Math.PI) *
                0.025;

            if (t < 1) {
                requestAnimationFrame(tick);
            }
        }

        tick();
    }

    function animateDecisionCards() {
        if (!decisionGroup) return;

        decisionGroup.children.forEach(
            (card, index) => {
                card.visible = true;

                card.position.y =
                    0.05;

                card.scale.setScalar(
                    0.55
                );

                const targetX =
                    (index - 1) * 1.55;

                const start =
                    performance.now();

                const delay =
                    index * 180;

                setTimeout(() => {
                    function tick() {
                        const t =
                            clamp(
                                (performance.now() - start) /
                                650,
                                0,
                                1
                            );

                        const e =
                            1 -
                            Math.pow(1 - t, 3);

                        card.position.y =
                            lerp(
                                0.05,
                                0.85,
                                e
                            );

                        card.position.x =
                            lerp(
                                0,
                                targetX,
                                e
                            );

                        card.scale.setScalar(
                            lerp(
                                0.55,
                                1,
                                e
                            )
                        );

                        card.rotation.z =
                            lerp(
                                index === 0
                                    ? -0.08
                                    : index === 1
                                    ? 0
                                    : 0.08,
                                0,
                                e
                            );

                        if (t < 1) {
                            requestAnimationFrame(
                                tick
                            );
                        }
                    }

                    tick();
                }, delay);
            }
        );
    }

    function hideDecisionCards() {
        if (!decisionGroup) return;

        decisionGroup.children.forEach(
            card => {
                card.visible = false;
            }
        );
    }

    /* =====================================================
       DECISION CARD CLICK EFFECT
       ===================================================== */

    function selectDecisionCard(index) {
        if (!decisionGroup) return;

        decisionGroup.children.forEach(
            (card, i) => {
                if (i === index) {
                    card.scale.set(
                        1.18,
                        1.18,
                        1.18
                    );

                    card.position.y =
                        1.0;
                } else {
                    card.scale.set(
                        0.75,
                        0.75,
                        0.75
                    );

                    card.position.y =
                        0.25;
                }
            }
        );

        setTimeout(() => {
            hideDecisionCards();
            resetCamera();
        }, 900);
    }

    /* =====================================================
       WORLD ANIMATION
       ===================================================== */

    function updateEnvironment(time) {
        animatedObjects.forEach(
            item => {
                if (!item.object) return;

                if (item.type === "leaf") {
                    item.object.rotation.z =
                        Math.sin(
                            time * 1.2 +
                            item.phase
                        ) * 0.12;
                }

                if (item.type === "flag") {
                    item.object.rotation.y =
                        Math.sin(
                            time * 1.7
                        ) * 0.08;

                    item.object.scale.x =
                        1 +
                        Math.sin(
                            time * 2
                        ) * 0.025;
                }

                if (item.type === "lamp") {
                    item.object.intensity =
                        2.2 +
                        Math.sin(
                            time * 2.5
                        ) * 0.15;
                }
            }
        );

        floatingObjects.forEach(
            item => {
                if (!item.object) return;

                item.object.position.y =
                    4.85 +
                    Math.sin(
                        time * 1.4 +
                        item.phase
                    ) * 0.025;
            }
        );
    }

    /* =====================================================
       INTRO SCENE
       ===================================================== */

    function initIntroScene() {
        const container =
            getContainer("intro3dScene");

        if (!container) return;

        introScene =
            new THREE.Scene();

        introScene.fog =
            new THREE.Fog(
                0x07090E,
                8,
                25
            );

        introCamera =
            new THREE.PerspectiveCamera(
                45,
                Math.max(
                    1,
                    container.clientWidth /
                    Math.max(
                        1,
                        container.clientHeight
                    )
                ),
                0.1,
                100
            );

        introCamera.position.set(
            8,
            5,
            12
        );

        introRenderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

        introRenderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

        introRenderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        introRenderer.outputColorSpace =
            THREE.SRGBColorSpace;

        introRenderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        introRenderer.toneMappingExposure =
            1.05;

        container.innerHTML = "";

        container.appendChild(
            introRenderer.domElement
        );

        createIntroBuilding();
        createIntroLighting();

        window.addEventListener(
            "resize",
            resizeIntro
        );

        animateIntro();
    }

    function createIntroBuilding() {
        const building =
            new THREE.Group();

        const baseMaterial =
            createMaterial(
                0x171A20,
                {
                    roughness: 0.78
                }
            );

        const gold =
            goldMaterial();

        const body = box(
            8,
            4.4,
            4.8,
            baseMaterial,
            0,
            2.2,
            0
        );

        building.add(body);

        const upper = box(
            6.7,
            1.8,
            4.0,
            createMaterial(
                0x202631,
                {
                    roughness: 0.72
                }
            ),
            0,
            5.0,
            0
        );

        building.add(upper);

        const roof = box(
            7.4,
            0.35,
            4.5,
            gold,
            0,
            6.0,
            0
        );

        building.add(roof);

        for (let i = -3; i <= 3; i++) {
            const column =
                cylinder(
                    0.22,
                    0.26,
                    3.9,
                    marbleMaterial(),
                    i,
                    1.95,
                    2.48,
                    20
                );

            building.add(column);
        }

        for (let i = -3; i <= 3; i++) {
            const window =
                box(
                    0.62,
                    1.25,
                    0.06,
                    createMaterial(
                        0x101D2D,
                        {
                            roughness: 0.2,
                            metalness: 0.4
                        }
                    ),
                    i,
                    2.65,
                    2.48
                );

            building.add(window);
        }

        const stairs =
            box(
                5.5,
                0.35,
                2.4,
                marbleMaterial(),
                0,
                0.2,
                2.0
            );

        building.add(stairs);

        const door =
            box(
                1.7,
                2.5,
                0.12,
                darkWoodMaterial(),
                0,
                1.45,
                2.53
            );

        building.add(door);

        const emblem =
            createEmblem();

        emblem.position.set(
            0,
            4.8,
            2.12
        );

        emblem.scale.setScalar(
            0.8
        );

        building.add(emblem);

        building.position.y =
            -1.4;

        introScene.add(
            building
        );

        for (let i = 0; i < 12; i++) {
            const cloud =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.55 +
                        Math.random() * 0.45,
                        12,
                        8
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x4D5560,
                        transparent: true,
                        opacity: 0.18
                    })
                );

            cloud.position.set(
                -12 +
                Math.random() * 24,
                5 +
                Math.random() * 5,
                -3 -
                Math.random() * 5
            );

            cloud.scale.x =
                2.2;

            introScene.add(
                cloud
            );

            floatingObjects.push({
                object: cloud,
                phase: Math.random() * 5
            });
        }
    }

    function createIntroLighting() {
        const ambient =
            new THREE.HemisphereLight(
                0xAAB7C8,
                0x07080C,
                1.3
            );

        introScene.add(
            ambient
        );

        const light =
            new THREE.DirectionalLight(
                0xFFE9B4,
                3.5
            );

        light.position.set(
            6,
            9,
            8
        );

        introScene.add(
            light
        );

        const blue =
            new THREE.PointLight(
                0x326EA8,
                4,
                18
            );

        blue.position.set(
            -7,
            4,
            4
        );

        introScene.add(
            blue
        );
    }

    function animateIntro() {
        if (!introRenderer) return;

        requestAnimationFrame(
            animateIntro
        );

        const t =
            performance.now() *
            0.00035;

        introCamera.position.x =
            8 +
            Math.sin(t) * 0.6;

        introCamera.position.y =
            4.8 +
            Math.sin(t * 1.4) * 0.2;

        introCamera.lookAt(
            0,
            2.5,
            0
        );

        introRenderer.render(
            introScene,
            introCamera
        );
    }

    function resizeIntro() {
        const container =
            getContainer(
                "intro3dScene"
            );

        if (
            !container ||
            !introRenderer ||
            !introCamera
        ) {
            return;
        }

        const width =
            Math.max(
                1,
                container.clientWidth
            );

        const height =
            Math.max(
                1,
                container.clientHeight
            );

        introCamera.aspect =
            width / height;

        introCamera.updateProjectionMatrix();

        introRenderer.setSize(
            width,
            height
        );
    }

    /* =====================================================
       MAIN SCENE INIT
       ===================================================== */

    function init() {
        if (initialized) return;

        const container =
            getContainer("office3d");

        if (!container) {
            console.warn(
                "office3d container not found."
            );

            return;
        }

        scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                0x080A0F
            );

        scene.fog =
            new THREE.FogExp2(
                0x080A0F,
                0.035
            );

        camera =
            new THREE.PerspectiveCamera(
                48,
                1,
                0.1,
                100
            );

        camera.position.set(
            DEFAULT_CAMERA.x,
            DEFAULT_CAMERA.y,
            DEFAULT_CAMERA.z
        );

        camera.lookAt(
            DEFAULT_CAMERA.lookX,
            DEFAULT_CAMERA.lookY,
            DEFAULT_CAMERA.lookZ
        );

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

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure =
            1.15;

        renderer.shadowMap.enabled =
            true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        container.innerHTML = "";

        container.appendChild(
            renderer.domElement
        );

        clock =
            new THREE.Clock();

        createLighting();
        createOffice();

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        bindInteractions();

        initialized = true;

        initIntroScene();

        renderLoop();

        console.log(
            "Office3D v" +
            VERSION +
            " initialized."
        );
    }

    /* =====================================================
       INTERACTIONS
       ===================================================== */

    function bindInteractions() {
        document.addEventListener(
            "click",
            event => {
                const card =
                    event.target.closest(
                        "[data-decision-card]"
                    );

                if (!card) return;

                const index =
                    Number(
                        card.dataset
                            .decisionCard
                    );

                if (
                    Number.isFinite(index)
                ) {
                    selectDecisionCard(
                        index
                    );
                }
            }
        );
    }

    /* =====================================================
       RENDER
       ===================================================== */

    function resize() {
        if (
            !renderer ||
            !camera
        ) return;

        const container =
            getContainer(
                "office3d"
            );

        if (!container) return;

        const width =
            Math.max(
                1,
                container.clientWidth
            );

        const height =
            Math.max(
                1,
                container.clientHeight
            );

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );
    }

    function renderLoop() {
        requestAnimationFrame(
            renderLoop
        );

        const delta =
            Math.min(
                clock.getDelta(),
                0.05
            );

        const elapsed =
            clock.elapsedTime;

        updateCameraTween();

        updateEnvironment(
            elapsed
        );

        if (
            officeRoot
        ) {
            officeRoot.rotation.y =
                Math.sin(
                    elapsed * 0.08
                ) * 0.003;
        }

        renderer.render(
            scene,
            camera
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.Office3D = {
        version: VERSION,

        init,

        showEvent,

        showNews: showEvent,

        focusMonitor,

        resetCamera,

        drawNewsScreen,

        selectDecisionCard,

        hideDecisionCards,

        getScene() {
            return scene;
        },

        getCamera() {
            return camera;
        },

        getRenderer() {
            return renderer;
        }
    };

    /* =====================================================
       AUTO INIT
       ===================================================== */

    function autoStart() {
        if (
            getContainer("office3d")
        ) {
            init();
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            autoStart
        );
    } else {
        autoStart();
    }

})();