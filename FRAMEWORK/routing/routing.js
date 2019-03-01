let canvas = document.getElementById("canvas");

let instance = window.jsp = jsPlumb.getInstance({
	DragOptions: { cursor: "pointer", zIndex: 2000 },
	Container: "canvas"
});

let connectorPaintStyle = {
		video: {
			strokeWidth: 2,
			stroke: "#61B7CF",
			joinstyle: "round",
			outlineStroke: "white",
			outlineWidth: 2,
		},
		audio: {
			strokeWidth: 2,
			stroke: "#434343",
			joinstyle: "round",
			outlineStroke: "white",
			outlineWidth: 2,
			dashstyle: "2 4"
		}
	},
	connectorHoverStyle = {
		strokeWidth: 3,
		stroke: "#216477",
		outlineWidth: 5,
		outlineStroke: "white"
	},
	endpointHoverStyle = {
		video: {
			fill: "#216477",
			stroke: "#216477"
		},
		audio: {
			fill: "#346789",
			stroke: "#346789"
		}
	},
	sourceEndpoint = {
		video: {
			scope: "video",
			endpoint: "Dot",
			cssClass: "video-endpoint",
			connectorClass: "video-connector",
			paintStyle: {
				stroke: "#7AB02C", 
				fill: "#7AB02C",
				radius: 8,
				strokeWidth: 1
			},
			isSource: true,
			maxConnections: -1,
			connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: false } ],
			connectorStyle: connectorPaintStyle.video,
			hoverPaintStyle: endpointHoverStyle.video,
			connectorHoverStyle: connectorHoverStyle,
			dragOptions: {},
			overlays: [
				[ "Label", {
					location: [0.5, 1.5],
					label: "",
					cssClass: "endpointSourceLabel",
					visible:true
				} ]
			],
			connectorOverlays: [
				[ "Arrow", { width:15, length:10, location:0.45, id:"arrow" } ], 
			]
		},
		audio: {
			scope: "audio",
			endpoint: "Rectangle",
			cssClass: "audio-endpoint",
			connectorClass: "audio-connector",
			paintStyle: {
				stroke: "#346789",
				fill: "#346789",
				height: 16, 
				width: 16,
				strokeWidth: 1
			},
			isSource: true,
			maxConnections: -1,
			connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: false } ],
			connectorStyle: connectorPaintStyle.audio,
			hoverPaintStyle: endpointHoverStyle.audio,
			connectorHoverStyle: connectorHoverStyle,
			dragOptions: {},
			overlays: [
				[ "Label", {
					location: [0.5, 1.5],
					label: "",
					cssClass: "endpointSourceLabel",
					visible:true
				} ]
			],
			connectorOverlays: [
				[ "Arrow", { width:15, length:10, location:0.55, id:"arrow" } ], 
			]
		}
	},
	targetEndpoint = {
		video: {
			scope: "video",
			endpoint: "Dot",
			cssClass: "video-endpoint",
			paintStyle: { fill: "#7AB02C", radius: 8 },
			hoverPaintStyle: endpointHoverStyle.video,
			maxConnections: 1,
			dropOptions: { hoverClass: "hover", activeClass: "active" },
			isTarget: true,
			overlays: [
				[ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
			]
		},
		audio: {
			scope: "audio",
			endpoint: "Rectangle",
			cssClass: "audio-endpoint",
			paintStyle: { fill: "#346789", height: 16, width: 16 },
			hoverPaintStyle: endpointHoverStyle.audio,
			maxConnections: 1,
			dropOptions: { hoverClass: "hover", activeClass: "active" },
			isTarget: true,
			overlays: [
				[ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
			]
		},
	};


	
let _addEndpoints = function (toId, sourceAnchors, targetAnchors, params) {
	for (let i = 0; i < sourceAnchors.length; i++) {
		let sourceUUID = toId + sourceAnchors[i];
		instance.addEndpoint(toId, sourceEndpoint[params.signal_type], {
			anchor: sourceAnchors[i],
			uuid: sourceUUID,
			parameters: params,
		});
	}
	for (let j = 0; j < targetAnchors.length; j++) {
		let targetUUID = toId + targetAnchors[j];
		instance.addEndpoint(toId, targetEndpoint[params.signal_type], { 
			anchor: targetAnchors[j],
			uuid: targetUUID,
			parameters: params
		});
	}
};

let _createBlock = function (blockType) {
	if (blockProto[blockType].max_instances <= blockProto[blockType].index) { return; }

	let newBlock = document.createElement("div");
	newBlock.classList = "jtk-node " + blockProto[blockType].class;
	newBlock.id = blockProto[blockType].identifier + "_" + blockProto[blockType].index;

	let nameDiv = document.createElement("div");
	nameDiv.classList.add("block-name");
	nameDiv.appendChild(document.createTextNode(blockProto[blockType].description + (blockProto[blockType].max_instances === 1 ? "" : " " + blockProto[blockType].index)));
	newBlock.appendChild(nameDiv);

	newBlock.appendChild(document.createElement("p"));

	let button = document.createElement("button");
	button.textContent = "Show/hide details";
	button.setAttribute("onclick","_expandBlock('" + newBlock.id + "')");
	newBlock.appendChild(button);

	let parameterSection = document.createElement("div");
	parameterSection.hidden = true;
	parameterSection.classList = "parameter-section";
	for (let p of blockProto[blockType].parameters) {
		let parameter = document.createElement("div");
		let parameterField;
		parameter.classList = "parameter " + p.id;
		parameter.appendChild(document.createTextNode(p.name));
		if (p.type === "select") {
			parameterField = document.createElement("select");
			for (let i = 0; i < p.value.length; i++) {
				let option = document.createElement("option");
				option.value = p.value[i];
				option.appendChild(document.createTextNode((p.hasOwnProperty("text") ? p.text[i] : p.value[i])));
				parameterField.appendChild(option);
			}
			parameterField.style.align = "right";
		} else {
			parameterField = document.createElement("input");
			parameterField.type = p.type;
			parameterField.value = p.value;
		}

		if (p.oninput === true) {
			parameterField.setAttribute("oninput","_updateEndpoints('" + newBlock.id + "', '" + blockType + "')");
		}

		parameterField.disabled = p.disabled || false;

		parameter.appendChild(parameterField);
		parameterSection.appendChild(parameter);
	}

	if (blockProto[blockType].deletable) {
		let deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.setAttribute("onclick","_deleteBlock('" + newBlock.id + "')");
		parameterSection.appendChild(deleteButton);
	}

	newBlock.appendChild(parameterSection);
	blockProto[blockType].index++;
	canvas.appendChild(newBlock);
	_updateEndpoints(newBlock.id, blockType);
	instance.draggable(jsPlumb.getSelector(".routing ." + blockProto[blockType].class), { grid: [20, 20] });
};

//Add/remove endpoints
let _updateEndpoints = function (blockId, blockType) {
	let b = document.getElementById(blockId);
	let newIo = {
		video: {in: 0, out: 0},
		audio: {in: 0, out: 0}
	};
	let overlap = false;
	let crossbarType;
	if (blockType === "crossbar") {
		crossbarType = b.querySelector(".parameter.crossbar-type").getElementsByTagName("select")[0].value;
		switch (crossbarType) {
		case "a_v":
			overlap = true;
			newIo.video.in = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			newIo.video.out = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			newIo.audio.in = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			newIo.audio.out = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			break;
		case "video":
			newIo.video.in = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			newIo.video.out = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			break;
		case "large":
			newIo.audio.in = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			newIo.audio.out = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			break;
		default:
			break;
		}
	} 
	else if (blockType === "io_module") {
		overlap = true;
		let moduleType = b.querySelector(".parameter.io-module-type").getElementsByTagName("select")[0].value;
		switch (moduleType) {
		case "2/2/16":
			b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].disabled = false;
			b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].disabled = false;
			newIo.video.in = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			newIo.audio.in = b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
			newIo.video.out = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			newIo.audio.out = b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value;
			break;
		default:
			b.querySelector(".parameter.outputs").getElementsByTagName("input")[0].disabled = true;
			b.querySelector(".parameter.inputs").getElementsByTagName("input")[0].disabled = true;
			newIo.video.in = moduleType.split("/")[0];
			newIo.audio.in = moduleType.split("/")[0];
			newIo.video.out = moduleType.split("/")[1];
			newIo.audio.out = moduleType.split("/")[1];
			break;
		}
	}
	else if (blockType === "rtp_receiver") {
		newIo.video.out = b.querySelector(".parameter.video-receivers").getElementsByTagName("input")[0].value;
		newIo.audio.out = b.querySelector(".parameter.audio-receivers").getElementsByTagName("input")[0].value;
	}
	else if (blockType === "video_transmitter") {
		newIo = JSON.parse(JSON.stringify(blockProto[blockType].fixed_endpoints));
		if (b.querySelector(".parameter.format").getElementsByTagName("select")[0].value === "ST2022_6") {
			newIo.audio.in = 1;
		}
	}
	else if (["audio_transmitter", "audio_delay", "video_delay"].includes(blockType)) {
		newIo = JSON.parse(JSON.stringify(blockProto[blockType].fixed_endpoints));
	}

	newIo.audio.in = parseInt(newIo.audio.in);
	newIo.audio.out = parseInt(newIo.audio.out);
	newIo.video.in = parseInt(newIo.video.in);
	newIo.video.out = parseInt(newIo.video.out);

	if (newIo.video.in < 0 || newIo.video.out < 0 || newIo.audio.in < 0 || newIo.audio.out < 0) { return; }
	
	let currentIo = {
		video: {
			in: instance.selectEndpoints({ target: blockId, scope: "video"} ),
			out: instance.selectEndpoints({ source: blockId, scope: "video"} ),
		},
		audio: {
			in: instance.selectEndpoints({ target: blockId, scope: "audio"} ),
			out: instance.selectEndpoints({ source: blockId, scope: "audio"} ),
		}
	};

	instance.batch(function () {
		while (currentIo.video.in.length > newIo.video.in) {
			instance.deleteEndpoint(currentIo.video.in.get(currentIo.video.in.length - 1));
			currentIo.video.in = instance.selectEndpoints({ target: blockId, scope: "video" } );
		}
		while (currentIo.video.out.length > newIo.video.out) {
			instance.deleteEndpoint(currentIo.video.out.get(currentIo.video.out.length - 1));
			currentIo.video.out = instance.selectEndpoints({ source: blockId, scope: "video"  } );
		}
		while (currentIo.audio.in.length > newIo.audio.in) {
			instance.deleteEndpoint(currentIo.audio.in.get(currentIo.audio.in.length - 1));
			currentIo.audio.in = instance.selectEndpoints({ target: blockId, scope: "audio" } );
		}
		while (currentIo.audio.out.length > newIo.audio.out) {
			instance.deleteEndpoint(currentIo.audio.out.get(currentIo.audio.out.length - 1));
			currentIo.audio.out = instance.selectEndpoints({ source: blockId, scope: "audio"  } );
		}
		
		for (let i = 0; i < newIo.video.in; i++) {
			let params = {
				target_type: (blockType === "crossbar" ? crossbarType + "_" : "") +  blockType,
				target_idx: parseInt(blockId.split("_").slice(-1)),
				target_endpoint_idx: i,
				signal_type: "video"
			};
			let anchor = [0,_mapRange(i,[0, (Math.max(newIo.video.in, newIo.audio.in) * (overlap ? 1 : 2))-1], [0,1]), -1, 0, 0, (overlap ? -8 : 0)];
			if (newIo.video.in + newIo.audio.in === 1 || (newIo.video.in + newIo.audio.in === 2 && overlap)) { anchor[1] = 0.5; }
			if (i >= currentIo.video.in.length) { _addEndpoints(blockId, [], [anchor], params); }
			else { currentIo.video.in.get(i).setAnchor(anchor); }
		}
		for (let i = 0; i < newIo.video.out; i++) {
			let params = {
				source_type: (blockType === "crossbar" ? crossbarType + "_" : "") + blockType,
				source_idx: parseInt(blockId.split("_").slice(-1)),
				source_endpoint_idx: i,
				signal_type: "video"
			};
			let anchor = [1,_mapRange(i, [0, (Math.max(newIo.video.out, newIo.audio.out) * (overlap ? 1 : 2))-1], [0,1]), 1, 0, 0, (overlap ? -8 : 0)];
			if (newIo.video.out + newIo.audio.out === 1 || (newIo.video.out + newIo.audio.out === 2 && overlap)) { anchor[1] = 0.5; }
			if (i >= currentIo.video.out.length) { _addEndpoints(blockId, [anchor], [], params); }
			else { currentIo.video.out.get(i).setAnchor(anchor); }
		}
		
		for (let i = 0; i < newIo.audio.in; i++) {
			let params = {
				target_type: (blockType === "crossbar" ? crossbarType + "_" : "") + blockType,
				target_idx: parseInt(blockId.split("_").slice(-1)),
				target_endpoint_idx: i,
				signal_type: "audio"
			};
			let anchor = [0,_mapRange((overlap ? i : (i + Math.max(newIo.video.in, newIo.audio.in))), [0, (Math.max(newIo.video.in, newIo.audio.in) * (overlap ? 1 : 2))-1], [0,1]), -1, 0, 0, (overlap ? 8 : 0)];
			if (newIo.video.in + newIo.audio.in === 1 || (newIo.video.in + newIo.audio.in === 2 && overlap)) { anchor[1] = 0.5; }
			if (i >= currentIo.audio.in.length) { _addEndpoints(blockId, [], [anchor], params); }
			else { currentIo.audio.in.get(i).setAnchor(anchor); }
		}
		for (let i = 0; i < newIo.audio.out; i++) {
			let params = {
				source_type: (blockType === "crossbar" ? crossbarType + "_" : "") + blockType,
				source_idx: parseInt(blockId.split("_").slice(-1)),
				source_endpoint_idx: i,
				signal_type: "audio"
			};
			let anchor = [1,_mapRange((overlap ? i : (i + Math.max(newIo.video.out, newIo.audio.out))), [0, (Math.max(newIo.video.out, newIo.audio.out) * (overlap ? 1 : 2))-1], [0,1]), 1, 0, 0, (overlap ? 8 : 0)];
			if (newIo.video.out + newIo.audio.out === 1 || (newIo.video.out + newIo.audio.out === 2 && overlap)) { anchor[1] = 0.5; }
			if (i >= currentIo.audio.out.length) { _addEndpoints(blockId, [anchor], [], params); }
			else { currentIo.audio.out.get(i).setAnchor(anchor); }
		}
	});
	currentIo = {
		video: {
			in: instance.selectEndpoints({ target: blockId, scope: "video"} ),
			out: instance.selectEndpoints({ source: blockId, scope: "video"} ),
		},
		audio: {
			in: instance.selectEndpoints({ target: blockId, scope: "audio"} ),
			out: instance.selectEndpoints({ source: blockId, scope: "audio"} ),
		}
	};

	b.style.minHeight = ((Math.max(currentIo.video.out.length, currentIo.audio.out.length, currentIo.video.in.length, currentIo.audio.in.length)*36) + "px");
	instance.revalidate(document.getElementById(blockId));
};

