// Gateway Setup Script for C100
// Version: 1.0
// Supported C100 firmware versions: 1.8
// User configuration section

const user_configuration = {
	network: {
		mode: 
			"40GbE",
			//"10GbE",
		use_2022_7:
			true,
			//false,
		ip_addresses: {
			mgmt_front: "10.0.1.1/24",
			mgmt_rear: "10.0.2.1/24",
			left_qsfp_40gbe: "10.10.0.1/24",
			right_qsfp_40gbe: "10.20.0.1/24",
			left_qsfp_10gbe: ["10.10.0.1/24", "10.10.0.2/24", "10.10.0.3/24", "10.10.0.4/24"],
			right_qsfp_10gbe: ["10.20.0.1/24", "10.20.0.2/24", "10.20.0.3/24", "10.20.0.4/24"],
		},
		ptp: {
			domain: 127,
		},
		syslog: {
			enabled:
				true,
				//false,
			server: "192.168.0.1",
			interface: 
				"front", 
				//"rear",
			protocol: 
				"TCP", 
				//"UDP",
			rebind_interval: 5, // Rebind interval in seconds
		},
	},
	streaming: { // Only the amount corresponding to the SDI input count is used (2, 10 or 18)
		video_transmitters: [
			{number: 0, 	multicast_primary: "235.0.0.1", 	port_primary: "9000",	multicast_secondary: "235.0.1.1", 	port_secondary: "9000"},
			{number: 1, 	multicast_primary: "235.0.0.2", 	port_primary: "9000",	multicast_secondary: "235.0.1.2", 	port_secondary: "9000"},
			{number: 2, 	multicast_primary: "235.0.0.3", 	port_primary: "9000",	multicast_secondary: "235.0.1.3", 	port_secondary: "9000"},
			{number: 3, 	multicast_primary: "235.0.0.4", 	port_primary: "9000",	multicast_secondary: "235.0.1.4", 	port_secondary: "9000"},
			{number: 4, 	multicast_primary: "235.0.0.5", 	port_primary: "9000",	multicast_secondary: "235.0.1.5", 	port_secondary: "9000"},
			{number: 5, 	multicast_primary: "235.0.0.6", 	port_primary: "9000",	multicast_secondary: "235.0.1.6", 	port_secondary: "9000"},
			{number: 6, 	multicast_primary: "235.0.0.7", 	port_primary: "9000",	multicast_secondary: "235.0.1.7", 	port_secondary: "9000"},
			{number: 7, 	multicast_primary: "235.0.0.8", 	port_primary: "9000",	multicast_secondary: "235.0.1.8", 	port_secondary: "9000"},
			{number: 8, 	multicast_primary: "235.0.0.9", 	port_primary: "9000",	multicast_secondary: "235.0.1.9", 	port_secondary: "9000"},
			{number: 9, 	multicast_primary: "235.0.0.10", 	port_primary: "9000",	multicast_secondary: "235.0.1.10", 	port_secondary: "9000"},
			{number: 10, 	multicast_primary: "235.0.0.11", 	port_primary: "9000",	multicast_secondary: "235.0.1.11", 	port_secondary: "9000"},
			{number: 11, 	multicast_primary: "235.0.0.12", 	port_primary: "9000",	multicast_secondary: "235.0.1.12", 	port_secondary: "9000"},
			{number: 12, 	multicast_primary: "235.0.0.13", 	port_primary: "9000",	multicast_secondary: "235.0.1.13", 	port_secondary: "9000"},
			{number: 13, 	multicast_primary: "235.0.0.14", 	port_primary: "9000",	multicast_secondary: "235.0.1.14", 	port_secondary: "9000"},
			{number: 14, 	multicast_primary: "235.0.0.15", 	port_primary: "9000",	multicast_secondary: "235.0.1.15", 	port_secondary: "9000"},
			{number: 15, 	multicast_primary: "235.0.0.16", 	port_primary: "9000",	multicast_secondary: "235.0.1.16", 	port_secondary: "9000"},
			{number: 16, 	multicast_primary: "235.0.0.17", 	port_primary: "9000",	multicast_secondary: "235.0.1.17", 	port_secondary: "9000"},
			{number: 17, 	multicast_primary: "235.0.0.18", 	port_primary: "9000",	multicast_secondary: "235.0.1.18", 	port_secondary: "9000"},
		],
		video_bandwidth_constraint:
			null,
			//"b1_5Gb",
			//"b3_0Gb",
			//"b12_0Gb",
		audio_transmitters: [
			{number: 0, 	multicast_primary: "236.0.0.1", 	port_primary: "9000",	multicast_secondary: "236.0.1.1", 	port_secondary: "9000"},
			{number: 1, 	multicast_primary: "236.0.0.2", 	port_primary: "9000",	multicast_secondary: "236.0.1.2", 	port_secondary: "9000"},
			{number: 2, 	multicast_primary: "236.0.0.3", 	port_primary: "9000",	multicast_secondary: "236.0.1.3", 	port_secondary: "9000"},
			{number: 3, 	multicast_primary: "236.0.0.4", 	port_primary: "9000",	multicast_secondary: "236.0.1.4", 	port_secondary: "9000"},
			{number: 4, 	multicast_primary: "236.0.0.5", 	port_primary: "9000",	multicast_secondary: "236.0.1.5", 	port_secondary: "9000"},
			{number: 5, 	multicast_primary: "236.0.0.6", 	port_primary: "9000",	multicast_secondary: "236.0.1.6", 	port_secondary: "9000"},
			{number: 6, 	multicast_primary: "236.0.0.7", 	port_primary: "9000",	multicast_secondary: "236.0.1.7", 	port_secondary: "9000"},
			{number: 7, 	multicast_primary: "236.0.0.8", 	port_primary: "9000",	multicast_secondary: "236.0.1.8", 	port_secondary: "9000"},
			{number: 8, 	multicast_primary: "236.0.0.9", 	port_primary: "9000",	multicast_secondary: "236.0.1.9", 	port_secondary: "9000"},
			{number: 9, 	multicast_primary: "236.0.0.10", 	port_primary: "9000",	multicast_secondary: "236.0.1.10", 	port_secondary: "9000"},
			{number: 10, 	multicast_primary: "236.0.0.11", 	port_primary: "9000",	multicast_secondary: "236.0.1.11", 	port_secondary: "9000"},
			{number: 11, 	multicast_primary: "236.0.0.12", 	port_primary: "9000",	multicast_secondary: "236.0.1.12", 	port_secondary: "9000"},
			{number: 12, 	multicast_primary: "236.0.0.13", 	port_primary: "9000",	multicast_secondary: "236.0.1.13", 	port_secondary: "9000"},
			{number: 13, 	multicast_primary: "236.0.0.14", 	port_primary: "9000",	multicast_secondary: "236.0.1.14", 	port_secondary: "9000"},
			{number: 14, 	multicast_primary: "236.0.0.15", 	port_primary: "9000",	multicast_secondary: "236.0.1.15", 	port_secondary: "9000"},
			{number: 15, 	multicast_primary: "236.0.0.16", 	port_primary: "9000",	multicast_secondary: "236.0.1.16", 	port_secondary: "9000"},
			{number: 16, 	multicast_primary: "236.0.0.17", 	port_primary: "9000",	multicast_secondary: "236.0.1.17", 	port_secondary: "9000"},
			{number: 17, 	multicast_primary: "236.0.0.18", 	port_primary: "9000",	multicast_secondary: "236.0.1.18", 	port_secondary: "9000"},
		],
		audio_transmitter_format:
			"L24",
			//"L16",
			//"AM824",
		audio_packet_time:
			//"p1", 
			//"p0_666", 
			//"p0_500", 
			//"p0_333", 
			//"p0_250", 
			"p0_125",
		audio_streaming_channels: 16,
		video_receivers: {
			switch_mode:
				"DTS_BBM", //Destination-Timed Switching - Break Before Make
				//"DTS_MBB", //Destination-Timed Switching - Make Before Break
			switch_time:
				1, //Dirty switching
				//2, //Clean switching, at next possible frame boundary
		}
	},
	routing: {
		mode:
			//"AudioFollowsVideo",
			"AudioIsSeparate",
	},
	system: {
		signal_gen_format:
			"HD1080i50",
			//"HD1080p50",
			//"HD1080p59_94",
			//"HD2160p60",
			// Etc. etc.
	}
};

