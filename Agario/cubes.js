var pUsername = "Antoine";
var pPosition = { x: 0, y: 0, z: 0 };
var pRotation = { x: 0, y: 0, z: 0 };
var pColor = 0xFFFFFF;
var pAmount = 25;
var pSavedAmount = 0;
var pX = 0;
var pZ = 0;
var pMesh = null;

var pafjkjaf = 9;

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
        amount: 4,
        alive: true
    },
];

var objects = [

];

var w_width = window.innerWidth;
var w_height = window.innerHeight;

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

var geometry = new THREE.BoxGeometry(2,16,2);
var material = new THREE.MeshBasicMaterial({color: 0xAAAA00});
var mesh = new THREE.Mesh(geometry,material);
scene.add(mesh);

var spaceArray = [
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceFT.png'), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceBK.png'), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceUP.png'), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceDN.png'), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceRT.png'), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/outerspaceLF.png'), side: THREE.BackSide })
]

//HI

var spaceGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
var space = new THREE.Mesh(spaceGeometry, spaceArray);
scene.add(space);

var camera = new THREE.PerspectiveCamera(75, w_width / w_height, 0.1, 25000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w_width, w_height);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = Math.sqrt(pAmount) * 3;
controls.maxDistance = Math.sqrt(pAmount) * 5;



//EVENT LISTENERS
window.addEventListener('resize', function () {
    renderer.setSize(w_width, w_height);
    camera.aspect = w_width / w_height;

    camera.updateProjectionMatrix();
})

window.addEventListener('keydown', function (e) {
    if (e.which == 38) {
        pX += 1;
    } else if (e.which == 39) {
        pX -= 1;
    } else if (e.which == 37) {
        pZ += 1;
    } else if (e.which == 40) {
        pZ -= 1;
    }
})


//FUNCTIONS FOR CREATING THE SCENE
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
    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial({ color: pColor });
    pMesh = new THREE.Mesh(geometry, material);
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));
    scene.add(pMesh);
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
        } else if (Math.sqrt(other.amount) > Math.sqrt(pAmount) * 1.1) {
            Math.sqrt(other.amount) += Math.sqrt(pAmount);
            pPosition.x += 20;
        }
    }
}

var updatePlayer = function () {
    pRotation.x = camera.rotation.x;
    pRotation.y = camera.rotation.y;
    pRotation.z = camera.rotation.z;

    pMesh.rotation.set(pRotation.x, pRotation.y, pRotation.z);
    pMesh.position.set(pPosition.x, pPosition.y, pPosition.z);

    //GROW
    pAmount += pSavedAmount/30;
    pSavedAmount -= pSavedAmount/30;
    pMesh.scale.set(Math.sqrt(pAmount), Math.sqrt(pAmount), Math.sqrt(pAmount));

    pPosition.x += pX/30;
    pX -= pX/30;
    pPosition.z += pZ/30;
    pZ -= pZ/30;
    pMesh.position.set(pPosition.x,pPosition.y,pPosition.z);

    players.forEach(function (player) {
        devour(player);
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

var updateGame = function () {
    updatePlayer();
    clearPlayers();
    updatePlayers();

}

var render = function () {
    updateGame();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.target = pMesh.position;
    controls.update();
    players[1].position.x += 0.03;
}


//SERVER COMMUNICATION
var getPlayers = function () {
    fetch(`${url}/${app.page}/game`).then(function (res) {
        res.json().then(function (data) {
            players = data.players
        });
    });
}

var sendPlayer = function () {
    fetch(`${url}/${app.page}/game`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            players: players
        })
    })
}

render();