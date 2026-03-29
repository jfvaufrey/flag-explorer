'use client'
import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Map ISO numeric codes to our flag ids
const numericToAlpha2: Record<string, string> = {
  '004': 'af', '008': 'al', '012': 'dz', '024': 'ao', '032': 'ar', '036': 'au',
  '040': 'at', '031': 'az', '044': 'bs', '048': 'bh', '050': 'bd', '112': 'by',
  '056': 'be', '084': 'bz', '204': 'bj', '064': 'bt', '068': 'bo', '070': 'ba',
  '072': 'bw', '076': 'br', '096': 'bn', '100': 'bg', '854': 'bf', '108': 'bi',
  '116': 'kh', '120': 'cm', '124': 'ca', '132': 'cv', '140': 'cf', '144': 'lk',
  '148': 'td', '152': 'cl', '156': 'cn', '170': 'co', '174': 'km', '178': 'cg',
  '180': 'cd', '188': 'cr', '191': 'hr', '192': 'cu', '196': 'cy', '203': 'cz',
  '208': 'dk', '262': 'dj', '212': 'dm', '214': 'do', '218': 'ec', '818': 'eg',
  '222': 'sv', '226': 'gq', '232': 'er', '233': 'ee', '231': 'et', '242': 'fj',
  '246': 'fi', '250': 'fr', '266': 'ga', '270': 'gm', '268': 'ge', '276': 'de',
  '288': 'gh', '300': 'gr', '308': 'gd', '320': 'gt', '324': 'gn', '624': 'gw',
  '328': 'gy', '332': 'ht', '340': 'hn', '348': 'hu', '356': 'in', '360': 'id',
  '364': 'ir', '368': 'iq', '372': 'ie', '376': 'il', '380': 'it', '388': 'jm',
  '392': 'jp', '400': 'jo', '398': 'kz', '404': 'ke', '296': 'ki', '408': 'kp',
  '410': 'kr', '414': 'kw', '417': 'kg', '418': 'la', '422': 'lb', '426': 'ls',
  '430': 'lr', '434': 'ly', '438': 'li', '440': 'lt', '442': 'lu', '450': 'mg',
  '454': 'mw', '458': 'my', '462': 'mv', '466': 'ml', '470': 'mt', '584': 'mh',
  '478': 'mr', '480': 'mu', '484': 'mx', '583': 'fm', '498': 'md', '492': 'mc',
  '496': 'mn', '504': 'ma', '508': 'mz', '516': 'na', '520': 'nr', '524': 'np',
  '528': 'nl', '540': 'nc', '554': 'nz', '558': 'ni', '562': 'ne', '566': 'ng',
  '578': 'no', '512': 'om', '586': 'pk', '585': 'pw', '275': 'ps', '591': 'pa',
  '598': 'pg', '600': 'py', '604': 'pe', '608': 'ph', '616': 'pl', '620': 'pt',
  '634': 'qa', '642': 'ro', '643': 'ru', '646': 'rw', '659': 'kn', '662': 'lc',
  '670': 'vc', '882': 'ws', '674': 'sm', '678': 'st', '682': 'sa', '686': 'sn',
  '694': 'sl', '703': 'sk', '705': 'si', '706': 'so', '710': 'za', '724': 'es',
  '729': 'sd', '736': 'sd', '740': 'sr', '752': 'se', '756': 'ch',
  '760': 'sy', '762': 'tj', '764': 'th', '626': 'tl', '768': 'tg', '776': 'to',
  '780': 'tt', '788': 'tn', '792': 'tr', '795': 'tm', '798': 'tv', '800': 'ug',
  '804': 'ua', '784': 'ae', '826': 'gb', '840': 'us', '858': 'uy', '860': 'uz',
  '548': 'vu', '862': 've', '704': 'vn', '887': 'ye', '894': 'zm', '716': 'zw',
};

interface WorldMapProps {
  highlightedCountryId?: string;
  onCountryClick?: (id: string) => void;
  width?: number;
  height?: number;
}

export function WorldMap({ highlightedCountryId, onCountryClick, width = 800, height = 400 }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-navy-900 border border-white/10">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 100, center: [0, 20] }}
        width={width}
        height={height}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericId = geo.id || geo.properties?.['iso-n'] || '';
              const alpha2 = numericToAlpha2[String(numericId).padStart(3, '0')];
              const isHighlighted = alpha2 === highlightedCountryId;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHighlighted ? '#ffd700' : '#1e3a8a'}
                  stroke="#0f172a"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: isHighlighted ? '#ffd700' : '#2563eb', outline: 'none', cursor: 'pointer' },
                    pressed: { fill: '#ffd700', outline: 'none' },
                  }}
                  onMouseEnter={(e) => {
                    const name = geo.properties?.name || '';
                    setTooltip({ name, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    if (onCountryClick && alpha2) {
                      onCountryClick(alpha2);
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="fixed z-50 bg-navy-800 text-white px-3 py-1 rounded-lg text-sm pointer-events-none border border-white/20"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
