uniform vec3 uColor;
varying vec3 vNormal;

void main() {
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float brightness = dot(normalize(vNormal), light);
  brightness = clamp(brightness, 0.1, 1.0);

  gl_FragColor = vec4(uColor * brightness, 1.0);
}
