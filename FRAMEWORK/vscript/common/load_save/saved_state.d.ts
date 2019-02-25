import { ISettingsHeader, ISavedKeyword, ISavedState } from "../load_save/raw_settings";
import { KeywordListMapParameters, KeywordMapParameters, IFilterParameters, IKeywordComparator, IMapParameters, IScaffoldParameters, IUndumpParameters } from "../load_save/calling_conventions";
import { LoadWorkspace } from "../load_save/load_workspace";
import { SavedAnonymousSubtree, SavedNamedRow, SavedNamedTable } from "../load_save/saved_subtrees";
import { JSAtomicSubtreeDescription, JSKeywordDescription } from "../json_schema";
import { IAugmentedStateDescription, JSAugmentedSubtreeDescription } from "../api/api_reflection";
export interface StateDiff {
    only_in_old: SavedState;
    only_in_new: SavedState;
    modified: SavedState;
    unmodified: SavedState;
}
export declare class SavedState {
    format: string;
    header: ISettingsHeader;
    components: {
        [component_name: string]: SavedAnonymousSubtree;
    };
    private constructor();
    static lift(data: ISavedState): SavedState;
    map(pars: IMapParameters<any>): SavedState;
    filter(pars: IFilterParameters<any>): SavedState;
    read(path: string): ISavedKeyword | SavedAnonymousSubtree | SavedNamedRow | SavedNamedTable | undefined;
    scaffold(pars: IScaffoldParameters): Promise<LoadWorkspace>;
    undump(pars: IUndumpParameters): Promise<void>;
    split(pars: IFilterParameters<any>): [SavedState, SavedState];
    apply_relocations(workspace: LoadWorkspace): SavedState;
    diff(pars: {
        new_state: SavedState;
        equal?: IKeywordComparator;
    }): {
        only_in_old: SavedState;
        only_in_new: SavedState;
        modified: SavedState;
        unmodified: SavedState;
    };
    empty(): boolean;
    rename_kwls(f: (old_kwl: string) => string, workspace: LoadWorkspace): SavedState;
    user_owned(workspace: LoadWorkspace): SavedState;
    user_owned_or_duplex(workspace: LoadWorkspace): SavedState;
    persistent_parts(workspace: LoadWorkspace): SavedState;
    component(workspace: LoadWorkspace, component_name: string): SavedState;
    private static check_match;
    extract_kwls(arg: (string | RegExp)[] | string | RegExp): [SavedState, SavedState];
    extract_kws(arg: (string | RegExp)[] | string | RegExp): [SavedState, SavedState];
    extract(arg: (string | RegExp)[] | string | RegExp): [SavedState, SavedState];
    iter(outer_pars: {
        f_kwl?: (pars: KeywordListMapParameters<any>) => void;
        f_kw?: (pars: KeywordMapParameters) => void;
        recursion_depth?: number;
    }): void;
    collect(outer_pars: {
        f_kwl?: (pars: KeywordListMapParameters<any>) => any | undefined;
        f_kw?: (pars: KeywordMapParameters) => any | undefined;
        recursion_depth?: number;
    }): any[];
    randomize(augmented_state: IAugmentedStateDescription, pars?: {
        allow_duplex_mismatch?: boolean;
        skip_subtree_randomization_if?: (st: JSAugmentedSubtreeDescription, parent_kwl: string | null) => Promise<boolean>;
        skip_node_randomization_if?: (node: JSAtomicSubtreeDescription | JSKeywordDescription, parent_kwl: string) => Promise<boolean>;
        custom_node_randomizer?: (node: JSAtomicSubtreeDescription | JSKeywordDescription, parent_kwl: string) => Promise<ISavedKeyword>;
    }): Promise<SavedState>;
}
