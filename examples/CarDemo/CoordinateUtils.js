import * as THREE from '../../build/three.module.js';
/**
 * 经纬度转墨卡托
 * @param poi 经纬度
 * @returns {{}}
 * @private
 */
function ToMercator(poi) {//[114.32894, 30.585748]
	let mercator = {};
	let earthRad = 6378137.0;
	mercator.x = poi.lng * Math.PI / 180 * earthRad;
	let a = poi.lat * Math.PI / 180;
	mercator.y = earthRad / 2 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
	return mercator; //[12727039.383734727, 3579066.6894065146]
}

/**
 * 墨卡托转经纬度
 * @param poi 墨卡托
 * @returns {{}}
 * @private
 */
function ToLngLat(poi) {
	let lnglat = {};
	lnglat.lng = poi.x / 20037508.34 * 180;
	let mmy = poi.y / 20037508.34 * 180;
	lnglat.lat = 180 / Math.PI * (2 * Math.atan(Math.exp(mmy * Math.PI / 180)) - Math.PI / 2);
	return lnglat;
}

function PointSubToVector3(p1, p2) {
	return new THREE.Vector3(p1.geometry.coordinates[0]-p2.geometry.coordinates[0],
		p1.geometry.coordinates[1]-p2.geometry.coordinates[1],
		p1.geometry.coordinates[2]-p2.geometry.coordinates[2]);
}

export {ToMercator, ToLngLat,PointSubToVector3};
