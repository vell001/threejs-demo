import * as THREE from '../../build/three.module.js';
import {DataCenter} from "./DataCenter.js";
import {CarController} from "./CarController.js";
import {saveAs} from "./FileSaver.js";
import {ColladaExporter} from "../jsm/exporters/ColladaExporter.js";
import {GLTFExporter} from "../jsm/exporters/GLTFExporter.js";

let dataCenter = DataCenter.getInstance();
let cameraYawAngle = Math.PI, cameraPitchAngle = Math.PI / 6, cameraDistance = 20;

function init() {
	dataCenter.init();
	// CarController.getInstance().init(dataCenter.car);
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
	// dataCenter.scene.add(dataCenter.car);
	// dataCenter.car.baseQuaternion = dataCenter.car.quaternion.clone();
	// loadMapData();

	// 处理视角
	let startX, startY, distanceX, distanceY, isDown, startYaw, startPitch, isDouble, startDistanceDouble,
		startCameraDistance, distanceDouble;
	let domDocument = dataCenter.carScene.domElement;
	domDocument.addEventListener("touchstart", function (event) {
		if (event.targetTouches.length >= 2) {
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
		if (!isDown) {
			return;
		}
		if (isDouble) {
			if (event.targetTouches.length < 2) {
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
	document.getElementById("load_map_data").addEventListener('change', function () {
		if (this.files.length === 0) {
			console.log("no file selected");
			return;
		}
		const reader = new FileReader();
		reader.onload = function () {
			let json = JSON.parse(reader.result);
			console.log("load_map_data", json);
			let ref_gps_pos = document.getElementById("ref_gps_pos").value;
			let originPos = null;
			try {
				if (ref_gps_pos) {
					let pt = turf.point(JSON.parse(ref_gps_pos));
					originPos = turf.toMercator(pt);
				}
			} catch (e) {
				console.log(e);
				alert("原点坐标格式不对，默认使用数据第一个坐标点作为原点");
			}
			console.log("originPos: ", originPos);
			DataCenter.getInstance().updateZGMapData(json, originPos);
		}
		reader.readAsText(this.files[0]);
	});
	document.getElementById("clear_scene").onclick = function () {
		DataCenter.getInstance().clearScene();
	}
	document.getElementById("export_scene").onclick = function () {

		// const exporter = new GLTFExporter();
		// exporter.parse(dataCenter.scene, function (gltf) {
		// 	console.log(gltf);
		// 	let file = new File([JSON.stringify(gltf)], {type: "text/plain;charset=utf-8"});
		// 	saveAs(file, "ReverseParking1.gltf");
		// }, {});
// Form the file content based on the mesh
// and geometry within
		const exporter = new ColladaExporter();
		let {data, textures} = exporter.parse(dataCenter.scene);
		let file = new File([data], {type: "text/plain;charset=utf-8"});
		saveAs(file, new Date().Format("yyyy-MM-dd_HH-mm-ss") + ".dae");

// save the files!
// 	const exporter = new ColladaExporter();
// 	let { data, textures } = exporter.parse(dataCenter.scene);
// 	const zip = new JSZip();
// 	zip.file( 'myCollada.dae', data );
// 	textures.forEach( tex => zip.file( `${ tex.directory }${ tex.name }.${ tex.ext }`, tex.data ) );
// 	zip.generateAsync({type:"blob"})
// 		.then(function(content) {
// 			// see FileSaver.js
// 			saveAs(content, "demo.zip");
// 		});

// 	const exporter = new PLYExporter();
// 	const data = exporter.parse( this.scene, { } );
// 	let file = new File([data], "demo.ply", {  })
// 	saveAs(file);
	}
}

function loadMapData() {
	let url = "ZGMapperTester/粤海附近_倒车入库20211019115048.json";
	let request = new XMLHttpRequest();
	request.open("get", url);
	request.send(null);
	request.onload = function () {
		if (request.status === 200) {
			let json = JSON.parse(request.responseText);
			console.log(json);
			DataCenter.getInstance().updateZGMapData(json, null);
		}
	}
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function render() {
	/*
	// 相机跟随
	let backV = dataCenter.car.forwardAxis.clone();
	backV.applyAxisAngle(dataCenter.car.rightAxis, cameraPitchAngle);
	backV.applyAxisAngle(dataCenter.car.upAxis, cameraYawAngle);
	backV.multiplyScalar(cameraDistance);
	backV.applyQuaternion(dataCenter.car.quaternion);

	dataCenter.carScene.camera.position.copy(dataCenter.car.position.clone().add(backV));
	dataCenter.carScene.camera.up.copy(dataCenter.car.upAxis);
	dataCenter.carScene.camera.lookAt(dataCenter.car.position);

	// dataCenter.carScene.controls.update();

	// 处理后视镜位置
	let rearViewPosLeft = new THREE.Vector3(-1.1, 0.4, 1);
	let rearViewLookAtLeft = rearViewPosLeft.clone().add(new THREE.Vector3(-0.2, -1, -0.05)).applyQuaternion(dataCenter.car.quaternion);
	rearViewPosLeft.applyQuaternion(dataCenter.car.quaternion);
	dataCenter.carScene.rearviewCameraLeft.position.copy(dataCenter.car.position.clone().add(rearViewPosLeft));
	dataCenter.carScene.rearviewCameraLeft.lookAt(dataCenter.car.position.clone().add(rearViewLookAtLeft));
	dataCenter.carScene.rearviewCameraLeft.up.copy(dataCenter.car.upAxis);


	let rearViewPosRight = new THREE.Vector3(1.1, 0.4, 1);
	let rearViewLookAtRight = rearViewPosRight.clone().add(new THREE.Vector3(0.2, -1, -0.05)).applyQuaternion(dataCenter.car.quaternion);
	rearViewPosRight.applyQuaternion(dataCenter.car.quaternion);
	dataCenter.carScene.rearviewCameraRight.position.copy(dataCenter.car.position.clone().add(rearViewPosRight));
	dataCenter.carScene.rearviewCameraRight.lookAt(dataCenter.car.position.clone().add(rearViewLookAtRight));
	dataCenter.carScene.rearviewCameraRight.up.copy(dataCenter.car.upAxis);
*/


	// Raycaster碰撞检测
	// let movingCube = dataCenter.car;
	// if (movingCube != null && dataCenter.mapObjectMeshs != null) {
	// 	let originPoint = dataCenter.car.position.clone();
	// 	let vertices = dataCenter.car.physicalVertices;
	// 	for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
	// 		// 顶点原始坐标
	// 		let localVertex = vertices[vertexIndex].clone();
	// 		// 顶点经过变换后的坐标
	// 		let globalVertex = localVertex.applyMatrix4(movingCube.matrix);
	// 		// 获得由中心指向顶点的向量
	// 		let directionVector = globalVertex.sub(movingCube.position);
	//
	// 		// 将方向向量初始化,并发射光线
	// 		let ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
	// 		// 检测射线与多个物体的相交情况
	// 		// 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false
	// 		let collisionResults = ray.intersectObjects(dataCenter.mapObjectMeshs, true);
	// 		// 如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生了碰撞
	// 		if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
	// 			console.log("crashed!!!", collisionResults);
	// 		}
	// 	}
	// }

	// turf碰撞检测
	let movingCube = dataCenter.car;
	if (movingCube != null && dataCenter.mapGeoJson != null) {
		let vertices = dataCenter.car.physicalPolygon;
		let transVertexes = []
		for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
			// 顶点原始坐标
			let localVertex = vertices[vertexIndex].clone();
			// 顶点经过变换后的坐标
			let globalVertex = localVertex.applyMatrix4(movingCube.matrixWorld);
			transVertexes.push([globalVertex.x, globalVertex.y]);
		}
		transVertexes.push(transVertexes[0]);
		let crashed = false;
		for (let feature of dataCenter.mapGeoJson.features) {
			if (turf.booleanOverlap(turf.polygon([transVertexes]), feature)) {
				crashed = true;
				break;
			}
		}

		document.getElementById("warning").style.display = (crashed ? "" : "none");
	}
}

// When the page has loaded, run init();
window.onload = init;
