uniform float u_pixelRatio;
uniform float u_pointSize;
uniform float u_time;
uniform vec2 u_count;

attribute float a_scale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.141592653589793238

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

void main() {
    vec3 st = position;

    // st = mix(st, rotate( st, vec3(1.0, 1.0, 0.0), PI ), (sin(u_time) + 1.0) / 2.0);
    
    vec4 modelPosition = modelMatrix * vec4(st, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vUv = uv;
    vNormal = normal;
    vPosition = position;
}