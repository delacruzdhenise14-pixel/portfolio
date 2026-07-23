const scene = new THREE.Scene();
let robloxModel = null;
const backgroundTexture = new THREE.TextureLoader().load('bg.png');
scene.background = backgroundTexture;

const camera = new THREE.PerspectiveCamera(45 , window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true }); //pixel stuff
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(2,0,-3);
controls.update();
controls.minDistance = 2;
controls.maxDistance = 15;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Orbit controls ( Click,drag, scroll to zoom, right click to pan )
const ambientLight = new THREE.AmbientLight(0x221133, 1.5); 
scene.add(ambientLight);

//Lighting  
const directionalLight = new THREE.DirectionalLight(0xffff, 1.5); //intensity
directionalLight.position.set(5, 5, 4); //position of the light
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();
loader.load('sparks_-_roblox.glb', 
    function (gltf) {
    const roblox = gltf.scene;
    scene.add(roblox);

    // Model Transform
    roblox.position.set(2, 0, -3);
    roblox.rotation.set(0, Math.PI / 2, 0);
    roblox.scale.set(1.5, 1.5, 1.5);

    robloxModel = roblox;
    
    //Hide loading text after model is loaded
    document.getElementById('loading').style.display = 'none';

    const box = new THREE.Box3().setFromObject(roblox);    //axis-aligned bounding box (AABB) of the model
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
},
//Progress function
function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
},
//error function
function (error) {
    console.error('An error happened', error);
    document.getElementById('loading').innerText = 'Failed to load model. Please check the console (F12).';
    }
);

    // Window Resize Handling
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        if (robloxModel) {
            const elapsedTime = clock.getElapsedTime();

            const wiggle = Math.sin(elapsedTime * 10) * 0.1; // Calculate the vertical offset using a sine wave
            robloxModel.position.y = wiggle; // Apply the vertical offset to the model's position
        }

        renderer.render(scene, camera);
    }
    animate();