import { MASCOT_ITEMS, MASCOT_SLOTS } from '../shared/game.js'

const KNOWN_ITEMS = new Set(MASCOT_ITEMS.map((item) => item.id))
const KNOWN_SLOTS = new Set(MASCOT_SLOTS.map((slot) => slot.id))

export function HeadAccessory({ id, gid = '' }) {
  if (id === 'nisselue') {
    return (
      <g className="dog-accessory dog-accessory-head">
        <path d="M59 55 Q83 8 133 49 L123 66 Q92 53 59 68Z" fill="#ef4545" stroke="#2d2a4a" strokeWidth="4" />
        <path d="M58 57 Q91 48 126 59" fill="none" stroke="#fffaf0" strokeWidth="13" strokeLinecap="round" />
        <circle cx="134" cy="47" r="12" fill="#fffaf0" stroke="#2d2a4a" strokeWidth="3" />
      </g>
    )
  }
  if (id === 'sjorover_hatt') {
    return (
      <g className="dog-accessory dog-accessory-head">
        <path d="M48 61 Q65 50 73 30 Q98 43 126 28 Q134 49 151 60 Q126 72 100 62 Q73 72 48 61Z" fill="#242238" stroke="#2d2a4a" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="101" cy="48" r="7" fill="#fff" />
        <circle cx="98" cy="46" r="1.8" fill="#242238" /><circle cx="104" cy="46" r="1.8" fill="#242238" />
        <path d="M96 53 L106 53 M92 57 L110 57" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </g>
    )
  }
  if (id === 'kongekrone') {
    return (
      <g className="dog-accessory dog-accessory-head legendary-detail">
        <path d="M58 61 L54 28 L76 43 L98 16 L120 43 L145 27 L138 63Z" fill={`url(#dog-crown-gold${gid})`} stroke="#8d5b00" strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 55 Q99 48 139 55 L138 66 Q98 72 59 65Z" fill={`url(#dog-crown-cushion${gid})`} stroke="#8d5b00" strokeWidth="3" />
        <circle cx="98" cy="57" r="6" fill="#4d96ff" stroke="#fff4b0" strokeWidth="2" />
        <circle cx="55" cy="28" r="4" fill="#fff4a3" /><circle cx="98" cy="16" r="4" fill="#fff4a3" /><circle cx="145" cy="27" r="4" fill="#fff4a3" />
      </g>
    )
  }
  return null
}

export function FaceAccessory({ id }) {
  if (id === 'solbriller') {
    return (
      <g className="dog-accessory dog-accessory-face">
        <circle cx="78" cy="91" r="17" fill="#252438" stroke="#11101b" strokeWidth="4" />
        <circle cx="121" cy="91" r="17" fill="#252438" stroke="#11101b" strokeWidth="4" />
        <path d="M95 88 Q100 84 104 88 M60 85 L48 80 M139 85 L151 80" fill="none" stroke="#11101b" strokeWidth="5" strokeLinecap="round" />
        <path d="M68 82 L79 77 M111 82 L122 77" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      </g>
    )
  }
  if (id === 'hjertebriller') {
    return (
      <g className="dog-accessory dog-accessory-face">
        <path d="M79 108 C72 101 59 92 59 81 C59 68 76 66 81 77 C87 66 103 69 103 82 C103 94 90 102 79 108Z" fill="#ff78ad" fillOpacity=".72" stroke="#d9367b" strokeWidth="4" />
        <path d="M120 108 C113 101 101 92 101 81 C101 68 117 66 122 77 C128 66 144 69 144 82 C144 94 131 102 120 108Z" fill="#ff78ad" fillOpacity=".72" stroke="#d9367b" strokeWidth="4" />
        <path d="M101 82 L103 82 M59 81 L48 78 M144 81 L152 78" stroke="#d9367b" strokeWidth="4" strokeLinecap="round" />
      </g>
    )
  }
  if (id === 'stjernebriller') {
    return (
      <g className="dog-accessory dog-accessory-face legendary-detail">
        <polygon points="78,68 84,81 98,82 87,92 90,107 78,99 65,107 68,92 57,82 72,80" fill="#ffd23f" fillOpacity=".78" stroke="#b77a00" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="122,68 128,81 142,82 131,92 134,107 122,99 109,107 112,92 101,82 116,80" fill="#ffd23f" fillOpacity=".78" stroke="#b77a00" strokeWidth="4" strokeLinejoin="round" />
        <path d="M98 84 Q100 81 102 84 M57 82 L49 78 M142 82 L151 78" stroke="#b77a00" strokeWidth="4" strokeLinecap="round" />
        <circle cx="75" cy="83" r="3" fill="#fff" /><circle cx="119" cy="83" r="3" fill="#fff" />
      </g>
    )
  }
  return null
}

