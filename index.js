var ww = window.innerWidth;
var wh = window.innerHeight;
var COLOR_GRAY = 0xeeeeee;
var COLOR_RED = 0x800000;
var SPACING = 0.5;
var ZDIFF = 0.6;
var YSPEED = 0.005;
var ZSPEED_MIN = 0.1
var ZSPEED_MAX = 0.5

function CubeBackground() {
  this.init();
  this.addFloor();
  this.seedCubes();
  this.handleEvents();

  window.requestAnimationFrame(this.render.bind(this));
}

CubeBackground.prototype.init = function() {
  // renderer
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#scene")
  });
  this.renderer.setSize(ww, wh);
  this.renderer.setClearColor(COLOR_GRAY);
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // camera
  var aspect = ww / wh;
  this.frustumSize = 5;
  this.camera = new THREE.OrthographicCamera(
    this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2,
    this.frustumSize / 2, this.frustumSize / - 2,
    0.1, 1000);
  this.camera.position.set(-10, -10, 10);
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  this.camera.rotation.z = -30 * Math.PI / 180;

  // scene
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(COLOR_GRAY, 0.1, 22);

  // lights
  var ambientLight = new THREE.AmbientLight(COLOR_GRAY, 0.5);
  var directionalLight = new THREE.DirectionalLight(COLOR_GRAY, 0.8);
  directionalLight.position.set(-10, 0, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera = new THREE.OrthographicCamera(-5.5, 5, 6, -8, 1, 100);
  this.scene.add(ambientLight);
  this.scene.add(directionalLight);
}

CubeBackground.prototype.addFloor = function() {
  // add the floor
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshLambertMaterial({ color: COLOR_GRAY })
  );
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  this.scene.add(floor);
}

CubeBackground.prototype.seedCubes = function() {
  // generate initial cubes to set the scene, with one random red cube
  var xRand = Math.ceil(randomRange(4, 6));
  var yRand = Math.ceil(randomRange(1, 3));
  this.cubes = [];
  for (y = 0; y < 12; y++) {
    var cubeRow = [];
    for (x = 0; x < 12; x++) {
      cubeRow.push(new Cube(this.scene, x, y, xRand === x && yRand === y));
    }
    this.cubes.push(cubeRow);
  }
  // used to track when to add the next red cube
  this.rowCounter = 6;
}

CubeBackground.prototype.handleEvents = function() {
  // add event listener for window resize
  window.addEventListener('resize', this.onResize.bind(this), false);
};

CubeBackground.prototype.onResize = function() {
  // update camera on window resize
  ww = window.innerWidth;
  wh = window.innerHeight;

  var aspect = ww / wh;
  this.camera.left = this.frustumSize * aspect / - 2;
  this.camera.right = this.frustumSize * aspect / 2;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(ww, wh);
};

CubeBackground.prototype.render = function(time) {
  // primary render method
  for (var j = 0; j < this.cubes.length; j++) {
    // update all cubes
    for (var k = 0; k < 10; k++) {
      this.cubes[j][k].update(this);
    }

    // if cube row is far away enough, remove the row...
    if (this.cubes[j][0].pos.y > 10) {
      this.cubes.splice(j, 1);
      j--;
      this.rowCounter--;

      // ... then add a new row at the front
      var cubeRow = [];
      var xRand = null;
      if (this.rowCounter === 0) {
        // have a red cube in this new row
        xRand = Math.round(randomRange(3, 7));
        this.rowCounter = Math.ceil(randomRange(7, 9));
      }
      for (x = 0; x < 10; x++) {
        cubeRow.push(new Cube(this.scene, x, 0, xRand === x, true));
      }
      this.cubes.push(cubeRow);
    }
  }

  this.renderer.render(this.scene, this.camera);
  window.requestAnimationFrame(this.render.bind(this));
}

function Cube(scene, x, y, red, spawned) {
  // base cube class
  this.red = red === true;
  this.spawned = spawned === true;
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  // remove unseen faces, but retain the one that casts the shadow
  geometry.faces.splice(4, 2);
  geometry.faces.splice(8, 2);
  var material = new THREE.MeshLambertMaterial(this.red ?
    { color: COLOR_RED, fog: false } :
    { color: COLOR_GRAY });
  material.opacity = spawned ? 0 : 1;
  material.transparent = true;
  this.cube = new THREE.Mesh(geometry, material);

  var startX = -8 + x + (SPACING * x);
  var startY = -8 + y + (SPACING * y);
  var startZ = (this.red ? randomRange(0.25, 0.9) : Math.random()) - ZDIFF;
  this.cube.position.set(startX, startY, startZ);
  this.pos = new THREE.Vector3(startX, startY, startZ);

  this.newChangeTargets();

  this.cube.castShadow = !this.spawned;
  scene.add(this.cube);
}

Cube.prototype.update = function(input) {
  // update the Y and Z positions of the cube as needed
  this.cube.translateY(YSPEED);
  this.pos.y += YSPEED;

  if (this.changeDir > 0) {
    if (this.pos.z <= this.targetZ) {
      this.cube.translateZ(this.changeRate);
      this.pos.z += this.changeRate;
    } else {
      this.newChangeTargets();
    }
  } else if (this.changeDir < 0) {
    if (this.pos.z >= this.targetZ) {
      this.cube.translateZ(-this.changeRate);
      this.pos.z -= this.changeRate;
    } else {
      this.newChangeTargets();
    }
  }
  if (this.spawned) {
    // fade in newly spawned cubes in case viewing with huge monitor
    this.cube.material.opacity += 0.01;
    if (this.cube.material.opacity > 1) {
      this.spawned = false;
      this.cube.castShadow = true;  // a bit jarring, but oh well
    }
  }
}

Cube.prototype.newChangeTargets = function() {
  // generate new change Z, direction, and rate parameters
  if (this.red) {
    // red cubes don't move along Z axis
    this.targetZ = null;
    this.changeDir = 0;
    this.changeRate = 0;
  } else {
    this.targetZ = Math.random() - ZDIFF;
    this.changeDir = this.targetZ > this.pos.z ? 1 : -1;
    this.changeRate = this.newChangeRate();
  }
}

Cube.prototype.newChangeRate = function() {
  // generate a new normalized change rate
  return randomRange(ZSPEED_MIN, ZSPEED_MAX) / 100;
}

function randomRange(min, max) {
  // return a random float between min and max (no negative mins!)
  return Math.random() * (max - min) + min;
}

window.onload = function() {
  window.cubeBackground = new CubeBackground();
};
