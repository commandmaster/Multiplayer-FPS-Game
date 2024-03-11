import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'
import { GUI } from './jsm/libs/lil-gui.module.min.js'



class Player{
  constructor(playerObject) {
    
  }
}

class World{
  constructor() {
    
  }

  update(t) {
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = t;
    }

    const deltaTime = t - this.lastUpdateTime;
    const seconds = deltaTime * 0.001;

    this.physicsSystem.update(seconds);
    this.objectManager.update();

    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    this.lastUpdateTime = t;
  }
}

class Host{
  constructor(socket) {
    this.socket = socket;
    this.world = null;

    this.gameState = {state: "lobby"};
    this.gameLoop = null;

    this.players = {};

    this.socket.on('hostSimulate', (data, callback) => {
      if (data.actions.forward) {

      }

      if (data.actions.backward) {

      }

      if (data.actions.right) {

      }

      if (data.actions.left) {

      }

      if (data.actions.jump) {

      }

      if (data.actions.shoot) {
          
      }

    

      callback({});
    });
  }

  createWorld(worldData) {
    this.world = new World(worldData);
  }

  createPlayer(playerObject) {
    this.players[playerObject.id] = new Player(playerObject);
  }

  raf(){
    // Game loop
    requestAnimationFrame((t) => {
      if (this.world) this.world.update(t);
  
      this.raf();
    });
  }

}

class Client{
  constructor(socket) {
    this.socket = socket;
    this.actors = {};
    this.gameState = {state: "lobby"};
  }

}




class MultiplayerHandler {
  constructor(serverAdress = "http://localhost:3000") {
    this.socket = io.connect(serverAdress);
    this.world = new BasicWorld("sceneView");
    this.world.init();

    this.clientType = "spectator";

    this.socket.on('reloadGame', () => {
      location.reload();
    });

    this.socket.on('becomePlayer', (data) => {
      this.clientType = "player";
      const socketIdText = document.createElement('p');
      socketIdText.style.color = "red";
      socketIdText.style.position = "absolute";
      socketIdText.style.zIndex = "100";
      socketIdText.style.top = "0";

      socketIdText.textContent = `Socket ID: ${this.socket.id} - Player`;
      document.body.appendChild(socketIdText);

      const actors = data.actors;
      const player = data.players[this.socket.id];

      for (const player in data.players) {
        if (data.players[player].id !== this.socket.id) {
          actors[data.players[player].id] = data.players[player];
        }
      }
      
      if (data.gameState.state === "lobby") {
        this.world.setupLobby(actors, player);
        this.clientType = "player";
      }
    });

    this.socket.on('becomeHost', (data) => {
      const socketIdText = document.createElement('p');
      socketIdText.style.color = "red";
      socketIdText.style.position = "absolute";
      socketIdText.style.zIndex = "100";
      socketIdText.style.top = "0";
      socketIdText.textContent = `Socket ID: ${this.socket.id} - Host`;
      document.body.appendChild(socketIdText);


      const actors = data.actors;

      for (const player in data.players) {
        if (data.players[player].id !== this.socket.id) {
          actors[data.players[player].id] = data.players[player];
        }
      }

      if (data.gameState.state === "lobby") {
        this.world.setupLobby(actors, null);
        this.clientType = "host";
      }
    });

    this.socket.on('becomeSpectator', () => {
      const actors = data.actors;

      for (const player in data.players) {
        if (data.players[player].id !== this.socket.id) {
          actors[data.players[player].id] = data.players[player];
        }
      }

      this.world.setupLobby(actors, null);
      this.clientType = "spectator";
    });
    
    this.socket.on('startGame', (data) => {
      if (data.gameState.state === "playing") {
        if (this.clientType === "player") {
          const actors = data.actors;
          delete actors[socket.id];
          this.world.setupGame(actors, data.players[socket.id]);
        }
        else if (this.clientType === "host") {
          this.world.setupGame(data.actors, null);
        }

        else if (this.clientType === "spectator") {
          this.world.setupGame(data.actors, null);
        }
        
      }
    });

    this.socket.on('updateGame', (data) => {
      for (const player in data.players) {
        const tempId = data.players[player].id;
        if (tempId !== this.socket.id) {
          if (this.world.objectManager.actors[tempId]) {
            this.world.objectManager.actors[tempId].pos = new THREE.Vector3(data.players[tempId].pos.x, data.players[tempId].pos.y, data.players[tempId].pos.z);
            this.world.objectManager.actors[tempId].rot = new THREE.Quaternion(data.players[tempId].rot.x, data.players[tempId].rot.y, data.players[tempId].rot.z, data.players[tempId].rot.w);

            this.world.objectManager.actors[tempId].rigidBody.body.getMotionState().setWorldTransform(new Ammo.btTransform(new Ammo.btQuaternion(data.players[tempId].rot.x, data.players[tempId].rot.y, data.players[tempId].rot.z, data.players[tempId].rot.w), new Ammo.btVector3(data.players[tempId].pos.x, data.players[tempId].pos.y, data.players[tempId].pos.z)));
          }

          else{
            this.world.objectManager.createActor(tempId, data.players[tempId].color, data.players[tempId].mass, data.players[tempId].pos, data.players[tempId].rot, data.players[tempId].size);
          }
        }

      }

      for (const actor in data.actors) {
        if (this.world.objectManager.actors[actor]) {
          this.world.objectManager.actors[actor].pos = new THREE.Vector3(data.actors[actor].pos.x, data.actors[actor].pos.y, data.actors[actor].pos.z);
          this.world.objectManager.actors[actor].rot = new THREE.Quaternion(data.actors[actor].rot.x, data.actors[actor].rot.y, data.actors[actor].rot.z, data.actors[actor].rot.w);
          this.world.objectManager.actors[actor].rigidBody.body.getMotionState().setWorldTransform(new Ammo.btTransform(new Ammo.btQuaternion(data.actors[actor].rot.x, data.actors[actor].rot.y, data.actors[actor].rot.z, data.actors[actor].rot.w), new Ammo.btVector3(data.actors[actor].pos.x, data.actors[actor].pos.y, data.actors[actor].pos.z)));
        }

        else{
          this.world.objectManager.createActor(actor, data.actors[actor].color, data.actors[actor].mass, data.actors[actor].pos, data.actors[actor].rot, data.actors[actor].size);
        }
      }
    });

    this.socket.on('destroyPlayer', (data) => {
      this.world.objectManager.deleteActor(data);
    });

    this.socket.on("getPhysicsData", (data, callback) => {
      if (this.clientType === "player") {
        const tempTransform = new Ammo.btTransform();

        this.world.objectManager.player.rigidBody.motionState.getWorldTransform(tempTransform);
        const origin = tempTransform.getOrigin();
        const rotation = tempTransform.getRotation();

        const pos = {x: origin.x(), y: origin.y(), z: origin.z()};
        const rot = {x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w()};


        callback({pos, rot});
      }

      else{
        callback(null);
      }
    });
  }

}

