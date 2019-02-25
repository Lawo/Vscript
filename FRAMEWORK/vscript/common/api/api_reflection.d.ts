import { JSChildDescription, JSKeywordDescription, JSAtomicSubtreeDescription, JSSubtreeDescription, JSComponentDescription } from "../json_schema";
import { SingleConnection } from "../single_connection";
import { IBuildInfo } from "../build_info/build_info";
export declare type IStateDescription = {
    build_info: IBuildInfo;
    typedefs: {
        [name: string]: JSChildDescription;
    };
    state: JSComponentDescription[];
};
export declare function get_build_info(maybe_ip?: string): Promise<IBuildInfo>;
export declare function get_state_description(maybe_ip?: string): Promise<null | IStateDescription>;
export declare function count_keywords<TStateDesc extends IStateDescription>(con: SingleConnection, state_description: TStateDesc, skip: (child: JSChildDescription, parent_kwl: string | null) => boolean): Promise<number>;
export declare function get_child_description<TStateDesc extends IStateDescription>(state_description: TStateDesc, branch_name: string): any;
export declare function get_keyword_description<TStateDesc extends IStateDescription>(state_description: TStateDesc, branch_name: string, kw_name: string): JSKeywordDescription | JSAtomicSubtreeDescription;
export declare function get_subtree_description<TStateDesc extends IStateDescription, TSubtreeDesc extends JSSubtreeDescription>(state_description: TStateDesc, branch_name: string): TSubtreeDesc;
export declare function seed_prng(seed: string): void;
export declare function random_number(min: number, max: number, pars?: {
    prefer_boundaries?: boolean;
    nullable?: boolean;
}): number | null;
export declare function random_int(min: number, max: number, pars?: {
    prefer_boundaries?: boolean;
    nullable?: boolean;
}): number | null;
export declare function random_value(values: any[], nullable: boolean): any;
export declare function random_enum(values: string[], nullable: boolean): any;
declare type ITargetTypeCounts = {
    [target_type_identifier: string]: number;
};
export interface JSAugmentedSubtreeDescription extends JSSubtreeDescription {
    parent?: JSAugmentedSubtreeDescription;
    children: JSAugmentedChildDescription[];
    reference_target_counts: ITargetTypeCounts;
}
export interface JSAugmentedComponentDescription extends JSAugmentedSubtreeDescription, JSComponentDescription {
    parent: undefined;
    owning_module: string;
    children: JSAugmentedChildDescription[];
    reference_target_counts: ITargetTypeCounts;
}
export declare type JSAugmentedChildDescription = JSAugmentedSubtreeDescription | JSKeywordDescription | JSAtomicSubtreeDescription;
export interface IAugmentedStateDescription extends IStateDescription {
    state: JSAugmentedComponentDescription[];
}
export declare function augment_state(full_state: IStateDescription): IAugmentedStateDescription;
export declare class DetermineFromState {
    readonly state_desc: IStateDescription;
    constructor(state_desc: IStateDescription);
}
export declare function is_live(target_kwl: string, source: DetermineFromState, pars?: {
    ip?: string;
}): Promise<boolean>;
export declare function random_reference(target_type_identifier: string, instantiating_kwl: string, pars: {
    ref_perm: "mutating" | "non-mutating";
    augmented_components: JSAugmentedComponentDescription[];
    null_probability: number;
}): string | null;
export declare function random_content(kwl: string, kw: JSKeywordDescription, augmented_components: JSAugmentedComponentDescription[], pars?: {
    prefer_boundaries?: boolean;
}): any;
export declare function random_indices(pars: {
    table_size: number;
    n: number;
}): number[];
export {};