export function NeckAccessory({ id, gid = '' }) {
  if (id === 'sloyfe') {
    return (
      <g className="dog-accessory dog-accessory-neck">
        <path d="M98 138 C83 123 67 126 69 143 C71 158 86 156 98 146Z" fill="#ef4b55" stroke="#9f2630" strokeWidth="3" />
        <path d="M102 138 C117 123 133 126 131 143 C129 158 114 156 102 146Z" fill="#ef4b55" stroke="#9f2630" strokeWidth="3" />
        <circle cx="100" cy="142" r="8" fill="#ff767e" stroke="#9f2630" strokeWidth="3" />
        <circle cx="80" cy="140" r="2.5" fill="#fff" /><circle cx="120" cy="140" r="2.5" fill="#fff" />
      </g>
    )
  }
  if (id === 'bandana') {
    return (
      <g className="dog-accessory dog-accessory-neck">
        <path d="M65 130 Q100 143 136 130 L125 169 L100 151 L76 169Z" fill="#e84848" stroke="#9f2630" strokeWidth="4" strokeLinejoin="round" />
        <path d="M69 132 Q100 143 132 132" fill="none" stroke="#ff9b91" strokeWidth="5" />
        <circle cx="100" cy="150" r="3" fill="#fff2d0" />
      </g>
    )
  }
  if (id === 'gullkjede') {
    return (
      <g className="dog-accessory dog-accessory-neck legendary-detail">
        <path d="M69 145 Q74 171 100 175 Q126 171 131 145" fill="none" stroke="#9b6900" strokeWidth="9" strokeDasharray="3 5" strokeLinecap="round" />
        <path d="M69 145 Q74 171 100 175 Q126 171 131 145" fill="none" stroke={`url(#dog-chain-gold${gid})`} strokeWidth="5" strokeDasharray="3 5" strokeLinecap="round" />
        <circle cx="100" cy="177" r="10" fill={`url(#dog-chain-gold${gid})`} stroke="#9b6900" strokeWidth="3" />
        <path d="M100 170 L102 175 L107 175 L103 179 L105 184 L100 181 L95 184 L97 179 L93 175 L98 175Z" fill="#fff4a3" />
      </g>
    )
  }
  return null
}

