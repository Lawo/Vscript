import { ISavedState, ISavedKeyword } from "../load_save/raw_settings";
import { SavedState } from "../load_save/saved_state";
import { LoadWorkspace } from "../load_save/load_workspace";
import { GenericTree } from "../tree_diff";
export declare function state_diff(a: ISavedState, b: ISavedState, pars?: {
    equal?: (leaf_a: ISavedKeyword, leaf_b: ISavedKeyword, path: string[]) => boolean;
}): import("../tree_diff").GenericDiff<GenericTree<any>>;
export declare function parse_settings(settings: ISavedState): SavedState;
export declare function create_workspace(pars?: {
    ip?: string;
}): Promise<LoadWorkspace>;
export declare function save_settings(pars?: {
    ip?: string;
    include_everything?: boolean;
}): Promise<any>;
