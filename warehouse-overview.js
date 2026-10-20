(() => {
 'use strict';
 const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg';
 const photos=Object.fromEntries((window.WAREHOUSE_PHOTOS||[]).map(p=>[p.key,p]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='both',clock=0,last=0,playing=!reduced.matches,frame=0,lastPhase=-1,resumeAfterModal=false;
 const stageSeconds=6.4;
 const svgEl=(tag,attrs,parent)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));if(parent)parent.append(el);return el;};
 const model=new window.WarehouseLayout($('#w6-plan'),{onZoneClick:openZone});
 const zones=window.WAREHOUSE_ZONES;
 const zoneMap=Object.fromEntries(zones.map(z=>[z.id,z]));
 const metadata={
  "inbound": {
    "photos": [
      "receiving"
    ],
    "role": "Unload, identify, count and inspect supplier stock. Discrepancies go on hold rather than silently entering available inventory.",
    "context": "AI-generated illustration: An illustrative receiving dock with a plain trailer, palletised cartons, receiving bench and manual pallet jack. This is a fictional educational scene, not a photograph of a real facility."
  },
  "outbound": {
    "photos": [
      "dispatch-b2c"
    ],
    "role": "Stage and scan verified loads, then hand over to the correct carrier or store route. Parcel and freight handoffs share the outbound side but use different rules.",
    "context": "AI-generated illustration: An illustrative extendable conveyor loading consumer parcels into an outbound trailer. This is a fictional educational scene, not a photograph of a real facility."
  },
  "aisle-north": {
    "photos": [
      "amr"
    ],
    "role": "The upper cross-aisle connects receiving with storage ports and the fulfillment side. Working clearances require site-specific design.",
    "context": "AI-generated illustration of a low mobile robot transporting a pallet of bulky boxed goods. This is a fictional educational scene, not a photograph of a real facility."
  },
  "aisle-south": {
    "photos": [
      "forklift-b2b"
    ],
    "role": "The lower cross-aisle connects reserve racks, B2B preparation, returns and support operations. Local working aisles are included inside the other zones.",
    "context": "AI-generated illustration: An illustrative unoccupied electric forklift with lowered forks carrying a pallet of cartons. This is a fictional educational scene, not a photograph of a real facility."
  },
  "reserve": {
    "photos": [
      "storage-b2b"
    ],
    "role": "Reserve pallet inventory holds accepted goods until full loads are needed or stock is replenished to active picking areas.",
    "context": "AI-generated illustration: An illustrative conventional wide-aisle warehouse with static pallet racks holding carton stock. This is a fictional educational scene, not a photograph of a real facility."
  },
  "highbay": {
    "photos": [
      "highbay"
    ],
    "role": "This concept assigns a high-bay or automated pallet-storage option to compatible loads. Actual height, crane specification and capacity require site-specific design.",
    "context": "AI-generated illustration: An illustrative tall pallet-storage aisle with a rail-guided stacker crane and fenced transfer port. This is a fictional educational scene, not a photograph of a real facility."
  },
  "oversize": {
    "photos": [
      "bulky"
    ],
    "role": "Large or awkward items use appropriate racks or floor locations and suitable handling equipment. They can bypass generic parcel conveyors and sorters.",
    "context": "AI-generated illustration of bulky retail goods on cantilever racks and floor skids. This is a fictional educational scene, not a photograph of a real facility."
  },
  "gtp": {
    "photos": [
      "cube"
    ],
    "role": "Dense small-item storage presents compatible bins or pods to workstations. This is the B2C each-picking subsystem within the shared warehouse.",
    "context": "AI-generated illustration: An illustrative dense bin-storage cube with top-running retrieval robots and a workstation port. This is a fictional educational scene, not a photograph of a real facility."
  },
  "replenish": {
    "photos": [
      "decant"
    ],
    "role": "Decant or replenish compatible stock to the picking system when needed. Some designs pick directly from storage and skip a separate replenishment transfer.",
    "context": "AI-generated illustration: An illustrative open supplier case being emptied into storage totes before put-away. This is a fictional educational scene, not a photograph of a real facility."
  },
  "pick": {
    "photos": [
      "picking-action"
    ],
    "role": "Confirm the ordered product and quantity. People or validated picking equipment handle eaches; goods-to-person robots bring stock to the station.",
    "context": "AI-generated illustration: An illustrative anonymous worker transferring one retail item from a presented inventory tote to an order tote. This is a fictional educational scene, not a photograph of a real facility."
  },
  "pack": {
    "photos": [
      "packing"
    ],
    "role": "Consolidate consumer order lines, check contents, protect the goods and create the correct shipping label. Packaging depends on the item profile.",
    "context": "AI-generated illustration: An illustrative packing bench with an open order carton, protective paper and packing tools. This is a fictional educational scene, not a photograph of a real facility."
  },
  "sort": {
    "photos": [
      "sortation"
    ],
    "role": "Route compatible parcels to the correct carrier or service lane. Bulky goods and store pallet loads use different outbound handling.",
    "context": "AI-generated illustration: An illustrative conveyor junction with parcels routed into different outbound branches. This is a fictional educational scene, not a photograph of a real facility."
  },
  "rack": {
    "photos": [
      "case"
    ],
    "role": "Forward case-picking locations present cartons for store-order selection. Reserve stock replenishes these pick faces as required. Local working aisles support replenishment and picking.",
    "context": "AI-generated illustration: An illustrative carton-flow rack with sloped roller lanes and cases at the pick face. This is a fictional educational scene, not a photograph of a real facility."
  },
  "b2b": {
    "photos": [
      "dispatch-b2b"
    ],
    "role": "Consolidate store cases, prepare stable handling units, apply retailer labels and stage by truck route. Full-pallet lines may bypass case preparation.",
    "context": "AI-generated illustration: An illustrative fenced robotic cell stacking retail cases onto a store-replenishment pallet. This is a fictional educational scene, not a photograph of a real facility."
  },
  "returns": {
    "photos": [
      "returns"
    ],
    "role": "An optional return re-enters for inspection and disposition. Only approved saleable goods rejoin storage after an inventory update; other goods remain on hold or follow approved recovery routes.",
    "context": "AI-generated illustration: An illustrative return-inspection bench with an opened carton and an unbranded product. This is a fictional educational scene, not a photograph of a real facility."
  },
  "control": {
    "photos": [
      "control"
    ],
    "role": "The WMS records inventory and work status; orchestration and fleet systems coordinate execution. Digital instructions are shown with dashed lines, separate from physical goods.",
    "context": "AI-generated illustration: An illustrative unoccupied operations room with generic schematic screens. This is a fictional educational scene, not a photograph of a real facility."
  },
  "maintenance": {
    "photos": [
      "service"
    ],
    "role": "Maintenance space supports inspection, recovery, spares and servicing. Exceptions still require trained people in an automation-heavy operation.",
    "context": "AI-generated illustration: An illustrative locked-out conveyor maintenance station with tools beside a guarded robot cell. This is a fictional educational scene, not a photograph of a real facility."
  },
  "charging": {
    "photos": [
      "charging"
    ],
    "role": "Charging and fleet standby support continued robot operation. Fleet size, charger count and duty cycle are not specified by this concept.",
    "context": "AI-generated illustration: An illustrative row of low mobile robots parked at charging docks. This is a fictional educational scene, not a photograph of a real facility."
  }
};

 Object.assign(metadata,{
  'inbound-qa':{photos:['quality'],role:'A segregated bay holds damaged, unidentified or discrepant inbound stock. Blocked inventory is not available for order allocation until an authorized decision and inventory update.',context:'AI-generated illustration of an inspection and hold operation; a fictional scene.'},
  'aisle-link':{photos:['forklift-b2b'],role:'The reserved north–south transfer aisle connects the two cross-aisles. Store-case replenishment uses this corridor instead of crossing the consumer storage and manned picking areas.',context:'AI-generated illustration of compatible pallet handling; a fictional scene.'}
 });
 metadata.outbound.photos=['dispatch-b2c','truck-b2b'];
 metadata.replenish.role='The B2C decant input port directly adjoins tote storage. Replenishment repeats when stock levels or released demand require it. Store-case refills use the dedicated pallet aisle and forward case faces.';
 metadata.pick.role='This picking port directly adjoins tote storage, separately from decant. Presented inventory is picked into order containers that continue to packing without passing through decant.';
 const Flow=window.WAREHOUSE_OVERVIEW_FLOW;
 const {P,phases}=Flow;
 function activePhases(){return phases.filter(p=>!p.channel||mode==='both'||p.channel===mode).map(p=>Flow.view(p,mode));}
 function routeData(points){const lens=[];let total=0;for(let i=1;i<points.length;i++){const l=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lens.push(l);total+=l;}return{points,lens,total};}
 function sample(route,fraction){let d=Math.max(0,Math.min(1,fraction))*route.total;for(let i=0;i<route.lens.length;i++){const a=route.points[i],b=route.points[i+1],l=route.lens[i];if(d<=l||i===route.lens.length-1){const t=l?d/l:0;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,unit:a.unit||'case'};}d-=l;}return route.points[route.points.length-1];}
 const pathD=points=>points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
 const colors={shared:'#ad884b',b2c:'#376eaf',b2b:'#007961',return:'#cf902a'};
 const routes=Object.fromEntries(Object.entries(Flow.ambient).map(([key,points])=>[key,routeData(points)]));
 const guideNodes={};['shared','b2c','b2b','return'].forEach(key=>{guideNodes[key]=svgEl('path',{d:pathD(routes[key].points),stroke:colors[key],class:'w6-flow-guide','data-flow':key,...(key==='return'?{'stroke-dasharray':'4 5'}:{})},model.routeLayer);});
 const digital=svgEl('path',{class:'w6-digital-line',d:pathD(Flow.legs.orderB2C),'data-instruction':'b2c'},model.routeLayer);
 const digitalB2B=svgEl('path',{class:'w6-digital-line',d:pathD(Flow.legs.orderB2B),'data-instruction':'b2b'},model.routeLayer);
 const feedback={};
 const defs=svgEl('defs',{},model.routeLayer);
 const arrow=svgEl('marker',{id:'w6-replenishment-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);
 svgEl('path',{d:'M0 0L10 5L0 10Z',fill:'#835993'},arrow);
 ['b2c','b2b'].forEach(channel=>{feedback[channel]=svgEl('path',{class:'w6-replenishment-feedback',d:pathD(Flow.legs[channel==='b2c'?'feedbackB2C':'feedbackB2B']),'data-feedback':channel,'marker-end':'url(#w6-replenishment-arrow)'},model.routeLayer);});
 const highlights=Array.from({length:3},()=>svgEl('path',{class:'w6-flow-active'},model.routeLayer));
 const shapes={
  pallet:'<rect x="-9" y="-8" width="18" height="16" rx="2"/><path d="M-9-2H9M-9 3H9M-12 11H12"/>',
  case:'<rect x="-8" y="-6" width="16" height="12" rx="1"/><path d="M0-6V6M-8-1H8"/>',
  bin:'<rect x="-8" y="-7" width="16" height="14" rx="3"/><rect x="-4" y="-3" width="8" height="6" rx="1"/>',
  tote:'<path d="M-9-6H9L7 7H-7Z"/><path d="M-10-6H10M-4-2H4"/>',
  parcel:'<path d="M0-10L10-5V6L0 11L-10 6V-5Z"/><path d="M-10-5L0 1L10-5M0 1V11"/>'
 };
 function packet(parent,color,hero=false){const g=svgEl('g',{class:hero?'w6-packet w6-hero':'w6-packet'},parent);if(hero)svgEl('circle',{r:22,fill:color,class:'w6-packet-halo'},g);const shape=svgEl('g',{fill:color,stroke:hero?'#fff7df':'#f3f8ef','stroke-width':hero?1.5:1,transform:hero?'scale(1.25)':'scale(0.8)'},g);return{g,shape,lastUnit:null};}
 function setPacket(obj,pos,unit){obj.g.setAttribute('transform',`translate(${pos.x.toFixed(2)} ${pos.y.toFixed(2)})`);obj.g.setAttribute('data-unit',unit);if(obj.lastUnit!==unit){obj.shape.innerHTML=shapes[unit]||shapes.case;obj.lastUnit=unit;}}
 const packets=[];[['b2c',8,78],['b2b',6,100],['shared',3,64],['return',2,100]].forEach(([kind,count,cycle])=>{for(let i=0;i<count;i++)packets.push({...packet(model.actorLayer,colors[kind]),kind,cycle,offset:i/count+(kind==='b2b'?.03:0)});});
 const robots=[];for(let i=0;i<7;i++){const g=svgEl('g',{class:'w6-robot'},model.actorLayer);g.innerHTML='<ellipse cy="7" rx="12" ry="5" fill="#124332" opacity=".13"/><rect x="-11" y="-7" width="22" height="15" rx="5" fill="#4d8f77" stroke="#f6fbf0" stroke-width="1.5"/><rect x="-5" y="-3" width="10" height="7" rx="2" fill="#c7d7ac"/><circle cx="8" cy="-4" r="1.8" fill="#f0c762"/>';robots.push({g,offset:i/7});}
 const heroes=Array.from({length:3},()=>packet(model.actorLayer,'#d49b2d',true));
 const phaseZone=phase=>phase.zone;
 function setMode(){
  model.setMode(mode);const both=mode==='both';
  digital.style.display=both||mode==='b2c'?'':'none';digitalB2B.style.display=both||mode==='b2b'?'':'none';
  guideNodes.b2c.style.display=both||mode==='b2c'?'':'none';guideNodes.b2b.style.display=both||mode==='b2b'?'':'none';
  guideNodes.return.setAttribute('d',pathD(mode==='b2b'?routes.returnB2B.points:routes.return.points));
  Object.entries(feedback).forEach(([channel,node])=>node.style.display=both||mode===channel?'':'none');
  packets.forEach(p=>p.g.style.display=(p.kind==='shared'||p.kind==='return'||both||p.kind===mode)?'':'none');
  document.querySelectorAll('[data-w6-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.w6Mode===mode)));
  buildPhases();lastPhase=-1;render();
 }
 function buildPhases(){const nav=$('#w6-phases');nav.replaceChildren();activePhases().forEach((phase,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0')+' '+phase.shortLabel;b.title=phase.title;b.dataset.phase=String(i);b.dataset.phaseId=phase.id;b.addEventListener('click',()=>{clock=i*stageSeconds;last=0;lastPhase=-1;render();});nav.append(b);});}
 function render(){
  const list=activePhases(),ticks=clock/stageSeconds,wholeTicks=Math.floor(ticks+1e-9),phaseIndex=wholeTicks%list.length,phase=list[phaseIndex],progress=Math.max(0,ticks-wholeTicks);
  if(lastPhase!==phaseIndex){
   lastPhase=phaseIndex;model.setActive(phase.zones||(phase.id==='inspect'?['inbound','inbound-qa']:phase.zone));
   $('#w6-phase-number').textContent=String(phaseIndex+1).padStart(2,'0');$('#w6-phase-group').textContent=phase.group;$('#w6-phase-title').textContent=phase.title;$('#w6-phase-copy').textContent=phase.copy;
   document.querySelectorAll('#w6-phases button').forEach((b,i)=>{if(i===phaseIndex)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
   $('#w6-announce').textContent=`${phaseIndex+1} of ${list.length}: ${phase.title}.`;
  }
  const progressShown=reduced.matches?1:progress;
  phase.routes.forEach((key,i)=>{
   const route=routeData(Flow.legs[key]),node=highlights[i];
   node.style.display='';node.setAttribute('data-route',key);node.setAttribute('data-phase-id',phase.id);node.setAttribute('d',pathD(route.points));
   node.setAttribute('stroke',phase.type==='data'?'#517aab':phase.type==='return'?colors.return:key==='dispatchB2B'?colors.b2b:key==='dispatchB2C'?colors.b2c:phase.channel?colors[phase.channel]:'#d39b35');
   node.setAttribute('stroke-dasharray',phase.type==='data'?'5 6':`${route.total} ${route.total}`);node.setAttribute('stroke-dashoffset',String(phase.type==='data'?-(clock*9)%22:route.total*(1-progressShown)));
   const actor=heroes[i];actor.g.style.display='';actor.g.setAttribute('data-route',key);
   // An order is an instruction; goods remain in storage until a physical task starts.
   const position=phase.type==='data'?(key==='orderB2B'?P(250,145):P(280,250)):sample(route,progressShown);
   setPacket(actor,position,phase.type==='data'?(key==='orderB2B'?'pallet':'bin'):Flow.legs[key][0].unit);
  });
  for(let i=phase.routes.length;i<3;i++){highlights[i].style.display='none';heroes[i].g.style.display='none';}
  digital.setAttribute('stroke-dashoffset',String(-(clock*9)%22));digital.style.opacity=phase.type==='data'?'1':'.18';
  digitalB2B.setAttribute('stroke-dashoffset',String(-(clock*9)%22));digitalB2B.style.opacity=phase.type==='data'?'1':'.18';
  Object.values(feedback).forEach(node=>{node.style.opacity=['release','replenish','pick','cases'].includes(phase.id)?'.8':'.35';node.setAttribute('stroke-dashoffset',String(-(clock*7)%16));});
  const trafficTime=reduced.matches?0:clock;
  packets.forEach(actor=>{const route=actor.kind==='return'&&mode==='b2b'?routes.returnB2B:routes[actor.kind],fraction=(trafficTime/actor.cycle+actor.offset)%1,position=sample(route,fraction);setPacket(actor,position,position.unit);actor.g.style.opacity=fraction<.015?String(fraction/.015):fraction>.985?String((1-fraction)/.015):'1';});
  robots.forEach((robot,i)=>{const t=(trafficTime/(i%2?48:60)+robot.offset)%1;const x=i<5?115+t*760:120,y=i<5?(i%2?405:195):220+t*160;robot.g.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);});
  $('#w6-phase-fill').style.width=(progress*100)+'%';
 }
 function controls(){$('#w6-pause').textContent=playing?'Ⅱ Pause':'▶ Play';$('#w6-pause').setAttribute('aria-pressed',String(playing));$('#w6-live').textContent=playing?'● Auto-running':'Ⅱ Paused';$('#w6-reduced').hidden=!reduced.matches;}
 function loop(t){if(!playing)return;if(last)clock+=Math.min(t-last,150)/1000*Number($('#w6-speed').value);last=t;render();frame=requestAnimationFrame(loop);}
 function pause(){playing=false;cancelAnimationFrame(frame);last=0;controls();}
 function play(){playing=true;last=0;controls();cancelAnimationFrame(frame);frame=requestAnimationFrame(loop);}
 $('#w6-pause').addEventListener('click',()=>playing?pause():play());$('#w6-restart').addEventListener('click',()=>{clock=0;last=0;lastPhase=-1;render();});document.querySelectorAll('[data-w6-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.w6Mode;clock=0;last=0;setMode();}));
 $('#w6-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#w6-live').textContent='Full view already fitted';}});document.addEventListener('fullscreenchange',()=>$('#w6-fullscreen').textContent=document.fullscreenElement?'⛶ Exit full screen':'⛶ Full screen');
 let gallery=[],galleryIndex=0,currentZone='';
 function openZone(id){const z=zoneMap[id];if(!z)return;resumeAfterModal=playing;pause();currentZone=id;gallery=metadata[id].photos;galleryIndex=0;$('#w6-photo-title').textContent=z.label;$('#w6-zone-area').textContent=({shared:'Shared operations',b2c:'B2C · Consumer orders',b2b:'B2B · Store replenishment',support:'Support operations'})[z.group];$('#w6-zone-dims').textContent='Illustrative zone · Not to scale';$('#w6-zone-role').textContent=metadata[id].role;$('#w6-zone-context').textContent=metadata[id].context;renderPhoto();$('#w6-photo-dialog').showModal();}
 function renderPhoto(){const p=photos[gallery[galleryIndex]];$('#w6-photo').src=p.path;$('#w6-photo').alt=p.alt;$('#w6-photo-alt').textContent=p.alt;$('#w6-zone-context').textContent=p.depicts;$('#w6-photo-source').href=p.sourcePage;$('#w6-photo-source').textContent=p.attribution+' · Prompt & provenance ↗';$('#w6-photo-count').textContent=`${galleryIndex+1} of ${gallery.length}`;$('#w6-photo-prev').disabled=galleryIndex===0;$('#w6-photo-next').disabled=galleryIndex===gallery.length-1;}
 $('#w6-phase-photo').addEventListener('click',()=>openZone(phaseZone(activePhases()[lastPhase])));$('#w6-photo-close').addEventListener('click',()=>$('#w6-photo-dialog').close());$('#w6-photo-prev').addEventListener('click',()=>{galleryIndex=Math.max(0,galleryIndex-1);renderPhoto();});$('#w6-photo-next').addEventListener('click',()=>{galleryIndex=Math.min(gallery.length-1,galleryIndex+1);renderPhoto();});
 for(const dialog of [$('#w6-photo-dialog'),$('#w6-area-dialog')]){dialog.addEventListener('close',()=>{if(resumeAfterModal)play();resumeAfterModal=false;});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});}
 $('#w6-area').addEventListener('click',()=>{resumeAfterModal=playing;pause();$('#w6-area-dialog').showModal();});$('#w6-area-close').addEventListener('click',()=>$('#w6-area-dialog').close());
 const rows=$('#w6-area-rows');zones.forEach(z=>{const tr=document.createElement('tr');[z.label,({shared:'Shared',b2c:'B2C',b2b:'B2B',support:'Support'})[z.group],metadata[z.id].role].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});rows.append(tr);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);last=0;}else if(playing){last=0;frame=requestAnimationFrame(loop);}});reduced.addEventListener('change',()=>{pause();render();});
 let overviewWasPlaying=false;
 document.addEventListener('warehouse:viewchange',e=>{if(e.detail.view==='process'){overviewWasPlaying=playing;pause();}else if(overviewWasPlaying){overviewWasPlaying=false;play();}});
 document.addEventListener('warehouse:open-zone',e=>{if(zoneMap[e.detail.zone]){model.setActive(e.detail.zone);openZone(e.detail.zone);}});
 setMode();controls();if(playing)frame=requestAnimationFrame(loop);
 // Symbol counts and movement are illustrative; the clock is a learning animation, not a warehouse performance model.
})();
