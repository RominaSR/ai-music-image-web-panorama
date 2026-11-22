'use strict';

// A ray from the viewer intersects the inside of a unit sphere. Its longitude
// and latitude sample the recovered equirectangular panorama; no CDN is needed.
const TAU = Math.PI * 2;
const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));
const longitude = u => (u - 0.5) * TAU;
const INITIAL_YAW = longitude(0.43);
const ZONES = [
  {id: 'birds', label: 'Les oiseaux', yaw: longitude(0.17)},
  {id: 'wind', label: 'Le vent', yaw: longitude(0.44)},
  {id: 'water', label: 'L’eau', yaw: longitude(0.77)}
];

// Normalized power keeps transitions continuous through the rear 0°/360° seam.
function zoneWeights(yaw) {
  const power = ZONES.map(z => Math.exp(3.5 * Math.cos(wrap(yaw - z.yaw))));
  const sum = power.reduce((a, b) => a + b, 0);
  return power.map(p => Math.sqrt(p / sum));
}

const $ = id => document.getElementById(id);
const canvas = $('panorama');
let yaw = INITIAL_YAW, pitch = 0, fov = 70, touring = false, running = false;
let ready = false, lastTime = 0, frameId = 0, renderer;
let audioContext, master, compressor, audioReady = false;
const tracks = new Map();
const sources = {musicA:'assets/audio/music-a.mp3', musicB:'assets/audio/music-b.mp3',
  birds:'assets/audio/birds.mp3', wind:'assets/audio/wind.mp3', water:'assets/audio/water.mp3'};
function notice(message) { $('notice').textContent = message; }

