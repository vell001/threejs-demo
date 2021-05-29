import * as THREE from '../../build/three.module.js';

const KEY_points = "ps";
const KEY_colors = "cs";
var ARPoints = function (param) {
    var scope = this;
    const geo = new THREE.BufferGeometry()
    this.updatePoints = function (ps) {
        if (ps !== null || ps !== undefined) {
            geo.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3));
        }
    }
    this.updateColors = function (cs) {
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
    }
    geo.computeBoundingSphere();
    const material = new THREE.PointsMaterial({ size: 0.2, vertexColors: true});
    THREE.Points.call(this, geo, material);
}

ARPoints.prototype = Object.create(THREE.Points.prototype);
ARPoints.prototype.constructor = ARPoints;
export { ARPoints };