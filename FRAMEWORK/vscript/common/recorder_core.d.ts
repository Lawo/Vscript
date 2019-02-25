import { ReifiedSetCommand } from "./multiedit_core";
import { SingleConnection } from "./single_connection";
export declare function set_recorder_state(b: boolean): void;
export declare function toggle_recorder_state(): void;
export declare function recorder_is_active(): boolean;
export declare class SingleRecordEntry {
    timestamp: Date;
    kwl: string;
    kw: string;
    data: any;
    con: SingleConnection;
    constructor(kwl: string, kw: string, data: any, con: SingleConnection);
}
export declare class MultiRecordEntry {
    timestamp: Date;
    set_command: ReifiedSetCommand;
    constructor(sc: ReifiedSetCommand);
}
export declare class CreateRowEntry {
    timestamp: Date;
    table_kwl: string;
    desired_index?: number;
    desired_name?: string;
    constructor(pars: {
        table_kwl: string;
        desired_index?: number;
        desired_name?: string;
    });
}
export declare class AwaitEntry {
    timestamp: Date;
    kwl: string;
    kw: string;
    constructor(kwl: string, kw: string);
}
export declare class PauseEntry {
    timestamp: Date;
    waiting_time_seconds: number;
    constructor(wts: number);
}
export declare class BlockingReadEntry {
    timestamp: Date;
    kwl: string;
    kw: string;
    var_name: string;
    constructor(pars: {
        var_name: string;
        full_kwl_name: string;
        kw_name: string;
    });
}
export declare class ExpectEntry {
    timestamp: Date;
    kwl: string;
    kw: string;
    condition_string: string;
    constructor(pars: {
        full_kwl_name: string;
        kw_name: string;
        condition_string: string;
    });
}
export declare class WaitUntilEntry {
    timestamp: Date;
    kwl: string;
    kw: string;
    condition_string: string;
    timeout: number;
    constructor(pars: {
        full_kwl_name: string;
        kw_name: string;
        condition_string: string;
        timeout: number;
    });
}
export declare type RecordEntry = SingleRecordEntry | MultiRecordEntry | CreateRowEntry | AwaitEntry | PauseEntry | BlockingReadEntry | ExpectEntry | WaitUntilEntry;
export declare function get_record_log(): RecordEntry[];
export declare function clear_record_log(): void;
export declare function on_recorder_update_do(f: () => void): void;
export declare function force_push_record(entry: RecordEntry): void;
export declare function maybe_push_record(entry: RecordEntry): void;
export declare function suspend_macro_recording(): boolean;
export declare function resume_macro_recording(): void;
