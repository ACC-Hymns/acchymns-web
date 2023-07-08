import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.ChristopherW.acchmns",
    appName: "ACCHymns",
    webDir: "dist",
    ios: {
        scheme: "ACC Hymns",
        webContentsDebuggingEnabled: true,
    },
    android: {
        webContentsDebuggingEnabled: true,
    },
};

export default config;
