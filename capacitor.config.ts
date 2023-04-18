import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.ChristopherW.acchmns",
    appName: "ACCHymns",
    webDir: "dist",
    bundledWebRuntime: false,
    ios: {
        scheme: "ACC Hymns",
    },
};

export default config;
