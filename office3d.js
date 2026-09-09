/* =========================================================
   REPUBLIC OF ABSURDITY
   OFFICE 3D ENGINE — FINAL
   Cinematic Presidential Office + Animated Intro
   ========================================================= */

(() => {
    "use strict";

    if (window.Office3D) return;

    const VERSION = "FINAL";

    let THREE_READY = typeof THREE !== "undefined";

    if (!THREE_READY) {
        console.warn("Office3D: Three.js not found.");
        return;
    }

    /* =====================================================
       GLOBAL STATE
       ===================================================== */

    let office = null;
    let intro = null;

    let activeMode = "none";
    let currentEvent = null;

    let clock = new THREE.Clock();

    let musicEnabled = true;
    let fxEnabled = true;

    let audioContext = null;
    let masterGain = null;
    let ambientOsc = null;

    /* =====================================================
       COLORS
       ===================================================== */

    const COLORS = {
        black: 0x07090d,
        navy: 0x0c1726,
        navy2: 0x102a43,
        wood: 0x24150f,
        wood2: 0x3b2417,
        gold: 0xd4af37,
        gold2: 0xf0cf67,
        cream: 0xf3f1e8,
        red: 0xb42318,
        green: 0x16805b,
        blue: 0x2878b8,
        grey: 0x667085,
        white: 0xffffff
    };

    /* =====================================================
       HELPERS
       ===================================================== */

    function mat(color, options = {}) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: options.roughness ?? 0.55,
            metalness: options.metalness ?? 0.05,
            transparent: options.transparent ?? false,
            opacity: options.opacity ?? 1
        });
    }

    function box(w, h, d, material) {
        return new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            material
        );
    }

    function cyl(radius, height, material, segments = 32) {
        return new THREE.Mesh(
            new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                segments
            ),
            material
        );
    }

    function sphere(radius, material, segments = 24) {
        return new THREE.Mesh(
            new THREE.SphereGeometry(
                radius,
                segments,
                segments
            ),
            material
        );
    }

    function setShadow(object) {
        object.castShadow = true;
        object.receiveShadow = true;
        return object;
    }

    function clearElement(el) {
        if (!el) return;

        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    function resizeRenderer(data) {
        if (!data || !data.renderer || !data.container) return;

        const width = Math.max(
            1,
            data.container.clientWidth || window.innerWidth
        );

        const height = Math.max(
            1,
            data.container.clientHeight || window.innerHeight
        );

        data.camera.aspect = width / height;
        data.camera.updateProjectionMatrix();

        data.renderer.setSize(width, height, false);
    }

    /* =====================================================
       MATERIALS
       ===================================================== */

    function createGoldMaterial() {
        return mat(COLORS.gold, {
            roughness: 0.28,
            metalness: 0.85
        });
    }

    /* =====================================================
       OFFICE CREATION
       ===================================================== */

    function createOffice() {

        const container = document.getElementById("office3d");

        if (!container) {
            console.warn("Office3D: #office3d not found.");
            return null;
        }

        clearElement(container);

        const scene = new THREE.Scene();

        scene.background = new THREE.Color(COLORS.black);

        scene.fog = new THREE.FogExp2(
            COLORS.black,
            0.028
        );

        const camera = new THREE.PerspectiveCamera(
            48,
            1,
            0.1,
            100
        );

        camera.position.set(
            0,
            3.6,
            10.5
        );

        camera.lookAt(
            0,
            2.1,
            0
        );

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.15;

        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";

        container.appendChild(renderer.domElement);

        const root = new THREE.Group();

        scene.add(root);

        const environment = {
            leaves: [],
            flags: [],
            lamps: [],
            particles: [],
            floating: [],
            cards: [],
            dossier: null,
            monitor: null,
            monitorCanvas: null,
            monitorTexture: null,
            monitorScreen: null,
            desk: null,
            cameraHome: new THREE.Vector3(
                0,
                3.6,
                10.5
            ),
            cameraLook: new THREE.Vector3(
                0,
                2.1,
                0
            ),
            cameraTarget: null,
            cameraTargetLook: null,
            cameraTween: null,
            shake: 0,
            shockwave: null
        };

        /* =================================================
           LIGHTING
           ================================================= */

        const ambient = new THREE.HemisphereLight(
            0xb9c7d8,
            0x07090d,
            1.35
        );

        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(
            0xffe5ae,
            3.2
        );

        keyLight.position.set(
            -5,
            9,
            7
        );

        keyLight.castShadow = true;

        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;

        keyLight.shadow.camera.left = -12;
        keyLight.shadow.camera.right = 12;
        keyLight.shadow.camera.top = 12;
        keyLight.shadow.camera.bottom = -12;

        scene.add(keyLight);

        const blueLight = new THREE.PointLight(
            0x163c68,
            18,
            22
        );

        blueLight.position.set(
            5,
            4,
            -3
        );

        scene.add(blueLight);

        const goldLight = new THREE.PointLight(
            COLORS.gold,
            12,
            15
        );

        goldLight.position.set(
            -4,
            4,
            2
        );

        scene.add(goldLight);

        /* =================================================
           FLOOR
           ================================================= */

        const floor = setShadow(
            box(
                24,
                0.35,
                24,
                mat(COLORS.wood, {
                    roughness: 0.48
                })
            )
        );

        floor.position.y = -0.2;

        root.add(floor);

        /* =================================================
           RUG
           ================================================= */

        const rug = new THREE.Mesh(
            new THREE.BoxGeometry(
                8.8,
                0.06,
                5.8
            ),
            mat(0x161c27, {
                roughness: 0.9
            })
        );

        rug.position.set(
            0,
            0.02,
            1.4
        );

        root.add(rug);

        const rugBorder = new THREE.LineSegments(
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(
                    8.8,
                    0.07,
                    5.8
                )
            ),
            new THREE.LineBasicMaterial({
                color: COLORS.gold,
                transparent: true,
                opacity: 0.25
            })
        );

        rugBorder.position.copy(rug.position);

        root.add(rugBorder);

        /* =================================================
           BACK WALL
           ================================================= */

        const backWall = box(
            24,
            9,
            0.35,
            mat(COLORS.navy, {
                roughness: 0.82
            })
        );

        backWall.position.set(
            0,
            4.3,
            -5
        );

        root.add(backWall);

        /* =================================================
           WALL PANELS
           ================================================= */

        for (let x = -9; x <= 9; x += 3) {

            const panel = box(
                2.5,
                7.6,
                0.08,
                mat(0x122033, {
                    roughness: 0.72
                })
            );

            panel.position.set(
                x,
                4.2,
                -4.78
            );

            root.add(panel);

            const strip = box(
                0.025,
                7.5,
                0.025,
                createGoldMaterial()
            );

            strip.position.set(
                x - 1.25,
                4.2,
                -4.67
            );

            root.add(strip);
        }

        /* =================================================
           CEILING LIGHTS
           ================================================= */

        for (let x = -6; x <= 6; x += 3) {

            const lightMesh = cyl(
                0.12,
                0.04,
                mat(COLORS.gold)
            );

            lightMesh.position.set(
                x,
                8.5,
                -1
            );

            root.add(lightMesh);

            const point = new THREE.PointLight(
                0xffe6ae,
                4,
                7
            );

            point.position.set(
                x,
                8.1,
                -1
            );

            root.add(point);
        }

        /* =================================================
           DESK
           ================================================= */

        const deskGroup = new THREE.Group();

        deskGroup.position.set(
            0,
            0,
            1.5
        );

        root.add(deskGroup);

        const deskTop = setShadow(
            box(
                7.8,
                0.42,
                2.6,
                mat(COLORS.wood2, {
                    roughness: 0.36
                })
            )
        );

        deskTop.position.y = 2.05;

        deskGroup.add(deskTop);

        const deskFront = box(
            7.3,
            1.5,
            0.22,
            mat(COLORS.wood, {
                roughness: 0.48
            })
        );

        deskFront.position.set(
            0,
            1.25,
            1.15
        );

        deskGroup.add(deskFront);

        const goldEdge = box(
            7.7,
            0.08,
            0.08,
            createGoldMaterial()
        );

        goldEdge.position.set(
            0,
            2.26,
            0.1
        );

        deskGroup.add(goldEdge);

        for (const x of [-3.1, 3.1]) {

            const leg = box(
                0.34,
                1.7,
                1.8,
                mat(COLORS.wood)
            );

            leg.position.set(
                x,
                1.0,
                1.5
            );

            deskGroup.add(leg);
        }

        environment.desk = deskGroup;

        /* =================================================
           DESK OBJECTS
           ================================================= */

        const namePlate = box(
            1.5,
            0.08,
            0.45,
            createGoldMaterial()
        );

        namePlate.position.set(
            0,
            2.3,
            2.2
        );

        deskGroup.add(namePlate);

        const nameText = box(
            1.1,
            0.025,
            0.12,
            mat(COLORS.black)
        );

        nameText.position.set(
            0,
            2.36,
            2.0
        );

        deskGroup.add(nameText);

        /* =================================================
           CHAIR
           ================================================= */

        const chair = new THREE.Group();

        chair.position.set(
            0,
            0,
            4.0
        );

        root.add(chair);

        const seat = setShadow(
            box(
                2.2,
                0.35,
                2.0,
                mat(0x10131a, {
                    roughness: 0.82
                })
            )
        );

        seat.position.y = 1.35;

        chair.add(seat);

        const back = setShadow(
            box(
                2.15,
                2.8,
                0.38,
                mat(0x0d1118, {
                    roughness: 0.78
                })
            )
        );

        back.position.set(
            0,
            2.65,
            0.75
        );

        chair.add(back);

        for (let x = -0.75; x <= 0.75; x += 0.75) {

            const leg = cyl(
                0.09,
                1.0,
                createGoldMaterial(),
                16
            );

            leg.position.set(
                x,
                0.65,
                0
            );

            chair.add(leg);
        }

        /* =================================================
           MONITOR
           ================================================= */

        const monitorGroup = new THREE.Group();

        monitorGroup.position.set(
            0,
            3.05,
            -0.25
        );

        root.add(monitorGroup);

        const frame = setShadow(
            box(
                5.2,
                3.05,
                0.22,
                mat(0x090c12, {
                    roughness: 0.35,
                    metalness: 0.65
                })
            )
        );

        monitorGroup.add(frame);

        const canvas = document.createElement("canvas");

        canvas.width = 1024;
        canvas.height = 600;

        const texture = new THREE.CanvasTexture(
            canvas
        );

        texture.colorSpace =
            THREE.SRGBColorSpace;

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(
                4.8,
                2.65
            ),
            new THREE.MeshBasicMaterial({
                map: texture
            })
        );

        screen.position.z = 0.13;

        monitorGroup.add(screen);

        const stand = box(
            0.3,
            1.1,
            0.35,
            mat(0x11151c, {
                roughness: 0.4,
                metalness: 0.6
            })
        );

        stand.position.y = -2.0;

        monitorGroup.add(stand);

        const base = box(
            1.8,
            0.14,
            0.7,
            createGoldMaterial()
        );

        base.position.y = -2.5;

        monitorGroup.add(base);

        environment.monitor = monitorGroup;
        environment.monitorCanvas = canvas;
        environment.monitorTexture = texture;
        environment.monitorScreen = screen;

        drawNewsScreen(
            "ABSURD NEWS",
            "در انتظار تصمیم رئیس...",
            "سامانه خبری جمهوری مسخره‌ها",
            "WORLD",
            "STANDBY"
        );

        /* =================================================
           BOOKCASE
           ================================================= */

        const shelf = new THREE.Group();

        shelf.position.set(
            -7.2,
            0,
            -4.2
        );

        root.add(shelf);

        const shelfBody = box(
            3.4,
            6.5,
            0.65,
            mat(COLORS.wood2)
        );

        shelfBody.position.y = 3.2;

        shelf.add(shelfBody);

        for (let i = 0; i < 5; i++) {

            const board = box(
                3.2,
                0.12,
                0.8,
                createGoldMaterial()
            );

            board.position.set(
                0,
                0.7 + i * 1.25,
                -0.1
            );

            shelf.add(board);

            for (let j = 0; j < 5; j++) {

                const book = box(
                    0.3 + Math.random() * 0.15,
                    0.7 + Math.random() * 0.25,
                    0.45,
                    mat(
                        [
                            0x6e2737,
                            0x284f62,
                            0x695226,
                            0x343b58
                        ][
                            (i + j) % 4
                        ]
                    )
                );

                book.position.set(
                    -1.25 + j * 0.6,
                    1.05 + i * 1.25,
                    0
                );

                shelf.add(book);
            }
        }

        /* =================================================
           PLANT
           ================================================= */

        const plant = new THREE.Group();

        plant.position.set(
            6.7,
            0,
            -3.7
        );

        root.add(plant);

        const pot = cyl(
            0.75,
            0.85,
            mat(0x252933, {
                roughness: 0.72
            })
        );

        pot.position.y = 0.45;

        plant.add(pot);

        for (let i = 0; i < 11; i++) {

            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.32,
                    10,
                    10
                ),
                mat(0x234c36, {
                    roughness: 0.82
                })
            );

            leaf.scale.set(
                0.65,
                1.7,
                0.35
            );

            leaf.position.set(
                Math.cos(i) * 0.4,
                1.1 + Math.random() * 1.5,
                Math.sin(i) * 0.4
            );

            leaf.rotation.z =
                Math.sin(i) * 0.55;

            leaf.userData.baseRotation =
                leaf.rotation.z;

            environment.leaves.push(leaf);

            plant.add(leaf);
        }

        /* =================================================
           FLAG
           ================================================= */

        function createFlag(x, z) {

            const group = new THREE.Group();

            group.position.set(
                x,
                0,
                z
            );

            root.add(group);

            const pole = cyl(
                0.045,
                5.6,
                createGoldMaterial(),
                16
            );

            pole.position.y = 2.8;

            group.add(pole);

            const flag = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    2.4,
                    1.45,
                    10,
                    5
                ),
                mat(0x263b55, {
                    roughness: 0.65,
                    side: THREE.DoubleSide
                })
            );

            flag.position.set(
                1.05,
                4.25,
                0
            );

            flag.rotation.y = -0.04;

            flag.userData.phase =
                Math.random() * 10;

            group.add(flag);

            environment.flags.push(flag);
        }

        createFlag(-5.4, -4.1);
        createFlag(5.4, -4.1);

        /* =================================================
           DESK LAMP
           ================================================= */

        const lamp = new THREE.Group();

        lamp.position.set(
            -2.8,
            2.25,
            1.2
        );

        root.add(lamp);

        const lampBase = cyl(
            0.4,
            0.12,
            createGoldMaterial()
        );

        lamp.add(lampBase);

        const arm = box(
            0.08,
            1.1,
            0.08,
            createGoldMaterial()
        );

        arm.position.y = 0.55;

        arm.rotation.z = -0.35;

        lamp.add(arm);

        const shade = new THREE.Mesh(
            new THREE.ConeGeometry(
                0.45,
                0.5,
                32,
                1,
                true
            ),
            mat(0x1b2029, {
                roughness: 0.4,
                metalness: 0.5,
                side: THREE.DoubleSide
            })
        );

        shade.position.set(
            -0.2,
            1.05,
            0
        );

        shade.rotation.z = 0.35;

        lamp.add(shade);

        const lampLight = new THREE.PointLight(
            0xffd47a,
            6,
            4
        );

        lampLight.position.set(
            -0.35,
            0.9,
            0
        );

        lamp.add(lampLight);

        environment.lamps.push(
            lampLight
        );

        /* =================================================
           AMBIENT PARTICLES
           ================================================= */

        const particleGeometry =
            new THREE.BufferGeometry();

        const positions = [];

        for (let i = 0; i < 260; i++) {

            positions.push(
                (Math.random() - 0.5) * 18,
                Math.random() * 7,
                (Math.random() - 0.5) * 12
            );
        }

        particleGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3
            )
        );

        const particleMaterial =
            new THREE.PointsMaterial({
                color: 0xc9d2dc,
                size: 0.025,
                transparent: true,
                opacity: 0.23
            });

        const particles = new THREE.Points(
            particleGeometry,
            particleMaterial
        );

        root.add(particles);

        environment.particles.push(
            particles
        );

        /* =================================================
           DOSSIER
           ================================================= */

        const dossier = createDossier();

        dossier.position.set(
            0,
            2.45,
            1.1
        );

        dossier.visible = false;

        root.add(dossier);

        environment.dossier = dossier;

        /* =================================================
           EVENT CAMERA
           ================================================= */

        environment.cameraHome =
            camera.position.clone();

        environment.cameraLook =
            new THREE.Vector3(
                0,
                2.1,
                0
            );

        const data = {
            type: "office",
            container,
            scene,
            root,
            camera,
            renderer,
            environment
        };

        resizeRenderer(data);

        window.addEventListener(
            "resize",
            () => resizeRenderer(data)
        );

        data.animate = () =>
            animateOffice(data);

        return data;
    }

    /* =====================================================
       DOSSIER
       ===================================================== */

    function createDossier() {

        const group = new THREE.Group();

        const body = box(
            3.6,
            0.12,
            2.5,
            mat(0x15191f, {
                roughness: 0.6
            })
        );

        group.add(body);

        const goldLine = box(
            3.2,
            0.025,
            0.06,
            createGoldMaterial()
        );

        goldLine.position.y = 0.08;

        group.add(goldLine);

        const seal = cyl(
            0.28,
            0.05,
            createGoldMaterial()
        );

        seal.rotation.x =
            Math.PI / 2;

        seal.position.set(
            0,
            0.11,
            0
        );

        group.add(seal);

        return group;
    }

    /* =====================================================
       ANIMATION
       ===================================================== */

    function animateOffice(data) {

        if (!data) return;

        const t = clock.getElapsedTime();

        const {
            environment,
            camera,
            scene,
            renderer
        } = data;

        /* Leaves */

        environment.leaves.forEach(
            (leaf, i) => {

                leaf.rotation.z =
                    leaf.userData.baseRotation +
                    Math.sin(
                        t * 1.1 + i
                    ) * 0.08;
            }
        );

        /* Flags */

        environment.flags.forEach(
            (flag, i) => {

                flag.rotation.y =
                    Math.sin(
                        t * 1.4 + i
                    ) * 0.08;
            }
        );

        /* Lamp */

        environment.lamps.forEach(
            (light, i) => {

                light.intensity =
                    5.5 +
                    Math.sin(
                        t * 2 + i
                    ) * 0.4;
            }
        );

        /* Particles */

        environment.particles.forEach(
            particles => {

                particles.rotation.y =
                    t * 0.015;
            }
        );

        /* Camera */

        if (
            !environment.cameraTween &&
            activeMode === "office"
        ) {

            const driftX =
                Math.sin(t * 0.18) * 0.08;

            const driftY =
                Math.cos(t * 0.21) * 0.045;

            camera.position.x =
                environment.cameraHome.x +
                driftX;

            camera.position.y =
                environment.cameraHome.y +
                driftY;

            camera.lookAt(
                environment.cameraLook
            );
        }

        if (environment.cameraTween) {

            updateCameraTween(
                data,
                t
            );
        }

        if (environment.shake > 0) {

            camera.position.x +=
                (Math.random() - 0.5) *
                environment.shake;

            camera.position.y +=
                (Math.random() - 0.5) *
                environment.shake;

            environment.shake *= 0.9;

            if (
                environment.shake <
                0.001
            ) {
                environment.shake = 0;
            }
        }

        renderer.render(
            scene,
            camera
        );

        requestAnimationFrame(
            data.animate
        );
    }

    /* =====================================================
       CAMERA TWEEN
       ===================================================== */

    function animateCamera(
        data,
        target,
        lookAt,
        duration = 900
    ) {

        if (!data) return;

        const startPosition =
            data.camera.position.clone();

        const startLook =
            environmentLook(
                data.camera
            );

        data.environment.cameraTween = {
            start: performance.now(),
            duration,
            startPosition,
            target: target.clone(),
            startLook,
            targetLook: lookAt.clone()
        };
    }

    function environmentLook(camera) {

        const direction =
            new THREE.Vector3();

        camera.getWorldDirection(
            direction
        );

        return camera.position
            .clone()
            .add(direction.multiplyScalar(5));
    }

    function updateCameraTween(
        data,
        now
    ) {

        const tween =
            data.environment.cameraTween;

        const elapsed =
            now - tween.start;

        let p =
            Math.min(
                1,
                elapsed / tween.duration
            );

        p = p * p * (3 - 2 * p);

        data.camera.position.lerpVectors(
            tween.startPosition,
            tween.target,
            p
        );

        const look =
            new THREE.Vector3().lerpVectors(
                tween.startLook,
                tween.targetLook,
                p
            );

        data.camera.lookAt(look);

        if (p >= 1) {
            data.environment.cameraTween =
                null;
        }
    }

    /* =====================================================
       MONITOR NEWS
       ===================================================== */

    function drawNewsScreen(
        headline = "ABSURD NEWS",
        description = "",
        country = "WORLD",
        category = "BREAKING",
        status = "LIVE"
    ) {

        if (!office) return;

        const canvas =
            office.environment.monitorCanvas;

        const texture =
            office.environment.monitorTexture;

        if (!canvas || !texture) return;

        const ctx =
            canvas.getContext("2d");

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(
            0,
            0,
            w,
            h
        );

        /* Background */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                w,
                h
            );

        gradient.addColorStop(
            0,
            "#08111d"
        );

        gradient.addColorStop(
            1,
            "#020407"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        /* Top bar */

        ctx.fillStyle =
            "#b42318";

        ctx.fillRect(
            0,
            0,
            w,
            82
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 34px Arial";

        ctx.fillText(
            "ABSURD NEWS",
            42,
            53
        );

        /* LIVE */

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 27px Arial";

        ctx.fillText(
            "● " + status,
            w - 210,
            52
        );

        /* Category */

        ctx.fillStyle =
            "#d4af37";

        ctx.font =
            "bold 25px Arial";

        ctx.fillText(
            String(category).toUpperCase(),
            44,
            130
        );

        /* Headline */

        ctx.fillStyle =
            "#f3f1e8";

        ctx.font =
            "bold 47px Arial";

        wrapText(
            ctx,
            String(headline),
            44,
            195,
            900,
            58
        );

        /* Description */

        ctx.fillStyle =
            "#b9c1cc";

        ctx.font =
            "27px Arial";

        wrapText(
            ctx,
            String(description),
            44,
            345,
            900,
            42
        );

        /* Country */

        ctx.fillStyle =
            "#d4af37";

        ctx.font =
            "bold 24px Arial";

        ctx.fillText(
            "REGION: " +
            String(country),
            44,
            505
        );

        /* Bottom */

        ctx.fillStyle =
            "rgba(212,175,55,.2)";

        ctx.fillRect(
            0,
            h - 62,
            w,
            62
        );

        ctx.fillStyle =
            "#f3f1e8";

        ctx.font =
            "22px Arial";

        ctx.fillText(
            "REPUBLIC OF ABSURDITY • WORLD DESK",
            38,
            h - 24
        );

        texture.needsUpdate = true;
    }

    function wrapText(
        ctx,
        text,
        x,
        y,
        maxWidth,
        lineHeight
    ) {

        const words =
            text.split(/\s+/);

        let line = "";

        for (let i = 0; i < words.length; i++) {

            const test =
                line +
                words[i] +
                " ";

            if (
                ctx.measureText(test).width >
                maxWidth &&
                line
            ) {

                ctx.fillText(
                    line,
                    x,
                    y
                );

                line =
                    words[i] + " ";

                y += lineHeight;

            } else {

                line = test;
            }
        }

        if (line) {
            ctx.fillText(
                line,
                x,
                y
            );
        }
    }

    /* =====================================================
       SHOW EVENT
       ===================================================== */

    function showEvent(event) {

        if (!office) return;

        currentEvent =
            event || {};

        const title =
            event?.title ||
            "رویداد جدید";

        const description =
            event?.description ||
            "گزارش جدیدی از وضعیت کشور منتشر شده است.";

        const country =
            event?.country ||
            event?.targetCountry ||
            "WORLD";

        const category =
            event?.category ||
            event?.type ||
            "BREAKING";

        drawNewsScreen(
            title,
            description,
            country,
            category,
            "LIVE"
        );

        const env =
            office.environment;

        if (env.dossier) {

            env.dossier.visible = true;

            env.dossier.scale.set(
                0.15,
                0.15,
                0.15
            );

            env.dossier.position.y =
                1.8;

            animateDossier(
                env.dossier
            );
        }

        focusMonitor();

        createDecisionCards(
            event?.choices || []
        );
    }

    /* =====================================================
       DOSSIER ANIMATION
       ===================================================== */

    function animateDossier(
        dossier
    ) {

        const start =
            performance.now();

        const duration = 850;

        function tick(now) {

            const p =
                Math.min(
                    1,
                    (now - start) /
                    duration
                );

            const e =
                1 -
                Math.pow(
                    1 - p,
                    3
                );

            dossier.position.y =
                1.8 +
                e * 0.65;

            const s =
                0.15 +
                e * 0.85;

            dossier.scale.set(
                s,
                s,
                s
            );

            if (p < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    /* =====================================================
       DECISION CARDS
       ===================================================== */

    function createDecisionCards(
        choices
    ) {

        const env =
            office.environment;

        env.cards.forEach(
            card => office.root.remove(card)
        );

        env.cards = [];

        if (!choices.length) return;

        const limited =
            choices.slice(0, 3);

        limited.forEach(
            (choice, index) => {

                const card =
                    createCard(
                        choice,
                        index
                    );

                card.visible = false;

                office.root.add(card);

                env.cards.push(card);

                setTimeout(
                    () => {

                        card.visible = true;

                        animateCardIn(
                            card,
                            index
                        );

                    },
                    180 +
                    index * 230
                );
            }
        );
    }

    function createCard(
        choice,
        index
    ) {

        const group =
            new THREE.Group();

        const body = box(
            2.25,
            1.45,
            0.12,
            mat(
                index === 0
                    ? 0x162b3e
                    : 0x151b25,
                {
                    roughness: 0.38,
                    metalness: 0.32
                }
            )
        );

        group.add(body);

        const edge = new THREE.LineSegments(
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(
                    2.25,
                    1.45,
                    0.12
                )
            ),
            new THREE.LineBasicMaterial({
                color: COLORS.gold,
                transparent: true,
                opacity: 0.65
            })
        );

        group.add(edge);

        const strip = box(
            1.7,
            0.035,
            0.04,
            createGoldMaterial()
        );

        strip.position.y = 0.48;

        group.add(strip);

        group.userData.choice =
            choice;

        group.userData.index =
            index;

        group.userData.baseY =
            2.8;

        group.position.set(
            -3.1 + index * 3.1,
            1.7,
            3.0
        );

        return group;
    }

    function animateCardIn(
        card,
        index
    ) {

        const start =
            performance.now();

        const from =
            card.position.y;

        const to = 2.65;

        function tick(now) {

            const p =
                Math.min(
                    1,
                    (now - start) /
                    650
                );

            const e =
                1 -
                Math.pow(
                    1 - p,
                    3
                );

            card.position.y =
                from +
                (to - from) * e;

            card.rotation.y =
                (1 - e) *
                (index - 1) *
                0.18;

            if (p < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    /* =====================================================
       FOCUS MONITOR
       ===================================================== */

    function focusMonitor() {

        if (!office) return;

        activeMode = "office";

        const monitor =
            office.environment.monitor;

        const worldPosition =
            new THREE.Vector3();

        monitor.getWorldPosition(
            worldPosition
        );

        const target =
            worldPosition.clone();

        target.z += 4.9;

        target.y += 0.15;

        const look =
            worldPosition.clone();

        look.y += 0.1;

        animateCamera(
            office,
            target,
            look,
            900
        );
    }

    /* =====================================================
       RESET CAMERA
       ===================================================== */

    function resetCamera() {

        if (!office) return;

        const home =
            office.environment.cameraHome;

        const look =
            office.environment.cameraLook;

        animateCamera(
            office,
            home,
            look,
            850
        );
    }

    /* =====================================================
       SELECTED DECISION
       ===================================================== */

    function selectDecision(
        index
    ) {

        if (!office) return;

        const cards =
            office.environment.cards;

        cards.forEach(
            (card, i) => {

                if (i === index) {

                    animateSelectedCard(
                        card
                    );

                } else {

                    animateRetreatCard(
                        card,
                        i
                    );
                }
            }
        );

        setTimeout(
            resetCamera,
            900
        );
    }

    function animateSelectedCard(
        card
    ) {

        const start =
            performance.now();

        const original =
            card.scale.clone();

        function tick(now) {

            const p =
                Math.min(
                    1,
                    (now - start) /
                    550
                );

            const e =
                1 -
                Math.pow(
                    1 - p,
                    3
                );

            const s =
                1 +
                e * 0.22;

            card.scale.set(
                original.x * s,
                original.y * s,
                original.z * s
            );

            card.position.z =
                2.3 -
                e * 0.8;

            if (p < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function animateRetreatCard(
        card,
        index
    ) {

        const start =
            performance.now();

        const from =
            card.position.z;

        const to = 5.5;

        function tick(now) {

            const p =
                Math.min(
                    1,
                    (now - start) /
                    600
                );

            const e =
                1 -
                Math.pow(
                    1 - p,
                    3
                );

            card.position.z =
                from +
                (to - from) * e;

            card.rotation.y =
                (index - 1) *
                e *
                0.3;

            if (p < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    /* =====================================================
       INTRO SCENE
       ===================================================== */

    function createIntro() {

        const container =
            document.getElementById(
                "intro3dScene"
            );

        if (!container) {
            console.warn(
                "Office3D: #intro3dScene not found."
            );

            return null;
        }

        clearElement(container);

        const scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                0x05070b
            );

        scene.fog =
            new THREE.FogExp2(
                0x05070b,
                0.018
            );

        const camera =
            new THREE.PerspectiveCamera(
                45,
                1,
                0.1,
                100
            );

        camera.position.set(
            0,
            6.2,
            17
        );

        camera.lookAt(
            0,
            3,
            0
        );

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference:
                    "high-performance"
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

        container.appendChild(
            renderer.domElement
        );

        const root =
            new THREE.Group();

        scene.add(root);

        /* Lighting */

        const moon =
            new THREE.DirectionalLight(
                0x9db9d6,
                2.5
            );

        moon.position.set(
            -5,
            10,
            8
        );

        scene.add(moon);

        const warm =
            new THREE.PointLight(
                COLORS.gold,
                20,
                30
            );

        warm.position.set(
            0,
            4,
            8
        );

        scene.add(warm);

        /* Ground */

        const ground =
            box(
                30,
                0.3,
                25,
                mat(0x0c1017)
            );

        ground.position.y =
            -0.2;

        root.add(ground);

        /* Building */

        const building =
            new THREE.Group();

        building.position.y =
            0;

        root.add(building);

        const main =
            setShadow(
                box(
                    10,
                    6,
                    5,
                    mat(
                        0x202832,
                        {
                            roughness: 0.75
                        }
                    )
                )
            );

        main.position.y =
            3;

        building.add(main);

        /* Steps */

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const step =
                box(
                    13 - i * 0.6,
                    0.35,
                    2.2 - i * 0.2,
                    mat(0x252c35)
                );

            step.position.set(
                0,
                0.18 + i * 0.35,
                4.0 - i * 0.38
            );

            building.add(step);
        }

        /* Columns */

        for (
            const x of [-4.1, 4.1]
        ) {

            const column =
                box(
                    0.9,
                    6.8,
                    1,
                    createGoldMaterial()
                );

            column.position.set(
                x,
                3.4,
                2.5
            );

            building.add(column);
        }

        /* Windows */

        const windows = [];

        for (
            let row = 0;
            row < 2;
            row++
        ) {

            for (
                let col = -3;
                col <= 3;
                col += 2
            ) {

                const windowMesh =
                    box(
                        1.25,
                        1.4,
                        0.08,
                        mat(
                            0x102a43,
                            {
                                roughness: 0.2,
                                metalness: 0.3
                            }
                        )
                    );

                windowMesh.position.set(
                    col,
                    3.2 + row * 2,
                    5.02
                );

                building.add(
                    windowMesh
                );

                windows.push(
                    windowMesh
                );
            }
        }

        /* Dome */

        const dome =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    2.8,
                    40,
                    20,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                ),
                mat(
                    0x26303a,
                    {
                        roughness: 0.7
                    }
                )
            );

        dome.position.set(
            0,
            6,
            2.5
        );

        building.add(dome);

        /* Gold emblem */

        const emblem =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.75,
                    0.1,
                    12,
                    48
                ),
                createGoldMaterial()
            );

        emblem.position.set(
            0,
            4.6,
            5.12
        );

        building.add(emblem);

        /* Intro flags */

        const flags = [];

        for (
            const x of [-6.3, 6.3]
        ) {

            const pole =
                cyl(
                    0.06,
                    6,
                    createGoldMaterial(),
                    16
                );

            pole.position.set(
                x,
                3,
                4
            );

            root.add(pole);

            const flag =
                new THREE.Mesh(
                    new THREE.PlaneGeometry(
                        2.2,
                        1.3,
                        8,
                        4
                    ),
                    mat(
                        0x283d58,
                        {
                            side:
                                THREE.DoubleSide,
                            roughness: 0.6
                        }
                    )
                );

            flag.position.set(
                x + 1,
                4.7,
                4
            );

            flag.userData.phase =
                Math.random() * 10;

            root.add(flag);

            flags.push(flag);
        }

        /* Clouds */

        const clouds = [];

        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const cloud =
                new THREE.Group();

            cloud.position.set(
                (Math.random() - 0.5) * 28,
                8 +
                    Math.random() * 4,
                -5 -
                    Math.random() * 5
            );

            for (
                let j = 0;
                j < 4;
                j++
            ) {

                const puff =
                    sphere(
                        0.9 +
                            Math.random() *
                            0.8,
                        mat(
                            0x6d7885,
                            {
                                transparent:
                                    true,
                                opacity:
                                    0.18,
                                roughness:
                                    1
                            }
                        ),
                        16
                    );

                puff.position.set(
                    j * 0.8,
                    Math.random() * 0.4,
                    0
                );

                cloud.add(puff);
            }

            root.add(cloud);

            clouds.push(cloud);
        }

        /* Atmosphere particles */

        const geometry =
            new THREE.BufferGeometry();

        const positions = [];

        for (
            let i = 0;
            i < 300;
            i++
        ) {

            positions.push(
                (Math.random() - 0.5) *
                    30,
                Math.random() * 14,
                (Math.random() - 0.5) *
                    20
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3
            )
        );

        const particleSystem =
            new THREE.Points(
                geometry,
                new THREE.PointsMaterial({
                    color: 0xd9dee5,
                    size: 0.035,
                    transparent: true,
                    opacity: 0.25
                })
            );

        root.add(
            particleSystem
        );

        const data = {
            container,
            scene,
            root,
            camera,
            renderer,
            building,
            flags,
            clouds,
            windows,
            particleSystem,
            shockwave: null,
            introTime: 0,
            shocked: false
        };

        resizeRenderer(data);

        window.addEventListener(
            "resize",
            () => resizeRenderer(data)
        );

        return data;
    }

    /* =====================================================
       INTRO ANIMATION
       ===================================================== */

    function animateIntro() {

        if (!intro) return;

        const t =
            clock.getElapsedTime();

        intro.introTime = t;

        /* Camera cinematic movement */

        intro.camera.position.x =
            Math.sin(t * 0.11) *
            1.2;

        intro.camera.position.y =
            6.2 +
            Math.sin(t * 0.17) *
            0.18;

        intro.camera.position.z =
            17 -
            Math.sin(t * 0.09) *
            0.7;

        intro.camera.lookAt(
            0,
            3.1,
            2
        );

        /* Flags */

        intro.flags.forEach(
            (flag, i) => {

                flag.rotation.y =
                    Math.sin(
                        t * 1.3 +
                        flag.userData.phase
                    ) *
                    0.1;
            }
        );

        /* Clouds */

        intro.clouds.forEach(
            (cloud, i) => {

                cloud.position.x +=
                    0.004 +
                    i * 0.0003;

                if (
                    cloud.position.x >
                    16
                ) {
                    cloud.position.x =
                        -16;
                }
            }
        );

        /* Windows */

        intro.windows.forEach(
            (mesh, i) => {

                const pulse =
                    0.72 +
                    Math.sin(
                        t * 0.8 +
                        i
                    ) *
                    0.15;

                mesh.material.emissive =
                    new THREE.Color(
                        0x06131f
                    );

                mesh.material.emissiveIntensity =
                    pulse;
            }
        );

        intro.particleSystem.rotation.y =
            t * 0.01;

        /* Cinematic shockwave */

        if (
            !intro.shocked &&
            t > 5
        ) {

            intro.shocked = true;

            introShockwave();
        }

        intro.renderer.render(
            intro.scene,
            intro.camera
        );

        requestAnimationFrame(
            animateIntro
        );
    }

    /* =====================================================
       INTRO SHOCKWAVE
       ===================================================== */

    function introShockwave() {

        if (!intro) return;

        const ring =
            new THREE.Mesh(
                new THREE.RingGeometry(
                    0.2,
                    0.3,
                    64
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        COLORS.gold,
                    transparent: true,
                    opacity: 0.75,
                    side:
                        THREE.DoubleSide
                })
            );

        ring.position.set(
            0,
            3,
            5.15
        );

        intro.root.add(
            ring
        );

        const start =
            performance.now();

        const duration =
            1500;

        function tick(now) {

            const p =
                Math.min(
                    1,
                    (now - start) /
                    duration
                );

            ring.scale.set(
                1 + p * 15,
                1 + p * 15,
                1 + p * 15
            );

            ring.material.opacity =
                0.75 * (1 - p);

            intro.building.position.x =
                Math.sin(
                    p * Math.PI * 12
                ) *
                (1 - p) *
                0.12;

            if (p < 1) {

                requestAnimationFrame(
                    tick
                );

            } else {

                intro.root.remove(
                    ring
                );

                intro.building.position.x =
                    0;
            }
        }

        requestAnimationFrame(
            tick
        );
    }

    /* =====================================================
       AUDIO
       ===================================================== */

    function startAmbientAudio() {

        if (!musicEnabled) return;

        try {

            if (!audioContext) {

                audioContext =
                    new (
                        window.AudioContext ||
                        window.webkitAudioContext
                    )();

                masterGain =
                    audioContext.createGain();

                masterGain.gain.value =
                    0.025;

                masterGain.connect(
                    audioContext.destination
                );

                ambientOsc =
                    audioContext.createOscillator();

                ambientOsc.type =
                    "sine";

                ambientOsc.frequency.value =
                    52;

                ambientOsc.connect(
                    masterGain
                );

                ambientOsc.start();
            }

            if (
                audioContext.state ===
                "suspended"
            ) {
                audioContext.resume();
            }

        } catch (err) {

            console.warn(
                "Ambient audio unavailable.",
                err
            );
        }
    }

    function stopAmbientAudio() {

        if (!audioContext) return;

        try {

            if (masterGain) {
                masterGain.gain.value =
                    0;
            }

        } catch (_) {}
    }

    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        if (!THREE_READY) return;

        if (!office) {

            office =
                createOffice();

            if (office) {

                activeMode =
                    "office";

                office.animate();

            }
        }

        if (!intro) {

            intro =
                createIntro();

            if (intro) {
                animateIntro();
            }
        }

        /* Music controls */

        document.addEventListener(
            "click",
            () => {
                if (musicEnabled) {
                    startAmbientAudio();
                }
            },
            {
                once: true
            }
        );

        window.addEventListener(
            "republic:music-toggle",
            event => {

                musicEnabled =
                    event.detail?.enabled ??
                    !musicEnabled;

                if (musicEnabled) {
                    startAmbientAudio();
                } else {
                    stopAmbientAudio();
                }
            }
        );

        window.addEventListener(
            "republic:fx-toggle",
            event => {

                fxEnabled =
                    event.detail?.enabled ??
                    !fxEnabled;
            }
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

        selectDecision,

        drawNewsScreen,

        getScene() {
            return office?.scene || null;
        },

        getCamera() {
            return office?.camera || null;
        },

        getRenderer() {
            return office?.renderer || null;
        },

        startMusic() {
            musicEnabled = true;
            startAmbientAudio();
        },

        stopMusic() {
            musicEnabled = false;
            stopAmbientAudio();
        }
    };

    /* =====================================================
       AUTO INIT
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