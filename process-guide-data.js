window.WAREHOUSE_PROCESS_GUIDE = {
  "checkedAt": "2026-10-19",
  "scope": "An educational example for an omnichannel retail warehouse. Equipment, checks and order rules depend on the operation. Automation assists people; it does not imply that every task is autonomous.",
  "shared": [
    {
      "id": "plan-inbound",
      "title": "Plan the inbound arrival",
      "summary": "Prepare the receiving team before supplier stock reaches the dock.",
      "input": "Purchase order and supplier shipment notice",
      "output": "Expected receipt and planned unloading slot",
      "subprocesses": [
        "Match the expected products and quantities to the purchase order.",
        "Record the shipment notice and expected arrival.",
        "Assign a suitable dock, staging space and unloading resources.",
        "Flag special handling needs before the vehicle arrives."
      ],
      "pain": "Late arrivals and incomplete shipment data disrupt dock capacity.",
      "automation": "Connected supplier data and scheduling software organize the plan.",
      "zone": "inbound"
    },
    {
      "id": "receive",
      "title": "Receive, inspect and accept",
      "summary": "Identify what actually arrived and separate accepted stock from exceptions.",
      "input": "Supplier vehicle, pallets or cartons",
      "output": "Recorded receipt with stock status",
      "subprocesses": [
        "Unload into the assigned receiving area.",
        "Scan product or load identities and count quantities.",
        "Check condition and any required batch or expiry information.",
        "Move discrepancies or damaged stock to the inbound QA hold bay for review; accept eligible goods."
      ],
      "pain": "Wrong quantities and hidden damage create inventory errors.",
      "automation": "Barcode capture, conveyors and suitable inspection cameras assist receiving.",
      "zone": "inbound"
    },
    {
      "id": "putaway",
      "title": "Put away and track inventory",
      "summary": "Move accepted stock to the appropriate storage location and confirm it.",
      "input": "Accepted, identified stock",
      "output": "Traceable stock in a confirmed location",
      "subprocesses": [
        "Choose reserve pallet, automated high-bay or bulky storage for accepted goods; route compatible cases through decant into tote storage.",
        "Create a movement task to the assigned location.",
        "Move the goods and confirm product, quantity and location.",
        "Maintain stock status and resolve differences through inventory checks."
      ],
      "pain": "Misplaced stock causes searches, short picks and inaccurate availability.",
      "automation": "Storage software directs locations; compatible AS/RS handles retrieval and storage.",
      "zone": "reserve"
    },
    {
      "id": "replenish",
      "title": "Replenish the picking areas",
      "summary": "Run an ongoing replenishment loop as pick stock is consumed: planned minimum/maximum rules and released-order demand can both trigger work.",
      "input": "Reserve stock, pick-face consumption, minimum/maximum targets and released-order demand",
      "output": "Confirmed stock at the pick face or in totes",
      "subprocesses": [
        "Monitor consumption and minimum/maximum levels; also create demand-based replenishment after order release when pick stock is insufficient.",
        "Retrieve the required reserve pallet or cases.",
        "For B2C, decant compatible case contents into identified totes.",
        "For B2B, refill the case pick face; confirm all quantities moved and continue monitoring consumption."
      ],
      "pain": "Empty pick locations stop downstream work despite stock in reserve.",
      "automation": "Demand or minimum/maximum rules trigger work; conveyors connect decant and storage.",
      "zone": "replenish"
    }
  ],
  "b2c": [
    {
      "id": "b2c-release",
      "title": "Release the consumer order",
      "summary": "Convert a confirmed online order into executable warehouse tasks.",
      "input": "Customer order and available stock",
      "output": "Reserved stock and picking instructions",
      "subprocesses": [
        "Check the order, delivery promise and stock availability.",
        "Reserve suitable inventory for the order.",
        "Group compatible work into a batch or wave when useful.",
        "Release pick tasks against downstream packing capacity."
      ],
      "pain": "Uncontrolled release overloads packing or releases unavailable products.",
      "automation": "Order and warehouse software coordinate reservations and work release.",
      "zone": "control"
    },
    {
      "id": "b2c-pick",
      "title": "Pick individual items",
      "summary": "Collect the exact pieces needed by each consumer order.",
      "input": "Pick instructions and inventory",
      "output": "Confirmed items in an order container",
      "subprocesses": [
        "Present inventory at a station or guide the picker to it.",
        "Identify the product and required quantity.",
        "Transfer pieces into the correct order tote or carton.",
        "Confirm the pick and send shortages or damaged items for resolution."
      ],
      "pain": "Walking, similar products and mixed orders increase errors.",
      "automation": "Goods-to-person systems reduce travel; robotic grasping suits compatible items.",
      "zone": "pick"
    },
    {
      "id": "b2c-pack",
      "title": "Consolidate and pack",
      "summary": "Bring order lines together and protect them for parcel transport.",
      "input": "Picked items from one or more areas",
      "output": "Complete, protected and sealed parcel",
      "subprocesses": [
        "Merge separate picks into the correct customer order.",
        "Confirm the expected items are present.",
        "Select suitable packaging and protection for the contents.",
        "Insert required documents or extras and seal the package."
      ],
      "pain": "Missing order lines and excess packaging delay the packing bench.",
      "automation": "Put walls organize consolidation; packing aids suggest packaging and assist sealing.",
      "zone": "pack"
    },
    {
      "id": "b2c-verify",
      "title": "Verify, label and sort",
      "summary": "Check the parcel and route it toward the correct shipping lane.",
      "input": "Sealed customer parcel",
      "output": "Labeled parcel in its carrier or destination lane",
      "subprocesses": [
        "Scan the parcel identity and check expected versus actual weight.",
        "Apply the shipping label and verify it can be read.",
        "Divert failed checks for investigation.",
        "Sort passed parcels to the correct carrier, service or destination."
      ],
      "pain": "Unreadable labels and wrong routing cause rework and missed departures.",
      "automation": "Scales, scanners, label applicators and sorters perform repeatable checks.",
      "zone": "sort"
    },
    {
      "id": "b2c-dispatch",
      "title": "Dispatch to the carrier",
      "summary": "Transfer the correct parcels to the planned outbound vehicle.",
      "input": "Sorted parcels and a planned departure",
      "output": "Confirmed carrier handover and shipment status",
      "subprocesses": [
        "Bring parcels to the assigned dock or loading unit.",
        "Match the shipment to the carrier and service.",
        "Scan and load the correct vehicle, cage or trailer.",
        "Confirm departure and send the shipment event to tracking."
      ],
      "pain": "Missed cutoffs and incorrect handovers break the delivery promise.",
      "automation": "Load planning and scan confirmations link physical loading to shipment records.",
      "zone": "outbound"
    },
    {
      "id": "b2c-delivery",
      "title": "Deliver to the consumer",
      "summary": "The parcel leaves this warehouse and travels through the delivery network.",
      "input": "Dispatched parcel",
      "output": "Delivery confirmation or an exception requiring action",
      "subprocesses": [
        "Transport parcels to the next sorting or delivery facility.",
        "Sort by local route and load the delivery vehicle.",
        "Deliver to the address, pickup point or locker.",
        "Record delivery or handle a failed attempt."
      ],
      "pain": "Address problems and failed attempts add delay and repeat travel.",
      "automation": "Tracking events and route planning support drivers and customer updates.",
      "zone": null
    }
  ],
  "b2b": [
    {
      "id": "b2b-release",
      "title": "Release the store order",
      "summary": "Turn retail replenishment demand into a warehouse shipment plan.",
      "input": "Store replenishment order or transfer order",
      "output": "Released work tied to a store and departure",
      "subprocesses": [
        "Confirm store quantities and the required delivery window.",
        "Check stock availability and reserve eligible inventory.",
        "Group orders around store routes and departure schedules.",
        "Release warehouse tasks when stock and execution capacity are ready."
      ],
      "pain": "Large order waves can crowd staging and miss store delivery windows.",
      "automation": "Warehouse software coordinates order waves, stock allocation and load planning.",
      "zone": "control"
    },
    {
      "id": "b2b-allocate",
      "title": "Choose pallet or case fulfillment",
      "summary": "Choose the handling unit that fits each store order line.",
      "input": "Reserved store demand",
      "output": "Full-pallet retrieval or mixed-case picking tasks",
      "subprocesses": [
        "Identify lines that can ship as an intact full pallet.",
        "Retrieve those pallets without breaking them into cases.",
        "Send smaller quantities or mixed products to case picking.",
        "Coordinate both streams for the same store shipment."
      ],
      "pain": "Breaking full pallets unnecessarily adds handling and congestion.",
      "automation": "Allocation rules select suitable stock and equipment routes.",
      "note": "Full-pallet lines bypass the case-picking and mixed-pallet-building steps. They still need the required identity, condition, securing and dispatch checks.",
      "zone": "reserve"
    },
    {
      "id": "b2b-casepick",
      "title": "Pick and consolidate cases",
      "summary": "Build the store's required case quantities from forward or reserve stock.",
      "input": "Mixed-case work and available stock",
      "output": "Confirmed store cases ready for load building",
      "subprocesses": [
        "Replenish case pick locations where required.",
        "Pick the specified cases by product and quantity.",
        "Confirm store or order identity at each transfer.",
        "Bring cases from different areas together; resolve shortages."
      ],
      "pain": "Heavy handling and store mix-ups create errors and fatigue.",
      "automation": "Voice or light guidance, conveyors and goods-to-person case stations assist picking.",
      "zone": "rack"
    },
    {
      "id": "b2b-build",
      "title": "Build and label store loads",
      "summary": "Turn mixed cases into stable loads that are practical for the store.",
      "input": "Consolidated cases for the store",
      "output": "Secured, identified store pallet or roll cage",
      "subprocesses": [
        "Plan the build around weight, dimensions and product compatibility.",
        "Group products by store department when the operation supports it.",
        "Stack without crushing vulnerable products and secure the load.",
        "Apply the store and load identity and verify the finished load."
      ],
      "pain": "Unstable pallets damage products and slow store unloading.",
      "automation": "Pallet planning and robotic palletizers assist compatible case patterns.",
      "zone": "b2b"
    },
    {
      "id": "b2b-dispatch",
      "title": "Stage, load and dispatch",
      "summary": "Bring store loads together and load them for the planned delivery route.",
      "input": "Finished pallets, cages and full-pallet lines",
      "output": "Verified store shipment on the outbound vehicle",
      "subprocesses": [
        "Stage loads in the assigned store or route lane.",
        "Match load identities to the shipment and departure.",
        "Load in a suitable sequence with required handling conditions.",
        "Confirm handover, departure and shipment information for the store."
      ],
      "pain": "Mixed store lanes and poor loading sequences cause wrong or delayed deliveries.",
      "automation": "Route and load software support trailer utilization and scan verification.",
      "zone": "outbound"
    },
    {
      "id": "b2b-store",
      "title": "Receive at the retail store",
      "summary": "The store accepts the shipment and moves products toward the selling floor.",
      "input": "Store delivery and shipment information",
      "output": "Confirmed receipt and stock ready for store replenishment",
      "subprocesses": [
        "Check that the shipment belongs to the receiving store.",
        "Unload and check delivered units and visible condition.",
        "Record receipt and report shortages or damage.",
        "Move products to backroom or department replenishment areas."
      ],
      "pain": "Poorly grouped loads add sorting work before shelf replenishment.",
      "automation": "Shipment scans support receipt; store-ready pallets simplify department handling.",
      "zone": null
    }
  ],
  "returns": [
    {
      "id": "return-inspect",
      "title": "Receive and inspect the return",
      "summary": "Evaluate consumer returns or store returns before deciding their next destination.",
      "input": "Returned item or store stock and return reference",
      "output": "Recorded condition and approved disposition",
      "subprocesses": [
        "Match the return to its authorization or shipment reference.",
        "Inspect identity, packaging, completeness and condition.",
        "Keep uncertain or damaged stock separate from saleable inventory.",
        "Decide whether to restock, repair, return to supplier or use another recovery route."
      ],
      "pain": "Mixed conditions and missing references make returns unpredictable.",
      "automation": "Scanning and decision rules assist tracking; people resolve ambiguous conditions.",
      "zone": "returns"
    },
    {
      "id": "return-restock",
      "title": "Restock approved stock or recover value",
      "summary": "Only approved inventory rejoins available stock; other items follow their disposition.",
      "input": "Inspected return with a recorded decision",
      "output": "Confirmed restock or documented recovery movement",
      "subprocesses": [
        "Prepare and relabel eligible stock where required.",
        "Update its condition, quantity and saleable status.",
        "Move approved stock to a confirmed storage location.",
        "Send other items to repair, supplier return, resale, donation or recycling as appropriate."
      ],
      "pain": "Unapproved restocking creates quality problems and inaccurate available inventory.",
      "automation": "Warehouse tasks and scan confirmations track the approved destination.",
      "zone": "reserve"
    }
  ],
  "designNotes": [
    "Order release is a digital instruction. Physical inventory does not travel through the control room.",
    "B2C often picks pieces for consumer parcels; B2B often ships cases, mixed pallets or intact pallets to stores. These are examples, not rules for every order.",
    "The B2B full-pallet bypass is a conceptual routing rule: intact pallets skip case picking and mixed-pallet building, while retaining shipment checks.",
    "Replenishment can run repeatedly while either channel is fulfilling orders; it is not only a one-time linear stage.",
    "Store receiving checks, inbound resource scheduling, and exception handling are general operating practices in this educational synthesis; they are not presented as a copy of one company's SOP.",
    "Delivery and store receiving happen beyond the warehouse. A warehouse dispatch event is not proof of final delivery.",
    "An optional cross-dock path can bypass storage for eligible preallocated stock. It is not shown in the main teaching sequence.",
    "Humanoids are not required for the process. Their suitability depends on payload, reach, task reliability, integration and the operating environment; purpose-built systems often handle repeated transport, storage and sortation tasks."
  ]
};
