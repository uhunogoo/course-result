uniform float u_pixelRatio;
uniform float u_pointSize;
uniform float u_time;
uniform vec2 u_count;

attribute float a_scale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.141592653589793238


void main() {
    vec3 st = position;
    vec2 gridUv = vec2(floor(st.x * u_count.x) / u_count.x * sin(u_time), floor(st.y * u_count.y) / u_count.y);
    // st.z = gridUv.x * 2.;
    
    vec4 modelPosition = modelMatrix * vec4(st, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vUv = uv;
    vNormal = normal;
    vPosition = position;
}