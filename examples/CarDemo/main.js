import * as THREE from '../../build/three.module.js';
import {DataCenter} from "./DataCenter.js";
import {CarController} from "./CarController.js";

let dataCenter = DataCenter.getInstance();

function init() {
	dataCenter.init();
	CarController.getInstance().init();
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
	dataCenter.car.rotation.x=Math.PI/2;
	loadMapData();
}

function loadMapData() {
	let url = "CarDemo/map_test.geojson";
	let request = new XMLHttpRequest();
	request.open("get",url);
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

}

// When the page has loaded, run init();
window.onload = init;
