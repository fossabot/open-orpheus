declare module "electron-installer-redhat" {
  import { ElectronInstaller } from "electron-installer-common";

  export class Installer extends ElectronInstaller {
    get specPath(): string;

    constructor(options: object);

    generateDefaults(): Promise<unknown>;
    generateOptions(): Promise<unknown>;
    generateScripts(): Promise<unknown>;
    createPackage(): Promise<unknown>;

    copyLinuxIcons(): Promise<void>;
    createBinarySymlink(): Promise<void>;
    createCopyright(): Promise<void>;
    createDesktopFile(): Promise<void>;
    createSpec(): Promise<void>;

    [key: string]: unknown;
  }
}
