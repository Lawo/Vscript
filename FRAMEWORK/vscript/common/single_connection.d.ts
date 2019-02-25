import { ISoftwareVersion } from "./software_versions";
interface RowMask {
    rows: boolean[];
}
export declare class TimeoutExceeded extends Error {
    private readonly last_value;
    private readonly complaint;
    readonly name: "TimeoutExceeded";
    constructor(last_value: any | undefined, complaint?: string);
    get_last_value(): any | undefined;
    get_complaint(): string | undefined;
}
export declare function indices_of_hexmask(hexmask: string): number[];
export interface KeywordChangeRequest {
    op: "data";
    kwl: string;
    kw: {
        [kw_name: string]: any;
    };
}
export interface KWLRequest {
    op: "subscribe" | "unsubscribe" | "readAll";
    kwl: string[] | string;
}
export interface KWRequest {
    op: "readAll";
    kwl: string;
    kw: string;
}
export interface KWUnSubscriptionRequest {
    op: "subscribe" | "unsubscribe";
    kwl: string;
    kw: string[];
}
export interface SubtreePayload {
    kw: {
        [name: string]: any;
    };
    kwl: {
        [name: string]: SubtreePayload;
    };
}
export interface SubtreeChangeRequest {
    op: "tree";
    kwl: SubtreePayload;
}
export interface FlagsRequest {
    op: "flags";
    flags: {
        "report errors"?: boolean;
    };
}
export declare const enum OnTimeout {
    Discard = 0,
    Execute = 1
}
declare type UnSubscriptionRequest = KWLRequest | KWUnSubscriptionRequest;
export declare const enum ExecutionStrategy {
    Immediate = 0,
    Lazy = 1
}
declare type kw_handler = (value: any) => void;
interface oneshot_kw_handler {
    payload_handler: (value: any) => void;
    seconds_remaining: number;
}
export interface SingleConnectionParameters {
    protocol: "ws" | "wss";
    ip: string;
    port?: number;
    socket_name?: string;
}
export declare class SingleConnection {
    private static file_loader;
    private cur_listener_id;
    private online;
    private firsttime;
    private web_socket;
    private reconnect_interval;
    private tick_interval;
    private subscription_timer;
    private lazy_handler_timer;
    private kw_listeners;
    private oneshot_kwl_handlers;
    private pending_lazy_kw_updates;
    private pending_subscriptions;
    private webserver_buildinfo;
    private first_connect_handlers;
    private reconnect_handlers;
    private voluntary_disconnect_handlers;
    private involuntary_disconnect_handlers;
    private error_handlers;
    private close_handlers;
    private expecting_close;
    private readonly interval_secs;
    private row_masks;
    private row_mask_dependencies;
    private reconnect_automatically;
    readonly connection_pars: SingleConnectionParameters;
    constructor(pars: SingleConnectionParameters);
    static set_file_loader(file_loader: (ip: string, full_path: string) => Promise<any>): void;
    get_file(relative_path: string): Promise<any>;
    private get_listener_id;
    get_buildinfo(): any;
    register_void_handler(kind: "first-connect" | "reconnect" | "voluntary-disconnect" | "involuntary-disconnect" | "error", f: () => void, id: string): this;
    register_close_handler(f: (ev: CloseEvent) => void, id: string): this;
    register_event_handler(kind: "error", f: (ev: Event) => void, id: string): this;
    unregister_handler(kind: "first-connect" | "reconnect" | "voluntary-disconnect" | "involuntary-disconnect" | "error" | "close", id: string): this;
    send(srs: (KeywordChangeRequest | KWRequest | UnSubscriptionRequest | SubtreeChangeRequest | FlagsRequest)[], allow_recording?: boolean): void;
    dispatch_change_request(kwl_name: string, kw_name: string, payload: any, allow_recording?: boolean): Promise<void>;
    send_tree(full_kwl_name: string, payload: SubtreePayload): any[];
    read_all(full_kwl_name: string): void;
    read_single(full_kwl_name: string, kw_name: string): void;
    get_kw_listeners(): {
        [full_kwl_name: string]: {
            [kw_name: string]: {
                kw_handlers: {
                    [handler_id: string]: {
                        handler: kw_handler;
                        execution_strategy: ExecutionStrategy;
                    };
                };
                oneshot_kw_handlers: {
                    [handler_id: string]: oneshot_kw_handler;
                };
            };
        };
    };
    component_is_online(component_name: string, pars?: {
        timeout?: number;
        mode?: "check" | "enforce";
    }): Promise<boolean>;
    selected_application(): Promise<"streaming" | "streaming_40gbe" | "multiviewer" | "multiviewer_40gbe">;
    read(kwl_name: string, kw_name: string, options?: {
        check_component_liveness?: boolean;
        timeout?: number;
    }): Promise<any>;
    value_update(kwl_name: string, kw_name: string, timeout?: number): Promise<{}>;
    get_software_version(maybe_partition?: "recovery" | "system0" | "system1"): Promise<ISoftwareVersion | null>;
    poll_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean | string, pars?: {
        timeout?: number;
        poll_interval_ms?: number;
    }): Promise<any>;
    wait_until(kwl_name: string, kw_name: string, criterion: (payload: any) => boolean | string, pars?: {
        timeout?: number;
    }): Promise<any>;
    allocated_indices(table_name: string): Promise<number[]>;
    is_allocated(table_name: string, index: number): Promise<boolean>;
    write(kwl: string, kw: string, value: any, options?: {
        check_component_liveness?: boolean;
        timeout?: number;
        payload_validator?: (payload: any) => boolean;
        retry_until?: () => Promise<string | boolean>;
        retry_interval_ms?: number;
    }): Promise<void>;
    private ensure_kw_listener;
    register_oneshot_kw_listener(pars: {
        full_kwl_name: string;
        kw_name: string;
        listener_id: string;
    }, payload_handler: kw_handler, ttl_secs?: number): void;
    register_oneshot_kwl_handler(pars: {
        full_kwl_name: string;
        listener_id: string;
    }, handler: () => void, timeout_mode: OnTimeout, ttl_secs?: number): void;
    create_table_row(table_kwl: string, pars?: {
        desired_index?: number;
        desired_name?: string;
        timeout?: number;
    }): Promise<[number, string] | null>;
    private renew_subscriptions;
    rename_table_row(full_kwl_name: string, desired_name: string): Promise<void>;
    register_kw_listener(pars: {
        full_kwl_name: string;
        kw_name: string;
        listener_id: string;
        execution_strategy: ExecutionStrategy;
    }, handler: kw_handler): void;
    unregister_kw_listeners(pars: {
        full_kwl_name: string;
    }, criterion: (pars: {
        kw_name: string;
        listener_id: string;
        oneshot: boolean;
    }) => boolean): void;
    private demand_subscription;
    private execute_subscription_demands;
    private execute_lazy_handlers;
    connect(): Promise<{}>;
    disconnect(): void;
    private handle_incoming;
    private tick;
    get_row_mask(table_name: string): RowMask;
    row_is_live(table_name: string, index: number): boolean;
    is_live(full_kwl_name: string): boolean;
    register_rowmask(table_name: string, num_rows: number): void;
    register_single_rowmask_listener(pars: {
        table_name: string;
        listener_id: string;
    }, handler?: () => void): void;
    conditionally_unregister_single_rowmask_listener(outer_pars: {
        table_name: string;
    }, criterion: (pars: {
        listener_id: string;
    }) => boolean): void;
    unregister_single_rowmask_listener(pars: {
        table_name: string;
        instantiation_site: string;
    }): void;
    private process_rowmask;
    is_online(): boolean;
}
export declare function blade_con(): SingleConnection;
export declare function setup_single_blade_connection(pars: SingleConnectionParameters): SingleConnection;
export {};
