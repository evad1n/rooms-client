var pUsername = "Antoine";
var pPosition = { x: 0, y: 0, z: 0 };
var pRotation = { x: 0, y: 0, z: 0 };
var pColor = 0x000000;
var pAmount = 36;
var pSavedAmount = 0;
var pAlive = true;
var pX = 0;
var pY = 0;
var pZ = 0;
var pMesh = null;
var pRing = null;
var pRingRotation = 0;
var pSpace = null;
var pInterval = 30;

var players = [
    {
        username: "James",
        position: { x: 5, y: 0, z: -32 },
        color: 0xFF0000,
        amount: 47,
        alive: true
    },
    {
        username: "Japmes",
        position: { x: -19, y: 0, z: 0 },
        color: 0x00FF00,
        amount: 16,
        alive: true
    },
    {
        username: "Jamppes",
        position: { x: 1, y: 0, z: 16 },
        color: 0xFF00FF,
        amount: 9,
        alive: true
    },
];

var asteroidAmount = 5000;
var asteroids = [];

var starAmount = 100;
var stars = [];

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);



var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
var direction = new THREE.Vector3();
camera.getWorldDirection(direction);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;



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

var spaceArray = [
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_left.png'), side: THREE.BackSide }),
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_right.png'), side: THREE.BackSide }),
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_up.png'), side: THREE.BackSide }),
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_down.png'), side: THREE.BackSide }),
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_front.png'), side: THREE.BackSide }),
   new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspace_back.png'), side: THREE.BackSide })
]

var createSkyBox = function () {
    var spaceGeometry = new THREE.BoxGeometry(2500, 2500, 2500);
    pSpace = new THREE.Mesh(spaceGeometry, spaceArray);
    scene.add(pSpace);
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

var createAsteroids = function () {
    var locations = [];

    for (var l = 0; l < 50; l++) {
        var location = {
            x: (Math.random() * 5000) - (Math.random() * 5000),
            y: (Math.random() * 5000) - (Math.random() * 5000),
            z: (Math.random() * 5000) - (Math.random() * 5000),
            a: Math.floor((Math.random() * 10))
        };
        locations.push(location);
    }

    for (var i = 0; i < asteroidAmount; i++) {
        var l_num = Math.floor(Math.random() * 50);
        var amount = Math.sqrt(locations[l_num].a);
        var geometry = new THREE.BoxGeometry(amount, amount, amount);
        var material = new THREE.MeshLambertMaterial({ color: 0xAA5522 });
        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(locations[l_num].x + ((Math.random() * 300) - (Math.random() * 300)), locations[l_num].y + ((Math.random() * 300) - (Math.random() * 300)), locations[l_num].z + ((Math.random() * 300) - (Math.random() * 300)));

        var asteroid = {
            amount: Math.sqrt(amount),
            position: mesh.position,
            alive: true,
            mesh: mesh,
            velocity: (Math.random() - Math.random())
        };
        asteroids.push(asteroid);
        scene.add(asteroid.mesh);
    }
}

var createMoons = function (planet) {
    var amount = (planet.amount / 4) / createMoons.length;
    var geometry = new THREE.SphereGeometry(1, 32, 32)
    var material = new THREE.MeshPhongMaterial({ color: randomColor() })
}

var createStar = function () {
    var geometry = new THREE.SphereGeometry(9, 32, 32);
    var material = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
    })
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(15, 20, 4);
    scene.add(mesh);
}

var createScene = function () {
    createSkyBox();
    createSun();
    createAmbientLight();
    createAsteroids();
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
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshStandardMaterial({
        roughness: 0,
        envMap: scene.background
    });
    
    pMesh = new THREE.Mesh(geometry, material);
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
    scene.add(pMesh);
    var material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/ring.png'), side: THREE.DoubleSide, alphaTest: 0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    var geometry = new THREE.PlaneGeometry(1, 1, 1);
    pRing = new THREE.Mesh(geometry, material);
    scene.add(pRing);
}

createPlayer();

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

    pRing.rotation.set(pRotation.x, pRotation.y, pRotation.z + pRingRotation);
    pRingRotation += 0.001;
    pRing.scale.set(pMesh.scale.x * 8, pMesh.scale.x * 8, pMesh.scale.x * 8);

    //GROW
    pAmount += pSavedAmount / 30;
    pSavedAmount -= pSavedAmount / 30;
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));

    controls.minDistance = Math.sqrt(pAmount) * 5;
    controls.maxDistance = Math.sqrt(pAmount) * 5;

    pX -= pX / 30;
    pMesh.translateZ(pX / pInterval);
    pRing.translateZ(pX / pInterval);
    pPosition = pMesh.position;
    pSpace.position.set(pPosition.x,pPosition.y,pPosition.z);

    players.forEach(function (player) {
        devour(player);
    })
    asteroids.forEach(function (asteroid) {
        devour(asteroid);
    })
}

var clearPlayers = function () {
    players.forEach(function (player) {
        scene.remove(player.mesh);
        player.mesh.geometry.dispose();
        player.mesh.material.dispose();
    })
}

var updatePlayers = function () {
    players.forEach(function (player) {
        //Mesh Creation
        if (player.alive) {
            var geometry = new THREE.SphereGeometry(1, 32, 32);
            var material = new THREE.MeshPhongMaterial({ color: player.color });
            player.mesh = new THREE.Mesh(geometry, material);
            player.mesh.position.set(player.position.x, player.position.y, player.position.z);
            player.mesh.scale.set(Math.sqrt(player.amount), Math.sqrt(player.amount), Math.sqrt(player.amount));
            scene.add(player.mesh);
        }
    })
}

pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
camera.position.set(pPosition.x, pPosition.y + Math.sqrt(pAmount) * 2, pPosition.z);
updatePlayers();

var updateAsteroids = function () {
    asteroids.forEach(function (asteroid) {
        if (!asteroid.alive) {
            scene.remove(asteroid.mesh);
            asteroid.mesh.geometry.dispose();
            asteroid.mesh.material.dispose();
        }
        asteroid.mesh.rotation.x += asteroid.velocity * 0.05;
        asteroid.mesh.rotation.y += asteroid.velocity * 0.05;
        asteroid.mesh.rotation.z += asteroid.velocity * 0.05;
    })
}

var updateGame = function () {
    updatePlayer();
    clearPlayers();
    updatePlayers();
    updateAsteroids();
}

var render = function () {
    updateGame();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.target = pMesh.position;
    controls.update();
}


//SERVER COMMUNICATION
var getPlayers = function () {
    fetch(`${url}/Agario/singularities`).then(function (res) {
        res.json().then(function (data) {
            players = data.players
        });
    });
}

var sendPlayer = function () {
    fetch(`${url}/Agario/singularities`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            username: pUsername,
            position: pPosition,
            color: pColor,
            amount: pAmount,
            alive: pAlive
        })
    })
}

render();