function makeRenderer() {
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false});
  if (!gl) throw new Error('Ce navigateur ne peut pas afficher la sphère. Essayez un navigateur avec WebGL activé.');
  const shader = (type, source) => {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, `
    attribute vec2 position; varying vec2 screen;
    void main(){screen=position;gl_Position=vec4(position,0.0,1.0);}`));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
    precision highp float;
    varying vec2 screen;
    uniform sampler2D panorama;
    uniform float aspect, angle, elevation, zoom;
    void main(){
      vec3 ray=normalize(vec3(screen.x*aspect*zoom,screen.y*zoom,-1.0));
      float cp=cos(elevation),sp=sin(elevation),cy=cos(angle),sy=sin(angle);
      ray=vec3(ray.x,cp*ray.y-sp*ray.z,sp*ray.y+cp*ray.z);
      ray=vec3(cy*ray.x-sy*ray.z,ray.y,sy*ray.x+cy*ray.z);
      vec2 uv=vec2(fract(0.5+atan(ray.x,-ray.z)/6.28318530718),
                   0.5-asin(clamp(ray.y,-1.0,1.0))/3.14159265359);
      gl_FragColor=texture2D(panorama,uv);
    }`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program,'panorama'),0);
  const uniforms=Object.fromEntries(['aspect','angle','elevation','zoom'].map(k=>[k,gl.getUniformLocation(program,k)]));
  return {
    load(image) {
      // Keep memory bounded and respect the actual device texture limit.
      const max=Math.min(4096,gl.getParameter(gl.MAX_TEXTURE_SIZE));
      let source=image;
      if(image.width>max){source=document.createElement('canvas');source.width=max;
        source.height=Math.round(image.height*max/image.width);source.getContext('2d').drawImage(image,0,0,source.width,source.height);}
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);
      if(gl.getError()!==gl.NO_ERROR) throw new Error('Le panorama n’a pas pu être chargé dans la sphère.');
    },
    draw() {
      const ratio=Math.min(window.devicePixelRatio||1,1.75);
      const width=Math.round(innerWidth*ratio),height=Math.round(innerHeight*ratio);
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
      gl.uniform1f(uniforms.aspect,width/height);gl.uniform1f(uniforms.angle,yaw);
      gl.uniform1f(uniforms.elevation,pitch);gl.uniform1f(uniforms.zoom,Math.tan(fov*Math.PI/360));
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
  };
}

function gainTo(param, value) {
  const now=audioContext.currentTime;
  param.cancelScheduledValues(now); param.setTargetAtTime(value,now,.12);
}
let previousWeights=[];
function updateMix(force=false) {
  const weights=zoneWeights(yaw);
  const dominant=weights.indexOf(Math.max(...weights));
  $('zone').textContent=ZONES[dominant].label;
  if(!audioReady) return;
  weights.forEach((value,i)=>{
    if(force||Math.abs(value-(previousWeights[i]??-1))>.003){
      gainTo(tracks.get(ZONES[i].id).gain.gain,value*.55);
      previousWeights[i]=value;
    }
  });
  if(force){
    const selected=$('composition').value;
    for(const id of ['musicA','musicB']) gainTo(tracks.get(id).gain.gain,id === selected ? .7 : 0);
  }
}
function initializeAudio() {
  if(audioReady)return;
  audioContext=new (window.AudioContext||window.webkitAudioContext)();
  master=audioContext.createGain();master.gain.value=Number($('volume').value);
  compressor=audioContext.createDynamicsCompressor();compressor.threshold.value=-8;
  compressor.knee.value=8;compressor.ratio.value=6;
  master.connect(compressor).connect(audioContext.destination);
  for(const [id,src] of Object.entries(sources)){
    const element=new Audio(src);element.loop=true;element.preload='auto';
    const gain=audioContext.createGain();gain.gain.value=0;
    audioContext.createMediaElementSource(element).connect(gain).connect(master);
    element.addEventListener('error',()=>notice('Une piste ne se charge pas. Vous pouvez continuer à explorer puis réessayer la lecture.'));
    tracks.set(id,{element,gain});
  }
  audioReady=true; updateMix(true);
}
let playPending=false;
async function startAudio() {
  if(playPending)return;playPending=true;
  try{
    initializeAudio();
    // All play() calls originate from the same explicit click, including Safari.
    const resume=audioContext.resume();
    const promises=[...tracks.values()].map(({element})=>element.play());
    await Promise.all([resume,...promises]);
    running=true;$('play').textContent='Pause';$('play').setAttribute('aria-label','Mettre en pause');notice('');
  }catch(error){
    for(const {element} of tracks.values())element.pause();
    running=false;$('play').textContent='Écouter';$('play').setAttribute('aria-label','Reprendre la lecture');
    notice('Le son n’a pas démarré. Touchez « Écouter » pour réessayer.');
  }finally{playPending=false;}
}
function pauseAudio(){
  for(const {element} of tracks.values())element.pause();
  running=false;$('play').textContent='Écouter';$('play').setAttribute('aria-label','Reprendre la lecture');
}
function animate(time){
  const dt=lastTime?Math.min((time-lastTime)/1000,.1):0;lastTime=time;
  if(touring&&running)yaw=wrap(yaw+dt*.045);
  if(ready)renderer.draw(); updateMix();
  frameId=requestAnimationFrame(animate);
}
let drag;
canvas.addEventListener('pointerdown',e=>{
  if(!ready||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const scale=fov*Math.PI/180/innerHeight;
  yaw=wrap(yaw-(e.clientX-drag.x)*scale);
  pitch=clamp(pitch+(e.clientY-drag.y)*scale,-1.35,1.35);
  drag.x=e.clientX;drag.y=e.clientY;
});
function endDrag(){drag=null;canvas.classList.remove('dragging');}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault();fov=clamp(fov+e.deltaY*.035,40,95);},{passive:false});
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,button,a')||$('about').open)return;
  const actions={ArrowLeft:()=>yaw=wrap(yaw-.06),ArrowRight:()=>yaw=wrap(yaw+.06),
    ArrowUp:()=>pitch=clamp(pitch+.06,-1.35,1.35),ArrowDown:()=>pitch=clamp(pitch-.06,-1.35,1.35),
    '+':()=>fov=clamp(fov-3,40,95),'-':()=>fov=clamp(fov+3,40,95),
    ' ':()=>{if(!$('experience').hidden)running?pauseAudio():startAudio();}};
  if(actions[e.key]){e.preventDefault();actions[e.key]();}
});
$('start').addEventListener('click',()=>{
  $('entrance').hidden=true;$('experience').hidden=false;canvas.focus();startAudio();
});
$('play').addEventListener('click',()=>running?pauseAudio():startAudio());
$('composition').addEventListener('change',()=>updateMix(true));
$('volume').addEventListener('input',()=>{if(master)gainTo(master.gain,Number($('volume').value));});
$('tour').addEventListener('click',()=>{touring=!touring;$('tour').setAttribute('aria-pressed',String(touring));});
function recenter(){yaw=INITIAL_YAW;pitch=0;fov=70;}
$('recenter').addEventListener('click',recenter);
$('home').addEventListener('click',e=>{e.preventDefault();recenter();});
$('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{notice('Le plein écran n’est pas disponible ici. Vous pouvez continuer dans cette fenêtre.');}
});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Quitter':'Plein écran';});
$('about-button').addEventListener('click',()=>$('about').showModal());
$('close-about').addEventListener('click',()=>$('about').close());
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){pauseAudio();cancelAnimationFrame(frameId);frameId=0;lastTime=0;}
  else if(!frameId)frameId=requestAnimationFrame(animate);
});
// Streaming tracks use little memory. Correct large clock drift without seeking
// on every frame or forcing tracks with different durations onto one timeline.
setInterval(()=>{
  if(!running)return;const reference=tracks.get('musicA').element;
  for(const [id,{element}]of tracks){
    if(id==='musicA'||!Number.isFinite(element.duration)||Math.abs(element.duration-reference.duration)>.15)continue;
    const difference=Math.abs(element.currentTime-reference.currentTime);
    if(difference>.25&&difference<element.duration-.5)element.currentTime=reference.currentTime;
  }
},4000);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pauseAudio();notice('L’affichage a été interrompu. Rechargez la page pour retrouver le paysage.');});
try{
  renderer=makeRenderer();
  const image=new Image();
  image.onload=()=>{
    try{renderer.load(image);ready=true;$('start').disabled=false;$('start').textContent='Commencer l’expérience';frameId=requestAnimationFrame(animate);}
    catch(error){notice(error.message);}
  };
  image.onerror=()=>notice('Le panorama n’a pas pu être chargé. Rechargez la page pour réessayer.');
  image.src='assets/panorama.jpg';
}catch(error){notice(error.message);$('start').textContent='Affichage indisponible';}
