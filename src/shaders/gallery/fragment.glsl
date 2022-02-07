uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_backTexture;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;
uniform vec2 u_count;
uniform vec2 u_frontAspect;
uniform vec2 u_backAspect;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.14159265358979323846

void main() {
    vec2 newUV = vUv / u_count + 0.5;
    vec4 sideColor = vec4( vec3(sin((vPosition.x + vPosition.y + vPosition.z) * 12.2)), 1.0 );

    vec4 frontColor = texture2D(u_texture, newUV );
    vec4 backColor = texture2D(u_backTexture, newUV );

    
    float side = abs( dot(vNormal, vec3(0.0, 0.0, 1.0)) );
    float backFront = ( dot(vNormal, vec3( 0.0, 0.0, 1.0 )) + 1.0 ) * 0.5;
    
    vec4 backFrontTexture = mix( backColor, frontColor, backFront );

    gl_FragColor = mix( sideColor, backFrontTexture, side );
} 