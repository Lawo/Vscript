import { ISoftwareVersion } from "../../common/software_versions";
import * as Influx from "influx";
export declare function name_hd(name: string): string;
export declare function path_parent(name: string): string;
export declare function name_tl(name: string): string;
export declare function path_base(name: string): string;
export declare function path_hd(name: string): string;
export declare function path_tl(name: string): string;
export declare function remove_all_indices(name: string): string;
export declare function index_of_kwl_name(kwl_name: string): number;
export declare function version_to_string(swv: ISoftwareVersion): string;
export declare function string_to_version(s: string): ISoftwareVersion | undefined;
export declare function format_any(e: any): string;
/**
 * pauses for <seconds> seconds. Example: await pause(2)
 */
export declare function pause(waiting_time_in_seconds: number): Promise<void>;
/**
 * pauses for <milliseconds> milliseconds. Example: await pause_ms(2000)
 */
export declare function pause_ms(waiting_time_in_milliseconds: number): Promise<void>;
export declare function execute_on(pars: {
    ip: string;
    cmd: string;
    onStdout: (data: any) => void;
    onStderr: (data: any) => void;
    username?: string;
    password?: string;
    keyfile?: string;
}): Promise<{}>;
/**
 * aborts macro execution with error message <message>.
 * Example: fail("unable to open connection to receiver")
 */
export declare function fail(msg: string): void;
export declare function log_to_influx(measurement: string, data: Influx.IPoint[], maybe_host?: string, maybe_database?: string): Promise<void>;
/**
 * subscribes to <kwl_name>.<kw_name> and executes <handler> on every incoming
 * value. If <ip> is left unspecified, the current default connection
 * (previously established via connect_to) will be used.
 * Example: let old_state; watch("p_t_p_clock", "state", (new_state: string) =>
 *   { if ((typeof old_state === "string" &&
 *          old_state.match(/^Calibrated/) !== null) &&
 *          new_state === "Uncalibrated") {
 *            warn("PTP clock changed from calibrated to uncalibrated");
 *          }
 *    })
 * Returns a watcher object that can later be passed to unwatch
 */
export declare function watch(kwl_name: string, kw_name: string, handler: (payload: any) => void, pars?: {
    ip?: string;
} | string): Promise<{
    kwl_name: string;
    kw_name: string;
    id: number;
    ip: string;
}>;
/**
 * subscribes to <kwl_name>.<kw_name> and executes <handler> on every incoming
 * value. If <ip> is left unspecified, the current default connection
 * (previously established via connect_to) will be used.
 *
 * Returns a watcher object that can later be passed to unwatch
 */
export declare function watch_async(kwl_name: string, kw_name: string, handler: (payload: any) => Promise<void>, pars?: {
    ip?: string;
} | string): Promise<{
    kwl_name: string;
    kw_name: string;
    id: number;
    ip: string;
}>;
/**
 * removes the watchpoint previously set up by watch.
 * Example: let watcher = watch("some_kwl", "some_kw", (payload) => { (...) });
 *          (...);
 *          await unwatch(watcher)
 */
export declare function unwatch(watcher: {
    kwl_name: string;
    kw_name: string;
    id: number;
    ip: string;
}): Promise<void>;
/**
 * connects to <ip> and uses it as the default target for all subsequent
 * operations (unless otherwise specified).
 * Example: await connect_to("172.16.1.23")
 */
export declare function connect_to(ip: string): Promise<void>;
/**
 * attempts to read <kwl_name>.<kw_name> from <ip>. If <ip> is left
 * unspecified, the current default connection (previously established via
 * connect_to) will be used.
 * Example: let uptime_in_nanoseconds = await read("system.sysinfo", "uptime");
 */
export declare function read(kwl_name: string, kw_name: string, pars?: {
    ip?: string;
    timeout?: number;
    check_component_liveness?: boolean;
} | string): Promise<any>;
/**
 * waits for <kwl_name>.<kw_name> to change, or until <timeout> expires. If
 * <ip> is left unspecified, the current default connection (previously established
 * via connect_to) will be used.
 * Example: await value_update("system.sysinfo", "uptime");
 */
export declare function value_update(kwl_name: string, kw_name: string, options?: {
    ip?: string;
    timeout?: number;
}): Promise<void>;
/**
 * attempts to change <kwl_name>.<kw_name> to <payload>. If <ip> is left
 * unspecified, the current default connection (previously established via
 * connect_to) will be used. This function returns immediately and will silently
 * fail if the requested change operation cannot be executed.
 * Example: dispatch_change_request("system.usrinfo", "cur_status", "some_status");
 */
