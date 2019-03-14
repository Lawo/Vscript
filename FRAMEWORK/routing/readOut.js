const WebSocket = require("ws");
const vscript = require("../vscript/common/api/api_base");
const MultiConnection = require("../vscript/common/multi_connection");

class CardReader {
	constructor() {
		MultiConnection.initialize("", "");
	}

	async readCard(ip) {
		let card = {};
		card.crossbar_config = await this.readCrossbars(ip);
		return card;		
	}

	async readCrossbars(ip) {
		let video_crossbars_indices = await vscript.allocated_indices("video_crossbar.pool", {ip: ip});
		let a_v_crossbars_indices = await vscript.allocated_indices("a_v_crossbar.pool", {ip: ip});
		let audio_crossbars_indices = await vscript.allocated_indices("audio_crossbar.large", {ip: ip});
		let crossbar_config = { crossbars: [] };
		await video_crossbars_indices.map(async (i) => {
			console.log(i);
			let crossbar = {};
			crossbar.num_in = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("video_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("video_crossbar.pool[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("video_crossbar.pool[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "video";
			crossbar_config.crossbars.push(crossbar);
		});
		await audio_crossbars_indices.map(async (i) => {
			let crossbar = {};
			crossbar.num_in = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("audio_crossbar.large[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("audio_crossbar.large[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("audio_crossbar.large[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "large";
			crossbar_config.crossbars.push(crossbar);
		});
		await a_v_crossbars_indices.map(async (i) => {
			let crossbar = {};
			crossbar.num_in = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.num_out = await vscript.read("a_v_crossbar.pool[" + i + "]", "num_inputs", {ip: ip});
			crossbar.channels = await vscript.read("a_v_crossbar.pool[" + i + "].outputs[0]", "num_channels", {ip: ip});
			crossbar.name = await vscript.read("a_v_crossbar.pool[" + i + "]", "row_name_status", {ip: ip});
			crossbar.xbar_type = "a_v";
			crossbar_config.crossbars.push(crossbar);
		});
		return crossbar_config;
	}

	async readIoModule(ip) {
		let sdi_config = {};
		let sdi_outs = await vscript.allocated_indices("i_o_module.output", {ip: ip});
		let sdi_ins = await vscript.allocated_indices("i_o_module.input", {ip: ip});

	}
}

exports.CardReader = CardReader;