export function BackAccessory({ id, gid = '' }) {
  if (id === 'superkappe') {
    return (
      <g className="dog-accessory dog-accessory-body dog-cape">
        <path d="M58 128 Q31 139 26 190 Q47 181 64 196 Q77 162 85 135Z" fill="#e84545" stroke="#9f2630" strokeWidth="4" strokeLinejoin="round" />
        <path d="M59 132 Q39 148 35 181" fill="none" stroke="#ff8178" strokeWidth="6" strokeLinecap="round" />
        <path d="M142 128 Q169 139 174 190 Q153 181 136 196 Q123 162 115 135Z" fill="#e84545" stroke="#9f2630" strokeWidth="4" strokeLinejoin="round" />
        <path d="M141 132 Q161 148 165 181" fill="none" stroke="#ff8178" strokeWidth="6" strokeLinecap="round" />
      </g>
    )
  }
  if (id === 'kongekappe') {
    return (
      <g className="dog-accessory dog-accessory-body dog-cape legendary-detail">
        <path d="M55 124 Q25 142 22 199 Q46 183 68 205 Q82 164 87 132Z" fill={`url(#dog-royal-cape${gid})`} stroke="#6d245f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M145 124 Q175 142 178 199 Q154 183 132 205 Q118 164 113 132Z" fill={`url(#dog-royal-cape${gid})`} stroke="#6d245f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M53 128 Q35 145 29 190 M147 128 Q165 145 171 190" fill="none" stroke="#ffc928" strokeWidth="5" strokeLinecap="round" />
        {[['38','156'],['49','181'],['162','156'],['151','181']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#fff" />)}
      </g>
    )
  }
  return null
}

export function FrontBodyAccessory({ id }) {
  if (id !== 'rockevest') return null
  return (
    <g className="dog-accessory dog-accessory-body">
      <path d="M62 138 Q76 129 88 133 L95 196 Q76 199 58 188 Q55 158 62 138Z" fill="#282735" stroke="#11101b" strokeWidth="4" />
      <path d="M138 138 Q124 129 112 133 L105 196 Q124 199 142 188 Q145 158 138 138Z" fill="#282735" stroke="#11101b" strokeWidth="4" />
      <path d="M87 136 L95 193 M113 136 L105 193" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M67 150 L76 146 L80 154 L70 159Z" fill="#ff6b6b" />
      <circle cx="132" cy="151" r="4" fill="#ffd23f" />
    </g>
  )
}

// Gradientene som brukes av episke tilbehør (kongekrone/-kappe, gullkjede).
// `gid` gjør id-ene unike per SVG-instans, slik at flere <AccessoryIcon>
// kan stå på samme side som hoved-hunden uten at url(#...)-referanser kolliderer.
export function GradientDefs({ gid = '' }) {
  return (
    <defs>
      <linearGradient id={`dog-crown-gold${gid}`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff3a1" /><stop offset=".45" stopColor="#ffd23f" /><stop offset="1" stopColor="#e59a00" />
      </linearGradient>
      <linearGradient id={`dog-crown-cushion${gid}`} x1="0" x2="0" y1="0" y2="1">
        <stop stopColor="#ff6b77" /><stop offset="1" stopColor="#a82045" />
      </linearGradient>
      <linearGradient id={`dog-royal-cape${gid}`} x1="0" x2="1" y1="0" y2="1">
        <stop stopColor="#c45be8" /><stop offset=".5" stopColor="#7c328f" /><stop offset="1" stopColor="#d73858" />
      </linearGradient>
      <linearGradient id={`dog-chain-gold${gid}`} x1="0" x2="1">
        <stop stopColor="#fff2a0" /><stop offset=".5" stopColor="#ffc928" /><stop offset="1" stopColor="#d59100" />
      </linearGradient>
    </defs>
  )
}

// Beskjæringsbokser (viewBox) for hver slot, brukt av <AccessoryIcon> til å
// zoome inn på selve tilbehøret uten resten av hunden.
const ICON_VIEWBOX = {
  head: '20 0 160 80',
  face: '40 58 120 62',
  neck: '50 115 100 80',
  body: '15 118 170 96',
}

// Et lite, frittstående ikon av ett tilbehør – de eksakte SVG-formene som
// vises på hunden, gjenbrukt på garderobe-knappene og i gacha-resultatet, slik
// at det aldri er avvik mellom det barnet ser der og det som faktisk vises på Sommer.
export function AccessoryIcon({ item }) {
  if (!item) return null
  const gid = `-icon-${item.id}`
  return (
    <svg viewBox={ICON_VIEWBOX[item.slot]} className="accessory-icon" role="presentation" aria-hidden="true">
      <GradientDefs gid={gid} />
      {item.slot === 'head' && <HeadAccessory id={item.id} gid={gid} />}
      {item.slot === 'face' && <FaceAccessory id={item.id} />}
      {item.slot === 'neck' && <NeckAccessory id={item.id} gid={gid} />}
      {item.slot === 'body' && (
        <>
          <BackAccessory id={item.id} gid={gid} />
          <FrontBodyAccessory id={item.id} />
        </>
      )}
    </svg>
  )
}

export default function Dog({ equipped = {} }) {
  const safeEquipped = Object.fromEntries(
    Object.entries(equipped || {}).filter(([slot, id]) => KNOWN_SLOTS.has(slot) && KNOWN_ITEMS.has(id)),
  )

  return (
    <svg className="mascot-dog" viewBox="0 0 200 220" role="img" aria-label="Sommer, maskothunden med tilbehør">
      <GradientDefs />

      <ellipse cx="100" cy="207" rx="69" ry="10" fill="#2d2a4a" opacity=".13" />

      {/* Hale, akkurat synlig bak kroppen */}
      <path d="M148 168 Q170 160 173 178 Q174 192 156 190 Q160 178 148 168Z" fill="#a96339" stroke="#2d2a4a" strokeWidth="4" strokeLinejoin="round" />

      <BackAccessory id={safeEquipped.body} />

      <path d="M69 131 Q48 144 48 184 Q48 203 71 204 L129 204 Q152 203 152 184 Q152 144 131 131Z" fill="#d99152" stroke="#2d2a4a" strokeWidth="5" />
      <path d="M71 152 Q82 138 100 138 Q119 138 130 152 L125 199 L75 199Z" fill="#f4c689" />
      <path d="M60 172 Q42 183 51 199 Q57 209 73 198" fill="#d99152" stroke="#2d2a4a" strokeWidth="5" strokeLinecap="round" />
      <path d="M140 172 Q158 183 149 199 Q143 209 127 198" fill="#d99152" stroke="#2d2a4a" strokeWidth="5" strokeLinecap="round" />
      <path d="M75 195 Q65 199 64 210 L91 210 Q92 201 88 195 M125 195 Q135 199 136 210 L109 210 Q108 201 112 195" fill="#d99152" stroke="#2d2a4a" strokeWidth="5" strokeLinejoin="round" />

      {/* Slappe hundeører – tegnet som myke, avrundede ellipser bak hodet slik at de
          henger naturlig ned langs kinnet, i stedet for å stikke rett ut til siden. */}
      <ellipse cx="54" cy="122" rx="24" ry="44" fill="#a96339" stroke="#2d2a4a" strokeWidth="5" transform="rotate(-14 54 122)" />
      <ellipse cx="146" cy="122" rx="24" ry="44" fill="#a96339" stroke="#2d2a4a" strokeWidth="5" transform="rotate(14 146 122)" />
      <ellipse cx="59" cy="120" rx="13" ry="30" fill="#8a5230" transform="rotate(-14 59 120)" />
      <ellipse cx="141" cy="120" rx="13" ry="30" fill="#8a5230" transform="rotate(14 141 120)" />

      {/* Hode */}
      <circle cx="100" cy="94" r="53" fill="#e7a769" stroke="#2d2a4a" strokeWidth="5" />
      <ellipse cx="100" cy="118" rx="34" ry="27" fill="#f6d09b" />

      <ellipse cx="67" cy="103" rx="10" ry="6" fill="#ff97a8" opacity=".55" />
      <ellipse cx="133" cy="103" rx="10" ry="6" fill="#ff97a8" opacity=".55" />

      <circle cx="79" cy="87" r="9" fill="#2d2a4a" /><circle cx="121" cy="87" r="9" fill="#2d2a4a" />
      <circle cx="76" cy="83" r="3.4" fill="#fff" /><circle cx="118" cy="83" r="3.4" fill="#fff" />
      <path d="M68 76 Q78 70 87 75 M113 75 Q122 70 132 76" fill="none" stroke="#c67f3f" strokeWidth="3" strokeLinecap="round" />

      <ellipse cx="100" cy="112" rx="11" ry="8" fill="#2d2a4a" />
      <path d="M100 120 L100 126 Q100 132 91 130 M100 126 Q100 132 109 130" fill="none" stroke="#2d2a4a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M104 130 Q100 139 95 130" fill="#ff7890" stroke="#2d2a4a" strokeWidth="2" strokeLinejoin="round" />

      <FrontBodyAccessory id={safeEquipped.body} />
      <NeckAccessory id={safeEquipped.neck} />
      <FaceAccessory id={safeEquipped.face} />
      <HeadAccessory id={safeEquipped.head} />
    </svg>
  )
}