export declare function dispatch_change_request(kwl_name: string, kw_name: string, payload: any, pars?: {
    ip?: string;
} | string): Promise<void>;
/**
 * attempts to change <kwl_name>.<kw_name> to <payload> and verifies if the
 * payload has been accepted by the target machine. If <ip> is left unspecified,
 * the current default connection (previously established via connect_to) will be
 * used. If <kw_name> designates the input section of a duplex field (e.g.,
 * "active_command"), write will compare the given payload against the
 * corresponding status field (e.g., "active_status"); this default validity check
 * can be overriden by <retry_until>, a Promise that should return true on success
 * and either false on failure, or a string explaining why the current state is
 * considered unsatisfactory.
 * Example: await write("r_t_p_receiver.sessions[0]", "active_command", true)
 */
export declare function write(kwl_name: string, kw_name: string, payload: any, options?: {
    check_component_liveness?: boolean;
    timeout?: number;
    payload_validator?: (payload: any) => boolean;
    retry_until?: () => Promise<string | boolean>;
    retry_interval_ms?: number;
    ip?: string;
}): Promise<void>;
export declare function set_default_retry_interval_ms(new_default?: number): void;
/**
 * returns the currently allocated indices of table <table_kwl>. If <ip> is
 * left unspecified, the current default connection (previously established via
 * connect_to) will be used.
 * Example: let indices = await allocated_indices("r_t_p_receiver.sessions")
 * returns indices = [0, 2] if sessions[0] and sessions[2] are currently allocated
 */
export declare function allocated_indices(table_kwl: string, pars?: {
    ip?: string;
} | string): Promise<number[] | void>;
/**
 * attempts to create a new row within table <table_name>, returning the newly
 * created row's index and name if successful and null otherwise. If neither
 * <desired_index> nor <desired_name> are specified, the system will choose an
 * unoccupied row index at its own discretion. If <ip> is left unspecified, the
 * current default connection (previously established via connect_to) will be
 * used.
 * Example: let maybe_row = await create_table_row("a_v_crossbar.pool", {
 * desired_name: "my crossbar" }) may return [0, "my crossbar"]
 */
export declare function create_table_row(table_kwl: string, pars?: {
    desired_index?: number;
    desired_name?: string;
    timeout?: number;
    ip?: string;
}): Promise<[number, string] | null>;
export declare function rename_table_row(full_kwl_name: string, desired_name: string, pars?: {
    timeout?: number;
    ip?: string;
}): Promise<void>;
/**
 * repeatedly evaluates <predicate> until it evaluates to true, or until the
 * timeout expires (specified in seconds by <options.timeout>). Fails with error
 * message <options.failure_msg> on timeout expiration.
 * Example: await condition(async () => {
 *                  return calibration_state() === "Calibrated";
 *                }, { timeout: 60,
 *                     failure_msg: "failed to calibrate within one minute"
 *                   });
 */
export declare function condition(predicate: () => Promise<boolean>, options?: {
    timeout?: number;
    failure_msg?: string;
}): Promise<void>;
/**
 * checks whether <table_name>[<index>] is currently allocated. If <ip> is
 * left unspecified, the current default connection (previously established via
 * connect_to) will be used.
 * Example: let session_zero_is_allocated =
 *               await is_allocated("r_t_p_receiver.sessions", 0)
 * returns true if and only if sessions[0] is currently allocated
 */
export declare function is_allocated(table_kwl: string, index: number, pars?: {
    ip?: string;
} | string): Promise<boolean | void>;
/**
 * compares two software version objects (as obtained from software_version()),
 * returning "first-is-newer", "equal", or "first-is-older".
 */
export declare function compare_software_versions(s1: ISoftwareVersion, s2: ISoftwareVersion): "first-is-newer" | "equal" | "first-is-older";
/**
 * repeatedly reads <kwl_name>.<kw_name> until either <criterion> is
 * satisfied, or the timeout expires. <criterion> should return true on success and
 * either false on failure, or a string explaining why the received value was
 * considered unsatisfactory. If <ip> is left unspecified, the current default
 * connection (previously established via connect_to) will be used.
 */
export declare function poll_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean | string, options?: {
    poll_interval_ms?: number;
    timeout?: number;
}): Promise<any>;
/**
 * monitors <kwl_name>.<kw_name> until the timeout expires
 * (specified in seconds by <timeout>, 5 by default) and returns with the
 * first value satisfying <criterion> (<criterion> should return true
 * on success and either false on failure, or a string explaining why the
 * current value is considered unsatisfactory). If <ip> is left unspecified,
 * the current default connection (previously established via connect_to)
 * will be used.
 * Example: let first_non_null_value =
 *   await wait_until("i_o_module.output[0].sdi.vid_src", "in_phase",
 *         (phase) => { return phase !== null; }, { timeout: 60 });
 */
