/* jshint esversion: 6 */
/**
* @fileOverview Functions for simplifying setup of a C100
* @author <a href="mailto:henrik.halvorsen@lawo.com">Henrik Halvorsen</a>
* @version 2.0
*/

/**
* @module cardSetupNative
* @desc Module containing all functions for complete C100 setup
*/
//TODO: add audio channel count to crossbarSetup
//TODO: add function for other commands
//TODO: function for setting static SDP


module.exports = function () {
	var vscript = require("vscript");
	var MultiConnection = require("vscript").MultiConnection;

	this.STATUS_FLAG = false;
	this.DEBUG = true;
	this.ip = "";
	this.config = null;
	this.status = {};
	this.version = [];
	this.READY = false;

	/**
	* Generates a nicely formatted timestamp
	* @return {string} - Timestamp
	*/
	this.getTimeStamp = function () {
		let n = new Date();
		let h = ("0" + n.getHours()).slice(-2);
		let m = ("0" + n.getMinutes()).slice(-2);
		let s = ("0" + n.getSeconds()).slice(-2);
		let t = h + ":" + m + ":" + s;
		return t;
	},

	/**
	 * Verbose wrapper for the v__script write function, for debug purposes
	 * @param {string} kwl_name 
	 * @param {string} kw_name 
	 * @param {string} payload 
	 * @param {object} [options] 
	 */
	this.write = async function(kwl_name, kw_name, payload, options) {
		this.debug("write()ing \"" + payload + "\" to \"" + kwl_name + "." + kw_name + "\"");
		await vscript.write(kwl_name, kw_name, payload, options);
	},

	/**
	* Print debug information to the status table (if defined) or to console
	* @param {string} debug_string - The string to output
	*/
	this.debug = function (debug_string) {
		if (this.DEBUG) {
			if (typeof this.status === "function") {
				this.status(debug_string);
			}
			else if (this.STATUS_FLAG) {
				this.status[this.ip] = Object.assign(this.status[this.ip], { Time: this.getTimeStamp(), Debug: debug_string });
			} else {
				console.log("[" + this.getTimeStamp() + "] DEBUG (" + this.ip + "): " + debug_string);
			}
		}
	},

	/**
	* Print verbose information to the status table (if defined) or to console
	* @param {string} verbose_string - The string to output
	* @param {number} progress - Optionally sets the progress (0-100); only used for the status table
	*/
	this.verbose = function (verbose_string, progress = -1) {
		if (this.STATUS_FLAG) {
			if (typeof this.status === "function") {
				this.status(verbose_string);
			}
			else if (progress >= 0) {
				this.status[this.ip] = Object.assign(this.status[this.ip], { Time: this.getTimeStamp(), percentage: progress, Status: verbose_string });
			} else {
				this.status[this.ip] = Object.assign(this.status[this.ip], { Time: this.getTimeStamp(), Status: verbose_string });
			}
		} else {
			vscript.inform(this.getTimeStamp() + " VERBOSE (" + this.ip + "): " + verbose_string);		
			vscript.dispatch_change_request("system.usrinfo", "cur_status", verbose_string, { ip: this.ip });
		}
	},

	/**
	* Create a new table row in the C100
	* @param {string} table - The kwl for the table in which to create a new row
	* @param {string} [row_name] - The desired name for the row (such as a Crossbar name)
	* @return {number} The table index of the created row
	*/
	this.createNewRow = async function (table, row_name = "") {
		let existing_rows = await vscript.allocated_indices(table, { ip: this.ip} );
		this.debug("Existing rows: " + existing_rows);
		await vscript.create_table_row(table, { desired_name: row_name, ip: this.ip });
		let new_rows = await vscript.allocated_indices(table, { ip: this.ip} );
		this.debug("Created row in " + table + ": " + new_rows.filter(x => !existing_rows.includes(x))[0]);
		return new_rows.filter(x => !existing_rows.includes(x))[0];
	},

	/**
	 * Get the currently running firmware version on the C100, and store it in the global version object
	 * @return {number[]} Array containing current version, represented as [1,2,3]
	 */
	this.getVersion = async function () {
		let partition = await vscript.read("system", "booted_partition", { ip: this.ip} );
		let version = await vscript.read("system.partitions."+partition.replace(/\s+/g, "").toLowerCase(), "version", { ip: this.ip} );
		this.version = version.split(".", 3);
		return this.version;
	},

	/**
	 * Compares two versions, presented as arrays: [1,8,0]
	 * @param {number[]} version_1 - The first version to compare
	 * @param {number[]} [version_2=this.version] - The second version to compare, omit to use the version of the current blade
	 * @param {boolean} [check_build=false] - If true, checks build version (1.8.X) as well
	 * @return {number} The compared value (negative if version_1 is older, zero for same, positive for newer) 
	 */
	this.compareVersions = async function(version_1, version_2 = this.version, check_build = false) {
		if (this.version.length != 3) {
			await this.getVersion();
			version_2 = this.version;
		}
		let comparison;
		if (version_1.length != 3 || version_2.length != 3) {
			comparison = null;
		} else {
			comparison = version_1[0] - version_2[0];
			if (comparison == 0) {
				comparison = version_1[1] - version_2[1]; 
			} 
			if (comparison == 0 && check_build) {
				comparison = version_1[2] - version_2[2];
			}
		}
		return comparison;
	},

	/**
	 * Compares the running version to a given version, returns true if it is newer
	 * @param {number[]} version_1 - The version to compare to the currently running version
	 * @param {boolean} check_build - If true, checks build version (1.8.X) as well
	 * @return {boolean} True if running is newer than the input version
	 */
	this.runningIsNewerThan = async function(version_1, check_build = false) {
		let r = await this.compareVersions(version_1, this.version, check_build);
		let n = r < 0 ? true : false;
		return n;
	},

	/**
	 * Compares the running version to a given version, returns true if it is newer or same
	 * @param {number[]} version_1 - The version to compare to the currently running version
	 * @param {boolean} check_build - If true, checks build version (1.8.X) as well
	 * @return {boolean} True if running is newer or same as the input version
	 */
	this.runningIsNewerThanOrSameAs = async function(version_1, check_build = false) {
		let r = await this.compareVersions(version_1, this.version, check_build);
		let n = r <= 0 ? true : false;
		return n;
	},

	/**
	* Recursively flattens a JSON object containing configuration parameters into a kwl format accepted by the C100
	* @param {object} config - The JSON object to flattenConfig
	* @param {string} root - The root kwl, this is prefixed to all the parameters
	* @param {object} [flat_config] - The result is appended to this object; for recursive purposes
	* @return {object} The 1D flattened configuration object
	*/
	this.flattenConfig = function (config, root, flat_config = {}) {
		for (let kw of Object.getOwnPropertyNames(config)) {
			if (typeof config[kw] !== "object") {
				flat_config[root + "." + kw] = config[kw];
			} else if (Array.isArray(config[kw])) {
				for (let i = 0; i < config[kw].length; i++) {
					flat_config = Object.assign(flat_config, this.flattenConfig(config[kw][i], root + "." + kw + "[" + i + "]"));
				}
			} else {
				flat_config = this.flattenConfig(config[kw], root + "." + kw, flat_config);
			}
		}
		return flat_config;
	},

	/**
	 * Function for getting a specific parameter value from the Arkona settings.json
	 * @param {string} settingKwl - KWL to search for 
	 * @param {string} setting - KW within KWL to extract value of
	 */

	this.getSetting = function(settingKwl, parameter, checkIsDefault = false) {
		if (this.debug) console.log("Finding setting: " + settingKwl + "." + parameter);
		let object = this.findObject(settingKwl);
		let returnValue;
		let isDefaultValue = false;
		//Handling of special cases due to inconsistent settings.json
		switch (parameter) {
		case "row_name_status":
			returnValue = object.id;
			break;
		case "id":
			returnValue = object.id;
			break;
		default:
			parameter.match(/.*_command$/) && (parameter = parameter.replace(/_command$/, "_status"));
			if (!object.kw.hasOwnProperty(parameter)) { return undefined; }
			returnValue = object.kw[parameter].data;
			if (object.kw[parameter].hasOwnProperty("isDefault")) { 
				isDefaultValue = true;
			}
			break;
		}
		if (checkIsDefault) {
			return [returnValue, isDefaultValue];
		} else {
			return returnValue;
		}
	},

	/**
	 * Calculates the allocated/used indices for a specific table
	 * @param {string} listKwl - The list KWL to calculate indices for
	 */
	this.allocatedIndicesConfig = function(listKwl) {
		if (this.debug) console.log("Calculating allocatedIndicesConfig on: " + listKwl);
		let path = listKwl.split(".");
		let list = path.pop();
		let indices = [];
		let object = this.findObject(path.join("."));
		object = object.kwl;
		if (object.hasOwnProperty(list)) {
			for (const row of object[list]["named-rows"]) {
				indices.push(parseInt(row.idx));
			}
		} 
		else {
			for (const key in object) {
				if (key.startsWith(list + "[")) {
					indices.push(parseInt(key.match(/\[(.*?)\]/)[1]));
				}
			}
		}
		if (this.debug) console.log("Found indices on: " + listKwl + " - " + indices);
		return indices;
	},

	/**
	 * Internal helper function for finding the object associated with a specific KWL
	 * @param {string} kwl - The KWL to find
	 */
	this.findObject = function(kwl) {
		let path = kwl.split(".");
		let object = this.config.components[path[0]];
		for (let i = 1; i < path.length; i++) {
			path[i].match(/^desired_.*/) && (path[i] = path[i].replace(/^desired_/, "current_"));
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
	},

	/**
	 * Sets the live card (kwl,kw) parameter to that of the (kwl,kw) in the config
	 * @param {string} kwl 
	 * @param {string} kw 
	 */
	this.matchSetting = async function(kwl, kw) {
		let val = this.getSetting(kwl, kw, true); // reads kwl,kw from loaded settings.json
		if (typeof val == "undefined") { return -1; }
		if (val[1] === true && val[0] === null) { return -1; }
		await vscript.write(kwl, kw, val[0], { ip: this.ip });
	},

	/**
	 * Performs the basic setup for configuration, such as setting the target IP and checking reachability
	 * This is called by any subfunction if READY = false
	 * @param {object} config 
	 */
	this.basics = async function(config, ip, status = null) {
		if (config.format !== "V__matrix settings.json v1") {
			return "Unknown config format!";
		}
		if (status !== null) {
			this.STATUS_FLAG = true;
			this.status = status;
		}

		config = JSON.parse(JSON.stringify(config));
		this.config = config;
		this.ip = ip;

		MultiConnection.initialize("Running script from framework!", "");
		if (!(await vscript.is_reachable(this.ip))) {
			vscript.warn("Unable to reach " + this.ip );
			process.exit(-1);
		}
		//this.verbose("Succesfully connected to " + this.ip, 0);
		
		await this.getVersion();
		console.log("Running version: " + this.version);
		this.READY = true;
	},

	/**
	* Runs every setup step on the input configuration
	* @param {object} config - The configuration object to run
	* @param {string} ip - The IP address of the target C100
	*/
	this.completeSetup = async function (config, ip, status = null) {
		let startTime = new Date();
		if(!this.READY) { await this.basics(config, ip, status); }
		if(!this.READY) { return "Unable to initialize!"; }

		await this.systemSetup(config);
		//await this.networkSetup(config);
		await this.ptpSetup(config);
		await this.syslogSetup(config);
		await this.crossbarSetup(config);
		await this.sdiSetup(config);
		await this.videoTransmitterSetup(config);
		await this.audioTransmitterSetup(config);
		await this.rtpReceiverSetup(config);
		await this.videoDelaySetup(config);
		await this.audioDelaySetup(config);
		await this.multiviewerSetup(config);
		await this.webRouting(config);
		await this.routing(config);

		if (config.hasOwnProperty("reboot") && config.reboot === true) {
			//this.verbose("Configuration finished, rebooting to publish Ember+", 95);
			await vscript.reboot({ timeout: 120, ip: this.ip });
		}

		let endTime = new Date();
		let sec = Math.round((endTime - startTime) / 1000);
		let minutes = Math.floor(sec / 60);
		sec = sec - (60 * minutes);
		//this.verbose("Finihed! It took " + minutes + " minutes and " + sec + " seconds.", 100);

		this.status.finished = true;

		return 1;
	},

	/**
	* Setup function for the core system functionality
	* @param {object} config - The settings.json object
	*/
	this.systemSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running systemSetup()...", 1);
		if(!this.READY) { await this.basics(config, ip, status);	}

		if (config.reset) {
			//this.verbose("Resetting card, waiting...", 5);
			await vscript.reset({ ip: this.ip });
			//this.verbose("Reset finished (or timed out)");
		}
		let curr = await vscript.read("system", "selected_fpga", { ip: this.ip} );
		if (curr == config.header.fpga) {
			//this.verbose("Correct FPGA already selected: " + curr);
		} else if (["streaming", "multiviewer", "streaming_40gbe", "multiviewer_40gbe"].includes(config.header.fpga.toLowerCase())) {
			await vscript.dispatch_change_request("system", "select_fpga_command", config.header.fpga.toUpperCase().replace("GBE", "GbE"), { ip: this.ip} );
			await vscript.pause_ms(250);
			//this.verbose("Selecting " + config.header.fpga.toUpperCase().replace("GBE", "GbE") + " and rebooting...");
			await vscript.reboot({ timeout: 120, ip: this.ip });
			//this.verbose("Reboot finished (or timed out)");
		}
		//this.verbose("Finished systemSetup()...", 10);
		return 1;
	},

	/**
	* Setup function for the network interfaces
	* @param {object} config - The settings.json object
	*/
	this.networkSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running network_setup()...", 11);
		if(!this.READY) { await this.basics(config, ip, status);	}

		let ports = this.allocatedIndicesConfig("network_interfaces.ports");
		for (let i = 0; i < ports.length; i++) {
			let current_ip = await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address", { ip: this.ip} );
			let current_prefix = await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "prefix", { ip: this.ip} );
			if (current_ip != this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address")) {
				await vscript.write("network_interfaces.ports[" + i + "].desired_configuration.base.ip_addresses[0]", "ip_address", this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "ip_address"), { ip: this.ip} );
				config.reboot = true;
				await vscript.dispatch_change_request("network_interfaces.ports[" + i + "]", "save_config", "Click", { ip: this.ip} );
			}
			if (current_prefix != this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "prefix")) {
				await vscript.write("network_interfaces.ports[" + i + "].desired_configuration.base.ip_addresses[0]", "prefix", this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.ip_addresses[0]", "prefix"), { ip: this.ip} );
				config.reboot = true;
				await vscript.dispatch_change_request("network_interfaces.ports[" + i + "]", "save_config", "Click", { ip: this.ip} );
			}
			let routes = this.allocatedIndicesConfig("network_interfaces.ports[" + i + "].current_configuration.base.routes");
			for (let j = 0; j < routes.length; i++) {
				let current_gateway = await vscript.read("network_interfaces.ports[" + i + "].current_configuration.base.routes[" + j + "]", "via", { ip: this.ip} );
				if (current_gateway != config.gateways[i]) {
					await vscript.dispatch_change_request("network_interfaces.ports[" + i + "].desired_configuration.base", "add_route", "Click", { ip: this.ip} );
					await vscript.pause_ms(250);
					await vscript.write("network_interfaces.ports[" + i + "].desired_configuration.base.routes[" + j + "]", "via", this.getSetting("network_interfaces.ports[" + i + "].current_configuration.base.routes[" + j + "].via"), { ip: this.ip} );
					config.reboot = true;
					await vscript.dispatch_change_request("network_interfaces.ports[" + i + "]", "save_config", "Click", { ip: this.ip} );
				}
			}
		}
		

		// If a reboot is requested,perform it
		if (config.reboot === true) {
			await vscript.reboot({ timeout: 120, ip: this.ip });
		}

		// Return 1 to indicate success (otherwise, -1)
		//this.verbose("Finished network_setup()...", 15);
		return 1;

	},

	/**
	* Setup function for the PTP agents
	* @param {object} config - The object containing the configuration parameters
	*/
	this.ptpSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running ptpSetup()...", 16);
		if(!this.READY) { await this.basics(config, ip, status); }
		
		let configAgents = this.allocatedIndicesConfig("p_t_p.agents");
		let liveAgents = await vscript.allocated_indices("p_t_p.agents", {ip: this.ip });
		for (let a of configAgents) {
			if (!liveAgents.includes(a)) {
				await vscript.dispatch_change_request("p_t_p", "create_agent", "Click", { ip: this.ip} );
				await vscript.pause_ms(250);
			}
			await this.matchSetting("p_t_p.agents[" + a + "]", "hosting_port_command");
			await this.matchSetting("p_t_p.agents[" + a + "]", "domain_command");
			await this.matchSetting("p_t_p.agents[" + a + "]", "delay_req_routing_command");
			if (!this.runningIsNewerThan([1,8,294], true)) { await this.matchSetting("p_t_p.agents[" + a + "]", "utc_offsets"); }
		}
		
		let configCombinators = this.allocatedIndicesConfig("time_flows.combinators");
		let liveCombinators = await vscript.allocated_indices("time_flows.combinators", {ip: this.ip });
		for (let c of configCombinators) {
			if (!liveCombinators.includes(c)) {
				await vscript.create_table_row("time_flows.combinators", { desired_name: this.getSetting("time_flows.combinators[" + c + "]", "id"), desired_index: c, ip: this.ip} );
			} else {
				await vscript.rename_table_row("time_flows.combinators[" + c + "]", this.getSetting("time_flows.combinators[" + c + "]", "id"), {ip: this.ip});
			}
			await this.matchSetting("time_flows.combinators[" + c + "].inputs[0]", "source_command");
			await this.matchSetting("time_flows.combinators[" + c + "].inputs[1]", "source_command");
			await this.matchSetting("time_flows.combinators[" + c + "]", "quorum_command");
		}
		await this.matchSetting("p_t_p_clock", "input_command");

		//this.verbose("Finished ptpSetup()...", 20);
		return 1;
	},

	/**
	* Setup function for syslog server
	* @param {object} config - The object containing the configuration parameters
	*/
	this.syslogSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running syslogSetup()...", 21);
		if(!this.READY) { await this.basics(config, ip, status);	}
		
		//this.verbose("Setting up syslog " + config.syslog_server + " using port " + config.port);
		
		let promises = (this.allocatedIndicesConfig("network_interfaces.ports")).map(async i => {
			for (let j = 0; j < 2; j++) {
				await this.matchSetting("network_interfaces.ports[" + i + "].desired_syslog_configuration.syslog_servers[" + j + "]", "protocol");
				await this.matchSetting("network_interfaces.ports[" + i + "].desired_syslog_configuration.syslog_servers[" + j + "]", "address");
				await this.matchSetting("network_interfaces.ports[" + i + "].desired_syslog_configuration.syslog_servers[" + j + "]", "rebind_interval");
				await this.matchSetting("network_interfaces.ports[" + i + "].desired_syslog_configuration.syslog_servers[" + j + "]", "keep_alive");
			}
		});

		await Promise.all(promises);
		await vscript.dispatch_change_request("network_interfaces", "save_syslog_config", "Click", { ip: this.ip} );
		await vscript.pause_ms(500);

		//this.verbose("Finished syslogSetup()...", 25);

		return 1;
	},

	/**
	* Setup function for crossbar creation
	* @param {object} config - The object containing the configuration parameters
	*/
	this.crossbarSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running crossbarSetup()...", 26);
		if(!this.READY) { await this.basics(config, ip, status);	}

		for (let crossbarType of ["video_crossbar.pool", "a_v_crossbar.pool", "audio_crossbar.pool", "audio_crossbar.large"]) {
			let configCrossbars = this.allocatedIndicesConfig(crossbarType);
			let liveCrossbars = await vscript.allocated_indices(crossbarType, { ip: this.ip} );
			for (let c of configCrossbars) {
				if (!liveCrossbars.includes(c)) {
					await vscript.create_table_row(crossbarType, { desired_name: this.getSetting(crossbarType + "[" + c + "]", "id"), desired_index: c, ip: this.ip} );
				} else {
					await vscript.rename_table_row(crossbarType + "[" + c + "]", this.getSetting(crossbarType + "[" + c + "]", "id"), { ip: this.ip});
				}
				await this.matchSetting(crossbarType + "[" + c + "]", "num_inputs");
				await this.matchSetting(crossbarType + "[" + c + "]", "num_outputs");
				await this.matchSetting(crossbarType + "[" + c + "]", "cross_fade");
			}
		}

		//this.verbose("Finished crossbarSetup()...", 35);
		return 1;
	},

	/**
	* Setup function for SDI output setup
	* @param {object} config - The object containing the configuration parameters
	*/
	this.sdiSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running sdiSetup()...", 36);
		if(!this.READY) { await this.basics(config, ip, status); }
		
		if (await vscript.read("i_o_module.info", "version", { ip: this.ip }) == "") { // No IO module on live card
			return -1;
		}
		
		let config2216 = this.allocatedIndicesConfig("i_o_module.configuration");
		let configInputs = this.allocatedIndicesConfig("i_o_module.input");
		let configOutputs = this.allocatedIndicesConfig("i_o_module.output");
		let live2216 = await vscript.allocated_indices("i_o_module.configuration", { ip: this.ip });
		let liveInputs = await vscript.allocated_indices("i_o_module.input", { ip: this.ip });
		let liveOutputs = await vscript.allocated_indices("i_o_module.output", { ip: this.ip });

		if (live2216.length > 0 && config2216.length > 0) { // Config and live 
			for (let s of live2216) {
				await this.matchSetting("i_o_module.configuration[" + s + "]", "direction");
			}
		} else if ((liveInputs.length !== configInputs.length) || (liveOutputs.length !== configOutputs.length)) { 
			return -1;
		}
		

		for (let i = 0; i < liveInputs.length; i++) {
			await vscript.write("i_o_module.input[" + liveInputs[i] + "].sdi.constraint", "standard_command", this.getSetting("i_o_module.input[" + configInputs[i] + "].sdi.constraint", "standard_command", ))
		}

		// for (let i = 0; i < Math.min(config.sdi.length, num_outs); i++) {
		let promises = [...Array(Math.min(config.sdi.length, num_outs)).keys()].map(async i => {
			await this.write("i_o_module.output[" + config.sdi[i].index + "].sdi.constraint", "standard_command", config.sdi[i].standard, { ip: this.ip });

			let sub_promises = [...Array(4).keys()].map(async j => {
				await this.write("i_o_module.output[" + config.sdi[i].index + "].sdi.audio_control.group_enable[" + j + "]", "group_command", config.sdi[i].audio, { ip: this.ip });
			});
			await Promise.all(sub_promises);
		});
		await Promise.all(promises);

		//this.verbose("Finished sdiSetup()...", 40);
		return 1;
	},

	/**
	* Setup function for video transmitter setup
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.transmitters - Array containing one or more transmitter configuration objects
	* @param {number} config.transmitters[].pri_port - The port number for the primary output port
	* @param {number} config.transmitters[].sec_port - The port number for the secondary output port
	* @param {string} config.transmitters[].pri_mc - The multicast address and port for the primary port; "A.B.C.D:X"
	* @param {string} config.transmitters[].sec_mc - The multicast address and port for the secondary port; "A.B.C.D:X"
	* @param {string} config.transmitters[].format - The stream format; "ST2022_6", "ST2110_GPM", "ST2110_BPM", "ST2042_raw"
	* @param {string} config.transmitters[].audio - The audio mode to set; "Ember", "Off", "Bypass"
	* @param {string} config.transmitters[].constr_format - The constraints format setting "HD1080i50" "HD1080p50" etc.
	* @param {string} config.transmitters[].constr_bandwith - The constaints max bandwidth "b3_0Gb" "b1_5Gb" "b12_0Gb"
	* @param {number} config.transmitters[].payload - The payload ID
	* @param {boolean} config.transmitters[].reserve_uhd - True to enable UHD support for the transmitter
	*/
	this.videoTransmitterSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running videoTransmitterSetup()...", 41);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for videoTransmitterSetup");
			return -1;
		}
		if (config.hasOwnProperty("video_transmitter_config")) { config = config.video_transmitter_config; }
		
		let is_1_8 = await this.runningIsNewerThanOrSameAs([1,8,0]);
		for (let i = 0; i < config.transmitters.length; i++) {
			await this.write("video_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[" + config.transmitters[i].pri_port + "].virtual_interfaces[0]", { ip: this.ip });
			await vscript.dispatch_change_request("video_transmitter.transmitter_assignment", "create_transmitter", "Click", { ip: this.ip} );
		}
		let promises = [...Array(config.transmitters.length).keys()].map(async i => {
			let p = i; // TODO: Dynamically set p based on existing indices and the newly created one
			
			if (config.transmitters[i].hasOwnProperty("sec_port")) {
				await vscript.dispatch_change_request("video_transmitter.pool[" + p + "]", "add_new_output", "Click", { ip: this.ip} );
			}
			await vscript.pause_ms(250);

			// Set the audio group controls (Embed, Bypass, Off)
			for (let j = 0; j < 4; j++) {
				await this.write("video_transmitter.pool[" + p + "].audio_control.group_enable[" + j + "]", "group_command", config.transmitters[i].audio, { ip: this.ip });
			}

			await this.write("video_transmitter.pool[" + p + "]", "transport_format_command", config.transmitters[i].format, { ip: this.ip });

			// new
			if (config.transmitters[i].hasOwnProperty("constr_format")) {
				await this.write("video_transmitter.pool[" + p + "].constraints", "standard_command", config.transmitters[i].constr_format, { ip: this.ip });
			}
			if (config.transmitters[i].hasOwnProperty("constr_bandwith")) {
				await this.write("video_transmitter.pool[" + p + "].constraints", "max_bandwidth_command", config.transmitters[i].constr_bandwith, { ip: this.ip });
			}
			if (config.transmitters[i].hasOwnProperty("reserve_uhd") && config.transmitters[i].reserve_uhd === true) {
				await this.write("video_transmitter.pool[" + p + "].constraints", "reserve_uhd_resources_command", true, { ip: this.ip });
			}
			//

			await this.write("video_transmitter.pool[" + p + "].output_port[0]", "mc_address_command", config.transmitters[i].pri_mc, { ip: this.ip });
			if (config.transmitters[i].hasOwnProperty("payload")) {
				await this.write("video_transmitter.pool[" + p + "].output_port[0]", "payload_type_command", config.transmitters[i].payload, { ip: this.ip });
			}
			if (!is_1_8) { await this.write("video_transmitter.pool[" + p + "].output_port[0]", "active_command", true, { ip: this.ip }); }
			if (config.transmitters[i].hasOwnProperty("sec_port")) {
				await this.write("video_transmitter.pool[" + p + "].output_port[1]", "interface_command", "network_interfaces.ports[" + config.transmitters[i].sec_port + "].virtual_interfaces[0]", { ip: this.ip });
				await this.write("video_transmitter.pool[" + p + "].output_port[1]", "mc_address_command", config.transmitters[i].sec_mc, { ip: this.ip });
				if (config.transmitters[i].hasOwnProperty("payload")) {
					await this.write("video_transmitter.pool[" + p + "].output_port[1]", "payload_type_command", config.transmitters[i].payload, { ip: this.ip });
				}
				if(!is_1_8) { await this.write("video_transmitter.pool[" + p + "].output_port[1]", "active_command", true, { ip: this.ip }); }
			}
			await this.write("video_transmitter.pool[" + p + "]", "active_command", true, { ip: this.ip });
		});
		await Promise.all(promises);
		//this.verbose("Finished videoTransmitterSetup()...", 50);
		return 1;
	},

	/**
	* Setup function for audio transmitter setup
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.transmitters - Array containing one or more transmitter configuration objects
	* @param {number} config.transmitters[].pri_port - The port number for the primary output port
	* @param {number} config.transmitters[].sec_port - The port number for the secondary output port
	* @param {string} config.transmitters[].pri_mc - The multicast address and port for the primary port; "A.B.C.D:X"
	* @param {string} config.transmitters[].sec_mc - The multicast address and port for the secondary port; "A.B.C.D:X"
	* @param {string} config.transmitters[].format - The stream format; "L16", "L24", "AM824"
	* @param {string} config.transmitters[].packet_time - The stream packet time; "p0_125" - "p1"
	* @param {number} config.transmitters[].num_channels - The number of audio channels in the stream
	* @param {number} config.transmitters[].payload - The payload ID
	*/
	this.audioTransmitterSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running audioTransmitterSetup()...", 51);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for audioTransmitterSetup");
			return -1;
		}
		if (config.hasOwnProperty("audio_transmitter_config")) { config = config.audio_transmitter_config; }
		
		let is_1_8 = await this.runningIsNewerThanOrSameAs([1,8,0]);
		let promises = [...Array(config.transmitters.length).keys()].map(async i => {
			let p = i; // TODO: Dynamically set p based on existing indices and the newly created one
			await this.write("audio_transmitter.transmitter_assignment", "interface_command", "network_interfaces.ports[" + config.transmitters[i].pri_port + "].virtual_interfaces[0]", { ip: this.ip });
			await vscript.dispatch_change_request("audio_transmitter.transmitter_assignment", "create_transmitter", "Click", { ip: this.ip} );
			if (config.transmitters[i].hasOwnProperty("sec_port")) { await vscript.dispatch_change_request("audio_transmitter.pool[" + p + "]", "add_new_output", "Click", { ip: this.ip} ); }
			await vscript.pause_ms(250);

			await this.write("audio_transmitter.pool[" + p + "]", "format_command", config.transmitters[i].format, { ip: this.ip });
			await this.write("audio_transmitter.pool[" + p + "]", "packet_time_command", config.transmitters[i].packet_time, { ip: this.ip });
			await this.write("audio_transmitter.pool[" + p + "]", "num_channels_command", config.transmitters[i].num_channels, { ip: this.ip });
			if (config.transmitters[i].hasOwnProperty("payload")) {
				await this.write("audio_transmitter.pool[" + p + "].output_port[0]", "payload_type_command", config.transmitters[i].payload, { ip: this.ip });
			}
			await this.write("audio_transmitter.pool[" + p + "].output_port[0]", "mc_address_command", config.transmitters[i].pri_mc, { ip: this.ip });
			if (!is_1_8) { await this.write("audio_transmitter.pool[" + p + "].output_port[0]", "active_command", true, { ip: this.ip }); }
			if (config.transmitters[i].hasOwnProperty("sec_port")) {
				await this.write("audio_transmitter.pool[" + p + "].output_port[1]", "interface_command", "network_interfaces.ports[" + config.transmitters[i].sec_port + "].virtual_interfaces[0]", { ip: this.ip });
				await this.write("audio_transmitter.pool[" + p + "].output_port[1]", "ip_src_ip_addr_command", config.addresses[config.transmitters[i].sec_port], { ip: this.ip });
				await this.write("audio_transmitter.pool[" + p + "].output_port[1]", "mc_address_command", config.transmitters[i].sec_mc, { ip: this.ip });
				if (config.transmitters[i].hasOwnProperty("payload")) {
					await this.write("audio_transmitter.pool[" + p + "].output_port[1]", "payload_type_command", config.transmitters[i].payload, { ip: this.ip });
				}
				if (!is_1_8) { await this.write("audio_transmitter.pool[" + p + "].output_port[1]", "active_command", true, { ip: this.ip }); }
			}

			await this.write("audio_transmitter.pool[" + p + "]", "active_command", true, { ip: this.ip });
		});
		await Promise.all(promises);

		//this.verbose("Finished audioTransmitterSetup()...", 60);
		return 1;
	},

	/**
	* Setup function for RTP receiver setup
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.error_handlers - An array of key/value pairs, describing the error IDs and the desired state for each
	* @param {object[]} config.receivers - Array containing one or more receiver session configuration objects
	* @param {number} config.receivers[].pri_port - The port number for the primary input port
	* @param {number} config.receivers[].sec_port - The port number for the secondary input port
	* @param {number} config.receivers[].num_video - The number of video receivers for this session
	* @param {number} config.receivers[].num_audio - The number of audio receivers for this session
	* @param {number} config.receivers[].audio_ch - The maximum number of audio channels in the stream
	* @param {string} config.receivers[].switch_type - The stream switch mode; "BBM" | "MBB"
	* @param {number} config.receivers[].switch_time - The stream switch time; 1 for dirty, 2 for auto, other value for control system managed
	* @param {boolean} config.receivers[].vc2 - Boolean indicating if VC-2 (ST2042) decoding should be enabled on this receiver
	* @param {boolean} config.receivers[].uhd_singlelink - Boolean indicating if UHD singlelink (ST2110 only) support should be enabled on this receiver
	* @param {boolean} config.receivers[].uhd_2si - Boolean indicating if UHD sample interleaved (ST2110 only) support should be enabled on this receiver
	*/
	this.rtpReceiverSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running rtpReceiverSetup()...", 61);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for rtpReceiverSetup");
			return -1;
		}
		if (config.hasOwnProperty("rtp_receiver_config")) { config = config.rtp_receiver_config; }
		

		// For 1.8 onwards
		if (await this.runningIsNewerThanOrSameAs([1,8,0])) {
			if (config.hasOwnProperty("error_handlers")) {
				for (let err_id in config.error_handlers) {
					await this.write("r_t_p_receiver.error_handling", err_id, config.error_handlers[err_id], { ip: this.ip });
				}
			}

			for (let i = 0; i < config.receivers.length; i++) {
				let s = await this.createNewRow("r_t_p_receiver.sessions");
				await this.write("r_t_p_receiver.sessions[" + s + "].interfaces", "primary_command", "network_interfaces.ports[" + config.receivers[i].pri_port + "].virtual_interfaces[0]", { ip: this.ip });
				if (config.receivers[i].hasOwnProperty("sec_port")) {
					await this.write("r_t_p_receiver.sessions[" + s + "].interfaces", "secondary_command", "network_interfaces.ports[" + config.receivers[i].sec_port + "].virtual_interfaces[0]", { ip: this.ip });
				}
				await this.write("r_t_p_receiver.sessions[" + s + "]", "switch_time_command", config.receivers[i].switch_time, { ip: this.ip });
				await this.write("r_t_p_receiver.sessions[" + s + "]", "switch_type_command", "DTS_" + config.receivers[i].switch_type, { ip: this.ip });

				for (let j = 0; j < config.receivers[i].num_video; j++) {
					let v = await this.createNewRow("r_t_p_receiver.video_receivers");
					await this.write("r_t_p_receiver.video_receivers[" + v + "].generic", "hosting_session_command", "r_t_p_receiver.sessions[" + s + "]", { ip: this.ip });
				}
				for (let j = 0; j < config.receivers[i].num_audio; j++) {
					let a = await this.createNewRow("r_t_p_receiver.audio_receivers");
					await this.write("r_t_p_receiver.audio_receivers[" + a + "].generic", "hosting_session_command", "r_t_p_receiver.sessions[" + s + "]", { ip: this.ip });
				}

				let audio_promises = [...Array(config.receivers[i].num_audio).keys()].map(async j => {
					let a = await vscript.read("r_t_p_receiver.sessions[" + s + "].audio_receivers[" + j + "]", "wrapped_reference", { ip: this.ip} );
					await this.write(a + ".audio_specific", "channel_capacity_command", config.receivers[i].audio_ch, { ip: this.ip });
				});
				await Promise.all(audio_promises);

				let video_promises = [...Array(config.receivers[i].num_video).keys()].map(async j => {
					let v = await vscript.read("r_t_p_receiver.sessions[" + s + "].video_receivers[" + j + "]", "wrapped_reference", { ip: this.ip} );
					await this.write(v + ".generic.timing", "read_delay_preference", "AsEarlyAsPossible", { ip: this.ip });
					await this.write(v + ".generic.timing", "phase_reference_command", "TimeSource", { ip: this.ip });
					await this.write(v + ".generic.timing", "time_source_command", "genlock.output", { ip: this.ip });
					if (config.receivers[i].hasOwnProperty("uhd_singlelink") && config.receivers[i].uhd_singlelink === true) {
						await this.write(v + ".video_specific.capabilities", "supports_uhd_2110_singlelink_command", true);
					}
					if (config.receivers[i].hasOwnProperty("uhd_2si") && config.receivers[i].uhd_2si === true) {
						await this.write(v + ".video_specific.capabilities", "supports_uhd_sample_interleaved_command", true);
					}
					if (config.receivers[i].hasOwnProperty("vc2") && config.receivers[i].vc2 === true) {
						await this.write(v + ".video_specific.capabilities", "supports_st_2042_command", true);
					}
				});
				await Promise.all(video_promises);

				await this.write("r_t_p_receiver.sessions[" + s + "]", "active_command", true, { ip: this.ip });
			}
		}

		// For versions prior to 1.8
		else {
			for (let i = 0; i < config.receivers.length; i++) {
				await vscript.dispatch_change_request("r_t_p_receiver", "create_session", "Click", { ip: this.ip} );
				await vscript.pause_ms(250);
				await this.write("r_t_p_receiver.sessions[" + i + "]", "num_video_receivers_command", config.receivers[i].num_video, { ip: this.ip });
				await this.write("r_t_p_receiver.sessions[" + i + "]", "num_audio_receivers_command", config.receivers[i].num_audio, { ip: this.ip });
			}

			for (let err_id in config.error_handlers) {
				await this.write("r_t_p_receiver.error_handling", err_id, config.error_handlers[err_id], { ip: this.ip });
			}

			let promises = [...Array(config.receivers.length).keys()].map(async i => {
				// for (let i = 0; i < config.receivers.length; i++) {
				let s = i;

				let sub_promises = [...Array(config.receivers[i].num_audio).keys()].map(async j => {
					let aud_rec = await vscript.read("r_t_p_receiver.sessions[" + s + "].audio_receivers[" + j + "]", "wrapped_reference", { ip: this.ip} );
					await this.write(aud_rec + ".audio_specific", "channel_capacity_command", config.receivers[i].audio_ch, { ip: this.ip });
				});
				await Promise.all(sub_promises);

				await this.write("r_t_p_receiver.sessions[" + s + "]", "switch_time_command", config.receivers[i].switch_time, { ip: this.ip });
				await this.write("r_t_p_receiver.sessions[" + s + "]", "switch_type_command", "DTS_" + config.receivers[i].switch_type, { ip: this.ip });
				await this.write("r_t_p_receiver.sessions[" + s + "]", "primary_interface_command", "network_interfaces.ports[" + config.receivers[i].pri_port + "].virtual_interfaces[0]", { ip: this.ip });
				if (config.receivers[i].hasOwnProperty("sec_port")) { await this.write("r_t_p_receiver.sessions[" + s + "]", "secondary_interface_command", "network_interfaces.ports[" + config.receivers[i].sec_port + "].virtual_interfaces[0]", { ip: this.ip }); }

				sub_promises = [...Array(config.receivers[i].num_video).keys()].map(async j => {
					let vid_rec = await vscript.read("r_t_p_receiver.sessions[" + s + "].video_receivers[" + j + "]", "wrapped_reference", { ip: this.ip} );
					await this.write(vid_rec + ".video_specific.phase", "relative_to_command", "genlock.output", { ip: this.ip });
				});
				await Promise.all(sub_promises);

				await this.write("r_t_p_receiver.sessions[" + i + "]", "active_command", true, { ip: this.ip });
			});
			await Promise.all(promises);
		}

		//this.verbose("Finished rtpReceiverSetup()...", 70);
		return 1;
	},

	/**
	* Setup function for video delay handlers
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.delays - Array containing one or more delay handler configuration objects
	* @param {string} config.delays[].mode - The delay handler output mode; "FrameSync_Freeze", "FrameSync_Black", "FramePhaser"
	* @param {string} config.delays[].standard - The video standard for memory allocation; "HD1080p50" etc.
	* @param {string} config.delays[].name - The name for the delay handler instance
	*/
	this.videoDelaySetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running videoDelaySetup()...", 71);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for videoDelaySetup");
			return -1;
		}
		if (config.hasOwnProperty("video_delay_config")) { config = config.video_delay_config; }
		
		// let alloc = await vscript.allocated_indices("delay_handler.video.pool", this.ip)
		// while (alloc.length < config.delays.length) {
		// alloc = await vscript.allocated_indices("delay_handler.video.pool", this.ip)
		// }

		let promises = [...Array(config.delays.length).keys()].map(async i => {
			await vscript.dispatch_change_request("delay_handler.video", "create_delay", "Click", { ip: this.ip} );
			await vscript.pause_ms(250);
			await this.write("delay_handler.video.pool[" + i + "]", "id_command", config.delays[i].name, { ip: this.ip });
			await this.write("delay_handler.video.pool[" + i + "]", "num_outputs", 1, { ip: this.ip });
			await this.write("delay_handler.video.pool[" + i + "].allocate", "frames_command", 0, {
				payload_validator: (res) => { return res > 0; },
				ip: this.ip
			});
			await this.write("delay_handler.video.pool[" + i + "].allocate", "standard_command", config.delays[i].standard, { ip: this.ip });
			await this.write("delay_handler.video.pool[" + i + "].allocate", "delay_mode_command", config.delays[i].mode, { ip: this.ip });
			await this.write("delay_handler.video.pool[" + i + "].outputs[0].delay", "frames_command", 0, {					
				payload_validator: (res) => { return res > 0; },
				ip: this.ip
			});
		});
		await Promise.all(promises);

		//this.verbose("Finished videoDelaySetup()...", 75);
		return 1;
	},

	/**
	* Setup function for audio delay handlers
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.delays - Array containing one or more delay handler configuration objects
	* @param {string} config.delays[].name - The name for the delay handler instance
	* @param {number} config.delays[].num_channels - The number of audio channels in the input
	* @param {string} [config.delays[].frequency] - The delay handler frequency; default: "F48000" | "F96000"
	* @param {number} [config.delays[].alloc_time] - Memory to allocate, in nanoseconds
	* @param {number} [config.delays[].delay_time] - Delay to set, in nanoseconds
	*/
	this.audioDelaySetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running audioDelaySetup()...", 76);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for audioDelaySetup");
			return -1;
		}
		if (config.hasOwnProperty("audio_delay_config")) { config = config.audio_delay_config; }
		
		// let alloc = await vscript.allocated_indices("delay_handler.audio.pool", { ip: this.ip} );
		// while (alloc.length < config.delays.length) {
		// 	await vscript.dispatch_change_request("delay_handler.audio", "create_delay", "Click", { ip: this.ip} );
		// 	await vscript.pause_ms(250);
		// 	alloc = await vscript.allocated_indices("delay_handler.audio.pool", { ip: this.ip} );
		// }

		let promises = [...Array(config.delays.length).keys()].map(async i => {
			await vscript.dispatch_change_request("delay_handler.audio", "create_delay", "Click", { ip: this.ip });
			await vscript.pause_ms(250);
			await this.write("delay_handler.audio.pool[" + i + "]", "id_command", config.delays[i].name, { ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "]", "num_outputs", 1, { ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "].allocate", "frequency_command", (config.delays[i].hasOwnProperty("frequency") ? config.delays[i].frequency : "F48000"), { ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "].allocate", "mode_command", "Time", { ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "].allocate", "time_command", (config.delays[i].hasOwnProperty("alloc_time") ? config.delays[i].alloc_time : 1000000000), { 				
				payload_validator: (res) => { return res > 0; },
				ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "].outputs[0].delay", "mode_command", "Time", { ip: this.ip });
			await this.write("delay_handler.audio.pool[" + i + "].outputs[0].delay", "time_command", (config.delays[i].hasOwnProperty("delay_time") ? config.delays[i].delay_time : 1000000), { 				
				payload_validator: (res) => { return res > 0; },
				ip: this.ip });
		});
		await Promise.all(promises);

		//this.verbose("Finished audioDelaySetup()...", 80);
		return 1;
	},

	/**
	* Setup function for audio SRC handlers
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.srcs - Array containing one or more SRC handler configuration objects
	* @param {string} config.srcs[].name - The name for the SRC handler instance
	* @param {string} config.srcs[].channels - The channels to SRC; default: "None" | "Ch_0_15" | "Ch_16_31" | "Ch_32_47" | "Ch_48_63" | "Ch_64_79"
	*/
	this.audio_src_setup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running audio_src_setup()...", 76);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for audio_src_setup");
			return -1;
		}
		if (config.hasOwnProperty("audio_src_config")) { config = config.audio_src_config; }

		let promises = [...Array(config.srcs.length).keys()].map(async i => {
			await vscript.dispatch_change_request("audio_src_handler", "create_src", "Click", { ip: this.ip });
			await vscript.pause_ms(250);
			await this.write("audio_src_handler.pool[" + i + "]", "id_command", config.srcs[i].name, { ip: this.ip });
			await this.write("audio_src_handler.pool[" + i + "].settings", "src", config.src[i].channels, { ip: this.ip });
		});
		await Promise.all(promises);

		//this.verbose("Finished audio_src_setup()...", 80);
		return 1;
	},

	this.routing_commands = {
		video: {
			source: {
				rtp_receiver: 		{ kwl: "r_t_p_receiver.sessions[{0}].video_receivers[{1}]", kw: "wrapped_reference", addon: ".video_specific.output.video"},
				a_v_crossbar: 		{ kwl: "a_v_crossbar.pool[{0}].outputs[{1}].output.video"},
				video_crossbar: 	{ kwl: "video_crossbar.pool[{0}].outputs[{1}].output"},
				io_module: 			{ kwl: "i_o_module.input[{1}].sdi.output.video"},
				video_delay:		{ kwl: "delay_handler.video.pool[{0}].outputs[{1}].output"},
			},
			target: {
				video_transmitter: 	{ kwl: "video_transmitter.pool[{0}].vid_source", command: "v_src_command"},
				io_module: 			{ kwl: "i_o_module.output[{0}].sdi.vid_src", command: "v_src_command"},
				a_v_crossbar: 		{ kwl: "a_v_crossbar.pool[{0}].inputs[{1}].source", command: "video_command"},
				video_crossbar: 	{ kwl: "video_crossbar.pool[{0}].inputs[{1}]", command: "source_command"},
				video_delay:		{ kwl: "delay_handler.video.pool[{0}].inputs[{1}]", command: "source_command"},
			}
		},
		audio: {
			source: {
				rtp_receiver: 		{ kwl: "r_t_p_receiver.sessions[{0}].audio_receivers[{1}]", kw: "wrapped_reference", addon: ".audio_specific.output"},
				a_v_crossbar:		{ kwl: "a_v_crossbar.pool[{0}].outputs[{1}].output.audio"},
				audio_crossbar: 	{ kwl: "audio_crossbar.large[{0}].outputs[{1}].output"},
				io_module: 			{ kwl: "i_o_module.input[{1}].sdi.output.audio"},
				audio_delay:		{ kwl: "delay_handler.audio.pool[{0}].outputs[{1}].output"},
			},
			target: {
				video_transmitter: 	{ kwl: "video_transmitter.pool[{0}].audio_control", command: "source_command"},
				audio_transmitter: 	{ kwl: "audio_transmitter.pool[{0}]", command: "source_command"},
				io_module: 			{ kwl:"i_o_module.output[{0}].sdi.audio_control", command: "source_command"},
				a_v_crossbar: 		{ kwl: "a_v_crossbar.pool[{0}].inputs[{1}].source", command: "audio_command"},
				audio_crossbar: 	{ kwl: "audio_crossbar.large[{0}].inputs[{1}]", command: "source_command"},
				audio_delay:		{ kwl: "delay_handler.audio.pool[{0}].inputs", command: "source_command"},
			}
		}
	};

	this.webRouting = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running webRouting()...", 81);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for webRouting");
			return 1;
		}
		if (config.hasOwnProperty("webRouting_config")) { config = config.webRouting_config; }

		for (let r of config.routes) {
			let target = this.routing_commands[r.signal_type].target[r.target_type].kwl;
			target = target.replace("{0}", r.target_idx).replace("{1}", r.target_endpoint_idx);
			let command = this.routing_commands[r.signal_type].target[r.target_type].command;
			let source = this.routing_commands[r.signal_type].source[r.source_type].kwl;
			source = source.replace("{0}", r.source_idx).replace("{1}", r.source_endpoint_idx);
			if (r.source_type === "rtp_receiver") {	
				let kw = this.routing_commands[r.signal_type].source[r.source_type].kw;
				let addon = this.routing_commands[r.signal_type].source[r.source_type].addon;
				source = await vscript.read(source, kw, { ip: this.ip }) + addon; 
			}
			await this.write(target, command, source, { ip: this. ip});
		}
		
		return 1;
	},


	/**
	* Setup function for routing
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.routes - Array containing one or more routes
	* @param {string} config.routes[].target - The target of the route
	* @param {string} config.routes[].source - The source of the route
	* @param {number} [config.routes[].num_channels] - The number of audio channels; required for audio targets
	*/
	this.routing = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running routing()...", 81);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for routing");
			return 1;
		}
		if (config.hasOwnProperty("routing_config")) { config = config.routing_config; }
		
		let num_outs = (await vscript.allocated_indices("i_o_module.output", this.ip)).length;
		// for (let r of config.routes) {
		let promises = config.routes.map(async r => {
			if (r.hasOwnProperty("source") && r.hasOwnProperty("target")) {
				let c;
				let kwl = r.target.split(".");
				if (["i_o_module"].includes(kwl[0])) {
					if (num_outs == 0) {
						this.debug("No SDI IO on this card! " + String(r.target));
						return;
					}
					if (["audio_control"].includes(kwl[3])) {
						c = "source_command";
					} else if (["vid_src"].includes(kwl[3])) {
						c = "v_src_command";
					}
				} else if (["video_transmitter"].includes(kwl[0])) {
					if (["vid_source"].includes(kwl[2])) {
						c = "v_src_command";
					} else if (["audio_control"].includes(kwl[2])) {
						c = "source_command";
					}
				} else if (["multiviewer"].includes(kwl[0])) {
					if (["audio"].includes(kwl[3])) {
						c = "a_src_command";
						r.target = r.target.split(".").slice(0, 3).join(".");
					} else if (["video"].includes(kwl[3])) {
						c = "v_src_command";
						r.target = r.target.split(".").slice(0, 3).join(".");
					} else {
						this.debug("Multiviewer needs .audio or .video!");
					}
				} else if (["audio_transmitter", "video_crossbar", "delay_handler"].includes(kwl[0])) {
					c = "source_command";
				} else if (["audio_crossbar"].includes(kwl[0])) {
					if (r.hasOwnProperty("num_channels")) {
						c = "source_command";
						await this.write(r.target, "num_channels", r.num_channels, { ip: this.ip });
					} else {
						this.debug("Number of channels not defined: " + r.target);
						return;
					}
				} else if (kwl[0] == "a_v_crossbar") {
					if (["audio", "video"].includes(kwl[4])) {
						c = kwl[4] + "_command";
						r.target = r.target.split(".").slice(0, 4).join(".");
					} else {
						this.debug("AV Crossbar needs .audio or .video! " + r.target);
					}
				} else {
					this.debug("Unknown target type: " + r.target);
					return;
				}
				let s;
				if (r.source.split(".")[0] == "r_t_p_receiver") {
					let rx = await vscript.read(r.source.split(".").slice(0, 3).join("."), "wrapped_reference", { ip: this.ip} );
					s = rx + "." + r.source.split(".").slice(3).join(".");
				} else { s = r.source; }
				if (r.source.split(".")[0] == "audio_crossbar") {
					if (r.hasOwnProperty("num_channels")) {
						await this.write(r.source.split(".").slice(0, 3).join("."), "num_channels", r.num_channels, { ip: this.ip });
					} else {
						this.debug("Number of channels not defined: " + r.source);
						return;
					}
				}
				await this.write(r.target, c, s, { ip: this.ip });
			} else {
				this.debug("Malformed route: " + r);
			}
		});
		await Promise.all(promises);
		//this.verbose("Finished routing()...", 85);
		return 1;
		
	},

	// Expected object format
	/* multiviewer_config: {
		heads: [
			{
				virtual_output: 0,
				physical_output: [0,0],
				standard: "HD1080p50",
				layout: { // To load a factory preset
					pattern_id: 4,
					update: {
						bgnd: true,
						border: true,
						umd: true,
						tally: true,
						ppm: true
					},
					keep_ar: true
				},
				global_settings: {
					tally_rules: {
						rule_0: {
							bit_id: 0,
							priority_id: 2,
							colour: {
								hue: 0,
								saturation: 0,
								lightness: 20,
								opacity: 100
							},
						},
						// repeat for rule_1 to rule_7
					},
					bgnd_colour: {
						hue: 0,
						saturation: 0,
						lightness: 20
					}
				},
				pips: [ // To set up custom settings for each pip
					{
						pip_index: 0,
						enable: true,
						keep_ar: false,
						filter_mode: "AUTO",
						geometry: {
							posx: 0,
							posy: 0,
							width: 512,
							height: 512,
							depth: 1
						},
						bgnd: {
							bgnd_colour: {
								hue: 0,
								saturation: 0,
								lightness: 20,
								opacity: 100
							},
							border: {
								width: 0,
								radius: 0,
								radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
								colour: {
									hue: 0,
									saturation: 0,
									lightness: 20,
									opacity: 100
								}
							}
						},
						video_crop: {
							left: 0,
							right: 0,
							top: 0,
							bottom: 0
						},
						video_border: {
							width: 0,
							radius: 0,
							radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
							colour: {
								hue: 0,
								saturation: 100,
								lightness: 100,
								opacity: 100
							}
						},
						left_ppm: {
							enable: true,
							channels_num: 2,
							alignment: "OUTSIDE", //INSIDE, OUTSIDE
							width: 9,
							opacity: 100,
							ppm: {
								display_mode: "ColourBars",// ColourBars, ColourBarsGradient, ColourLEDs, ColourLEDsGradient
								scale_position: "Left", //	Left, Right, LeftAndRight, None
								scale_size: 37,
								channel_spacing_size: 2,
								leds_size: 4,
								leds_spacing_size: 2,
								scale_type: "dBFS", // dBFS, DIN, Nordic, BBC
								bgnd: {
									bgnd_colour: {
										hue: 0,
										saturation: 0,
										lightness: 20,
										opacity: 100
									},
									border: {
										width: 0,
										radius: 0,
										radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
										colour: {
											hue: 0,
											saturation: 0,
											lightness: 20,
											opacity: 100
										}
									}
								},
								scale_settings: {
									peak_hold: "Off", //	Off, OneSecond, TwoSeconds, ThreeSeconds, FourSeconds
									peak_hold_decay: "Slow", //Off, Slow, Medium, Fast
									ppm_decay: "decay_20db_1_5s", //decay_Fast, decay_24db_2_8s, decay_20db_1_7s, decay_20db_1_5s
									d_b_f_s_range: {
										safe_area: 0,
										operation_area: -9,
										min_level: -61,
										max_level: 0
									},
									d_i_n_range: {
										//as d_b_f_s_range
									},
									nordic_range: {
										//as d_b_f_s_range
									},
									b_b_c_range: {
										//as d_b_f_s_range
									}
								}

							},
						},
						right_ppm: {
							// same as left_ppm!
						},
						umd: {
							enable: true,
							mode: "SINGLE", //	SINGLE, DUAL
							alignment: "OUTSIDE", // OUTSIDE, INSIDE
							width: 100,
							height: 10,
							bgnd: [ // 0, 1
								{
									bgnd_colour: {
										hue: 0,
										saturation: 0,
										lightness: 20,
										opacity: 100
									},
									border: {
										width: 0,
										radius: 0,
										radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
										colour: {
											hue: 0,
											saturation: 0,
											lightness: 20,
											opacity: 100
										}
									}
								}
							],
							label: [ // 0,1
								{
									string_default: "",
									string_user: "",
									colour: {
										hue: 0,
										saturation: 0,
										lightness: 20,
										opacity: 100
									},
									font: {
										font_style: "NORMAL" //NORMAL, ITALIC, BOLD, BOLD_ITALIC
									}
								}
							]
						},
						tally_lamps: {
							enable: true,
							width: 10,
							left_lamp: {
								bgnd_colour: {
										hue: 0,
										saturation: 0,
										lightness: 20,
										opacity: 100
									},
									border: {
										width: 0,
										radius: 0,
										radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
										colour: {
											hue: 0,
											saturation: 0,
											lightness: 20,
											opacity: 100
										}
									}
								},
							right_lamp: {
								// same as left_lamp
							}
						},
						tally_settings: {
							tally_mask: 0,
							bgnd_tally_rules_mask: 0,
							bgnd_border_tally_rules_mask: 0,
							video_border_tally_rules_mask: 0,
							umd_0_tally_rules_mask: 0,
							umd_0_border_tally_rules_mask: 0,
							umd_0_label_tally_rules_mask: 0,
							umd_1_tally_rules_mask: 0,
							umd_1_border_tally_rules_mask: 0,
							umd_1_label_tally_rules_mask: 0,
							left_lamp_tally_rules_mask: 0,
							left_lamp_border_tally_rules_mask: 0,
							right_lamp_tally_rules_mask: 0,
							right_lamp_border_tally_rules_mask: 0
						},
						signaling_settings: {
							input_signaling: {
								text_enable: false
							}
						}
					},
					// Repeat for every pip....
				],
				ppms: [
					{
						ppm_index: 0,
						enable: false,
						channels_num: 32,
						geometry: {
							posx: 0,
							posy: 0,
							width: 512,
							height: 512,
							depth: 1
						},
						ppm: {
							display_mode: "ColourBars",// ColourBars, ColourBarsGradient, ColourLEDs, ColourLEDsGradient
							scale_position: "Left", //	Left, Right, LeftAndRight, None
							scale_size: 37,
							channel_spacing_size: 2,
							leds_size: 4,
							leds_spacing_size: 2,
							scale_type: "dBFS", // dBFS, DIN, Nordic, BBC
							bgnd: {
								bgnd_colour: {
									hue: 0,
									saturation: 0,
									lightness: 20,
									opacity: 100
								},
								border: {
									width: 0,
									radius: 0,
									radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
									colour: {
										hue: 0,
										saturation: 0,
										lightness: 20,
										opacity: 100
									}
								}
							},
							scale_settings: {
								peak_hold: "Off", //	Off, OneSecond, TwoSeconds, ThreeSeconds, FourSeconds
								peak_hold_decay: "Slow", //Off, Slow, Medium, Fast
								ppm_decay: "decay_20db_1_5s", //decay_Fast, decay_24db_2_8s, decay_20db_1_7s, decay_20db_1_5s
								d_b_f_s_range: {
									safe_area: 0,
									operation_area: -9,
									min_level: -61,
									max_level: 0
								},
								d_i_n_range: {
									//as d_b_f_s_range
								},
								nordic_range: {
									//as d_b_f_s_range
								},
								b_b_c_range: {
									//as d_b_f_s_range
								}
							}
						}
					}
					// Repeat
				],
				analog_clocks: [
					{
						clock_index: 0,
						enable: false,
						theme: 0,
						geometry: {
							posx: 0,
							posy: 0,
							width: 512,
							height: 512,
							depth: 10
						},
						time_settings: {
							t_src: "genlock.output",
							timecode_select: "LTC", //LTC, VTC1, VTC2
							countdown_enable: false,
							timezone_offset: {
								seconds: 0,
								minutes: 0,
								hours: 0
							},
							countdown_time: {
								seconds: 0,
								minutes: 0,
								hours: 0
							}
						}
					},
					//Repeat (0-3)
				],
				digital_clocks: [
					{
						clock_index: 0,
						enable: false,
						show_frames: false,
						geometry: {
							posx: 0,
							posy: 0,
							width: 512,
							height: 512,
							depth: 10
						},
						time_settings: {
							t_src: "genlock.output",
							timecode_select: "LTC", //LTC, VTC1, VTC2
							countdown_enable: false,
							timezone_offset: {
								seconds: 0,
								minutes: 0,
								hours: 0
							},
							countdown_time: {
								seconds: 0,
								minutes: 0,
								hours: 0
							}
						},
						bgnd: {
							bgnd_colour: {
								hue: 0,
								saturation: 0,
								lightness: 20,
								opacity: 100
							},
							border: {
								width: 0,
								radius: 0,
								radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
								colour: {
									hue: 0,
									saturation: 0,
									lightness: 20,
									opacity: 100
								}
							}
						},
						digit_font_colour: {
							hue: 0,
							saturation: 100,
							lightness: 100,
							opacity: 100
						},
						digit_font: {
							font_style: "NORMAL" //NORMAL, ITALIC, BOLD, BOLD_ITALIC
						},
						digit_bgnd_colour: {
							hue: 0,
							saturation: 100,
							lightness: 100,
							opacity: 100
						}
					},
					// repeat (0-3)
				],
				text_boxes: [
					{
						box_index: 0,
						enable: true,
						flash_speed: 0,
						geometry: {
							posx: 0,
							posy: 0,
							width: 512,
							height: 512,
							depth: 10
						},
						bgnd: {
							bgnd_colour: {
								hue: 0,
								saturation: 0,
								lightness: 20,
								opacity: 100
							},
							border: {
								width: 0,
								radius: 0,
								radius_corners: "All", //All, Top, Bottom, Left, Right, TopLeft, TopRight, BottomLeft, BottomRight
								colour: {
									hue: 0,
									saturation: 0,
									lightness: 20,
									opacity: 100
								}
							}
						},
						label: {
							string_default: "",
							colour: {
								hue: 0,
								saturation: 0,
								lightness: 20,
								opacity: 100
							},
							font: {
								font_style: "NORMAL" //NORMAL, ITALIC, BOLD, BOLD_ITALIC
							}
						},
						flash_bgnd_colour: {
							hue: 0,
							saturation: 0,
							lightness: 20,
							opacity: 100
						},
						flash_label_colour: {
							hue: 0,
							saturation: 0,
							lightness: 20,
							opacity: 100
						},

					}
				]
			}
		]
	}
	*/

	/**
	* Setup function for multiviewer heads
	* @param {object} config - The object containing the configuration parameters
	* @param {object[]} config.heads - Array containing one or more multiviewer heads (full example of structure in code comments)
	* @param {number} config.heads[].virtual_output - The virtual output to configure
	* @param {number[]} [config.heads[].physical_output] - The physical output quad to use; [physical_output, quad]
	* @param {string} [config.heads[].standard] - The video standard for the output; "HD1080p50" etc.
	*
	* @param {object} [config.heads[].layout] - Will recall a factory layout to the head
	* @param {number} [config.heads[].layout.pattern_id] - The pattern ID to recall
	* @param {boolean} [config.heads[].layout.keep_ar] - Set keep_ar to true|false for the recall
	* @param {object} [config.heads[].layout.update] - Object with keys representing the optional recall parameters (bgnd, border, etc.) and boolean values true|false to control recall of this parameter
	*
	* @param {object} [config.heads[].global_settings] - Object containing parameters in same structure as in web GUI; {tally_rules: {rule_0 {bit_id: 0, priority_id: 2}}}
	*
	* @param {object[]} [config.heads[].pips] - Array of objects containing configuration for individual PIPs; other than pip_index all parameters follow the web GUI structure
	* @param {number} config.heads[].pips.pip_index - The index of the PIP; 0-63
	*
	* @param {object[]} [config.heads[].ppms] - Array of objects containing configuration for individual PPMS; other than ppm_index all parameters follow the web GUI structure
	* @param {number} config.heads[].ppms.ppm_index - The index of the PPM; 0-7
	*
	* @param {object[]} [config.heads[].analog_clocks] - Array of objects containing configuration for individual analog_clocks; other than pip_index all parameters follow the web GUI structure
	* @param {number} config.heads[].analog_clocks.clock_index - The index of the analog_clock; 0-4
	*
	* @param {object[]} [config.heads[].digital_clocks] - Array of objects containing configuration for individual digital_clocks; other than pip_index all parameters follow the web GUI structure
	* @param {number} config.heads[].digital_clocks.clock_index - The index of the digital_clock; 0-4
	*
	* @param {object[]} [config.heads[].text_boxes] - Array of objects containing configuration for individual text_boxes; other than pip_index all parameters follow the web GUI structure
	* @param {number} config.heads[].text_boxes.box_index - The index of the text_boxe; 0-15
	*/

	this.multiviewerSetup = async function (config, ip = this.ip, status = null) {
		//this.verbose("Running multiviewerSetup()...", 86);
		if(!this.READY) { await this.basics(config, ip, status);	}
		if (typeof config === "undefined") {
			//this.verbose("No config entered for multiviewerSetup");
			return -1;
		}
		if (config.hasOwnProperty("multiviewer_config")) { config = config.multiviewer_config; }
		
		let fpga = await vscript.read("system", "selected_fpga", { ip: this.ip} );
		if (!fpga.toLowerCase().includes("multiviewer")) {
			//this.verbose("Card is not a multiviewer! Aborting multiviewerSetup(). " + fpga);
			return -1;
		}

		for (let h of config.heads) {
			let h_kwl;
			if (h.hasOwnProperty("virtual_output")) {
				h_kwl = "multiviewer.virtual_outputs[" + h.virtual_output + "]";
			} else {
				//this.verbose("No virtual_output defined for head, skipping.");
				continue;
			}

			if (h.hasOwnProperty("physical_output")) {
				if (h.physical_output.length !== 2) {
					//this.verbose("physical_output not defined properly for " + h_kwl);
				} else {
					if (h.hasOwnProperty("standard")) {
						await this.write("multiviewer.physical_outputs_quads[" + h.physical_output[0] + "]", "standard", h.standard, { ip: this.ip });
					}
					await this.write("multiviewer.physical_outputs_quads[" + h.physical_output[0] + "].physical_outputs[" + h.physical_output[1] + "]", "virtual_output", h_kwl, { ip: this.ip });
					await this.write("multiviewer.physical_outputs_quads[" + h.physical_output[0] + "].physical_outputs[" + h.physical_output[1] + "]", "enable", true, { ip: this.ip });
				}
			}

			if (h.hasOwnProperty("layout")) { // Recall layout using layout_control
				//this.verbose("Recalling a layout on " + h_kwl);
				const l_kwl = "multiviewer.layout_ctrl";
				await this.write(l_kwl, "pattern_id", h.layout.pattern_id, { ip: this.ip });
				await this.write(l_kwl, "keep_ar", h.layout.keep_ar, { ip: this.ip });
				for (const p of Object.getOwnPropertyNames(h.layout.update)) {
					await this.write(l_kwl, p + "_update", h.layout.update[p], { ip: this.ip });
				}
				await this.write(l_kwl, "virtual_output", h_kwl, { ip: this.ip });
				await vscript.dispatch_change_request(l_kwl, "activate", "Click", { ip: this.ip} );
				await vscript.pause_ms(500);
			}

			if (h.hasOwnProperty("global_settings")) {
				let param_list = this.flattenConfig(h.global_settings, h_kwl + ".global_settings");
				let promises = Object.getOwnPropertyNames(param_list).map(async k => {
					let kwl = k.split(".").slice(0, -1).join(".");
					let kw = String(k.split(".").slice(-1));
					this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
					await this.write(kwl, kw, param_list[k], { ip: this.ip });
				});
				await Promise.all(promises);
			}

			if (h.hasOwnProperty("pips")) {
				if (h.pips.length < 1) {
					//this.verbose("No PIPs defined in config.pips!");
				} else {
					for (let pip of h.pips) {
						let p_kwl = h_kwl + ".pips[" + pip.pip_index + "]";
						delete pip.pip_index;
						let param_list = this.flattenConfig(pip, p_kwl);
						let promises = Object.getOwnPropertyNames(param_list).map(async k => {
							let kwl = k.split(".").slice(0, -1).join(".");
							let kw = String(k.split(".").slice(-1));
							this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
							await this.write(kwl, kw, param_list[k], { ip: this.ip });
						});
						await Promise.all(promises);
					}
				}
			}

			if (h.hasOwnProperty("ppms")) {
				if (h.ppms.length < 1) {
					//this.verbose("No PPMs defined in config.ppms!");
				} else {
					for (let ppm of h.ppms) {
						let p_kwl = h_kwl + ".ppms[" + ppm.ppm_index + "]";
						delete ppm.ppm_index;
						let param_list = this.flattenConfig(ppm, p_kwl);
						let promises = Object.getOwnPropertyNames(param_list).map(async k => {
							let kwl = k.split(".").slice(0, -1).join(".");
							let kw = String(k.split(".").slice(-1));
							this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
							await this.write(kwl, kw, param_list[k], { ip: this.ip });
						});
						await Promise.all(promises);
					}
				}
			}

			if (h.hasOwnProperty("analog_clocks")) {
				if (h.analog_clocks.length < 1) {
					//this.verbose("No clocks defined in config.analog_clocks!");
				} else {
					for (let clock of h.analog_clocks) {
						let p_kwl = h_kwl + ".analog_clocks[" + clock.clock_index + "]";
						delete clock.clock_index;
						let param_list = this.flattenConfig(clock, p_kwl);
						let promises = Object.getOwnPropertyNames(param_list).map(async k => {
							let kwl = k.split(".").slice(0, -1).join(".");
							let kw = String(k.split(".").slice(-1));
							this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
							await this.write(kwl, kw, param_list[k], { ip: this.ip });
						});
						await Promise.all(promises);
					}
				}
			}

			if (h.hasOwnProperty("digital_clocks")) {
				if (h.digital_clocks.length < 1) {
					//this.verbose("No clocks defined in config.digital_clocks!");
				} else {
					for (let clock of h.digital_clocks) {
						let p_kwl = h_kwl + ".digital_clocks[" + clock.clock_index + "]";
						delete clock.clock_index;
						let param_list = this.flattenConfig(clock, p_kwl);
						let promises = Object.getOwnPropertyNames(param_list).map(async k => {
							let kwl = k.split(".").slice(0, -1).join(".");
							let kw = String(k.split(".").slice(-1));
							this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
							await this.write(kwl, kw, param_list[k], { ip: this.ip });
						});
						await Promise.all(promises);
					}
				}
			}

			if (h.hasOwnProperty("text_boxes")) {
				if (h.text_boxes.length < 1) {
					//this.verbose("No boxes defined in config.text_boxes!");
				} else {
					for (let box of h.text_boxes) {
						let p_kwl = h_kwl + ".text_boxes[" + box.box_index + "]";
						delete box.box_index;
						let param_list = this.flattenConfig(box, p_kwl);
						let promises = Object.getOwnPropertyNames(param_list).map(async k => {
							let kwl = k.split(".").slice(0, -1).join(".");
							let kw = String(k.split(".").slice(-1));
							this.debug("Writing: " + kwl + ", " + kw + ", " + param_list[k]);
							await this.write(kwl, kw, param_list[k], { ip: this.ip });
						});
						await Promise.all(promises);
					}
				}
			}
		}

		//this.verbose("Finished multiviewerSetup()...", 99);
		return 1;
	};

	return this;
};
