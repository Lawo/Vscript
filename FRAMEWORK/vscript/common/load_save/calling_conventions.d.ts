import { SingleConnection } from "../single_connection";
import { ISavedKeyword } from "./raw_settings";
import { LoadWorkspace } from "./load_workspace";
export declare type KeywordFilterParameters = {
    full_kwl_name: string;
    name: string;
    data: any;
    isDefault: boolean;
};
declare type KeywordFilter = (pars: KeywordFilterParameters) => boolean | undefined;
export declare type KeywordMapParameters = {
    full_kwl_name: string;
    name: string;
    data: any;
    isDefault: boolean;
};
declare type KeywordMap = (pars: KeywordMapParameters) => any | undefined;
declare type KeywordListFilter<T> = (pars: {
    full_kwl_name: string;
    name: string;
    data: T;
}) => boolean | undefined;
export declare type KeywordListMapParameters<T> = {
    full_kwl_name: string;
    name: string;
    data: T;
};
declare type KeywordListMap<T> = (pars: KeywordListMapParameters<T>) => T | undefined;
export interface IFilterParameters<T> {
    f_kwl?: KeywordListFilter<T>;
    f_kw?: KeywordFilter;
    recursion_depth?: number;
}
export interface IMapParameters<T> {
    f_kwl?: KeywordListMap<T>;
    f_kw?: KeywordMap;
    recursion_depth?: number;
}
export interface IReifiedFilterParameters<T> {
    f_kwl: KeywordListFilter<T>;
    f_kw: KeywordFilter;
    recursion_depth: number;
}
export interface IReifiedMapParameters<T> {
    f_kwl: KeywordListMap<T>;
    f_kw: KeywordMap;
    recursion_depth: number;
}
export declare type IDuplexDisambiguator = (pars: {
    full_kwl_name: string;
    name: string;
    status: any;
    command: any;
}) => Promise<any>;
export interface IUndumpParameters {
    ip?: string;
    skip_defaults?: boolean;
    workspace: LoadWorkspace;
    disambiguate_duplex?: IDuplexDisambiguator;
}
export interface IReifiedUndumpParameters {
    connection: SingleConnection;
    skip_defaults: boolean;
    workspace: LoadWorkspace;
    disambiguate_duplex?: IDuplexDisambiguator;
}
export declare function skip_defaults(pars?: IUndumpParameters): boolean;
export declare function reuse_named_rows(pars?: IScaffoldParameters): boolean;
export declare function reify_filter_parameters(pars: IFilterParameters<any>): IReifiedFilterParameters<any>;
export declare function reify_map_parameters(pars: IMapParameters<any>): IReifiedMapParameters<any>;
export interface IReifiedScaffoldParameters {
    connection: SingleConnection;
    reuse_named_rows: boolean;
    unnamed_row_creators: {
        [branch_name: string]: ((full_kwl_name: string) => Promise<number | null>);
    };
    unnamed_row_deleters: {
        [branch_name: string]: (full_kwl_name: string, index: number) => Promise<boolean>;
    };
    workspace: LoadWorkspace;
}
export interface IScaffoldParameters {
    ip?: string;
    reuse_named_rows?: boolean;
    unnamed_row_creators?: {
        [branch_name: string]: ((full_kwl_name: string) => Promise<number | null>);
    };
    unnamed_row_deleters?: {
        [branch_name: string]: (full_kwl_name: string, index: number) => Promise<boolean>;
    };
    workspace?: LoadWorkspace;
}
export declare type IKeywordComparator = (full_kwl_name: string, name: string, payload_a: ISavedKeyword, payload_b: ISavedKeyword) => boolean;
export {};
