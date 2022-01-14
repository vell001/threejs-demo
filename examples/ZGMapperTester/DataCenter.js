import * as THREE from '../../build/three.module.js';
import {ARCar} from "../ar_debug/ARCar.js";
import {CarScene} from "./CarScene.js";
import {PointSubToVector3} from "./CoordinateUtils.js";
import {saveAs} from "./FileSaver.js";
import {ColladaExporter} from "../jsm/exporters/ColladaExporter.js";
import {GLTFExporter} from "../jsm/exporters/GLTFExporter.js";

function DataCenter() {
	this.instance = null;
	this.originPos = null;
	this.originPosWgs84 = null;
	this.mercatorScalar = null;
	this.ignoreHeight = true;

	this.lineWidth = 0.15;
	this.lineWidthHalf = this.lineWidth / 2;
	this.lineHeight = 0.01;
}

DataCenter.prototype.genLineBoxMesh = function (v1, v2, width = 0.15) {
	let dist = v1.distanceTo(v2);
	let cubeGeometry = new THREE.BoxGeometry(width, this.lineHeight, dist);
	let mesh = new THREE.Mesh(cubeGeometry, this.materials[this.KEY_line_yellow]);
	let pos = (v1.add(v2)).divideScalar(2);
	mesh.up = new THREE.Vector3(0, 0, 1);
	mesh.position.set(pos.x, pos.y, pos.z);
	mesh.lookAt(v2);
	return mesh
}


