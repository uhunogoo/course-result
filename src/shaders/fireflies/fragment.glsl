void main() {
    vec2 st = gl_PointCoord;
    // Circle
    float distanceToCenter = length(st - 0.5);
    distanceToCenter = 0.05 / distanceToCenter - 0.05 * 2.0;

    gl_FragColor = vec4( vec3( 1.0 ), distanceToCenter );
}