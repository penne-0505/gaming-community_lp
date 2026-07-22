import InteractiveSprout from "../ui/InteractiveSprout";
import FooterLink from "../ui/FooterLink";
import { DEMO_SITE, MINECRAFT_DISCLAIMER } from "../../constants/demo";

export interface FooterProps {
  /** Accepted for call-site compatibility; brand link uses href="/" today. */
  onScrollTop?: () => void;
}

const Footer = (_props: FooterProps = {}) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-12">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 opacity-80">
          <a
            href="/"
            className="font-bold text-slate-700 brand-font text-lg cursor-pointer select-none"
          >
            {DEMO_SITE.shortName} <InteractiveSprout />
          </a>
        </div>
        <div className="flex justify-center gap-4 md:gap-6 text-xs md:text-sm font-semibold text-slate-400 flex-wrap">
          <FooterLink href="/legal">デモ用文書</FooterLink>
          <FooterLink href="/demo-flow">公開デモの導線</FooterLink>
          <FooterLink href="/membership">メンバーシップページ</FooterLink>
        </div>
        <div className="text-xs text-slate-400 font-semibold max-w-2xl mx-auto leading-relaxed">
          &copy; 2025-2026 {DEMO_SITE.shortName}. {MINECRAFT_DISCLAIMER}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
