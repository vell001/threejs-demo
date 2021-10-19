import * as THREE from '../../build/three.module.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';

let MapObject = function (data) {
	let scope = this;
	THREE.Object3D.call(this);
	
};

MapObject.prototype = Object.create(THREE.Object3D.prototype);
MapObject.prototype.constructor = MapObject;
export { MapObject };