class Actor {
  constructor(gameWorld, name, color, mass, pos, rot, size) {
    this.gameWorld = gameWorld;
    this.name = name;
    this.color = color;
    this.mass = mass;
    this.pos = pos;
    this.rot = rot;
    this.size = size;


    this.pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
    this.rot = new THREE.Quaternion(this.rot.x, this.rot.y, this.rot.z, this.rot.w);


    this.initRigidBody();
    this.initMesh();

  }

  initRigidBody(){
    const tempRB = this.gameWorld.physicsSystem.addBoxRigidBody(this.mass, this.pos, this.rot, new THREE.Vector3(this.size.x, this.size.y, this.size.z))
    this.rbMesh = tempRB.mesh;

    this.rigidBody = tempRB.rb;
  }

  initMesh(){
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z), new THREE.MeshStandardMaterial({color: this.color}));
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.quaternion.set(this.rot.x, this.rot.y, this.rot.z, this.rot.w);
    
    this.gameWorld.scene.add(this.mesh);
  }

  update(){
    const tempTransform = new Ammo.btTransform();

    this.rigidBody.motionState.getWorldTransform(tempTransform);
    const origin = tempTransform.getOrigin();
    const rotation = tempTransform.getRotation();

    const pos3 = new THREE.Vector3(origin.x(), origin.y(), origin.z());
    const rot4 = new THREE.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w());


    this.mesh.position.copy(pos3);
    this.mesh.quaternion.copy(rot4);
  }

  delete(){
    this.gameWorld.scene.remove(this.mesh);
    this.gameWorld.physicsSystem.physicsWorld.removeRigidBody(this.rigidBody.body);
  }
}

