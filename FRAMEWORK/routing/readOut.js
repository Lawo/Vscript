const WebSocket = require("ws");
const vscript = require("../vscript/common/api/api_base");
const MultiConnection = require("../vscript/common/multi_connection");

class CardReader {
	constructor(debug=false) {
		MultiConnection.initialize("", "");
		this.debug = debug;
	}

	async readCard(ip) {
		let card = {};
		card.web_routing_config = { routes: [] };
		await vscript.connect_to(ip);
		card.ip = ip;
		card.system_config = await this.readSystem();
		card.network_config = await this.readNetwork();
		card.ptp_config = await this.readPtp();
		card.crossbar_config = await this.readCrossbars(card.web_routing_config.routes);
		card.sdi_config = await this.readIoModule(card.web_routing_config.routes);
		card.rtp_receiver_config = await this.readRtpReceivers(card.web_routing_config.routes);
		await vscript.disconnect_from(ip);
		return card;		
	}

	async readSystem() {
		let systemConfig = {};
		systemConfig.reset = false;
		systemConfig.fpga = await vscript.read("system", "selected_fpga");
		if (this.debug) console.log(systemConfig);
		return systemConfig;
	}

	async readNetwork() {
		let networkConfig = {};
		networkConfig.mode = ((await vscript.read("system", "selected_fpga")).endsWith("40GbE") ? "40gbe" : "10gbe");
		let networkPorts = await vscript.allocated_indices("network_interfaces.ports");
		for (let i of networkPorts) {
			if (i == networkPorts.length - 2) { networkConfig.front_mgmt = await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address"); }
			else if (i == networkPorts.length - 1) { networkConfig.rear_mgmt = await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address"); }
			else {
				networkConfig.addresses = networkConfig.addresses || [];
				networkConfig.addresses.push(await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address"));
			}
		}
		if (this.debug) console.log(networkConfig);
		return networkConfig;
	}

	async readPtp() {
		let ptpConfig = {};
		let agents = await vscript.allocated_indices("p_t_p.agents");
		if (agents.length == 0) { return ptpConfig; }
		ptpConfig.domain = await vscript.read("p_t_p.agents[" + agents[0] + "]", "domain_status");
		ptpConfig.delay_req = await vscript.read("p_t_p.agents[" + agents[0] + "]", "delay_req_routing_status");
		ptpConfig.utc = await vscript.read("p_t_p.agents[" + agents[0] + "]", "utc_offsets");
		ptpConfig.port = ((await vscript.read("p_t_p.agents[" + agents[0] + "]", "hosting_port_status")).endsWith("[0]") ? 0 : 1);
		if (agents.length > 1) { ptpConfig.sec_port = ((await vscript.read("p_t_p.agents[" + agents[1] + "]", "hosting_port_status")).endsWith("[0]") ? 0 : 1); }
		if (this.debug) console.log(ptpConfig);
		return ptpConfig;
	}

	async readCrossbars(routes) {
		let videoCrossbarsIndices = await vscript.allocated_indices("video_crossbar.pool");
		let avCrossbarsIndices = await vscript.allocated_indices("a_v_crossbar.pool");
		let audioCrossbarsIndices = await vscript.allocated_indices("audio_crossbar.large");
		let crossbarConfig = { crossbars: [] };
		
		for (let i of videoCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "video";
			let promises = [
				crossbar.num_in = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs"),
				crossbar.num_out = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs"),
				crossbar.channels = await vscript.read("video_crossbar.pool[" + i + "].outputs[0]", "num_channels"),
				crossbar.name = await vscript.read("video_crossbar.pool[" + i + "]", "row_name_status")
			];
			await Promise.all(promises);
			crossbarConfig.crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = await vscript.read("video_crossbar.pool[" + i + "].inputs[" + inp + "]", "source_status");
				if (source !== null) { routes.push(this.getRouteObject("video", source, "video_crossbar", i, inp)); }
			}
		}
		
		for (let i of audioCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "large";
			let promises = [
				crossbar.num_in = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs"),
				crossbar.num_out = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs"),
				crossbar.channels = await vscript.read("audio_crossbar.large[" + i + "].outputs[0]", "num_channels"),
				crossbar.name = await vscript.read("audio_crossbar.large[" + i + "]", "row_name_status")
			];
			await Promise.all(promises);
			crossbarConfig.crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = await vscript.read("audio_crossbar.large[" + i + "].inputs[" + inp + "]", "source_status");
				if (source !== null) { routes.push(this.getRouteObject("audio", source, "large_crossbar", i, inp)); }
			}
		}

		for (let i of avCrossbarsIndices) {
			let crossbar = {};
			crossbar.xbar_type = "a_v";
			let promises = [
				crossbar.num_in = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs"),
				crossbar.num_out = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs"),
				crossbar.channels = await vscript.read("a_v_crossbar.pool[" + i + "].outputs[0]", "num_channels"),
				crossbar.name = await vscript.read("a_v_crossbar.pool[" + i + "]", "row_name_status")
			];
			await Promise.all(promises);
			crossbarConfig.crossbars.push(crossbar);
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = await vscript.read("a_v_crossbar.pool[" + i + "].inputs[" + inp + "].source", "video_status");
				if (source !== null) { routes.push(this.getRouteObject("video", source, "large_crossbar", i, inp)); }
			}
			for (let inp = 0; inp < crossbar.num_in; inp++) {
				let source = await vscript.read("a_v_crossbar.pool[" + i + "].inputs[" + inp + "].source", "audio_status");
				if (source !== null) { routes.push(this.getRouteObject("audio", source, "large_crossbar", i, inp)); }
			}
		}

		if (this.debug) console.log(crossbarConfig);
		return crossbarConfig;
	}

