"use strict";
const WebSocket = require("ws");
Object.defineProperty(exports, "__esModule", {
	value: !0
});
const pervasives_1 = require("./pervasives"), software_versions_1 = require("./software_versions"), recorder_core_1 = require("./recorder_core"), api_base_1 = require("./api/api_base");
class TimeoutExceeded extends Error {
	constructor(e, t) {
		super(),
		this.last_value = e,
		this.complaint = t,
		Object.setPrototypeOf(this, Error.prototype);
	}
	get_last_value() {
		return this.last_value;
	}
	get_complaint() {
		return this.complaint;
	}
}
function indices_of_hexmask(e) {
	const t = e.length / 2;
	let s = [];
	for (let n = 0; n < t; n++) {
		const t = 2 * n;
		let i = 8 * n,
			r = pervasives_1.hex_to_dec(e.charAt(t)) + 16 * pervasives_1.hex_to_dec(e.charAt(t + 1));
		for (; r > 0; )
			1 == (1 & r) && s.push(i), r >>= 1, i += 1;
	}
	return s;
}
exports.TimeoutExceeded = TimeoutExceeded, exports.indices_of_hexmask = indices_of_hexmask;
class SingleConnection {
	constructor(e) {
		this.cur_listener_id = 1,
		this.pending_lazy_kw_updates = {},
		this.first_connect_handlers = {},
		this.reconnect_handlers = {},
		this.voluntary_disconnect_handlers = {},
		this.involuntary_disconnect_handlers = {},
		this.error_handlers = {},
		this.close_handlers = {},
		this.reconnect_automatically = !1,
		this.connection_pars = e,
		this.kw_listeners = {},
		this.online = !1,
		this.firsttime = !0,
		this.oneshot_kwl_handlers = {},
		this.pending_subscriptions = [],
		this.subscription_timer = setInterval(() => {
			this.execute_subscription_demands();
		}, 50),
		this.lazy_handler_timer = setInterval(() => {
			this.execute_lazy_handlers();
		}, 100),
		this.webserver_buildinfo = null,
		this.row_masks = {},
		this.row_mask_dependencies = {},
		this.web_socket = null,
		this.interval_secs = 1,
		this.tick_interval = null,
		this.reconnect_interval = null,
		this.expecting_close = !1;
	}
	static set_file_loader(e) {
		SingleConnection.file_loader = e;
	}
	get_file(e) {
		return null === SingleConnection.file_loader ? new Promise(e => e(null)) : SingleConnection.file_loader(this.connection_pars.ip, e);
	}
	get_listener_id() {
		return this.cur_listener_id++,
		this.cur_listener_id > 1e9 && (this.cur_listener_id = 0),
		this.cur_listener_id;
	}
	get_buildinfo() {
		return this.webserver_buildinfo;
	}
	register_void_handler(e, t, s) {
		const n = e => {
			e[s] = t;
		};
		switch (e) {
		case "first-connect":
			n(this.first_connect_handlers);
			break;
		case "reconnect":
			n(this.reconnect_handlers);
			break;
		case "involuntary-disconnect":
			n(this.involuntary_disconnect_handlers);
			break;
		case "voluntary-disconnect":
			n(this.voluntary_disconnect_handlers);
		}
		return this;
	}
	register_close_handler(e, t) {
		return this.close_handlers[t] = e,
		this;
	}
	register_event_handler(e, t, s) {
		switch (e) {
		case "error":
			this.error_handlers[s] = t;
		}
		return this;
	}
	unregister_handler(e, t) {
		const s = e => {
			delete e[t];
		};
		switch (e) {
		case "first-connect":
			s(this.first_connect_handlers);
			break;
		case "reconnect":
			s(this.reconnect_handlers);
			break;
		case "involuntary-disconnect":
			s(this.involuntary_disconnect_handlers);
			break;
		case "voluntary-disconnect":
			s(this.voluntary_disconnect_handlers);
			break;
		case "error":
			delete this.error_handlers[t];
			break;
		case "close":
			delete this.close_handlers[t];
		}
		return this;
	}
	send(e, t = !0) {
		const s = JSON.stringify(e);
		pervasives_1.log(`send(${s})`),
		null !== this.web_socket && this.web_socket.send(s),
		recorder_core_1.recorder_is_active() && t && e.forEach(e => {
			if ("data" === e.op)
				for (let t in e.kw)
					("system.usrinfo" !== e.kwl || "towel" !== t && "cur_status" !== t) && recorder_core_1.force_push_record(new recorder_core_1.SingleRecordEntry(e.kwl, t, e.kw[t], this));
		});
	}
	async dispatch_change_request(e, t, s, n = !0) {
		let i = {};
		i[t] = s;
		const r = {
			op: "data",
			kwl: e,
			kw: i
		};
		this.send([r], n),
		"Click" === s && await api_base_1.pause_ms(500);
	}
	send_tree(e, t) {
		let s = t;
		const n = e.split(".");
		for (let e = n.length - 1; e >= 0; e--)
			s = {
				kwl: {
					[n[e]]: s
				}
			};
		return this.send([{
			op: "flags",
			flags: {
				"report errors": !0
			}
		}
		]),
		this.send([Object.assign({
			op: "tree"
		}, s)], !1),
		[Object.assign({
			op: "tree"
		}, s)];
	}
	read_all(e) {
		this.send([{
			op: "readAll",
			kwl: [e]
		}
		], !1);
	}
	read_single(e, t) {
		this.send([{
			op: "readAll",
			kwl: e,
			kw: t
		}
		], !1);
	}
	get_kw_listeners() {
		return this.kw_listeners;
	}
	async component_is_online(e, t) {
		const s = (t || {}).mode || "enforce",
			n = (t || {}).timeout || 90;
		if ("enforce" === s)
			return await this.wait_until("arkona_internal_module_registry", `${e}_pid`, e => null !== e && e > 0, {
				timeout: n
			}), !0; {
			const t = await this.read("arkona_internal_module_registry", `${e}_pid`);
			return null !== t && t > 0;
		}
	}
	async selected_application() {
		const e = await this.read("system", "selected_fpga");
		switch (e.toLowerCase()) {
		case "streaming":
		case "streaming_40gbe":
		case "multiviewer":
		case "multiviewer_40gbe":
			return e.toLowerCase();
		case "unknown":
			return await this.read("arkona_internal_module_registry", "multiviewer_pid") > 0 || !0 === await this.read("arkona_internal_module_registry", "multiviewer_crashed") ? "multiviewer" : "streaming";
		default:
			throw new Error(`machine reports unknown FPGA variant '${e}'`);
		}
	}
	async read(e, t, s) {
		const n = s && s.timeout || 5;
		if (!s || !1 !== s.check_component_liveness)
			try {
				await this.component_is_online(pervasives_1.component_name(e), {
					timeout: n
				});
			} catch (s) {
				throw new Error(`Unable to read ${e}.${t} (hosting component ${pervasives_1.component_name(e)} appears to be offline)`);
			}
		return new Promise((s, i) => {
			let r = !1;
			setTimeout(() => {
				r || i(new Error(`Unable to read ${e}.${t} from ${this.connection_pars.ip}`));
			}, 1e3 * (n + 1)),
			this.register_oneshot_kw_listener({
				full_kwl_name: e,
				kw_name: t,
				listener_id: `sync_single_read_${e}_${t}_${this.get_listener_id()}`
			}, e => {
				r = !0,
				s(e);
			}, n),
			this.read_single(e, t);
		});
	}
	value_update(e, t, s) {
		return new Promise((n, i) => {
			const r = s || 31449600;
			this.register_oneshot_kw_listener({
				full_kwl_name: e,
				kw_name: t,
				listener_id: `value_update_listener_${e}_${t}_${this.get_listener_id()}`
			}, e => {
				n();
			}, r);
		});
	}
	async get_software_version(e) {
		const t = await(async() => {
			if (void 0 !== e)
				return e;
			try {
				switch (await this.read("system", "booted_partition")) {
				case "System 0":
					return "system0";
				case "System 1":
					return "system1";
				case "Recovery":
					return "recovery";
				default:
					return;
				}
			} catch (e) {
				return;
			}
		})();
		if (void 0 === t)
			return null;
		const s = await this.read(`system.partitions.${t}`, "version");
		if (0 === s.length)
			return null; {
			const e = software_versions_1.string_to_version(s);
			return void 0 === e ? null : e;
		}
	}
	async poll_until(e, t, s, n) {
		const i = (void 0 !== n ? n.timeout : void 0) || 5,
			r = (void 0 !== n ? n.poll_interval_ms : void 0) || 20;
		let l = null,
			o = void 0;
		const a = () => new Promise((e, t) => {
			setTimeout(() => {
				e();
			}, r);
		});
		for (let n = 0; n < 1e3 * i; n += r) {
			if (void 0 !== (o = await this.read(e, t))) {
				const e = s(o);
				if (!0 === e)
					return o;
				!1 === e ? l = null : "string" == typeof e && (l = e);
			}
			await a();
		}
		throw null !== l ? new TimeoutExceeded(o, l) : new TimeoutExceeded(o);
	}
	wait_until(e, t, s, n) {
		return new Promise((i, r) => {
			const l = (n || {}).timeout || 86400,
				o = `wait_until_listener_${e}_${t}_${this.get_listener_id()}`,
				a = () => {
					this.unregister_kw_listeners({
						full_kwl_name: e
					}, e => e.listener_id === o && !1 === e.oneshot && e.kw_name === t);
				};
			let _ = !1,
				c = null,
				h = 0;
			setTimeout(() => {
				if (!_) {
					a();
					const n = 0 === h ? "" : ` (and after ${h} unsuccessful value updates)`,
						i = null === c ? "" : ` (${c})`;
					r(`wait_until(${e}, ${t}, ${s})@${this.connection_pars.ip}: failed to satisfy the given criterion within ${l}s${n}${i}`);
				}
			}, 1e3 * l),
			this.register_kw_listener({
				full_kwl_name: e,
				kw_name: t,
				listener_id: o,
				execution_strategy: 0
			}, e => {
				if (void 0 !== e) {
					const t = s(e);
					!0 === t ? (_ = !0, c = null, a(), i(e)) : (_ = !1, "string" == typeof t && (c = t));
				} else
					h++;
			}),
			this.read_single(e, t);
		});
	}
	async allocated_indices(e) {
		return indices_of_hexmask(await this.read(e, "rowMask"));
	}
	async is_allocated(e, t) {
		return (await this.allocated_indices(e)).indexOf(t) >= 0;
	}
	async write(e, t, s, n) {
		if (n && n.payload_validator && n.retry_until)
			throw new Error(`Invalid call to write(${e}, ${t}, ${s}, {...}): Options 'payload_validator' and 'retry_until' are mutually exclusive`);
		const i = n && n.timeout || 5;
		if (!n || !1 !== n.check_component_liveness)
			try {
				await this.component_is_online(pervasives_1.component_name(e));
			} catch (s) {
				throw new Error(`Unable to read ${e}.${t} from ${this.connection_pars.ip} (hosting component ${pervasives_1.component_name(e)} appears to be offline)`);
			}
		let r = t;
		t.match(/.*_command$/) && (r = t.replace(/_command$/, "_status"));
		const l = (n ? n.retry_interval_ms : void 0) || 50;
		let o = 1e3 * i / l;
		const a = () => new Promise((e, t) => {
			setTimeout(() => {
				e();
			}, l);
		});
		let _ = !1,
			c = null;
		const h = e => n && n.payload_validator ? n.payload_validator(e) : "object" == typeof s ? null === s ? null === e : "object" == typeof e && (s.length === e.length && s.every((t, s) => t == e[s])) : s == e;
		for (; o > 0; ) {
			if (this.dispatch_change_request(e, t, s), void 0 !== n && void 0 !== n.retry_until) {
				const i = await n.retry_until();
				!0 === i ? (_ = !0, c = null) : !1 === i ? (_ = !1, c = `unable to set ${e}.${t} to '${s}' (user-specified retry_until criterion evaluated to false)`) : "string" == typeof i && (_ = !1, c = i);
			} else {
				const n = await this.read(e, r);
				h(n) ? (_ = !0, c = null) : (_ = !1, c = `unable to set ${e}.${t} to '${s}' (reported result was '${n}')`);
			}
			if (_)
				return;
			await a(),
			o--;
		}
		if (!_)
			throw new Error(c);
	}
	ensure_kw_listener(e) {
		void 0 === this.kw_listeners && (this.kw_listeners = {}),
		this.kw_listeners.hasOwnProperty(e.full_kwl_name) || (this.kw_listeners[e.full_kwl_name] = {});
		let t = this.kw_listeners[e.full_kwl_name];
		return t.hasOwnProperty(e.kw_name) || (t[e.kw_name] = {
			kw_handlers: {},
			oneshot_kw_handlers: {}
		}),
		this.demand_subscription(e.full_kwl_name),
		t[e.kw_name];
	}
	register_oneshot_kw_listener(e, t, s = 5) {
		this.ensure_kw_listener({
			full_kwl_name: e.full_kwl_name,
			kw_name: e.kw_name
		}).oneshot_kw_handlers[e.listener_id] = {
			payload_handler: t,
			seconds_remaining: s
		},
		this.execute_subscription_demands();
	}
	register_oneshot_kwl_handler(e, t, s, n = 5) {
		void 0 === this.oneshot_kwl_handlers && (this.oneshot_kwl_handlers = {}),
		this.oneshot_kwl_handlers.hasOwnProperty(e.full_kwl_name) || (this.oneshot_kwl_handlers[e.full_kwl_name] = {}, this.send([{
			op: "subscribe",
			kwl: e.full_kwl_name
		}
		])),
		this.oneshot_kwl_handlers[e.full_kwl_name][e.listener_id] = {
			handler: t,
			seconds_remaining: n,
			timeout_mode: s
		},
		this.execute_subscription_demands();
	}
	create_table_row(e, t) {
		return new Promise((s, n) => {
			const i = (t ? t.timeout : void 0) || 5;
			let r = setTimeout(n, 1e3 * i);
			// Modified to handle concurrent calls
			if (t.desired_index) {
				let j = this.get_listener_id();
				this.register_kw_listener({
					full_kwl_name: e,
					kw_name: "created_row",
					execution_strategy: 0,
					listener_id: `created_row_listener_${j}`
				}, f => {
					if (f[0] === t.desired_index) {
						clearInterval(r);
						this.unregister_kw_listeners({
							full_kwl_name: e
						}, g => {
							return g.kw_name === "created_row" && g.listener_id === `created_row_listener_${j}`;
						});
						s([f[0], f[1]]);
					} else if (f[0] === null) { s(null); }
				});
			}
			else {
				this.register_oneshot_kw_listener({
					full_kwl_name: e,
					kw_name: "created_row",
					listener_id: `created_row_listener_${this.get_listener_id()}`
				}, e => {
					clearInterval(r),
					null === e[0] ? s(null) : s([e[0], e[1]]);
				}, i);
			}
			// End of modification
			const l = t ? t.desired_index : void 0,
				o = t ? t.desired_name : void 0,
				a = void 0 === l && void 0 === o ? null : {
					index: l,
					name: o
				};
			this.dispatch_change_request(e, "create_row", a);
		});
	}
	renew_subscriptions() {
		this.send([{
			op: "subscribe",
			kwl: Object.keys(this.kw_listeners)
		}
		], !1);
	}
	async rename_table_row(e, t) {
		await this.write(e, "row_name_command", t);
	}
	register_kw_listener(e, t) {
		this.ensure_kw_listener({
			full_kwl_name: e.full_kwl_name,
			kw_name: e.kw_name
		}).kw_handlers[e.listener_id] = {
			handler: t,
			execution_strategy: e.execution_strategy
		};
	}
	unregister_kw_listeners(e, t) {
		if (this.kw_listeners.hasOwnProperty(e.full_kwl_name)) {
			let s = this.kw_listeners[e.full_kwl_name];
			Object.keys(s).forEach(e => {
				Object.keys(s[e].kw_handlers).forEach(n => {
					t({
						kw_name: e,
						listener_id: n,
						oneshot: !1
					}) && delete s[e].kw_handlers[n];
				}),
				Object.keys(s[e].kw_handlers).forEach(n => {
					t({
						kw_name: e,
						listener_id: n,
						oneshot: !0
					}) && delete s[e].oneshot_kw_handlers[n];
				}),
				0 === Object.keys(s[e].kw_handlers).length && 0 === Object.keys(s[e].oneshot_kw_handlers).length && delete s[e];
			}),
			0 === Object.keys(s).length && (delete this.kw_listeners[e.full_kwl_name], this.online && this.send([{
				op: "unsubscribe",
				kwl: e.full_kwl_name
			}
			], !1));
		}
	}
	demand_subscription(e) {
		this.pending_subscriptions.indexOf(e) < 0 && this.pending_subscriptions.push(e);
	}
	execute_subscription_demands() {
		0 !== this.pending_subscriptions.length && this.online && (this.send([{
			op: "subscribe",
			kwl: this.pending_subscriptions
		}
		], !1), this.pending_subscriptions = []);
	}
	execute_lazy_handlers() {
		for (const e in this.pending_lazy_kw_updates) {
			const t = this.pending_lazy_kw_updates[e];
			t.handler(t.payload);
		}
		this.pending_lazy_kw_updates = {};
	}
	connect() {
		if (pervasives_1.log("trying to (re-)connect"), null !== this.web_socket) {
			try {
				this.web_socket.close();
			} catch (e) {}
			this.web_socket = null;
		}
		return new Promise((e, t) => {
			try {
				let s = !1;
				setTimeout(() => {
					s || t();
				}, 7500);
				const n = void 0 === this.connection_pars.port ? "" : `:${this.connection_pars.port}`,
					i = void 0 === this.connection_pars.socket_name ? "socket" : this.connection_pars.socket_name,
					r = `${this.connection_pars.protocol}://${this.connection_pars.ip}:${n}/${i}`;
				this.web_socket = new WebSocket(r),
				this.web_socket.onopen = (() => {
					null !== this.reconnect_interval && (clearInterval(this.reconnect_interval), this.reconnect_interval = null),
					null !== this.tick_interval && (clearInterval(this.tick_interval), this.tick_interval = null),
					this.firsttime ? (Object.keys(this.first_connect_handlers).forEach(e => {
						this.first_connect_handlers[e]();
					}), this.tick_interval = setInterval(() => {
						this.tick();
					}, 1e3 * this.interval_secs), this.firsttime = !1) : (pervasives_1.log("renewing subscriptions for listeners:"), pervasives_1.log(this.kw_listeners), this.tick_interval = setInterval(() => {
						this.tick();
					}, 1e3 * this.interval_secs), Object.keys(this.reconnect_handlers).forEach(e => {
						this.reconnect_handlers[e]();
					}), this.renew_subscriptions()),
					this.reconnect_automatically = !0,
					this.online = !0,
					s = !0,
					e();
				}),
				this.web_socket.onclose = (e => {
					this.online = !1,
					null === this.reconnect_interval && this.reconnect_automatically && (this.reconnect_interval = setInterval(() => {
						this.connect().catch(e => {});
					}, 5e3)),
					null !== this.tick_interval && (clearTimeout(this.tick_interval), this.tick_interval = null),
					Object.keys(this.close_handlers).forEach(t => {
						this.close_handlers[t](e);
					}),
					this.expecting_close ? Object.keys(this.voluntary_disconnect_handlers).forEach(e => {
						this.voluntary_disconnect_handlers[e]();
					}) : Object.keys(this.involuntary_disconnect_handlers).forEach(e => {
						this.involuntary_disconnect_handlers[e]();
					}),
					e.hasOwnProperty("preventDefault") && "function" == typeof e.preventDefault && e.preventDefault();
				}),
				this.web_socket.onerror = (e => {
					Object.keys(this.error_handlers).forEach(t => {
						this.error_handlers[t](e);
					}),
					!this.online && this.reconnect_automatically && null === this.reconnect_interval && (this.reconnect_interval = setInterval(() => {
						this.connect().catch(e => {});
					}, 5e3)),
					e.hasOwnProperty("preventDefault") && "function" == typeof e.preventDefault && e.preventDefault();
				}),
				this.web_socket.onmessage = (e => {
					this.handle_incoming(e);
				}),
				this.expecting_close = !1;
			} catch (e) {
				t(e);
			}
		});
	}
	disconnect() {
		if (this.reconnect_automatically = !1, this.online && (this.expecting_close = !0), null !== this.web_socket)
			try {
				this.web_socket.close();
			} catch (e) {}
		clearInterval(this.subscription_timer),
		this.subscription_timer = null,
		this.web_socket = null,
		clearInterval(this.lazy_handler_timer);
	}
	handle_incoming(e) {
		let t;
		try {
			t = JSON.parse(e.data);
		} catch (t) {
			if (void 0 === alert)
				throw t;
			return void alert("<p>Error  JSON parse" + t + " data " + e.data);
		}
		const s = t.length;
		pervasives_1.log("incoming data:"),
		pervasives_1.log(t);
		for (let e = 0; e < s; e++) {
			const s = t[e];
			if (s.hasOwnProperty("kwl") && this.kw_listeners.hasOwnProperty(s.kwl)) {
				let e = this.kw_listeners[s.kwl];
				this.oneshot_kwl_handlers.hasOwnProperty(s.kwl) && (Object.keys(this.oneshot_kwl_handlers[s.kwl]).forEach(e => {
					this.oneshot_kwl_handlers[s.kwl][e].handler();
				}), delete this.oneshot_kwl_handlers[s.kwl]),
				Object.keys(s.kw).forEach(t => {
					const n = s.kw[t];
					if (e.hasOwnProperty(t)) {
						let s = e[t];
						Object.keys(s.oneshot_kw_handlers).forEach(e => {
							s.oneshot_kw_handlers[e].payload_handler(n);
						}),
						s.oneshot_kw_handlers = {},
						Object.keys(s.kw_handlers).forEach(e => {
							const t = s.kw_handlers[e];
							switch (t.execution_strategy) {
							case 0:
								t.handler(n);
								break;
							case 1:
								this.pending_lazy_kw_updates[e] = {
									handler: t.handler,
									payload: n
								};
							}
						});
					} else
						pervasives_1.log(`ignoring incoming data for ${s.kwl}, ${t}: no listener registered`);
				});
			} else
				s.hasOwnProperty("file") ? pervasives_1.log("File handling currently not implemented") : s.hasOwnProperty("thumbnail") ? pervasives_1.log("Thumbnail handling currently not implemented") : s.hasOwnProperty("webserver_buildinfo") && (this.webserver_buildinfo = s.webserver_buildinfo);
		}
	}
	tick() {
		this.online && (Object.keys(this.oneshot_kwl_handlers).forEach(e => {
			Object.keys(this.oneshot_kwl_handlers[e]).forEach(t => {
				let s = this.oneshot_kwl_handlers[e][t];
				const n = s.seconds_remaining - this.interval_secs;
				n > 0 ? this.oneshot_kwl_handlers[e][t].seconds_remaining = n : (1 === s.timeout_mode && s.handler(), delete this.oneshot_kwl_handlers[e][t]);
			});
		}), Object.keys(this.kw_listeners).forEach(e => {
			Object.keys(this.kw_listeners[e]).forEach(t => {
				let s = this.kw_listeners[e][t].oneshot_kw_handlers;
				Object.keys(s).forEach(e => {
					const t = s[e].seconds_remaining - this.interval_secs;
					t > 0 ? s[e].seconds_remaining = t : delete s[e];
				});
			});
		}));
	}
	get_row_mask(e) {
		return this.row_masks[e];
	}
	row_is_live(e, t) {
		const s = this.row_masks[e];
		return s.rows[t];
	}
	is_live(e) {
		const t = this.row_mask_dependencies[e];
		for (let e of t)
			if (!this.row_is_live(e.table_name, e.index))
				return !1;
		return !0;
	}
	register_rowmask(e, t) {
		this.row_masks[e] = {
			rows: Array.apply(null, {
				length: t
			}).fill(!1)
		};
	}
	register_single_rowmask_listener(e, t) {
		const s = void 0 === t ? t => {
			this.process_rowmask(e.table_name, t);
		} : s => {
			this.process_rowmask(e.table_name, s),
			t();
		};
		this.register_kw_listener({
			full_kwl_name: e.table_name,
			kw_name: "rowMask",
			listener_id: e.listener_id,
			execution_strategy: 0
		}, s),
		this.row_masks.hasOwnProperty(e.table_name) && void 0 !== t && t();
	}
	conditionally_unregister_single_rowmask_listener(e, t) {
		this.unregister_kw_listeners({
			full_kwl_name: e.table_name
		}, e => "rowMask" === e.kw_name && t({
			listener_id: e.listener_id
		}) && !1 === e.oneshot);
	}
	unregister_single_rowmask_listener(e) {
		this.unregister_kw_listeners({
			full_kwl_name: e.table_name
		}, t => "rowMask" === t.kw_name && t.listener_id === e.instantiation_site);
	}
	process_rowmask(e, t) {
		let s = this.row_masks[e];
		for (let e = 0; e < s.rows.length; ++e)
			s.rows[e] = !1;
		indices_of_hexmask(t).forEach(e => {
			s.rows[e] = !0;
		});
	}
	is_online() {
		return this.online;
	}
}
var single_blade_connection;
function blade_con() {
	return single_blade_connection;
}
function setup_single_blade_connection(e) {
	return single_blade_connection = new SingleConnection(e);
}
SingleConnection.file_loader = null, exports.SingleConnection = SingleConnection, exports.blade_con = blade_con, exports.setup_single_blade_connection = setup_single_blade_connection;
