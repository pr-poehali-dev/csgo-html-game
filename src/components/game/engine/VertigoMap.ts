import * as THREE from 'three';

export function buildVertigoMap(scene: THREE.Scene) {
  const objects: THREE.Object3D[] = [];

  // ─── MATERIALS ───────────────────────────────────────────────
  const concreteMat = new THREE.MeshLambertMaterial({ color: 0x8a8a7a });
  const concreteGray = new THREE.MeshLambertMaterial({ color: 0x6a6a62 });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
  const yellowMat = new THREE.MeshLambertMaterial({ color: 0xd4a017 });
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.35 });
  const roofFloor = new THREE.MeshLambertMaterial({ color: 0x7a7a6a });
  const roofFloor2 = new THREE.MeshLambertMaterial({ color: 0x6e6e5e });
  const crateMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
  const redMat = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
  const pipeMat = new THREE.MeshLambertMaterial({ color: 0x334455 });
  const railMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

  function add(obj: THREE.Object3D) {
    scene.add(obj);
    objects.push(obj);
    return obj;
  }

  function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return add(mesh);
  }

  function cyl(rt: number, rb: number, h: number, seg: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return add(mesh);
  }

  // ─── ROOFTOP FLOOR ───────────────────────────────────────────
  box(80, 0.4, 60, roofFloor, 0, 0, 0);

  // Upper level platform (second level)
  box(40, 0.4, 30, roofFloor2, 0, 4, -10);

  // Stairs to upper level
  for (let i = 0; i < 8; i++) {
    box(8, 0.4, 1.5, concreteMat, -20, i * 0.5 + 0.2, -5 + i * 1.5);
  }

  // ─── OUTER WALLS / LEDGES ────────────────────────────────────
  box(80, 1.2, 0.5, concreteMat, 0, 0.8, 30);   // front edge
  box(80, 1.2, 0.5, concreteMat, 0, 0.8, -30);  // back edge
  box(0.5, 1.2, 60, concreteMat, 40, 0.8, 0);   // right edge
  box(0.5, 1.2, 60, concreteMat, -40, 0.8, 0);  // left edge

  // ─── RAILING POSTS ───────────────────────────────────────────
  for (let i = -38; i <= 38; i += 4) {
    cyl(0.06, 0.06, 1.2, 6, railMat, i, 0.6, 29.8);
    cyl(0.06, 0.06, 1.2, 6, railMat, i, 0.6, -29.8);
  }
  for (let i = -28; i <= 28; i += 4) {
    cyl(0.06, 0.06, 1.2, 6, railMat, 39.8, 0.6, i);
    cyl(0.06, 0.06, 1.2, 6, railMat, -39.8, 0.6, i);
  }
  // Horizontal rails
  box(80, 0.06, 0.06, railMat, 0, 1.2, 29.8);
  box(80, 0.06, 0.06, railMat, 0, 1.2, -29.8);
  box(0.06, 0.06, 60, railMat, 39.8, 1.2, 0);
  box(0.06, 0.06, 60, railMat, -39.8, 1.2, 0);

  // ─── CENTRAL STRUCTURE (A SITE) ──────────────────────────────
  box(12, 5, 10, concreteMat, 15, 2.5, 0);       // main block
  box(4, 2, 10, metalMat, 9, 1, 0);              // side cover
  box(10, 0.4, 6, roofFloor, 15, 5.2, 0);        // roof of block
  box(14, 0.3, 12, yellowMat, 15, 5.35, 0);      // yellow stripe roof

  // ─── B SITE STRUCTURE ────────────────────────────────────────
  box(10, 4, 8, concreteMat, -15, 2, 5);
  box(10, 0.4, 8, roofFloor, -15, 4.2, 5);
  box(3, 3, 8, metalMat, -20.5, 1.5, 5);         // metal wall

  // ─── ELEVATOR SHAFT ──────────────────────────────────────────
  box(6, 8, 6, concreteMat, 0, 4, -20);
  box(6.2, 0.4, 6.2, metalMat, 0, 8.2, -20);     // roof
  // Elevator doors
  box(0.15, 3, 2.4, metalMat, -3.1, 1.5, -20);
  box(0.15, 3, 2.4, metalMat, 3.1, 1.5, -20);

  // ─── VENTS / PIPES ───────────────────────────────────────────
  cyl(0.3, 0.3, 8, 8, pipeMat, 18, 0.3, 20);
  cyl(0.3, 0.3, 6, 8, pipeMat, -18, 0.3, -20);
  cyl(0.3, 0.3, 5, 8, pipeMat, 25, 0.3, -15);
  // Horizontal pipe
  const hpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 15, 8), pipeMat);
  hpipe.rotation.z = Math.PI / 2;
  hpipe.position.set(0, 1.5, 25);
  add(hpipe);

  // ─── CRATES (cover) ──────────────────────────────────────────
  const cratePositions = [
    [5, 0.5, 10], [-5, 0.5, 10], [5, 0.5, 8], [-5, 0.5, 8],
    [22, 0.5, 12], [22, 1.5, 12], [22, 0.5, 14],
    [-22, 0.5, -12], [-22, 0.5, -14], [-22, 1.5, -12],
    [10, 0.5, -20], [-10, 0.5, 20],
  ];
  for (const [x, y, z] of cratePositions) {
    box(1, 1, 1, crateMat, x, y, z);
  }

  // ─── GLASS PANELS ────────────────────────────────────────────
  box(0.1, 2, 8, glassMat, 20, 1.2, 0);
  box(0.1, 2, 6, glassMat, -20, 1.2, -5);

  // ─── BOMB SITE MARKERS ───────────────────────────────────────
  // A Site
  const aMarker = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshLambertMaterial({ color: 0xff4400, transparent: true, opacity: 0.3 }));
  aMarker.rotation.x = -Math.PI / 2;
  aMarker.position.set(15, 0.22, 0);
  add(aMarker);

  // B Site
  const bMarker = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshLambertMaterial({ color: 0x4444ff, transparent: true, opacity: 0.3 }));
  bMarker.rotation.x = -Math.PI / 2;
  bMarker.position.set(-15, 0.22, 5);
  add(bMarker);

  // ─── UPPER FLOOR DETAILS ─────────────────────────────────────
  box(8, 2, 3, concreteMat, 0, 5.2, -10);       // upper wall cover
  box(3, 1.5, 3, crateMat, 8, 4.95, -15);
  box(2, 1, 2, metalMat, -8, 4.95, -20);

  // ─── HELIPAD ─────────────────────────────────────────────────
  cyl(4, 4, 0.1, 32, new THREE.MeshLambertMaterial({ color: 0x334466 }), 30, 0.25, -25);
  // H marker
  box(3, 0.12, 0.6, new THREE.MeshLambertMaterial({ color: 0xffffff }), 30, 0.31, -25);
  box(0.6, 0.12, 3, new THREE.MeshLambertMaterial({ color: 0xffffff }), 28.7, 0.31, -25);
  box(0.6, 0.12, 3, new THREE.MeshLambertMaterial({ color: 0xffffff }), 31.3, 0.31, -25);

  // ─── ANTENNA / RADIO TOWER ───────────────────────────────────
  cyl(0.08, 0.12, 6, 6, metalMat, 35, 3, -28);
  cyl(0.04, 0.08, 4, 6, metalMat, 35, 8, -28);
  cyl(0.02, 0.04, 2, 6, metalMat, 35, 11, -28);
  // Red warning light
  const warningLight = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
  warningLight.position.set(35, 12.2, -28);
  add(warningLight);

  // ─── AC UNITS ────────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    box(1.5, 1, 1, metalMat, -30 + i * 5, 0.5, 28);
  }
  for (let i = 0; i < 3; i++) {
    box(1.5, 1, 1, metalMat, -10 + i * 5, 4.7, -10);
  }

  // ─── SKYLIGHTS ───────────────────────────────────────────────
  box(4, 0.15, 3, glassMat, -25, 0.25, 10);
  box(4, 0.15, 3, glassMat, -25, 0.25, 16);

  // ─── BUILDING CORE (stairwell/center) ────────────────────────
  box(8, 3, 8, concreteMat, 0, 1.5, 10);
  // Doors
  box(0.2, 2.2, 1.8, metalMat, -4.1, 1.1, 10);
  box(0.2, 2.2, 1.8, metalMat, 4.1, 1.1, 10);

  return objects;
}

