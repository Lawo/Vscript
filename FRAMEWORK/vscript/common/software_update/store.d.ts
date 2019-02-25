export declare const enum Type {
    SoftwareInstaller = 0
}
export declare const enum TrustLevel {
    Unverified = 0,
    MachineVerified = 1
}
export declare type IInstaller = {
    type: Type;
    trust_level: TrustLevel;
    id: string;
    name: string;
    filename: string;
};
export declare type IInstallerDict = {
    [id: string]: IInstaller;
};
export declare type IInstallerState = {
    installers_by_id: IInstallerDict;
};
