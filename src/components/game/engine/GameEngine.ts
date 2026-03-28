import * as THREE from 'three';
import { buildVertigoMap, buildCityBelow, buildTowerBody, CityObject } from './VertigoMap';

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  onRoundBuy?: () => void;
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

  // Input
  private keys: Record<string, boolean> = {};
  private isPointerLocked = false;
  private canvas: HTMLCanvasElement;

  // City objects with update callbacks
  private cityObjects: CityObject[] = [];

  // Dynamic lights
  private warningLightGroup: THREE.Object3D[] = [];
  private sunLight!: THREE.DirectionalLight;
  private cityAmb!: THREE.AmbientLight;

  constructor(opts: EngineOptions) {
    this.canvas = opts.canvas;

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
    // Sky ambient — bright daylight
    const amb = new THREE.AmbientLight(0xfff0d0, 1.6);
    this.scene.add(amb);

    // Sun — strong warm directional
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

    // Sky fill (bounce from blue sky above)
    const skyFill = new THREE.HemisphereLight(0x87ceeb, 0xd4c5a0, 0.8);
    this.scene.add(skyFill);

    // City ambient — warm haze from city below
    this.cityAmb = new THREE.AmbientLight(0xffd090, 0.1);
    this.scene.add(this.cityAmb);

    // Stars
    this._addStars();

    // ─── SKY GRADIENT ──────────────────────────────────────────
    this._addSkyDome();

    // ─── MAP ───────────────────────────────────────────────────
    buildVertigoMap(this.scene);
    buildTowerBody(this.scene);
    this.cityObjects = buildCityBelow(this.scene);

    // ─── CROSSHAIR (CSS, not 3D) ────────────────────────────────

    // ─── EVENTS ────────────────────────────────────────────────
    this._bindEvents();
    window.addEventListener('resize', this._onResize);
  }

  // ─── STARS — not needed for day, skip ─────────────────────────
  private _addStars() {
    // Day — no stars
  }

  // ─── SKY DOME — daytime blue gradient ─────────────────────────
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
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        varying vec3 vPos;
        void main() {
          float t = clamp((normalize(vPos).y + 0.05) / 1.05, 0.0, 1.0);
          vec3 col = t > 0.5 ? mix(midColor, topColor, (t - 0.5) * 2.0) : mix(bottomColor, midColor, t * 2.0);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const dome = new THREE.Mesh(geo, mat);
    dome.position.y = -50;
    this.scene.add(dome);

    // Sun disc
    const sunGeo = new THREE.SphereGeometry(8, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbe0 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(200, 300, -150);
    this.scene.add(sun);

    // Sun halo
    const haloGeo = new THREE.SphereGeometry(14, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.15 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(sun.position);
    this.scene.add(halo);

    // Clouds
    this._addClouds();
  }

  private _addClouds() {
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    const cloudPositions = [
      [-150, 80, -200], [100, 100, -180], [200, 90, -100],
      [-200, 70, -50], [0, 110, -300], [250, 85, 50],
      [-100, 95, 200], [150, 75, 150],
    ];
    for (const [cx, cy, cz] of cloudPositions) {
      const group = new THREE.Group();
      const puffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < puffs; p++) {
        const r = 6 + Math.random() * 10;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 7), cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 20
        );
        group.add(puff);
      }
      group.position.set(cx, cy, cz);
      this.scene.add(group);
    }
  }

  // ─── INPUT EVENTS ──────────────────────────────────────────────
  private _bindEvents() {
    document.addEventListener('keydown', this._onKey);
    document.addEventListener('keyup', this._onKey);
    this.canvas.addEventListener('click', this._requestPointerLock);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('mousemove', this._onMouseMove);
  }

  private _onKey = (e: KeyboardEvent) => {
    this.keys[e.code] = e.type === 'keydown';
  };

  private _requestPointerLock = () => {
    this.canvas.requestPointerLock();
  };

  private _onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
  };

  private _onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerLocked) return;
    const sens = 0.002;
    this.yaw -= e.movementX * sens;
    this.pitch -= e.movementY * sens;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  };

  private _onResize = () => {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  // ─── MOVEMENT & COLLISION (simplified) ────────────────────────
  private _updateMovement(dt: number) {
    const SPEED = 8;
    const GRAVITY = -20;
    const JUMP_VEL = 6;
    const FLOOR_Y = 1.7;
    const FLOOR2_Y = 5.7;

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const move = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) move.add(forward);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) move.sub(forward);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) move.sub(right);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.add(right);

    if (move.lengthSq() > 0) move.normalize().multiplyScalar(SPEED);

    this.velocity.x = move.x;
    this.velocity.z = move.z;

    // Gravity
    this.velocity.y += GRAVITY * dt;

    // Jump
    if ((this.keys['Space']) && this.onGround) {
      this.velocity.y = JUMP_VEL;
      this.onGround = false;
    }

    this.pos.addScaledVector(this.velocity, dt);

    // Clamp to rooftop bounds
    this.pos.x = Math.max(-38, Math.min(38, this.pos.x));
    this.pos.z = Math.max(-28, Math.min(28, this.pos.z));

    // Floor detection (simplified)
    // Upper platform: roughly x in -20..20, z in -25..-5
    const onUpperPlatform =
      this.pos.x > -20 && this.pos.x < 20 && this.pos.z > -25 && this.pos.z < -5;

    const floorY = onUpperPlatform ? FLOOR2_Y : FLOOR_Y;

    // A-site structure top
    const onACover =
      this.pos.x > 9 && this.pos.x < 21 && this.pos.z > -5 && this.pos.z < 5;
    const finalFloor = onACover ? 5.2 + 1.7 : floorY;

    if (this.pos.y < finalFloor) {
      this.pos.y = finalFloor;
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  }

  // ─── MAIN LOOP ─────────────────────────────────────────────────
  start() {
    const loop = () => {
      this.animId = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.getElapsedTime();

      this._updateMovement(dt);

      // Camera
      this.camera.position.copy(this.pos);
      const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(euler);

      // City updates
      for (const obj of this.cityObjects) {
        obj.update?.(t);
      }

      // Subtle daytime variation
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

    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }

    this.renderer.dispose();
  }

  isLocked() { return this.isPointerLocked; }
}