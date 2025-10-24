import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

export default defineNuxtPlugin(() => {
  dayjs.extend(LocalizedFormat);
});
