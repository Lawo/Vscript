"use strict";
Object.defineProperty(exports, "__esModule", {
	value: !0
});
const single_connection_1 = require("./single_connection"), pause_1 = require("../common/macros/pause"), installer_upload_1 = require("../common/software_update/installer_upload"), http_helpers_1 = require("./http_helpers"), util_1 = require("util");
class MultiConnection {
	constructor(t, e) {
		this.listener_id = 1,
		this.single_connection_registry = {},
		this.locked_machines = [],
		this.with_machine_connection = null,
		this.lock_towel = t,
		this.lock_status = e;
	}
	static async connect_with_timeout(t, e) {
		const n = new Date,
			i = e || MultiConnection.DEFAULT_TIMEOUT_SECS;
		let o = 0;
		for (; !t.is_online(); )
			try {
				o++,
				await t.connect();
			} catch (e) {
				const a = (new Date).valueOf() - n.valueOf(),
					s = 1 === o ? "once" : `${o} times`;
				if (a > 1e3 * i || o > 1e3) {
					const e = a > 2e3 ? `${Math.round(a/1e3)} seconds` : `${a} ms`;
					throw new Error(`unable to connect to ${t.connection_pars.ip} after trying ${s} over a period of ${e}`);
				}
			}
	}
	async add_if_missing(t) {
		if (!this.single_connection_registry.hasOwnProperty(t)) {
			this.single_connection_registry[t] = new single_connection_1.SingleConnection({
				protocol: "ws",
				ip: t
			});
			let e = this.single_connection_registry[t];
			await MultiConnection.connect_with_timeout(e);
		}
	}
	async get_connection(t) {
		return await this.add_if_missing(t),
		this.single_connection_registry[t];
	}
	async remove_towel(t) {
		let e = this.single_connection_registry[t];
		await e.write("system.usrinfo", "towel", ""),
		await e.write("system.usrinfo", "cur_status", "");
	}
	async unlock(t) {
		const e = this.locked_machines.indexOf(t);
		await this.remove_towel(t),
		this.locked_machines.splice(e, 1);
	}
	async lock(t) {
		const e = t.connection_pars.ip;
		this.locked_machines.includes(e) || (await this.place_towel(t), this.locked_machines = [...new Set([...this.locked_machines, e])]);
	}
	async place_towel(t, e) {
		const n = t.connection_pars.ip;
		if (!e) {
			const e = await t.read("system.usrinfo", "towel", {
				timeout: 30
			});
			if (e.length > 0 && e !== this.lock_towel)
				throw new Error(`unable to use machine @${n} (currently reserved by '${e}')`);
			const i = await t.read("system.usrinfo", "cur_status");
			if (i.length > 0 && i !== this.lock_status)
				throw new Error(`unable to use machine @${n} (clear system.usrinfo.cur_status to override this check)`);
		}
		await t.write("system.usrinfo", "towel", this.lock_towel),
		await t.write("system.usrinfo", "cur_status", this.lock_status);
	}
	get_default_connection() {
		return this.default_connection;
	}
	set_default_retry_interval_ms(t) {
		this.default_retry_interval_ms = void 0 !== t && null !== t ? t : void 0;
	}
	async is_reachable(t) {
		if (this.single_connection_registry.hasOwnProperty(t) && this.single_connection_registry[t].is_online())
			return !0;
		try {
			let e = new single_connection_1.SingleConnection({
				ip: t,
				protocol: "ws"
			});
			return await e.connect(),
			!0;
		} catch (t) {
			return !1;
		}
	}
	async cleanup() {
		await Promise.all(Object.keys(this.single_connection_registry).map(t => this.disconnect_from(t))),
		this.default_connection = void 0;
	}
	async get_connection_or_default(t) {
		let e = this.default_connection;
		if (void 0 !== t && void 0 !== t.ip && (e = await this.get_connection(t.ip)), void 0 !== e)
			return await MultiConnection.connect_with_timeout(e, void 0 === t ? void 0 : t.timeout), e;
		throw new Error("unable to execute command: no default target IP has been set");
	}
	async get_software_version(t) {
		const e = void 0 !== t ? t.ip : void 0;
		let n = await this.get_connection_or_default({
			ip: e
		});
		const i = void 0 !== t ? t.partition : void 0;
		return await n.get_software_version(i);
	}
	async set_default_ip(t) {
		await this.add_if_missing(t),
		this.default_connection = this.single_connection_registry[t];
	}
	async disconnect_from(t) {
		this.single_connection_registry.hasOwnProperty(t) && (this.locked_machines.includes(t) && this.is_reachable(t) && await this.unlock(t), this.single_connection_registry[t].disconnect(), delete this.single_connection_registry[t]);
	}
	async install(t, e) {
		let n = await this.get_connection_or_default(void 0 === e ? void 0 : {
			ip: e
		});
		await installer_upload_1.install(t, n);
	}
	async selected_application(t) {
		let e = await this.get_connection_or_default({
			ip: t
		});
		return await e.selected_application();
	}
	async select_application(t, e) {
		let n = await this.get_connection_or_default({
			ip: e
		});
		const i = t.toLowerCase();
		switch (i) {
		case "streaming":
		case "streaming_40gbe":
		case "multiviewer":
		case "multiviewer_40gbe":
			if (i !== await n.selected_application()) {
				const t = {
					streaming: "STREAMING",
					multiviewer: "MULTIVIEWER",
					streaming_40gbe: "STREAMING_40GbE",
					multiviewer_40gbe: "MULTIVIEWER_40GbE"
				}[i];
				await n.write("system", "select_fpga_command", t),
				await pause_1.pause(1);
				const e = n.connection_pars.ip;
				await this.reboot({
					ip: e
				});
				const o = await n.selected_application();
				if (i !== o)
					throw new Error(`unable to select FPGA '${i}'`);
			}
			break;
		default:
			throw new Error(`invalid application '${t}' (should be either 'streaming' or 'multiviewer')`);
		}
	}
	async with_machine(t, e) {
		if (null !== this.with_machine_connection && this.with_machine_connection.connection_pars.ip !== t)
			throw new Error(`another call to with_machine is currently in progress (targeting ${this.with_machine_connection.connection_pars.ip})`);
		const n = null === this.with_machine_connection,
			i = this.default_connection;
		await this.set_default_ip(t),
		this.with_machine_connection = this.default_connection;
		const o = await e();
		return this.default_connection = i,
		n && (this.with_machine_connection = null),
		o;
	}
	async recovery(t) {
		let e = await this.get_connection_or_default(t);
		const n = void 0 !== t && void 0 !== t.timeout ? t.timeout : MultiConnection.DEFAULT_TIMEOUT_SECS;
		for (let t = 0; t < n; ++t) {
			if (e.is_online())
				return void await this.place_towel(e);
			await pause_1.pause(1);
		}
	}
	watch(t, e, n, i) {
		return new Promise((o, a) => {
			this.get_connection_or_default({
				ip: i
			}).then(a => {
				const s = this.listener_id;
				this.listener_id++;
				const c = `watch_handler_${t}_${e}_${s}_${a.connection_pars.ip}`;
				a.register_kw_listener({
					full_kwl_name: t,
					kw_name: e,
					listener_id: c,
					execution_strategy: 0
				}, n),
				a.read_single(t, e),
				o({
					kwl_name: t,
					kw_name: e,
					id: s,
					ip: void 0 === i ? a.connection_pars.ip : i
				});
			}).catch(t => a(t));
		});
	}
	watch_async(t, e, n, i) {
		return new Promise((o, a) => {
			this.get_connection_or_default({
				ip: i
			}).then(a => {
				const s = this.listener_id;
				this.listener_id++;
				const c = `watch_handler_${t}_${e}_${s}_${a.connection_pars.ip}`;
				a.register_kw_listener({
					full_kwl_name: t,
					kw_name: e,
					listener_id: c,
					execution_strategy: 0
				}, n),
				a.read_single(t, e),
				o({
					kwl_name: t,
					kw_name: e,
					id: s,
					ip: void 0 === i ? a.connection_pars.ip : i
				});
			}).catch(t => a(t));
		});
	}
	unwatch(t) {
		return new Promise((e, n) => {
			this.get_connection(t.ip).then(n => {
				const i = `watch_handler_${t.kwl_name}_${t.kw_name}_${t.id}_${t.ip}`;
				n.unregister_kw_listeners({
					full_kwl_name: t.kwl_name
				}, e => e.kw_name === t.kw_name && e.listener_id === i),
				e();
			}).catch(n);
		});
	}
	async component_startup(t) {
		let e = await this.get_connection_or_default(t);
		const n = t && t.components ? ["system", ...t.components] : ["system"];
		await Promise.all(n.map(n => e.component_is_online(n, {
			timeout: t.timeout
		})));
	}
	async reboot(t) {
		const e = new Date;
		let n = await this.get_connection_or_default(t);
		await this.lock(n),
		n.dispatch_change_request("system", "reboot", "reboot"),
		await pause_1.pause(5),
		await this.recovery(t);
		const i = (new Date).getSeconds() - e.getSeconds();
		await this.component_startup({
			ip: n.connection_pars.ip,
			timeout: t && t.timeout ? Math.max(5, t.timeout - i) : 90,
			components: (t ? t.components_to_wait_for : void 0) || []
		});
	}
	async reset(t) {
		const e = new Date;
		let n = await this.get_connection_or_default(t);
		await this.lock(n),
		n.dispatch_change_request("system", "reset", "reset"),
		await pause_1.pause(5),
		await this.recovery(t);
		const i = (new Date).getSeconds() - e.getSeconds();
		await this.component_startup({
			ip: n.connection_pars.ip,
			timeout: t && t.timeout ? Math.max(5, t.timeout - i) : 90,
			components: (t ? t.components_to_wait_for : void 0) || []
		});
	}
	async create_table_row(t, e) {
		let n = await this.get_connection_or_default(e);
		return await n.create_table_row(t, e);
	}
	async rename_table_row(t, e, n) {
		let i = await this.get_connection_or_default(n);
		return i.rename_table_row(t, e);
	}
	async read(t, e, n) {
		const i = (n || {}).ip;
		let o = await this.get_connection_or_default({
			ip: i
		});
		return await o.read(t, e, n);
	}
	async value_update(t, e, n) {
		let i = await this.get_connection_or_default(void 0 === n ? {} : n);
		await i.value_update(t, e, void 0 === n ? void 0 : n.timeout);
	}
	async dispatch_change_request(t, e, n, i) {
		let o = await this.get_connection_or_default({
			ip: i
		});
		await this.lock(o),
		o.dispatch_change_request(t, e, n);
	}
	async write(t, e, n, i) {
		let o = await this.get_connection_or_default({
			ip: void 0 === i ? void 0 : i.ip
		});
		await this.lock(o);
		let a = void 0;
		if (i && i.timeout && (a = i.timeout), this.default_retry_interval_ms) {
			const t = this.default_retry_interval_ms / 10;
			(void 0 === a || t > a) && (a = t);
		}
		let s = Object.assign({
			retry_interval_ms: this.default_retry_interval_ms
		}, i || {}, {
			timeout: a
		});
		delete s.ip,
		await o.write(t, e, n, s);
	}
	async poll_until(t, e, n, i) {
		let o = await this.get_connection_or_default(void 0 === i ? {} : i);
		return await o.poll_until(t, e, n, i);
	}
	async wait_until(t, e, n, i) {
		let o = await this.get_connection_or_default(void 0 === i ? {} : i);
		return await o.wait_until(t, e, n, {
			timeout: (void 0 === i ? void 0 : i.timeout) || MultiConnection.DEFAULT_TIMEOUT_SECS
		});
	}
	async allocated_indices(t, e) {
		let n = await this.get_connection_or_default({
			ip: e
		});
		return await n.allocated_indices(t);
	}
	async is_allocated(t, e, n) {
		let i = await this.get_connection_or_default({
			ip: n
		});
		return i.is_allocated(t, e);
	}
}
MultiConnection.DEFAULT_TIMEOUT_SECS = 180, exports.MultiConnection = MultiConnection;
let multi_connection = null;
function get() {
	return multi_connection;
}
async function exit_handler(t, e) {
	if (null !== multi_connection) {
		try {
			await multi_connection.cleanup();
		} catch (e) {
			process.stderr.write(util_1.format(e)),
			process.stderr.write("multi_connection.cleanup() failed; you may have to manually remove leftover towels and/or status messages"),
			process.exit(0 === t ? 1 : t);
		}
		multi_connection = null;
	}
	e(),
	process.exit(t);
}
function setup_signal_handlers() {
	process.on("SIGINT", () => exit_handler(100, () => {})),
	process.on("SIGTERM", () => exit_handler(101, () => {})),
	process.on("SIGABRT", () => exit_handler(102, () => {}));
}
function initialize(t, e) {
	single_connection_1.SingleConnection.set_file_loader(async(t, e) => {
		try {
			return await http_helpers_1.get({
				protocol: "http",
				address: t,
				path: e
			});
		} catch (t) {
			return null;
		}
	}),
	multi_connection = new MultiConnection(t, e),
	setup_signal_handlers();
}
function default_ip() {
	const t = multi_connection.get_default_connection();
	return t ? t.connection_pars.ip : null;
}
exports.get = get, exports.exit_handler = exit_handler, exports.initialize = initialize, exports.default_ip = default_ip;
