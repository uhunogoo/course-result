uniform float u_pixelRatio;
uniform float u_pointSize;
uniform float u_time;
uniform vec2 u_count;

attribute float a_scale;

varying vec2 vUv;
// varying vec2 vPosition;
varying vec3 vNormal;
varying vec3 vPosition;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
    vec3 st = position;

    // st.yx *= sin( u_time + st.z );
    // vec2 rotXY = st.zx * rotate2d( sin(u_time + st.z / 10.0) );
    // vec2 rotZY = st.zy * rotate2d( sin(u_time + st.z / 10.0) );
    // st.zy = vec2(rotXY.x, rotZY.y);


    st.yz *= rotate2d( cos(u_time) * 0.2 );
    st.xz *= rotate2d( sin(u_time + st.y / 30.) );

    // st.yx *= rotate2d( sin(u_time) );
    vec4 modelPosition = modelMatrix * vec4(st, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vUv = uv;
    vNormal = normal;
    vPosition = position;
}