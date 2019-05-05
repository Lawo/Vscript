const vscript = require("../vscript/common/api/api_base");
const axios = require("axios");

class CardReader {
	constructor(debug=false) {
		this.debug = debug;
		this.settings = null;
	}


	async readCard(ip, callback) {		
		callback("Starting readout, please wait!");
		let card = {};
		// Code to grab settings.json from blade goes here!
		await axios.get("http://" + ip + "/settings.json?everything").then(result => {
			// Then we parse!
			this.settings = result.data;
			//console.log(this.settings);

			card.web_routing_config = { routes: [] };
			card.ip = ip;
			callback("Parsing system objects.");
			card.system_config = this.parseSystem();
			callback("Parsing network objects.");
			card.network_config = this.parseNetwork();
			callback("Parsing PTP objects.");
			card.ptp_config = this.parsePtp();
			callback("Parsing crossbar objects.");
			card.crossbar_config = this.parseCrossbars(card.web_routing_config.routes);
			callback("Parsing SDI objects.");
			card.sdi_config = this.parseIoModule(card.web_routing_config.routes);
			callback("Parsing RTP receiver objects.");
			card.rtp_receiver_config = this.parseRtpReceivers(card.web_routing_config.routes);
			callback("Finished readout! Drawing...");
			console.log(JSON.stringify(card, null, 3));
		});
		return card;	
	}

	getSetting(settingKwl, setting) {
		if (this.debug) console.log("Finding setting: " + settingKwl + "." + setting);
		let object = this.findObject(settingKwl);
		//console.log(JSON.stringify(object.kw, null, 3));
		// Loads of special cases due to inconsistent settings.json
		switch (setting) {
		case "row_name_status":
			return object.id;
		default:
			return object.kw[setting].data;
		}
	}

	allocatedIndices(listKwl) {
		if (this.debug) console.log("Calculating allocatedIndices on: " + listKwl);
		let path = listKwl.split(".");
		let list = path.pop();
		let indices = [];
		let object = this.findObject(path.join("."));
		object = object.kwl;
		if (object.hasOwnProperty(list)) {
			for (const row of object[list]["named-rows"]) {
				indices.push(row.idx);
			}
		} 
		else {
			for (const key in object) {
				if (key.startsWith(list + "[")) {
					indices.push(key.match(/\[(.*?)\]/)[1]);
				}
			}
		}
		return indices;
	}

	findObject(kwl) {
		let path = kwl.split(".");
		let object = this.settings.components[path[0]];
		for (let i = 1; i < path.length; i++) {
			let match = path[i].match(/\[(.*?)\]/);
			if (match !== null) { // The kw contains [i], so it is a list item
				if (object.kwl.hasOwnProperty(path[i])) { // Is this one of the unnamed lists?
					object = object.kwl[path[i]];
				} else { // It`s got named rows!
					let list = path[i].split("[")[0];
					let named = object.kwl[list]["named-rows"];
					let prop;
					if (Number.isInteger(Number.parseInt(match[1]))) { // Requested by row index
						prop = "idx";
					} else { // Requested by row id
						prop = "id";
					}
					for (const row of named) {
						if (row[prop] == match[1]) {
							object = row;
							break;
						}
					}
				}
			} else {
				object = object.kwl[path[i]];
			}
		}
		return object;
	}

	parseSystem() {
		let systemConfig = {};
		systemConfig.reset = false;
		systemConfig.fpga = this.settings.header.fpga;
		if (this.debug) console.log(systemConfig);
		return systemConfig;
	}

