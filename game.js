import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x021325, 0.012);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 2, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x9bd5ff, 1.2);
scene.add(ambient);

const point = new THREE.PointLight(0xb5f2ff, 2.5, 25, 2.1);
scene.add(point);

const world = {
  depth: 0,
  speed: 0.06,
  enemies: [],
  keys: new Set(),
  gameOver: false,
  score: 0,
};

const diver = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.6, 1.4, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0xffb16b, roughness: 0.55 })
);
body.rotation.z = Math.PI / 2;

const tank = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.65, 0.75),
  new THREE.MeshStandardMaterial({ color: 0x4a6178, metalness: 0.35, roughness: 0.6 })
);
tank.position.set(-0.15, 0.35, -0.2);

const visor = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 18, 18),
  new THREE.MeshStandardMaterial({ color: 0x80dbff, transparent: true, opacity: 0.65 })
);
visor.position.set(0.75, 0.25, 0);

const finL = new THREE.Mesh(
  new THREE.BoxGeometry(0.45, 0.1, 0.9),
  new THREE.MeshStandardMaterial({ color: 0x223040 })
);
finL.position.set(-1, -0.25, 0.3);

const finR = finL.clone();
finR.position.z = -0.3;

[body, tank, visor, finL, finR].forEach((part) => diver.add(part));
scene.add(diver);

const particles = new THREE.Group();
for (let i = 0; i < 260; i++) {
  const p = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xa6e8ff, transparent: true, opacity: 0.35 })
  );
  p.position.set((Math.random() - 0.5) * 50, Math.random() * 70 - 30, (Math.random() - 0.5) * 50);
  particles.add(p);
}
scene.add(particles);

function spawnEnemy() {
  const enemy = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 2.3, 7),
    new THREE.MeshStandardMaterial({ color: 0x11070d, emissive: 0x220012, roughness: 0.9 })
  );
  enemy.rotation.z = Math.PI / 2;
  enemy.position.set((Math.random() - 0.5) * 18, diver.position.y - 18 - Math.random() * 24, (Math.random() - 0.5) * 12);
  enemy.userData.speed = 0.018 + Math.random() * 0.03;
  scene.add(enemy);
  world.enemies.push(enemy);
}

for (let i = 0; i < 5; i++) spawnEnemy();

const depthEl = document.getElementById("depth");
const dangerEl = document.getElementById("danger");
const messageEl = document.getElementById("message");

window.addEventListener("keydown", (e) => {
  world.keys.add(e.key.toLowerCase());
  if (!world.gameOver) messageEl.style.opacity = "0";
});
window.addEventListener("keyup", (e) => world.keys.delete(e.key.toLowerCase()));

function updatePlayer() {
  const move = new THREE.Vector3();
  const speed = 0.16;

  if (world.keys.has("arrowleft") || world.keys.has("a")) move.x -= speed;
  if (world.keys.has("arrowright") || world.keys.has("d")) move.x += speed;
  if (world.keys.has("arrowup") || world.keys.has("w")) move.y += speed;
  if (world.keys.has("arrowdown") || world.keys.has("s")) move.y -= speed;

  diver.position.add(move);
  diver.position.x = THREE.MathUtils.clamp(diver.position.x, -9.5, 9.5);
  diver.position.y = THREE.MathUtils.clamp(diver.position.y, -Infinity, 6.5);

  world.depth += world.speed;
  diver.position.y -= world.speed;

  const swim = Math.sin(performance.now() * 0.01) * 0.1;
  finL.rotation.y = swim;
  finR.rotation.y = -swim;

  point.position.copy(diver.position).add(new THREE.Vector3(2, 0.5, 0));
  camera.position.x += (diver.position.x - camera.position.x) * 0.08;
  camera.position.y += (diver.position.y + 2 - camera.position.y) * 0.08;
  camera.lookAt(diver.position.x, diver.position.y, 0);
}

function updateDanger() {
  const t = THREE.MathUtils.clamp(world.depth / 240, 0, 1);
  const bg = new THREE.Color().lerpColors(new THREE.Color(0x4ecbff), new THREE.Color(0x020611), t);
  renderer.setClearColor(bg);

  ambient.intensity = THREE.MathUtils.lerp(1.2, 0.12, t);
  point.intensity = THREE.MathUtils.lerp(2.5, 0.5, t);
  point.distance = THREE.MathUtils.lerp(25, 8, t);
  scene.fog.density = THREE.MathUtils.lerp(0.012, 0.065, t);

  const enemyCount = 5 + Math.floor(world.depth / 35);
  while (world.enemies.length < enemyCount) spawnEnemy();

  let danger = "Calm";
  if (world.depth > 70) danger = "Uneasy";
  if (world.depth > 150) danger = "Threatening";
  if (world.depth > 230) danger = "Abyssal";

  depthEl.textContent = `Depth: ${Math.floor(world.depth)}m`;
  dangerEl.textContent = `Danger: ${danger}`;
}

function updateEnemies() {
  for (const enemy of world.enemies) {
    const direction = new THREE.Vector3().subVectors(diver.position, enemy.position).normalize();
    enemy.position.addScaledVector(direction, enemy.userData.speed);

    enemy.rotation.y = Math.atan2(direction.x, direction.z);
    enemy.rotation.z = -Math.PI / 2 + Math.sin(performance.now() * 0.002 + enemy.position.x) * 0.2;

    if (enemy.position.distanceTo(diver.position) < 1.1) {
      world.gameOver = true;
    }

    if (enemy.position.y > diver.position.y + 25) {
      enemy.position.set((Math.random() - 0.5) * 18, diver.position.y - 20 - Math.random() * 15, (Math.random() - 0.5) * 12);
    }
  }
}

function updateParticles() {
  particles.children.forEach((p) => {
    p.position.y += 0.03;
    if (p.position.y > diver.position.y + 30) {
      p.position.y = diver.position.y - 36;
      p.position.x = (Math.random() - 0.5) * 50;
    }
  });
}

function gameOverScreen() {
  messageEl.style.opacity = "1";
  messageEl.innerHTML = `<div><strong>You were pulled into the dark.</strong><br/>Final depth: ${Math.floor(
    world.depth
  )}m<br/>Refresh to dive again.</div>`;
}

function animate() {
  requestAnimationFrame(animate);

  if (!world.gameOver) {
    updatePlayer();
    updateDanger();
    updateEnemies();
    updateParticles();
  } else {
    gameOverScreen();
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
