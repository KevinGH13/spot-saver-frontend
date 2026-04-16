import { setOptions } from "@googlemaps/js-api-loader";

setOptions({
  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  v: "quarterly",
});
