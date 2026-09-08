/* =========================================================
   REPUBLIC OF ABSURDITY
   OFFICE 3D ENGINE v3.0
   Three.js Presidential Office
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       STATE
    ===================================================== */

    let scene = null;
    let camera = null;
    let renderer = null;

    let officeRoot = null;
    let desk = null;

    let animationFrame = null;

    let clock = null;

    let initialized = false;

    let targetCameraX = 0;
    let targetCameraY = 1.62;
    let targetCameraZ = 5.7;

    let cameraX = 0;
    let cameraY = 1.62;
    let cameraZ = 5.7;

    let mouseX = 0;
    let mouseY = 0;

    let targetMouseX = 0;
    let targetMouseY = 0;

    let resizeObserver = null;

    const THREE = window.THREE;


    /* =====================================================
       SAFETY
    ===================================================== */

    if (!THREE) {

        console.error(
            "Three.js was not loaded."
        );

        return;
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function clamp(value, min, max) {

        return Math.max(
            min,
            Math.min(max, value)
        );
    }


    function lerp(a, b, t) {

        return a + (b - a) * t;
    }


    function smoothStep(current, target, speed) {

        return lerp(
            current,
            target,
            1 - Math.pow(
                0.001,
                speed
            )
        );
    }


    function createMaterial(
        color,
        roughness = 0.7,
        metalness = 0
    ) {

        return new THREE.MeshStandardMaterial({

            color,

            roughness,

            metalness,

            envMapIntensity: 1.2

        });
    }


    function box(
        width,
        height,
        depth,
        material,
        x = 0,
        y = 0,
        z = 0
    ) {

        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                material
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


    function cylinder(
        radius,
        height,
        material,
        x = 0,
        y = 0,
        z = 0,
        segments = 32
    ) {

        const geometry =
            new THREE.CylinderGeometry(
                radius,
                radius,
                height,
                segments
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                material
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


    function sphere(
        radius,
        material,
        x = 0,
        y = 0,
        z = 0
    ) {

        const geometry =
            new THREE.SphereGeometry(
                radius,
                32,
                20
            );

        const mesh =
            new THREE.Mesh(
                geometry,
                material
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
       ROOM
    ===================================================== */

    function createRoom() {

        officeRoot =
            new THREE.Group();

        scene.add(
            officeRoot
        );


        /* -------------------------------------------------
           MATERIALS
        ------------------------------------------------- */

        const floorMaterial =
            createMaterial(
                0x211d17,
                0.82,
                0
            );

        const wallMaterial =
            createMaterial(
                0x272a2d,
                0.88,
                0
            );

        const woodMaterial =
            createMaterial(
                0x382a1c,
                0.68,
                0
            );

        const darkWoodMaterial =
            createMaterial(
                0x17130f,
                0.58,
                0
            );

        const goldMaterial =
            createMaterial(
                0xb48a43,
                0.32,
                0.72
            );

        const blackMaterial =
            createMaterial(
                0x080a0d,
                0.45,
                0.35
            );

        const glassMaterial =
            new THREE.MeshPhysicalMaterial({

                color: 0x243746,

                roughness: 0.08,

                metalness: 0.05,

                transmission: 0.15,

                transparent: true,

                opacity: 0.36

            });


        /* -------------------------------------------------
           FLOOR
        ------------------------------------------------- */

        const floor =
            box(
                12,
                0.25,
                12,
                floorMaterial,
                0,
                -0.13,
                0
            );

        officeRoot.add(
            floor
        );


        /* -------------------------------------------------
           BACK WALL
        ------------------------------------------------- */

        const backWall =
            box(
                12,
                5,
                0.25,
                wallMaterial,
                0,
                2.5,
                -5.7
            );

        officeRoot.add(
            backWall
        );


        /* -------------------------------------------------
           LEFT WALL
        ------------------------------------------------- */

        const leftWall =
            box(
                0.25,
                5,
                12,
                wallMaterial,
                -5.85,
                2.5,
                0
            );

        officeRoot.add(
            leftWall
        );


        /* -------------------------------------------------
           RIGHT WALL
        ------------------------------------------------- */

        const rightWall =
            box(
                0.25,
                5,
                12,
                wallMaterial,
                5.85,
                2.5,
                0
            );

        officeRoot.add(
            rightWall
        );


        /* -------------------------------------------------
           CEILING
        ------------------------------------------------- */

        const ceiling =
            box(
                12,
                0.20,
                12,
                darkWoodMaterial,
                0,
                5.05,
                0
            );

        officeRoot.add(
            ceiling
        );


        /* -------------------------------------------------
           FLOOR STRIPS
        ------------------------------------------------- */

        for (
            let i = -5;
            i <= 5;
            i++
        ) {

            const strip =
                box(
                    0.035,
                    0.01,
                    11,
                    goldMaterial,
                    i,
                    0.005,
                    0
                );

            officeRoot.add(
                strip
            );
        }


        /* -------------------------------------------------
           WALL DECORATION
        ------------------------------------------------- */

        for (
            let i = -4;
            i <= 4;
            i += 2
        ) {

            const panel =
                box(
                    0.04,
                    3.5,
                    0.05,
                    goldMaterial,
                    i,
                    2.45,
                    -5.54
                );

            officeRoot.add(
                panel
            );
        }


        /* -------------------------------------------------
           WINDOW
        ------------------------------------------------- */

        createWindow(
            2.7,
            2.25,
            0,
            2.65,
            -5.48,
            glassMaterial,
            goldMaterial
        );


        /* -------------------------------------------------
           DESK
        ------------------------------------------------- */

        desk =
            createDesk(
                woodMaterial,
                darkWoodMaterial,
                goldMaterial
            );

        officeRoot.add(
            desk
        );


        /* -------------------------------------------------
           CHAIR
        ------------------------------------------------- */

        createChair(
            blackMaterial,
            goldMaterial
        );


        /* -------------------------------------------------
           BOOKSHELF
        ------------------------------------------------- */

        createBookshelf(
            woodMaterial,
            darkWoodMaterial
        );


        /* -------------------------------------------------
           FLAG
        ------------------------------------------------- */

        createFlag(
            goldMaterial
        );


        /* -------------------------------------------------
           DESK LAMP
        ------------------------------------------------- */

        createDeskLamp(
            goldMaterial,
            blackMaterial
        );


        /* -------------------------------------------------
           MONITOR
        ------------------------------------------------- */

        createMonitor(
            blackMaterial,
            goldMaterial
        );


        /* -------------------------------------------------
           TELEPHONE
        ------------------------------------------------- */

        createTelephone(
            blackMaterial
        );


        /* -------------------------------------------------
           PLANT
        ------------------------------------------------- */

        createPlant(
            woodMaterial
        );


        /* -------------------------------------------------
           PAINTING
        ------------------------------------------------- */

        createPainting(
            goldMaterial
        );


        /* -------------------------------------------------
           CLOCK
        ------------------------------------------------- */

        createClock(
            goldMaterial,
            blackMaterial
        );

    }


    /* =====================================================
       WINDOW
    ===================================================== */

    function createWindow(
        width,
        height,
        x,
        y,
        z,
        glassMaterial,
        goldMaterial
    ) {

        const windowGroup =
            new THREE.Group();

        windowGroup.position.set(
            x,
            0,
            z
        );


        const glass =
            box(
                width,
                height,
                0.04,
                glassMaterial,
                0,
                y,
                0
            );

        windowGroup.add(
            glass
        );


        const frameThickness = 0.08;


        const top =
            box(
                width + .18,
                frameThickness,
                .12,
                goldMaterial,
                0,
                y + height / 2,
                .01
            );

        const bottom =
            box(
                width + .18,
                frameThickness,
                .12,
                goldMaterial,
                0,
                y - height / 2,
                .01
            );

        const left =
            box(
                frameThickness,
                height,
                .12,
                goldMaterial,
                -width / 2,
                y,
                .01
            );

        const right =
            box(
                frameThickness,
                height,
                .12,
                goldMaterial,
                width / 2,
                y,
                .01
            );


        windowGroup.add(
            top,
            bottom,
            left,
            right
        );


        const vertical =
            box(
                0.045,
                height,
                0.08,
                goldMaterial,
                0,
                y,
                .02
            );

        windowGroup.add(
            vertical
        );


        const horizontal =
            box(
                width,
                0.045,
                0.08,
                goldMaterial,
                0,
                y,
                .02
            );

        windowGroup.add(
            horizontal
        );


        /* Fake city outside */

        const city =
            new THREE.Group();

        city.position.z =
            -0.15;


        for (
            let i = -8;
            i <= 8;
            i++
        ) {

            const heightBuilding =
                0.4 +
                Math.random() * 2.2;

            const building =
                box(
                    0.18 +
                    Math.random() * .25,
                    heightBuilding,
                    .12,
                    createMaterial(
                        0x151c24,
                        .95,
                        0
                    ),
                    i * .32,
                    heightBuilding / 2,
                    -0.12
                );

            city.add(
                building
            );
        }

        windowGroup.add(
            city
        );


        officeRoot.add(
            windowGroup
        );

    }


    /* =====================================================
       DESK
    ===================================================== */

    function createDesk(
        woodMaterial,
        darkWoodMaterial,
        goldMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            0,
            0,
            0.7
        );


        /* tabletop */

        const top =
            box(
                4.8,
                0.25,
                2.0,
                woodMaterial,
                0,
                1.65,
                0
            );

        group.add(
            top
        );


        /* front panel */

        const front =
            box(
                4.5,
                1.05,
                0.16,
                darkWoodMaterial,
                0,
                1.05,
                .82
            );

        group.add(
            front
        );


        /* legs */

        const legPositions = [
            [-2.15, .8, -.7],
            [2.15, .8, -.7],
            [-2.15, .8, .7],
            [2.15, .8, .7]
        ];


        legPositions.forEach(
            position => {

                const leg =
                    box(
                        .22,
                        1.6,
                        .22,
                        darkWoodMaterial,
                        position[0],
                        position[1],
                        position[2]
                    );

                group.add(
                    leg
                );

            }
        );


        /* gold edge */

        const edge =
            box(
                4.82,
                .045,
                2.02,
                goldMaterial,
                0,
                1.79,
                0
            );

        group.add(
            edge
        );


        /* dossiers */

        createDossiers(
            group
        );


        return group;

    }


    /* =====================================================
       DOSSIERS
    ===================================================== */

    function createDossiers(
        parent
    ) {

        const paperMaterial =
            createMaterial(
                0xd7d0bf,
                .92,
                0
            );

        const redMaterial =
            createMaterial(
                0x7c272d,
                .8,
                0
            );

        const folderMaterial =
            createMaterial(
                0x46382a,
                .9,
                0
            );


        /* Main dossier */

        const dossier =
            box(
                1.35,
                .035,
                .92,
                paperMaterial,
                -.65,
                1.82,
                .05
            );

        dossier.rotation.y =
            -0.08;

        parent.add(
            dossier
        );


        /* second dossier */

        const dossier2 =
            box(
                1.15,
                .035,
                .78,
                folderMaterial,
                .65,
                1.84,
                -.08
            );

        dossier2.rotation.y =
            .10;

        parent.add(
            dossier2
        );


        /* red confidential strip */

        const strip =
            box(
                .95,
                .045,
                .06,
                redMaterial,
                -.65,
                1.855,
                -.05
            );

        strip.rotation.y =
            -.08;

        parent.add(
            strip
        );

    }


    /* =====================================================
       CHAIR
    ===================================================== */

    function createChair(
        blackMaterial,
        goldMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            0,
            0,
            3.0
        );


        const seat =
            box(
                1.45,
                .22,
                1.35,
                blackMaterial,
                0,
                1.0,
                0
            );

        group.add(
            seat
        );


        const back =
            box(
                1.45,
                1.8,
                .20,
                blackMaterial,
                0,
                1.85,
                .55
            );

        group.add(
            back
        );


        const column =
            cylinder(
                .10,
                .9,
                goldMaterial,
                0,
                .52,
                0,
                24
            );

        group.add(
            column
        );


        const base =
            cylinder(
                .55,
                .08,
                blackMaterial,
                0,
                .08,
                0,
                32
            );

        group.add(
            base
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       BOOKSHELF
    ===================================================== */

    function createBookshelf(
        woodMaterial,
        darkWoodMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            -4.7,
            0,
            -4.8
        );


        const body =
            box(
                1.4,
                3.7,
                .45,
                darkWoodMaterial,
                0,
                1.85,
                0
            );

        group.add(
            body
        );


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const shelf =
                box(
                    1.35,
                    .08,
                    .48,
                    woodMaterial,
                    0,
                    .5 + i * .9,
                    .02
                );

            group.add(
                shelf
            );

        }


        const bookColors = [
            0x8b3a35,
            0x344f6b,
            0x79633c,
            0x4e6652,
            0x6d485d,
            0x4a4a4a
        ];


        for (
            let row = 0;
            row < 4;
            row++
        ) {

            for (
                let i = 0;
                i < 5;
                i++
            ) {

                const book =
                    box(
                        .18,
                        .52 +
                        Math.random() * .18,
                        .28,
                        createMaterial(
                            bookColors[
                                Math.floor(
                                    Math.random() *
                                    bookColors.length
                                )
                            ],
                            .9,
                            0
                        ),
                        -.5 + i * .22,
                        .76 + row * .9,
                        -.02
                    );

                group.add(
                    book
                );

            }

        }


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       FLAG
    ===================================================== */

    function createFlag(
        goldMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            4.2,
            0,
            -4.8
        );


        const pole =
            cylinder(
                .035,
                3.2,
                goldMaterial,
                0,
                1.6,
                0,
                20
            );

        group.add(
            pole
        );


        const ball =
            sphere(
                .09,
                goldMaterial,
                0,
                3.25,
                0
            );

        group.add(
            ball
        );


        const flagMaterial =
            createMaterial(
                0x9a252c,
                .85,
                0
            );


        const flag =
            box(
                1.25,
                .72,
                .035,
                flagMaterial,
                .6,
                2.7,
                0
            );

        group.add(
            flag
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       DESK LAMP
    ===================================================== */

    function createDeskLamp(
        goldMaterial,
        blackMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            -1.65,
            1.8,
            .2
        );


        const base =
            cylinder(
                .22,
                .06,
                blackMaterial,
                0,
                0,
                0
            );

        group.add(
            base
        );


        const stem =
            cylinder(
                .035,
                .48,
                goldMaterial,
                0,
                .24,
                0
            );

        group.add(
            stem
        );


        const shade =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    .24,
                    .20,
                    24,
                    1,
                    true
                ),
                blackMaterial
            );

        shade.position.y =
            .51;

        group.add(
            shade
        );


        const light =
            new THREE.PointLight(
                0xffd99a,
                1.5,
                4
            );

        light.position.set(
            0,
            .35,
            0
        );

        light.castShadow = true;

        group.add(
            light
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       MONITOR
    ===================================================== */

    function createMonitor(
        blackMaterial,
        goldMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            .75,
            1.82,
            -.25
        );


        const screenMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x08131b,

                roughness: .18,

                metalness: .15,

                emissive: 0x07131c,

                emissiveIntensity: .7

            });


        const monitor =
            box(
                1.55,
                .95,
                .10,
                blackMaterial,
                0,
                .55,
                0
            );

        group.add(
            monitor
        );


        const screen =
            box(
                1.38,
                .78,
                .025,
                screenMaterial,
                0,
                .55,
                -.065
            );

        group.add(
            screen
        );


        const stand =
            box(
                .10,
                .42,
                .10,
                blackMaterial,
                0,
                .10,
                0
            );

        group.add(
            stand
        );


        const base =
            box(
                .48,
                .05,
                .32,
                blackMaterial,
                0,
                -.10,
                0
            );

        group.add(
            base
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       TELEPHONE
    ===================================================== */

    function createTelephone(
        blackMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            -1.0,
            1.83,
            .15
        );


        const body =
            box(
                .55,
                .12,
                .38,
                blackMaterial
            );

        group.add(
            body
        );


        const handset =
            box(
                .58,
                .10,
                .12,
                blackMaterial,
                0,
                .12,
                0
            );

        handset.rotation.z =
            -.12;

        group.add(
            handset
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       PLANT
    ===================================================== */

    function createPlant(
        woodMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            3.7,
            0,
            -2.8
        );


        const potMaterial =
            createMaterial(
                0x5a4634,
                .92,
                0
            );


        const pot =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    .34,
                    .26,
                    .45,
                    24
                ),
                potMaterial
            );

        pot.position.y =
            .23;

        pot.castShadow = true;

        group.add(
            pot
        );


        const stemMaterial =
            createMaterial(
                0x3d5b3a,
                .9,
                0
            );


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const leaf =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        .20,
                        14,
                        10
                    ),
                    stemMaterial
                );

            leaf.scale.set(
                1.4,
                .45,
                .8
            );

            leaf.position.set(
                Math.cos(i) * .22,
                .65 +
                (i % 3) * .20,
                Math.sin(i) * .22
            );

            leaf.rotation.z =
                (Math.random() - .5);

            leaf.castShadow = true;

            group.add(
                leaf
            );

        }


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       PAINTING
    ===================================================== */

    function createPainting(
        goldMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            2.5,
            3.1,
            -5.48
        );


        const frame =
            box(
                1.8,
                1.15,
                .08,
                goldMaterial
            );

        group.add(
            frame
        );


        const artMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x18202a,

                roughness: .85,

                metalness: 0

            });


        const art =
            box(
                1.58,
                .94,
                .035,
                artMaterial,
                0,
                0,
                -.06
            );

        group.add(
            art
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       CLOCK
    ===================================================== */

    function createClock(
        goldMaterial,
        blackMaterial
    ) {

        const group =
            new THREE.Group();

        group.position.set(
            -2.2,
            3.15,
            -5.5
        );


        const clockFace =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    .42,
                    .42,
                    .07,
                    40
                ),
                blackMaterial
            );

        clockFace.rotation.x =
            Math.PI / 2;

        group.add(
            clockFace
        );


        const ring =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    .42,
                    .035,
                    10,
                    40
                ),
                goldMaterial
            );

        ring.rotation.x =
            Math.PI / 2;

        group.add(
            ring
        );


        const handMaterial =
            createMaterial(
                0xd9d9d9,
                .45,
                .2
            );


        const hand =
            box(
                .025,
                .28,
                .025,
                handMaterial,
                0,
                .13,
                -.06
            );

        group.add(
            hand
        );


        officeRoot.add(
            group
        );

    }


    /* =====================================================
       LIGHTING
    ===================================================== */

    function createLighting() {


        /* Ambient */

        const ambient =
            new THREE.HemisphereLight(
                0xbfd2e8,
                0x16110d,
                1.3
            );

        scene.add(
            ambient
        );


        /* Main light */

        const main =
            new THREE.DirectionalLight(
                0xffe7bd,
                3.0
            );

        main.position.set(
            -2,
            5,
            3
        );

        main.castShadow = true;

        main.shadow.mapSize.width =
            2048;

        main.shadow.mapSize.height =
            2048;

        main.shadow.camera.near =
            .1;

        main.shadow.camera.far =
            25;

        main.shadow.camera.left =
            -8;

        main.shadow.camera.right =
            8;

        main.shadow.camera.top =
            8;

        main.shadow.camera.bottom =
            -8;

        scene.add(
            main
        );


        /* Window light */

        const windowLight =
            new THREE.DirectionalLight(
                0x8fb8ff,
                1.5
            );

        windowLight.position.set(
            0,
            3,
            -2
        );

        scene.add(
            windowLight
        );


        /* Desk fill */

        const deskLight =
            new THREE.PointLight(
                0xffc77a,
                .65,
                7
            );

        deskLight.position.set(
            0,
            3.4,
            1
        );

        scene.add(
            deskLight
        );

    }


    /* =====================================================
       CAMERA
    ===================================================== */

    function setupCamera() {

        camera =
            new THREE.PerspectiveCamera(
                62,
                1,
                .1,
                100
            );

        camera.position.set(
            cameraX,
            cameraY,
            cameraZ
        );


        camera.rotation.order =
            "YXZ";


        updateCameraAspect();

    }


    function updateCameraAspect() {

        if (
            !camera ||
            !renderer
        ) {
            return;
        }


        const container =
            document.getElementById(
                "office3d"
            );

        if (!container) {
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


        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.7
            )
        );

        renderer.setSize(
            width,
            height,
            false
        );

    }


    /* =====================================================
       RENDERER
    ===================================================== */

    function setupRenderer(
        container
    ) {

        renderer =
            new THREE.WebGLRenderer({

                antialias: true,

                alpha: false,

                powerPreference:
                    "high-performance"

            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.7
            )
        );


        renderer.setSize(
            container.clientWidth,
            container.clientHeight,
            false
        );


        renderer.shadowMap.enabled =
            true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;


        renderer.toneMappingExposure =
            1.08;


        renderer.domElement.style.width =
            "100%";

        renderer.domElement.style.height =
            "100%";

        renderer.domElement.style.display =
            "block";


        container.appendChild(
            renderer.domElement
        );

    }


    /* =====================================================
       SCENE
    ===================================================== */

    function setupScene() {

        scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(
                0x080b10
            );


        scene.fog =
            new THREE.Fog(
                0x080b10,
                9,
                28
            );

    }


    /* =====================================================
       INPUT
    ===================================================== */

    function setupInput() {

        const container =
            document.getElementById(
                "office3d"
            );

        if (!container) {
            return;
        }


        container.addEventListener(
            "pointermove",
            event => {

                const rect =
                    container.getBoundingClientRect();

                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;

                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                targetMouseX =
                    (x - .5) * 2;

                targetMouseY =
                    (y - .5) * 2;

            },
            {
                passive: true
            }
        );


        container.addEventListener(
            "pointerleave",
            () => {

                targetMouseX = 0;
                targetMouseY = 0;

            },
            {
                passive: true
            }
        );


        let touchStartX = 0;
        let touchStartY = 0;


        container.addEventListener(
            "touchstart",
            event => {

                if (
                    !event.touches ||
                    !event.touches[0]
                ) {
                    return;
                }

                touchStartX =
                    event.touches[0].clientX;

                touchStartY =
                    event.touches[0].clientY;

            },
            {
                passive: true
            }
        );


        container.addEventListener(
            "touchmove",
            event => {

                if (
                    !event.touches ||
                    !event.touches[0]
                ) {
                    return;
                }


                const touch =
                    event.touches[0];


                const dx =
                    touch.clientX -
                    touchStartX;

                const dy =
                    touch.clientY -
                    touchStartY;


                targetCameraX =
                    clamp(
                        dx * .003,
                        -.45,
                        .45
                    );

                targetCameraY =
                    clamp(
                        1.62 -
                        dy * .002,
                        1.35,
                        1.9
                    );

            },
            {
                passive: true
            }
        );


        container.addEventListener(
            "touchend",
            () => {

                targetCameraX = 0;

                targetCameraY = 1.62;

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       CAMERA MOTION
    ===================================================== */

    function updateCamera(
        delta
    ) {

        mouseX =
            smoothStep(
                mouseX,
                targetMouseX,
                Math.min(
                    1,
                    delta * 6
                )
            );

        mouseY =
            smoothStep(
                mouseY,
                targetMouseY,
                Math.min(
                    1,
                    delta * 6
                )
            );


        cameraX =
            smoothStep(
                cameraX,
                targetCameraX,
                Math.min(
                    1,
                    delta * 3
                )
            );


        cameraY =
            smoothStep(
                cameraY,
                targetCameraY,
                Math.min(
                    1,
                    delta * 3
                )
            );


        cameraZ =
            smoothStep(
                cameraZ,
                targetCameraZ,
                Math.min(
                    1,
                    delta * 3
                )
            );


        camera.position.x =
            cameraX +
            mouseX * .13;

        camera.position.y =
            cameraY -
            mouseY * .08;

        camera.position.z =
            cameraZ;


        camera.rotation.y =
            -mouseX * .055;

        camera.rotation.x =
            mouseY * .035;

    }


    /* =====================================================
       ANIMATION
    ===================================================== */

    function animate() {

        animationFrame =
            requestAnimationFrame(
                animate
            );


        const delta =
            Math.min(
                clock.getDelta(),
                .05
            );


        updateCamera(
            delta
        );


        /* Floating light movement */

        const time =
            performance.now() *
            0.001;


        if (desk) {

            desk.position.y =
                Math.sin(
                    time * .5
                ) * .002;

        }


        renderer.render(
            scene,
            camera
        );

    }


    /* =====================================================
       RESIZE
    ===================================================== */

    function setupResize() {

        window.addEventListener(
            "resize",
            updateCameraAspect,
            {
                passive: true
            }
        );


        const container =
            document.getElementById(
                "office3d"
            );


        if (
            window.ResizeObserver &&
            container
        ) {

            resizeObserver =
                new ResizeObserver(
                    () => {

                        updateCameraAspect();

                    }
                );


            resizeObserver.observe(
                container
            );

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return true;
        }


        const container =
            document.getElementById(
                "office3d"
            );


        if (!container) {

            console.warn(
                "office3d container not found."
            );

            return false;
        }


        try {

            setupScene();

            setupCamera();

            setupRenderer(
                container
            );

            createLighting();

            createRoom();

            setupInput();

            setupResize();


            clock =
                new THREE.Clock();


            initialized = true;


            animate();


            console.log(
                "%cRepublic Office 3D v3.0 ready",
                "color:#d9b66f;font-weight:bold;"
            );


            return true;

        } catch (error) {

            console.error(
                "Office 3D initialization failed:",
                error
            );

            return false;
        }

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.Office3D = {

        init: initialize,


        isReady: () => {
            return initialized;
        },


        resetCamera: () => {

            targetCameraX = 0;
            targetCameraY = 1.62;
            targetCameraZ = 5.7;

        },


        lookAtDesk: () => {

            targetCameraX = 0;
            targetCameraY = 1.58;
            targetCameraZ = 4.8;

        },


        lookAtWindow: () => {

            targetCameraX = -.9;
            targetCameraY = 1.75;
            targetCameraZ = 5.4;

        },


        lookAtFlag: () => {

            targetCameraX = 1.2;
            targetCameraY = 1.75;
            targetCameraZ = 5.3;

        },


        dispose: () => {

            if (animationFrame) {

                cancelAnimationFrame(
                    animationFrame
                );

            }


            if (resizeObserver) {

                resizeObserver.disconnect();

            }


            if (renderer) {

                renderer.dispose();

            }


            initialized = false;

        }

    };


    /* =====================================================
       AUTO INIT
    ===================================================== */

    function waitForGameScreen() {

        const gameScreen =
            document.getElementById(
                "gameScreen"
            );


        if (!gameScreen) {
            return;
        }


        const observer =
            new MutationObserver(
                () => {

                    const visible =
                        !gameScreen.classList
                            .contains("hidden");


                    if (visible) {

                        if (
                            !initialized
                        ) {

                            initialize();

                        }

                    }

                }
            );


        observer.observe(
            gameScreen,
            {
                attributes: true,
                attributeFilter: [
                    "class"
                ]
            }
        );


        if (
            !gameScreen.classList
                .contains("hidden")
        ) {

            initialize();

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            waitForGameScreen
        );

    } else {

        waitForGameScreen();

    }

})();