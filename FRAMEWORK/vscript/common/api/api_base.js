"use strict";
Object.defineProperty(exports, "__esModule", {
	value: !0
});
const software_versions_1 = require("../../common/software_versions"), multi_connection_1 = require("../../common/multi_connection"), assert_1 = require("assert"), util = require("util"), Pervasives = require("../pervasives"), Influx = require("influx"), ip_1 = require("ip"), Pause = require("../macros/pause"), fs = require("fs"), ConsoleIO = require("../../cli/console_io"), ssh2_1 = require("ssh2");
function name_hd(e) {
	return warn("name_hd is deprecated, please use path_parent instead"),
	Pervasives.path_parent(e);
}
function path_parent(e) {
	return Pervasives.path_parent(e);
}
function name_tl(e) {
	return warn("name_tl is deprecated, please use path_base instead"),
	Pervasives.path_base(e);
}
function path_base(e) {
	return Pervasives.path_base(e);
}
function path_hd(e) {
	return Pervasives.path_hd(e);
}
function path_tl(e) {
	return Pervasives.path_tl(e);
}
function remove_all_indices(e) {
	return Pervasives.remove_all_indices(e);
}
function index_of_kwl_name(e) {
	return Pervasives.index_of_kwl_name(e);
}
function version_to_string(e) {
	return software_versions_1.version_to_string(e);
}
function string_to_version(e) {
	return software_versions_1.string_to_version(e);
}
function format_any(e) {
	return util.format("%O", e);
}
async function pause(e) {
	await Pause.pause(e);
}
async function pause_ms(e) {
	await Pause.pause_ms(e);
}
exports.name_hd = name_hd, exports.path_parent = path_parent, exports.name_tl = name_tl, exports.path_base = path_base, exports.path_hd = path_hd, exports.path_tl = path_tl, exports.remove_all_indices = remove_all_indices, exports.index_of_kwl_name = index_of_kwl_name, exports.version_to_string = version_to_string, exports.string_to_version = string_to_version, exports.format_any = format_any, exports.pause = pause, exports.pause_ms = pause_ms;
class InfluxDatabases {
	static getDB(e, t) {
		return InfluxDatabases.registry.hasOwnProperty(e) || (InfluxDatabases.registry[e] = {}),
		InfluxDatabases.registry[e].hasOwnProperty(t) || (InfluxDatabases.registry[e][t] = new Influx.InfluxDB({
			host: e,
			database: t
		})),
		InfluxDatabases.registry[e][t];
	}
}
InfluxDatabases.registry = {};
let private_keys = {};
function get_key(e) {
	if (private_keys.hasOwnProperty(e))
		return private_keys[e];
	try {
		const t = fs.readFileSync(e);
		if (t instanceof Error)
			throw `unable to read key file '${e}'`;
		private_keys[e] = t;
	} catch (t) {
		throw `unable to read key file '${e}'`;
	}
}
function execute_on(e) {
	let t = new ssh2_1.Client;
	return new Promise((n, a) => {
		t.on("ready", function () {
			t.exec(e.cmd, (i, r) => {
				i && a(i),
				r.on("close", () => {
					t.end(),
					n();
				}).on("data", t => e.onStdout(t)).stderr.on("data", t => e.onStderr(t));
			});
		}).connect({
			host: e.ip,
			username: e.username,
			password: e.password,
			privateKey: void 0 === e.keyfile ? void 0 : get_key(e.keyfile)
		});
	});
}
function fail(e) {
	throw new Error(e);
}
async function log_to_influx(e, t, n, a) {
	const i = n || "172.16.227.243:8086",
		r = a || "mydb";
	let s = InfluxDatabases.getDB(i, r);
	await s.writeMeasurement(e, t);
}
async function watch(e, t, n, a) {
	return "string" == typeof a && (warn(`watch(${e}, ${t}, ${n}, ${a}): this syntax is deprecated and will soon be removed. Please use watch(${e}, ${t}, ${n}, { ip: ${a} }) instead`), a = {
		ip: a
	}),
	await multi_connection_1.get().watch(e, t, n, (a || {}).ip);
}
async function watch_async(e, t, n, a) {
	return "string" == typeof a && (warn(`watch_async(${e}, ${t}, ${n}, ${a}): this syntax is deprecated and will soon be removed. Please use watch_async(${e}, ${t}, ${n}, { ip: ${a} }) instead`), a = {
		ip: a
	}),
	await multi_connection_1.get().watch_async(e, t, n, (a || {}).ip);
}
async function unwatch(e) {
	return await multi_connection_1.get().unwatch(e);
}
async function connect_to(e) {
	await multi_connection_1.get().set_default_ip(e);
}
async function read(e, t, n) {
	return "string" == typeof n && (warn(`read(${e}, ${t}, ${n}): this syntax is deprecated and will soon be removed. Please use read(${e}, ${t}, { ip: ${n} }) instead`), n = {
		ip: n
	}),
	await multi_connection_1.get().read(e, t, n);
}
async function value_update(e, t, n) {
	await multi_connection_1.get().value_update(e, t, n);
}
async function dispatch_change_request(e, t, n, a) {
	"string" == typeof a && (warn(`dispatch_change_request(${e}, ${t}, ${n}, ${a}): this syntax is deprecated and will soon be removed. Please use dispatch_change_request(${e}, ${t}, ${n}, { ip: ${a} }) instead`), a = {
		ip: a
	}),
	await multi_connection_1.get().dispatch_change_request(e, t, n, (a || {}).ip);
}
async function write(e, t, n, a) {
	await multi_connection_1.get().write(e, t, n, a);
}
function set_default_retry_interval_ms(e) {
	multi_connection_1.get().set_default_retry_interval_ms(e);
}
async function allocated_indices(e, t) {
	return "string" == typeof t && (warn(`allocated_indices(${e}, ${t}): this syntax is deprecated and will soon be removed. Please use allocated_indices(${e}, { ip: ${t} }) instead`), t = {
		ip: t
	}),
	await multi_connection_1.get().allocated_indices(e, (t || {}).ip);
}
async function create_table_row(e, t) {
	return await multi_connection_1.get().create_table_row(e, t);
}
async function rename_table_row(e, t, n) {
	return await multi_connection_1.get().rename_table_row(e, t, n);
}
async function condition(e, t) {
	const n = void 0 === t ? void 0 : t.timeout,
		a = 1e3 * Math.abs(n || 5) / 50;
	for (let n = 0; n <= a && !await e(); n++)
		if (await pause_ms(50), n === a) {
			const e = void 0 === t ? void 0 : t.failure_msg;
			await fail(e || "await_condition failed (timeout exceeded)");
		}
}
async function is_allocated(e, t, n) {
	return "string" == typeof n && (warn(`is_allocated(${e}, ${t}, ${n}): this syntax is deprecated and will soon be removed. Please use is_allocated(${e}, ${t}, { ip: ${n} }) instead`), n = {
		ip: n
	}),
	await multi_connection_1.get().is_allocated(e, t, (n || {}).ip);
}
function compare_software_versions(e, t) {
	switch (software_versions_1.compare_software_versions(e, t)) {
	case -1:
		return "first-is-older";
	case 0:
		return "equal";
	case 1:
		return "first-is-newer";
	}
}
async function poll_until(e, t, n, a) {
	return await multi_connection_1.get().poll_until(e, t, n, a);
}
async function wait_until(e, t, n, a) {
	return await multi_connection_1.get().wait_until(e, t, n, a);
}
async function software_version(e) {
	return await multi_connection_1.get().get_software_version(e);
}
async function is_reachable(e) {
	return await multi_connection_1.get().is_reachable(e);
}
async function recovery(e) {
	return await multi_connection_1.get().recovery(e);
}
async function disconnect_from(e) {
	return await multi_connection_1.get().disconnect_from(e);
}
async function selected_application(e) {
	return "string" == typeof e && (warn(`selected_application(${e}): this syntax is deprecated and will soon be removed. Please use selected_application({ ip: ${e} }) instead`), e = {
		ip: e
	}),
	await multi_connection_1.get().selected_application((e || {}).ip);
}
async function select_application(e, t) {
	return "string" == typeof t && (warn(`select_application(${e}, ${t}): this syntax is deprecated and will soon be removed. Please use select_application(${e}, { ip: ${t} }) instead`), t = {
		ip: t
	}),
	await multi_connection_1.get().select_application(e, (t || {}).ip);
}
async function reboot(e) {
	await multi_connection_1.get().reboot(e),
	await multi_connection_1.get().component_startup(Object.assign({
		components: ["p_t_p", "r_t_p_receiver", "system", "video_transmitter"]
	}, e));
}
async function reset(e) {
	await multi_connection_1.get().reset(e),
	await multi_connection_1.get().component_startup({
		components: ["p_t_p", "r_t_p_receiver", "system", "video_transmitter"],
		ip: e ? e.ip : void 0
	});
}
async function component_startup(e) {
	return await multi_connection_1.get().component_startup(e);
}
async function with_machine(e, t) {
	return await multi_connection_1.get().with_machine(e, t);
}
function install(e, t) {
	return multi_connection_1.get().install(e, t);
}
function isIPV4Format(e) {
	return ip_1.isV4Format(e);
}
function default_ip() {
	return multi_connection_1.default_ip();
}
function assert(e) {
	if (!e)
		throw new assert_1.AssertionError({});
}
function basic_printer(e, t) {
	ConsoleIO.print(`${e}${"string"==typeof t?t:format_any(t)}`);
}
exports.execute_on = execute_on, exports.fail = fail, exports.log_to_influx = log_to_influx, exports.watch = watch, exports.watch_async = watch_async, exports.unwatch = unwatch, exports.connect_to = connect_to, exports.read = read, exports.value_update = value_update, exports.dispatch_change_request = dispatch_change_request, exports.write = write, exports.set_default_retry_interval_ms = set_default_retry_interval_ms, exports.allocated_indices = allocated_indices, exports.create_table_row = create_table_row, exports.rename_table_row = rename_table_row, exports.condition = condition, exports.is_allocated = is_allocated, exports.compare_software_versions = compare_software_versions, exports.poll_until = poll_until, exports.wait_until = wait_until, exports.software_version = software_version, exports.is_reachable = is_reachable, exports.recovery = recovery, exports.disconnect_from = disconnect_from, exports.selected_application = selected_application, exports.select_application = select_application, exports.reboot = reboot, exports.reset = reset, exports.component_startup = component_startup, exports.with_machine = with_machine, exports.install = install, exports.isIPV4Format = isIPV4Format, exports.default_ip = default_ip, exports.assert = assert;
let message_handlers = {
	info: e => basic_printer("Info: ", e),
	debug: e => basic_printer("Debug: ", e),
	warn: e => basic_printer("Warning: ", e),
	error: e => basic_printer("Error: ", "string" == typeof e ? e : format_any(e))
};
function set_message_handlers(e) {
	message_handlers = e;
}
function inform(e) {
	message_handlers.info(e);
}
function debug(e) {
	message_handlers.debug(e);
}
function warn(e) {
	message_handlers.warn(e);
}
function error(e) {
	message_handlers.error(e);
}
function expect(e, t) {
	if (!e)
		throw new Error(t);
}
function expect_eq(e, t) {
	if (e !== t)
		throw new assert_1.AssertionError({
			actual: e,
			expected: t,
			message: `expect_eq failed (should have been ${format_any(t)}, but is ${format_any(e)}`
		});
}
exports.set_message_handlers = set_message_handlers, exports.inform = inform, exports.debug = debug, exports.warn = warn, exports.error = error, exports.expect = expect, exports.expect_eq = expect_eq;
