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
}

DataCenter.prototype.genLineBoxMesh = function (v1, v2) {
	let lineWidthHalf = 0.15 / 2;
	let lineHeight = 0.01;

	let dist = v1.distanceTo(v2);
	let cubeGeometry = new THREE.BoxGeometry(0.15, lineHeight, dist);
	let mesh = new THREE.Mesh(cubeGeometry, this.materials[this.KEY_line_yellow]);
	let pos = (v1.add(v2)) .divideScalar(2);
	mesh.up = new THREE.Vector3(0,0,1);
	mesh.position.set(pos.x,pos.y,pos.z);
	mesh.lookAt(v2);
	return mesh
}


DataCenter.prototype.genExtrudeLineMesh = function (v1, v2) {
	const linePoints = [];
	let lineWidthHalf = 0.15 / 2;
	let lineHeight = 0.01;
	linePoints.push(new THREE.Vector2(0, -lineWidthHalf));
	linePoints.push(new THREE.Vector2(lineHeight, -lineWidthHalf));
	linePoints.push(new THREE.Vector2(lineHeight, lineWidthHalf));
	linePoints.push(new THREE.Vector2(0, lineWidthHalf));
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
	let lineWidth = 0.15;
	let lineWidthHalf = lineWidth / 2;
	let lineHeight = 0.01;
	linePoints.push(new THREE.Vector2(-lineWidthHalf, -lineWidthHalf));
	linePoints.push(new THREE.Vector2(lineWidthHalf, -lineWidthHalf));
	linePoints.push(new THREE.Vector2(lineWidthHalf, lineWidthHalf));
	linePoints.push(new THREE.Vector2(-lineWidthHalf, lineWidthHalf));
	const lineShape = new THREE.Shape(linePoints);
	const geometry1 = new THREE.ExtrudeGeometry(lineShape, {
		steps: 1,
		bevelEnabled: false,
		extrudePath: new THREE.LineCurve3(pos, new THREE.Vector3(0, 0, -lineHeight).add(pos))
	});
	return new THREE.Mesh(geometry1, this.materials[this.KEY_line_yellow]);
}

