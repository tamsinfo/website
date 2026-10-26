import type { Ctx, Station } from "./kit";
import { heroStation, proofStation } from "./opening";
import { problemsStation } from "./problems";
import { servicesStation } from "./services";
import { productsStation } from "./products";
import { calloutStation, connectedStation } from "./connected";
import { industriesStation, solutionsStation } from "./districts";
import { blocksStation, contactStation, globeStation, libraryStation, processStation, unpluggedStation } from "./rooms";

export const STATION_BUILDERS: ((ctx: Ctx) => Station)[] = [
  heroStation,
  proofStation,
  problemsStation,
  servicesStation,
  productsStation,
  connectedStation,
  calloutStation,
  solutionsStation,
  industriesStation,
  processStation,
  contactStation,
  globeStation,
  blocksStation,
  libraryStation,
  unpluggedStation,
];
