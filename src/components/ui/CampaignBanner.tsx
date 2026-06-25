import { Link } from 'react-router-dom'

function EarthIllustration() {
  return (
    <svg viewBox="0 0 64 64" width="44" height="44" fill="none">
      <circle cx="32" cy="32" r="26" fill="#BFE3D2" />
      <path
        d="M14 24c4 2 6-2 10-1s4 5 9 4 6-5 10-2 5 8 9 6"
        stroke="#0D4436"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 40c5 1 7-3 12-1s5 6 11 4 7-6 11-3"
        stroke="#0D4436"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function CampaignBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-3xl bg-gradient-to-r from-[#E6F2ED] to-[#F3F9F6] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="shrink-0">
        <EarthIllustration />
      </div>
      <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug tracking-tight text-[#0D4436]">
        食品ロスを減らして、地球にやさしい選択を。
      </p>
      <Link
        to="/products"
        className="shrink-0 whitespace-nowrap rounded-full bg-[#0D4436] px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a3328]"
      >
        詳しく見る ＞
      </Link>
    </div>
  )
}
