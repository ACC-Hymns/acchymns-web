import { ref } from "vue";
import { ScreenOrientation } from "@capacitor/screen-orientation";

export function useScreenOrientation() {
    const isLandscape = ref(false);

    async function execute() {
        isLandscape.value = (await ScreenOrientation.orientation()).type.includes("landscape");
    }
    ScreenOrientation.addListener("screenOrientationChange", execute);
    execute();

    return { isLandscape };
}