let _mapRange = function(number, in_range, out_range) {
	return (number - in_range[0]) * ((out_range[1] - out_range[0]) / (in_range[1] - out_range[0])) + out_range[0];
};

let _expandBlock = function (blockId) {
	let p = document.getElementById(blockId).querySelector(".parameter-section");
	if (p.hidden) {
		document.getElementById(blockId).classList.add("expanded"); 
		let n = document.getElementById(blockId).querySelector(".block-name");
		let inputField = document.createElement("input");
		inputField.type = "text";
		inputField.value = n.textContent;
		n.textContent = "";
		n.appendChild(inputField);
	}
	else { 
		document.getElementById(blockId).classList.remove("expanded"); 
		let n = document.getElementById(blockId).querySelector(".block-name").getElementsByTagName("input")[0];
		document.getElementById(blockId).querySelector(".block-name").appendChild(document.createTextNode(n.value));
		n.remove();
	}
	p.hidden = !p.hidden;
	instance.revalidate(document.getElementById(blockId));
};

let _deleteBlock = function(blockId) {
	let b = document.getElementById(blockId);
	let blockType = b.id.split("_").slice(0,-1).join("_");
	blockProto[blockType].index--;
	instance.removeAllEndpoints(b.id);
	instance.remove(b.id);
	instance.revalidate(b.id);
	b.remove();
};

