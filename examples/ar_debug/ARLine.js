import * as THREE from '../../build/three.module.js';

const KEY_points = "ps";
var ARLine = function (param) {
    var scope = this;
    const line_material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    const points = param[KEY_points];

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    THREE.Line.call(this, geo, line_material)
    this.updatePoints = function(p){
        geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    }
}

ARLine.prototype = Object.create( THREE.Line.prototype );
ARLine.prototype.constructor = ARLine;
export { ARLine };