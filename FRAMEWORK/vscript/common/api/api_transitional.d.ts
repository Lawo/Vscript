export declare function create_unnamed_table_row(table_name: string, create_path_or_fn: string | (() => Promise<void>), pars?: {
    ip?: string;
    timeout?: number;
    accept_overallocation?: boolean;
}): Promise<number>;
export declare function delete_unnamed_table_row(table_name: string, index: number, delete_path: string, pars?: {
    ip?: string;
    timeout?: number;
}): Promise<void>;
export declare function create_or_reuse_table_row(table_name: string, create_path_or_fn: string | (() => Promise<void>), constructing_fn: (index: number, ip: string) => any, pars: {
    ip?: string;
    index?: number;
}): Promise<any>;
export declare function used_rows(table_name: string, pars?: {
    ip?: string;
}): Promise<string[]>;
