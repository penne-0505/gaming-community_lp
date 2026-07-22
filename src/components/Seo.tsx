import type { SeoOptions } from "../utils/seo";
import { useSeo } from "../utils/seo";

const Seo = (props: SeoOptions) => {
  useSeo(props);
  return null;
};

export default Seo;
