/* Spatial teaching diagram. All movement is controlled by the parent player's frame. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ZONES = {
    inbound: {x:42,y:274,w:116,h:155,label:'INBOUND',sub:'Truck unloading',px:102,py:355},
    receiving: {x:177,y:274,w:143,h:155,label:'RECEIVING',sub:'Scan · count · inspect',px:248,py:355},
    bin: {x:340,y:78,w:180,h:146,label:'BIN / POD STORAGE',sub:'Goods-to-person example',px:430,py:186},
    pallet: {x:538,y:78,w:204,h:146,label:'PALLET STORAGE',sub:'Racks / AS/RS example',px:640,py:186},
    rack: {x:760,y:78,w:120,h:146,label:'RACKS',sub:'Totes / small items',px:820,py:186},
    oversize: {x:898,y:78,w:121,h:146,label:'OVERSIZE',sub:'Bulky / manual',px:958,py:186},
    replenish: {x:340,y:274,w:120,h:155,label:'REPLENISH',sub:'Decant / goods-in',px:400,py:355},
    pick: {x:478,y:274,w:132,h:155,label:'PICK',sub:'Goods → person',px:544,py:355},
    pack: {x:628,y:274,w:120,h:155,label:'PACK',sub:'Protect + label',px:688,py:355},
    sort: {x:766,y:274,w:116,h:155,label:'SORT',sub:'Courier / route',px:824,py:355},
    outbound: {x:900,y:274,w:119,h:155,label:'OUTBOUND',sub:'Scan + load',px:958,py:355},
    hold: {x:42,y:492,w:139,h:110,label:'HOLD / QA',sub:'Blocked until released',px:112,py:561},
    returns: {x:199,y:492,w:136,h:110,label:'RETURNS',sub:'Grade + disposition',px:267,py:561},
    control: {x:353,y:492,w:193,h:110,label:'CONTROL',sub:'Orders · inventory · robots',px:450,py:558},
    palletise: {x:564,y:492,w:168,h:110,label:'PALLETISE',sub:'Build stable store loads',px:648,py:561},
    staging: {x:750,y:492,w:269,h:110,label:'B2B STAGING',sub:'Consolidate by truck route',px:884,py:561},
    destination: {x:1060,y:283,w:101,h:145,label:'CUSTOMER',sub:'Store or home',px:1111,py:355}
  };
  const STORAGE = ['bin','pallet','rack','oversize'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(k => e.setAttribute(k, String(attrs[k])));
    if (parent) parent.appendChild(e);
    return e;
  }
  const point = zone => ({x:ZONES[zone].px,y:ZONES[zone].py});
  const pathD = pts => pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ');
  const length = pts => pts.reduce((n,p,i)=>n+(i?Math.hypot(p.x-pts[i-1].x,p.y-pts[i-1].y):0),0);
  function at(pts, fraction) {
    let remain = length(pts) * Math.max(0, Math.min(1, fraction));
    for (let i=1;i<pts.length;i++) {
      const a=pts[i-1],b=pts[i],len=Math.hypot(b.x-a.x,b.y-a.y);
      if (remain <= len && len) return {x:a.x+(b.x-a.x)*remain/len,y:a.y+(b.y-a.y)*remain/len};
      remain-=len;
    }
    return pts[pts.length-1];
  }
  function unique(pts) {return pts.filter((p,i)=>!i||p.x!==pts[i-1].x||p.y!==pts[i-1].y);}
  function route(from,to,type) {
    const a=point(from),b=point(to);
    if(from===to) return [a,b];
    if((type==='return' && to==='returns' && (from==='destination'||from==='outbound')) || (from==='destination' && to==='returns'))
      return unique([a,{x:1111,y:a.y},{x:1111,y:651},{x:267,y:651},{x:267,y:602},b]);
    if(to==='destination') return unique([a,{x:a.x,y:355},{x:1111,y:355},b]);
    if(from==='destination') return unique([a,{x:1048,y:355},{x:1048,y:460},{x:b.x,y:460},b]);
    if(from==='inbound' && to==='receiving') return [a,b];
    if(from==='receiving' && to==='hold') return [a,{x:a.x,y:460},{x:b.x,y:460},b];
    if(from==='returns' && to==='hold') return [a,{x:a.x,y:460},{x:b.x,y:460},b];
    const upperA=a.y<230,upperB=b.y<230,bottomA=a.y>490,bottomB=b.y>490;
    const corridor=bottomA||bottomB?460:248;
    if((upperA&&bottomB)||(bottomA&&upperB)) {
      return unique([a,{x:a.x,y:upperA?248:460},{x:330,y:upperA?248:460},{x:330,y:upperA?460:248},{x:b.x,y:upperA?460:248},b]);
    }
    return unique([a,{x:a.x,y:corridor},{x:b.x,y:corridor},b]);
  }
  function camera(x,y) {
    return '<g class="wf-camera" transform="translate('+x+' '+y+')"><rect x="-9" y="-6" width="18" height="13" rx="3"/><path d="M-5 -6l2-3h6l2 3"/><circle r="3.2"/></g>';
  }
  function furniture(id,z) {
    const x=z.x,y=z.y,w=z.w;
    if(id==='bin') return '<g class="wf-object">'+Array.from({length:5},(_,r)=>Array.from({length:8},(_,c)=>'<rect x="'+(x+15+c*19)+'" y="'+(y+58+r*13)+'" width="16" height="10" rx="1" class="wf-bin-cell"/>').join('')).join('')+'<g transform="translate('+(x+108)+' '+(y+76)+')"><rect x="-10" y="-8" width="22" height="18" rx="4" fill="#007d69"/><circle cx="-5" cy="0" r="2" fill="white"/><circle cx="6" cy="0" r="2" fill="white"/></g></g>';
    if(id==='pallet') return '<g class="wf-object">'+[0,1,2].map(r=>[0,1,2,3,4].map(c=>'<rect x="'+(x+15+c*35)+'" y="'+(y+59+r*19)+'" width="26" height="14" rx="1" fill="'+(r%2?'#c6c9b9':'#d7d1ba')+'" stroke="#89978a"/>').join('')).join('')+'<path d="M'+(x+104)+' '+(y+55)+'V'+(y+121)+'" stroke="#007d69" stroke-width="5"/><rect x="'+(x+94)+'" y="'+(y+84)+'" width="20" height="17" rx="2" fill="#007d69"/></g>';
    if(id==='rack') return '<g class="wf-object">'+[0,1,2].map(r=>'<rect x="'+(x+14)+'" y="'+(y+58+r*22)+'" width="91" height="14" rx="2" fill="#c5d7c6" stroke="#739681"/><path d="M'+(x+18)+' '+(y+55+r*22)+'v20M'+(x+58)+' '+(y+55+r*22)+'v20M'+(x+100)+' '+(y+55+r*22)+'v20" stroke="#7d9487"/>').join('')+'</g>';
    if(id==='oversize') return '<g class="wf-object"><rect x="'+(x+15)+'" y="'+(y+60)+'" width="88" height="22" rx="3" fill="#ced7ca" stroke="#8b9e8a"/><rect x="'+(x+20)+'" y="'+(y+93)+'" width="41" height="25" rx="3" fill="#d9ceb6" stroke="#aa9f89"/><rect x="'+(x+69)+'" y="'+(y+98)+'" width="36" height="20" rx="2" fill="#c6c9bf" stroke="#8c968c"/></g>';
    if(id==='inbound') return '<g class="wf-object"><rect x="'+(x+14)+'" y="'+(y+57)+'" width="73" height="57" rx="4" fill="#d4dbd0" stroke="#7e9185"/><rect x="'+(x+87)+'" y="'+(y+65)+'" width="17" height="42" rx="3" fill="#559c8b"/><path d="M'+(x+24)+' '+(y+65)+'v40m10-40v40m10-40v40m10-40v40m10-40v40" stroke="#b0bdb0"/><rect x="'+(x+91)+'" y="'+(y+69)+'" width="9" height="14" rx="1" fill="#dff0ee"/><circle cx="'+(x+32)+'" cy="'+(y+117)+'" r="6" fill="#405d56"/><circle cx="'+(x+82)+'" cy="'+(y+117)+'" r="6" fill="#405d56"/></g>';
    if(id==='receiving') return '<g class="wf-object"><rect x="'+(x+16)+'" y="'+(y+83)+'" width="111" height="22" rx="5" fill="#a7b8ad"/>'+[0,1,2,3,4,5,6,7].map(i=>'<path d="M'+(x+22+i*14)+' '+(y+85)+'v18" stroke="#e2e9df" stroke-width="3"/>').join('')+'<path d="M'+(x+47)+' '+(y+104)+'V'+(y+60)+'H'+(x+94)+'V'+(y+104)+'" fill="none" stroke="#527f71" stroke-width="5"/><path d="M'+(x+51)+' '+(y+80)+'h39" stroke="#efb654" stroke-width="2"/><rect x="'+(x+64)+'" y="'+(y+83)+'" width="22" height="19" fill="#dbbf87" stroke="#a78d5e"/></g>';
    if(id==='replenish') return '<g class="wf-object"><rect x="'+(x+14)+'" y="'+(y+72)+'" width="90" height="37" rx="5" fill="#b3c6b9"/><rect x="'+(x+19)+'" y="'+(y+78)+'" width="33" height="24" rx="3" fill="#e5eee4" stroke="#71917a"/><rect x="'+(x+65)+'" y="'+(y+76)+'" width="30" height="25" rx="2" fill="#d7bc85"/><path d="M'+(x+69)+' '+(y+81)+'l11 6l11-6" fill="none" stroke="#a28a59"/><path d="M'+(x+14)+' '+(y+117)+'h90" stroke="#8faaa0" stroke-width="4"/></g>';
    if(id==='pick') return '<g class="wf-object"><rect x="'+(x+14)+'" y="'+(y+77)+'" width="99" height="33" rx="5" fill="#a9c4b6"/>'+[0,1,2].map(i=>'<rect x="'+(x+20+i*30)+'" y="'+(y+82)+'" width="24" height="21" rx="3" fill="#eff4ea" stroke="#6b9a83"/>').join('')+'<circle cx="'+(x+66)+'" cy="'+(y+62)+'" r="8" fill="#e5bb8a"/><path d="M'+(x+66)+' '+(y+71)+'v22m0-15l-18 8m18-8l17 8" stroke="#327d68" stroke-width="8" stroke-linecap="round"/></g>';
    if(id==='pack') return '<g class="wf-object"><rect x="'+(x+13)+'" y="'+(y+72)+'" width="93" height="43" rx="4" fill="#b9c7b6"/><path d="M'+(x+21)+' '+(y+121)+'v-6m77 6v-6" stroke="#7f9689" stroke-width="4"/><path d="M'+(x+42)+' '+(y+92)+'v-23l17-10l18 10v23l-18 10z" fill="#dfc28b" stroke="#ac8d58"/><path d="M'+(x+42)+' '+(y+69)+'l17 11l18-11m-18 11v22" fill="none" stroke="#ae8e55"/><rect x="'+(x+85)+'" y="'+(y+84)+'" width="13" height="22" rx="2" fill="#4e8273"/></g>';
    if(id==='sort') return '<g class="wf-object"><rect x="'+(x+16)+'" y="'+(y+62)+'" width="69" height="62" rx="20" fill="none" stroke="#98aea1" stroke-width="14"/><rect x="'+(x+16)+'" y="'+(y+62)+'" width="69" height="62" rx="20" fill="none" stroke="#e4ebe2" stroke-width="8" stroke-dasharray="2 8"/><path d="M'+(x+88)+' '+(y+79)+'h16m-16 16h16m-16 16h16" stroke="#83a48e" stroke-width="7"/><rect x="'+(x+45)+'" y="'+(y+56)+'" width="22" height="13" rx="2" fill="#cda969"/></g>';
    if(id==='outbound') return '<g class="wf-object"><rect x="'+(x+20)+'" y="'+(y+58)+'" width="80" height="68" rx="3" fill="#c1d2c2" stroke="#7b9583"/>'+[0,1,2,3,4,5].map(i=>'<path d="M'+(x+24)+' '+(y+65+i*9)+'h72" stroke="#9db19d" stroke-width="2"/>').join('')+'<path d="M'+(x+11)+' '+(y+127)+'h96" stroke="#436e5d" stroke-width="5"/><path d="M'+(x+87)+' '+(y+107)+'l11 7l-11 7" fill="none" stroke="#007d69" stroke-width="4"/></g>';
    if(id==='hold') return '<g class="wf-object"><rect x="'+(x+17)+'" y="'+(y+55)+'" width="42" height="27" rx="3" fill="#f3dfb4" stroke="#b68b38"/><rect x="'+(x+74)+'" y="'+(y+55)+'" width="42" height="27" rx="3" fill="#ead8b5" stroke="#b68b38"/><path d="M'+(x+31)+' '+(y+62)+'l14 14m0-14l-14 14m59-14v9m0 4v1" stroke="#946c27" stroke-width="3"/></g>';
    if(id==='returns') return '<g class="wf-object"><rect x="'+(x+14)+'" y="'+(y+59)+'" width="106" height="25" rx="3" fill="#b3c3b6"/><rect x="'+(x+24)+'" y="'+(y+48)+'" width="27" height="30" rx="2" fill="#d8bc85"/><path d="M'+(x+82)+' '+(y+57)+'a13 13 0 1 1-8 18m-1-13v14h14" fill="none" stroke="#548674" stroke-width="3"/></g>';
    if(id==='control') return '<g class="wf-object">'+[0,1,2].map(i=>'<rect x="'+(x+15+i*55)+'" y="'+(y+53)+'" width="45" height="30" rx="3" fill="#2d5950"/><path d="M'+(x+21+i*55)+' '+(y+75)+'l8-6l8 3l13-11" fill="none" stroke="#91debc" stroke-width="2"/><path d="M'+(x+37+i*55)+' '+(y+83)+'v6" stroke="#6d8e7b" stroke-width="3"/>').join('')+'<path d="M'+(x+13)+' '+(y+90)+'h167" stroke="#a8b8a9" stroke-width="5"/></g>';
    if(id==='palletise') return '<g class="wf-object"><rect x="'+(x+21)+'" y="'+(y+80)+'" width="48" height="7" fill="#9d8d64"/><rect x="'+(x+25)+'" y="'+(y+59)+'" width="40" height="20" rx="2" fill="#d6bc84"/><rect x="'+(x+107)+'" y="'+(y+78)+'" width="35" height="10" rx="3" fill="#6b8d76"/><path d="M'+(x+124)+' '+(y+78)+'l-11-24l-27-4l-8 13" fill="none" stroke="#49a286" stroke-width="11" stroke-linejoin="round"/><circle cx="'+(x+113)+'" cy="'+(y+54)+'" r="6" fill="#2f7763"/><path d="M'+(x+71)+' '+(y+64)+'h13" stroke="#2d6455" stroke-width="4"/></g>';
    if(id==='staging') return '<g class="wf-object">'+[0,1,2,3].map(i=>'<path d="M'+(x+16+i*62)+' '+(y+50)+'v43" stroke="#d0b65f" stroke-width="2" stroke-dasharray="5 3"/><rect x="'+(x+25+i*62)+'" y="'+(y+57)+'" width="35" height="24" rx="2" fill="#c5b684" stroke="#9e956f"/><path d="M'+(x+23+i*62)+' '+(y+86)+'h39" stroke="#8f967b" stroke-width="5"/>').join('')+'</g>';
    if(id==='destination') return '<g class="wf-object"><path d="M'+(x+19)+' '+(y+84)+'l31-24l32 24v35H'+(x+19)+'z" fill="#d2e8dc" stroke="#59917b" stroke-width="2"/><path d="M'+(x+43)+' '+(y+119)+'V'+(y+94)+'h17v25" fill="#91c4ad"/><rect x="'+(x+24)+'" y="'+(y+91)+'" width="12" height="13" fill="#ecf8f3"/></g>';
    return '';
  }
  const SHAPES = {
    pallet:'<rect x="-14" y="-12" width="28" height="24" rx="3"/><path d="M-14 -4H14M-14 4H14M-7-12V12M7-12V12"/><path d="M-17 15H17" class="wf-token-foot"/>',
    case:'<rect x="-14" y="-11" width="28" height="22" rx="2"/><path d="M0-11V11M-14-4H14"/>',
    bin:'<rect x="-14" y="-12" width="28" height="24" rx="5"/><rect x="-8" y="-6" width="16" height="12" rx="2"/>',
    tote:'<path d="M-15-10H15L12 11H-12Z"/><path d="M-7-4H7M-16-10H16"/>',
    parcel:'<path d="M0-15L15-7V9L0 17L-15 9V-7Z"/><path d="M-15-7L0 1L15-7M0 1V17M-7-11L8-3"/>'
  };
  class WarehouseFloorplan {
    constructor(host, options) {
      if (!host || !host.appendChild) throw new TypeError('WarehouseFloorplan needs a host element.');
      this.host=host;this.options=options||{};this.steps=[];this.scenario={storage:'bin',channel:'b2c'};this.frame={step:0,progress:0,playing:false};this.robotPhase=0;this.listeners=[];
      host.classList.add('wf-floor-host');
      this.svg=el('svg',{viewBox:'0 0 1180 680',class:'wf-floor-svg',role:'group','aria-label':'Interactive conceptual warehouse floor plan. Select a station to see its AI-generated illustration.'},host);
      this.svg.innerHTML='<defs><pattern id="wf-concrete-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#dbe4d8" stroke-width=".6"/></pattern><filter id="wf-token-shadow" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#164f40" flood-opacity=".25"/></filter></defs>'+
        '<rect x="0" y="0" width="1180" height="680" rx="16" fill="#edf2e9"/>'+
        '<text x="25" y="25" class="wf-floor-caption">WAREHOUSE FLOOR · SELECT A STATION TO SEE AI ILLUSTRATIONS</text>'+
        '<g transform="translate(774 21)"><path d="M0 0h24" stroke="#007d69" stroke-width="3"/><text x="32" y="4" class="wf-floor-key">Goods</text><path d="M100 0h24" stroke="#5683bd" stroke-width="2" stroke-dasharray="4 3"/><text x="132" y="4" class="wf-floor-key">Data</text><path d="M190 0h24" stroke="#b48636" stroke-width="2" stroke-dasharray="5 4"/><text x="222" y="4" class="wf-floor-key">Returns</text></g>'+
        '<rect x="23" y="46" width="1015" height="577" rx="12" fill="url(#wf-concrete-grid)" stroke="#809584" stroke-width="3"/>'+
        '<path d="M45 248H1018M45 460H1018" stroke="#e4d79e" stroke-width="29"/>'+
        '<path d="M45 234H1018M45 262H1018M45 446H1018M45 474H1018" stroke="#c6ae59" stroke-width="1.3" stroke-dasharray="10 7"/>'+
        '<path d="M330 248V460" stroke="#e4d79e" stroke-width="17"/>'+
        '<text x="60" y="252" class="wf-aisle-label">MAIN AISLE · ROBOT TRANSFER</text><text x="60" y="464" class="wf-aisle-label">CROSS AISLE · PEOPLE / ROBOTS SEGREGATED IN REAL SITES</text>'+
        '<path d="M1038 333V377" stroke="#edf2e9" stroke-width="6"/><path d="M1024 355H1051" stroke="#93b19d" stroke-width="19"/>'+
        '<text x="1048" y="257" class="wf-outside-label" text-anchor="middle">OUTSIDE</text>'+
        '<path d="M250 623H284" stroke="#edf2e9" stroke-width="7"/>'+
        '<text x="30" y="638" class="wf-floor-key">Illustrative layout · station sizes and travel speeds are not to scale</text>';
      this.zoneLayer=el('g',{class:'wf-zones'},this.svg);
      Object.keys(ZONES).forEach(id=>{
        const z=ZONES[id],g=el('g',{class:'wf-zone'+(id==='destination'?' wf-destination':''),'data-wf-zone':id,role:'button',tabindex:'0','aria-label':z.label+': view AI-generated image'},this.zoneLayer);
        g.innerHTML='<title>'+esc(z.label)+' — select to view a AI-generated image and process details</title><rect class="wf-zone-base" x="'+z.x+'" y="'+z.y+'" width="'+z.w+'" height="'+z.h+'" rx="8"/><text x="'+(z.x+11)+'" y="'+(z.y+22)+'" class="wf-zone-label">'+z.label+'</text><text x="'+(z.x+11)+'" y="'+(z.y+40)+'" class="wf-zone-sub">'+z.sub+'</text>'+furniture(id,z)+camera(z.x+z.w-15,z.y+z.h-15);
        const handler=e=>{if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;if(e.type==='keydown')e.preventDefault();if(this.options.onZoneClick)this.options.onZoneClick(id);};
        g.addEventListener('click',handler);g.addEventListener('keydown',handler);this.listeners.push([g,'click',handler],[g,'keydown',handler]);
      });
      this.trail=el('path',{class:'wf-route-trail','pointer-events':'none'},this.svg);
      this.routeGuide=el('path',{class:'wf-route-guide','pointer-events':'none'},this.svg);
      this.live=el('path',{class:'wf-route-live','pointer-events':'none'},this.svg);
      this.signal=el('path',{class:'wf-route-signal','pointer-events':'none'},this.svg);
      this.returnLabel=el('text',{x:590,y:668,class:'wf-return-label','text-anchor':'middle','pointer-events':'none'},this.svg);this.returnLabel.textContent='OPTIONAL RETURN · RE-ENTER, INSPECT, THEN RESTOCK OR HOLD';
      this.robotLayer=el('g',{'pointer-events':'none',class:'wf-robots'},this.svg);
      this.robots=[0,1].map(i=>{
        const g=el('g',{'class':'wf-amr'},this.robotLayer);
        g.innerHTML='<ellipse cy="8" rx="17" ry="6" fill="#194e3e" opacity=".12"/><rect x="-15" y="-9" width="30" height="20" rx="7" fill="'+(i?'#65977b':'#007d69')+'" stroke="#ecf5e8" stroke-width="2"/><path d="M-8-4h16v10H-8Z" fill="#c9debb"/><circle cx="-16" cy="3" r="3" fill="#38574a"/><circle cx="16" cy="3" r="3" fill="#38574a"/><circle cx="9" cy="-4" r="2" fill="#f6c557"/>';
        return g;
      });
      this.token=el('g',{class:'wf-token','pointer-events':'none',filter:'url(#wf-token-shadow)'},this.svg);
      this.token.innerHTML='<circle r="25" class="wf-token-halo"/><g class="wf-token-shape"></g><g class="wf-token-tag"><rect x="-27" y="24" width="54" height="17" rx="5"/><text y="36" text-anchor="middle"></text></g>';
      this.tokenShape=this.token.querySelector('.wf-token-shape');this.tokenText=this.token.querySelector('.wf-token-tag text');
      this.badges=el('g',{class:'wf-step-badges'},this.svg);
      this.setScenario(this.scenario);this.renderFrame(this.frame);
    }
    setScenario(scenario) {
      this.scenario=Object.assign({},this.scenario,scenario||{});
      STORAGE.forEach(id=>{const g=this.zoneLayer.querySelector('[data-wf-zone="'+id+'"]');g.classList.toggle('wf-zone-unused',id!==this.scenario.storage);});
      const b2b=this.scenario.channel==='b2b';
      this.zoneLayer.querySelector('[data-wf-zone="staging"]').classList.toggle('wf-zone-unused',!b2b);
      this.zoneLayer.querySelector('[data-wf-zone="palletise"]').classList.toggle('wf-zone-unused',!b2b);
      this.zoneLayer.querySelector('[data-wf-zone="sort"]').classList.toggle('wf-zone-unused',b2b);
      const d=this.zoneLayer.querySelector('[data-wf-zone="destination"]');
      d.querySelector('.wf-zone-label').textContent=b2b?'STORE / B2B':'HOME / B2C';
      d.querySelector('.wf-zone-sub').textContent=b2b?'Retailer · business':'Shopper delivery';
      const bulky=this.scenario.category==='bulky';
      const prep=this.zoneLayer.querySelector('[data-wf-zone="palletise"]');
      prep.querySelector('.wf-zone-label').textContent=bulky?'LOAD PREP':'PALLETISE';
      prep.querySelector('.wf-zone-sub').textContent=bulky?'Protect / consolidate':'Build stable store loads';
      if(!prep.querySelector('.wf-bulky-prep')){const z=ZONES.palletise;const g=el('g',{class:'wf-bulky-prep'},prep);g.innerHTML='<rect x="'+(z.x+20)+'" y="'+(z.y+61)+'" width="112" height="24" rx="4" fill="#d6bc84" stroke="#9d8d64"/><path d="M'+(z.x+18)+' '+(z.y+89)+'h116" stroke="#8d835e" stroke-width="5"/>';}prep.querySelector('.wf-bulky-prep').style.display=bulky?'':'none';prep.querySelector('.wf-object').style.display=bulky?'none':'';
      this.svg.setAttribute('data-wf-channel',this.scenario.channel);
      this.svg.setAttribute('data-wf-storage',this.scenario.storage);
    }
    setSteps(steps) {
      this.steps=(Array.isArray(steps)?steps:[]).map(s=>Object.assign({},s,{zone:ZONES[s.zone]?s.zone:'control'}));
      this.badges.innerHTML='';
      const seen={};
      this.steps.forEach((s,i)=>{
        const z=ZONES[s.zone],k=seen[s.zone]||0;seen[s.zone]=k+1;
        const x=z.x+16+(k%Math.max(1,Math.floor((z.w-20)/25)))*25,y=z.y+z.h-13-Math.floor(k/Math.max(1,Math.floor((z.w-20)/25)))*23;
        const g=el('g',{class:'wf-step-badge','data-wf-step':i,role:'button',tabindex:'0','aria-label':'Step '+(i+1)+': '+(s.label||z.label),transform:'translate('+x+' '+y+')'},this.badges);
        g.innerHTML='<title>Step '+(i+1)+': '+esc(s.label||z.label)+'</title><circle r="11"/><text y="4" text-anchor="middle">'+(i+1)+'</text>';
        const handler=e=>{if(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' ')return;e.stopPropagation();if(e.type==='keydown')e.preventDefault();if(this.options.onStageClick)this.options.onStageClick(i);};
        g.addEventListener('click',handler);g.addEventListener('keydown',handler);
      });
      this.returnLabel.style.display=this.steps.some(s=>s.type==='return')?'':'none';
      this.renderFrame({step:0,progress:0,playing:false});
    }
    physicalBefore(index) {
      for(let i=index-1;i>=0;i--)if(this.steps[i].type!=='data'&&this.steps[i].zone!=='control')return this.steps[i].zone;
      return 'inbound';
    }
    renderFrame(frame) {
      this.frame=Object.assign({},this.frame,frame||{});
      const i=Math.max(0,Math.min(this.steps.length-1,Number(this.frame.step)||0));
      const p=Math.max(0,Math.min(1,Number(this.frame.progress)||0));
      const s=this.steps[i]||{zone:'inbound',unit:'pallet',type:'goods'};
      const prev=this.physicalBefore(i),data=s.type==='data';
      const routePoints=data?route('control','pick','data'):i===0?[{x:25,y:355},point(s.zone)]:route(prev,s.zone,s.type);
      const total=length(routePoints);
      let trails=[];
      this.steps.slice(0,i).forEach((old,n)=>{if(old.type!=='data')trails.push(pathD(route(this.physicalBefore(n),old.zone,old.type)));});
      this.trail.setAttribute('d',trails.join(' '));
      this.routeGuide.setAttribute('d',data?'':pathD(routePoints));
      this.live.setAttribute('d',data?'':pathD(routePoints));
      this.live.classList.toggle('wf-route-return',s.type==='return');
      this.live.setAttribute('stroke-dasharray',total+' '+total);this.live.setAttribute('stroke-dashoffset',total*(1-p));
      this.signal.setAttribute('d',data?pathD(routePoints):'');
      this.signal.setAttribute('stroke-dashoffset',String(-p*50));
      const pos=data?point(prev):at(routePoints,p);
      this.token.setAttribute('transform','translate('+pos.x.toFixed(2)+' '+pos.y.toFixed(2)+')');
      let priorUnit='pallet';for(let n=i-1;n>=0;n--)if(this.steps[n].unit){priorUnit=this.steps[n].unit;break;}
      const unit=data?priorUnit:(s.unit||priorUnit);
      if(this.tokenUnit!==unit){this.tokenUnit=unit;this.tokenShape.innerHTML=SHAPES[unit]||SHAPES.case;this.tokenText.textContent=unit==='case'?'CARTON':String(unit).toUpperCase();}
      this.zoneLayer.querySelectorAll('.wf-zone').forEach(g=>g.classList.toggle('wf-zone-active',g.dataset.wfZone===s.zone));
      this.badges.querySelectorAll('.wf-step-badge').forEach(g=>{const n=+g.dataset.wfStep;g.classList.toggle('wf-step-current',n===i);g.classList.toggle('wf-step-done',n<i);g.setAttribute('aria-current',n===i?'step':'false');});
      if(this.frame.playing)this.robotPhase=i+p;
      const phase=this.robotPhase;
      this.robotLayer.style.display=this.frame.showRobots===false?'none':'';
      this.robots[0].setAttribute('transform','translate('+(550+((phase*89)%415)).toFixed(2)+' 248)');
      this.robots[1].setAttribute('transform','translate('+(950-((phase*67)%365)).toFixed(2)+' 460)');
      this.svg.setAttribute('data-wf-playing',this.frame.playing?'true':'false');
    }
    destroy() {
      this.listeners.forEach(([node,event,handler])=>node.removeEventListener(event,handler));this.listeners=[];
      this.svg.remove();this.host.classList.remove('wf-floor-host');this.steps=[];
    }
  }
  window.WarehouseFloorplan=WarehouseFloorplan;
})();
