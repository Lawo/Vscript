export interface ISavedKeyword {
    data: any;
    isDefault?: boolean;
}
export interface ISavedAnonymousSubtree {
    kw?: {
        [name: string]: ISavedKeyword;
    };
    kwl?: {
        [name: string]: ISavedKWLNode;
    };
}
export interface ISavedNamedRow extends ISavedAnonymousSubtree {
    id: string;
    idx: number;
}
export interface ISavedNamedTable {
    ["named-rows"]: ISavedNamedRow[];
}
export declare type ISavedKWLNode = ISavedAnonymousSubtree | ISavedNamedTable;
export interface ISettingsHeader {
    fpga: string;
    version: [string, string];
}
export interface ISavedState {
    format: string;
    header: ISettingsHeader;
    components: {
        [component_name: string]: ISavedAnonymousSubtree;
    };
}