let _generateJSON = function() {
	let elements = canvas.getElementsByClassName("jtk-node");
	let obj = {
		system_config: {
			reset: true, 
		},
	};
	for (let el of elements) {
		if (!el.querySelector(".parameter-section").hidden) {
			_expandBlock(el.id);
		}
		if (el.classList.contains("system")) {
			obj.ip = el.querySelector(".parameter.access-ip").getElementsByTagName("input")[0].value;
			obj.system_config = obj.system_config || {};
			obj.network_config = obj.network_config || {};
			obj.system_config.fpga = el.querySelector(".parameter.fpga").getElementsByTagName("select")[0].value;
			obj.network_config.mode = (obj.system_config.fpga.endsWith("40GbE") ? "40gbe" : "10gbe");
			obj.network_config.front_mgmt = el.querySelector(".parameter.front-mgmt").getElementsByTagName("input")[0].value;
			obj.network_config.rear_mgmt = el.querySelector(".parameter.rear-mgmt").getElementsByTagName("input")[0].value;
			obj.network_config.addresses = [];
			for (let ip of el.querySelector(".parameter.left-qsfp").getElementsByTagName("input")[0].value.split(",")) {
				ip = ip.replace(/\s/g, "");
				obj.network_config.addresses.push(ip);
				if (obj.network_config.mode === "40gbe") { break; }
			}
			for (let ip of el.querySelector(".parameter.right-qsfp").getElementsByTagName("input")[0].value.split(",")) {
				ip = ip.replace(/\s/g, "");
				obj.network_config.addresses.push(ip);
				if (obj.network_config.mode === "40gbe") { break; }
			}
		}
		else if (el.classList.contains("ptp")) {
			obj.ptp_config = obj.ptp_config || {};
			obj.ptp_config.domain = parseInt(el.querySelector(".parameter.ptp-domain").getElementsByTagName("input")[0].value);
			obj.ptp_config.port = el.querySelector(".parameter.primary-port").getElementsByTagName("select")[0].value;
			obj.ptp_config.sec_port = el.querySelector(".parameter.secondary-port").getElementsByTagName("select")[0].value;
			if (obj.ptp_config.sec_port === "null") { delete obj.ptp_config.sec_port; }
			obj.ptp_config.delay_req = el.querySelector(".parameter.delay-request").getElementsByTagName("select")[0].value;
			obj.ptp_config.utc = el.querySelector(".parameter.utc-offset").getElementsByTagName("select")[0].value;
		}
		else if (el.classList.contains("crossbar")) {
			obj.crossbar_config = obj.crossbar_config || { crossbars: [] };
			let cb = {
				name: el.querySelector(".block-name").textContent,
				xbar_type: el.querySelector(".parameter.crossbar-type").getElementsByTagName("select")[0].value,
				num_in: parseInt(el.querySelector(".parameter.inputs").getElementsByTagName("input")[0].value),
				num_out: parseInt(el.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value),
			};
			obj.crossbar_config.crossbars.push(cb);
		}
		else if (el.classList.contains("rtp-receiver")) {
			obj.rtp_receiver_config = obj.rtp_receiver_config || { receivers: [] };
			let rec = {
				name: el.querySelector(".block-name").textContent,
				pri_port: el.querySelector(".parameter.primary-port").getElementsByTagName("select")[0].value,
				sec_port: el.querySelector(".parameter.secondary-port").getElementsByTagName("select")[0].value,
				num_video: parseInt(el.querySelector(".parameter.video-receivers").getElementsByTagName("input")[0].value),
				num_audio: parseInt(el.querySelector(".parameter.audio-receivers").getElementsByTagName("input")[0].value),
				vc2: el.querySelector(".parameter.st2042").getElementsByTagName("input")[0].checked,
				uhd_singlelink: el.querySelector(".parameter.st2110-singlelink").getElementsByTagName("input")[0].checked,
				uhd_2si: el.querySelector(".parameter.uhd-sample-interleaved").getElementsByTagName("input")[0].checked,
				switch_type: "BBM",
				switch_time: 1,
				audio_ch: 16
			};
			if (rec.sec_port === "null") { delete rec.sec_port; }
			obj.rtp_receiver_config.receivers.push(rec);
		}
		else if (el.classList.contains("video-transmitter")) {
			obj.video_transmitter_config = obj.video_transmitter_config || { transmitters: [] };
			let tx = {
				name: el.querySelector(".block-name").textContent,
				pri_port: el.querySelector(".parameter.primary-port").getElementsByTagName("select")[0].value,
				sec_port: el.querySelector(".parameter.secondary-port").getElementsByTagName("select")[0].value,
				pri_mc: el.querySelector(".parameter.primary-mc").getElementsByTagName("input")[0].value,
				sec_mc: el.querySelector(".parameter.secondary-mc").getElementsByTagName("input")[0].value,
				reserve_uhd: el.querySelector(".parameter.reserve-uhd").getElementsByTagName("input")[0].checked,
				format: el.querySelector(".parameter.format").getElementsByTagName("select")[0].value,
				constr_format: el.querySelector(".parameter.constraint-format").getElementsByTagName("select")[0].value,
				constr_bandwidth: el.querySelector(".parameter.constraint-bandwidth").getElementsByTagName("select")[0].value,
				payload: parseInt(el.querySelector(".parameter.payload").getElementsByTagName("input")[0].value),
				audio: el.querySelector(".parameter.audio").getElementsByTagName("select")[0].value,
			};
			if (tx.sec_port === "null") { delete tx.sec_port; }
			if (tx.constr_format === "null") { delete tx.constr_format; }
			obj.video_transmitter_config.transmitters.push(tx);
		}
		else if (el.classList.contains("audio-transmitter")) {
			obj.audio_transmitter_config = obj.audio_transmitter_config || { transmitters: [] };
			let tx = {
				name: el.querySelector(".block-name").textContent,
				pri_port: el.querySelector(".parameter.primary-port").getElementsByTagName("select")[0].value,
				sec_port: el.querySelector(".parameter.secondary-port").getElementsByTagName("select")[0].value,
				pri_mc: el.querySelector(".parameter.primary-mc").getElementsByTagName("input")[0].value,
				sec_mc: el.querySelector(".parameter.secondary-mc").getElementsByTagName("input")[0].value,
				format: el.querySelector(".parameter.format").getElementsByTagName("select")[0].value,
				packet_time: el.querySelector(".parameter.packet-time").getElementsByTagName("select")[0].value,
				payload: parseInt(el.querySelector(".parameter.payload").getElementsByTagName("input")[0].value),
				num_channels: parseInt(el.querySelector(".parameter.audio-channels").getElementsByTagName("input")[0].value),
			};
			if (tx.sec_port === "null") { delete tx.sec_port; }
			obj.audio_transmitter_config.transmitters.push(tx);
		}
		else if (el.classList.contains("video-delay")) {
			obj.video_delay_config = obj.video_delay_config || { delays: [] };
			let dly = {
				name: el.querySelector(".block-name").textContent,
				mode: el.querySelector(".parameter.mode").getElementsByTagName("select")[0].value,
				standard: el.querySelector(".parameter.standard").getElementsByTagName("select")[0].value,
			};
			obj.video_delay_config.delays.push(dly);
		}
		else if (el.classList.contains("audio-delay")) {
			obj.audio_delay_config = obj.audio_delay_config || { delays: [] };
			let dly = {
				name: el.querySelector(".block-name").textContent,
				frequency: el.querySelector(".parameter.frequency").getElementsByTagName("select")[0].value,
				num_channels: parseInt(el.querySelector(".parameter.audio-channels").getElementsByTagName("input")[0].value),
				alloc_time: parseInt(parseFloat(el.querySelector(".parameter.allocated-time").getElementsByTagName("input")[0].value)*1000000),
				delay_time: parseInt(parseFloat(el.querySelector(".parameter.delay-time").getElementsByTagName("input")[0].value)*1000000),
			};
			obj.audio_delay_config.delays.push(dly);
		}
		else if (el.classList.contains("io-module")) {
			obj.sdi_config = obj.sdi_config || { sdi: [] };
			let num_outs;
			switch (el.querySelector(".parameter.io-module-type").getElementsByTagName("select")[0].value) {
			case "2/2/16":
				num_outs = el.querySelector(".parameter.outputs").getElementsByTagName("input")[0].value;
				break;
			default:
				num_outs = el.querySelector(".parameter.io-module-type").getElementsByTagName("select")[0].value.split("/")[1];
				break;
			}
			for (let i = 0; i < num_outs; i++) {
				obj.sdi_config.sdi.push( { index: i, standard: null, audio: el.querySelector(".parameter.embed").getElementsByTagName("select")[0].value} );
			}
		}
	}

	obj.web_routing_config = obj.web_routing_config || {};
	obj.web_routing_config.routes = _calculateRoutes();

	console.log(obj);

	var xhr = new XMLHttpRequest();
	var url = "/configure";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	var data = JSON.stringify(obj);
	xhr.send(data);
};

