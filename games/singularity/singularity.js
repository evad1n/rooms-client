var pUsername = "Antoine";
var pPosition = { x: 0, y: 0, z: 0 };
var pRotation = { x: 0, y: 0, z: 0 };
var pAmount = 36;
var pSavedAmount = 0;
var pAlive = true;
var pX = 0;
var pY = 0;
var pZ = 0;
var pMesh = null;
var pRing = null;
var pRingColor = 0x33FF55;
var pInterval = 30;

var players = [];
var asteroids = [];
var systems = [];
var nebulas = [];

var scene = new THREE.Scene();
var spaceTextures = ['games/singularity/images/outerspace_left.png', 'games/singularity/images/outerspace_right.png', 'games/singularity/images/outerspace_up.png', 'games/singularity/images/outerspace_down.png', 'games/singularity/images/outerspace_front.png', 'games/singularity/images/outerspace_back.png'];
//var spaceTextures = ['images/space_1_left.png', 'images/space_1_right.png', 'images/space_1_up.png', 'images/space_1_down.png', 'images/space_1_front.png', 'images/space_1_back.png'];
scene.background = new THREE.CubeTextureLoader().load(spaceTextures);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
var direction = new THREE.Vector3();
camera.getWorldDirection(direction);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()

//EVENT LISTENERS
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

window.addEventListener('keydown', function (e) {
    if (e.which == 87) {
        pX -= 1;
    } else if (e.which == 83) {
        pX += 1;
    }

    if (e.which == 16) {
        pInterval = 20;
    }
})

window.addEventListener('keyup', function (e) {
    if (e.which == 16) {
        pInterval = 30;
    }
})


//FUNCTIONS FOR CREATING THE SCENE

var randomColor = function () {
    color = "";
    for (var c = 0; c < 6; c++) {
        num = Math.floor(Math.random() * 16)
        if (num < 10) {
            color += num;
        } else {
            if (num == 10) {
                color += "A";
            } else if (num == 11) {
                color += "B";
            } else if (num == 12) {
                color += "C";
            } else if (num == 13) {
                color += "D";
            } else if (num == 14) {
                color += "E";
            } else if (num == 15) {
                color += "F";
            }
        }
    }
    return color;
}

var createSun = function () {
    var sun = new THREE.DirectionalLight(0xffffff);
    sun.position.set(1, 1, 1).normalize();
    scene.add(sun);
}

var createAmbientLight = function () {
    var ambientlight = new THREE.AmbientLight(0xAAAAAA, 0.8);
    scene.add(ambientlight);
}

var createScene = function () {
    createSun();
    createAmbientLight();
}


createScene();

/*var mtlLoader = new THREE.MTLLoader()
mtlLoader.load('models/raptor.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load('models/raptor.obj', function (object) {
        scene.add(object);
    }, null, null);
});*/


//UPDATE
var createPlayer = function () {
    pRingColor = randomColor();
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    scene.background.mapping = THREE.CubeRefractionMapping;
    var material = new THREE.MeshStandardMaterial({
        roughness: 0,
        metalness: 1,
        refractionRatio: 0.8,
        envMap: scene.background,
    });

    pMesh = new THREE.Mesh(geometry, material);
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
    scene.add(pMesh);
    var material = new THREE.MeshLambertMaterial({
        color: pRingColor,
        map: new THREE.TextureLoader().load('games/singularity/images/ring.png'),
        side: THREE.DoubleSide,
        alphaTest: 0,
        transparent: true,
        blending: THREE.AdditiveBlending,
        emissive: pRingColor,
        emissiveIntensity: 0.6
    });
    var geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    pRing = new THREE.Mesh(geometry, material);
    pRing.rotation.x = -1;
    for (var v = 0; v < pRing.geometry.vertices.length; v++) {
        pRing.geometry.vertices[v].z += (Math.random() * 0.02 - Math.random() * 0.02);
    }
    scene.add(pRing);
}

createPlayer();
pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
camera.position.set(pPosition.x, pPosition.y + Math.sqrt(pAmount) * 2, pPosition.z);

var devour = function (other) {
    var dx = pPosition.x - other.position.x;
    var dy = pPosition.y - other.position.y;
    var dz = pPosition.z - other.position.z;
    var d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (d < Math.sqrt(pAmount) + Math.sqrt(other.amount) && other.alive == true) {
        if (Math.sqrt(pAmount) > Math.sqrt(other.amount) * 1.1) {
            pSavedAmount += other.amount;
            other.alive = false;
        } else if (Math.sqrt(other.amount) > Math.sqrt(pAmount) * 1.1 && pAlive == true) {
            other.amount += pAmount;
            pAlive = false;
            pAmount = 9;
            pPosition = { x: Math.random() * 1000, y: Math.random() * 1000, z: Math.random() * 1000 };
        }
    }
}

