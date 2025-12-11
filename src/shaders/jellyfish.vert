uniform float uTime;
varying vec3 vNormal;

float sinWave(vec3 pos, vec2 dir, float freq, float speed, float amp) {
    float phase = dot(pos.xz, dir) * freq + uTime * speed;
    return sin(phase) * amp;
}

void main() {
    vec3 pos = position;

    // Strong tentacle factor
    float tentacleFactor = smoothstep(1.5, -3.0, pos.y); // stronger falloff

    //  wobble side to side
    pos.x += sinWave(pos, vec2(0.5, 0.1), 1.5, 2.0, 10.0) * tentacleFactor;
    pos.z += sinWave(pos, vec2(-0.3, 0.6), 2.0, 2.5, 10.0) * tentacleFactor;

    // up-down bounce
    pos.y += sin(uTime * 4.0 + pos.x * 0.5) * 1.2 * (1.0 - tentacleFactor);

    //  LOCAL distortion (swelling effect along normals)
    pos += normalize(normal) * sin(uTime * 6.0 + pos.y * 2.0 + pos.x * 2.0) * 1.0;

    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
