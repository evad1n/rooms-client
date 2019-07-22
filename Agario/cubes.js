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
var pRingColor = 0x000000;
var pInterval = 30;

var players = [
    {
        username: "James",
        position: { x: 5, y: 0, z: -32 },
        ringcolor: 0xFF0000,
        amount: 47,
        alive: true,
        ringrotation: { x: 0, y: 0, z: 0 }
    },
    {
        username: "Japmes",
        position: { x: -19, y: 0, z: 0 },
        ringcolor: 0x00FF00,
        amount: 16,
        alive: true,
        ringrotation: { x: 2, y: -1, z: 0 }
    },
    {
        username: "Jamppes",
        position: { x: 1, y: 0, z: 16 },
        ringcolor: 0xFF00FF,
        amount: 9,
        alive: true,
        ringrotation: { x: -3, y: 4, z: 0 }
    },
];

var asteroidAmount = 5000;
var asteroids = [];

var starAmount = 100;
var stars = [];

var scene = new THREE.Scene();
var spaceTextures = ['images/outerspace_left.png', 'images/outerspace_right.png', 'images/outerspace_up.png', 'images/outerspace_down.png', 'images/outerspace_front.png', 'images/outerspace_back.png'];
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
    createSun();
    createAmbientLight();
    //createAsteroids();
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
        metalness: 1.1,
        envMap: scene.background,
        side: THREE.BackSide
    });

    pMesh = new THREE.Mesh(geometry, material);
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
    scene.add(pMesh);
    var material = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        map: new THREE.TextureLoader().load('images/ring.png'),
        side: THREE.DoubleSide,
        alphaTest: 0,
        transparent: true,
        blending: THREE.AdditiveBlending,
        emissive: pRingColor,
        emissiveIntensity: 20
    });
    var geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    pRing = new THREE.Mesh(geometry, material);
    pRing.rotation.x = -1;
    for (var v = 0; v < pRing.geometry.vertices.length; v++) {
        pRing.geometry.vertices[v].z += (Math.random() * 0.02 - Math.random() * 0.02);
    }
    scene.add(pRing);
}

pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
camera.position.set(pPosition.x, pPosition.y + Math.sqrt(pAmount) * 2, pPosition.z);

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
    pRing.rotation.z += 0.005;
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
            if (typeof player.mesh !== 'undefined') {
                var geometry = new THREE.SphereGeometry(1, 32, 32);
                var material = new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, envMap: scene.background });
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


//SERVER COMMUNICATION
/*var sendPlayer = function () {
    fetch(`${url}/Agario/singularities`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: {
            username: pUsername,
            position: pPosition,
            color: pRingColor,
            amount: pAmount,
            alive: pAlive,
            ringrotation: pRing.rotation
        }
    })
}*/

var updateGame = function () {
    updatePlayer();
    updatePlayers();
    //updateAsteroids();
    controls.target = pMesh.position;
    controls.update();
    //sendPlayer();
}

var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

var gameLoop = setInterval(() => { updateGame() }, 100);

render();

var rooms = {
    users: [],
    galaxies: [
        {
            name: "",
            type: "",
            position: { x: 0, y: 0, z: 0 },
            extent: null,
            locations: [],
        }
    ],
    messageHistory: [],
}

/*server.post("/:room/singularity", function (req, res) {
    rooms[req.params.room].users.push(req.body);
    var response = compileObjectsInRadius(req.body);
    res.send(response);
});*/

var findDistance = function (main, other) {
    var dx = main.position.x - other.position.x;
    var dy = main.position.y - other.position.y;
    var dz = main.position.z - other.position.z;
    var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance;
};

//GAME CREATION FUNCTIONS
var generateAsteroids = function (location) {
    location.asteroids = [];
    for (var i = 0; i < location.amount / 3; i++) {
        var radius = Math.floor(Math.sqrt(location.amount));
        var amount = Math.floor(location.amount / (location.amount / 3) * (Math.random() * 2)) + 1;

        var position = {
            x: location.position.x + ((Math.random() * radius) - (Math.random() * radius)),
            y: location.position.y + ((Math.random() * radius) - (Math.random() * radius)),
            z: location.position.z + ((Math.random() * radius) - (Math.random() * radius))
        };

        var asteroid = {
            amount: amount,
            position: position,
            alive: true
        };
        location.asteroids.push(asteroid);
    }
}

var generateLocation = function (galaxy) {
    //RANDOMLY GET TYPE OF STELLAR BODY
    var typeNum = Math.floor(Math.random() * 10);
    if (typeNum < 7) {
        type = "asteroid field";
    } else if (typeNum == 7) {
        type = "nebula";
    } else if (typeNum >= 8) {
        type = "system"
    }

    //RANDOMLY GET AMOUNT OF MASS
    var amount = Math.floor(Math.random() * 1000);

    //RANDOMLY GET LOCATION OF STELLAR BODY
    var locationPosition = {
        x: Math.floor((Math.random() * galaxy.extent) - (Math.random() * galaxy.extent)),
        y: Math.floor((Math.random() * galaxy.extent) - (Math.random() * galaxy.extent)),
        z: Math.floor((Math.random() * galaxy.extent) - (Math.random() * galaxy.extent))
    };

    var location = {
        name: "",
        type: type,
        amount: amount,
        position: locationPosition
    };

    return location;
}

var generateLocations = function (number_of_locations, galaxy) {
    if (galaxy.locations.length == 0) {
        galaxy.locations.push(generateLocation(galaxy));
    }
    var new_locations = 0;
    while (new_locations < number_of_locations) {
        for (var l = 0; l < number_of_locations; l++) {
            var pass_location = 0;
            while (pass_location != galaxy.locations.length) {
                var new_location = generateLocation(galaxy);
                galaxy.locations.forEach(function (location) {
                    var distance = findDistance(new_location, location);
                    if (distance > (new_location.amount / 3) * 1.1) {
                        pass_location += 1;
                    } else {
                        console.log('mission-failure');
                    }
                })
            }
            if (new_location.type == "asteroid field") {
                generateAsteroids(new_location);
            }
            galaxy.locations.push(new_location);
            new_locations += 1;
            console.log('success');
        }
    }
}

var generateGalaxy = function (galaxy) {
    var typeNum = Math.floor(Math.random() * 3);
    var galaxy_extent = 100000;
    if (typeNum == 0) {
        galaxy.type = "Generation A";
    } else if (typeNum == 1) {
        galaxy.type = "Generation B";
    } else if (typeNum == 2) {
        galaxy.type = "Generation C";
    }
    galaxy.extent = galaxy_extent;
    galaxy.name = galaxy.type + " - Category " + Math.floor(Math.sqrt(galaxy.extent));
    generateLocations(galaxy.extent / Math.cbrt(galaxy.extent), galaxy);
}

//PERFORMANCE FUNCTIONS
var findObjectsInRadius = function (main, objects) {
    var nearObjects = [];
    objects.forEach(function (object) {
        var userDistance = findDistance(main, object);
        if (userDistance <= 2500) {
            nearObjects.push(object);
        }
    })
    return nearObjects;
}

var compileObjectsInRadius = function (player) {
    var players = findObjectsInRadius(player, rooms.users);
    var locations = findLocationsInRadius(player, rooms.locations);
    return { players: players, locations: locations }
}
