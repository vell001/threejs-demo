import {DataCenter} from "./DataCenter.js";
import * as THREE from '../../build/three.module.js';

function CarController() {
	this.instance = null;
	this.lastPosition = DataCenter.getInstance().car.position;
	this.lastQuaternion = DataCenter.getInstance().car.quaternion;
}

CarController.prototype.init = function () {
	CarController.getInstance().moveTo(this.lastPosition, this.lastQuaternion);
	let scope = this;
	function handleKeyDown(event) {
		console.log(event);
		if (event.key === "w") {
			scope.lastPosition.add(new THREE.Vector3(0,1, 0));
		} else if(event.key === "s") {
			scope.lastPosition.add(new THREE.Vector3(0,-1, 0));
		} else if(event.key === "a") {
			scope.lastPosition.add(new THREE.Vector3(-1,0, 0));
		}else if(event.key === "d") {
			scope.lastPosition.add(new THREE.Vector3(1,0, 0));
		}
		CarController.getInstance().moveTo(scope.lastPosition, scope.lastQuaternion);
	}

	document.addEventListener('keydown', handleKeyDown, false);
}
CarController.prototype.moveTo = function (position, quaternion) {
	let car = DataCenter.getInstance().car;
	car.position.copy(position);
	car.quaternion.copy(quaternion);
}

CarController.prototype.setWheelAngle = function (angle) {
	let car = DataCenter.getInstance().car;
	car.angle = angle;
}

CarController.prototype.setSpeed = function (speed) {
	let car = DataCenter.getInstance().car;
	car.speed = speed;
}

CarController.getInstance = function () {
	if (!this.instance) {
		this.instance = new CarController();
	}
	return this.instance
};

export {CarController};
