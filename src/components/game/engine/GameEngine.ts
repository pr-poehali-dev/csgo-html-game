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
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.fog = new THREE.Fog(0x0a0d14, 5, 400);

    // ─── SCENE ─────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060810);
    this.scene.fog = new THREE.FogExp2(0x060810, 0.004);

    // ─── CAMERA ────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(75, opts.canvas.clientWidth / opts.canvas.clientHeight, 0.1, 800);
    this.camera.position.copy(this.pos);

    // ─── LIGHTING ──────────────────────────────────────────────
    // Ambient — night sky
    const amb = new THREE.AmbientLight(0x1a2040, 0.8);
    this.scene.add(amb);

    // Moon / dim directional
    this.sunLight = new THREE.DirectionalLight(0x6080c0, 0.6);
    this.sunLight.position.set(80, 120, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 400;
    this.sunLight.shadow.camera.left = -80;
    this.sunLight.shadow.camera.right = 80;
    this.sunLight.shadow.camera.top = 80;
    this.sunLight.shadow.camera.bottom = -80;
    this.scene.add(this.sunLight);

    // City glow from below
    this.cityAmb = new THREE.AmbientLight(0xff8833, 0.15);
    this.scene.add(this.cityAmb);

    // Orange accent fill
    const fillLight = new THREE.PointLight(0xff6622, 0.4, 60);
    fillLight.position.set(15, 3, 0);
    this.scene.add(fillLight);

    // Roof spotlight A site
    const spotA = new THREE.SpotLight(0xffffff, 1.5, 40, Math.PI / 5, 0.4);
    spotA.position.set(15, 12, 0);
    spotA.target.position.set(15, 0, 0);
    spotA.castShadow = false;
    this.scene.add(spotA);
    this.scene.add(spotA.target);

    // B site blue tint
    const spotB = new THREE.PointLight(0x4466ff, 0.5, 30);
    spotB.position.set(-15, 5, 5);
    this.scene.add(spotB);

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

  // ─── STARS ─────────────────────────────────────────────────────
  private _addStars() {
    const geo = new THREE.BufferGeometry();
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 400 + Math.random() * 50;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
    this.scene.add(new THREE.Points(geo, mat));
  }

  // ─── SKY DOME ─────────────────────────────────────────────────
  private _addSkyDome() {
    const geo = new THREE.SphereGeometry(450, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { topColor: { value: new THREE.Color(0x02050f) }, bottomColor: { value: new THREE.Color(0x0a1530) } },
      vertexShader: `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vPos;
        void main() {
          float t = clamp((normalize(vPos).y + 0.1) / 1.1, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `,
    });
    const dome = new THREE.Mesh(geo, mat);
    dome.position.y = -50;
    this.scene.add(dome);
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

      // Pulsing city glow
      this.cityAmb.intensity = 0.12 + Math.sin(t * 0.3) * 0.04;

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
