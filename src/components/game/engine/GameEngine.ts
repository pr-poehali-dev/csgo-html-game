import * as THREE from 'three';
import { buildVertigoMap, buildCityBelow, buildTowerBody, CityObject, buildPedestrians, PedestrianData } from './VertigoMap';

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  onDeath?: () => void;
}

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private animId = 0;
  private clock = new THREE.Clock();

  // Player state
  private pos = new THREE.Vector3(0, 1.7, 15);
  private yaw = 0;
  private pitch = 0;
  private velocity = new THREE.Vector3();
  private onGround = false;
  private isDead = false;
  private fallStartY = 0;
  private isFalling = false;
  private deathCallback?: () => void;

  // Input
  private keys: Record<string, boolean> = {};
  private isPointerLocked = false;
  private canvas: HTMLCanvasElement;

  // City objects with update callbacks
  private cityObjects: CityObject[] = [];
  private pedestrians: PedestrianData[] = [];

  // Dynamic lights
  private sunLight!: THREE.DirectionalLight;
  private cityAmb!: THREE.AmbientLight;

  // Death screen
  private deathTime = 0;
  private screenRed = 0;

  constructor(opts: EngineOptions) {
    this.canvas = opts.canvas;
    this.deathCallback = opts.onDeath;

    // ─── RENDERER ──────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(opts.canvas.clientWidth, opts.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // ─── SCENE ─────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xc9e8f5, 0.0018);

    // ─── CAMERA ────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(75, opts.canvas.clientWidth / opts.canvas.clientHeight, 0.1, 800);
    this.camera.position.copy(this.pos);

    // ─── LIGHTING ──────────────────────────────────────────────
    const amb = new THREE.AmbientLight(0xfff0d0, 1.6);
    this.scene.add(amb);

    this.sunLight = new THREE.DirectionalLight(0xfff5e0, 3.0);
    this.sunLight.position.set(120, 200, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(4096, 4096);
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 600;
    this.sunLight.shadow.camera.left = -100;
    this.sunLight.shadow.camera.right = 100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    const skyFill = new THREE.HemisphereLight(0x87ceeb, 0xd4c5a0, 0.8);
    this.scene.add(skyFill);

    this.cityAmb = new THREE.AmbientLight(0xffd090, 0.1);
    this.scene.add(this.cityAmb);

    this._addSkyDome();

    // ─── MAP ───────────────────────────────────────────────────
    buildVertigoMap(this.scene);
    buildTowerBody(this.scene);
    this.cityObjects = buildCityBelow(this.scene);
    this.pedestrians = buildPedestrians(this.scene);

    // ─── EVENTS ────────────────────────────────────────────────
    this._bindEvents();
    window.addEventListener('resize', this._onResize);
  }

  // ─── SKY DOME ─────────────────────────────────────────────────
  private _addSkyDome() {
    const geo = new THREE.SphereGeometry(450, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor:    { value: new THREE.Color(0x1a6fd4) },
        midColor:    { value: new THREE.Color(0x5ab0f0) },
        bottomColor: { value: new THREE.Color(0xc9e8f5) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 topColor; uniform vec3 midColor; uniform vec3 bottomColor;
        varying vec3 vPos;
        void main() {
          float t = clamp((normalize(vPos).y + 0.05) / 1.05, 0.0, 1.0);
          vec3 col = t > 0.5 ? mix(midColor, topColor, (t-0.5)*2.0) : mix(bottomColor, midColor, t*2.0);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const dome = new THREE.Mesh(geo, mat);
    dome.position.y = -50;
    this.scene.add(dome);

    // Sun
    const sun = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfffbe0 }));
    sun.position.set(200, 300, -150);
    this.scene.add(sun);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.15 }));
    halo.position.copy(sun.position);
    this.scene.add(halo);

    // Clouds
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    const cpos = [[-150,80,-200],[100,100,-180],[200,90,-100],[-200,70,-50],[0,110,-300],[250,85,50],[-100,95,200],[150,75,150]];
    for (const [cx,cy,cz] of cpos) {
      const g = new THREE.Group();
      for (let p = 0; p < 4 + Math.floor(Math.random()*4); p++) {
        const r = 6 + Math.random()*10;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r,7,7), cloudMat);
        puff.position.set((Math.random()-0.5)*30,(Math.random()-0.5)*6,(Math.random()-0.5)*20);
        g.add(puff);
      }
      g.position.set(cx,cy,cz);
      this.scene.add(g);
    }
  }

  // ─── INPUT ─────────────────────────────────────────────────────
  private _bindEvents() {
    document.addEventListener('keydown', this._onKey);
    document.addEventListener('keyup', this._onKey);
    this.canvas.addEventListener('click', this._requestPointerLock);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('mousemove', this._onMouseMove);
  }

  private _onKey = (e: KeyboardEvent) => { this.keys[e.code] = e.type === 'keydown'; };
  private _requestPointerLock = () => { this.canvas.requestPointerLock(); };
  private _onPointerLockChange = () => { this.isPointerLocked = document.pointerLockElement === this.canvas; };

  private _onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerLocked || this.isDead) return;
    const sens = 0.002;
    this.yaw -= e.movementX * sens;
    this.pitch -= e.movementY * sens;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  };

  private _onResize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ─── MOVEMENT & PHYSICS ────────────────────────────────────────
  private _updateMovement(dt: number) {
    if (this.isDead) return;

    const SPEED = 8;
    const GRAVITY = -28;
    const JUMP_VEL = 7;
    const CITY_FLOOR_Y = -180 + 1.7; // ground level in city
    const ROOF_FLOOR_Y = 1.7;
    const ROOF_FLOOR2_Y = 5.7;
    const DEATH_Y = CITY_FLOOR_Y + 0.1;

    // Horizontal move
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp'])    move.add(forward);
    if (this.keys['KeyS'] || this.keys['ArrowDown'])  move.sub(forward);
    if (this.keys['KeyA'] || this.keys['ArrowLeft'])  move.sub(right);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.add(right);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(SPEED);

    this.velocity.x = move.x;
    this.velocity.z = move.z;

    // Gravity always applies
    this.velocity.y += GRAVITY * dt;

    // Jump
    if (this.keys['Space'] && this.onGround) {
      this.velocity.y = JUMP_VEL;
      this.onGround = false;
    }

    this.pos.addScaledVector(this.velocity, dt);

    // Track free-fall start
    if (!this.onGround && !this.isFalling && this.pos.y < ROOF_FLOOR_Y - 2) {
      this.isFalling = true;
      this.fallStartY = this.pos.y;
    }

    // ── FLOOR DETECTION ──────────────────────────────────────
    // Only clamp X/Z while on rooftop area (above -10)
    if (this.pos.y > -10) {
      this.pos.x = Math.max(-40, Math.min(40, this.pos.x));
      this.pos.z = Math.max(-30, Math.min(30, this.pos.z));
    }

    // Rooftop floors
    const onUpperPlatform = this.pos.x > -20 && this.pos.x < 20 && this.pos.z > -25 && this.pos.z < -5;
    const onACover = this.pos.x > 9 && this.pos.x < 21 && this.pos.z > -5 && this.pos.z < 5;
    const roofFloor = onACover ? 5.2 + 1.7 : onUpperPlatform ? ROOF_FLOOR2_Y : ROOF_FLOOR_Y;

    // Only snap to rooftop if above it OR just landed from above
    if (this.pos.y <= roofFloor && this.pos.y > -5) {
      this.pos.y = roofFloor;
      this.velocity.y = 0;
      this.onGround = true;
      this.isFalling = false;
    } else if (this.pos.y <= DEATH_Y) {
      // ── DEATH — hit the city ground ──────────────────────────
      this.pos.y = DEATH_Y;
      this.velocity.set(0, 0, 0);
      this.onGround = true;
      this._triggerDeath();
    } else {
      this.onGround = false;
    }
  }

  private _triggerDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTime = this.clock.getElapsedTime();
    // Tilt camera dramatically
    this.pitch = 0.6;
    if (this.deathCallback) {
      setTimeout(() => this.deathCallback!(), 2500);
    }
  }

  public respawn() {
    this.isDead = false;
    this.isFalling = false;
    this.pos.set(0, 1.7, 15);
    this.velocity.set(0, 0, 0);
    this.pitch = 0;
    this.screenRed = 0;
  }

  // ─── MAIN LOOP ─────────────────────────────────────────────────
  start() {
    const loop = () => {
      this.animId = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.getElapsedTime();

      this._updateMovement(dt);

      // Camera
      if (this.isDead) {
        // Slowly tilt forward like ragdoll
        const elapsed = t - this.deathTime;
        this.pitch = Math.min(1.4, 0.6 + elapsed * 0.3);
        this.camera.position.copy(this.pos);
        this.camera.position.y += 0.5 - elapsed * 0.3; // slowly sink
      } else {
        this.camera.position.copy(this.pos);
      }

      const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(euler);

      // City pedestrians update
      for (const p of this.pedestrians) {
        p.update(t);
      }

      // City objects update
      for (const obj of this.cityObjects) {
        obj.update?.(t);
      }

      // Screen red tint on death (handled in GameView via getter)
      if (this.isDead) {
        this.screenRed = Math.min(1, this.screenRed + dt * 1.5);
      }

      this.cityAmb.intensity = 0.08 + Math.sin(t * 0.1) * 0.02;
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.animId);
    document.removeEventListener('keydown', this._onKey);
    document.removeEventListener('keyup', this._onKey);
    this.canvas.removeEventListener('click', this._requestPointerLock);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    document.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.renderer.dispose();
  }

  isLocked() { return this.isPointerLocked; }
  getIsDead() { return this.isDead; }
  getScreenRed() { return this.screenRed; }
  getPlayerY() { return this.pos.y; }
}
