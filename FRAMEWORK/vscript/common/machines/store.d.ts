import { SingleConnection } from "../single_connection";
import { ISoftwareVersion } from "../software_versions";
export declare const enum Phase {
    Connecting = 0,
    Idle = 1,
    NoContact = 2,
    UploadingInstaller = 3,
    ReadyToInstall = 4,
    SoftwareUpdateFailed = 5,
    Installing = 6,
    Rebooting = 7
}
export declare type Partition = "recovery" | "system0" | "system1";
export interface INeighborInfo {
    hostname: string;
    interfaces: {
        ifname: string;
        ifaddr: string;
    }[];
    ingress_timestamp: Date;
}
export interface IMachine {
    con: SingleConnection;
    local_id: string;
    phase: Phase;
    short_desc?: string;
    towel?: string;
    active_partition?: Partition;
    software_version?: ISoftwareVersion;
    partitions: {
        recovery?: ISoftwareVersion;
        system0?: ISoftwareVersion;
        system1?: ISoftwareVersion;
    };
    watchdog?: {
        major: number;
        minor: number;
    };
    watched_neighbor: INeighborInfo | null;
    hostname?: string;
}
export declare type IMachineDict = {
    [local_id: string]: IMachine;
};
export declare type IMachineState = {
    machines_by_id: IMachineDict;
    pending_find_requests: string[];
};
export declare type IPersistentMachine = {
    protocol: "ws" | "wss";
    ip: string;
};
export declare type IPersistentMachineV0 = {
    protocol: "ws" | "wss";
    address: string;
};
export declare type IPersistentMachineState = {
    machines: IPersistentMachine[];
    version: "1";
};
export declare type IPersistentMachineStateV0 = {
    machines: IPersistentMachineV0[];
    version: "0";
};
export declare function get_machines(state: IMachineState): IMachine[];
