/// <reference types="node" />
export declare function get(pars: {
    protocol: "http" | "https";
    address: string;
    path: string;
}): Promise<string | Buffer>;
