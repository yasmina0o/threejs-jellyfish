import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Fond bleu clair océan

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Ajuster la scène au redimensionnement de la fenêtre
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x333333));

const clock = new THREE.Clock();

// Chargement des shaders
async function loadShader(url) {
  const res = await fetch(url);
  return await res.text();
}

const vertexShader = await loadShader('/src/shaders/jellyfish.vert');
const fragmentShader = await loadShader('/src/shaders/jellyfish.frag');

const loader = new GLTFLoader();
const jellyfishes = [];

loader.load('models/Jellyfish.glb', gltf => {
  for (let i = 0; i < 10; i++) {
  const jellyfish = gltf.scene.clone(true);

  // Random position
  const x = (Math.random() - 0.5) * 400;
  const y = -100 + Math.random() * 15;
  const z = (Math.random() - 0.5) * 700;

  // Distance from camera for scaling logic
  const distanceFromCamera = Math.sqrt(x * x + z * z);
  const scaleFactor = THREE.MathUtils.clamp(1.5 - distanceFromCamera / 120, 0.1, 0.4);

  jellyfish.userData.baseY = y;
  jellyfish.userData.speed = 0.5 + Math.random();
  jellyfish.userData.phase = Math.random() * Math.PI * 2;

  jellyfish.traverse(obj => {
    if (obj.isMesh) {
      let baseColor = new THREE.Color(0xffffff);
      if (obj.name.includes('Mesh_2')) {
        baseColor = new THREE.Color(0xff00ff); // pink
      } else if (obj.name.includes('Mesh_1')) {
        baseColor = new THREE.Color(0x00ffff); // cyan
      } else {
        baseColor = new THREE.Color(0xffff00); // yellow
      }

      const meshUniforms = {
        uTime: { value: 0.0 },
        lightDirection: { value: new THREE.Vector3(1, 1, 1) },
        uColor: { value: baseColor }
      };

      obj.material = new THREE.ShaderMaterial({
        uniforms: meshUniforms,
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide
      });

      obj.material.needsUpdate = true;
    }
  });

  jellyfish.position.set(x, y, z);
  jellyfish.scale.set(scaleFactor, scaleFactor, scaleFactor);

  scene.add(jellyfish);
  jellyfishes.push(jellyfish);
}

});

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  for (const jelly of jellyfishes) {
    // Mise à jour shader
    jelly.traverse(obj => {
      if (obj.isMesh && obj.material.uniforms && obj.material.uniforms.uTime) {
        obj.material.uniforms.uTime.value = elapsed;
      }
    });

    // Flottement vertical sinusoïdal
    const speed = jelly.userData.speed || 1;
    const phase = jelly.userData.phase || 0;
    jelly.position.y = jelly.userData.baseY + Math.sin(elapsed * speed + phase) * 0.8;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
