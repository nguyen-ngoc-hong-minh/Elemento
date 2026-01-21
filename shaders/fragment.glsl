varying vec2 vUv;
uniform sampler2D uTexture;

void main() {

  vec4 color = texture2D(uTexture, vUv);

  float brightness = dot(color.rgb, vec3(0.333));

  float alpha = smoothstep(0.05, 0.3, brightness);

  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float soft = smoothstep(0.5, 0.0, d);

  alpha *= soft;
  alpha *= 0.3;

  gl_FragColor = vec4(color.rgb * 1.7, alpha);
}
