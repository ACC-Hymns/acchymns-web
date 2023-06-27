import { defineStore } from "pinia";
import { ref } from "vue";

type LogLevel = "log" | "error" | "warn";

export const useConsoleStore = defineStore("console", () => {
    const logs = ref<string>("");

    function fmt(type: LogLevel, str: string) {
        switch (type) {
            case "log":
                return "<p>" + str + "<p>";
            case "warn":
                return "<p style='color:yellow;'>" + str + "<p>";
            case "error":
                return "<p style='color:red;'>" + str + "<p>";
        }
    }

    function prepend(type: LogLevel, ...data: any[]) {
        for (const element of data) {
            if (Array.isArray(element)) {
                logs.value = fmt(type, element.join(" ")) + logs.value;
            } else {
                logs.value = fmt(type, element) + logs.value;
            }
        }
    }

    return { prepend, logs };
});

export function registerConsoleStore() {
    const std_out = console.log;
    const console_store = useConsoleStore();

    const logToStore = (type: LogLevel, ...data: any[]) => {
        // Now we can customize what is logged where
        console_store.prepend(type, data);
        std_out(...data); // This line will guarantee that it's still logged to the browser console.
    };

    console.log = (...data: any[]) => logToStore("log", ...data);
    console.warn = (...data: any[]) => logToStore("warn", ...data);
    console.error = (...data: any[]) => logToStore("error", ...data);
}
