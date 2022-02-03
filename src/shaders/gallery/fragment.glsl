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

vec2 rotate2D(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

vec2 tile(vec2 _st, vec2 _zoom){
    _st *= _zoom;
    return fract(_st);
}

float box(vec2 _st, vec2 _size, float _smoothEdges){
    _size = vec2(0.5)-_size*0.5;
    vec2 aa = vec2(_smoothEdges*0.5);
    vec2 uv = smoothstep(_size,_size+aa,_st);
    uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st);
    return uv.x*uv.y;
}

void main() {
    vec2 newUV = vUv / u_count + 0.5;
    vec4 sideColor = vec4( vec3(sin((vPosition.x + vPosition.y + vPosition.z) * 50.0)), 1.0 );
    vec2 st = vUv;


    // Divide the space in 4
    // st = rotate2D(st, -PI * 0.5);
    st = tile(st, vec2( 1.0 ));
    

    // second iteration
    float step_x = floor(newUV.x * u_count.x) / u_count.x;
    float step_y = floor(newUV.y * u_count.y) / u_count.y;

    vec2 frontCoords = (st - 0.5) / u_count + 0.5;

    vec4 frontColor = texture2D(u_texture, (frontCoords + vec2(step_x, step_y) - 0.5) * u_frontAspect + vec2(1.0 / u_count.x * 0.5, 1.0 / u_count.y * 0.5) );

    // Divide the space in 4
    vec2 backCoords = (vec2(1.0 - st.x, st.y) - 0.5) / u_count + 0.5;
    // backCoords.x -= step_x;
    // backCoords.y += step_y;
    backCoords = (backCoords + vec2(step_x, step_y) - 0.5) * u_backAspect + vec2(1.0 / u_count.x * 0.5, 1.0 / u_count.y * 0.5);

    vec4 backColor = texture2D(u_backTexture, (backCoords) );

    
    float side = abs( dot(vNormal, vec3(0.0, 0.0, 1.0)) );
    float backFront = ( dot(vNormal, vec3( 0.0, 0.0, 1.0 )) + 1.0 ) * 0.5;
    vec4 backFrontTexture = mix( backColor, frontColor, backFront );

    gl_FragColor = mix( sideColor, backFrontTexture, side );
    gl_FragColor = vec4( vec3(step(0.0, cos((vUv.x - 0.5) * (u_count.x - 1.0)))), 1.0 );
} 