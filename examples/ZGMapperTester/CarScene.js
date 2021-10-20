import * as THREE from '../../build/three.module.js';
import {OrbitControls} from '../jsm/controls/OrbitControls.js';
import {RoomEnvironment} from '../jsm/environments/RoomEnvironment.js';
import {Sky} from "../jsm/objects/Sky.js";

var CarScene = function (domElement) {
	var scope = this;
	this.domElement = domElement;
	this.scene = new THREE.Scene();
	this.scene.background = new THREE.Color(0x3E3E3E);
	// this.scene.fog = new THREE.Fog( 0xcce0ff, 60, 10000 );
	this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
	// Move the camera to 0,0,-5 (the Y axis is "up")
	this.camera.position.set(0, 0, 200);

	// Point the camera to look at 0,0,0
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));

	// lights

	this.scene.add(new THREE.AmbientLight(0xFFFFFF));

	const light = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(50, 100, 200);
	light.position.multiplyScalar(1.3);

	light.castShadow = true;

	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	const d = 300;

	light.shadow.camera.left = -d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = -d;

	light.shadow.camera.far = 10000;

	this.scene.add(light);

	// Creates the renderer with size 1280x720
	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(window.innerWidth, window.innerHeight);
	this.renderer.outputEncoding = THREE.sRGBEncoding;
	this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
	this.renderer.toneMappingExposure = 0.85;

	this.rearviewDomLeft = document.getElementById("rearview_left");
	this.rearviewDomRight = document.getElementById("rearview_right");
	if (this.rearviewDomLeft) {
		this.rearviewCameraLeft = new THREE.PerspectiveCamera(60, this.rearviewDomLeft.clientWidth / this.rearviewDomLeft.clientHeight, 0.1, 1000);
		this.rearviewCameraRight = new THREE.PerspectiveCamera(60, this.rearviewDomRight.clientWidth / this.rearviewDomRight.clientHeight, 0.1, 1000);

		this.rearviewRendererLeft = new THREE.WebGLRenderer({antialias: true});
		this.rearviewRendererLeft.setPixelRatio(window.devicePixelRatio);
		this.rearviewRendererLeft.outputEncoding = THREE.sRGBEncoding;
		this.rearviewRendererLeft.toneMapping = THREE.ACESFilmicToneMapping;
		this.rearviewRendererLeft.toneMappingExposure = 0.85;

		this.rearviewRendererRight = new THREE.WebGLRenderer({antialias: true});
		this.rearviewRendererRight.setPixelRatio(window.devicePixelRatio);
		this.rearviewRendererRight.outputEncoding = THREE.sRGBEncoding;
		this.rearviewRendererRight.toneMapping = THREE.ACESFilmicToneMapping;
		this.rearviewRendererRight.toneMappingExposure = 0.85;

		this.rearviewRendererLeft.setSize(this.rearviewDomLeft.clientWidth, this.rearviewDomLeft.clientHeight);
		this.rearviewRendererRight.setSize(this.rearviewDomRight.clientWidth, this.rearviewDomRight.clientHeight);
		this.rearviewRendererLeft.setAnimationLoop(function () {
			scope.rearviewRendererLeft.render(scope.scene, scope.rearviewCameraLeft);
		});
		this.rearviewRendererRight.setAnimationLoop(function () {
			scope.rearviewRendererRight.render(scope.scene, scope.rearviewCameraRight);
		});
		this.rearviewDomLeft.appendChild(this.rearviewRendererLeft.domElement);
		this.rearviewDomRight.appendChild(this.rearviewRendererRight.domElement);
	}
	// 渲染前刷新元素信息
	this.updateView = function () {
	};
	this.renderer.setAnimationLoop(function () {
		scope.updateView();
		scope.renderer.render(scope.scene, scope.camera);
	});

	domElement.appendChild(this.renderer.domElement);

	const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
	this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

	var controls = new OrbitControls(this.camera, this.renderer.domElement);
	controls.target.set(0, 0.5, 0);
	controls.update();

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
	// var groundTexture = new THREE.Texture();
	// var imgLoader = new THREE.ImageLoader();
	// imgLoader.load('ZGMapperTester/textures/cement2.png',function(img)
	// {
	// 	//将图片值赋于纹理
	// 	groundTexture.image = img;
	// 	groundTexture.needsUpdate = true;
	// 	groundTexture.repeat.set( 10000, 10000 );
	// 	groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
	// 	groundTexture.anisotropy = 16;
	// 	groundTexture.encoding = THREE.sRGBEncoding;
	//
	// 	const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture ,
	// 		side: THREE.DoubleSide,
	// 	} );
	//
	// 	let mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000 ), groundMaterial );
	// 	mesh.receiveShadow = true;
	// 	mesh.position.z = -0.01;
	// 	scope.scene.add( mesh );
	// });


	// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	// this.controls.target.set(0, 0.5, 0);
	// this.controls.update();

	var onWindowResize = function () {
		scope.camera.aspect = window.innerWidth / window.innerHeight;
		scope.camera.updateProjectionMatrix();

		scope.renderer.setSize(window.innerWidth, window.innerHeight);

		if (scope.rearviewDomLeft) {
			scope.rearviewCameraLeft.aspect = scope.rearviewDomLeft.clientWidth / scope.rearviewDomLeft.clientHeight;
			scope.rearviewCameraLeft.updateProjectionMatrix();
			scope.rearviewCameraRight.aspect = scope.rearviewDomRight.clientWidth / scope.rearviewDomRight.clientHeight;
			scope.rearviewCameraRight.updateProjectionMatrix();
			scope.rearviewRendererLeft.setSize(scope.rearviewDomLeft.clientWidth, scope.rearviewDomLeft.clientHeight);
			scope.rearviewRendererRight.setSize(scope.rearviewDomRight.clientWidth, scope.rearviewDomRight.clientHeight);
		}
	};
	window.addEventListener('resize', onWindowResize);
}
CarScene.prototype.constructor = CarScene;

export {CarScene};
