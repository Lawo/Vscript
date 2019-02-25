import { IMachine } from "../machines/store";
import { IInstaller } from "./store";
import { SingleConnection } from "../../common/single_connection";
export declare function upload_installer(filename: string, con: SingleConnection): Promise<{}>;
export declare function start_installer_upload(installer: IInstaller, target: IMachine): void;
export declare function start_installer(con: SingleConnection): void;
export declare function install(filename: string, con: SingleConnection): Promise<{}>;
