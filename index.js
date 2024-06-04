"use strict";

var canvas, renderer, scene, camera;
var controls;
var animating = false;
var frameNumber = 0;
var tempObject;

let objects = {
    structure: [],
    pivots: [],
    horses: [],
}

/**
 *  The render function draws the scene.
 */
function render() {
    renderer.render(scene, camera);
}


/**
 * This function is called by the init() method to create the world.
 */
function createWorld() {
    renderer.setClearColor("black"); // Background color for scene.
    scene = new THREE.Scene();

    // ------------------- Make a camera with viewpoint light ----------------------

    camera = new THREE.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 100);
    camera.position.z = 30;
    var light = new THREE.DirectionalLight();
    light.position.set(0, 0, 1);
    camera.add(light);
    scene.add(camera);

    //------------------- Create the scene's visible objects ----------------------
    let floor = new THREE.Mesh(
        new THREE.CylinderGeometry(12, 12, 0.6, 13, 1),
        new THREE.MeshMatcapMaterial({
            color: 0x441c84,
            specular: 0x222222,
            shininess: 8,
            shading: THREE.FlatShading
        }),
    );
    floor.rotation.y = Math.PI / 9;
    scene.add(floor);

    let roof = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 12, 3, 13, 1),
        new THREE.MeshPhongMaterial({
            color: 0x441c84,
            specular: 0x222222,
            shininess: 8,
            shading: THREE.FlatShading
        })
    );
    roof.position.y = 9.1;
    roof.rotation.y = Math.PI / 9;
    scene.add(roof);

    let roof2 = new THREE.Mesh(
        new THREE.CylinderGeometry(12, 12, 0.3, 13, 1),
        new THREE.MeshPhongMaterial({
            color: 0x441c84,
            specular: 0x222222,
            shininess: 8,
            shading: THREE.FlatShading
        })
    );
    roof2.position.y = 7.5;
    roof2.rotation.y = Math.PI / 9;
    scene.add(roof2);

    let earth = new THREE.Mesh(
        new THREE.SphereGeometry(3.7, 32, 32),
        new THREE.MeshBasicMaterial({map: new THREE.MaterialLoader().load('./resources/earth.jpg')})
    );
    earth.position.y = 3.8;
    scene.add(earth);

    let poles = [];
    let pivots = [];
    for (let i = 0; i < 13; i++) {
        let pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 7.5, 13, 1),
            new THREE.MeshPhongMaterial({
                color: 0x7c5426,
                specular: 0x222222,
                shininess: 8,
                shading: THREE.FlatShading
            })
        );

        let angle = i * Math.PI / 6.5;
        let radius = 11.4;

        let posX = Math.cos(angle) * radius;
        let posY = 3.9
        let posZ = Math.sin(angle) * radius;

        pole.position.set(posX, posY, posZ);
        poles.push(pole);

        let pivot = new THREE.Group();
        pivot.add(pole);
        scene.add(pivot);
        pivots.push(pivot);
    }

    let horses = [];
    const loader = new THREE.GLTFLoader();
    for (let i = 0; i < 13; i++) {
        loader.load( 'https://threejs.org/examples/models/gltf/Horse.glb',  (gltf)  =>{
            gltf.scene.scale.multiplyScalar( 0.02 );
            gltf.scene.position.x = poles[i].position.x;
            gltf.scene.position.z = poles[i].position.z;
            gltf.scene.position.y = 0.5;
            gltf.scene.rotation.y = -3.25 - (Math.PI * i / 6.5);

            scene.add(gltf.scene);
            horses.push(gltf.scene);
        });
    }

    objects = {
        pivots,
        horses,
        structure: [floor, roof, roof2, earth]
    }
}


/**
 *  This function is called once for each frame of the animation, before
 *  the render() function is called for that frame.  It updates any
 *  animated properties.  The value of the global variable frameNumber
 *  is incrementd 1 before this function is called.
 */

let angle = 0;
function updateForFrame() {
    const { horses, ...rest } = objects;

    // for (const element of horses) {
    //     const rotationX = new THREE.Matrix4().makeRotationX(angle);
    //     const rotationY = new THREE.Matrix4().makeRotationY(0);
    //     const rotationZ = new THREE.Matrix4().makeRotationZ(angle);
    //     const rotationMatrix = rotationX.multiply(rotationY).multiply(rotationZ);
    //     element.position.set(element.position.clone().applyMatrix4(rotationMatrix));
    // }

    angle += 0.1;

    for (const i in rest) {
        for (const element of objects[i]) {
            element.rotation.y += 0.01;
        }
    }
}


/* ---------------------------- MOUSE AND ANIMATION SUPPORT ------------------

/**
 *  This page uses THREE.OrbitControls to let the user use the mouse to rotate
 *  the view.  OrbitControls are designed to be used during an animation, where
 *  the rotation is updated as part of preparing for the next frame.  The scene
 *  is not automatically updated just because the user drags the mouse.  To get
 *  the rotation to work without animation, I add another mouse listener to the
 *  canvas, just to call the render() function when the user drags the mouse.
 *  The same thing holds for touch events -- I call render for any mouse move
 *  event with one touch.
 */
function installOrbitControls() {
    controls = new THREE.OrbitControls(camera, canvas);
    controls.noPan = true;
    controls.noZoom = true;
    controls.staticMoving = true;

    function move() {
        controls.update();
        if (!animating) {
            render();
        }
    }

    function down() {
        document.addEventListener("mousemove", move, false);
    }

    function up() {
        document.removeEventListener("mousemove", move, false);
    }

    function touch(event) {
        if (event.touches.length == 1) {
            move();
        }
    }

    canvas.addEventListener("mousedown", down, false);
    canvas.addEventListener("touchmove", touch, false);
}

/*  Called when user changes setting of the Animate checkbox. */
function doAnimateCheckbox() {
    var run = document.getElementById("animateCheckbox").checked;
    if (run != animating) {
        animating = run;
        if (animating) {
            requestAnimationFrame(doFrame);
        }
    }
}

/*  Drives the animation, called by system through requestAnimationFrame() */
function doFrame() {
    if (animating) {
        frameNumber++;
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
    }
}

/*----------------------------- INITIALIZATION ----------------------------------------

/**
 *  This function is called by the onload event so it will run after the
 *  page has loaded.  It creates the renderer, canvas, and scene objects,
 *  calls createWorld() to add objects to the scene, and renders the
 *  initial view of the scene.  If an error occurs, it is reported.
 */
function init() {
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false
        });
    } catch (e) {
        document.getElementById("message").innerHTML = "<b>Sorry, an error occurred:<br>" +
            e + "</b>";
        return;
    }
    document.getElementById("animateCheckbox").checked = false;
    document.getElementById("animateCheckbox").onchange = doAnimateCheckbox;
    createWorld();
    installOrbitControls();
    render();
}
