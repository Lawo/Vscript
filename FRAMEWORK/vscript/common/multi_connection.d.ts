import { SingleConnection } from "./single_connection";
import { ISoftwareVersion } from "../common/software_versions";
export declare class MultiConnection {
    private listener_id;
    private single_connection_registry;
    private locked_machines;
    private default_connection?;
    private with_machine_connection;
    private lock_status;
    private lock_towel;
    private static DEFAULT_TIMEOUT_SECS;
    private default_retry_interval_ms?;
    constructor(lock_towel: string, lock_status: string);
    private static connect_with_timeout;
    private add_if_missing;
    private get_connection;
    private remove_towel;
    private unlock;
    private lock;
    private place_towel;
    get_default_connection(): SingleConnection | undefined;
    set_default_retry_interval_ms(new_default?: number): void;
    is_reachable(ip: string): Promise<boolean>;
    cleanup(): Promise<void>;
    get_connection_or_default(pars?: {
        ip?: string;
        timeout?: number;
    }): Promise<SingleConnection>;
    get_software_version(options?: {
        partition?: "recovery" | "system0" | "system1";
        ip?: string;
    }): Promise<ISoftwareVersion | null>;
    set_default_ip(ip: string): Promise<void>;
    disconnect_from(ip: string): Promise<void>;
    install(filename: string, maybe_ip?: string): Promise<void>;
    selected_application(ip?: string): Promise<"streaming" | "streaming_40gbe" | "multiviewer" | "multiviewer_40gbe" | undefined>;
    select_application(application: "STREAMING" | "STREAMING_40GbE" | "MULTIVIEWER" | "MULTIVIEWER_40GbE", ip?: string): Promise<void>;
    with_machine(ip: string, f: () => Promise<any>): Promise<any>;
    recovery(pars?: {
        ip?: string;
        timeout?: number;
    }): Promise<void>;
    watch(kwl_name: string, kw_name: string, handler: (payload: any) => void, ip?: string): Promise<{
        kwl_name: string;
        kw_name: string;
        id: number;
        ip: string;
    }>;
    watch_async(kwl_name: string, kw_name: string, handler: (payload: any) => Promise<void>, ip?: string): Promise<{
        kwl_name: string;
        kw_name: string;
        id: number;
        ip: string;
    }>;
    unwatch(watcher: {
        kwl_name: string;
        kw_name: string;
        id: number;
        ip: string;
    }): Promise<void>;
    component_startup(pars: {
        ip?: string;
        timeout?: number;
        components: string[];
    }): Promise<void>;
    reboot(pars?: {
        ip?: string;
        timeout?: number;
        components_to_wait_for?: string[];
    }): Promise<void>;
    reset(pars?: {
        ip?: string;
        timeout?: number;
        components_to_wait_for?: string[];
    }): Promise<void>;
    create_table_row(table_kwl: string, pars?: {
        desired_index?: number;
        desired_name?: string;
        timeout?: number;
        ip?: string;
    }): Promise<[number, string] | null>;
    rename_table_row(full_kwl_name: string, desired_name: string, pars?: {
        timeout?: number;
        ip?: string;
    }): Promise<void>;
    read(kwl_name: string, kw_name: string, pars?: {
        ip?: string;
        timeout?: number;
        check_component_liveness?: boolean;
    }): Promise<any>;
    value_update(kwl_name: string, kw_name: string, options?: {
        ip?: string;
        timeout?: number;
    }): Promise<void>;
    dispatch_change_request(kwl_name: string, kw_name: string, payload: any, maybe_ip?: string): Promise<void>;
    write(kwl: string, kw: string, payload: any, options?: {
        check_component_liveness?: boolean;
        timeout?: number;
        payload_validator?: (payload: any) => boolean;
        retry_until?: () => Promise<string | boolean>;
        retry_interval_ms?: number;
        ip?: string;
    }): Promise<void>;
    poll_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean | string, options?: {
        poll_interval_ms?: number;
        timeout?: number;
    }): Promise<any>;
    wait_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean | string, options?: {
        ip?: string;
        timeout?: number;
    }): Promise<any>;
    allocated_indices(table_name: string, maybe_ip?: string): Promise<number[]>;
    is_allocated(table_name: string, index: number, maybe_ip?: string): Promise<boolean>;
}
export declare function get(): MultiConnection | null;
export declare function exit_handler(exit_code: number, final_action: () => void): Promise<void>;
export declare function initialize(lock_towel: string, lock_status: string): void;
export declare function default_ip(): string | null;