	parseNetwork() {
		let networkConfig = {};
		networkConfig.mode = (this.settings.header.fpga.endsWith("40GbE") ? "40gbe" : "10gbe");
		let i = 0;
		networkConfig.addresses = networkConfig.addresses || [];
		for (; i < (networkConfig.mode == "40gbe" ? 2 : 8); i++) {
			networkConfig.addresses.push(this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address"));
		}
		networkConfig.front_mgmt = this.getSetting("network_interfaces.ports[" + (i++) + "].current_configuration.base.ip_addresses[0]", "ip_address");
		networkConfig.rear_mgmt = this.getSetting("network_interfaces.ports[" + (i++) + "].current_configuration.base.ip_addresses[0]", "ip_address");
		if (this.debug) console.log(networkConfig);
		return networkConfig;
	}

	parsePtp() {
		let ptpConfig = {};
		let agents = this.allocatedIndices("p_t_p.agents");
		if (agents.length == 0) { return ptpConfig; }
		ptpConfig.domain = this.getSetting("p_t_p.agents[" + agents[0] + "]", "domain_status");
		ptpConfig.delay_req = this.getSetting("p_t_p.agents[" + agents[0] + "]", "delay_req_routing_status");
		ptpConfig.utc = this.getSetting("p_t_p.agents[" + agents[0] + "]", "utc_offsets");
		ptpConfig.port = ((this.getSetting("p_t_p.agents[" + agents[0] + "]", "hosting_port_status")).endsWith("[0]") ? 0 : 1);
		if (agents.length > 1) { ptpConfig.sec_port = ((this.getSetting("p_t_p.agents[" + agents[1] + "]", "hosting_port_status")).endsWith("[0]") ? 0 : 1); }
		if (this.debug) console.log(ptpConfig);
		return ptpConfig;
	}

	
	parseCrossbars(routes) {
		let videoCrossbarsIndices = this.allocatedIndices("video_crossbar.pool");
		let avCrossbarsIndices = this.allocatedIndices("a_v_crossbar.pool");
		let audioCrossbarsIndices = this.allocatedIndices("audio_crossbar.large");
		let crossbarConfig = { 
			a_v_crossbars: [],
			video_crossbars: [],
			audio_crossbars: []
		};
		
		for (let i of videoCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "video";
			crossbar.num_in = this.getSetting("video_crossbar.pool[" + i + "]", "num_inputs");
			crossbar.num_out = this.getSetting("video_crossbar.pool[" + i + "]", "num_inputs");
			crossbar.name = this.getSetting("video_crossbar.pool[" + i + "]", "row_name_status");
			crossbarConfig.video_crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = this.getSetting("video_crossbar.pool[" + i + "].inputs[" + inp + "]", "source_status");
				if (source !== null) { routes.push(this.getRouteObject("video", source, "video_crossbar", i, inp)); }
			}
		}
		
		for (let i of audioCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "large";
			crossbar.num_in = this.getSetting("audio_crossbar.large[" + i + "]", "num_inputs");
			crossbar.num_out = this.getSetting("audio_crossbar.large[" + i + "]", "num_inputs");
			crossbar.channels = this.getSetting("audio_crossbar.large[" + i + "].outputs[0]", "num_channels");
			crossbar.name = this.getSetting("audio_crossbar.large[" + i + "]", "row_name_status");
			crossbarConfig.audio_crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = this.getSetting("audio_crossbar.large[" + i + "].inputs[" + inp + "]", "source_status");
				if (source !== null) { routes.push(this.getRouteObject("audio", source, "large_crossbar", i, inp)); }
			}
		}