class Player {
  constructor(gameWorld, color, mass, pos, rot, size) {
    this.gameWorld = gameWorld;
    this.color = color;
    this.mass = mass;
    this.pos = pos;
    this.rot = rot;
    this.size = size;


    this.pos = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
    this.rot = new THREE.Quaternion(this.rot.x, this.rot.y, this.rot.z, this.rot.w);
    this.size = new THREE.Vector3(this.size.x, this.size.y, this.size.z);

    this.initRigidBody();
    this.initMesh();

    window.addEventListener('keydown', (e) => {
      if (e.key === "w") {
        this.rigidBody.body.applyCentralImpulse(new Ammo.btVector3(0, 0, -1));
      }

      if (e.key === "s") {
        this.rigidBody.body.applyCentralImpulse(new Ammo.btVector3(0, 0, 1));
      }

      if (e.key === "a") {
        this.rigidBody.body.applyCentralImpulse(new Ammo.btVector3(-1, 0, 0));
      }

      if (e.key === "d") {
        this.rigidBody.body.applyCentralImpulse(new Ammo.btVector3(1, 0, 0));
      }
    });

  }

  initRigidBody(){
    const tempRB = this.gameWorld.physicsSystem.addBoxRigidBody(this.mass, this.pos, this.rot, this.size)
    this.rbMesh = tempRB.mesh;
    this.rigidBody = tempRB.rb;
  }

  initMesh(){
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z), new THREE.MeshStandardMaterial({color: this.color}));
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.quaternion.set(this.rot.x, this.rot.y, this.rot.z, this.rot.w);
    this.gameWorld.scene.add(this.mesh);
  }

  update(){
    this.tempTransform = new Ammo.btTransform();

    this.rigidBody.motionState.getWorldTransform(this.tempTransform);
    const origin = this.tempTransform.getOrigin();
    const rotation = this.tempTransform.getRotation();

    const pos3 = new THREE.Vector3(origin.x(), origin.y(), origin.z());
    const rot4 = new THREE.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w());

    this.mesh.position.copy(pos3);
    this.mesh.quaternion.copy(rot4);
  }
}



class ObjectManager{
  constructor(gameWorld) {
    this.actors = {};
    this.player = null;
    this.gameWorld = gameWorld;
  }

  createActor(name, color, mass, pos, rot, size) {
    this.actors[name] = new Actor(this.gameWorld, name, color, mass, pos, rot, size);
  }

  createPlayer(color, mass, pos, rot, size) {
    this.player = new Player(this.gameWorld, color, mass, pos, rot, size);
  }

  deleteActor(name){
    this.gameWorld.scene.remove(this.actors[name].rbMesh);
  
    for (let i = 0; i < this.gameWorld.physicsSystem.rigidBodies.length; i++) {
      if (this.gameWorld.physicsSystem.rigidBodies[i].rb === this.actors[name].rigidBody) {
        this.gameWorld.physicsSystem.rigidBodies.splice(i, 1);
      }
    }

    this.actors[name].rigidBody.delete();



    this.actors[name].delete();
    delete this.actors[name];
  }

  update(){
    for (const actor in this.actors) {
      this.actors[actor].update();
    }

    if (this.player !== null) {
      this.player.update();
    }
  }
}


class PhysicsSystem {
  constructor(gameWorld) {
    this.gameWorld = gameWorld;

    this.collisonConfiguration = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisonConfiguration);
    this.broadphase = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisonConfiguration);
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    this.rigidBodies = [];
  }

  addBoxRigidBody(mass, pos, rot, size) {
    const rb = new RigidBody();
    rb.createBox(mass, pos, rot, size);
    this.physicsWorld.addRigidBody(rb.body);

    let tempMesh = null;
    if (this.gameWorld.gameMode === "sceneView"){
      tempMesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshStandardMaterial({color: 0x00ff00, wireframe: true}));
      this.gameWorld.scene.add(tempMesh);
      this.rigidBodies.push({rb, mesh: tempMesh});
    }

    else{
      this.rigidBodies.push({rb, mesh: null});
    }

    return {rb, mesh: tempMesh};
    
  }

  update(deltaTime){
    this.physicsWorld.stepSimulation(deltaTime, 10);

    const updateMeshes = () => {
      for (let i = 0; i < this.rigidBodies.length; i++) {
        this.tempTransform = new Ammo.btTransform();
  
        this.rigidBodies[i].rb.motionState.getWorldTransform(this.tempTransform);
        const origin = this.tempTransform.getOrigin();
        const rotation = this.tempTransform.getRotation();
  
        const pos3 = new THREE.Vector3(origin.x(), origin.y(), origin.z());
        const rot4 = new THREE.Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w());
  
        this.rigidBodies[i].mesh.position.copy(pos3);
        this.rigidBodies[i].mesh.quaternion.copy(rot4);
      }
    };
    
    if (this.gameWorld.gameMode === "sceneView"){
      updateMeshes();
    }
  }



}


