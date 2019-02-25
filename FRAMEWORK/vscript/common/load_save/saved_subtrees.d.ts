import { GenericDiff } from "../tree_diff";
import { SubtreePayload } from "../single_connection";
import { ISavedKeyword, ISavedAnonymousSubtree, ISavedNamedTable, ISavedNamedRow } from "./raw_settings";
import { INestedRelocations, LoadWorkspace } from "./load_workspace";
import { IReifiedMapParameters, IReifiedFilterParameters, IReifiedScaffoldParameters, IReifiedUndumpParameters, IKeywordComparator, IDuplexDisambiguator } from "./calling_conventions";
import { IAugmentedStateDescription, JSAugmentedSubtreeDescription } from "../api/api_reflection";
import { JSAtomicSubtreeDescription, JSKeywordDescription } from "../json_schema";
export declare type SavedKWLNode = SavedAnonymousSubtree | SavedNamedTable;
export declare class SavedAnonymousSubtree {
    readonly full_kwl_name: string;
    readonly kw: {
        [name: string]: ISavedKeyword;
    };
    readonly kwl: {
        [name: string]: SavedKWLNode;
    };
    private constructor();
    with_kwl_name(new_kwl_name: string): SavedAnonymousSubtree;
    static lift(full_kwl_name: string, data: ISavedAnonymousSubtree): SavedAnonymousSubtree;
    empty(): boolean;
    map(pars: IReifiedMapParameters<any>): SavedAnonymousSubtree;
    filter(pars: IReifiedFilterParameters<any>): SavedAnonymousSubtree;
    read(relative_path: string, parent_path?: string): ISavedKeyword | SavedAnonymousSubtree | SavedNamedRow | SavedNamedTable | undefined;
    serialize_unnamed(skip_defaults: boolean, workspace: LoadWorkspace, disambiguate_duplex?: IDuplexDisambiguator): Promise<SubtreePayload | undefined>;
    scaffold(current_kwl_name: string, // dynamically passed from the caller as it may deviate from this.full_kwl_name
    pars: IReifiedScaffoldParameters): Promise<void>;
    apply_relocations(current_kwl_name: string, relocations: INestedRelocations): SavedAnonymousSubtree;
    undump(pars: IReifiedUndumpParameters): Promise<void>;
    merge(other: SavedAnonymousSubtree): SavedAnonymousSubtree;
    diff(new_tree: SavedAnonymousSubtree, equal: IKeywordComparator): GenericDiff<SavedAnonymousSubtree>;
    static random(augmented_state: IAugmentedStateDescription, full_kwl_name: string, pars?: {
        allow_duplex_mismatch?: boolean;
        skip_subtree_randomization_if?: (st: JSAugmentedSubtreeDescription, parent_kwl: string | null) => Promise<boolean>;
        skip_node_randomization_if?: (node: JSAtomicSubtreeDescription | JSKeywordDescription, parent_kwl: string) => Promise<boolean>;
        custom_node_randomizer?: (node: JSAtomicSubtreeDescription | JSKeywordDescription, parent_kwl: string) => Promise<ISavedKeyword>;
    }): Promise<SavedAnonymousSubtree>;
}
export declare class SavedNamedTable {
    readonly full_kwl_name: string;
    rows: SavedNamedRow[];
    constructor(full_kwl_name: string, rows: SavedNamedRow[]);
    static lift(full_kwl_name: string, data: ISavedNamedTable): SavedNamedTable;
    empty(): boolean;
    map(pars: IReifiedMapParameters<any>): SavedNamedTable;
    filter(pars: IReifiedFilterParameters<any>): SavedNamedTable;
    read(relative_path: string, parent_path?: string): ISavedKeyword | SavedAnonymousSubtree | SavedNamedRow | SavedNamedTable | undefined;
    scaffold(current_kwl_name: string, pars: IReifiedScaffoldParameters): Promise<void>;
    apply_relocations(current_kwl_name: string, relocations: INestedRelocations): SavedNamedTable;
    undump(pars: IReifiedUndumpParameters): Promise<void>;
    diff(new_table: SavedNamedTable, equal: IKeywordComparator): GenericDiff<SavedNamedTable>;
    merge(other: SavedNamedTable): SavedNamedTable;
}
export declare class SavedNamedRow {
    readonly table_kwl_name: string;
    readonly id: string;
    readonly idx: number;
    data: SavedAnonymousSubtree;
    constructor(table_kwl_name: string, id: string, idx: number, data: SavedAnonymousSubtree);
    static lift(table_kwl_name: string, data: ISavedNamedRow): SavedNamedRow;
    empty(): boolean;
    map(pars: IReifiedMapParameters<any>): SavedNamedRow;
    filter(pars: IReifiedFilterParameters<any>): SavedNamedRow;
    read(relative_path: string, parent_path?: string): ISavedKeyword | SavedAnonymousSubtree | SavedNamedRow | SavedNamedTable | undefined;
    undump(pars: IReifiedUndumpParameters): Promise<void>;
}
