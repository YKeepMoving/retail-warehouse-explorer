/* Shared geometry for the walkthrough and background traffic. Coordinates are unitless. */
(() => {
 'use strict';
 const P=(x,y,unit)=>({x,y,unit});
 const leg=(unit,points)=>points.map(([x,y])=>P(x,y,unit));
 const legs={
  arrival:leg('pallet',[[-45,324],[50,324]]),
  inspect:leg('case',[[50,324],[60,324],[60,355]]),
  reserve:leg('pallet',[[60,355],[85,355],[85,195],[250,195],[250,145]]),
  highbay:leg('pallet',[[60,355],[85,355],[85,195],[550,195],[550,145]]),
  bulky:leg('pallet',[[60,355],[85,355],[85,195],[800,195],[800,145]]),
  decant:leg('case',[[550,145],[550,195],[530,195],[530,250]]),
  storeBins:leg('bin',[[530,250],[410,250],[280,250]]),
  consumerPick:leg('bin',[[280,250],[280,330],[410,330],[530,330]]),
  pack:leg('tote',[[530,330],[530,355],[715,355],[715,300]]),
  casePick:leg('case',[[250,145],[250,195],[120,195],[120,405],[300,405],[300,510]]),
  storeLoad:leg('case',[[300,510],[300,405],[600,405],[600,510]]),
  parcelSort:leg('parcel',[[715,300],[715,355],[840,355],[840,300]]),
  dispatchB2C:leg('parcel',[[840,300],[840,355],[950,355],[950,324],[1045,324]]),
  dispatchB2B:leg('pallet',[[600,510],[695,510],[695,405],[950,405],[950,519],[1045,519]]),
  returnArrival:leg('parcel',[[-45,519],[50,519],[85,519],[85,405],[750,405],[750,510]]),
  restockBins:leg('bin',[[750,510],[750,405],[120,405],[120,195],[530,195],[530,250],[410,250],[280,250]]),
  restockReserve:leg('pallet',[[750,510],[750,405],[120,405],[120,195],[250,195],[250,145]]),
  orderB2C:leg('tote',[[850,450],[850,405],[530,405],[530,340]]),
  orderB2B:leg('pallet',[[850,450],[850,405],[300,405],[300,510]]),
  feedbackB2C:leg('bin',[[530,340],[630,340],[630,250],[530,250]]),
  feedbackB2B:leg('case',[[300,510],[460,510],[460,405],[120,405],[120,195],[250,195],[250,145]])
 };
 const join=(...parts)=>{
  const points=[];
  parts.forEach(part=>part.forEach(point=>{
   const last=points[points.length-1];
   if(last&&last.x===point.x&&last.y===point.y)points[points.length-1]=point;
   else points.push(point);
  }));
  return points;
 };
 const phases=[
  {id:'receive',zone:'inbound',title:'Receive supplier goods',shortLabel:'Receive goods',group:'Inbound',copy:'Supplier stock enters through an assigned receiving dock. Shared accepted inventory can later serve either order channel.',routes:['arrival']},
  {id:'inspect',zone:'inbound',title:'Scan, count and accept',shortLabel:'Inspect & accept',group:'Inbound checks',copy:'Identify, count and inspect the receipt. Discrepancies or damaged goods go to the segregated inbound QA hold bay; only accepted stock proceeds to put-away.',routes:['inspect']},
  {id:'putaway',zone:'reserve',title:'Put away accepted stock',shortLabel:'Put away stock',group:'Storage alternatives',copy:'Separate accepted loads go to pallet reserve, automated high-bay or bulky storage according to their handling profile. Confirm each location. Bulky outbound handling serves both channels but is not animated in this tote/case example.',routes:['reserve','highbay','bulky'],zones:['reserve','highbay','oversize']},
  {id:'replenish',zone:'replenish',title:'Replenish bins when needed',shortLabel:'Replenish as needed',group:'Ongoing inventory loop',channel:'b2c',copy:'Retrieve compatible cases from high-bay and decant them at the tote system input port. This is proactive stock maintenance, not a one-time prerequisite: low stock or newly released order demand can trigger another cycle.',routes:['decant']},
  {id:'store',zone:'gtp',title:'Store compatible small items',shortLabel:'Store bins',group:'B2C storage',channel:'b2c',copy:'Identified bins enter the grid through the adjacent decant port. Decant and picking are separate ports on the storage perimeter.',routes:['storeBins']},
  {id:'release',zone:'control',title:'Reserve stock and release work',shortLabel:'Release order work',group:'Digital order',type:'data',copy:'Reserve available stock and release pick tasks for the selected channel. Dashed paths carry instructions, not goods. An empty pick face creates replenishment work before the affected pick can proceed.',routes:['orderB2C','orderB2B']},
  {id:'pick',zone:'pick',title:'Pick the consumer order',shortLabel:'Pick consumer items',group:'B2C fulfillment',channel:'b2c',copy:'The grid presents inventory at its directly adjoining pick port. Transfer the confirmed pieces into an order tote; difficult items and shortages need exception handling. Consumption feeds the repeating replenishment loop.',routes:['consumerPick']},
  {id:'pack',zone:'pack',title:'Pack, verify and label',shortLabel:'Pack consumer order',group:'B2C fulfillment',channel:'b2c',copy:'Order totes leave the pick port toward packing without passing through decant. Consolidate lines, protect the goods, verify contents and label the parcel.',routes:['pack']},
  {id:'cases',zone:'rack',title:'Replenish and pick store cases',shortLabel:'Pick store cases',group:'B2B case picking',channel:'b2b',copy:'Reserve stock refills the forward case faces through the dedicated north–south pallet transfer aisle. Pick the store quantities. Pallet traffic stays outside the consumer grid, decant and manned pick band.',routes:['casePick']},
  {id:'store-load',zone:'b2b',title:'Prepare the retail store load',shortLabel:'Build store load',group:'B2B fulfillment',channel:'b2b',copy:'Consolidate picked cases into stable, labeled store loads and stage by route. Full-pallet lines can bypass case picking and building a new pallet; retain identity, securing and dispatch checks.',routes:['storeLoad']},
  {id:'sort',zone:'sort',title:'Sort the consumer parcels',shortLabel:'Sort parcels',group:'B2C outbound',channel:'b2c',copy:'Route compatible consumer parcels to carrier and service lanes. Store pallets and bulky goods bypass this parcel sorter.',routes:['parcelSort']},
  {id:'dispatch',zone:'outbound',title:'Dispatch both channels',shortLabel:'Dispatch both flows',group:'Outbound',copy:'Consumer parcels and store pallets follow separate highlighted routes to their loading docks. Confirm handover for each shipment. Dispatch is not proof of delivery.',routes:['dispatchB2C','dispatchB2B']},
  {id:'return',zone:'returns',title:'Inspect an optional return',shortLabel:'Receive & inspect return',group:'Reverse flow · optional',type:'return',copy:'A separate returned shipment arrives at the inbound returns dock, then follows the receiving corridor and south cross-aisle to inspection. Hold uncertain stock until a disposition is approved.',routes:['returnArrival']},
  {id:'restock',zone:'gtp',title:'Restock approved inventory',shortLabel:'Restock approved stock',group:'Return disposition · example',type:'return',copy:'This is an approved, saleable small-item return going back through decant to tote storage. Unresolved, damaged or unsuitable returns remain blocked or follow another approved recovery route.',routes:['restockBins']}
 ];
 legs.returnStoreArrival=legs.returnArrival.map(p=>({...p,unit:'pallet'}));
 function view(phase,mode){
  if(phase.id==='dispatch'){
   if(mode==='b2c')return {...phase,title:'Dispatch consumer parcels',shortLabel:'Dispatch parcels',copy:'Scan the parcel handover and load the consumer carrier at its dock. Carrier transport and delivery occur after warehouse dispatch.',routes:['dispatchB2C']};
   if(mode==='b2b')return {...phase,title:'Dispatch retail store loads',shortLabel:'Dispatch store loads',copy:'Scan and secure the verified store pallets, then load the assigned freight vehicle at its dock. Store receipt is confirmed after transport.',routes:['dispatchB2B']};
  }
  if(phase.type==='data')return {...phase,routes:mode==='both'?phase.routes:[mode==='b2b'?'orderB2B':'orderB2C']};
  if(phase.id==='return'&&mode==='b2b')return {...phase,routes:['returnStoreArrival']};
  if(phase.id==='restock'&&mode==='b2b')return {...phase,zone:'reserve',copy:'An approved saleable store return is confirmed back into reserve pallet storage through the dedicated transport aisle. Unresolved or damaged returns stay blocked for disposition.',routes:['restockReserve']};
  return phase;
 }
 const ambient={
  b2c:join(legs.arrival,legs.inspect,legs.highbay,legs.decant,legs.storeBins,legs.consumerPick,legs.pack,legs.parcelSort,legs.dispatchB2C),
  b2b:join(legs.arrival,legs.inspect,legs.reserve,legs.casePick,legs.storeLoad,legs.dispatchB2B),
  shared:join(legs.arrival,legs.inspect,legs.reserve),
  return:join(legs.returnArrival,legs.restockBins),
  returnB2B:join(legs.returnArrival.map(p=>({...p,unit:'pallet'})),legs.restockReserve)
 };
 window.WAREHOUSE_OVERVIEW_FLOW={P,legs,phases,view,ambient};
})();
