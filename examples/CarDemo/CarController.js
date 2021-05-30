import * as THREE from '../../build/three.module.js';

function CarController() {
	this.instance = null;
	this.accSpeed = 0.3;
	this.yawRate = Math.PI/10;
}

CarController.prototype.init = function (car) {
	this.car = car;
	this.car.onBeforeRender = this.onBeforeRender;
	let scope = this;
	function handleKeyDown(event) {
		console.log(event);
		if (event.key === "w") {
			scope.car.speed += scope.accSpeed;
		} else if(event.key === "s") {
			scope.car.speed -= scope.accSpeed;
		} else if(event.key === "a") {
			scope.car.wheelYaw -= scope.yawRate;
		}else if(event.key === "d") {
			scope.car.wheelYaw += scope.yawRate;
		}
	}

	document.addEventListener('keydown', handleKeyDown, false);
	{
	let startX,distance,isDown = false;
	document.getElementById("wheel").addEventListener("touchstart", function (event) {
		startX=event.touches[0].clientX;
		isDown = true;
		event.preventDefault();
		event.stopPropagation();
	});
	document.getElementById("wheel").addEventListener("touchmove", function (event) {
		if(!isDown) {
			return;
		}
		distance = event.touches[0].clientX - startX;
		document.getElementById("wheel").style.transform = 'rotate('+distance+'deg)';
		event.preventDefault();
		event.stopPropagation();
		scope.car.wheelYaw = distance/6/180 * Math.PI;
	});
	document.getElementById("wheel").addEventListener("touchend", function (event) {
		isDown = false;
		distance = 0;
		scope.car.wheelYaw = 0;
		document.getElementById("wheel").style.transform = 'rotate('+distance+'deg)';
		event.preventDefault();
		event.stopPropagation();
	});
	}
	// 油门
	{
		let startY,distance,t,isDown = false;
		document.getElementById("throttle").addEventListener("touchstart", function (event) {
			startY = event.touches[0].clientY;
			t = document.getElementById("throttle").offsetTop;
			isDown = true;
			event.preventDefault();
			event.stopPropagation();
		});
		document.getElementById("throttle").addEventListener("touchmove", function (event) {
			if(!isDown) {
				return;
			}
			distance = event.touches[0].clientY - startY;
			let ny = t+distance;
			document.getElementById("throttle").style.top = ny+"px";
			scope.car.speed = -distance / 30;
			event.preventDefault();
			event.stopPropagation();
		});
		document.getElementById("throttle").addEventListener("touchend", function (event) {
			isDown = false;
			distance = 0;
			scope.car.speed = 0;
			document.getElementById("throttle").style.top = t+"px";
			event.preventDefault();
			event.stopPropagation();
		});
	}

}

CarController.prototype.setWheelAngle = function (angle) {
	this.car.angle = angle;
}

CarController.prototype.setSpeed = function (speed) {
	this.car.speed = speed;
}

CarController.prototype.onBeforeRender = function (car) {
	let scope = car;
	const timeSec = performance.now() / 1000;
	if (scope.lastRenderTimeSec < 0) {
		scope.lastRenderTimeSec = timeSec;
		return;
	}
	let timeDelta = timeSec - scope.lastRenderTimeSec;

	// 处理轮胎旋转
	{
		let distance = scope.speed * timeDelta;
		let rotA = distance / scope.wheelDiameter;
		scope.lastWheelRotAngle -= rotA;
		let q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), scope.lastWheelRotAngle);
		let q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -scope.wheelYaw);
		let q3 = q2.multiply(q);
		for (let i = 0; scope.wheels !== undefined && i < scope.wheels.length; i++) {
			if (i < 2) {
				scope.wheels[i].quaternion.copy(q3);
			} else {
				scope.wheels[i].rotation.x -= rotA;
			}
		}
	}
	// 处理运动模型
	{
		let slip = Math.atan(scope.lr*Math.tan(scope.wheelYaw) / (scope.lf + scope.lr));
		let yawDelta = (scope.speed*Math.cos(slip))/(scope.lf + scope.lr)*(Math.tan(scope.wheelYaw)) * timeDelta;
		scope.carYaw += yawDelta;
		let yDelta = scope.speed * Math.cos(scope.carYaw + slip) * timeDelta;
		let xDelta = scope.speed * Math.sin(scope.carYaw + slip) * timeDelta;
		scope.position.add(new THREE.Vector3(xDelta, yDelta, 0));
		// scope.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(scope.upAxis, -yawDelta));
		scope.quaternion.copy(new THREE.Quaternion().copy(scope.baseQuaternion).multiply(new THREE.Quaternion().setFromAxisAngle(scope.upAxis, -scope.carYaw)));
	}

	scope.lastRenderTimeSec = timeSec;
}

CarController.getInstance = function () {
	if (!this.instance) {
		this.instance = new CarController();
	}
	return this.instance
};

export {CarController};