///////////////////////////////////////////////////////////////////////////////
// DO NOT CHANGE ANYTHING BELOW THIS LINE, NO USER CONFIGURABLE PARTS INSIDE //
///////////////////////////////////////////////////////////////////////////////

async function main() {
	
	// Step 1: Select the right FPGA. This requires a reboot, so if running the script from the web GUI it will have to be run again after the card comes back.
	let current_fpga = await read("system", "selected_fpga");
	let desired_fpga = "STREAMING" + user_configuration.network.mode == "40GbE" ? "_40GbE" : "";
	let requires_reboot = false;
	if (current_fpga != desired_fpga) {
		await dispatch_change_request("system", "select_fpga_command", desired_fpga);
		await pause_ms(250);
		inform("Selecting " + desired_fpga);
		requires_reboot = true;
	}

	// Step 1.1: Set the Signal Generator format
	await write("video_signal_generator", "standard_command", user_configuration.system.signal_gen_format);

	// Step 2: Configure network settings. This requires a reboot, so if running the script from the web GUI it will have to be run again after the card comes back.
	let ip_address_list = [];
	if (user_configuration.network.mode === "40GbE") {
		ip_address_list.push(user_configuration.network.ip_addresses.left_qsfp_40gbe, user_configuration.network.ip_addresses.right_qsfp_40gbe);
	} else if (user_configuration.network.mode === "10GbE") {
		ip_address_list = ip_address_list.concat(user_configuration.network.ip_addresses.left_qsfp_10gbe, user_configuration.network.ip_addresses.right_qsfp_10gbe);
	}
	ip_address_list.push(user_configuration.network.ip_addresses.mgmt_front, user_configuration.network.ip_addresses.mgmt_rear);

	for (let i = 0; i < ip_address_list.length; i++) {
		let current_ip = await read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address");
		let current_prefix = await read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "prefix");
		if (current_ip != ip_address_list[i].split("/")[0]) {
			await write("network_interfaces.ports[" + i + "].desired_configuration.base.ip_addresses[0]", "ip_address", ip_address_list[i].split("/")[0]);
			requires_reboot = true;
		}
		if (current_prefix != ip_address_list[i].split("/")[1]) {
			await write("network_interfaces.ports[" + i + "].desired_configuration.base.ip_addresses[0]", "prefix", ip_address_list[i].split("/")[1]);
			requires_reboot = true;
		}
		await dispatch_change_request("network_interfaces.ports[" + i + "]", "save_config", "Click");
	}

	// Step 3: Perform reboot, if required from above
	if (requires_reboot) {
		inform("Rebooting to apply FPGA and/or Network settings");
		await reboot({ timeout: 120 });
		inform("Reboot finished (or timed out)");
	}

	// Step 4: Set up PTP. If using 2022-7, it will set up one agent on each port and combinator them.
	await dispatch_change_request("p_t_p", "create_agent", "Click");
	await pause_ms(250);

	await write("p_t_p.agents[0]", "hosting_port_command", "p_t_p.ports[0]");
	await write("p_t_p.agents[0]", "domain_command", user_configuration.network.ptp.domain);
	await write("p_t_p.agents[0]", "delay_req_routing_command", "Unicast");
	await write("p_t_p.agents[0]", "utc_offsets", "Ignore");

	if (user_configuration.network.use_2022_7) {
		await dispatch_change_request("p_t_p", "create_agent", "Click");
		await pause_ms(250);
		await write("p_t_p.agents[1]", "hosting_port_command", "p_t_p.ports[" + (user_configuration.network.mode == "40GbE" ? 1 : 4) + "]");
		await write("p_t_p.agents[1]", "domain_command", user_configuration.network.ptp.domain);
		await write("p_t_p.agents[1]", "delay_req_routing_command", "Unicast");
		await write("p_t_p.agents[1]", "utc_offsets", "Ignore");

		await dispatch_change_request("time_flows", "create_combinator", "Click");
		await pause_ms(500);
		await write("time_flows.combinators[0].inputs[0]", "source_command", "p_t_p.agents[0].output");
		await write("time_flows.combinators[0].inputs[1]", "source_command", "p_t_p.agents[1].output");
		await write("time_flows.combinators[0]", "source_filter_command", "UsePTPOrBetter");
		await write("p_t_p_clock", "input_command", "time_flows.combinators[0].output");
	} else {
		await write("p_t_p_clock", "input_command", "p_t_p.agents[0].output");
	}

	// Step 5: Set up Syslog (if enabled)
	if (user_configuration.network.syslog.enabled) {
		let interface_number;
		if (user_configuration.network.syslog.interface == "front") {
			interface_number = (user_configuration.network.mode == "40GbE" ? 2 : 8);
		} else if (user_configuration.network.syslog.interface == "rear") {
			interface_number = (user_configuration.network.mode == "40GbE" ? 3 : 9);
		}
		await write("network_interfaces.ports[" + interface_number + "].desired_syslog_configuration.syslog_servers[0]", "protocol", user_configuration.network.syslog.protocol);
		await write("network_interfaces.ports[" + interface_number + "].desired_syslog_configuration.syslog_servers[0]", "address", user_configuration.network.syslog.server);
		await write("network_interfaces.ports[" + interface_number + "].desired_syslog_configuration.syslog_servers[0]", "rebind_interval", user_configuration.network.syslog.rebind_interval);
		await dispatch_change_request("network_interfaces.ports[" + interface_number + "]", "save_config", "Click");
		await pause_ms(250);
		await dispatch_change_request("network_interfaces", "save_syslog_config", "Click");
		await pause_ms(500);
	}

	// Step 6: Set up crossbars
	if (user_configuration.routing.mode == "AudioFollowsVideo") {
		await create_table_row("a_v_crossbar.pool", "AV_Xbar");
		await write("a_v_crossbar.pool[0]", "num_inputs", 107);
		await write("a_v_crossbar.pool[0]", "num_outputs", 46);
	} else if (user_configuration.routing.mode == "AudioIsSeparate") {
		await create_table_row("video_crossbar.pool", "Video_Xbar");
		await write("video_crossbar.pool[0]", "num_inputs", 107);
		await write("video_crossbar.pool[0]", "num_outputs", 46);

		await create_table_row("audio_crossbar.large", "Audio_Xbar");
		await write("audio_crossbar.large[0]", "num_inputs", 107);
		await write("audio_crossbar.large[0]", "num_outputs", 46);
		for (let i = 0; i < 107; i++) { await write("audio_crossbar.large[0].inputs["+ i + "]", "num_channels", user_configuration.streaming.audio_streaming_channels); }
		for (let i = 0; i < 46; i++) { await write("audio_crossbar.large[0].outputs["+ i + "]", "num_channels", user_configuration.streaming.audio_streaming_channels); }
	}

	// Step 7: Configure SDI outputs
	let sdi_inputs = (await allocated_indices("i_o_module.input")).length;
	let sdi_outputs = (await allocated_indices("i_o_module.output")).length;
	for (let i = 0; i < sdi_outputs; i++) {
		for (let j = 0; j < 8; j++) {
			await write("i_o_module.output[" + i + "].sdi.audio_control.group_enable[" + j + "]", "group_command", "Embed");
		}
	}

	// Step 8: Configure video transmitters
	for (let i = 0; i < sdi_inputs; i++) {
		if (user_configuration.network.mode == "40GbE") {
			await write("video_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[0].virtual_interfaces[0]");
		} else if (user_configuration.network.mode == "10GbE") {
			await write("video_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[" + Math.floor((i * 4) / sdi_inputs) + "].virtual_interfaces[0]");
		} 
		await dispatch_change_request("video_transmitter.transmitter_assignment", "create_transmitter", "Click");
	}

	for (let i = 0; i < sdi_inputs; i++) {		
		for (let j = 0; j < 8; j++) {
			await write("video_transmitter.pool[" + i + "].audio_control.group_enable[" + j + "]", "group_command", "Embed");
		}

		await write("video_transmitter.pool[" + i + "]", "transport_format_command", "ST2110_GPM");
		await write("video_transmitter.pool[" + i + "].constraints", "max_bandwidth_command", user_configuration.streaming.video_bandwidth_constraint);

		let multicast_primary =  user_configuration.streaming.video_transmitters[i].multicast_primary + ":" + user_configuration.streaming.video_transmitters[i].port_primary;
		await write("video_transmitter.pool[" + i + "].output_port[0]", "mc_address_command", multicast_primary);
		if (user_configuration.network.use_2022_7) {
			let multicast_secondary =  user_configuration.streaming.video_transmitters[i].multicast_secondary + ":" + user_configuration.streaming.video_transmitters[i].port_secondary;
			await dispatch_change_request("video_transmitter.pool[" + i + "]", "add_new_output", "Click");
			await pause_ms(250);
			if (user_configuration.network.mode == "40GbE") {
				await write("video_transmitter.pool[" + i + "].output_port[1]", "interface_command", "network_interfaces.ports[1].virtual_interfaces[0]");
			} else if (user_configuration.network.mode == "10GbE") {
				await write("video_transmitter.pool[" + i + "].output_port[1]", "interface_command", "network_interfaces.ports[" + (Math.floor((i * 4) / sdi_inputs) + 4) + "].virtual_interfaces[0]");
			} 
			await write("video_transmitter.pool[" + i + "].output_port[1]", "mc_address_command", multicast_secondary);
		}
		await write("video_transmitter.pool[" + i + "]", "active_command", true);
	}

	// Step 9: Configure audio transmitters
	for (let i = 0; i < sdi_inputs; i++) {
		for (let i = 0; i < sdi_inputs; i++) {
			if (user_configuration.network.mode == "40GbE") {
				await write("audio_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[0].virtual_interfaces[0]");
			} else if (user_configuration.network.mode == "10GbE") {
				await write("audio_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[" + Math.floor((i * 4) / sdi_inputs) + "].virtual_interfaces[0]");
			} 
			await dispatch_change_request("audio_transmitter.transmitter_assignment", "create_transmitter", "Click");
		}

		await write("audio_transmitter.pool[" + i + "]", "format_command", user_configuration.streaming.audio_transmitter_format);
		await write("audio_transmitter.pool[" + i + "]", "packet_time_command", user_configuration.streaming.audio_packet_time);
		await write("audio_transmitter.pool[" + i + "]", "num_channels_command", user_configuration.streaming.audio_streaming_channels);

		let multicast_primary =  user_configuration.streaming.audio_transmitters[i].multicast_primary + ":" + user_configuration.streaming.audio_transmitters[i].port_primary;
		await write("audio_transmitter.pool[" + i + "].output_port[0]", "mc_address_command", multicast_primary);
		if (user_configuration.network.use_2022_7) {
			let multicast_secondary =  user_configuration.streaming.audio_transmitters[i].multicast_secondary + ":" + user_configuration.streaming.audio_transmitters[i].port_secondary;
			await dispatch_change_request("audio_transmitter.pool[" + i + "]", "add_new_output", "Click");
			await pause_ms(250);
			if (user_configuration.network.mode == "40GbE") {
				await write("audio_transmitter.pool[" + i + "].output_port[1]", "interface_command", "network_interfaces.ports[1].virtual_interfaces[0]");
			} else if (user_configuration.network.mode == "10GbE") {
				await write("audio_transmitter.pool[" + i + "].output_port[1]", "interface_command", "network_interfaces.ports[" + (Math.floor((i * 4) / sdi_inputs) + 4) + "].virtual_interfaces[0]");
			} 
			await write("audio_transmitter.pool[" + i + "].output_port[1]", "mc_address_command", multicast_secondary);
		}
		await write("audio_transmitter.pool[" + i + "]", "active_command", true);
	}

	// Step 10: Set up RTP receivers
	await write("r_t_p_receiver.error_handling", "on_redundant_sdp", "DiscardAggressively");

	for (let i = 0; i < sdi_outputs; i++) {
		let s = await create_table_row("r_t_p_receiver.sessions");
		if (user_configuration.network.mode == "40GbE") {
			await write("r_t_p_receiver.sessions[" + s + "].interfaces", "primary_command", "network_interfaces.ports[0].virtual_interfaces[0]");
		} else if (user_configuration.network.mode == "10GbE") {
			await write("r_t_p_receiver.sessions[" + s + "].interfaces", "primary_command", "network_interfaces.ports[" + Math.floor((i * 4) / sdi_inputs) + "].virtual_interfaces[0]");
		} 

		if (user_configuration.network.use_2022_7) {
			if (user_configuration.network.mode == "40GbE") {
				await write("r_t_p_receiver.sessions[" + s + "].interfaces", "secondary_command", "network_interfaces.ports[0].virtual_interfaces[0]");
			} else if (user_configuration.network.mode == "10GbE") {
				await write("r_t_p_receiver.sessions[" + s + "].interfaces", "secondary_command", "network_interfaces.ports[" + (Math.floor((i * 4) / sdi_inputs) + 4) + "].virtual_interfaces[0]");
			} 		
		}

		await write("r_t_p_receiver.sessions[" + s + "]", "switch_time_command", user_configuration.streaming.video_receivers.switch_time);
		await write("r_t_p_receiver.sessions[" + s + "]", "switch_type_command", user_configuration.streaming.video_receivers.switch_mode);

		let v = await create_table_row("r_t_p_receiver.video_receivers");
		await write("r_t_p_receiver.video_receivers[" + v + "].generic", "hosting_session_command", "r_t_p_receiver.sessions[" + s + "]");
		await write("r_t_p_receiver.video_receivers[" + v + "].generic.timing", "read_delay_preference", "AsEarlyAsPossible");
		await write("r_t_p_receiver.video_receivers[" + v + "].generic.timing", "phase_reference_command", "TimeSource");
		await write("r_t_p_receiver.video_receivers[" + v + "].generic.timing", "time_source_command", "genlock.output");

		await write("r_t_p_receiver.sessions[" + s + "]", "active_command", true);
	}
	for (let i = 0; i < sdi_outputs; i++) {
		let s = await create_table_row("r_t_p_receiver.sessions");
		if (user_configuration.network.mode == "40GbE") {
			await write("r_t_p_receiver.sessions[" + s + "].interfaces", "primary_command", "network_interfaces.ports[0].virtual_interfaces[0]");
		} else if (user_configuration.network.mode == "10GbE") {
			await write("r_t_p_receiver.sessions[" + s + "].interfaces", "primary_command", "network_interfaces.ports[" + Math.floor((i * 4) / sdi_inputs) + "].virtual_interfaces[0]");
		} 

		if (user_configuration.network.use_2022_7) {
			if (user_configuration.network.mode == "40GbE") {
				await write("r_t_p_receiver.sessions[" + s + "].interfaces", "secondary_command", "network_interfaces.ports[0].virtual_interfaces[0]");
			} else if (user_configuration.network.mode == "10GbE") {
				await write("r_t_p_receiver.sessions[" + s + "].interfaces", "secondary_command", "network_interfaces.ports[" + (Math.floor((i * 4) / sdi_inputs) + 4) + "].virtual_interfaces[0]");
			} 		
		}

		await write("r_t_p_receiver.sessions[" + s + "]", "switch_time_command", user_configuration.streaming.video_receivers.switch_time);
		await write("r_t_p_receiver.sessions[" + s + "]", "switch_type_command", user_configuration.streaming.video_receivers.switch_mode);

		let a = await create_table_row("r_t_p_receiver.audio_receivers");
		await write("r_t_p_receiver.audio_receivers[" + a + "].generic", "hosting_session_command", "r_t_p_receiver.sessions[" + s + "]");
		await write("r_t_p_receiver.audio_receivers[" + a + "].audio_specific", "channel_capacity_command", user_configuration.streaming.audio_streaming_channels);

		await write("r_t_p_receiver.sessions[" + s + "]", "active_command", true);
	}


	// Step 11: Assign signals to inputs (crossbars, SDI outputs, transmitters)
	if (user_configuration.routing.mode == "AudioFollowsVideo") {
		// Step 11.1: Crossbar inputs
		// Assign SDI inputs to 0-17
		for (let i = 0, input = 0; i < sdi_inputs; i++, input++) {
			await write("a_v_crossbar.pool[0].inputs[" + input + "].source", "video_command", "i_o_module.input[" + i + "].sdi.output.video");
			await write("a_v_crossbar.pool[0].inputs[" + input + "].source", "audio_command", "i_o_module.input[" + i + "].sdi.output.audio"); 
		}
		// Assign RTP receivers to inputs 18-36
		for (let i = 0, input = 18; i < sdi_inputs; i++, input++) {
			await write("a_v_crossbar.pool[0].inputs[" + input + "].source", "video_command", "r_t_p_receiver.video_receivers[" + i + "].video_specific.output.video");
			await write("a_v_crossbar.pool[0].inputs[" + input + "].source", "audio_command", "r_t_p_receiver.audio_receivers[" + i + "].audio_specific.output"); 
		}
		// Assign test signal to input 36
		await write("a_v_crossbar.pool[0].inputs[36].source", "video_command", "video_signal_generator.output");
		await write("a_v_crossbar.pool[0].inputs[36].source", "audio_command", "audio_signal_generator.signal_aggregate.output"); 
		
		// Step 11.2: SDI Outputs
		for (let i = 0, output = 0; i < sdi_outputs; i++, output++) {
			await write("i_o_module.output[" + i + "].sdi.vid_src", "v_src_command", "a_v_crossbar.pool[0].outputs[" + output + "].output.video");
			await write("i_o_module.output[" + i + "].sdi.audio_control", "source_command", "a_v_crossbar.pool[0].outputs[" + output + "].output.audio");
		}

		// Step 11.3: Transmitters
		for (let i = 0, output = 18; i < sdi_outputs; i++, output++) {
			await write("video_transmitter.pool[" + i + "]", "v_src_command", "a_v_crossbar.pool[0].outputs[" + output + "].output.video");
			await write("audio_transmitter.pool[" + i + "]", "source_command", "a_v_crossbar.pool[0].outputs[" + output + "].output.audio");
			
		}
	} 
	else if (user_configuration.routing.mode == "AudioIsSeparate") {
		// Step 11.1: Crossbar inputs
		// Assign SDI inputs to 0-17
		for (let i = 0, input = 0; i < sdi_inputs; i++, input++) {
			await write("video_crossbar.pool[0].inputs[" + input + "].source", "video_command", "i_o_module.input[" + i + "].sdi.output.video");
			await write("audio_crossbar.large[0].inputs[" + input + "].source", "audio_command", "i_o_module.input[" + i + "].sdi.output.audio"); 
		}
		// Assign RTP receivers to inputs 18-36
		for (let i = 0, input = 18; i < sdi_inputs; i++, input++) {
			await write("video_crossbar.pool[0].inputs[" + input + "].source", "video_command", "r_t_p_receiver.video_receivers[" + i + "].video_specific.output.video");
			await write("audio_crossbar.large[0].inputs[" + input + "].source", "audio_command", "r_t_p_receiver.audio_receivers[" + i + "].audio_specific.output"); 
		}
		// Assign test signal to input 36
		await write("video_crossbar.pool[0].inputs[36].source", "video_command", "video_signal_generator.output");
		await write("audio_crossbar.large[0].inputs[36].source", "audio_command", "audio_signal_generator.signal_aggregate.output"); 

		// Step 11.2: SDI Outputs
		for (let i = 0, output = 0; i < sdi_outputs; i++, output++) {
			await write("i_o_module.output[" + i + "].sdi.vid_src", "v_src_command", "video_crossbar.pool[0].outputs[" + output + "].output");
			await write("i_o_module.output[" + i + "].sdi.audio_control", "source_command", "audio_crossbar.large[0].outputs[" + output + "].output");
		}

		// Step 11.3: Transmitters
		for (let i = 0, output = 18; i < sdi_outputs; i++, output++) {
			await write("video_transmitter.pool[" + i + "]", "v_src_command", "video_crossbar.pool[0].outputs[" + output + "].output");
			await write("audio_transmitter.pool[" + i + "]", "source_command", "audio_crossbar.large[0].outputs[" + output + "].output");
			
		}
	}

	// Step 99: Reboot to publish crossbars to Ember
	inform("Rebooting to apply update Ember+ tree with crossbars");
	await reboot({ timeout: 120 });
	inform("Reboot finished (or timed out)");

}


main();