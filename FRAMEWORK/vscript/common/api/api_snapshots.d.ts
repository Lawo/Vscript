export declare function retrieve_snapshot(pars: {
    ip: string;
    kill_processes: boolean;
    snapshot_dir: string;
    generate_ip_config_if_missing: boolean;
}): Promise<void>;
export declare function restore_snapshot(pars: {
    ip: string;
    snapshot_dir: string;
    include_ip_config: boolean;
    include_hostname: boolean;
}): Promise<void>;
