import { Graticule } from "@visx/geo";
import NaturalEarth from "@visx/geo/lib/projections/NaturalEarth";
import { geoCircle } from "d3-geo";
import { useLayoutEffect, useState } from "react";
import * as solar from "solar-calculator";
import * as topojson from "topojson-client";
import topology from "./world-topo.json";

const world = topojson.feature(topology, topology.objects.units);

export const background = "#fff";

const sunPosition = (now) => {
  const day = new Date(+now).setUTCHours(0, 0, 0, 0);
  const t = solar.century(now);
  const longitude = ((day - now) / 864e5) * 360 - 180;
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};

const antipode = ([longitude, latitude]) => [longitude + 180, -latitude];

export function DaylightMap({ now }) {
  const [size, setSize] = useState([0, 0]);
  const sun = sunPosition(now);
  const night = geoCircle().radius(90).center(antipode(sun))();

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, Math.floor(window.innerHeight / 1.5)]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <svg width={size[0]} height={size[1]}>
      <NaturalEarth data={world.features} fitSize={[size, world]}>
        {(mercator) => (
          <g>
            <Graticule
              graticule={(g) => mercator.path(g) || ""}
              stroke="rgba(255,255,255,0.1)"
            />
            {mercator.features.map(({ feature, path }, i) => (
              <path
                key={`map-feature-${i}`}
                d={path || ""}
                stroke={background}
                strokeWidth={0.5}
              />
            ))}
            <path fill="rgba(255,0,0,0.2)" d={mercator.path(night)} />
          </g>
        )}
      </NaturalEarth>
    </svg>
  );
}