export declare function wait_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean, options?: {
    ip?: string;
    timeout?: number;
}): Promise<any>;
/**
 * returns the software version string currently reported for
 * <partition>, or for the currently active partition if <partition>
 * is left unspecified. If <ip> is left unspecified, the current
 * default connection (previously established via connect_to) will
 * be used. Returns null if the software version is unknown
 * (this will be the case if the installed software predates v1.4).
 * Example: let version = await software_version({ ip: "172.16.1.23" })
 */
export declare function software_version(options?: {
    partition?: "recovery" | "system0" | "system1";
    ip?: string;
}): Promise<ISoftwareVersion | null>;
export declare function is_reachable(ip: string): Promise<boolean>;
/**
 * monitors <ip> for up to <timeout> seconds (120 by default), returns
 * on successful reconnect. If <ip> is left unspecified, the current
 * default connection (previously established via connect_to) will be used.
 * Example: await recovery(some_machine_that_had_just_been_rebooted)
 */
export declare function recovery(pars: {
    ip?: string;
    timeout?: number;
}): Promise<void>;
/**
 * disconnects from <ip>, unregistering all previously registered watchpoints
 * and removing the towel (if any).
 * Example: await disconnect_from("172.16.1.23")
 */
export declare function disconnect_from(ip: string): Promise<void>;
/**
 * returns the currently selected application. If <ip> is left unspecified,
 * the current default connection (previously established via connect_to) will
 * be used.
 * Example: expect_eq("streaming", await selected_application("172.16.1.23"))
 */
export declare function selected_application(pars?: {
    ip?: string;
} | string): Promise<"streaming" | "streaming_40gbe" | "multiviewer" | "multiviewer_40gbe" | undefined>;
/**
 * reboots into <application> if necessary; does nothing if the desired
 * application is already active. If <ip> is left unspecified, the current
 * default connection (previously established via connect_to) will be used.
 * Example: await select_application("streaming")
 */
export declare function select_application(application: "STREAMING" | "STREAMING_40GbE" | "MULTIVIEWER" | "MULTIVIEWER_40GbE", pars?: {
    ip?: string;
} | string): Promise<void>;
/**
 * sends a reboot command to <ip> and waits for up to <timeout> seconds to
 * reconnect (120 by default). Does not verify if the reboot command has
 * actually been executed. If <ip> is left unspecified, the current default
 * connection (previously established via connect_to) will be used.
 * Example: await reboot({ ip: "172.1.2.3" })
 */
export declare function reboot(pars: {
    ip?: string;
    timeout?: number;
}): Promise<void>;
/**
 * sends a reset command to <ip> and waits for up to <timeout> seconds to
 * reconnect (120 by default). Does not verify if the reset command has
 * actually been executed. If <ip> is left unspecified, the current default
 * connection (previously established via connect_to) will be used.
 * Example: await reset({ ip:"172.1.2.3" })
 */
export declare function reset(pars: {
    ip?: string;
    timeout?: number;
}): Promise<void>;
export declare function component_startup(pars: {
    ip?: string;
    timeout: number;
    components: string[];
}): Promise<void>;
/** @deprecated */
export declare function with_machine(ip: string, f: () => Promise<any>): Promise<any>;
export declare function install(filename: string, maybe_ip?: string): Promise<void>;
/**
 * returns true if the given address is a valid IPv4 address
 */
export declare function isIPV4Format(ip: string): boolean;
export declare function default_ip(): string | null;
/**
 * terminates macro if <condition> is false.
 * Example: assert(measured_property < some_threshold)
 */
export declare function assert(condition: boolean): void;
export interface IMessageHandlers {
    info: (msg: any) => void;
    debug: (msg: any) => void;
    warn: (msg: any) => void;
    error: (msg: any) => void;
}
export declare function set_message_handlers(handlers: IMessageHandlers): void;
/**
 * logs <message> with severity level 'info'. Example: log("this is a test")
 */
export declare function inform(message: any): void;
/**
 * logs <message> with severity level 'debug'. Example: debug("this information is irrelevant to end users")
 */
export declare function debug(message: any): void;
/**
 * logs <message> with severity level 'warning'. Example: warn("impending buffer overflow in less than 60 minutes")
 */
export declare function warn(message: any): void;
/**
 * logs <message> with severity level 'error'. Example: error("loss of signal detected")
 */
export declare function error(message: any): void;
/**
 * terminates macro if <condition> is false, prints <error_msg> if one is given.
 * Example: expect(measured_property < some_threshold, "property exceeds threshold")
 */
export declare function expect(condition: boolean, error_msg?: string): void;
/**
 * terminates macro with error message if a !== b.
 * Example: expect_eq(7, (6 + 1))
 */
export declare function expect_eq(a: any, b: any): void;
