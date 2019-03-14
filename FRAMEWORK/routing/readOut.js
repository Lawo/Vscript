const WebSocket = require("ws");
const vscript = require("../vscript/common/api/api_base");
const MultiConnection = require("../vscript/common/multi_connection");

class CardReader {
	constructor() {
		MultiConnection.initialize("", "");
	}

	async readCard(ip) {
		let crossbars = await this.readCrossbars(ip);
		return {crossbar_config: crossbars};		
	}

	async readCrossbars(ip) {
		let video_crossbars_indices = await vscript.allocated_indices("video_crossbar.pool", {ip: ip});
		let a_v_crossbars_indices = await vscript.allocated_indices("a_v_crossbar.pool", {ip: ip});
		let audio_crossbars_indices = await vscript.allocated_indices("audio_crossbar.large", {ip: ip});
		let crossbar_config = { crossbars: [] };
		for (let i = 0; i < video_crossbars_indices.length; i++) {
			let crossbar = {};
			crossbar.num_in = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("video_crossbar.pool[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("video_crossbar.pool[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "video";
			crossbar_config.crossbars.push(crossbar);
		}
		for (let i = 0; i < audio_crossbars_indices.length; i++) {
			let crossbar = {};
			crossbar.num_in = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("audio_crossbar.large[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("audio_crossbar.large[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "audio";
			crossbar_config.crossbars.push(crossbar);
		}
		for (let i = 0; i < a_v_crossbars_indices.length; i++) {
			let crossbar = {};
			crossbar.num_in = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("a_v_crossbar.pool[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("a_v_crossbar.pool[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "a_v";
			crossbar_config.crossbars.push(crossbar);
		}
		return crossbar_config;
	}

	async readIoModule(ip) {

	}
}

exports.CardReader = CardReader;