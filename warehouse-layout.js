/* Conceptual warehouse plan; drawing coordinates are unitless. All animation is owned by the page controller. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ZONES = [
    {id:'inbound',x:0,y:0,w:100,h:600,label:'Inbound & receiving',group:'shared'},
    {id:'outbound',x:900,y:0,w:100,h:600,label:'Outbound & dispatch',group:'shared'},
    {id:'aisle-north',x:100,y:180,w:800,h:30,label:'North cross-aisle',group:'shared'},
    {id:'aisle-south',x:100,y:390,w:800,h:30,label:'South cross-aisle',group:'shared'},
    {id:'reserve',x:100,y:0,w:300,h:180,label:'Reserve pallet storage',group:'shared'},
    {id:'highbay',x:400,y:0,w:300,h:180,label:'Automated high-bay',group:'shared'},
    {id:'oversize',x:700,y:0,w:200,h:180,label:'Oversize & bulky',group:'b2b'},
    {id:'gtp',x:100,y:210,w:300,h:180,label:'Robotic tote storage',group:'b2c'},
    {id:'replenish',x:400,y:210,w:100,h:180,label:'Decant & replenish',group:'shared'},
    {id:'pick',x:500,y:210,w:150,h:180,label:'Goods-to-person pick',group:'b2c'},
    {id:'pack',x:650,y:210,w:130,h:180,label:'Pack & label',group:'b2c'},
    {id:'sort',x:780,y:210,w:120,h:180,label:'Parcel sortation',group:'b2c'},
    {id:'rack',x:100,y:420,w:400,h:180,label:'Forward pick / case storage',group:'shared'},
    {id:'b2b',x:500,y:420,w:200,h:180,label:'Store order consolidation',group:'b2b'},
    {id:'returns',x:700,y:420,w:100,h:180,label:'Returns & quality',group:'shared'},
    {id:'control',x:800,y:420,w:100,h:60,label:'Control room',group:'support'},
    {id:'maintenance',x:800,y:480,w:100,h:60,label:'Maintenance',group:'support'},
    {id:'charging',x:800,y:540,w:100,h:60,label:'Robot charging',group:'support'}
  ];
  window.WAREHOUSE_ZONES = ZONES;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attrs = (o) => Object.keys(o).map(k => k+'="'+esc(o[k])+'"').join(' ');
  const rect = (x,y,w,h,cls,extra) => '<rect '+attrs(Object.assign({x,y,width:w,height:h,rx:2,class:cls},extra||{}))+'/>';
  const path = (d,cls,extra) => '<path '+attrs(Object.assign({d,class:cls},extra||{}))+'/>';
  const txt = (x,y,t,cls,extra) => '<text '+attrs(Object.assign({x,y,class:cls},extra||{}))+'>'+esc(t)+'</text>';
  const use = (id,x,y,w,h,extra) => '<use '+attrs(Object.assign({href:'#w6-'+id,x,y,width:w,height:h},extra||{}))+'/>';

  function camera(x,y,small) {
    const s=small?.7:.9;
    return '<g class="w6-camera" transform="translate('+x+' '+y+') scale('+s+')"><circle r="12"/><path d="M-7-5h4l2-3h4l2 3h3v11H-7Z"/><circle class="w6-camera-lens" r="3"/></g>';
  }
  function person(x,y,rotate) {
    return '<g class="w6-person" transform="translate('+x+' '+y+') rotate('+(rotate||0)+')"><ellipse cx="0" cy="2" rx="6" ry="4"/><circle cy="-2" r="3.2"/><path d="M-6 1l-3 4M6 1l3 4"/></g>';
  }
  function robotArm(x,y,scale) {
    return '<g class="w6-arm" transform="translate('+x+' '+y+') scale('+(scale||1)+')"><rect x="-10" y="11" width="20" height="10" rx="3"/><path d="M0 11L-7-6L10-17L23-8"/><circle cx="-7" cy="-6" r="4"/><circle cx="10" cy="-17" r="4"/><path class="w6-gripper" d="M21-11l5 4l-3 6"/></g>';
  }
  function rackBank(x,y,cols,rows,stepX,stepY) {
    let s='';
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) s+=use('pallet',x+c*stepX,y+r*stepY,stepX-7,stepY-9);
    return s;
  }
  function furniture(z) {
    const x=z.x,y=z.y; let s='';
    if(z.id==='reserve') {
      s+=rackBank(x+15,y+58,6,4,45,27);
      s+=path('M'+(x+14)+' '+(y+53)+'H'+(x+284)+'M'+(x+14)+' '+(y+171)+'H'+(x+284),'w6-rack-end');
      return s;
    }
    if(z.id==='highbay') {
      for(let c=0;c<6;c++) {
        s+=rect(x+16+c*46,y+55,29,112,'w6-asrs-rack');
        for(let r=0;r<7;r++) s+=rect(x+19+c*46,y+58+r*15,23,10,'w6-asrs-bin');
        if(c<5) s+=path('M'+(x+52+c*46)+' '+(y+58)+'V'+(y+164),'w6-crane-rail');
      }
      s+=use('crane',x+44,y+92,17,36);
      s+=use('crane',x+182,y+127,17,36);
      return s;
    }
    if(z.id==='oversize') {
      for(let r=0;r<3;r++) for(let c=0;c<3;c++) {
        const xx=x+16+c*58,yy=y+64+r*34;
        s+=rect(xx,yy,43,24,'w6-bulky');
        s+=path('M'+(xx+6)+' '+(yy+5)+'h30m-30 13h30','w6-box-line');
      }
      return s;
    }
    if(z.id==='gtp') {
      s+=rect(x+13,y+56,273,108,'w6-grid-bed');
      for(let r=0;r<6;r++) for(let c=0;c<17;c++) {
        const shade=(c+r)%4;
        s+=rect(x+17+c*15.7,y+60+r*16.6,13,14,'w6-grid-cell w6-grid-cell-'+shade,{rx:1});
      }
      s+=use('gridbot',x+46,y+75,25,22)+use('gridbot',x+205,y+111,25,22)+use('gridbot',x+125,y+140,25,22);
      return s;
    }
    if(z.id==='replenish') {
      for(let r=0;r<3;r++) {
        s+=rect(x+12,y+72+r*29,75,20,'w6-table');
        s+=use('pallet',x+15,y+73+r*29,23,17)+use('tote',x+60,y+75+r*29,20,14);
        s+=path('M'+(x+42)+' '+(y+82+r*29)+'h12','w6-small-arrow');
      }
      s+=person(x+49,y+163,180);
      return s;
    }
    if(z.id==='pick') {
      for(let r=0;r<3;r++) {
        s+=rect(x+14,y+69+r*32,121,18,'w6-table');
        s+=use('tote',x+20,y+72+r*32,23,13)+use('tote',x+54,y+72+r*32,23,13);
        s+=person(x+106,y+92+r*32,180);
      }
      s+=path('M'+(x+128)+' '+(y+64)+'V'+(y+158),'w6-conveyor-base');
      s+=path('M'+(x+128)+' '+(y+64)+'V'+(y+158),'w6-conveyor-rollers');
      return s;
    }
    if(z.id==='pack') {
      for(let r=0;r<3;r++) {
        s+=rect(x+15,y+70+r*32,75,18,'w6-table');
        s+=use('carton',x+24,y+73+r*32,19,14);
        s+=rect(x+61,y+72+r*32,15,11,'w6-screen');
        s+=person(x+52,y+94+r*32,180);
      }
      s+=path('M'+(x+110)+' '+(y+61)+'V'+(y+162),'w6-conveyor-base');
      s+=path('M'+(x+110)+' '+(y+61)+'V'+(y+162),'w6-conveyor-rollers');
      return s;
    }
    if(z.id==='sort') {
      s+=rect(x+19,y+66,57,96,'w6-sort-loop',{rx:16});
      s+=rect(x+19,y+66,57,96,'w6-sort-rollers',{rx:16});
      for(let r=0;r<4;r++) {
        s+=path('M'+(x+78)+' '+(y+80+r*22)+'h18','w6-sort-chute');
        s+=rect(x+96,y+72+r*22,13,15,'w6-tote-body');
      }
      s+=use('carton',x+24,y+61,15,13)+use('carton',x+64,y+124,15,13);
      return s;
    }
    if(z.id==='rack') {
      for(let bank=0;bank<3;bank++) {
        s+=rackBank(x+15,y+60+bank*37,9,1,41,28);
        s+=path('M'+(x+16)+' '+(y+83+bank*37)+'H'+(x+382),'w6-rack-end');
      }
      s+=use('forklift',x+357,y+146,23,23);
      return s;
    }
    if(z.id==='b2b') {
      for(let r=0;r<2;r++) for(let c=0;c<4;c++) {
        const xx=x+16+c*44,yy=y+68+r*47;
        s+=rect(xx-3,yy-3,36,39,'w6-stage-bay',{rx:0});
        s+=use('pallet',xx,yy,30,27);
      }
      s+=robotArm(x+132,y+152,.64);
      s+=txt(x+17,y+168,'STORE LOAD LANES','w6-furniture-label');
      return s;
    }
    if(z.id==='returns') {
      for(let r=0;r<2;r++) {
        s+=rect(x+13,y+74+r*40,74,22,'w6-table');
        s+=use('carton',x+18,y+78+r*40,20,16)+use('tote',x+59,y+79+r*40,20,14);
      }
      s+=path('M'+(x+35)+' '+(y+154)+'a14 14 0 1 1 20 0m-1-12v14h-13','w6-return-arrow');
      s+=person(x+50,y+102,180);
      return s;
    }
    if(z.id==='control') {
      s+=rect(x+11,y+39,78,11,'w6-table');
      for(let i=0;i<4;i++) s+=rect(x+15+i*18,y+35,14,10,'w6-screen');
      return s;
    }
    if(z.id==='maintenance') {
      s+=rect(x+13,y+38,33,13,'w6-table')+use('amr',x+61,y+34,21,21);
      s+=path('M'+(x+20)+' '+(y+42)+'l8 6m-8 0l8-6','w6-tool');
      return s;
    }
    if(z.id==='charging') {
      for(let i=0;i<4;i++) {
        s+=rect(x+11+i*21,y+37,17,15,'w6-charge-bay');
        if(i!==2) s+=use('amr',x+13+i*21,y+36,13,13);
      }
      return s;
    }
    if(z.id==='inbound'||z.id==='outbound') {
      const out=z.id==='outbound';
      s+=txt(x+50,y+81,out?'LOAD & RELEASE':'SCAN · COUNT · QA','w6-dock-small',{'text-anchor':'middle'});
      for(let i=0;i<7;i++) {
        const yy=y+113+i*65;
        s+=rect(x+13,yy,71,47,'w6-dock-bay',{rx:0});
        s+=txt(x+20,yy+11,(out?'O':'I')+String(i+1).padStart(2,'0'),'w6-bay-number');
        s+=use('pallet',x+42,yy+14,30,24);
        s+=path('M'+(out?x+85:x+5)+' '+(yy+24)+'h10','w6-small-arrow');
      }
      s+=use('forklift',x+28,y+552,25,25);
      s+=txt(x+50,y+586,out?'STORE + PARCEL':'SUPPLIER GOODS','w6-dock-small',{'text-anchor':'middle'});
      return s;
    }
    if(z.id.indexOf('aisle-')===0) {
      s+=path('M'+(x+8)+' '+(y+15)+'H'+(x+792),'w6-lane-mark');
      for(let i=0;i<5;i++) s+=path('M'+(x+350+i*88)+' '+(y+11)+'l7 4l-7 4','w6-lane-arrow');
      return s;
    }
    return s;
  }
  function label(z) {
    const x=z.x,y=z.y,small=z.h===60,dock=z.w===100&&z.h===600,aisle=z.id.indexOf('aisle-')===0;
    if(aisle) return '<g class="w6-zone-labels" data-label="'+z.id+'">'+rect(x+10,y+5,286,21,'w6-aisle-label-bg')+txt(x+17,y+20,(z.id==='aisle-north'?'NORTH':'SOUTH')+' CROSS-AISLE','w6-aisle-label')+camera(x+314,y+15,true)+'</g>';
    const titles={
      inbound:['INBOUND &','RECEIVING'],outbound:['OUTBOUND &','DISPATCH'],
      reserve:['RESERVE PALLET STORAGE'],highbay:['AUTOMATED HIGH-BAY'],oversize:['OVERSIZE & BULKY'],
      gtp:['ROBOTIC TOTE STORAGE'],replenish:['DECANT &','REPLENISH'],pick:['GOODS-TO-','PERSON PICK'],pack:['PACK & LABEL'],sort:['PARCEL','SORTATION'],
      rack:['FORWARD PICK / CASE STORAGE'],b2b:['STORE ORDER','CONSOLIDATION'],returns:['RETURNS &','QUALITY'],
      control:['CONTROL'],maintenance:['MAINTENANCE'],charging:['CHARGING']
    };
    const lines=titles[z.id]||[z.label.toUpperCase()];
    let s='<g class="w6-zone-labels'+(small?' w6-support-labels':'')+'" data-label="'+z.id+'">';
    if(small) {
      s+=txt(x+9,y+15,lines[0],'w6-support-title');
      s+=camera(x+87,y+26,true);
    } else {
      const narrow=z.w<=150;
      lines.forEach((t,i)=>s+=txt(x+12,y+23+i*17,t,narrow?'w6-label w6-label-narrow':'w6-label'));
      if(!narrow) s+=camera(x+z.w-18,y+23,false);
      else s+=camera(x+z.w-15,y+(dock?58:lines.length===2?56:42),true);
    }
    return s+'</g>';
  }

  const symbols = '<defs>'+
    '<pattern id="w6-concrete" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="#f4f5ef"/><path d="M25 0H0V25" fill="none" stroke="#e8ece4" stroke-width=".6"/></pattern>'+
    '<pattern id="w6-exterior" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#eef0e9"/><path d="M0 0V8" stroke="#e1e6db" stroke-width="2"/></pattern>'+
    '<symbol id="w6-pallet" viewBox="0 0 30 24"><rect x="1" y="20" width="28" height="3" rx="1" fill="#9d8c67"/><rect x="2" y="1" width="26" height="19" rx="1.5" fill="#c4cfb1" stroke="#7d9275" stroke-width=".8"/><path d="M10 1v19M20 1v19M2 10h26" stroke="#e9eddd" stroke-width="1.2"/></symbol>'+
    '<symbol id="w6-tote" viewBox="0 0 26 18"><path d="M2 3h22l-2 14H4Z" fill="#a7cdc0" stroke="#528b79"/><path d="M1 2h24M9 6h8" stroke="#4e8574" stroke-width="2"/></symbol>'+
    '<symbol id="w6-carton" viewBox="0 0 24 20"><rect x="1" y="1" width="22" height="18" rx="2" fill="#e1bd7b" stroke="#ad874c"/><path d="M12 1v18M1 6h22" stroke="#f4dcad" stroke-width="2"/><rect x="4" y="10" width="5" height="4" fill="#fffaf0"/></symbol>'+
    '<symbol id="w6-gridbot" viewBox="0 0 28 24"><rect x="1" y="3" width="26" height="20" rx="4" fill="#1a796c" stroke="#f0f7eb" stroke-width="1.5"/><rect x="6" y="6" width="16" height="10" rx="2" fill="#4ca691"/><path d="M9 20h10" stroke="#ade5cc" stroke-width="1.4"/><circle cx="23" cy="6" r="2" fill="#ffd286"/></symbol>'+
    '<symbol id="w6-amr" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6" fill="#2d8273" stroke="#f6f9ed" stroke-width="1.4"/><rect x="6" y="6" width="12" height="12" rx="2" fill="#b5d5bf"/><circle cx="18" cy="5" r="1.5" fill="#ffce79"/></symbol>'+
    '<symbol id="w6-crane" viewBox="0 0 17 36"><path d="M8.5 0v36" stroke="#dfad55" stroke-width="4"/><rect x="1" y="10" width="15" height="16" rx="2" fill="#4d9c88" stroke="#ecf2e7"/><path d="M5 18h7" stroke="#fff" stroke-width="1.5"/></symbol>'+
    '<symbol id="w6-forklift" viewBox="0 0 28 28"><path d="M7 3v10m14-10v10" stroke="#536c5a" stroke-width="2.5"/><rect x="4" y="11" width="20" height="14" rx="4" fill="#e4b15b" stroke="#997334"/><rect x="9" y="14" width="10" height="8" rx="2" fill="#547b69"/><path d="M2 14v7m24-7v7" stroke="#334f43" stroke-width="3"/></symbol>'+
    '</defs>';

  function outdoor() {
    let s=rect(6,90,88,600,'w6-apron',{fill:'url(#w6-exterior)',rx:0})+rect(1106,90,88,600,'w6-apron',{fill:'url(#w6-exterior)',rx:0});
    s+=txt(49,107,'SUPPLIERS','w6-outside-label',{'text-anchor':'middle'})+txt(1150,107,'DISPATCH','w6-outside-label',{'text-anchor':'middle'});
    for(let i=0;i<7;i++) {
      const y=205+i*65;
      s+=rect(91,y,9,28,'w6-dock-door',{rx:0})+rect(1100,y,9,28,'w6-dock-door',{rx:0});
      if(i%2===0) s+=truck(20,y+3,false);
      if(i%3!==1) s+=truck(1111,y+3,true);
      s+=path('M12 '+(y+35)+'H89M1111 '+(y+35)+'h76','w6-parking-line');
    }
    s+=txt(47,661,'TRUCK','w6-outside-small',{'text-anchor':'middle'})+txt(47,675,'APRON','w6-outside-small',{'text-anchor':'middle'});
    s+=txt(1152,661,'TRUCK','w6-outside-small',{'text-anchor':'middle'})+txt(1152,675,'APRON','w6-outside-small',{'text-anchor':'middle'});
    return s;
  }
  function truck(x,y,out) {
    return '<g class="w6-truck" transform="translate('+x+' '+y+')">'+rect(out?0:14,0,55,24,'w6-trailer')+rect(out?57:0,3,13,18,'w6-truck-cab')+rect(out?61:3,6,6,12,'w6-truck-window')+path('M18 -2v3m0 22v3m36-28v3m0 22v3','w6-truck-wheel')+'</g>';
  }
  function dimensions() {
    return txt(100,33,'CONCEPTUAL WAREHOUSE LAYOUT','w6-plan-eyebrow')
      +txt(1100,33,'ILLUSTRATIVE · NOT TO SCALE','w6-plan-total',{'text-anchor':'end'})
      +txt(100,718,'SHARED INVENTORY · TWO FULFILLMENT JOURNEYS','w6-building-note')
      +txt(1100,718,'EXTERIOR APRONS SHOWN FOR CONTEXT','w6-building-note',{'text-anchor':'end'})
      +camera(1082,757,true)+txt(1063,761,'CLICK ANY ZONE TO EXPLORE','w6-photo-hint',{'text-anchor':'end'});
  }

  class WarehouseLayout {
    constructor(host, options) {
      if(!host) throw new Error('WarehouseLayout requires a host element.');
      this.host=host;
      this.options=options||{};
      this.mode='both';
      this.active=null;
      host.classList.add('w6-layout-host');
      host.innerHTML='<svg xmlns="'+NS+'" class="w6-layout-svg" viewBox="0 0 1200 790" role="group" aria-labelledby="w6-layout-title w6-layout-description"><title id="w6-layout-title">Conceptual retail warehouse layout</title><desc id="w6-layout-description">Conceptual warehouse with illustrative proportions and no physical scale. Goods enter on the left, move through storage, picking, packing or store order consolidation, and leave on the right. Each zone is a button that opens AI-generated illustrations. Eighteen operational zones illustrate shared inbound, B2C, B2B, returns and support functions.</desc>'+symbols+outdoor()+dimensions()+'<g class="w6-building" transform="translate(100,90)">'+rect(0,0,1000,600,'w6-concrete',{fill:'url(#w6-concrete)',rx:0})+'<g class="w6-zone-layer"></g><g class="w6-route-layer" aria-hidden="true"></g><g class="w6-label-layer" aria-hidden="true"></g>'+rect(0,0,1000,600,'w6-building-wall',{rx:0})+'<g class="w6-actor-layer" aria-hidden="true"></g></g></svg>';
      this.svg=host.querySelector('svg');
      this.routeLayer=host.querySelector('.w6-route-layer');
      this.actorLayer=host.querySelector('.w6-actor-layer');
      this.zoneLayer=host.querySelector('.w6-zone-layer');
      this.labelLayer=host.querySelector('.w6-label-layer');
      this.zoneNodes=new Map();
      ZONES.forEach(z=>{
        const g=document.createElementNS(NS,'g');
        g.setAttribute('class','w6-zone w6-zone-'+z.id+' w6-group-'+z.group);
        g.setAttribute('data-zone',z.id);
        g.setAttribute('role','button');
        g.setAttribute('tabindex','0');
        g.setAttribute('aria-label',z.label+'. Explore this warehouse zone.');
        g.setAttribute('aria-pressed','false');
        const clipId='w6-clip-'+z.id;
        g.innerHTML='<clipPath id="'+clipId+'">'+rect(z.x+2,z.y+2,z.w-4,z.h-4,'',{rx:0})+'</clipPath>'+rect(z.x,z.y,z.w,z.h,'w6-zone-base',{rx:0})+'<g class="w6-furniture" clip-path="url(#'+clipId+')">'+furniture(z)+'</g>'+rect(z.x+2,z.y+2,z.w-4,z.h-4,'w6-zone-outline',{rx:1});
        this.zoneLayer.appendChild(g);
        this.labelLayer.insertAdjacentHTML('beforeend',label(z));
        const activate=()=>{if(typeof this.options.onZoneClick==='function') this.options.onZoneClick(z.id,z);};
        g.addEventListener('click',activate);
        g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
        this.zoneNodes.set(z.id,g);
      });
      this.svg.addEventListener('click',e=>{
        const labelNode=e.target.closest&&e.target.closest('[data-label]');
        if(labelNode&&typeof this.options.onZoneClick==='function') {
          const id=labelNode.getAttribute('data-label');
          this.options.onZoneClick(id,ZONES.find(z=>z.id===id));
        }
      });
    }
    setActive(zoneId) {
      this.active=zoneId||null;
      this.zoneNodes.forEach((node,id)=>{
        node.classList.toggle('w6-is-active',id===this.active);
        node.setAttribute('aria-pressed',String(id===this.active));
      });
      this.labelLayer.querySelectorAll('[data-label]').forEach(node=>node.classList.toggle('w6-is-active',node.getAttribute('data-label')===this.active));
    }
    setMode(mode) {
      this.mode=['both','b2b','b2c'].includes(mode)?mode:'both';
      this.host.setAttribute('data-flow-mode',this.mode);
      ZONES.forEach(z=>{
        const mute=this.mode!=='both'&&(z.group==='b2b'||z.group==='b2c')&&z.group!==this.mode;
        this.zoneNodes.get(z.id).classList.toggle('w6-is-muted',mute);
        const labelNode=this.labelLayer.querySelector('[data-label="'+z.id+'"]');
        if(labelNode) labelNode.classList.toggle('w6-is-muted',mute);
      });
    }
  }
  window.WarehouseLayout=WarehouseLayout;
})();
