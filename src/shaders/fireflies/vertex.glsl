uniform float u_pixelRatio;
uniform float u_pointSize;
uniform float u_time;

attribute float a_scale;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += ((sin(u_time * 1.2 + modelPosition.x * 200.0) + 1.0) / 2.0) * a_scale * 0.2;
    modelPosition.y += ((sin(u_time * 1.2 + modelPosition.z * 200.0) + 1.0) / 2.0) * a_scale * 0.2;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    
    // Points parameters 
    float scale = clamp(a_scale, 0.2, 1.0);
    gl_PointSize = u_pointSize * scale * u_pixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);

}