var updatePlayer = function () {
    pRotation.x = camera.rotation.x;
    pRotation.y = camera.rotation.y;
    pRotation.z = camera.rotation.z;

    pMesh.rotation.set(pRotation.x, pRotation.y, pRotation.z);
    pRing.rotateZ(0.001);
    pRing.scale.set(pMesh.scale.x * 7, pMesh.scale.x * 7, pMesh.scale.x * 7);

    //GROW
    pAmount += pSavedAmount / 15;
    pSavedAmount -= pSavedAmount / 15;
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));

    controls.minDistance = Math.sqrt(pAmount) * 5;
    controls.maxDistance = Math.sqrt(pAmount) * 5;

    pX -= pX / 15;
    pMesh.translateZ(pX / pInterval);
    pPosition = pMesh.position;
    pRing.position.set(pPosition.x, pPosition.y, pPosition.z);

    players.forEach(function (player) {
        devour(player);
    })
    asteroids.forEach(function (asteroid) {
        devour(asteroid);
    })


}

var updatePlayers = function () {
    players.forEach(function (player) {
        //Mesh Creation
        if (player.alive) {
            if (typeof player.mesh === 'undefined') {
                var geometry = new THREE.SphereGeometry(1, 32, 32);
                var material = new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, refractionRatio: 0.8, envMap: scene.background });
                player.mesh = new THREE.Mesh(geometry, material);
                player.mesh.position.set(player.position.x, player.position.y, player.position.z);
                player.mesh.scale.set(Math.sqrt(player.amount), Math.sqrt(player.amount), Math.sqrt(player.amount));
                scene.add(player.mesh);

                //var material = new THREE.MeshBasicMaterial({ color: player.ringcolor, map: new THREE.TextureLoader().load('images/ring.png'), side: THREE.DoubleSide, alphaTest: 0, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
                //var geometry = new THREE.PlaneGeometry(1, 1, 1);
                //player.ring = new THREE.Mesh(geometry, material);
                //player.ring.position.set(player.position.x,player.position.y,player.position.z);
                //player.ringrotation.z += 0.001;
                //player.ring.rotation.set(player.ringrotation.x,player.ringrotation.y,player.ringrotation.z);
                //player.ring.scale.set(Math.sqrt(player.amount) * 7, Math.sqrt(player.amount) * 7, Math.sqrt(player.amount) * 7);
                //scene.add(player.ring);
            } else {
                player.mesh.position.set(player.position.x, player.position.y, player.position.z);
                player.mesh.scale.set(Math.sqrt(player.amount), Math.sqrt(player.amount), Math.sqrt(player.amount));
            }
        } else {
            scene.remove(player.mesh);
            player.mesh.geometry.dispose();
            player.mesh.material.dispose();
        }
    })
}



var updateAsteroids = function () {
    asteroids.forEach(function (asteroid) {
        if (asteroid.alive) {
            if (typeof asteroid.mesh === 'undefined') {
                var geometry = new THREE.BoxGeometry(amount, amount, amount);
                var material = new THREE.MeshLambertMaterial({ color: 0xAA5522 });
                mesh.position.set(asteroid.position.x, asteroid.position.y, asteroid.position.z);
                mesh.scale.set(asteroid.amount,asteroid.amount,asteroid.amount);
                var mesh = new THREE.Mesh(geometry, material);
            } else {
                asteroid.mesh.rotation.x += asteroid.velocity * 0.05;
                asteroid.mesh.rotation.y += asteroid.velocity * 0.05;
                asteroid.mesh.rotation.z += asteroid.velocity * 0.05;
                mesh.position.set(asteroid.position.x, asteroid.position.y, asteroid.position.z);
            }
        } else {
            scene.remove(asteroid.mesh);
            asteroid.mesh.geometry.dispose();
            asteroid.mesh.material.dispose();
        }
    })
}


//SERVER COMMUNICATION
var sendPlayer = function () {
    var body = {
        username: pUsername,
        position: pPosition,
        ringcolor: pRingColor,
        amount: pAmount,
        alive: pAlive,
        ringrotation: pRing.rotation
    };
    fetch(`${url}/singularity/update`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(body)
    })
}

var getGame = function () {
    fetch(`${url}/singularity/visible/${pUsername,pPosition}`).then(function (res) {
        res.json().then(function (data) {
            players = data.players;
            asteroids = data.asteroids;
            systems = data.systems;
            nebulas = data.nebulas;
        });
    })
}

var updateGame = function () {
    updatePlayer();
    sendPlayer();
    getGame();
    updatePlayers();
    updateAsteroids();
    controls.target = pMesh.position;
    controls.update();
}

var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

var gameLoop = setInterval(() => { updateGame() }, 100);

render();
