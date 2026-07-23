const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508); // Dark background
scene.fog = new THREE.Fog(0x000000, 5, 25);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2.5, 1.8, 2.5); // Standard starting position

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3329, roughness: 0.8 });
const laptopMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.5, metalness: 0.7 });

const codeScreenGlowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x39ff14, 
    emissive: 0x39ff14, 
    emissiveIntensity: 1.5 
});

const phoneScreenMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xddf0ff, 
    emissive: 0xddf0ff, 
    emissiveIntensity: 0.5 
});
const phoneBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
const energyCanMaterial = new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.3 });
const book1CoverMaterial = new THREE.MeshStandardMaterial({ color: 0x1a365d });
const book2CoverMaterial = new THREE.MeshStandardMaterial({ color: 0x742a2a });
const bookPagesMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

const deskGeo = new THREE.BoxGeometry(4, 0.1, 2.5);
const deskMesh = new THREE.Mesh(deskGeo, deskMaterial);
deskMesh.position.y = -0.05;
deskMesh.receiveShadow = true;
scene.add(deskMesh);

const lapBaseGeo = new THREE.BoxGeometry(1.4, 0.03, 0.95);
const laptopBaseMesh = new THREE.Mesh(lapBaseGeo, laptopMetalMaterial);
laptopBaseMesh.position.set(0.1, 0.015, 0.1); 
laptopBaseMesh.rotation.y = 0.1; 
laptopBaseMesh.castShadow = true;
laptopBaseMesh.receiveShadow = true;
scene.add(laptopBaseMesh);

const lapLidGeo = new THREE.BoxGeometry(1.4, 0.85, 0.02);
const laptopLidMesh = new THREE.Mesh(lapLidGeo, laptopMetalMaterial);
laptopLidMesh.position.set(0.08, 0.43, -0.34);
laptopLidMesh.rotation.y = 0.1; 
laptopLidMesh.rotation.x = -0.3; 
laptopLidMesh.castShadow = true;
scene.add(laptopLidMesh);

const codeScreenGeo = new THREE.BoxGeometry(1.34, 0.8, 0.005);
const laptopScreenMesh = new THREE.Mesh(codeScreenGeo, codeScreenGlowMaterial);
laptopScreenMesh.position.set(0.08, 0.43, -0.33); 
laptopScreenMesh.rotation.y = 0.1;
laptopScreenMesh.rotation.x = -0.3;
scene.add(laptopScreenMesh);

const canGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.24, 16);
const energyCanMesh = new THREE.Mesh(canGeo, energyCanMaterial);
energyCanMesh.position.set(0.95, 0.12, 0.35);
energyCanMesh.castShadow = true;
energyCanMesh.receiveShadow = true;
scene.add(energyCanMesh);

const book1CoverGeo = new THREE.BoxGeometry(0.5, 0.07, 0.65);
const book1Cover = new THREE.Mesh(book1CoverGeo, book1CoverMaterial);
book1Cover.position.set(-0.95, 0.035, -0.2);
book1Cover.rotation.y = -0.5; 
book1Cover.castShadow = true;
book1Cover.receiveShadow = true;
scene.add(book1Cover);

const book1PagesGeo = new THREE.BoxGeometry(0.47, 0.06, 0.62);
const book1Pages = new THREE.Mesh(book1PagesGeo, bookPagesMaterial);
book1Pages.position.set(-0.94, 0.035, -0.2); 
book1Pages.rotation.y = -0.5;
scene.add(book1Pages);

const book2Cover = new THREE.Mesh(book1CoverGeo, book2CoverMaterial);
book2Cover.position.set(-0.9, 0.105, -0.15); 
book2Cover.rotation.y = 0.3; 
book2Cover.castShadow = true;
book2Cover.receiveShadow = true;
scene.add(book2Cover);

const book2Pages = new THREE.Mesh(book1PagesGeo, bookPagesMaterial);
book2Pages.position.set(-0.9, 0.105, -0.15);
book2Pages.rotation.y = 0.3;
scene.add(book2Pages);

const phoneBodyGeo = new THREE.BoxGeometry(0.24, 0.01, 0.48);
const phoneBodyMesh = new THREE.Mesh(phoneBodyGeo, phoneBodyMaterial);
phoneBodyMesh.position.set(-0.8, 0.005, 0.4); 
phoneBodyMesh.rotation.y = 0.4;
phoneBodyMesh.castShadow = true;
scene.add(phoneBodyMesh);

const phoneScreenGeo = new THREE.BoxGeometry(0.22, 0.002, 0.46);
const phoneScreenMesh = new THREE.Mesh(phoneScreenGeo, phoneScreenMaterial);
phoneScreenMesh.position.set(-0.8, 0.011, 0.4); 
phoneScreenMesh.rotation.y = 0.4;
scene.add(phoneScreenMesh);

const DirectionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
DirectionalLight.position.set(2, 5, 1);
DirectionalLight.castShadow = true;
scene.add(DirectionalLight);

const ambientLight = new THREE.AmbientLight(0x111122, 0.4); 
scene.add(ambientLight);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();