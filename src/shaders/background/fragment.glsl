uniform float u_time;
uniform float u_pixelRatio;
uniform float u_progress;
uniform sampler2D u_texture;
uniform sampler2D u_backTexture;

uniform vec2 u_screen;
uniform vec2 u_frontAspect;
uniform vec2 u_backAspect;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.14159265358979323846

void main() {
    // vec4 sideColor = vec4( vec3(sin((vPosition.x + vPosition.y + vPosition.z) * 12.2)), 1.0 );

    // vec4 backColor = texture2D(u_backTexture, newUV );



    // bocke
    float aspect = u_screen.x / u_screen.y;
    vec2 screen = (gl_FragCoord.xy / u_screen) / u_pixelRatio;
    float circle = distance( vUv , vec2(0.5) );
    float _circle = smoothstep( 0.1 , 0.9, circle );
    circle = smoothstep( 0.2 , 0.3, distance( (screen - 0.5) / vec2( 1.0, aspect) + 0.5, vec2(0.5) ) );
    float strength = max(abs(screen.x - 0.5), abs(screen.y - 0.5));

    vec4 frontColor = texture2D(u_texture, vUv * ( 1.0 - _circle * 0.2 ) );
    vec4 backColor = texture2D(u_backTexture, vUv * ( 1.0 - _circle * 0.2 ) );

    vec4 mixTexture = mix( frontColor, backColor, u_progress );

    gl_FragColor = vec4( vec3( circle), 1.0 );
    gl_FragColor = mixTexture * (1.0 - circle);
} 