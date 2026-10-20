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
 const P=(x,y,unit)=>({x,y,unit});
 const phases=[
  {zone:'inbound',title:'Receive supplier goods',group:'Inbound',copy:'Pallets and cartons arrive, are identified and move into receiving. Shared inbound stock can later serve either channel.',unit:'pallet',points:[P(-30,300),P(50,300)]},
  {zone:'inbound',title:'Scan, count and accept',group:'Inbound checks',copy:'Confirm the receipt and inspect condition. Stock with an unresolved discrepancy stays on hold.',unit:'case',points:[P(50,300),P(60,355)]},
  {zone:'highbay',title:'Put away into reserve',group:'Storage',copy:'Record the storage location. Pallet reserve and high-bay options handle compatible loads; their capacity is not estimated here.',unit:'pallet',points:[P(60,355),P(85,355),P(85,195),P(550,195),P(550,145)]},
  {zone:'replenish',title:'Decant and replenish bins',group:'Inventory',channel:'b2c',copy:'Bring reserve cases to goods-in. Identify the items and confirm quantities as compatible stock is decanted into bins.',unit:'case',points:[P(550,145),P(550,195),P(450,195),P(450,270)]},
  {zone:'gtp',title:'Store and present small items',group:'B2C storage',channel:'b2c',copy:'The filled bins enter the small-item storage subsystem. Mobile robots present stock; grasping is a separate task.',unit:'bin',points:[P(450,270),P(450,195),P(250,195),P(250,270)]},
  {zone:'control',title:'Reserve stock and release work',group:'Digital order',type:'data',copy:'Orders become pick tasks. The dashed instruction travels to execution; inventory does not move into the control room.',unit:'tote',points:[P(850,450),P(895,450),P(895,405),P(575,405),P(575,300)]},
  {zone:'pick',title:'Pick the consumer order',group:'B2C fulfillment',channel:'b2c',copy:'Present inventory from small-item storage and confirm the ordered products into a tote. Exceptions and difficult items need suitable handling.',unit:'tote',points:[P(250,270),P(250,355),P(575,355),P(575,300)]},
  {zone:'pack',title:'Pack, verify and label',group:'B2C fulfillment',channel:'b2c',copy:'Combine the order, protect the goods and label the parcel. The material stream continues through the parcel line.',unit:'parcel',points:[P(575,300),P(575,355),P(715,355),P(715,300)]},
  {zone:'rack',title:'Pick cases for the store',group:'B2B case picking',channel:'b2b',copy:'Reserve stock feeds the case-picking area. Collect the store quantities for the mixed-case consolidation route shown here.',unit:'case',points:[P(550,145),P(550,195),P(495,195),P(495,405),P(300,405),P(300,510)]},
  {zone:'b2b',title:'Prepare the retail store load',group:'B2B fulfillment',channel:'b2b',copy:'Picked cases become stable, labeled store loads. This is the mixed-case route; full-pallet order lines can bypass case preparation in a different configuration.',unit:'pallet',points:[P(300,510),P(300,405),P(600,405),P(600,510)]},
  {zone:'sort',title:'Sort the consumer parcels',group:'B2C outbound',channel:'b2c',copy:'Direct compatible parcels to the carrier and service lane. Store pallets use the separate B2B preparation route.',unit:'parcel',points:[P(715,300),P(715,355),P(840,355),P(840,300)]},
  {zone:'outbound',title:'Dispatch both channels',group:'Outbound',copy:'Scan handover and load the appropriate vehicle. Road transport and delivery happen beyond this indoor footprint.',unit:'parcel',points:[P(840,300),P(840,355),P(950,355),P(950,300),P(1040,300)]},
  {zone:'returns',title:'Inspect an optional return',group:'Reverse flow · optional',type:'return',copy:'A returned item re-enters for inspection. Saleable stock may be restocked; damaged or uncertain stock remains blocked for a decision.',unit:'parcel',points:[P(1040,560),P(1040,640),P(750,640),P(750,550),P(750,510)]},
  {zone:'gtp',title:'Restock approved inventory',group:'Return disposition · example',type:'return',copy:'This example follows an approved saleable return back to storage after the inventory update. Other dispositions follow different routes.',unit:'bin',points:[P(750,510),P(750,405),P(250,405),P(250,350)]}
 ];
 function activePhases(){return phases.filter(p=>!p.channel||mode==='both'||p.channel===mode);}
 function phasePoints(p){if(p.type==='data'&&mode==='b2b')return [P(850,450),P(850,405),P(300,405),P(300,510)];if(p.zone==='outbound'&&mode==='b2b')return [P(600,510),P(695,510),P(695,405),P(950,405),P(950,510),P(1040,510)];if(p.type==='return'&&p.zone==='gtp'&&mode==='b2b')return[P(750,510),P(750,405),P(495,405),P(495,195),P(550,195),P(550,145)];return p.points;}
 function routeData(points){const lens=[];let total=0;for(let i=1;i<points.length;i++){const l=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lens.push(l);total+=l;}return{points,lens,total};}
 function sample(route,fraction){let d=Math.max(0,Math.min(1,fraction))*route.total;for(let i=0;i<route.lens.length;i++){const a=route.points[i],b=route.points[i+1],l=route.lens[i];if(d<=l||i===route.lens.length-1){const t=l?d/l:0;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,unit:a.unit||'case'};}d-=l;}return route.points[route.points.length-1];}
 const pathD=points=>points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
 const colors={shared:'#ad884b',b2c:'#376eaf',b2b:'#007961',return:'#cf902a'};
 const routes={
  b2c:routeData([P(-30,300,'pallet'),P(50,300,'pallet'),P(85,300,'pallet'),P(85,195,'case'),P(450,195,'case'),P(450,270,'bin'),P(450,195,'bin'),P(250,195,'bin'),P(250,270,'bin'),P(250,355,'bin'),P(575,355,'tote'),P(715,355,'parcel'),P(840,355,'parcel'),P(950,355,'parcel'),P(950,300,'parcel'),P(1040,300,'parcel')]),
  b2b:routeData([P(-30,300,'pallet'),P(50,300,'pallet'),P(85,300,'pallet'),P(85,195,'pallet'),P(550,195,'pallet'),P(550,145,'pallet'),P(550,195,'pallet'),P(495,195,'case'),P(495,405,'case'),P(300,405,'case'),P(300,510,'case'),P(300,405,'case'),P(600,405,'case'),P(600,510,'pallet'),P(695,510,'pallet'),P(695,405,'pallet'),P(950,405,'pallet'),P(950,510,'pallet'),P(1040,510,'pallet')]),
  shared:routeData([P(50,300,'pallet'),P(85,300,'pallet'),P(85,405,'pallet'),P(300,405,'pallet'),P(300,510,'pallet'),P(300,405,'case'),P(450,405,'case'),P(450,355,'case')]),
  return:routeData([P(1040,560,'parcel'),P(1040,640,'parcel'),P(750,640,'parcel'),P(750,550,'parcel'),P(750,510,'bin'),P(750,405,'bin'),P(250,405,'bin'),P(250,350,'bin')])
 };
 const returnB2B=routeData([P(1040,560,'pallet'),P(1040,640,'pallet'),P(750,640,'pallet'),P(750,550,'pallet'),P(750,510,'pallet'),P(750,405,'pallet'),P(495,405,'pallet'),P(495,195,'pallet'),P(550,195,'pallet'),P(550,145,'pallet')]);
 const guideNodes={};Object.entries(routes).forEach(([key,r])=>{guideNodes[key]=svgEl('path',{d:pathD(r.points),stroke:colors[key],class:'w6-flow-guide',...(key==='return'?{'stroke-dasharray':'4 5'}:{})},model.routeLayer);});
 const digital=svgEl('path',{class:'w6-digital-line',d:pathD(phases.find(p=>p.type==='data').points)},model.routeLayer);
 const digitalB2B=svgEl('path',{class:'w6-digital-line',d:pathD([P(850,450),P(850,405),P(300,405),P(300,510)])},model.routeLayer);
 const highlight=svgEl('path',{class:'w6-flow-active'},model.routeLayer);
 const shapes={
  pallet:'<rect x="-9" y="-8" width="18" height="16" rx="2"/><path d="M-9-2H9M-9 3H9M-12 11H12"/>',
  case:'<rect x="-8" y="-6" width="16" height="12" rx="1"/><path d="M0-6V6M-8-1H8"/>',
  bin:'<rect x="-8" y="-7" width="16" height="14" rx="3"/><rect x="-4" y="-3" width="8" height="6" rx="1"/>',
  tote:'<path d="M-9-6H9L7 7H-7Z"/><path d="M-10-6H10M-4-2H4"/>',
  parcel:'<path d="M0-10L10-5V6L0 11L-10 6V-5Z"/><path d="M-10-5L0 1L10-5M0 1V11"/>'
 };
 function packet(parent,color,hero=false){const g=svgEl('g',{class:'w6-packet'},parent);if(hero)svgEl('circle',{r:22,fill:color,class:'w6-packet-halo'},g);const shape=svgEl('g',{fill:color,stroke:hero?'#fff7df':'#f3f8ef','stroke-width':hero?1.5:1,transform:hero?'scale(1.25)':'scale(0.8)'},g);return{g,shape,lastUnit:null};}
 function setPacket(obj,pos,unit){obj.g.setAttribute('transform',`translate(${pos.x.toFixed(2)} ${pos.y.toFixed(2)})`);if(obj.lastUnit!==unit){obj.shape.innerHTML=shapes[unit]||shapes.case;obj.lastUnit=unit;}}
 const packets=[];[['b2c',8,78],['b2b',6,100],['shared',4,64],['return',2,100]].forEach(([kind,count,cycle])=>{for(let i=0;i<count;i++)packets.push({...packet(model.actorLayer,colors[kind]),kind,cycle,offset:i/count+(kind==='b2b'?.03:0)});});
 const robots=[];for(let i=0;i<7;i++){const g=svgEl('g',{class:'w6-robot'},model.actorLayer);g.innerHTML='<ellipse cy="7" rx="12" ry="5" fill="#124332" opacity=".13"/><rect x="-11" y="-7" width="22" height="15" rx="5" fill="#4d8f77" stroke="#f6fbf0" stroke-width="1.5"/><rect x="-5" y="-3" width="10" height="7" rx="2" fill="#c7d7ac"/><circle cx="8" cy="-4" r="1.8" fill="#f0c762"/>';robots.push({g,offset:i/7});}
 const hero=packet(model.actorLayer,'#d49b2d',true);
 function phaseZone(phase){return phase.type==='return'&&phase.zone==='gtp'&&mode==='b2b'?'highbay':phase.zone;}
 function setMode(){model.setMode(mode);const both=mode==='both';digital.style.display=both||mode==='b2c'?'':'none';digitalB2B.style.display=both||mode==='b2b'?'':'none';guideNodes.b2c.style.display=both||mode==='b2c'?'':'none';guideNodes.b2b.style.display=both||mode==='b2b'?'':'none';guideNodes.return.setAttribute('d',pathD(mode==='b2b'?returnB2B.points:routes.return.points));packets.forEach(p=>p.g.style.display=(p.kind==='shared'||p.kind==='return'||both||p.kind===mode)?'':'none');document.querySelectorAll('[data-w6-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.w6Mode===mode)));buildPhases();lastPhase=-1;render();}
 function buildPhases(){const nav=$('#w6-phases');nav.replaceChildren();activePhases().forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0')+' '+p.title.replace(/^(Receive |Scan, count and |Put away into |Store and present |Replenish |Reserve stock and |Pick the |Pack, verify and |Prepare the |Sort the |Dispatch |Inspect an |Restock )/,'');b.title=p.title;b.dataset.phase=String(i);b.addEventListener('click',()=>{clock=i*stageSeconds;last=0;lastPhase=-1;render();});nav.append(b);});}
 function render(){const list=activePhases(),phaseIndex=Math.floor(clock/stageSeconds)%list.length,phase=list[phaseIndex],progress=(clock%stageSeconds)/stageSeconds;
  if(lastPhase!==phaseIndex){lastPhase=phaseIndex;model.setActive(phaseZone(phase));$('#w6-phase-number').textContent=String(phaseIndex+1).padStart(2,'0');$('#w6-phase-group').textContent=phase.group;$('#w6-phase-title').textContent=phase.title;$('#w6-phase-copy').textContent=phase.copy;document.querySelectorAll('#w6-phases button').forEach((b,i)=>{if(i===phaseIndex)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('#w6-announce').textContent=`${phaseIndex+1} of ${list.length}: ${phase.title}.`;}
  const p=reduced.matches?1:progress,phaseRoute=routeData(phasePoints(phase));highlight.setAttribute('d',pathD(phaseRoute.points));highlight.setAttribute('stroke',phase.type==='data'?'#517aab':phase.type==='return'?colors.return:phase.channel?colors[phase.channel]:'#d39b35');highlight.setAttribute('stroke-dasharray',`${phaseRoute.total} ${phaseRoute.total}`);highlight.setAttribute('stroke-dashoffset',String(phaseRoute.total*(1-p)));
  digital.setAttribute('stroke-dashoffset',String(-(clock*9)%22));digital.style.opacity=phase.type==='data'?'1':'.18';digitalB2B.setAttribute('stroke-dashoffset',String(-(clock*9)%22));digitalB2B.style.opacity=phase.type==='data'?'1':'.18';
  const heroPos=phase.type==='data'?(mode==='b2b'?P(550,145):P(250,270)):sample(phaseRoute,p);setPacket(hero,heroPos,phase.type==='data'?(mode==='b2b'?'pallet':'bin'):phase.unit);
  const trafficTime=reduced.matches?0:clock;packets.forEach(packet=>{const r=packet.kind==='return'&&mode==='b2b'?returnB2B:routes[packet.kind],fraction=(trafficTime/packet.cycle+packet.offset)%1,pos=sample(r,fraction);setPacket(packet,pos,pos.unit);packet.g.style.opacity=fraction<.015?String(fraction/.015):fraction>.985?String((1-fraction)/.015):'1';});
  robots.forEach((robot,i)=>{const t=(trafficTime/(i%2?48:60)+robot.offset)%1;let x,y;if(i<5){x=115+t*760;y=i%2?405:195;}else{x=895;y=420+t*160;}robot.g.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);});
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