		for (let i of avCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "a_v";
			crossbar.num_in = this.getSetting("a_v_crossbar.pool[" + i + "]", "num_inputs");
			crossbar.num_out = this.getSetting("a_v_crossbar.pool[" + i + "]", "num_inputs");
			crossbar.channels = this.getSetting("a_v_crossbar.pool[" + i + "].outputs[0]", "num_channels");
			crossbar.name = this.getSetting("a_v_crossbar.pool[" + i + "]", "row_name_status");
			crossbarConfig.a_v_crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = this.getSetting("a_v_crossbar.pool[" + i + "].inputs[" + inp + "].source", "video_status");
				if (source !== null) { routes.push(this.getRouteObject("video", source, "a_v_crossbar", i, inp)); }
			}
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = this.getSetting("a_v_crossbar.pool[" + i + "].inputs[" + inp + "].source", "audio_status");
				if (source !== null) { routes.push(this.getRouteObject("audio", source, "a_v_crossbar", i, inp)); }
			}
		}

		if (this.debug) console.log(crossbarConfig);
		return crossbarConfig;
	}


	parseIoModule(routes) {
		let sdiConfig = { sdi: [] };
		let sdiOuts = this.allocatedIndices("i_o_module.output");
		let sdiIns = this.allocatedIndices("i_o_module.input");
		if (sdiOuts.length == 0 || sdiIns.length == 0) { return; }
		if ((this.allocatedIndices("i_o_module.configuration").length !== 0)) {
			sdiConfig.io_module_type = "2/2/16";
		}
		else {
			sdiConfig.io_module_type = sdiIns + "/" + sdiOuts;
		}
		sdiConfig.num_out = sdiOuts.length;
		sdiConfig.num_in = sdiIns.length;
		for (let i of sdiOuts) {
			sdiConfig.sdi.push({ index: i, standard: null, audio: (this.getSetting("i_o_module.output[" + i + "].sdi.audio_control.group_enable[0]", "group_status"))});
		}
		for (let inp = 0; inp < sdiConfig.num_out; inp++) {
			let source = this.getSetting("i_o_module.output[" + inp + "].sdi.vid_src", "v_src_status");
			if (source !== null) { routes.push(this.getRouteObject("video", source, "sdi", inp, 0)); }
		}
		
		if (this.debug) console.log(sdiConfig);
		return sdiConfig;
	}

	parseRtpReceivers(routes) {
		let rtpReceiverConfig = { receivers: [] };
		let sessionIdxs = this.allocatedIndices("r_t_p_receiver.sessions");
		if (sessionIdxs.length == 0) { return rtpReceiverConfig; }
		for (let session of sessionIdxs) {
			let s = {};
			let videoReceivers = this.allocatedIndices("r_t_p_receiver.sessions[" + session +"].video_receivers");
			let audioReceivers = this.allocatedIndices("r_t_p_receiver.sessions[" + session +"].audio_receivers");
			s.num_video = videoReceivers.length;
			s.num_audio = audioReceivers.length;
			s.switch_time = this.getSetting("r_t_p_receiver.sessions[" + session + "]", "switch_time_status");
			s.switch_type = (this.getSetting("r_t_p_receiver.sessions[" + session + "]", "switch_type_status")).split("_")[1];
			let priInt = this.getSetting("r_t_p_receiver.sessions[" + session + "].interfaces", "primary_status");
			s.pri_port = this.getIndexes(priInt)[0];
			let secInt = this.getSetting("r_t_p_receiver.sessions[" + session + "].interfaces", "secondary_status");
			if (secInt !== null) { s.sec_port = this.getIndexes(secInt)[0]; }
			if (s.num_audio > 0) {
				let a = this.getSetting("r_t_p_receiver.sessions[" + session + "].audio_receivers[" + audioReceivers[0] + "]", "wrapped_reference");
				s.audio_ch = this.getSetting(a + ".audio_specific", "channel_capacity_status");
			}
			if (s.num_video > 0) {
				let v = this.getSetting("r_t_p_receiver.sessions[" + session + "].video_receivers[" + videoReceivers[0] + "]", "wrapped_reference");
				s.vc2 = this.getSetting(v + ".video_specific.capabilities", "supports_st_2042_status");
				s.uhd_singlelink = this.getSetting(v + ".video_specific.capabilities", "supports_uhd_2110_singlelink_status"); 
				s.uhd_2si = this.getSetting(v + ".video_specific.capabilities", "supports_uhd_sample_interleaved_status");
			}
			rtpReceiverConfig.receivers.push(s);
		}
		if (this.debug) console.log(rtpReceiverConfig);
		return rtpReceiverConfig;
	}


	getRouteObject(signalType, sourceKwl, targetType, targetIdx, targetEndpointIdx) {
		let sourceType = null, sourceIdx, sourceEndpointIdx;
		let idxs = this.getIndexes(sourceKwl);
		let kws = sourceKwl.split(".");
		switch (kws[0]) {
		case "r_t_p_receiver":
			sourceType = "rtp_receiver";
			sourceIdx = (idxs[0] ? idxs[0] : 0);
			sourceEndpointIdx = (idxs[1] ? idxs[1] : 0);
			break;
		case "i_o_module":
			sourceType = "sdi";
			sourceIdx = 0;
			sourceEndpointIdx = idxs[0];
			break;
		case "delay_handler":
			sourceType = kws[1] + "_delay";
			sourceIdx = (idxs[0] ? idxs[0] : 0);
			sourceEndpointIdx = (idxs[1] ? idxs[1] : 0);
			break;
		default:
			sourceType = kws[0];
			sourceIdx = (idxs[0] ? idxs[0] : 0);
			sourceEndpointIdx = (idxs[1] ? idxs[1] : 0);
			break;
		}

		/*
		rtp_receiver: 		{ kwl: "r_t_p_receiver.sessions[{0}].video_receivers[{1}]", kw: "wrapped_reference", addon: ".video_specific.output.video"},
				a_v_crossbar: 		{ kwl: "a_v_crossbar.pool[{0}].outputs[{1}].output.video"},
				video_crossbar: 	{ kwl: "video_crossbar.pool[{0}].outputs[{1}].output"},
				io_module: 			{ kwl: "i_o_module.input[{1}].sdi.output.video"},
				video_delay:		{ kwl: "delay_handler.video.pool[{0}].outputs[{1}].output"},
		*/
		let route = {
			source_type: sourceType,
			source_idx: sourceIdx,
			source_endpoint_idx: sourceEndpointIdx,
			signal_type: signalType,
			target_type: targetType,
			target_idx: targetIdx,
			target_endpoint_idx: targetEndpointIdx
		};
		if (this.debug) console.log(route);
		return route;
	}

	getIndexes(kwl) {
		if (kwl == null) { return [0,0]; }
		let idxs = [];
		let reducedKwl = kwl;
		while (reducedKwl !== vscript.path_parent(reducedKwl)) {
			let idx = vscript.index_of_kwl_name(reducedKwl);
			if (!isNaN(idx)) { idxs.unshift(idx); }
			reducedKwl = vscript.path_parent(reducedKwl);
		}
		return idxs;
	}

}

exports.CardReader = CardReader;