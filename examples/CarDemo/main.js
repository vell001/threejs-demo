import * as THREE from '../../build/three.module.js';
import {DataCenter} from "./DataCenter.js";
import {CarController} from "./CarController.js";

let dataCenter = DataCenter.getInstance();
let cameraYawAngle = Math.PI, cameraPitchAngle = Math.PI / 6, cameraDistance = 20;
function init() {
	dataCenter.init();
	CarController.getInstance().init(dataCenter.car);
	dataCenter.carScene.updateView = render;

	// materials
	const bodyMaterial = new THREE.MeshPhysicalMaterial({
		color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05
	});

	const detailsMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff, metalness: 1.0, roughness: 0.5
	});

	const glassMaterial = new THREE.MeshPhysicalMaterial({
		color: 0xffffff, metalness: 0, roughness: 0.1, transmission: 0.9, transparent: true
	});

	// Car
	dataCenter.scene.add(dataCenter.car);
	dataCenter.car.baseQuaternion = dataCenter.car.quaternion.clone();
	loadMapData();

	// 处理视角
	let startX,startY,distanceX,distanceY,isDown,startYaw,startPitch,isDouble,startDistanceDouble,startCameraDistance,distanceDouble;
	let domDocument = dataCenter.carScene.domElement;
	domDocument.addEventListener("touchstart", function (event) {
		if(event.targetTouches.length>=2) {
			isDouble = true;
			startCameraDistance = cameraDistance;
			startDistanceDouble = Math.sqrt(
				Math.pow(event.targetTouches[0].clientX - event.targetTouches[1].clientX, 2)
				+ Math.pow(event.targetTouches[0].clientY - event.targetTouches[1].clientY, 2));
		} else {
			startY = event.targetTouches[0].clientY;
			startX = event.targetTouches[0].clientX;
			startYaw = cameraYawAngle;
			startPitch = cameraPitchAngle;
		}
		isDown = true;
		event.preventDefault();
		event.stopPropagation();
	});
	domDocument.addEventListener("touchmove", function (event) {
		if(!isDown) {
			return;
		}
		if (isDouble) {
			if (event.targetTouches.length<2) {
				isDown = false;
				isDouble = false;
				return;
			}
			distanceDouble = Math.sqrt(
				Math.pow(event.targetTouches[0].clientX - event.targetTouches[1].clientX, 2)
				+ Math.pow(event.targetTouches[0].clientY - event.targetTouches[1].clientY, 2));
			cameraDistance = startCameraDistance - (distanceDouble - startDistanceDouble) / 10;
		} else {
			distanceY = event.targetTouches[0].clientY - startY;
			distanceX = event.targetTouches[0].clientX - startX;
			cameraYawAngle = startYaw - distanceX / 1000 * Math.PI;
			cameraPitchAngle = startPitch + distanceY / 1000 * Math.PI;
		}
		event.preventDefault();
		event.stopPropagation();
	});
	domDocument.addEventListener("touchend", function (event) {
		isDown = false;
		event.preventDefault();
		event.stopPropagation();
	});
}

function loadMapData() {
	let url = "CarDemo/map_test.geojson";
	let request = new XMLHttpRequest();
	request.open("get", url);
	request.send(null);
	request.onload = function () {
		if (request.status === 200) {
			let json = JSON.parse(request.responseText);
			console.log(json);
			DataCenter.getInstance().updateMapData(json);
		}
	}
}


function render() {
	// 相机跟随
	let backV = dataCenter.car.forwardAxis.clone();
	backV.applyAxisAngle(dataCenter.car.rightAxis, cameraPitchAngle);
	backV.applyAxisAngle(dataCenter.car.upAxis, cameraYawAngle);
	backV.multiplyScalar(cameraDistance);
	backV.applyQuaternion(dataCenter.car.quaternion);

	dataCenter.carScene.camera.position.copy(dataCenter.car.position.clone().add(backV));
	dataCenter.carScene.camera.up.copy( dataCenter.car.upAxis);
	dataCenter.carScene.camera.lookAt(dataCenter.car.position);

	// dataCenter.carScene.controls.update();

	// 处理后视镜位置
	let rearViewPosLeft = new THREE.Vector3(-1.1,0.4,1);
	let rearViewLookAtLeft = rearViewPosLeft.clone().add(new THREE.Vector3(-0.2,-1,-0.05)).applyQuaternion(dataCenter.car.quaternion);
	rearViewPosLeft.applyQuaternion(dataCenter.car.quaternion);
	dataCenter.carScene.rearviewCameraLeft.position.copy(dataCenter.car.position.clone().add(rearViewPosLeft));
	dataCenter.carScene.rearviewCameraLeft.lookAt(dataCenter.car.position.clone().add(rearViewLookAtLeft));
	dataCenter.carScene.rearviewCameraLeft.up.copy( dataCenter.car.upAxis);


	let rearViewPosRight = new THREE.Vector3(1.1,0.4,1);
	let rearViewLookAtRight = rearViewPosRight.clone().add(new THREE.Vector3(0.2,-1,-0.05)).applyQuaternion(dataCenter.car.quaternion);
	rearViewPosRight.applyQuaternion(dataCenter.car.quaternion);
	dataCenter.carScene.rearviewCameraRight.position.copy(dataCenter.car.position.clone().add(rearViewPosRight));
	dataCenter.carScene.rearviewCameraRight.lookAt(dataCenter.car.position.clone().add(rearViewLookAtRight));
	dataCenter.carScene.rearviewCameraRight.up.copy( dataCenter.car.upAxis);
}

// When the page has loaded, run init();
window.onload = init;
