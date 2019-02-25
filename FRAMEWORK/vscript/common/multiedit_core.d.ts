import { kw_data_type } from './pervasives';
import { JSChildDescription } from './json_schema';
export interface ReifiedIndexInterval {
    min: number;
    max: number;
}
export interface Evaluatable {
    kwl_expr: string;
    kw_name: string;
}
export interface MatchedSelectorSegment {
    name: string;
    indices?: {
        index_varname: string;
        intervals: ReifiedIndexInterval[];
    };
    selected: JSChildDescription;
}
export interface ReifiedSetCommand {
    branch: MatchedSelectorSegment[];
    value_expr: string;
    prepare_evaluatable: () => Evaluatable;
    criticize_payload: (payload: any) => string | undefined;
    data_type: kw_data_type;
}
export interface ReifiedReadCommand {
    branch: MatchedSelectorSegment[];
    read_command_type: "once" | "continuously";
    prepare_evaluatable: () => Evaluatable;
    data_type: kw_data_type;
}
