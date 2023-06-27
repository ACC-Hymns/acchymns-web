import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.ChristopherW.acchmns",
    appName: "ACCHymns",
    webDir: "dist",
    ios: {
        scheme: "ACC Hymns",
        webview: {
            configuration: {
                inspectable: true,
            },
        },
    },
};

export default config;
