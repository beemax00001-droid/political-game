/* =========================================================
   REPUBLIC OF ABSURDITY
   OFFICE 3D ENGINE v6.0
   CINEMATIC PRESIDENTIAL OFFICE
   ========================================================= */

(() => {
    "use strict";

    if (!window.THREE) {
        console.error("Three.js is required.");
        return;
    }

    const THREE = window.THREE;

    /* =====================================================
       CONFIG
       ===================================================== */

    const CONFIG = {
        version: "6.0",

        officeId: "office3d",
        introId: "intro3dScene",

        cameraMoveSpeed: 0.055,
        maxPixelRatio: 1.65,

        colors: {
            wall: 0x111821,
            wall2: 0x172230,
            wood: 0x351f14,
            wood2: 0x51321e,
            gold: 0xd4af37,
            goldBright: 0xf3d477,
            marble: 0x59616a,
            marbleDark: 0x20262d,
            black: 0x05070a,
            paper: 0xe8e1cf,
            green: 0x16805b,
            red: 0xb42318,
            blue: 0x163b5c,
            white: 0xf3f1e8
        }
    };

    /* =====================================================
       GLOBAL STATE
       ===================================================== */

    let office = null;
    let intro = null;

    let currentEvent = null;
    let currentNews = null;

    let cinematicBusy = false;

    /* =====================================================
       HELPERS
       ===================================================== */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function smoothStep(t) {
        t = clamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function easeInOut(t) {
        t = clamp(t, 0, 1);

        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function createMaterial(color, options = {}) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness:
                options.roughness !== undefined
                    ? options.roughness
                    : 0.65,
            metalness:
                options.metalness !== undefined
                    ? options.metalness
                    : 0
        });
    }

    function addBox(
        parent,
        size,
        position,
        material,
        rotation = null
    ) {
        const geometry = new THREE.BoxGeometry(
            size.x,
            size.y,
            size.z
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.copy(position);

        if (rotation) {
            mesh.rotation.set(
                rotation.x || 0,
                rotation.y || 0,
                rotation.z || 0
            );
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    }

    function addCylinder(
        parent,
        radiusTop,
        radiusBottom,
        height,
        position,
        material,
        segments = 32
    ) {
        const geometry =
            new THREE.CylinderGeometry(
                radiusTop,
                radiusBottom,
                height,
                segments
            );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.copy(position);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    }

    /* =====================================================
       CAMERA CONTROLLER
       ===================================================== */

    function createCameraController(
        camera,
        defaultPosition,
        defaultLook
    ) {
        const controller = {
            camera,

            targetPosition:
                defaultPosition.clone(),

            targetLook:
                defaultLook.clone(),

            currentLook:
                defaultLook.clone(),

            focusPosition:
                defaultPosition.clone(),

            focusLook:
                defaultLook.clone(),

            mode: "idle",

            progress: 1,

            moveTo(position, look, duration = 900) {
                this.startPosition =
                    camera.position.clone();

                this.startLook =
                    this.currentLook.clone();

                this.targetPosition =
                    position.clone();

                this.targetLook =
                    look.clone();

                this.progress = 0;

                this.duration = duration;

                this.mode = "moving";
            },

            update(delta) {
                if (this.mode !== "moving") {
                    return;
                }

                this.progress +=
                    delta * 1000 / this.duration;

                const t =
                    easeInOut(
                        clamp(this.progress, 0, 1)
                    );

                camera.position.lerpVectors(
                    this.startPosition,
                    this.targetPosition,
                    t
                );

                this.currentLook.lerpVectors(
                    this.startLook,
                    this.targetLook,
                    t
                );

                camera.lookAt(
                    this.currentLook
                );

                if (this.progress >= 1) {
                    this.mode = "idle";
                }
            }
        };

        return controller;
    }

    /* =====================================================
       OFFICE CREATION
       ===================================================== */

    function createOffice(container) {

        container.innerHTML = "";

        const scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                CONFIG.colors.black
            );

        scene.fog =
            new THREE.FogExp2(
                0x070a0f,
                0.035
            );

        const camera =
            new THREE.PerspectiveCamera(
                48,
                1,
                0.1,
                100
            );

        camera.position.set(
            0,
            4.4,
            12
        );

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                CONFIG.maxPixelRatio
            )
        );

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.15;

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        renderer.domElement.style.width =
            "100%";

        renderer.domElement.style.height =
            "100%";

        container.appendChild(
            renderer.domElement
        );

        const world =
            new THREE.Group();

        scene.add(world);

        /* =================================================
           MATERIALS
           ================================================= */

        const materials = {
            wall:
                createMaterial(
                    CONFIG.colors.wall,
                    { roughness: .88 }
                ),

            wall2:
                createMaterial(
                    CONFIG.colors.wall2,
                    { roughness: .8 }
                ),

            wood:
                createMaterial(
                    CONFIG.colors.wood,
                    { roughness: .55 }
                ),

            wood2:
                createMaterial(
                    CONFIG.colors.wood2,
                    { roughness: .45 }
                ),

            gold:
                createMaterial(
                    CONFIG.colors.gold,
                    {
                        roughness: .28,
                        metalness: .9
                    }
                ),

            goldBright:
                createMaterial(
                    CONFIG.colors.goldBright,
                    {
                        roughness: .2,
                        metalness: .85
                    }
                ),

            marble:
                createMaterial(
                    CONFIG.colors.marble,
                    { roughness: .32 }
                ),

            marbleDark:
                createMaterial(
                    CONFIG.colors.marbleDark,
                    { roughness: .48 }
                ),

            black:
                createMaterial(
                    CONFIG.colors.black,
                    { roughness: .3 }
                ),

            paper:
                createMaterial(
                    CONFIG.colors.paper,
                    { roughness: .85 }
                )
        };

        /* =================================================
           FLOOR
           ================================================= */

        const floor =
            addBox(
                world,
                new THREE.Vector3(
                    24,
                    .35,
                    22
                ),
                new THREE.Vector3(
                    0,
                    -.2,
                    0
                ),
                materials.marbleDark
            );

        floor.castShadow = false;

        /* =================================================
           RUG
           ================================================= */

        addBox(
            world,
            new THREE.Vector3(
                12,
                .08,
                7
            ),
            new THREE.Vector3(
                0,
                .02,
                1.5
            ),
            createMaterial(
                0x12171d,
                { roughness: 1 }
            )
        );

        addBox(
            world,
            new THREE.Vector3(
                11.5,
                .09,
                6.5
            ),
            new THREE.Vector3(
                0,
                .065,
                1.5
            ),
            createMaterial(
                0x20252b,
                { roughness: 1 }
            )
        );

        /* =================================================
           BACK WALL
           ================================================= */

        addBox(
            world,
            new THREE.Vector3(
                24,
                9,
                .35
            ),
            new THREE.Vector3(
                0,
                4.3,
                -6
            ),
            materials.wall
        );

        /* =================================================
           WALL PANELS
           ================================================= */

        for (let x = -10; x <= 10; x += 4) {

            addBox(
                world,
                new THREE.Vector3(
                    .08,
                    7.8,
                    .18
                ),
                new THREE.Vector3(
                    x,
                    4.1,
                    -5.78
                ),
                materials.wood2
            );

            addBox(
                world,
                new THREE.Vector3(
                    3.7,
                    .08,
                    .18
                ),
                new THREE.Vector3(
                    x + 2,
                    7.9,
                    -5.78
                ),
                materials.wood2
            );

            addBox(
                world,
                new THREE.Vector3(
                    3.7,
                    .08,
                    .18
                ),
                new THREE.Vector3(
                    x + 2,
                    .35,
                    -5.78
                ),
                materials.wood2
            );
        }

        /* =================================================
           GOLD WALL STRIP
           ================================================= */

        addBox(
            world,
            new THREE.Vector3(
                18,
                .05,
                .08
            ),
            new THREE.Vector3(
                0,
                6.8,
                -5.55
            ),
            materials.gold
        );

        /* =================================================
           DESK
           ================================================= */

        const desk =
            new THREE.Group();

        desk.position.set(
            0,
            0,
            0
        );

        world.add(desk);

        addBox(
            desk,
            new THREE.Vector3(
                9,
                .55,
                2.7
            ),
            new THREE.Vector3(
                0,
                2.25,
                -1.1
            ),
            materials.wood2
        );

        addBox(
            desk,
            new THREE.Vector3(
                8.5,
                .14,
                2.45
            ),
            new THREE.Vector3(
                0,
                2.57,
                -1.1
            ),
            materials.gold
        );

        addBox(
            desk,
            new THREE.Vector3(
                8.2,
                .16,
                2.2
            ),
            new THREE.Vector3(
                0,
                2.68,
                -1.1
            ),
            materials.wood
        );

        /* Desk legs */

        for (const x of [-3.5, 3.5]) {

            addBox(
                desk,
                new THREE.Vector3(
                    .65,
                    2.2,
                    1.7
                ),
                new THREE.Vector3(
                    x,
                    1.1,
                    -.9
                ),
                materials.wood
            );

            addBox(
                desk,
                new THREE.Vector3(
                    .7,
                    2.3,
                    .08
                ),
                new THREE.Vector3(
                    x,
                    1.1,
                    -1.8
                ),
                materials.gold
            );
        }

        /* =================================================
           PRESIDENTIAL NAMEPLATE
           ================================================= */

        const plate =
            addBox(
                desk,
                new THREE.Vector3(
                    2.4,
                    .16,
                    .65
                ),
                new THREE.Vector3(
                    0,
                    2.82,
                    -.65
                ),
                materials.gold
            );

        plate.rotation.x =
            THREE.MathUtils.degToRad(-7);

        /* =================================================
           DOSSIER
           ================================================= */

        const dossier =
            new THREE.Group();

        dossier.position.set(
            0,
            2.86,
            -1.7
        );

        world.add(dossier);

        const dossierBase =
            addBox(
                dossier,
                new THREE.Vector3(
                    2.8,
                    .12,
                    2
                ),
                new THREE.Vector3(
                    0,
                    0,
                    0
                ),
                materials.wood
            );

        dossierBase.rotation.x =
            THREE.MathUtils.degToRad(-2);

        const dossierPaper =
            addBox(
                dossier,
                new THREE.Vector3(
                    2.35,
                    .035,
                    1.55
                ),
                new THREE.Vector3(
                    0,
                    .09,
                    0
                ),
                materials.paper
            );

        dossierPaper.rotation.x =
            THREE.MathUtils.degToRad(-2);

        const dossierBand =
            addBox(
                dossier,
                new THREE.Vector3(
                    .18,
                    .06,
                    1.65
                ),
                new THREE.Vector3(
                    0,
                    .14,
                    0
                ),
                materials.gold
            );

        dossierBand.rotation.x =
            THREE.MathUtils.degToRad(-2);

        /* =================================================
           MONITOR
           ================================================= */

        const monitor =
            new THREE.Group();

        monitor.position.set(
            0,
            4.0,
            -4.65
        );

        world.add(monitor);

        addBox(
            monitor,
            new THREE.Vector3(
                6.2,
                3.45,
                .3
            ),
            new THREE.Vector3(
                0,
                0,
                0
            ),
            materials.black
        );

        const screenCanvas =
            document.createElement(
                "canvas"
            );

        screenCanvas.width = 1024;
        screenCanvas.height = 576;

        const screenContext =
            screenCanvas.getContext(
                "2d"
            );

        const screenTexture =
            new THREE.CanvasTexture(
                screenCanvas
            );

        screenTexture.colorSpace =
            THREE.SRGBColorSpace;

        const screenMaterial =
            new THREE.MeshBasicMaterial({
                map: screenTexture
            });

        const screen =
            addBox(
                monitor,
                new THREE.Vector3(
                    5.65,
                    2.95,
                    .04
                ),
                new THREE.Vector3(
                    0,
                    0,
                    .17
                ),
                screenMaterial
            );

        screen.castShadow = false;

        addBox(
            monitor,
            new THREE.Vector3(
                .22,
                1.4,
                .4
            ),
            new THREE.Vector3(
                0,
                -2,
                0
            ),
            materials.black
        );

        addBox(
            monitor,
            new THREE.Vector3(
                2.4,
                .18,
                1.2
            ),
            new THREE.Vector3(
                0,
                -2.7,
                0
            ),
            materials.black
        );

        /* =================================================
           CHAIR
           ================================================= */

        const chair =
            new THREE.Group();

        chair.position.set(
            0,
            0,
            2.8
        );

        world.add(chair);

        addBox(
            chair,
            new THREE.Vector3(
                3,
                .35,
                2.7
            ),
            new THREE.Vector3(
                0,
                1.35,
                0
            ),
            materials.black
        );

        addBox(
            chair,
            new THREE.Vector3(
                3,
                3.3,
                .35
            ),
            new THREE.Vector3(
                0,
                2.9,
                .95
            ),
            materials.black
        );

        addCylinder(
            chair,
            .18,
            .25,
            1.1,
            new THREE.Vector3(
                0,
                .7,
                0
            ),
            materials.gold
        );

        /* =================================================
           FLAGS
           ================================================= */

        function createFlag(x, color) {

            const flag =
                new THREE.Group();

            flag.position.set(
                x,
                0,
                -5.25
            );

            world.add(flag);

            addCylinder(
                flag,
                .055,
                .055,
                5.2,
                new THREE.Vector3(
                    0,
                    2.6,
                    0
                ),
                materials.gold,
                16
            );

            const cloth =
                addBox(
                    flag,
                    new THREE.Vector3(
                        1.45,
                        .85,
                        .04
                    ),
                    new THREE.Vector3(
                        .7,
                        4.15,
                        0
                    ),
                    createMaterial(
                        color,
                        { roughness: .8 }
                    )
                );

            cloth.rotation.z =
                Math.sin(x) * .025;
        }

        createFlag(
            -7.5,
            0x183c68
        );

        createFlag(
            7.5,
            0x641d24
        );

        /* =================================================
           BOOKCASE
           ================================================= */

        const bookcase =
            new THREE.Group();

        bookcase.position.set(
            -8.5,
            0,
            -5.2
        );

        world.add(bookcase);

        addBox(
            bookcase,
            new THREE.Vector3(
                3.5,
                6.4,
                .65
            ),
            new THREE.Vector3(
                0,
                3.2,
                0
            ),
            materials.wood
        );

        for (let y = 1; y <= 5; y++) {

            addBox(
                bookcase,
                new THREE.Vector3(
                    3.1,
                    .1,
                    .72
                ),
                new THREE.Vector3(
                    0,
                    y,
                    .02
                ),
                materials.gold
            );

            for (
                let b = 0;
                b < 7;
                b++
            ) {

                const h =
                    random(
                        .45,
                        .95
                    );

                addBox(
                    bookcase,
                    new THREE.Vector3(
                        random(.22,.38),
                        h,
                        .48
                    ),
                    new THREE.Vector3(
                        -1.25 +
                        b * .4,
                        y + .1 + h / 2,
                        -.05
                    ),
                    createMaterial(
                        [
                            0x263d55,
                            0x5b3022,
                            0x344b38,
                            0x6c5630
                        ][
                            Math.floor(
                                random(0,4)
                            )
                        ],
                        { roughness: .8 }
                    )
                );
            }
        }

        /* =================================================
           PLANTS
           ================================================= */

        function createPlant(x, z) {

            const plant =
                new THREE.Group();

            plant.position.set(
                x,
                0,
                z
            );

            world.add(plant);

            addCylinder(
                plant,
                .65,
                .8,
                1.2,
                new THREE.Vector3(
                    0,
                    .6,
                    0
                ),
                materials.wood,
                24
            );

            for (
                let i = 0;
                i < 9;
                i++
            ) {

                const leaf =
                    addBox(
                        plant,
                        new THREE.Vector3(
                            .16,
                            1.4,
                            .5
                        ),
                        new THREE.Vector3(
                            random(-.45,.45),
                            1.7,
                            random(-.35,.35)
                        ),
                        createMaterial(
                            0x1e4a35,
                            { roughness: .9 }
                        )
                    );

                leaf.rotation.z =
                    random(
                        -.7,
                        .7
                    );
            }
        }

        createPlant(
            8.5,
            -4.7
        );

        /* =================================================
           LIGHTING
           ================================================= */

        const ambient =
            new THREE.AmbientLight(
                0x7d8ea0,
                .45
            );

        scene.add(ambient);

        const keyLight =
            new THREE.DirectionalLight(
                0xffe6b0,
                2.5
            );

        keyLight.position.set(
            -4,
            10,
            6
        );

        keyLight.castShadow = true;

        keyLight.shadow.mapSize.set(
            1024,
            1024
        );

        keyLight.shadow.camera.left = -12;
        keyLight.shadow.camera.right = 12;
        keyLight.shadow.camera.top = 12;
        keyLight.shadow.camera.bottom = -12;

        scene.add(keyLight);

        const goldLight =
            new THREE.PointLight(
                0xd4af37,
                5,
                12
            );

        goldLight.position.set(
            0,
            6,
            -3
        );

        scene.add(goldLight);

        const monitorLight =
            new THREE.PointLight(
                0x326fa8,
                3,
                8
            );

        monitorLight.position.set(
            0,
            4,
            -3.8
        );

        scene.add(monitorLight);

        /* =================================================
           PARTICLES
           ================================================= */

        const particleGeometry =
            new THREE.BufferGeometry();

        const particleCount = 260;

        const positions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            positions[i * 3] =
                random(-11,11);

            positions[i * 3 + 1] =
                random(.5,8);

            positions[i * 3 + 2] =
                random(-5,7);
        }

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const particleMaterial =
            new THREE.PointsMaterial({
                color:
                    CONFIG.colors.goldBright,

                size: .018,

                transparent: true,

                opacity: .28,

                depthWrite: false
            });

        const particles =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );

        scene.add(particles);

        /* =================================================
           CAMERA
           ================================================= */

        const cameraController =
            createCameraController(
                camera,

                new THREE.Vector3(
                    0,
                    4.6,
                    12
                ),

                new THREE.Vector3(
                    0,
                    3.2,
                    -1
                )
            );

        camera.lookAt(
            cameraController.currentLook
        );

        /* =================================================
           ANIMATION OBJECTS
           ================================================= */

        const animationObjects = {
            dossier,

            dossierPaper,

            monitor,

            screenTexture,

            particles,

            goldLight,

            monitorLight,

            cameraController,

            screenContext,

            screenCanvas
        };

        /* =================================================
           NEWS SCREEN
           ================================================= */

        function drawNewsScreen(news = {}) {

            const ctx =
                screenContext;

            const width =
                screenCanvas.width;

            const height =
                screenCanvas.height;

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
                "#09111c"
            );

            gradient.addColorStop(
                1,
                "#020408"
            );

            ctx.fillStyle =
                gradient;

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            /* grid */

            ctx.strokeStyle =
                "rgba(212,175,55,.06)";

            ctx.lineWidth = 2;

            for (
                let x = 0;
                x < width;
                x += 80
            ) {

                ctx.beginPath();

                ctx.moveTo(x,0);
                ctx.lineTo(x,height);

                ctx.stroke();
            }

            for (
                let y = 0;
                y < height;
                y += 80
            ) {

                ctx.beginPath();

                ctx.moveTo(0,y);
                ctx.lineTo(width,y);

                ctx.stroke();
            }

            /* LIVE */

            ctx.fillStyle =
                "#e24b3b";

            ctx.fillRect(
                45,
                38,
                115,
                38
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 20px Arial";

            ctx.fillText(
                "● LIVE",
                65,
                64
            );

            /* headline */

            const title =
                news.title ||
                currentEvent?.title ||
                "خبر فوری";

            ctx.fillStyle =
                "#f3d477";

            ctx.font =
                "bold 42px Arial";

            wrapText(
                ctx,
                title,
                width - 100,
                150,
                width - 110,
                52
            );

            /* description */

            const description =
                news.description ||
                currentEvent?.description ||
                "در انتظار اطلاعات جدید...";

            ctx.fillStyle =
                "#d6dce3";

            ctx.font =
                "24px Arial";

            wrapText(
                ctx,
                description,
                width - 100,
                310,
                width - 110,
                38
            );

            /* ticker */

            ctx.fillStyle =
                "#0e1b2b";

            ctx.fillRect(
                0,
                height - 70,
                width,
                70
            );

            ctx.fillStyle =
                "#d4af37";

            ctx.font =
                "bold 22px Arial";

            ctx.fillText(
                "REPUBLIC NEWS  •  WORLD DESK",
                35,
                height - 28
            );

            animationObjects.screenTexture.needsUpdate =
                true;
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
                String(text)
                    .split(" ");

            let line = "";

            for (
                let i = 0;
                i < words.length;
                i++
            ) {

                const test =
                    line +
                    words[i] +
                    " ";

                const width =
                    ctx.measureText(
                        test
                    ).width;

                if (
                    width > maxWidth &&
                    i > 0
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

            ctx.fillText(
                line,
                x,
                y
            );
        }

        drawNewsScreen();

        /* =================================================
           RESIZE
           ================================================= */

        function resize() {

            const rect =
                container.getBoundingClientRect();

            const width =
                Math.max(
                    rect.width,
                    1
                );

            const height =
                Math.max(
                    rect.height,
                    1
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

        resize();

        const resizeObserver =
            new ResizeObserver(
                resize
            );

        resizeObserver.observe(
            container
        );

        /* =================================================
           ANIMATION LOOP
           ================================================= */

        const clock =
            new THREE.Clock();

        let destroyed = false;

        function animate() {

            if (destroyed) {
                return;
            }

            requestAnimationFrame(
                animate
            );

            const delta =
                Math.min(
                    clock.getDelta(),
                    .05
                );

            const time =
                clock.elapsedTime;

            cameraController.update(
                delta
            );

            /* dossier breathing */

            dossier.position.y =
                2.86 +
                Math.sin(
                    time * 1.4
                ) * .008;

            dossier.rotation.y =
                Math.sin(
                    time * .5
                ) * .008;

            /* monitor pulse */

            monitorLight.intensity =
                2.6 +
                Math.sin(
                    time * 2
                ) * .35;

            /* particles */

            particles.rotation.y =
                time * .012;

            particles.rotation.x =
                Math.sin(
                    time * .15
                ) * .02;

            renderer.render(
                scene,
                camera
            );
        }

        animate();

        return {
            scene,
            camera,
            renderer,
            world,
            monitor,
            dossier,
            drawNewsScreen,
            cameraController,

            destroy() {

                destroyed = true;

                resizeObserver.disconnect();

                renderer.dispose();

                container.innerHTML = "";
            }
        };
    }

    /* =====================================================
       INTRO SCENE
       ===================================================== */

    function createIntro(container) {

        container.innerHTML = "";

        const scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                0x06090e
            );

        scene.fog =
            new THREE.FogExp2(
                0x06090e,
                .025
            );

        const camera =
            new THREE.PerspectiveCamera(
                45,
                1,
                .1,
                200
            );

        camera.position.set(
            0,
            7,
            23
        );

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                powerPreference:
                    "high-performance"
            });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
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

        /* =================================================
           GROUND
           ================================================= */

        const ground =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    80,
                    80
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x090d12,
                    roughness: 1
                })
            );

        ground.rotation.x =
            -Math.PI / 2;

        ground.receiveShadow = true;

        scene.add(ground);

        /* =================================================
           GOVERNMENT BUILDING
           ================================================= */

        const building =
            new THREE.Group();

        scene.add(building);

        const buildingMat =
            createMaterial(
                0x151d27,
                { roughness: .8 }
            );

        const stoneMat =
            createMaterial(
                0x343b43,
                { roughness: .7 }
            );

        const goldMat =
            createMaterial(
                CONFIG.colors.gold,
                {
                    roughness: .25,
                    metalness: .9
                }
            );

        addBox(
            building,
            new THREE.Vector3(
                22,
                10,
                7
            ),
            new THREE.Vector3(
                0,
                5,
                0
            ),
            buildingMat
        );

        /* columns */

        for (
            let x = -9;
            x <= 9;
            x += 3
        ) {

            addBox(
                building,
                new THREE.Vector3(
                    .75,
                    11,
                    1
                ),
                new THREE.Vector3(
                    x,
                    5.5,
                    3.8
                ),
                stoneMat
            );
        }

        /* entrance */

        addBox(
            building,
            new THREE.Vector3(
                5,
                6.5,
                .8
            ),
            new THREE.Vector3(
                0,
                3.25,
                4
            ),
            createMaterial(
                0x05070a,
                { roughness: .2 }
            )
        );

        /* stairs */

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            addBox(
                building,
                new THREE.Vector3(
                    7 - i * .4,
                    .3,
                    1.2
                ),
                new THREE.Vector3(
                    0,
                    .15 + i * .3,
                    5.1 - i * .9
                ),
                stoneMat
            );
        }

        /* roof line */

        addBox(
            building,
            new THREE.Vector3(
                24,
                .35,
                8
            ),
            new THREE.Vector3(
                0,
                10.2,
                0
            ),
            goldMat
        );

        /* =================================================
           FLAGS
           ================================================= */

        function introFlag(
            x,
            color
        ) {

            const group =
                new THREE.Group();

            group.position.set(
                x,
                0,
                4.5
            );

            scene.add(group);

            addCylinder(
                group,
                .08,
                .08,
                9,
                new THREE.Vector3(
                    0,
                    4.5,
                    0
                ),
                goldMat,
                16
            );

            const cloth =
                addBox(
                    group,
                    new THREE.Vector3(
                        2.4,
                        1.35,
                        .06
                    ),
                    new THREE.Vector3(
                        1.1,
                        7.3,
                        0
                    ),
                    createMaterial(
                        color,
                        { roughness: .9 }
                    )
                );

            cloth.userData.waveOffset =
                Math.random() * 10;
        }

        introFlag(
            -12,
            0x183c68
        );

        introFlag(
            12,
            0x641d24
        );

        /* =================================================
           LIGHTS
           ================================================= */

        scene.add(
            new THREE.AmbientLight(
                0x718096,
                .5
            )
        );

        const moon =
            new THREE.DirectionalLight(
                0xaac5ff,
                2.2
            );

        moon.position.set(
            -10,
            18,
            12
        );

        moon.castShadow = true;

        scene.add(
            moon
        );

        const buildingGlow =
            new THREE.PointLight(
                0xd4af37,
                6,
                30
            );

        buildingGlow.position.set(
            0,
            7,
            7
        );

        scene.add(
            buildingGlow
        );

        /* =================================================
           SKY PARTICLES
           ================================================= */

        const particleGeometry =
            new THREE.BufferGeometry();

        const count = 450;

        const positions =
            new Float32Array(
                count * 3
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            positions[i * 3] =
                random(-35,35);

            positions[i * 3 + 1] =
                random(1,25);

            positions[i * 3 + 2] =
                random(-25,15);
        }

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const particleMaterial =
            new THREE.PointsMaterial({
                color:
                    0xd4af37,

                size: .025,

                transparent: true,

                opacity: .3
            });

        const particles =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );

        scene.add(
            particles
        );

        /* =================================================
           CINEMATIC RING
           ================================================= */

        const ring =
            new THREE.Mesh(
                new THREE.RingGeometry(
                    1,
                    1.04,
                    96
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        0xd4af37,

                    transparent: true,

                    opacity: 0,

                    side:
                        THREE.DoubleSide
                })
            );

        ring.rotation.x =
            -Math.PI / 2;

        ring.position.y =
            .08;

        ring.scale.setScalar(
            .1
        );

        scene.add(
            ring
        );

        let elapsed = 0;

        function resize() {

            const rect =
                container.getBoundingClientRect();

            const width =
                Math.max(
                    rect.width,
                    1
                );

            const height =
                Math.max(
                    rect.height,
                    1
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

        resize();

        const observer =
            new ResizeObserver(
                resize
            );

        observer.observe(
            container
        );

        function animate() {

            requestAnimationFrame(
                animate
            );

            const delta =
                Math.min(
                    .05,
                    .016
                );

            elapsed += delta;

            /* camera drift */

            camera.position.x =
                Math.sin(
                    elapsed * .12
                ) * 1.4;

            camera.position.y =
                7 +
                Math.sin(
                    elapsed * .18
                ) * .25;

            camera.lookAt(
                0,
                4.5,
                0
            );

            /* particles */

            particles.rotation.y =
                elapsed * .006;

            /* building light */

            buildingGlow.intensity =
                5.5 +
                Math.sin(
                    elapsed * 1.7
                ) * .5;

            /* cinematic ring */

            if (
                elapsed > 4 &&
                elapsed < 8
            ) {

                const t =
                    (elapsed - 4) / 4;

                ring.scale.setScalar(
                    lerp(.1, 22, t)
                );

                ring.material.opacity =
                    .22 *
                    (1 - t);
            }

            renderer.render(
                scene,
                camera
            );
        }

        animate();

        return {
            scene,
            camera,
            renderer,
            destroy() {
                observer.disconnect();
                renderer.dispose();
                container.innerHTML = "";
            }
        };
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    function init() {

        const officeContainer =
            document.getElementById(
                CONFIG.officeId
            );

        const introContainer =
            document.getElementById(
                CONFIG.introId
            );

        if (
            officeContainer &&
            !office
        ) {
            office =
                createOffice(
                    officeContainer
                );
        }

        if (
            introContainer &&
            !intro
        ) {
            intro =
                createIntro(
                    introContainer
                );
        }

        return true;
    }

    /* =====================================================
       EVENT PRESENTATION
       ===================================================== */

    function showEvent(event) {

        currentEvent =
            event || {};

        if (!office) {
            init();
        }

        if (!office) {
            return;
        }

        office.drawNewsScreen({
            title:
                event?.news?.title ||
                event?.title ||
                "خبر فوری",

            description:
                event?.news?.description ||
                event?.description ||
                "اطلاعات جدید دریافت شد."
        });

        focusMonitor();

        setTimeout(() => {

            if (
                window.RepublicGame &&
                typeof window.RepublicGame
                    .animateDecisionCards ===
                    "function"
            ) {

                window.RepublicGame
                    .animateDecisionCards();
            }

        }, 850);
    }

    /* =====================================================
       MONITOR FOCUS
       ===================================================== */

    function focusMonitor() {

        if (!office) {
            return;
        }

        office.cameraController.moveTo(
            new THREE.Vector3(
                0,
                5.0,
                8.3
            ),

            new THREE.Vector3(
                0,
                4.0,
                -4
            ),

            1100
        );
    }

    /* =====================================================
       DOSSIER FOCUS
       ===================================================== */

    function focusDossier() {

        if (!office) {
            return;
        }

        office.cameraController.moveTo(
            new THREE.Vector3(
                0,
                4.1,
                7.2
            ),

            new THREE.Vector3(
                0,
                2.8,
                -1.3
            ),

            1000
        );
    }

    /* =====================================================
       DECISION SELECTION
       ===================================================== */

    function selectDecision(index) {

        if (!office) {
            return;
        }

        const offsets = [
            -2.5,
            0,
            2.5
        ];

        const x =
            offsets[index] || 0;

        office.cameraController.moveTo(
            new THREE.Vector3(
                x * .35,
                3.8,
                6.4
            ),

            new THREE.Vector3(
                x,
                2.8,
                -1
            ),

            700
        );

        const dossier =
            office.dossier;

        if (dossier) {

            dossier.scale.set(
                1.04,
                1.04,
                1.04
            );

            setTimeout(() => {

                dossier.scale.set(
                    1,
                    1,
                    1
                );

            }, 250);
        }
    }

    /* =====================================================
       RESET CAMERA
       ===================================================== */

    function resetCamera() {

        if (!office) {
            return;
        }

        office.cameraController.moveTo(
            new THREE.Vector3(
                0,
                4.6,
                12
            ),

            new THREE.Vector3(
                0,
                3.2,
                -1
            ),

            1000
        );
    }

    /* =====================================================
       NEWS
       ===================================================== */

    function showNews(news) {

        if (!office) {
            init();
        }

        if (!office) {
            return;
        }

        currentNews =
            news || {};

        office.drawNewsScreen(
            currentNews
        );

        focusMonitor();
    }

    /* =====================================================
       MUSIC
       ===================================================== */

    let audioContext = null;
    let masterGain = null;
    let oscillatorA = null;
    let oscillatorB = null;

    function startMusic() {

        if (audioContext) {
            return;
        }

        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

            masterGain =
                audioContext.createGain();

            masterGain.gain.value =
                .025;

            masterGain.connect(
                audioContext.destination
            );

            oscillatorA =
                audioContext.createOscillator();

            oscillatorB =
                audioContext.createOscillator();

            oscillatorA.type =
                "sine";

            oscillatorB.type =
                "triangle";

            oscillatorA.frequency.value =
                55;

            oscillatorB.frequency.value =
                82.4;

            oscillatorA.connect(
                masterGain
            );

            oscillatorB.connect(
                masterGain
            );

            oscillatorA.start();
            oscillatorB.start();

        } catch (error) {

            console.warn(
                "Ambient audio unavailable.",
                error
            );
        }
    }

    function stopMusic() {

        if (!audioContext) {
            return;
        }

        try {

            if (masterGain) {

                masterGain.gain.exponentialRampToValueAtTime(
                    .0001,
                    audioContext.currentTime + .35
                );
            }

            setTimeout(() => {

                try {

                    if (oscillatorA)
                        oscillatorA.stop();

                    if (oscillatorB)
                        oscillatorB.stop();

                    audioContext.close();

                } catch (_) {}

                audioContext = null;

            }, 450);

        } catch (_) {}
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    window.addEventListener(
        "republic:music-toggle",
        event => {

            if (
                event.detail?.enabled
            ) {
                startMusic();
            } else {
                stopMusic();
            }
        }
    );

    /* =====================================================
       AUTO INIT
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.Office3D = {

        version:
            CONFIG.version,

        init,

        showEvent,

        showNews,

        focusMonitor,

        focusDossier,

        resetCamera,

        selectDecision,

        drawNewsScreen:
            news =>
                office &&
                office.drawNewsScreen(
                    news
                ),

        getScene:
            () =>
                office?.scene ||
                null,

        getCamera:
            () =>
                office?.camera ||
                null,

        getRenderer:
            () =>
                office?.renderer ||
                null,

        startMusic,

        stopMusic
    };

})();