let _calculateRoutes = function() {
	let connectors = instance.select();
	let routes = [];
	for (let i = 0; i < connectors.length; i++) {
		let conn = connectors.get(i).getParameters();
		routes.push(conn);
	}
	return routes;
};
 
jsPlumb.ready(function () {
	// suspend drawing and initialise.
	instance.batch(function () {

		let buttonArea = document.getElementById("add-blocks");
		for (let p in blockProto) {
			if (blockProto[p].required) {
				_createBlock(p);
			}
			else {
				let button = document.createElement("button");
				button.textContent = "Create " + blockProto[p].description + " element.";
				button.setAttribute("onclick", "_createBlock('" + blockProto[p].identifier + "')");
				buttonArea.appendChild(button);
			}
		}


		instance.bind("connectionDrag", function (connection) {
			//console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
		});

		instance.bind("connectionDragStop", function (connection) {
			//console.log("connection " + connection.id + " was dragged");
		});

		instance.bind("connectionMoved", function (params) {
			//console.log("connection " + params.connection.id + " was moved");
		});
	});

});

window.onbeforeunload = function() {
	return "Data will be lost if you leave the page, are you sure?";
};

let blockProto = {
	system: {
		class: "system",
		identifier: "system",
		description: "System",
		index: 0,
		max_instances: 1,
		deletable: false,
		required: true,
		parameters: [
			{id: "access-ip", name: "Configuration IP", type: "text", value: "10.3.143.33"},
			{id: "fpga", name: "FPGA", type: "select", value: ["STREAMING_40GbE", "STREAMING","MULTIVIEWER_40GbE", "MULTIVIEWER"], text: ["Streaming (40GbE)", "Streaming (4x10GbE)","Multiviewer (40GbE)", "Multiviewer (4x10GbE)"]},
			{id: "front-mgmt", name: "Front management IP", type: "text", value:"10.3.143.33/20"},
			{id: "rear-mgmt", name: "Rear management IP", type: "text", value: "10.3.143.34/20"},
			{id: "left-qsfp", name: "Left QSFP IPs", type: "text", value: "192.168.50.43/16,10.0.0.2/24,10.0.0.3/24,10.0.0.4/24"},
			{id: "right-qsfp", name: "Right QSFP IPs", type: "text", value: "192.168.250.43/16,10.0.1.2/24,10.0.1.3/24,10.0.1.4/24"},
		]
	},
	ptp: {
		class: "ptp",
		identifier: "ptp",
		description: "PTP Setup",
		index: 0,
		max_instances: 1,
		deletable: false,
		required: true,
		parameters: [
			{id: "ptp-domain", name: "PTP Domain", type: "number", value: "127"},
			{id: "primary-port", name: "Primary Agent port", type: "select", value: [0, 1], text: ["Left QSFP", "Right QSFP"]},
			{id: "secondary-port", name: "Secondary Agent port", type: "select", value: [null, 0, 1], text: ["None", "Left QSFP", "Right QSFP"]},
			{id: "delay-request", name: "Delay Request mode", type: "select", value: ["Unicast", "Multicast"]},
			{id: "utc-offset", name: "Use UTC offset", type: "select", value: ["Ignore", "Use"]},
		]
	},
	rtp_receiver: {
		class: "rtp-receiver",
		identifier: "rtp_receiver",
		description: "RTP Receiver",
		index: 0,
		max_instances: 108,
		deletable: true,
		required: false,
		parameters: [
			{id: "video-receivers", name: "Video receivers", type: "number", value: 0, oninput: true},
			{id: "audio-receivers", name: "Audio receivers", type: "number", value: 0, oninput: true},
			{id: "primary-port", name: "Primary streaming port", type: "select", value: [0, 1], text: ["Left QSFP", "Right QSFP"]},
			{id: "secondary-port", name: "Secondary streaming port", type: "select", value: [null, 0, 1], text: ["None", "Left QSFP", "Right QSFP"]},
			{id: "st2042", name: "Supports VC-2", type: "checkbox", value: false},
			{id: "st2110-singlelink", name: "Supports ST2110 singlelink", type: "checkbox", value: false},
			{id: "uhd-sample-interleaved", name: "Supports 12G 2SI", type: "checkbox", value: false},
		]
	},
	crossbar: {
		class: "crossbar",
		identifier: "crossbar",
		description: "Crossbar",
		index: 0,
		max_instances: 20,
		deletable: true,
		required: false,
		parameters: [
			{id: "inputs", name: "Inputs", type: "number", value: 0, oninput: true},
			{id: "outputs", name: "Outputs", type: "number", value: 0, oninput: true},
			{id: "crossbar-type", name: "Crossbar type", type: "select", value: ["a_v", "video", "large"], text: ["AV", "Video", "Audio"], oninput: true},
			{id: "channels", name: "Audio channels", type: "number", value: 16},
		]
	},
	io_module: {
		class: "io-module",
		identifier: "io_module",
		description: "IO Module",
		index: 0,
		max_instances: 1,
		deletable: true,
		required: false,
		parameters: [
			{id: "inputs", name: "SDI Inputs", type: "number", value: 0, disabled: true, oninput: true},
			{id: "outputs", name: "SDI Outputs", type: "number", value: 0, disabled: true, oninput: true},
			{id: "io-module-type", name: "IO Module type", type: "select", value: ["10/10", "18/2", "2/18", "2/2/16"], text: ["10in/10out", "2in/18out", "18in/2out", "2/2/16 configurable"], oninput: true},
			{id: "embed", name: "Audio embedding", type: "select", value: ["Embed", "Bypass", "Off"]},
		]
	},
	video_transmitter: {
		class: "video-transmitter",
		identifier: "video_transmitter",
		description: "Video Transmitter",
		index: 0,
		max_instances: 20,
		deletable: true,
		required: false,
		fixed_endpoints: {
			video: { in: 1, out: 0},
			audio: { in: 0, out: 0},
		},
		parameters: [
			{id: "primary-port", name: "Primary streaming port", type: "select", value: [0, 1], text: ["Left QSFP", "Right QSFP"]},
			{id: "primary-mc", name: "Primary Multicast", type: "text", value: "235.0.0.1:9000"},
			{id: "secondary-port", name: "Secondary streaming port", type: "select", value: [null, 0, 1], text: ["None", "Left QSFP", "Right QSFP"]},
			{id: "secondary-mc", name: "Secondary Multicast", type: "text", value: "235.0.1.1:9000"},
			{id: "format", name: "Streaming format", type: "select", value: ["ST2110_GPM", "ST2022_6", "ST2110_BPM", "ST2042_raw"], oninput: true},
			{id: "constraint-format", name: "Constraint (format)", type: "select", 
				value: [null, "PAL", "NTSC", "HD720p25", "HD720p29_97", "HD720p30", "HD720p50", "HD720p59_94", "HD720p60", "HD1080p23_98", "HD1080p24", "HD1080p25", "HD1080p29_97", "HD1080p30", "HD1080i50", "HD1080i59_94", "HD1080i60", "HD1080p50", "HD1080p59_94", "HD1080p60", "HD2160p50", "HD2160p59_94", "HD2160p60", "HD1080p24_DCI", "HD1080i50_DCI"],
				text: ["N/A", "PAL", "NTSC", "HD720p25", "HD720p29_97", "HD720p30", "HD720p50", "HD720p59_94", "HD720p60", "HD1080p23_98", "HD1080p24", "HD1080p25", "HD1080p29_97", "HD1080p30", "HD1080i50", "HD1080i59_94", "HD1080i60", "HD1080p50", "HD1080p59_94", "HD1080p60", "HD2160p50", "HD2160p59_94", "HD2160p60", "HD1080p24_DCI", "HD1080i50_DCI"],
			},
			{id: "constraint-bandwidth", name: "Constraint (bandwidth)", type: "select", value: [null, "b1_5Gb", "b3_0Gb", "b12_0Gb"], text: ["N/A", "1.5Gbit/s", "3Gbit/s", "12Gbit/s"]},
			{id: "audio", name: "Audio embedding (2022-6)", type: "select", value: ["Embed", "Bypass", "Off"]},
			{id: "payload", name: "Payload ID", type: "number", value: 97},
			{id: "reserve-uhd", name: "Supports ST2110 singlelink", type: "checkbox", value: false},
		]
	},
	audio_transmitter: {
		class: "audio-transmitter",
		identifier: "audio_transmitter",
		description: "Audio Transmitter",
		index: 0,
		max_instances: 100,
		deletable: true,
		required: false,
		fixed_endpoints: {
			video: { in: 0, out: 0},
			audio: { in: 1, out: 0},
		},
		parameters: [
			{id: "primary-port", name: "Primary streaming port", type: "select", value: [0, 1], text: ["Left QSFP", "Right QSFP"]},
			{id: "primary-mc", name: "Primary Multicast", type: "text", value: "236.0.0.1:9000"},
			{id: "secondary-port", name: "Secondary streaming port", type: "select", value: [null, 0, 1], text: ["None", "Left QSFP", "Right QSFP"]},
			{id: "secondary-mc", name: "Secondary Multicast", type: "text", value: "236.0.1.1:9000"},
			{id: "format", name: "Streaming format", type: "select", value: ["L24", "L16", "AM824"]},
			{id: "packet-time", name: "Packet time", type: "select", 
				value: ["p0_125", "p0_250", "p0_333", "p0_500", "p0_666", "p1"], 
				text: ["0.125ms", "0.250ms", "0.333ms", "0.500ms", "0.666ms", "1.000ms"]
			},
			{id: "audio-channels", name: "Audio channels", type: "number", value: 16},
			{id: "payload", name: "Payload ID", type: "number", value: 96},
		]
	},
	video_delay: {
		class: "video-delay",
		identifier: "video_delay",
		description: "Video Delay",
		index: 0,
		max_instances: 24,
		deletable: true,
		required: false,
		fixed_endpoints: {
			video: { in: 1, out: 1},
			audio: { in: 0, out: 0},
		},
		parameters: [
			{id: "standard", name: "Video standard", type: "select", 
				value: ["PAL", "NTSC", "HD720p25", "HD720p29_97", "HD720p30", "HD720p50", "HD720p59_94", "HD720p60", "HD1080p23_98", "HD1080p24", "HD1080p25", "HD1080p29_97", "HD1080p30", "HD1080i50", "HD1080i59_94", "HD1080i60", "HD1080p50", "HD1080p59_94", "HD1080p60", "HD2160p50", "HD2160p59_94", "HD2160p60", "HD1080p24_DCI", "HD1080i50_DCI"],
				text: ["PAL", "NTSC", "HD720p25", "HD720p29_97", "HD720p30", "HD720p50", "HD720p59_94", "HD720p60", "HD1080p23_98", "HD1080p24", "HD1080p25", "HD1080p29_97", "HD1080p30", "HD1080i50", "HD1080i59_94", "HD1080i60", "HD1080p50", "HD1080p59_94", "HD1080p60", "HD2160p50", "HD2160p59_94", "HD2160p60", "HD1080p24_DCI", "HD1080i50_DCI"],
			},
			{id: "mode", name: "Mode", type: "select", value: ["FrameSync_Freeze", "FrameSync_Black", "FramePhaser"], text: ["Frame Sync (Freeze)", "FrameSync (Black)", "Frame Phaser"] },
		]
	},
	audio_delay: {
		class: "audio-delay",
		identifier: "audio_delay",
		description: "Audio Delay",
		index: 0,
		max_instances: 24,
		deletable: true,
		required: false,
		fixed_endpoints: {
			video: { in: 0, out: 0},
			audio: { in: 1, out: 1},
		},
		parameters: [
			{id: "audio-channels", name: "Audio channels", type: "number", value: 16},
			{id: "frequency", name: "Frequency", type: "select", value: ["F48000", "F96000"], text: ["48KHz", "96Khz"] },
			{id: "allocated-time", name: "Allocated delay time (ms)", type: "number", value: 100},
			{id: "delay-time", name: "Delay time (ms)", type: "number", value: 0},
		]
	},
};
