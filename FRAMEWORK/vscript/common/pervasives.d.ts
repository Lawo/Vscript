export declare enum KeywordType {
    UserOwnedEvent = 0,
    DriverOwnedEvent = 1,
    Command = 2,
    Status = 3,
    Duplex = 4
}
export declare type kw_data_type = "bool" | "int" | "float" | "float duration" | "int duration" | "string" | "timestamp" | "ipaddress" | "enum" | "timecode" | "ref" | "device_tree_node";
export declare type data_type = "subtree" | "atomic subtree" | kw_data_type;
export declare type kw_type = "event" | "driver-owned event" | "status" | "command" | "duplex";
export declare function starts_with(s: string, prefix: string): boolean;
export declare function index_range(i_min: number, i_max: number): number[];
export declare function attach_index(basename: string, i: number): string;
export declare function remove_trailing_index(full_kwl_name: string): string;
export declare function component_name(kwl_name: string): string;
export declare function index_of_kwl_name(kwl_name: string): number;
export declare function path_concat(base: string, suffix: string): string;
export declare function path_base(path: string): string;
export declare function path_parent(path: string): string;
export declare function path_hd(path: string): string;
export declare function path_tl(path: string): string;
export declare function remove_all_indices(full_kwl_name: string): string;
export declare function log(whatever: any): void;
export declare function set_debug_log(b: boolean): void;
export declare function md_verbatim(s: string): string;
export declare function hex_to_dec(char: string): number;
export declare function normalize_local_id(local_id: string): string;
export declare function normalize_address(address: string): string;
export declare function strip_ansi_escape_codes(str: string): string;
export declare function strip_all_whitespace(s: string): string;
export declare function strip_surrounding_whitespace(s: string): string;
export declare function is_normalized_int_duration(s: string): boolean;
export declare function is_normalized_float_duration(s: string): boolean;
export declare function string_duration_to_seconds(string_dur: string, allow_undefined?: boolean): number | undefined;
export declare function string_duration_to_nanoseconds(string_dur: string, allow_undefined?: boolean): number | undefined;
export declare function beautify_duration(duration_in_seconds: number): string;
export declare function beautify_timestamp(timestamp: number): string;
