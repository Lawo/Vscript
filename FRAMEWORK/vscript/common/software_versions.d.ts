export interface ISoftwareVersion {
    major: number;
    minor: number;
    patch: number;
    branch: string;
    commit?: string;
}
export declare function string_to_version(swv: string): ISoftwareVersion | undefined;
export declare function version_to_string(v: ISoftwareVersion): string;
export declare function compare_software_versions(s1: ISoftwareVersion, s2: ISoftwareVersion): 1 | 0 | -1;
