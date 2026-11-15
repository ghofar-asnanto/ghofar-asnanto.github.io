const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
});

document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(1100px) rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*10).toFixed(2)}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

const stage = document.querySelector('.stage');
if (stage) {
  window.addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - .5) * 16;
    const y = (e.clientY / innerHeight - .5) * 12;
    stage.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  });
}

document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px, ${(e.clientY-r.top-r.height/2)*.12}px)`;
  });
  el.addEventListener('pointerleave', () => el.style.transform = '');
});

if (window.THREE) {
  const canvas = document.querySelector('#webgl');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, .1, 100);
  camera.position.z = 6;

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.BufferGeometry();
  const count = 1400;
  const pos = new Float32Array(count * 3);
  for (let i=0;i<count;i++){
    pos[i*3]=(Math.random()-.5)*14;
    pos[i*3+1]=(Math.random()-.5)*9;
    pos[i*3+2]=(Math.random()-.5)*8;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({
    size:.018,
    color:0x4fdcff,
    transparent:true,
    opacity:.42,
    depthWrite:false
  });
  const points = new THREE.Points(geo,mat);
  group.add(points);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.45,2),
    new THREE.MeshBasicMaterial({color:0x315b86, wireframe:true, transparent:true, opacity:.11})
  );
  wire.position.set(3.2,.2,-1);
  group.add(wire);

  let mx=0,my=0;
  window.addEventListener('pointermove',e=>{
    mx=(e.clientX/innerWidth-.5);
    my=(e.clientY/innerHeight-.5);
  });

  const clock = new THREE.Clock();
  function tick(){
    const t=clock.getElapsedTime();
    points.rotation.y=t*.018 + mx*.08;
    points.rotation.x=t*.008 + my*.05;
    wire.rotation.x=t*.10;
    wire.rotation.y=t*.13;
    camera.position.y += ((-window.scrollY * .00035)-camera.position.y)*.02;
    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.animate(
        [{opacity:0, transform:'translateY(30px)'},{opacity:1, transform:'translateY(0)'}],
        {duration:700, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards'}
      );
      io.unobserve(e.target);
    }
  });
},{threshold:.12});

document.querySelectorAll('.service-card,.project-card,.timeline-item,.award-card,.contact-panel').forEach(el=>{
  el.style.opacity='0';
  io.observe(el);
});