// ─── ANIMATED CITY BELOW ─────────────────────────────────────────────────────
export interface CityObject {
  mesh: THREE.Object3D;
  update?: (t: number) => void;
}

export function buildCityBelow(scene: THREE.Scene): CityObject[] {
  const cityObjects: CityObject[] = [];
  const CITY_Y = -180;

  function addCity(obj: THREE.Object3D, update?: (t: number) => void) {
    scene.add(obj);
    cityObjects.push({ mesh: obj, update });
    return obj;
  }

  // ─── GROUND PLANE ────────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a1e26 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, CITY_Y, 0);
  ground.receiveShadow = true;
  addCity(ground);

  // ─── ROAD GRID ───────────────────────────────────────────────
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2e38 });
  const linesMat = new THREE.MeshLambertMaterial({ color: 0xf5c518 });

  // Main roads
  for (let i = -2; i <= 2; i++) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(600, 14), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, CITY_Y + 0.1, i * 100);
    addCity(road);

    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(14, 600), roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.position.set(i * 100, CITY_Y + 0.1, 0);
    addCity(road2);

    // Dashed center lines
    for (let j = -280; j < 280; j += 20) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.4), linesMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(j, CITY_Y + 0.15, i * 100);
      addCity(dash);

      const dash2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 8), linesMat);
      dash2.rotation.x = -Math.PI / 2;
      dash2.position.set(i * 100, CITY_Y + 0.15, j);
      addCity(dash2);
    }
  }

  // ─── CITY BUILDINGS ──────────────────────────────────────────
  const buildingColors = [0x1e2535, 0x252d3d, 0x1c2030, 0x2a3348, 0x1a2040, 0x21293a];
  const windowColor = 0xffd080;
  const windowOffColor = 0x223355;

  const buildingData = [
    // [x, z, w, d, h]
    [-60, -60, 18, 18, 80], [-60, -60, 14, 14, 120],
    [60, -60, 20, 16, 90], [60, -60, 12, 12, 110],
    [-60, 60, 16, 20, 70], [-60, 60, 10, 10, 140],
    [60, 60, 22, 18, 85], [60, 60, 14, 14, 105],
    [-160, -60, 16, 16, 60], [-160, 60, 18, 14, 75],
    [160, -60, 14, 18, 65], [160, 60, 20, 16, 80],
    [-60, -160, 16, 16, 55], [60, -160, 18, 14, 70],
    [-60, 160, 14, 18, 60], [60, 160, 20, 16, 75],
    [-160, -160, 12, 12, 45], [160, -160, 14, 14, 50],
    [-160, 160, 12, 12, 48], [160, 160, 14, 14, 52],
    // Close cluster
    [-30, -30, 10, 10, 50], [30, -30, 12, 8, 60],
    [-30, 30, 8, 12, 55], [30, 30, 10, 10, 65],
    // Wide blocks
    [-110, 0, 30, 14, 30], [110, 0, 30, 14, 35],
    [0, -110, 14, 30, 32], [0, 110, 14, 30, 28],
  ];

  for (const [bx, bz, bw, bd, bh] of buildingData) {
    const bIdx = Math.floor(Math.random() * buildingColors.length);
    const bMat = new THREE.MeshLambertMaterial({ color: buildingColors[bIdx] });
    const bGeo = new THREE.BoxGeometry(bw, bh, bd);
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(bx, CITY_Y + bh / 2, bz);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    addCity(bMesh);

    // Windows
    const floorsCount = Math.floor(bh / 4);
    const wPerRow = Math.floor(bw / 3);
    for (let floor = 1; floor < floorsCount; floor++) {
      for (let col = 0; col < wPerRow; col++) {
        const on = Math.random() > 0.3;
        const wMat = new THREE.MeshBasicMaterial({ color: on ? windowColor : windowOffColor });
        const wMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), wMat);
        wMesh.position.set(
          bx + (-bw / 2 + 1.5 + col * 3),
          CITY_Y + floor * 4 + 2,
          bz + bd / 2 + 0.05
        );
        // Flicker some windows
        if (on && Math.random() > 0.85) {
          const flickerSpeed = 0.5 + Math.random() * 2;
          const flickerOffset = Math.random() * Math.PI * 2;
          addCity(wMesh, (t) => {
            const v = Math.sin(t * flickerSpeed + flickerOffset);
            (wMesh.material as THREE.MeshBasicMaterial).color.setHex(v > 0 ? windowColor : windowOffColor);
          });
        } else {
          addCity(wMesh);
        }
      }
    }

    // Rooftop lights
    const rtLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff3300 })
    );
    rtLight.position.set(bx, CITY_Y + bh + 0.5, bz);
    addCity(rtLight, (t) => {
      const visible = Math.sin(t * 1.5 + (bx + bz) * 0.1) > 0;
      rtLight.visible = visible;
    });
  }

  // ─── STREETLIGHTS ────────────────────────────────────────────
  const poleMatC = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const lampGlow = new THREE.MeshBasicMaterial({ color: 0xffffaa });

  for (let x = -240; x <= 240; x += 40) {
    for (let z = -240; z <= 240; z += 40) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 12, 6), poleMatC);
      pole.position.set(x + 6, CITY_Y + 6, z + 6);
      addCity(pole);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), lampGlow);
      lamp.position.set(x + 6, CITY_Y + 12.5, z + 6);
      addCity(lamp);
    }
  }

  // ─── ANIMATED CARS ───────────────────────────────────────────
  const carColors = [0xcc3333, 0x3366cc, 0x33cc66, 0xcccc33, 0xcc6633, 0xffffff, 0x222222];

  interface CarData {
    mesh: THREE.Mesh;
    axis: 'x' | 'z';
    lane: number;
    speed: number;
    dir: number;
    range: number;
    offset: number;
  }

  const cars: CarData[] = [];

  for (let i = 0; i < 40; i++) {
    const axis = Math.random() > 0.5 ? 'x' : 'z';
    const lane = (Math.floor(Math.random() * 5) - 2) * 100 + (Math.random() > 0.5 ? 3.5 : -3.5);
    const color = carColors[Math.floor(Math.random() * carColors.length)];
    const carMat = new THREE.MeshLambertMaterial({ color });
    const carGeo = new THREE.BoxGeometry(4, 1.5, 2);
    const car = new THREE.Mesh(carGeo, carMat);

    const startPos = (Math.random() - 0.5) * 500;
    const speed = 0.3 + Math.random() * 0.5;
    const dir = Math.random() > 0.5 ? 1 : -1;

    if (axis === 'x') {
      car.position.set(startPos, CITY_Y + 1.2, lane);
      car.rotation.y = dir > 0 ? 0 : Math.PI;
    } else {
      car.position.set(lane, CITY_Y + 1.2, startPos);
      car.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    // Headlights
    const headL = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffee }));
    const headR = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffee }));
    headL.position.set(2.05, 0, 0.5);
    headR.position.set(2.05, 0, -0.5);
    car.add(headL);
    car.add(headR);

    // Tail lights
    const tailL = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ color: 0xff1100 }));
    const tailR = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ color: 0xff1100 }));
    tailL.position.set(-2.05, 0, 0.5);
    tailL.rotation.y = Math.PI;
    tailR.position.set(-2.05, 0, -0.5);
    tailR.rotation.y = Math.PI;
    car.add(tailL);
    car.add(tailR);

    scene.add(car);
    cars.push({ mesh: car, axis, lane, speed, dir, range: 280, offset: startPos });
    cityObjects.push({
      mesh: car,
      update: (t) => {
        const pos = (cars[i].offset + t * speed * dir * 60) % (cars[i].range * 2);
        const wrapped = pos > cars[i].range ? pos - cars[i].range * 2 : pos;
        if (axis === 'x') {
          car.position.x = wrapped;
        } else {
          car.position.z = wrapped;
        }
      }
    });
  }

  // ─── FOG / ATMOSPHERE AT CITY LEVEL ──────────────────────────
  // (handled by scene fog)

  return cityObjects;
}

