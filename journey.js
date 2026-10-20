(() => {
  'use strict';
  const root = document.getElementById('view-journey');
  if (!root) return;
  const q = selector => root.querySelector(selector);
  const photos = Object.fromEntries((window.WAREHOUSE_PHOTOS || []).map(p => [p.key, p]));
  const route = [
    {title:'Receive supplier goods',short:'Receive',area:'Receiving dock',photo:'receiving',input:['Supplier cartons','Supplier pallets / cases'],output:['Received goods','Received goods'],load:['Inbound carton','Inbound pallet'],action:'Unload → identify shipment',caption:'Goods arrive at the warehouse. Receiving starts the physical journey.',explain:'The team unloads supplier stock and matches it to the expected delivery. A purchase order or advance shipment notice tells them what should arrive.',work:'People handle delivery discrepancies and keep inbound traffic moving. The photo shows tote handling inside an inbound operation.',pain:'Late deliveries, missing shipment information and damage can block the receiving area.',robot:'Box unloaders can help with suitable floor-loaded cartons. Pallet deliveries need a different handling solution.',context:'AI-generated process illustration; see image provenance.'},
    {title:'Scan, count and inspect',short:'Check & scan',area:'Receiving / quality',photo:'receiving-scan',input:['Unverified goods','Unverified goods'],output:['Accepted stock','Accepted stock'],load:['Checked carton','Checked cases'],action:'Mismatch or damage? → Hold for review',caption:'Only accepted goods move forward. Discrepancies and damage go on hold.',explain:'Scan product identities, count quantities and inspect condition. Batch or expiry checks apply where relevant. Record the accepted quantity before making stock available.',work:'People investigate missing units and unreadable labels. Wearable or handheld scanners connect the physical goods to their inventory identity.',pain:'Incorrect identifiers or counts become inventory errors that reappear later as short picks.',robot:'Barcode readers, weighing and validated vision checks help identify goods. Human review resolves uncertain results.',context:'AI-generated process illustration; see image provenance.'},
    {title:'Put away into storage',short:'Store',area:'Inventory storage',photo:'storage',input:['Accepted stock','Accepted stock'],output:['Stock at a known location','Stock at a known location'],load:['Stored inventory','Stored cases'],action:'Scan item + location → update inventory',caption:'Every accepted item gets a recorded storage location.',explain:'Putaway moves stock from receiving to a shelf, bin, pod or pallet rack. The warehouse management system records what is stored and where.',work:'People or automated systems stow goods. They handle oversize items, storage constraints and exceptions.',pain:'Unrecorded moves and poor slotting make available stock hard to find.',robot:'Automated storage retrieves compatible bins or pallets; mobile robots can carry storage pods to a workstation.',robotPhoto:'amr',context:'AI-generated process illustration; see image provenance.'},
    {title:'Refill the picking area',short:'Replenish',area:'Reserve → picking',photo:'decant',input:['Reserve stock','Reserve cases / pallets'],output:['Stock ready for each-picking','Stock ready for case-picking'],load:['Tote / bin','Case / pallet'],action:'When needed → refill pick location',caption:'Move reserve stock forward before a picking location runs empty.',explain:'Replenishment keeps active pick locations supplied. It can happen before or during order fulfillment. Some warehouses pick directly from storage and skip this transfer.',work:'People resolve location and quantity differences. The photo shows an operator handling cases at a decanting workstation.',pain:'An empty pick location can stop an order even when the building still has stock.',robot:'AMRs can move totes or cases between reserve storage and picking. Software decides what needs replenishing.',robotPhoto:'amr',context:'AI-generated process illustration; see image provenance.'},
    {title:'Pick the right goods',short:'Pick',area:'Order fulfillment',photo:'picking-action',input:['Pick task + available units','Pick task + available cases'],output:['Picked order items','Picked cases / pallets'],load:['Order tote','Store cases'],action:'Digital order task + stock → pick',caption:'The physical stock flow meets the digital order instructions here.',explainB2c:'A shopper order reserves stock and releases a pick task. The picker collects individual items into an order tote, or a batch that will be separated later.',explainB2b:'A store order reserves quantities and releases tasks for full cases, pallets or a mixture. Picks may be sequenced for the store and delivery route.',work:'People verify the item and quantity, resolve short picks and handle awkward products. A goods-to-person robot transports stock; a person or picking arm makes the grasp.',pain:'Travel time, similar-looking products and short picks slow fulfillment and cause errors.',robot:'Goods-to-person and assisted picking AMRs reduce travel. Robotic arms can grasp compatible products within a validated SKU range.',robotPhoto:'amr',context:'AI-generated process illustration; see image provenance.'},
    {title:'Check and prepare shipment',short:'Pack / palletise',area:'Packing & consolidation',photo:'packing',photoB2b:'dispatch-b2b',input:['Picked order items','Store cases'],output:['Verified customer parcel','Store-ready pallet'],load:['Customer parcel','Wrapped store pallet'],action:'Verify → protect → label',captionB2c:'Combine the order, check the contents, then pack and label a parcel.',captionB2b:'Consolidate the store order and build a stable, correctly labeled pallet.',explainB2c:'Items from different picking areas come together. Check product and quantity, select packaging, protect fragile items and attach the shipping label.',explainB2b:'Group cases by store. Build stable pallets, follow retailer labeling rules and wrap the load. A store shipment often needs consolidation rather than individual parcel packing.',work:'People handle fragile goods, complex orders and packing exceptions. Shipment identity must stay connected to its physical parcel or pallet.',pain:'Missing items, wrong labels and packing queues can erase gains made in picking.',robot:'Carton machinery supports parcel packing. Palletising arms handle compatible cases and stacking patterns; neither solves every packaging exception.',context:'AI-generated process illustration; see image provenance.',contextB2b:'AI-generated process illustration; see image provenance.'},
    {title:'Sort, stage and dispatch',short:'Dispatch',area:'Outbound dock',photo:'dispatch-b2c',photoB2b:'staging',input:['Labeled parcels','Store-ready pallets'],output:['Carrier handover','Loaded route vehicle'],load:['Outbound parcel','Store shipment'],action:'Correct route → scan handover → load',caption:'Shipments are grouped by carrier or route, checked and handed over.',explainB2c:'Parcels move through sortation and outbound loading for the carrier network. The handover scan and tracking status confirm departure from the warehouse.',explainB2b:'Stage pallets for the store route and delivery appointment, verify loading and send shipment information. Store freight is not routed like individual consumer parcels.',work:'People resolve unreadable labels, loading discrepancies and missed collection cutoffs.',pain:'Wrong lanes and dock congestion lead to misroutes or missed departures.',robot:'Conveyors and sorters route parcels. Transport AMRs or compatible autonomous forklifts can move loads to staging.',context:'AI-generated process illustration; see image provenance.',contextB2b:'AI-generated process illustration; see image provenance.'},
    {title:'Deliver to the destination',short:'Deliver',area:'Outside the warehouse',photo:'delivery-b2c',photoB2b:'truck-b2b',input:['Carrier shipment','Store route load'],output:['Customer delivery','Store receipt'],load:['Delivered parcel','Store delivery'],action:'Warehouse → transport network → destination',captionB2c:'The carrier brings the parcel to the shopper.',captionB2b:'The transport operation delivers stock to the retail store.',explainB2c:'After dispatch, goods may pass through carrier sortation and a delivery station before reaching the customer. These transport stages sit outside the warehouse.',explainB2b:'The store receives the shipment and checks quantity and condition. Staff then replenish shelves or the store backroom; this happens after warehouse dispatch.',work:'Delivery and receiving teams handle handover, proof of delivery and damage exceptions.',pain:'Failed delivery, a missed store appointment or transport damage can break the delivery promise.',robot:'Warehouse robots do not perform this whole transport journey. Transport planning and tracking coordinate the handoff.',context:'AI-generated process illustration; see image provenance.',contextB2b:'AI-generated process illustration; see image provenance.'},
    {title:'Inspect an optional return',short:'Return & inspect',area:'Optional reverse flow',photo:'returns',input:['Returned product','Returned store goods'],output:['Condition decision','Condition decision'],load:['Returned item','Returned goods'],action:'Return authorization → inspect → grade',caption:'Some goods come back. Their condition must be checked before any restock.',explainB2c:'Match the return to the order, check completeness and inspect condition. A refund decision and a stock disposition are related but distinct actions.',explainB2b:'Bulk returns, rejected deliveries or overstocks need quantity and condition checks. Reconcile the shipment and return authorization before deciding its next destination.',work:'People decide ambiguous condition, missing accessories and refund exceptions. A return is not automatically saleable inventory.',pain:'Unpredictable packaging and inconsistent grading slow recovery of stock and value.',robot:'Scanning and sortation can route known return categories. Opening and grading arbitrary returns still require validated task-specific handling.',context:'AI-generated process illustration; see image provenance.'},
    {title:'Restock or recover value',short:'Restock / recover',area:'Return disposition',photo:'storage',input:['Inspected return','Inspected return'],output:['Restock / repair / hold','Restock / repair / hold'],load:['Approved stock','Approved stock'],action:'Saleable → update stock · Other → approved recovery',caption:'Approved stock rejoins inventory; other goods follow their own recovery route.',explain:'Saleable returns can re-enter storage after the inventory update. Other goods may need repair, quarantine, recycling or approved disposal. Each decision is recorded.',work:'People authorize the disposition and prevent damaged or uncertain stock from silently rejoining available inventory.',pain:'Automatic restocking without inspection creates quality problems and incorrect availability.',robot:'Automation may move standardized return totes. A humanoid tote handoff is a narrow commercial example; it does not establish autonomous condition assessment.',robotPhoto:'humanoid',context:'AI-generated process illustration; see image provenance.'}
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let channel='b2c', index=0, lens='work', playing=false, elapsed=0, lastTime=0, frame=0, paths=[];
  const duration=7000;
  const svgNS='http://www.w3.org/2000/svg';
  route[2].photoB2b='storage-b2b';
  route[2].contextB2b='AI-generated process illustration; see image provenance.';
  route[3].photoB2b='decant';
  route[3].contextB2b='AI-generated process illustration; see image provenance.';
  route[4].photoB2b='case';
  route[4].contextB2b='AI-generated process illustration; see image provenance.';
  route[9].photoB2b='storage-b2b';
  route[9].contextB2b='AI-generated process illustration; see image provenance.';
  const getPhoto = (s, override=true) => photos[(override && lens==='robot' && s.robotPhoto) ? s.robotPhoto : (channel==='b2b' && s.photoB2b ? s.photoB2b : s.photo)];
  const textFor = (s, field) => s[field+(channel==='b2b'?'B2b':'B2c')] || s[field] || '';
  function makeMap(){
    q('#tour-map').replaceChildren();
    route.forEach((s,i)=>{
      const photo=getPhoto(s,false), b=document.createElement('button');
      b.type='button';b.className='tour-node'+(i>=8?' return-node':'');b.dataset.tourStep=String(i);
      b.setAttribute('aria-label',`Step ${i+1}: ${s.short}${i>=8?' (optional return)':''}`);
      const img=document.createElement('img');img.src=photo.thumbnail||photo.path;img.alt='';img.width=320;img.height=180;img.loading='eager';
      const label=document.createElement('span'),n=document.createElement('small'),title=document.createElement('b');
      n.textContent=String(i+1).padStart(2,'0')+(i>=8?' · Optional return':'');title.textContent=s.short;
      label.append(n,title);b.append(img,label);b.addEventListener('click',()=>go(i));q('#tour-map').append(b);
    });
    positionNodes();
  }
  function positionNodes(){
    const narrow=window.matchMedia('(max-width:760px)').matches;
    q('#tour-map').querySelectorAll('button').forEach((b,i)=>{
      const row=narrow?Math.floor(i/2):(i<5?0:1);
      const col=narrow?(row%2?1-i%2:i%2):(i<5?i:9-i);
      b.style.gridRow=String(row+1);b.style.gridColumn=String(col+1);
    });
    requestAnimationFrame(drawLines);
  }
  function drawLines(){
    if(root.hidden)return;
    const wrap=q('#tour-map-wrap'),svg=q('#tour-lines'),r=wrap.getBoundingClientRect();
    if(!r.width)return;
    svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);
    const defs=document.createElementNS(svgNS,'defs');
    [['tour-arrow-main','#78ac98'],['tour-arrow-return','#ad7d35']].forEach(([id,color])=>{const m=document.createElementNS(svgNS,'marker');m.id=id;m.setAttribute('viewBox','0 0 8 8');m.setAttribute('refX','7');m.setAttribute('refY','4');m.setAttribute('markerWidth','7');m.setAttribute('markerHeight','7');m.setAttribute('markerUnits','userSpaceOnUse');m.setAttribute('orient','auto');const arrow=document.createElementNS(svgNS,'polygon');arrow.setAttribute('points','0,0 8,4 0,8');arrow.setAttribute('fill',color);m.append(arrow);defs.append(m);});svg.append(defs);
    const rects=[...q('#tour-map').children].map(n=>{const a=n.getBoundingClientRect();return{x:a.x-r.x,y:a.y-r.y,w:a.width,h:a.height};});
    paths=[];
    for(let i=0;i<rects.length-1;i++){
      const a=rects[i],b=rects[i+1];let x1,y1,x2,y2;
      if(Math.abs(a.y-b.y)<10){x1=a.x+(b.x>a.x?a.w:0);x2=b.x+(b.x>a.x?0:b.w);y1=a.y+a.h/2;y2=b.y+b.h/2;}
      else{x1=a.x+a.w/2;x2=b.x+b.w/2;y1=a.y+a.h;y2=b.y;}
      const p=document.createElementNS(svgNS,'path');p.setAttribute('d',`M${x1},${y1} L${x2},${y2}`);p.setAttribute('fill','none');p.setAttribute('stroke',i>=7?'#ad7d35':'#78ac98');p.setAttribute('stroke-width','2');p.setAttribute('marker-end',`url(#${i>=7?'tour-arrow-return':'tour-arrow-main'})`);if(i>=7)p.setAttribute('stroke-dasharray','4 4');svg.append(p);paths.push({x1,y1,x2,y2});
    }
    drawMover();
  }
  function drawMover(){
    const mover=q('#tour-mover'),p=paths[index];
    if(!p || !playing || reducedMotion.matches){mover.style.display='none';return;}
    const t=Math.max(0,Math.min(1,(elapsed/duration-.12)/.76));
    mover.style.display='block';mover.style.left=(p.x1+(p.x2-p.x1)*t)+'px';mover.style.top=(p.y1+(p.y2-p.y1)*t)+'px';
  }
  function render(){
    const s=route[index],photo=getPhoto(s),ci=channel==='b2b'?1:0;
    if(photo){q('#tour-photo').src=photo.path;q('#tour-photo').alt=photo.alt;q('#tour-credit').href=photo.sourcePage;q('#tour-credit').textContent=`${photo.attribution} · Prompt & provenance ↗`;}
    q('#tour-stage-badge').textContent=String(index+1).padStart(2,'0')+' / '+s.area;
    q('#tour-phase').textContent=index===7?'TRANSPORT / DESTINATION':index>=8?'OPTIONAL RETURN JOURNEY':'INSIDE THE WAREHOUSE';
    q('#tour-title').textContent=s.title;q('#tour-detail-title').textContent=s.short;
    q('#tour-caption').textContent=textFor(s,'caption');q('#tour-explain').textContent=textFor(s,'explain');
    q('#tour-load').textContent=s.load[ci];q('#tour-action').textContent=lens==='robot'&&s.robotPhoto?'An illustrative robot task':s.action;
    q('#tour-input').textContent=s.input[ci];q('#tour-output').textContent=s.output[ci];
    q('#tour-channel-label').textContent=channel==='b2b'?'B2B · Store replenishment':'B2C · Direct to consumer';
    q('#tour-insight').textContent=s[lens];
    q('#tour-photo-context').textContent=photo.depicts;
    q('#tour-counter').textContent=`${index+1} of ${route.length}`;q('#tour-prev').disabled=index===0;
    q('#tour-next').textContent=index===route.length-1?'Replay ↶':'Next →';
    q('#tour-next').setAttribute('aria-label',index===route.length-1?'Replay image journey':'Next image stage');
    q('#tour-announcement').textContent=`Step ${index+1} of ${route.length}: ${s.title}.`;
    root.querySelectorAll('[data-tour-channel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tourChannel===channel)));
    root.querySelectorAll('[data-tour-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tourLens===lens)));
    root.querySelectorAll('[data-tour-step]').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===index));b.classList.toggle('done',i<index);});
    q('#tour-outcome').textContent=index>=8?'Optional reverse flow: only approved saleable stock returns to storage. Repair, hold and disposal follow separate routes.':index===7?'Delivery completes the outbound route. The next two steps illustrate an optional return.':'The route is illustrative. Operations can overlap; replenishment happens only when needed.';
    setControls();updateProgress();
  }
  function setControls(){
    const b=q('#tour-play');b.textContent=playing?'Ⅱ Pause journey':index===9&&elapsed>=duration?'↶ Replay journey':'▶ Play journey';b.setAttribute('aria-pressed',String(playing));
    q('#tour-parcel').classList.toggle('handling',playing&&!reducedMotion.matches);
    q('#tour-status').textContent=playing?'Playing':elapsed>0&&elapsed<duration?'Paused':'';
    drawMover();
  }
  function updateProgress(){const progress=Math.min(100,((index+elapsed/duration)/route.length)*100);q('#tour-progress').style.width=progress+'%';q('.tour-progress').setAttribute('aria-valuenow',String(Math.round(progress)));drawMover();}
  function tick(t){
    if(!playing)return;
    if(lastTime)elapsed+=Math.min(t-lastTime,150)*Number(q('#tour-speed').value);
    lastTime=t;
    if(elapsed>=duration){if(index===route.length-1){elapsed=duration;pause();q('#tour-status').textContent='Journey complete';updateProgress();return;}index++;elapsed=0;render();}
    updateProgress();frame=requestAnimationFrame(tick);
  }
  function pause(){playing=false;cancelAnimationFrame(frame);lastTime=0;setControls();}
  function play(){if(index===9&&elapsed>=duration){index=0;elapsed=0;render();}playing=true;lastTime=0;setControls();frame=requestAnimationFrame(tick);}
  function go(i){pause();index=Math.max(0,Math.min(i,9));elapsed=0;render();}
  q('#tour-play').addEventListener('click',()=>playing?pause():play());
  q('#tour-prev').addEventListener('click',()=>go(index-1));q('#tour-next').addEventListener('click',()=>go(index===9?0:index+1));q('#tour-restart').addEventListener('click',()=>go(0));q('#tour-restock').addEventListener('click',()=>go(2));
  root.querySelectorAll('[data-tour-channel]').forEach(b=>b.addEventListener('click',()=>{pause();channel=b.dataset.tourChannel;elapsed=0;makeMap();render();}));
  root.querySelectorAll('[data-tour-lens]').forEach(b=>b.addEventListener('click',()=>{lens=b.dataset.tourLens;render();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause();});
  new MutationObserver(()=>{if(root.hidden&&playing)pause();if(!root.hidden)positionNodes();}).observe(root,{attributes:true,attributeFilter:['hidden']});
  new ResizeObserver(positionNodes).observe(q('#tour-map'));
  reducedMotion.addEventListener('change',setControls);
  for(const p of Object.values(photos)){const li=document.createElement('li'),a=document.createElement('a');a.href=p.sourcePage;a.target='_blank';a.rel='noopener';a.textContent=p.attribution+' — '+p.alt;li.append(a);q('#tour-photo-credits').append(li);}
  const sectionTabs=[...document.querySelectorAll('.tabs [role="tab"]')];
  sectionTabs.forEach((tab,i)=>tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%sectionTabs.length;else if(e.key==='ArrowLeft')next=(i+sectionTabs.length-1)%sectionTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=sectionTabs.length-1;else return;e.preventDefault();sectionTabs[next].click();sectionTabs[next].focus();}));
  makeMap();render();
  // A useful static first frame is always available; playback is user-controlled.
})();