DataCenter.prototype.genReverseParking = function (geo, name) {
	let root = new THREE.Object3D()
	for (let i = 1; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePos(geo[i]);
		root.add(merge_mesh);
	}

	for (let i = 7; i < 8; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		// let merge_mesh = this.genLineMergePos(geo[i]);
		// root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genRightAngledTurn = function (geo, name) {
	let root = new THREE.Object3D()
	for (let i = 1; i < 3; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePos(geo[i]);
		root.add(merge_mesh);
	}

	for (let i = 4; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePos(geo[i]);
		root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genSideParking = function (geo, name) {
	let root = new THREE.Object3D()
	for (let i = 1; i < 6; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePos(geo[i]);
		root.add(merge_mesh);
	}

	for (let i = 7; i < 8; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
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
	mesh.name = "line_" + 1 + "_" + 3;
	root.add(mesh);
	let merge_mesh = this.genLineMergePos(geo[2]);
	root.add(merge_mesh);

	for (let i = 2; i < 5; i++) {
		let mesh = this.genLineBoxMesh(geo[i - 1], geo[i]);
		mesh.name = "line_" + i + "_" + (i+1);
		root.add(mesh);
		let merge_mesh = this.genLineMergePos(geo[i]);
		root.add(merge_mesh);
	}
	root.name = name;
	return root;
}

DataCenter.prototype.genGeometry = function (obj, scene) {
	if (obj.type === "CurveDrivingProject" || obj.type === "GeometryCollection" ) {
		for (let subObj of obj.geometries) {
			this.genGeometry(subObj, this.scene);
		}
	} else if (obj.type === "Line" || obj.type === "Polygon") {
		let root = new THREE.Object3D()
		if (obj.coordinates === undefined) {
			return
		}
		let geo_local = this.getRelativePosList(obj.coordinates);
		for (let i = 1; i < geo_local.length; i++) {
			let mesh = this.genLineBoxMesh(geo_local[i - 1], geo_local[i]);
			mesh.name = "line_" + i + "_" + (i+1);
			root.add(mesh);
			let merge_mesh = this.genLineMergePos(geo_local[i]);
			root.add(merge_mesh);
		}

		root.name = obj.name;
		scene.add(root);
	}
}
DataCenter.prototype.updateZGMapData = function (mapDataJson,originPos) {
	this.originPos = originPos;
	for (let project of mapDataJson.projects) {
		if (project.type === "ReverseParkingProject") {
			let geo_local = this.getRelativePosList(project.std_points);
			let mesh = this.genReverseParking(geo_local, project.name);
			this.scene.add(mesh);
			for (let obj of project.geometries) {
				this.genGeometry(obj, this.scene);
			}
		} else if (project.type === "SideParkingProject") {
			let geo_local = this.getRelativePosList(project.std_points);
			let mesh = this.genSideParking(geo_local, project.name);
			this.scene.add(mesh);
			for (let obj of project.geometries) {
				this.genGeometry(obj, this.scene);
			}
		} else if (project.type === "HillStartProject") {
			let geo_local = this.getRelativePosList(project.std_points);
			let mesh = this.genHillStartProject(geo_local, project.name);
			this.scene.add(mesh);
			for (let obj of project.geometries) {
				this.genGeometry(obj, this.scene);
			}
		} else if (project.type === "RightAngledTurn") {
			let geo_local = this.getRelativePosList(project.std_points);
			let mesh = this.genRightAngledTurn(geo_local, project.name);
			this.scene.add(mesh);
			for (let obj of project.geometries) {
				this.genGeometry(obj, this.scene);
			}
		} else if (project.type === "CurveDrivingProject" || project.type === "GeometryCollection") {
			for (let obj of project.geometries) {
				this.genGeometry(obj, this.scene);
			}
		}
	}

	document.getElementById("ref_gps_pos").value = JSON.stringify(turf.toWgs84(this.originPos).geometry.coordinates);
}

DataCenter.prototype.clearScene = function () {
	this.scene.clear();
}
DataCenter.prototype.updateMapData = function (mapDataJson) {
	this.originPos = null;
	this.mapGeoJson = this.toRelativeGeo(mapDataJson);
	this.mapObjectMeshs = [];
	let z_index = 0;
	let mesh_idx = 0;
	for (let feature of this.mapGeoJson.features) {
		let geometry = feature.geometry;
		let material = feature.properties.material;
		for (let points of geometry.coordinates) {
			let geo = [];
			// for (let point of points) {
			// 	geo.push(new THREE.Vector3(point[0], point[1], 0));
			// }

			/*  //生成标准库位
			geo.push(new THREE.Vector3(0,5.25,0));
			geo.push(new THREE.Vector3(6.82,5.25,0));
			geo.push(new THREE.Vector3(6.82,0,0));
			geo.push(new THREE.Vector3(6.82+2.31,0,0));
			geo.push(new THREE.Vector3(6.82+2.31,5.25,0));
			geo.push(new THREE.Vector3(6.82+2.31+6.82,5.25,0));
			geo.push(new THREE.Vector3(6.82+2.31+6.82,5.25+6.82,0));
			geo.push(new THREE.Vector3(0,5.25+6.82,0));
			*/

			// const pointsGeometry = new THREE.BufferGeometry().setFromPoints(geo);
			// const points_ = new THREE.Points(pointsGeometry, this.materials[this.KEY_point]);
			// this.scene.add(points_);

			// 生成面
			/*let shape = new THREE.Shape();
			shape.moveTo(geo[0].x, geo[0].y);
			for (let i = 0; i < geo.length; i++) {
				shape.lineTo(geo[i].x, geo[i].y);
			}
			shape.autoClose = true;
			let polygonGeometry = new THREE.ShapeGeometry(shape);
			let mesh = new THREE.Mesh(polygonGeometry, this.materials[material]);
			mesh.position.z = 0.01 * z_index;
			this.mapObjectMeshs.push(mesh);
			mesh.name = "mesh_" + mesh_idx;
			mesh_idx ++;
			this.scene.add(mesh);
			z_index ++;*/

			// 生成车道线实体
			// const closedSpline = new THREE.CatmullRomCurve3(geo);
			// closedSpline.curveType = 'catmullrom';
			// closedSpline.closed = true;
			// const extrudeSettings1 = {
			// 	steps: 1000,
			// 	bevelEnabled: false,
			// 	extrudePath: closedSpline
			// };
			// const pts1 = [];
			// pts1.push(new THREE.Vector2(0, 0));
			// pts1.push(new THREE.Vector2(0.01, 0));
			// pts1.push(new THREE.Vector2(0.01, 0.15));
			// pts1.push(new THREE.Vector2(0, 0.15));
			//
			// const shape1 = new THREE.Shape(pts1);
			// const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
			// const mesh = new THREE.Mesh(geometry1, this.materials[this.KEY_line_yellow]);

			let mesh = this.genReverseParking(geo);
			// mesh.name = "mesh_" + mesh_idx;
			// mesh_idx++;
			this.scene.add(mesh);

			// let slices = Earcut.triangulate(geo,null,3);
			// let convexGeometry = new THREE.PolyhedronGeometry( points,slices,6,2 );
			// let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
			// let mesh = new THREE.Mesh( convexGeometry, material );
			// this.scene.add(mesh);

			// let convexGeometry = new ConvexGeometry( geo );
			// let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
			// let mesh = new THREE.Mesh( convexGeometry, material );
			// this.scene.add(mesh);
		}
	}
};

DataCenter.prototype.toRelativeGeo = function (mapDataJson) {
	for (let feature of mapDataJson.features) {
		let geometry = feature.geometry;
		let material = feature.properties.material;
		for (let points of geometry.coordinates) {
			for (let point of points) {
				let p1 = turf.toMercator(turf.point(point));
				if (this.originPos === null) {
					this.originPos = p1;
				}
				let p2 = this.originPos;
				point[0] = p1.geometry.coordinates[0] - p2.geometry.coordinates[0];
				point[1] = p1.geometry.coordinates[1] - p2.geometry.coordinates[1];
			}
		}
	}
	return mapDataJson;
}

DataCenter.prototype.getRelativePosList = function (points) {
	let ret = [];
	for (let pos of points) {
		ret.push(this.getRelativePos(pos));
	}
	return ret;
}
DataCenter.prototype.getRelativePos = function (pos) {
	let pt = turf.point(pos);
	let p = turf.toMercator(pt);
	if (this.originPos === null) {
		this.originPos = p;
	}
	return PointSubToVector3(p, this.originPos);
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
