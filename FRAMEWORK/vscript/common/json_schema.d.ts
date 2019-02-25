import { kw_type } from "./pervasives";
export declare type OtherNodeProperties = {
    formatter?: string;
    filter?: string;
    visibility?: "basic" | "advanced" | "developer";
};
export interface CommonNodeProperties {
    sys_name: string;
    ua_name: string;
    brief?: string;
    desc?: string;
    persistent: boolean;
    other_properties: OtherNodeProperties;
}
export interface JSSubtreeDescription extends CommonNodeProperties {
    data_type: "subtree";
    array_size?: number;
    table_size?: number;
    named_rows?: boolean;
    owning_module?: string;
    type_identifier: string;
    parent?: JSSubtreeDescription;
    children: JSChildDescription[];
}
export declare function is_subtree_description(js: any): js is JSSubtreeDescription;
export interface JSAtomicSubtreeDescription extends CommonNodeProperties {
    data_type: "atomic subtree";
    kw_type: kw_type;
    array_size?: number;
    optional: boolean;
    parent?: JSSubtreeDescription;
    children: JSKeywordDescription[];
}
export declare function is_atomic_subtree_description(js: any): js is JSAtomicSubtreeDescription;
export interface JSStringDescription extends CommonNodeProperties {
    data_type: "string";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    max_length: number;
    default_value?: string;
}
export interface JSNumberDescription extends CommonNodeProperties {
    data_type: "int" | "float";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    min: number;
    max: number;
    default_value?: number;
}
export interface JSDeviceTreeNodeDescription extends CommonNodeProperties {
    data_type: "device_tree_node";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
}
export interface JSReferenceDescription extends CommonNodeProperties {
    data_type: "ref";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    default_value?: string;
    target_type_identifier: string;
    target_type: "subtree";
    ref_perm: "mutating" | "non-mutating";
}
export interface JSEnumDescription extends CommonNodeProperties {
    data_type: "enum";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    default_value?: string;
    enum_values: string[];
}
export interface JSBoolDescription extends CommonNodeProperties {
    data_type: "bool";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    default_value?: boolean;
}
export interface JSDurationDescription extends CommonNodeProperties {
    data_type: "float duration" | "int duration";
    kw_type: kw_type;
    min: string;
    max: string;
    optional: boolean;
    array_size?: number;
    default_value?: string;
}
export interface JSTimecodeDescription extends CommonNodeProperties {
    data_type: "timecode";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    default_value?: number;
}
export interface JSTimestampDescription extends CommonNodeProperties {
    data_type: "timestamp";
    kw_type: kw_type;
    min?: number;
    max?: number;
    optional: boolean;
    array_size?: number;
    default_value?: string;
}
export interface JSIPAddressDescription extends CommonNodeProperties {
    data_type: "ipaddress";
    kw_type: kw_type;
    optional: boolean;
    array_size?: number;
    default_value?: string;
}
export interface JSComponentDescription extends JSSubtreeDescription {
    owning_module: string;
}
export declare type JSKeywordDescription = JSTimestampDescription | JSIPAddressDescription | JSBoolDescription | JSEnumDescription | JSStringDescription | JSNumberDescription | JSDeviceTreeNodeDescription | JSReferenceDescription | JSDurationDescription | JSTimecodeDescription;
export declare type JSChildDescription = JSSubtreeDescription | JSAtomicSubtreeDescription | JSKeywordDescription;
