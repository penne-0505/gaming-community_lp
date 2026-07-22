import type { ReactNode } from "react";

const FooterLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="relative group text-slate-400 hover:text-slate-600 transition-colors">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-300 transition-all duration-300 group-hover:w-full" />
  </a>
);

export default FooterLink;
