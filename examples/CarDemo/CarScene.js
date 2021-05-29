import * as THREE from '../../build/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { RoomEnvironment } from '../jsm/environments/RoomEnvironment.js';
import {Sky} from "../jsm/objects/Sky.js";

var CarScene = function (domElement) {
	var scope = this;
	this.scene = new THREE.Scene();
	this.scene.background = new THREE.Color(0xcce0ff);
	this.scene.fog = new THREE.Fog( 0xcce0ff, 60, 100 );
	this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
	// Move the camera to 0,0,-5 (the Y axis is "up")
	this.camera.position.set(0, 0, 20);

	// Point the camera to look at 0,0,0
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));

	// lights

	this.scene.add( new THREE.AmbientLight( 0x666666 ) );

	const light = new THREE.DirectionalLight( 0xdfebff, 1 );
	light.position.set( 50, 100, 200 );
	light.position.multiplyScalar( 1.3 );

	light.castShadow = true;

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	const d = 300;

	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;

	light.shadow.camera.far = 1000;

	this.scene.add( light );

	// Creates the renderer with size 1280x720
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.outputEncoding = THREE.sRGBEncoding;
	this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
	this.renderer.toneMappingExposure = 0.85;

	// 渲染前刷新元素信息
	this.updateView = function() {};
	this.renderer.setAnimationLoop(function() {
		scope.updateView();
		scope.renderer.render(scope.scene, scope.camera);
	});
	domElement.appendChild(this.renderer.domElement);

	const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
	this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

	// this.sky = new Sky();
	// this.sky.scale.setScalar( 450000 );
	// this.scene.add( this.sky );
	// const uniforms = this.sky.material.uniforms;
	// let sun = new THREE.Vector3();
	//
	// // uniforms[ 'turbidity' ].value = 10;
	// // uniforms[ 'rayleigh' ].value = 3;
	// // uniforms[ 'mieCoefficient' ].value = 0.005;
	// // uniforms['mieDirectionalG'].value = 0.7;
	// uniforms['up'].value = new THREE.Vector3(0, 0, 1);
	//
	// const phi = THREE.MathUtils.degToRad( 2 );
	// const theta = THREE.MathUtils.degToRad( 0 );
	// sun.setFromSphericalCoords( 1, phi, theta );
	// uniforms[ 'sunPosition' ].value.copy( sun );

	// ground
	// const groundTexture = new THREE.TextureLoader().load( 'textures/terrain/grasslight-big.jpg' );
	// groundTexture.repeat.set( 2500, 2500 );
	const groundTexture = new THREE.TextureLoader().load( 'CarDemo/textures/cement.png' );
	groundTexture.repeat.set( 25000, 25000 );
	groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
	groundTexture.anisotropy = 16;
	groundTexture.encoding = THREE.sRGBEncoding;

	const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

	let mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000 ), groundMaterial );
	mesh.receiveShadow = true;
	mesh.position.z = -0.1;
	this.scene.add( mesh );

	const controls = new OrbitControls(this.camera, this.renderer.domElement);
	controls.target.set(0, 0.5, 0);
	controls.update();

	var onWindowResize = function() {
		scope.camera.aspect = window.innerWidth / window.innerHeight;
		scope.camera.updateProjectionMatrix();

		scope.renderer.setSize(window.innerWidth, window.innerHeight);
	};
	window.addEventListener('resize', onWindowResize);
}
CarScene.prototype.constructor = CarScene;

export { CarScene };
