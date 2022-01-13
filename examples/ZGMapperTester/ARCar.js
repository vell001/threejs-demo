import * as THREE from '../../build/three.module.js';

import {GLTFLoader} from '../jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from '../jsm/loaders/DRACOLoader.js';

var ARCar = function (param) {
	var scope = this;

	THREE.Object3D.call(this);
	const shadow = new THREE.TextureLoader().load('./models/gltf/ferrari_ao.png');

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('./js/libs/draco/gltf/');

	const loader = new GLTFLoader();
	loader.setDRACOLoader(dracoLoader);

	const bodyMaterial = new THREE.MeshPhysicalMaterial({
		color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
	});

	const detailsMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff, metalness: 1.0, roughness: 0.5
	});

	const glassMaterial = new THREE.MeshPhysicalMaterial({
		color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true
	});
	this.carModel = undefined;
	this.wheels = undefined;
	loader.load('./models/gltf/ferrari.glb', function (gltf) {

		var carModel = gltf.scene.children[0];

		carModel.getObjectByName('body').material = bodyMaterial;

		carModel.getObjectByName('rim_fl').material = detailsMaterial;
		carModel.getObjectByName('rim_fr').material = detailsMaterial;
		carModel.getObjectByName('rim_rr').material = detailsMaterial;
		carModel.getObjectByName('rim_rl').material = detailsMaterial;
		carModel.getObjectByName('trim').material = detailsMaterial;

		carModel.getObjectByName('glass').material = glassMaterial;
		scope.carModel = carModel;
		scope.wheels = [
			carModel.getObjectByName('wheel_fl'),
			carModel.getObjectByName('wheel_fr'),
			carModel.getObjectByName('wheel_rl'),
			carModel.getObjectByName('wheel_rr')
		];

		carModel.getObjectByName('body').onBeforeRender = function () {
			scope.onBeforeRender(scope);
		}

		// shadow
		let mesh = new THREE.Mesh(
			// new THREE.BoxGeometry(2,5, 1),
			new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
			new THREE.MeshBasicMaterial({
				map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
			})
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.renderOrder = 2;
		carModel.add(mesh);
		carModel.rotation.x = Math.PI / 2;
		carModel.position.z = 0.1
		scope.add(carModel);

		scope.lr = scope.wheels[0].position.distanceTo(scope.wheels[2].position) / 2; // 中心点到后轴距离
		scope.lf = scope.wheels[0].position.distanceTo(scope.wheels[2].position) / 2; // 中心点到前轴距离
	});

	this.lr = 2.5; // 中心点到后轴距离
	this.lf = 2.5; // 中心点到前轴距离
	this.speed = 0; // m/s
	this.wheelYaw = 0; // rad
	this.carYaw = 0; // rad
	this.wheelDiameter = 0.4;
	this.lastRenderTimeSec = -1;
	this.lastWheelRotAngle = 0;
	this.baseQuaternion = null;
	this.upAxis = new THREE.Vector3(0,0,1);
	this.forwardAxis = new THREE.Vector3(0,1,0);
	this.rightAxis = new THREE.Vector3(1,0,0);
	this.onBeforeRender = function(car) {};
	// 用于碰撞检测
	this.physicalVertices = [
		new THREE.Vector3(1,2.3,0.1),
		new THREE.Vector3(-1,2.3,0.1),
		new THREE.Vector3(1,-2.3,0.1),
		new THREE.Vector3(-1,-2.3,0.1),
		new THREE.Vector3(1,2.3,-0.1),
		new THREE.Vector3(-1,2.3,-0.1),
		new THREE.Vector3(1,-2.3,-0.1),
		new THREE.Vector3(-1,-2.3,-0.1)
	];
	this.physicalPolygon = [
		new THREE.Vector3(1,-2.2,0),
		new THREE.Vector3(-1,-2.2,0),
		new THREE.Vector3(-1,2.2,0),
		new THREE.Vector3(1,2.2,0)
	];

}
THREE.Object3D.prototype.rotateAroundWorldAxis = function () {

	// rotate object around axis in world space (the axis passes through point)
	// axis is assumed to be normalized
	// assumes object does not have a rotated parent

	let q = new THREE.Quaternion();

	return function rotateAroundWorldAxis(axis, angle) {


		q.setFromAxisAngle(axis, angle);

		this.applyQuaternion(q);
		return this;

	}

}();
ARCar.prototype = Object.create(THREE.Object3D.prototype);
ARCar.prototype.constructor = ARCar;
export {ARCar};
