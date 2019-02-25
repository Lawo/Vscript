export declare const BuildInfoRequest = "build-info-request";
export declare const BuildInfoResponse = "build-info-response";
export declare const BuildInfoError = "build-info-error";
export interface IBuildInfo {
    version: string;
    built_by: string;
    timestamp: string;
    commit?: string;
    bsp_commit?: string;
    changelog: string;
}
export interface IBuildInfoRequest {
    protocol: "http" | "https";
    address: string;
}
export interface IBuildInfoResponse {
    protocol: "http" | "https";
    address: string;
    data: IBuildInfo;
}