// ─── NEBOSKREB (the main tower body) ─────────────────────────────────────────
export function buildTowerBody(scene: THREE.Scene) {
  const objects: THREE.Object3D[] = [];

  function add(obj: THREE.Object3D) { scene.add(obj); objects.push(obj); return obj; }

  // Main tower shaft going down
  const towerMat = new THREE.MeshLambertMaterial({ color: 0x252d3d });
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x4488aa, transparent: true, opacity: 0.5 });
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x334455 });

  // Core structure (visible below rooftop)
  const core = new THREE.Mesh(new THREE.BoxGeometry(24, 180, 20), towerMat);
  core.position.set(0, -90, 0);
  core.castShadow = true;
  add(core);

  // Glass facade panels
  const panelH = 4;
  for (let y = -170; y < -5; y += panelH + 0.3) {
    // Front face
    for (let col = 0; col < 4; col++) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(4.5, panelH), glassMat);
      panel.position.set(-6.75 + col * 5, y + panelH / 2, 10.05);
      add(panel);

      // Back face
      const panel2 = new THREE.Mesh(new THREE.PlaneGeometry(4.5, panelH), glassMat);
      panel2.position.set(-6.75 + col * 5, y + panelH / 2, -10.05);
      panel2.rotation.y = Math.PI;
      add(panel2);
    }

    // Horizontal frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.25, 0.1), frameMat);
    frame.position.set(0, y, 10.1);
    add(frame);

    const frame2 = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.25, 0.1), frameMat);
    frame2.position.set(0, y, -10.1);
    add(frame2);
  }

  // Vertical frames
  for (let col = 0; col <= 4; col++) {
    const vframe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 180, 0.1), frameMat);
    vframe.position.set(-12 + col * 6, -90, 10.1);
    add(vframe);

    const vframe2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 180, 0.1), frameMat);
    vframe2.position.set(-12 + col * 6, -90, -10.1);
    add(vframe2);
  }

  // Side panels
  for (let y = -170; y < -5; y += panelH + 0.3) {
    for (let col = 0; col < 2; col++) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(6, panelH), glassMat);
      panel.position.set(12.05, y + panelH / 2, -6 + col * 8);
      panel.rotation.y = -Math.PI / 2;
      add(panel);

      const panel2 = new THREE.Mesh(new THREE.PlaneGeometry(6, panelH), glassMat);
      panel2.position.set(-12.05, y + panelH / 2, -6 + col * 8);
      panel2.rotation.y = Math.PI / 2;
      add(panel2);
    }
  }

  return objects;
}
