import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadGaramond } from "@remotion/google-fonts/EBGaramond";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

const subsets = ["latin", "latin-ext"] as const;
const opts = { weights: ["400", "500", "600"], subsets: [...subsets] } as never;

export const FAMILIES = {
  generalSans: "'General Sans', sans-serif",
  inter: loadInter("normal", opts).fontFamily,
  barlow: loadBarlow("normal", opts).fontFamily,
  garamond: loadGaramond("normal", opts).fontFamily,
  manrope: loadManrope("normal", opts).fontFamily,
};

const handle = delayRender("General Sans");
Promise.all(
  ["400", "500", "600"].map((w) =>
    loadFont({
      family: "General Sans",
      url: staticFile(`fonts/GeneralSans-${w}.woff2`),
      weight: w,
    }),
  ),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    throw e;
  });
