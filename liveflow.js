(() => {
 'use strict';
 const root=document.getElementById('view-liveflow');if(!root)return;
 const q=s=>root.querySelector(s), photos=Object.fromEntries((window.WAREHOUSE_PHOTOS||[]).map(p=>[p.key,p]));
 const categories={
  apparel:{name:'Apparel',storage:'bin',storeName:'Bins / goods-to-person',rule:'Correct size, colour and quantity',inspect:'Scan the SKU and check the size and colour variant against the expected delivery.',pick:'Pick the ordered size and colour into a tote. Multi-item orders are consolidated before packing.',pain:'Similar garments and variants cause wrong-item picks; returns may need condition checks and repacking.'},
  grocery:{name:'Ambient grocery',storage:'bin',storeName:'Bins or pallet reserve',rule:'Lot and expiry rules where applicable',inspect:'Record lot and expiry information where required. Check packaging condition and configure the stock-rotation rule.',pick:'Pick ambient goods by the configured lot and expiry rule. Keep fragile and heavy products suitably separated.',pain:'Incorrect dates, damaged packs and empty pick faces cause waste and short picks. Chilled and frozen goods require a different validated flow.'},
  electronics:{name:'Electronics',storage:'rack',storeName:'Shelving / tote retrieval',rule:'Identity and serial tracking where required',inspect:'Identify the exact model and capture serial numbers where the business requires them. Resolve damaged packaging before acceptance.',pick:'Confirm the correct model and capture serial identity where required. Protect fragile and high-value goods.',pain:'Similar model numbers, missing accessories and transit damage drive costly exceptions and returns.'},
  bulky:{name:'Bulky & home',storage:'oversize',storeName:'Oversize racks / floor locations',rule:'Weight, dimensions and load stability',inspect:'Capture the handling dimensions and weight. Check access, load stability and condition before putting the item away.',pick:'Retrieve the compatible pallet or bulky item to a consolidation point. Large loads need handling equipment suited to their size and weight.',pain:'Oversize loads, awkward handling and damage can constrain throughput. Generic parcel sorters may be unsuitable.'}
 };
 const systems={OMS:'Order management system',ERP:'Enterprise resource planning',WMS:'Warehouse management system',WES:'Warehouse execution system',FMS:'Robot fleet manager',WCS:'Warehouse control system',TMS:'Transport management system'};
 const units={pallet:'Pallet',case:'Case / carton',bin:'Storage bin',tote:'Order tote',parcel:'Customer parcel'};
 const zoneInfo={
  "inbound": {
    "title": "Inbound dock",
    "photos": [
      "receiving"
    ],
    "explain": "AI-generated illustration: An illustrative receiving dock with a plain trailer, palletised cartons, receiving bench and manual pallet jack. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Missing shipment information and dock queues delay accepted stock.",
    "robot": "Use handling equipment suited to the load. Carton unloading, pallet movement and tote transport are different tasks."
  },
  "receiving": {
    "title": "Receive, scan & inspect",
    "photos": [
      "receiving-scan"
    ],
    "explain": "AI-generated illustration: An illustrative gloved hand using a scanner to identify an inbound carton. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Bad identifiers and incorrect receipt quantities become downstream stock discrepancies.",
    "robot": "Scanners, weighing and validated vision checks support identification. People resolve uncertain results."
  },
  "bin": {
    "title": "Bin and goods-to-person storage",
    "photos": [
      "cube"
    ],
    "explain": "AI-generated illustration: An illustrative dense bin-storage cube with top-running retrieval robots and a workstation port. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Poor slotting and inaccurate inventory create travel and search time.",
    "robot": "Mobile robots can bring storage pods to stations. Cube storage, shuttle systems and pod transport use different mechanisms."
  },
  "pallet": {
    "title": "Pallet storage",
    "photos": [
      "storage-b2b"
    ],
    "explain": "AI-generated illustration: An illustrative conventional wide-aisle warehouse with static pallet racks holding carton stock. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Unrecorded moves, unstable loads and aisle congestion affect capacity and safety.",
    "robot": "Compatible autonomous forklifts and pallet AS/RS can move or retrieve pallet loads. Fit depends on racks, loads, floor and traffic."
  },
  "rack": {
    "title": "Shelving and tote storage",
    "photos": [
      "case"
    ],
    "explain": "AI-generated illustration: An illustrative carton-flow rack with sloped roller lanes and cases at the pick face. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Many SKU variants and uncertain location records make the correct item hard to find.",
    "robot": "Tote-retrieval systems can present compatible inventory. Actual shelving and load compatibility need validation."
  },
  "oversize": {
    "title": "Oversize and bulky storage",
    "photos": [
      "bulky"
    ],
    "explain": "AI-generated illustration of bulky retail goods on cantilever racks and floor skids. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Large dimensions, heavy goods and limited access require careful handling.",
    "robot": "Pallet transport can be automated for compatible loads. Oversize or unstable products may still need specialist human handling."
  },
  "replenish": {
    "title": "Replenishment and handoffs",
    "photos": [
      "decant"
    ],
    "explain": "AI-generated illustration: An illustrative open supplier case being emptied into storage totes before put-away. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "A pick face can be empty while reserve stock remains elsewhere in the building.",
    "robot": "AMRs transport totes or cases. Digit has commercially moved totes between mobile robots and conveyors; that is a narrow handling task."
  },
  "pick": {
    "title": "Order picking",
    "photos": [
      "picking-action"
    ],
    "explain": "AI-generated illustration: An illustrative anonymous worker transferring one retail item from a presented inventory tote to an order tote. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Travel, similar-looking SKUs and short picks slow order completion.",
    "robot": "Goods-to-person and assisted picking reduce travel. Automated piece picking depends on the actual item and gripper."
  },
  "pack": {
    "title": "Packing and verification",
    "photos": [
      "packing",
      "quality"
    ],
    "explain": "AI-generated illustration: An illustrative packing bench with an open order carton, protective paper and packing tools. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Missing items, wrong labels and packing queues cause late or inaccurate shipments.",
    "robot": "Carton machinery, check weighing and print-and-apply can support compatible parcel flows. Fragile and oversize goods require different treatment."
  },
  "palletise": {
    "title": "Palletise and protect",
    "photos": [
      "dispatch-b2b"
    ],
    "explain": "AI-generated illustration: An illustrative fenced robotic cell stacking retail cases onto a store-replenishment pallet. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Poor stack stability, wrong store quantities and damage affect store service.",
    "robot": "Palletising arms can place compatible cases into planned stacking patterns. Mixed-case stability must be evaluated."
  },
  "sort": {
    "title": "Parcel sortation",
    "photos": [
      "sortation"
    ],
    "explain": "AI-generated illustration: An illustrative conveyor junction with parcels routed into different outbound branches. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Unreadable labels, wrong lanes and jams create misroutes or missed cutoffs.",
    "robot": "Sorters and conveyor controls route compatible parcels. Bulky freight can bypass this parcel line."
  },
  "staging": {
    "title": "Store-route staging",
    "photos": [
      "staging"
    ],
    "explain": "AI-generated illustration: An illustrative outbound area with separate rows of prepared palletised store loads. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Late pallets and staging congestion can cause missed truck appointments.",
    "robot": "Transport AMRs and compatible autonomous forklifts can bring loads to staging; people resolve loading exceptions."
  },
  "outbound": {
    "title": "Dispatch and carrier handover",
    "photos": [
      "dispatch-b2c",
      "truck-b2b"
    ],
    "explain": "AI-generated illustration: An illustrative extendable conveyor loading consumer parcels into an outbound trailer. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Wrong loads, missed collections and incomplete handover scans break the service promise.",
    "robot": "Conveyors and transport robots can move suitable loads; transport planning coordinates carrier and route choices."
  },
  "destination": {
    "title": "Delivery outside the warehouse",
    "photos": [
      "delivery-b2c",
      "truck-b2b"
    ],
    "explain": "AI-generated illustration: An illustrative plain parcel placed at a generic residential doorstep. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Failed delivery, transit damage or a missed store slot can still disrupt the order.",
    "robot": "This stage belongs to the transport and receiving operation. Warehouse robots do not perform the whole last-mile journey."
  },
  "returns": {
    "title": "Returns inspection",
    "photos": [
      "returns"
    ],
    "explain": "AI-generated illustration: An illustrative return-inspection bench with an opened carton and an unbranded product. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Unknown condition, missing parts and inconsistent grading slow recovery.",
    "robot": "Scanning and sortation can help route known categories. Arbitrary opening, testing and grading require validated task-specific handling."
  },
  "hold": {
    "title": "Hold and exception review",
    "photos": [
      "returns"
    ],
    "explain": "AI-generated illustration: An illustrative return-inspection bench with an opened carton and an unbranded product. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Automatically restocking uncertain items creates quality and inventory problems.",
    "robot": "Automation may move a standardized container; a responsible person still resolves the exception and authorizes release."
  },
  "control": {
    "title": "Order and warehouse control",
    "photos": [
      "control"
    ],
    "explain": "AI-generated illustration: An illustrative unoccupied operations room with generic schematic screens. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Duplicate tasks, stale stock and lost acknowledgements create execution and inventory conflicts.",
    "robot": "The WMS records warehouse inventory; orchestration coordinates executable work and fleet managers dispatch robots. Machine safety remains local."
  },
  "humanoid": {
    "title": "Humanoid tote handling · Digit at GXO",
    "photos": [
      "humanoid"
    ],
    "explain": "AI-generated illustration: An illustrative generic biped robot transferring one tote beside a conveyor. This is a fictional educational scene, not a photograph of a real facility.",
    "pain": "Repeated container transfers can be physically demanding and create station handoff delays.",
    "robot": "A humanoid can be evaluated for a constrained tote transfer. Compare successful cycles, intervention rates and total cost with a fixed arm, conveyor or wheeled manipulator."
  }
};
 let category='apparel',channel='b2c',steps=[],index=0,fraction=0,playing=false,last=0,raf=0,zoom=1,fit=false,drag=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');const msPerStep=5500;
 const plan=new window.WarehouseFloorplan(q('#lf-canvas'),{onZoneClick:zone=>{const i=steps.findIndex(s=>s.zone===zone);if(i>=0)go(i);else pause();openPhotos(zone);},onStageClick:i=>go(i)});
 const createStep=(zone,title,text,extra={})=>({zone,label:title,title,text,type:'goods',unit:'case',systems:['WMS'],equipment:'Scanner and warehouse team',kpi:'Accuracy and completion time',event:'task.completed',phase:'Warehouse',...extra});
 function storageFor(){if(channel==='b2b'&&q('#lf-pallet').value==='full')return 'pallet';if(category==='grocery'&&channel==='b2b')return 'pallet';return categories[category].storage;}
 function build(){const c=categories[category],store=storageFor(),b2b=channel==='b2b',full=b2b&&q('#lf-pallet').value==='full',bulky=category==='bulky';const stUnit=store==='bin'?'bin':store==='pallet'||bulky?'pallet':'tote';const list=[
  createStep('inbound','Supplier delivery arrives','Receive supplier pallets or cartons at an available dock. Match the shipment to its expected receipt before accepting stock.',{unit:'pallet',phase:'Inbound',systems:['WMS','ERP'],event:'shipment.arrived',kpi:'Dock waiting time',equipment:'Dock and compatible unloading equipment'}),
  createStep('receiving','Scan, count and inspect',c.inspect+' Any discrepancy or damaged stock is held for review.',{unit:full?'pallet':'case',phase:'Inbound',event:'receipt.accepted',kpi:'Receipt accuracy',equipment:'Barcode scanner; weighing or vision where appropriate'}),
  createStep(store,'Put away into storage','Store accepted goods at a recorded location. '+(store==='bin'?'Bins or pods support goods-to-person presentation.':store==='rack'?'Shelving or tote storage suits compatible small products.':store==='oversize'?'Oversize locations are selected for actual load dimensions and handling constraints.':'Pallet reserve keeps compatible loads together.'),{unit:stUnit,phase:'Inventory',systems:['WMS','WES','FMS','WCS'],event:'inventory.putaway_confirmed',kpi:'Location accuracy',equipment:store==='bin'?'Bin / pod storage and transport':store==='rack'?'Shelving or tote retrieval':store==='oversize'?'Oversize racks and suitable handling equipment':'Pallet racks or compatible pallet AS/RS'})
 ];
 if(!full&&!bulky)list.push(createStep('replenish','Refill pick locations when needed','Move reserve stock to the forward picking location. Some designs pick directly from storage and skip this transfer.',{unit:'tote',phase:'Inventory',systems:['WMS','WES','FMS'],event:'replenishment.completed',kpi:'Pick-face stockouts',equipment:'Tote/case transport; worker or AMR'}));
 list.push(createStep('control','Order reserved and released',b2b?'A store order reserves stock and releases work by route and delivery appointment. This is a digital task, not stock moving into the control room.':'A shopper order reserves stock and releases pick work by delivery promise. The physical load waits while the digital instruction is sent.',{type:'data',unit:stUnit,phase:'Digital order',systems:['OMS','WMS','WES'],event:'order.released',kpi:'Backlog and promise attainment',equipment:'Order and inventory software'}));
 if(!full){list.push(createStep('pick',b2b?(bulky?'Retrieve bulky store goods':'Pick cases for the store'):'Pick the customer order',b2b&&!bulky?'Collect the required cases for the store order. Keep store allocation and case-to-each conversions correct.':c.pick,{unit:bulky?'pallet':b2b?'case':'tote',phase:'Fulfillment',systems:['WMS','WES','FMS'],event:'pick.confirmed',kpi:'Pick accuracy; lines per hour',equipment:bulky?'Compatible pallet / bulky-item handling':'Goods-to-person or assisted/manual picking'}));list.push(createStep(b2b?'palletise':'pack',b2b?(bulky?'Protect and consolidate the store load':'Build and label the store load'):bulky?'Protect the bulky shipment':'Pack, verify and label',b2b?(bulky?'Consolidate compatible large items, secure the load and protect surfaces. Specialist handling replaces generic case-palletising where needed.':'Consolidate cases into a stable pallet or handling unit, apply retailer labels and protect the load.'):bulky?'Use protective packaging and handling suited to the item. This route bypasses a generic small-parcel sorter.':'Consolidate the order, check items and quantity, protect the goods and attach the correct parcel label.',{unit:b2b||bulky?'pallet':'parcel',phase:'Outbound',systems:['WMS','WES','WCS'],event:'shipment_unit.closed',kpi:'Pack accuracy; damage rate',equipment:bulky?'Specialist protective packing and load preparation':b2b?'Palletising and wrapping; compatible robot arm':bulky?'Specialist protective packing':'Packing station, label printer, compatible carton machinery'}));}
 if(b2b)list.push(createStep('staging',full?'Retrieve full pallet to staging':'Stage by store route',full?'Retrieve the allocated full pallet directly from storage to route staging. It bypasses case picking and palletising in this scenario.':'Move the completed store load to its route lane, ready for the assigned truck and delivery slot.',{unit:'pallet',phase:'Outbound',systems:['WMS','WES','FMS','TMS'],event:'load.staged',kpi:'Load ready before appointment',equipment:'Pallet handling and route lanes'}));
 else if(!bulky)list.push(createStep('sort','Sort by carrier and cutoff','Scan the shipment identity and direct the parcel to the appropriate carrier or service lane.',{unit:'parcel',phase:'Outbound',systems:['WCS','TMS'],event:'parcel.sorted',kpi:'Mis-sort and missed cutoff rate',equipment:'Compatible parcel conveyor / sorter'}));
 list.push(createStep('outbound','Dispatch and confirm handover','Verify the physical load, scan handover and confirm the shipment departure. Carrier or route status is sent back to the order system.',{unit:b2b||bulky?'pallet':'parcel',phase:'Outbound',systems:['WMS','TMS','ERP','OMS'],event:'shipment.dispatched',kpi:'On-time ship rate',equipment:b2b||bulky?'Freight dock and load scanner':'Outbound trailer / carrier handover'}));
 list.push(createStep('destination',b2b?'Deliver to the retail store':'Deliver to the consumer',b2b?'Transport delivers the load to the store. The store checks receipt and replenishes its shelves or backroom. Delivery is outside the warehouse.':'The carrier network delivers the order to the customer. This transport step takes place outside the warehouse, after dispatch.',{type:'external',unit:b2b||bulky?'pallet':'parcel',phase:'Outside warehouse',systems:['TMS','OMS'],event:'delivery.confirmed',kpi:'Delivery success; condition on receipt',equipment:'Appropriate freight or delivery vehicle'}));
 if(q('#lf-returns').checked){list.push(createStep('returns','Return re-enters for inspection','An optional return travels back from the destination. Match it to the original shipment and inspect condition before deciding whether it can be sold again.',{type:'return',unit:b2b||bulky?'pallet':'parcel',phase:'Optional reverse flow',systems:['OMS','WMS'],event:'return.inspected',kpi:'Return cycle time',equipment:'Returns inspection bench'}));const held=q('#lf-disposition').value==='hold';list.push(createStep(held?'hold':store,held?'Hold uncertain goods for review':'Restock approved saleable goods',held?'Keep uncertain or damaged stock blocked. A responsible person decides whether to repair, return to supplier or use an approved disposal route.':'Only after inspection, approval and an inventory update does saleable stock rejoin its recorded storage location.',{type:'return',unit:stUnit,phase:'Return disposition',systems:['WMS','ERP'],event:held?'exception.hold_created':'inventory.restocked',kpi:'Disposition accuracy',equipment:held?'Controlled hold area':'Recorded storage location'}));}
 return list;
 }
 function scenario(){pause();steps=build();index=0;fraction=0;plan.setScenario({storage:storageFor(),channel,category});plan.setSteps(steps);makeList();root.querySelectorAll('[data-lf-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lfCategory===category)));root.querySelectorAll('[data-lf-channel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lfChannel===channel)));q('#lf-pallet-label').hidden=channel!=='b2b';q('#lf-pallet option[value="mixed"]').textContent=category==='bulky'?'Consolidated bulky loads':'Mixed cases';q('#lf-disposition-label').hidden=!q('#lf-returns').checked;const c=categories[category];q('#lf-profile-store').textContent=storageFor()==='pallet'?'Pallet reserve / full-load storage':c.storeName;q('#lf-profile-rule').textContent=c.rule;q('#lf-profile-out').textContent=channel==='b2b'?'Pallets / store-route loads':category==='bulky'?'Protected bulky shipment':'Parcels / carrier lanes';q('#lf-map-label').textContent=c.name+' / '+channel.toUpperCase();q('#lf-scrub-end').textContent=q('#lf-returns').checked?'Return disposition':'Delivery';render();}
 function makeList(){const ol=q('#lf-step-list');ol.replaceChildren();steps.forEach((s,i)=>{const li=document.createElement('li'),b=document.createElement('button'),n=document.createElement('span'),text=document.createElement('div'),title=document.createElement('b'),phase=document.createElement('small');b.type='button';b.dataset.lfStep=String(i);n.textContent=String(i+1).padStart(2,'0');title.textContent=s.title;phase.textContent=s.phase;text.append(title,phase);b.append(n,text);b.addEventListener('click',()=>go(i));li.append(b);ol.append(li);});}
 function galleryFor(zone){
  if(category==='bulky'&&(zone==='pack'||zone==='palletise'))return ['bulky-pack'];
  if(category==='bulky'&&zone==='destination')return ['bulky-delivery','truck-b2b'];
  if(category==='bulky'&&zone==='outbound')return ['staging','bulky-delivery'];
  if(zone==='pick'&&category==='bulky')return ['bulky','forklift-b2b'];
  if(zone==='pick'&&channel==='b2b')return ['case'];
  if(zone==='destination'&&channel==='b2b')return ['truck-b2b','staging'];
  if(zone==='outbound'&&channel==='b2b')return ['staging','truck-b2b'];
  return (zoneInfo[zone]||zoneInfo.receiving).photos.filter(key=>photos[key]);
 }
 function photoMatch(zone){return 'AI-generated · Illustrative process';}
 function photoExplanation(zone){const p=photos[galleryFor(zone)[0]];return p.depicts;}
 function selectedPhoto(s){return photos[galleryFor(s.zone)[0]];}
 function render(){const s=steps[index];if(!s)return;q('#lf-number').textContent=String(index+1).padStart(2,'0');q('#lf-phase').textContent=s.phase;q('#lf-detail-title').textContent=s.title;q('#lf-detail-text').textContent=s.text;q('#lf-unit').textContent=s.type==='data'?'Digital instruction; load stays put':units[s.unit];q('#lf-equipment').textContent=s.equipment;q('#lf-kpi').textContent=s.kpi;q('#lf-event').textContent=s.event;q('#lf-counter').textContent=`${index+1} / ${steps.length} · ${s.title}`;root.querySelectorAll('[data-lf-step]').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.classList.toggle('done',i<index);});q('#lf-systems').replaceChildren();Object.entries(systems).forEach(([k,v])=>{const a=document.createElement('abbr');a.title=v;a.textContent=k;a.className=s.systems.includes(k)?'on':'';q('#lf-systems').append(a);});const p=selectedPhoto(s);q('#lf-thumb').src=p.thumbnail||p.path;q('#lf-thumb').alt=p.alt;q('#lf-thumb-caption').textContent='AI-generated illustration · '+p.title+'. Click to explore.';q('#lf-prev').disabled=index===0;q('#lf-next').textContent=index===steps.length-1?'↶':'→';q('#lf-next').setAttribute('aria-label',index===steps.length-1?'Replay from first step':'Next process step');q('#lf-announcement').textContent=`Step ${index+1} of ${steps.length}: ${s.title}.`;syncControls();paint();}
 function syncControls(){q('#lf-play').textContent=playing?'Ⅱ Pause':index===steps.length-1&&fraction>=1?'↶ Replay':'▶ Play flow';q('#lf-play').setAttribute('aria-pressed',String(playing));q('#lf-state-label').textContent=playing?'Flow in motion':index===steps.length-1&&fraction>=1?'Journey complete':fraction>0?'Paused':'Ready to play';}
 function paint(){if(!steps.length)return;plan.renderFrame({step:index,progress:reduced.matches?1:fraction,playing:playing&&!reduced.matches,showRobots:true});q('#lf-scrub').value=String(Math.round((index+fraction)/steps.length*1000));}
 function tick(t){if(!playing)return;if(last)fraction+=Math.min(t-last,160)/msPerStep*Number(q('#lf-speed').value);last=t;if(fraction>=1){if(index===steps.length-1){fraction=1;pause();paint();return;}index++;fraction=0;render();}paint();raf=requestAnimationFrame(tick);}
 function pause(){playing=false;cancelAnimationFrame(raf);last=0;syncControls();paint();}
 function play(){if(index===steps.length-1&&fraction>=1){index=0;fraction=0;render();}playing=true;last=0;syncControls();raf=requestAnimationFrame(tick);}
 function go(i){pause();index=Math.max(0,Math.min(steps.length-1,i));fraction=0;render();}
 let gallery=[],galleryIndex=0,modalZone='';
 function openPhotos(zone){pause();modalZone=zone;gallery=galleryFor(zone);galleryIndex=0;renderGallery();q('#lf-photo-dialog').showModal();}
 function renderGallery(){const info=zoneInfo[modalZone],p=photos[gallery[galleryIndex]];
  q('#lf-modal-title').textContent=info.title;q('#lf-photo-match').textContent=photoMatch(modalZone);
  q('#lf-modal-photo').src=p.path;q('#lf-modal-photo').alt=p.alt;
  q('#lf-modal-explain').textContent=p.depicts;
  q('#lf-modal-pain').textContent=modalZone==='pick'?categories[category].pain:info.pain;
  q('#lf-modal-robot').textContent=info.robot;q('#lf-modal-context').textContent=p.alt;
  q('#lf-modal-credit').href=p.sourcePage;q('#lf-modal-credit').textContent=p.attribution+' · Prompt & provenance ↗';
  q('#lf-photo-count').textContent=(galleryIndex+1)+' of '+gallery.length;
  q('#lf-photo-prev').disabled=galleryIndex===0;q('#lf-photo-next').disabled=galleryIndex===gallery.length-1;
 }
 q('#lf-open-photo').addEventListener('click',()=>openPhotos(steps[index].zone));q('#lf-photo-preview').addEventListener('click',()=>openPhotos(steps[index].zone));q('#lf-humanoid').addEventListener('click',()=>openPhotos('humanoid'));
 q('#lf-modal-close').addEventListener('click',()=>q('#lf-photo-dialog').close());q('#lf-photo-dialog').addEventListener('click',e=>{if(e.target!==q('#lf-photo-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
 q('#lf-photo-prev').addEventListener('click',()=>{galleryIndex=Math.max(0,galleryIndex-1);renderGallery();});q('#lf-photo-next').addEventListener('click',()=>{galleryIndex=Math.min(gallery.length-1,galleryIndex+1);renderGallery();});
 q('#lf-play').addEventListener('click',()=>playing?pause():play());q('#lf-prev').addEventListener('click',()=>go(index-1));q('#lf-next').addEventListener('click',()=>go(index===steps.length-1?0:index+1));q('#lf-reset').addEventListener('click',()=>{pause();index=0;fraction=0;render();});
 root.querySelectorAll('[data-lf-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.lfCategory;scenario();}));root.querySelectorAll('[data-lf-channel]').forEach(b=>b.addEventListener('click',()=>{channel=b.dataset.lfChannel;scenario();}));q('#lf-pallet').addEventListener('change',scenario);q('#lf-returns').addEventListener('change',scenario);q('#lf-disposition').addEventListener('change',scenario);
 q('#lf-scrub').addEventListener('input',()=>{const value=Number(q('#lf-scrub').value);pause();const absolute=value/1000*steps.length;index=Math.min(steps.length-1,Math.floor(absolute));fraction=absolute>=steps.length?1:absolute-index;render();});
 function setZoom(){const canvas=q('#lf-canvas');canvas.style.minWidth=fit?'0':Math.round(980*zoom)+'px';canvas.style.width=fit?'100%':(zoom*100)+'%';q('#lf-zoom-label').textContent=fit?'Fit':Math.round(zoom*100)+'%';q('#lf-zoom-out').disabled=!fit&&zoom<=.8;q('#lf-zoom-in').disabled=!fit&&zoom>=2.2;}
 q('#lf-zoom-in').addEventListener('click',()=>{fit=false;zoom=Math.min(2.2,zoom+.25);setZoom();});q('#lf-zoom-out').addEventListener('click',()=>{fit=false;zoom=Math.max(.8,zoom-.25);setZoom();});q('#lf-fit').addEventListener('click',()=>{fit=true;zoom=1;setZoom();q('#lf-map-scroll').scrollTo({left:0,top:0});});
 const scroll=q('#lf-map-scroll');scroll.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&!e.target.closest('[role=button]'))drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};});window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;scroll.scrollLeft=drag.left-(e.clientX-drag.x);scroll.scrollTop=drag.top-(e.clientY-drag.y);});window.addEventListener('pointerup',()=>drag=null);
 root.addEventListener('keydown',e=>{if(q('#lf-photo-dialog').open||e.target.closest('button,input,select,[role=button]'))return;if(e.key==='ArrowRight'){e.preventDefault();go(Math.min(steps.length-1,index+1));}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}else if(e.code==='Space'){e.preventDefault();playing?pause():play();}});
 new MutationObserver(()=>{if(root.hidden&&playing)pause();}).observe(root,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause();});reduced.addEventListener('change',()=>{pause();paint();});
 scenario();setZoom();
})();
