import { IStateDescription } from "../api/api_reflection";
import { JSSubtreeDescription, JSAtomicSubtreeDescription } from "../json_schema";
export declare type INestedRelocations = {
    new_local_name?: string;
    nested?: {
        [local_name: string]: INestedRelocations;
    };
};
export declare class LoadWorkspace {
    readonly state_description: IStateDescription;
    private keyword_descriptions;
    private subtree_descriptions;
    private kwl_relocations;
    private constructor();
    fork(): LoadWorkspace;
    static create(pars?: {
        ip?: string;
    }): Promise<LoadWorkspace>;
    private static prefix_set;
    translate(original_kwl_name: string): string;
    register_kwl_relocation(old_row_kwl: string, new_row_kwl: string): void;
    is_table(branch_name: string): boolean;
    get_subtree_description(branch_or_kwl_name: string): JSSubtreeDescription;
    get_keyword_description(branch_or_kwl_name: string, kw_name: string): JSAtomicSubtreeDescription | import("../json_schema").JSTimestampDescription | import("../json_schema").JSIPAddressDescription | import("../json_schema").JSBoolDescription | import("../json_schema").JSEnumDescription | import("../json_schema").JSStringDescription | import("../json_schema").JSNumberDescription | import("../json_schema").JSDeviceTreeNodeDescription | import("../json_schema").JSReferenceDescription | import("../json_schema").JSDurationDescription | import("../json_schema").JSTimecodeDescription;
    get_nested_relocations(): INestedRelocations;
}
