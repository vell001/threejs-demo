import * as THREE from '../../build/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { RoomEnvironment } from '../jsm/environments/RoomEnvironment.js';

var ARDebugScene = function (domElement) {
    var scope = this;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Move the camera to 0,0,-5 (the Y axis is "up")
    this.camera.position.set(5, 5, -10);

    // Point the camera to look at 0,0,0
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Creates the renderer with size 1280x720
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;

    // 渲染前刷新元素信息
    this.updateView = function() {};
    var render = function() {
        scope.updateView();
        scope.renderer.render(scope.scene, scope.camera);
    }
    this.renderer.setAnimationLoop(render);
    // Puts the "canvas" into our HTML page.
    domElement.appendChild(this.renderer.domElement);
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

    var controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();

    var onWindowResize = function() {
        scope.camera.aspect = window.innerWidth / window.innerHeight;
        scope.camera.updateProjectionMatrix();

        scope.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);
}
ARDebugScene.prototype.constructor = ARDebugScene;

export { ARDebugScene };