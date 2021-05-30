import * as THREE from '../../build/three.module.js';
import {ARCar} from "../ar_debug/ARCar.js";
import {CarScene} from "./CarScene.js";
import {PointSubToVector3, ToMercator} from "./CoordinateUtils.js";
import {Earcut} from "../../src/extras/Earcut.js";
import {ConvexGeometry} from "../jsm/geometries/ConvexGeometry.js";

function DataCenter() {
	this.instance = null;
	this.originPos = null;
}

DataCenter.prototype.updateMapData = function (mapDataJson) {
	this.originPos = null;
	this.mapGeoJson = this.toRelativeGeo(mapDataJson);
	this.mapObjectMeshs = [];
	let z_index =0;
	for (let feature of this.mapGeoJson.features) {
		let geometry = feature.geometry;
		let material = feature.properties.material;
		for (let points of geometry.coordinates) {
			let geo = [];
			for (let point of points) {
				geo.push(new THREE.Vector3(point[0],point[1],0));
			}

			// const pointsGeometry = new THREE.BufferGeometry().setFromPoints(geo);
			// const points_ = new THREE.Points(pointsGeometry, this.materials[this.KEY_point]);
			// this.scene.add(points_);

			let shape = new THREE.Shape();
			shape.moveTo(geo[0].x, geo[0].y);
			for (let i = 0; i < geo.length; i++) {
				shape.lineTo(geo[i].x, geo[i].y);
			}
			shape.autoClose = true;
			let polygonGeometry = new THREE.ShapeGeometry(shape);
			let mesh = new THREE.Mesh(polygonGeometry, this.materials[material]);
			mesh.position.z = 0.01 * z_index;
			this.mapObjectMeshs.push(mesh);
			this.scene.add(mesh);
			z_index ++;
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
				point[0] = p1.geometry.coordinates[0]-p2.geometry.coordinates[0];
				point[1] = p1.geometry.coordinates[1]-p2.geometry.coordinates[1];
			}
		}
	}
	return mapDataJson;
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

DataCenter.prototype.loadMaterials= function() {
	this.materials  = {};

	const loader = new THREE.TextureLoader();
	this.KEY_point = "point";
	{
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
		texture.repeat.set( 1, 1 );
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
		this.materials[this.KEY_line_yellow] = new THREE.MeshPhysicalMaterial({color: 0xFFD700, side: THREE.DoubleSide});
	}
}

DataCenter.getInstance = function () {
	if (!this.instance) {
		this.instance = new DataCenter();
	}
	return this.instance
};

export {DataCenter};