	async readIoModule(routes) {
		let sdiConfig = { sdi: [] };
		let sdiOuts = await vscript.allocated_indices("i_o_module.output");
		let sdiIns = await vscript.allocated_indices("i_o_module.input");
		if (sdiOuts.length == 0 || sdiIns.length == 0) { return; }
		if ((await vscript.allocated_indices("i_o_module.configuration").length !== 0)) {
			sdiConfig.io_module_type = "2/2/16";
		}
		else {
			sdiConfig.io_module_type = sdiIns + "/" + sdiOuts;
		}
		sdiConfig.num_out = sdiOuts.length;
		sdiConfig.num_in = sdiIns.length;
		for (let i of sdiOuts) {
			sdiConfig.sdi.push({ index: i, standard: null, audio: (await vscript.read("i_o_module.output[" + i + "].sdi.audio_control.group_enable[0]", "group_status"))});
		}
		for (let inp = 0; inp < sdiConfig.num_out; inp++) {
			let source = await vscript.read("i_o_module.output[" + inp + "].sdi.vid_src", "v_src_status");
			if (source !== null) { routes.push(this.getRouteObject("video", source, "sdi", inp, 0)); }
		}
		
		if (this.debug) console.log(sdiConfig);
		return sdiConfig;
	}

	async readRtpReceivers(routes) {
		let rtpReceiverConfig = { receivers: [] };
		let sessionIdxs = await vscript.allocated_indices("r_t_p_receiver.sessions");
		if (sessionIdxs.length == 0) { return rtpReceiverConfig; }
		for (let session of sessionIdxs) {
			let s = {};
			let videoReceivers = await vscript.allocated_indices("r_t_p_receiver.sessions[" + session +"].video_receivers");
			let audioReceivers = await vscript.allocated_indices("r_t_p_receiver.sessions[" + session +"].audio_receivers");
			s.num_video = videoReceivers.length;
			s.num_audio = audioReceivers.length;
			s.switch_time = await vscript.read("r_t_p_receiver.sessions[" + session + "]", "switch_time_status");
			s.switch_type = (await vscript.read("r_t_p_receiver.sessions[" + session + "]", "switch_type_status")).split("_")[1];
			let priInt = await vscript.read("r_t_p_receiver.sessions[" + session + "].interfaces", "primary_status");
			s.pri_port = this.getIndexes(priInt)[0];
			let secInt = await vscript.read("r_t_p_receiver.sessions[" + session + "].interfaces", "secondary_status");
			if (secInt !== null) { s.sec_port = this.getIndexes(secInt)[0]; }
			if (s.num_audio > 0) {
				let a = await vscript.read("r_t_p_receiver.sessions[" + session + "].audio_receivers[" + audioReceivers[0] + "]", "wrapped_reference");
				s.audio_ch = await vscript.read(a + ".audio_specific", "channel_capacity_status");
			}
			if (s.num_video > 0) {
				let v = await vscript.read("r_t_p_receiver.sessions[" + session + "].video_receivers[" + videoReceivers[0] + "]", "wrapped_reference");
				s.vc2 = await vscript.read(v + ".video_specific.capabilities", "supports_st_2042_status");
				if (await vscript.compare_software_versions(await vscript.software_version(), {major: 1, minor: 8, patch: 232}) != "first-is-older") { 
					s.uhd_singlelink = await vscript.read(v + ".video_specific.capabilities", "supports_uhd_2110_singlelink_status"); 
					s.uhd_2si = await vscript.read(v + ".video_specific.capabilities", "supports_uhd_sample_interleaved_status");
				}
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
		console.log(kwl);
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