class RigidBody {
  constructor() {

  }

  createBox(mass, pos, rot, size) {
    this.transform = new Ammo.btTransform();
    this.transform.setIdentity();
    this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform.setRotation(new Ammo.btQuaternion(rot.x, rot.y, rot.z, rot.w));
    this.motionState = new Ammo.btDefaultMotionState(this.transform);

    const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this.shape = new Ammo.btBoxShape(btSize);
    this.shape.setMargin(0.05);

    this.inertia = new Ammo.btVector3(0, 0, 0);
    if (mass > 0){
      this.shape.calculateLocalInertia(mass, this.inertia);
    }

    this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState, this.shape, this.inertia);
    this.body = new Ammo.btRigidBody(this.info);
  }

  delete(){
    Ammo.destroy(this.shape);
    Ammo.destroy(this.motionState);
    Ammo.destroy(this.inertia);
    Ammo.destroy(this.info);

    Ammo.destroy(this.body);
  }

}


class BasicWorld{
  constructor(gameMode = "sceneView") {
    this.gameMode = gameMode;
  }

  init() {
    this.physicsSystem = new PhysicsSystem(this);
    this.objectManager = new ObjectManager(this);

    this.scene = new THREE.Scene();

    const cameraSettings = {fov: 60, aspect: window.innerWidth / window.innerHeight, near: 1, far: 1000};
    this.camera = new THREE.PerspectiveCamera(cameraSettings.fov, cameraSettings.aspect, cameraSettings.near, cameraSettings.far);
    this.camera.position.set(75, 20, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#bg'),
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.lastUpdateTime = 0;

    this.update();
  }

  setupLobby(actors, player) {
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.01;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = 200;
    light.shadow.camera.right = -200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    this.scene.add(light);

    let ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    for (const actor in actors) {
      this.objectManager.createActor(actor, actors[actor].color, actors[actor].mass, actors[actor].pos, actors[actor].rot, actors[actor].size, actors[actor].spawnPos);
    }

    this.physicsSystem.addBoxRigidBody(0, new THREE.Vector3(0, -5, 0), new THREE.Quaternion(0, 0, 0, 1), new THREE.Vector3(100, 10, 100));

    if (player !== null) {
      this.objectManager.createPlayer(player.color, player.mass, player.pos, player.rot, player.size);
    }
    
  }

  setupGame(actors, player) {
    for(const actor in actors) {
      this.objectManager.createActor(actor, actors[actor].color, actors[actor].mass, new THREE.Vector3(actors[actor].pos.x, actors[actor].pos.y, actors[actor].pos.z), new THREE.Quaternion(actors[actor].rot.x, actors[actor].rot.y, actors[actor].rot.z, actors[actor].rot.w), new THREE.Vector3(actors[actor].size.x, actors[actor].size.y, actors[actor].size.z), actors[actor].spawnPos);
    }

    if (player !== null) {
      //this.objectManager.createPlayer(player.color, player.mass, player.pos, player.rot, player.size, player.spawnPos);
    }
  }


  update() {
    requestAnimationFrame((t) => {
      if (this.lastUpdateTime === 0) {
        this.lastUpdateTime = t;
      }

      const deltaTime = t - this.lastUpdateTime;
      const seconds = deltaTime * 0.001;

      this.physicsSystem.update(seconds);
      this.objectManager.update();

      this.renderer.render(this.scene, this.camera);
      this.controls.update();

      this.lastUpdateTime = t;
      
      this.update();

    
    });
  }

}


let multiplayerHandler = null;
window.addEventListener("DOMContentLoaded", () => {
  Ammo().then((lib) => {
    Ammo = lib;
    multiplayerHandler = new MultiplayerHandler("http://localhost:3000");
    
  });
});














// const game = new Game();
// game.init();
// game.createPlayer("player1", 0x00ff00, 0, 0, 0, 5, 5, 5, new THREE.Vector3(0, 0, 0));