DataCenter.prototype.genExtrudeLineMesh = function (v1, v2) {
	const linePoints = [];
	linePoints.push(new THREE.Vector2(0, -this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(this.lineHeight, -this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(this.lineHeight, this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(0, this.lineWidthHalf));
	const lineShape = new THREE.Shape(linePoints);
	const geometry1 = new THREE.ExtrudeGeometry(lineShape, {
		steps: 1,
		bevelEnabled: false,
		extrudePath: new THREE.LineCurve3(v1, v2)
	});
	return new THREE.Mesh(geometry1, this.materials[this.KEY_line_yellow]);
}

DataCenter.prototype.genLineMergePos = function (pos) {
	const linePoints = [];
	linePoints.push(new THREE.Vector2(-this.lineWidthHalf, -this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(this.lineWidthHalf, -this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(this.lineWidthHalf, this.lineWidthHalf));
	linePoints.push(new THREE.Vector2(-this.lineWidthHalf, this.lineWidthHalf));
	const lineShape = new THREE.Shape(linePoints);
	const geometry1 = new THREE.ExtrudeGeometry(lineShape, {
		steps: 1,
		bevelEnabled: false,
		extrudePath: new THREE.LineCurve3(pos, new THREE.Vector3(0, 0, -this.lineHeight).add(pos))
	});
	return new THREE.Mesh(geometry1, this.materials[this.KEY_line_yellow]);
}

// 生成连接点，带方向
DataCenter.prototype.genLineMergePosWithDir = function (pos, dir) {
	dir = dir.normalize().multiplyScalar(this.lineWidthHalf);
	let v1 = pos.clone().sub(dir);
	let v2 = pos.clone().add(dir);
	return this.genLineBoxMesh(v1, v2);
}

DataCenter.prototype.genReverseParking = function (geo, name) {
	let root = new THREE.Object3D();
	for (let i = 1; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePosWithDir(geo[i], geo[i].clone().sub(geo[i - 1]));
		merge_mesh.name = "point_" + i;
		root.add(merge_mesh);
	}

	for (let i = 7; i < 8; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genAngledTurnProject = function (geo, name) {
	let root = new THREE.Object3D()
	for (let i = 1; i < 3; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePosWithDir(geo[i], geo[i].clone().sub(geo[i - 1]));
		merge_mesh.name = "point_" + i;
		root.add(merge_mesh);
	}

	for (let i = 4; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePosWithDir(geo[i], geo[i].clone().sub(geo[i - 1]));
		merge_mesh.name = "point_" + i;
		root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genSideParking = function (geo, name) {
	let root = new THREE.Object3D()
	for (let i = 1; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePosWithDir(geo[i], geo[i].clone().sub(geo[i - 1]));
		merge_mesh.name = "point_" + i;
		root.add(merge_mesh);
	}

	for (let i = 7; i < 8; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		// let merge_mesh = this.genLineMergePos(geo[i]);
		// root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genHillStartProject = function (geo, name) {
	let root = new THREE.Object3D()
	let mesh = this.genLineBoxMesh(geo[0], geo[2]);
	mesh.name = "line_1_3";
	root.add(mesh);
	let merge_mesh = this.genLineMergePosWithDir(geo[2], geo[2].clone().sub(geo[0]));
	merge_mesh.name = "point_3";
	root.add(merge_mesh);

	// 停车线宽30cm
	mesh = this.genLineBoxMesh(geo[1], geo[2], 0.3);
	mesh.name = "line_2_3";
	root.add(mesh);
	for (let i = 3; i < 5; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePosWithDir(geo[i], geo[i].clone().sub(geo[i - 1]));
		merge_mesh.name = "point_" + i;
		root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

// 生成线段
DataCenter.prototype.genLineGeometry = function (geo_local, withMergeMesh) {
	let root = new THREE.Object3D();
	for (let i = 1; i < geo_local.length; i++) {
		let mesh = this.genLineBoxMesh(geo_local[i - 1], geo_local[i]);
		mesh.name = "line_" + i + "_" + (i + 1);
		root.add(mesh);
		if (withMergeMesh) {
			let merge_mesh = this.genLineMergePosWithDir(geo_local[i], geo_local[i].clone().sub(geo_local[i - 1]));
			merge_mesh.name = "point_" + i;
			root.add(merge_mesh);
		}
	}
	return root;
}

DataCenter.prototype.genGeometry = function (obj, parent, withMergeMesh, ignoreHeight = false) {
	if (obj.type === "GeometryCollection") {
		let node = new THREE.Object3D();
		node.name += "label";
		for (let label of obj.label) {
			node.name +=  "_" + label;
		}
		for (let subObj of obj.geometries) {
			this.genGeometry(subObj, node, withMergeMesh, ignoreHeight);
		}
		parent.add(node);
	} else if (obj.type === "Line" || obj.type === "Polygon") {
		if (obj.coordinates === undefined) {
			return
		}
		let root = this.genLineGeometry(this.getRelativePosList(obj.coordinates, ignoreHeight), withMergeMesh);

		root.name = obj.id;
		parent.add(root);
	}
}
DataCenter.prototype.genGeometries = function (geometries, parent, withMergeMesh, ignoreHeight = false) {
	if (geometries != null && geometries.length > 0) {
		let geometriesObj = new THREE.Object3D();
		geometriesObj.name = "geometries";
		for (let obj of geometries) {
			this.genGeometry(obj, geometriesObj, withMergeMesh, ignoreHeight);
		}
		parent.add(geometriesObj);
	}
}

DataCenter.prototype.updateZGMapData = function (mapDataJson, originPosWgs84) {
	this.updateOriginPosWgs84(originPosWgs84);
	this.ignoreHeight = document.getElementById("cb_ignore_height")
		.getAttribute("checked") === "checked";
	for (let project of mapDataJson.projects) {
		if (project.type === "ReverseParkingProject") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;
			let geo_local = this.getRelativePosList(project.std_points, this.ignoreHeight);
			let mesh = this.genReverseParking(geo_local, "std_points");
			projectObj.add(mesh);

			this.genGeometries(project.geometries, projectObj, false, this.ignoreHeight);
			this.scene.add(projectObj);
		} else if (project.type === "SideParkingProject") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;
			let geo_local = this.getRelativePosList(project.std_points, this.ignoreHeight);
			let mesh = this.genSideParking(geo_local, "std_points");
			projectObj.add(mesh);

			this.genGeometries(project.geometries, projectObj, false, this.ignoreHeight);

			this.scene.add(projectObj);
		} else if (project.type === "HillStartProject") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;
			let geo_local = this.getRelativePosList(project.std_points, false);
			let mesh = this.genHillStartProject(geo_local, "std_points");
			projectObj.add(mesh);

			this.genGeometries(project.geometries, projectObj, false, false);

			this.scene.add(projectObj);
		} else if (project.type === "RightAngledTurnProject" || project.type === "LeftAngledTurnProject") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;
			let geo_local = this.getRelativePosList(project.std_points, this.ignoreHeight);
			let mesh = this.genAngledTurnProject(geo_local, "std_points");
			projectObj.add(mesh);

			this.genGeometries(project.geometries, projectObj, false, this.ignoreHeight);

			this.scene.add(projectObj);
		} else if (project.type === "CurveDrivingProject") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;

			for (let obj of project.std_lines) {
				this.genGeometry(obj, projectObj, true, this.ignoreHeight);
			}

			this.genGeometries(project.geometries, projectObj, false, this.ignoreHeight);

			this.scene.add(projectObj);
		} else if (project.type === "GeometryCollection") {
			let projectObj = new THREE.Object3D();
			projectObj.name = project.id;

			this.genGeometries(project.geometries, projectObj, false, this.ignoreHeight);

			this.scene.add(projectObj);
		}
	}

	document.getElementById("ref_gps_pos").value = JSON.stringify(this.originPosWgs84);
}

DataCenter.prototype.clearScene = function () {
	this.scene.clear();
}

function WGS84ToMercator(point) {
	let xValue = point[0] * 20037508.34 / 180;
	let y = Math.log(Math.tan((90 + point[1]) * Math.PI / 360)) / (Math.PI / 180);
	let yValue = y * 20037508.34 / 180;
	return [xValue, yValue, point[2]];
}

DataCenter.prototype.updateOriginPosWgs84 = function (originPosWgs84) {
	if (originPosWgs84 === null) {
		this.originPosWgs84 = null;
		this.originPos = 0;
		this.mercatorScalar = 0;
	} else {
		this.originPosWgs84 = [originPosWgs84[0], originPosWgs84[1], originPosWgs84[2]];
		this.originPos = WGS84ToMercator(this.originPosWgs84);
		this.mercatorScalar = Math.cos(this.originPosWgs84[1] / 180 * Math.PI);
	}
}

DataCenter.prototype.getRelativePosList = function (points, ignoreHeight = false) {
	let ret = [];
	for (let pos of points) {
		ret.push(this.getRelativePos(pos, ignoreHeight));
	}
	return ret;
}

DataCenter.prototype.getRelativePos = function (point, ignoreHeight) {
	let mercator = WGS84ToMercator(point);
	if (this.originPosWgs84 === null) {
		this.updateOriginPosWgs84(point);
	}

	let x = (mercator[0] - this.originPos[0]) * this.mercatorScalar;
	let y = (mercator[1] - this.originPos[1]) * this.mercatorScalar;
	let z = 0;
	if (!ignoreHeight) {
		z = mercator[2] - this.originPos[2];
	}
	return new THREE.Vector3(x, y, z);
}

DataCenter.prototype.init = function () {
	this.car = new ARCar();
	this.carScene = new CarScene(document.getElementById("scene_3d"));
	this.scene = this.carScene.scene;
	this.loadMaterials();
};

DataCenter.prototype.loadMaterials = function () {
	this.materials = {};

	const loader = new THREE.TextureLoader();
	{
		this.KEY_point = "point";
		let texture = loader.load('textures/sprites/disc.png');
		this.materials[this.KEY_point] = new THREE.PointsMaterial({
			map: texture,
			size: 1,
			alphaTest: 0.5
		});
	}

	{
		let texture = loader.load('CarDemo/textures/cement.png');
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);
		texture.anisotropy = 16;
		texture.encoding = THREE.sRGBEncoding;
		this.KEY_cement = "cement";
		this.materials[this.KEY_cement] = new THREE.MeshLambertMaterial({
			map: texture,
			side: THREE.DoubleSide,
			alphaTest: 1
		});
	}
	{
		this.KEY_line_white = "line_white";
		this.materials[this.KEY_line_white] = new THREE.MeshPhysicalMaterial({color: 0xffffff, side: THREE.DoubleSide});
	}

	{
		this.KEY_line_yellow = "line_yellow";
		this.materials[this.KEY_line_yellow] = new THREE.MeshPhysicalMaterial({
			color: 0xFFD700,
			side: THREE.DoubleSide
		});
	}
}

DataCenter.getInstance = function () {
	if (!this.instance) {
		this.instance = new DataCenter();
	}
	return this.instance
};

export {DataCenter};
