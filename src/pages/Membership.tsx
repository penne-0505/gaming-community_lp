import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  HeartHandshake,
  HelpCircle,
  Users,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { trackEvent, captureError } from "../analytics";
import SupporterTicker from "../components/ui/SupporterTicker";
import DiscordMemberListMock from "../components/ui/DiscordMemberListMock";
import PricingComponent from "../components/ui/PricingComponent";
import FAQItem from "../components/ui/FAQItem";
import SampleSiteNotice from "../components/ui/SampleSiteNotice";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { homeHeroImages } from "../data/lpImages";
import Seo from "../components/Seo";
import {
  beginDiscordLogin,
  exchangeDiscordCode,
  extractDiscordOAuthParams,
} from "../utils/discordAuth";
import { DEMO_NOTICE, IS_DEMO_MODE } from "../constants/demo";

const Membership = () => {
  const [user, setUser] = useState<any>(() => {
    const stored = sessionStorage.getItem("discord_user");
    try {
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed && parsed.id ? parsed : null;
    } catch {
      return null;
    }
  });
  const isLoggedIn = !!(user && user.id);
  const [checkoutStatus, setCheckoutStatus] = useState(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("checkout");
    return status === "success" || status === "cancel" ? status : null;
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const heroImages = homeHeroImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleLogout = () => {
    sessionStorage.removeItem("discord_user");
    setUser(null);
  };

  // OAuth callback handling
  useEffect(() => {
    const { code, cleanUrl } = extractDiscordOAuthParams(window.location.href, {
      extraParams: ["checkout"],
    });
    if (!code) return;

    // prevent duplicate calls
    if (cleanUrl) {
      window.history.replaceState({}, "", cleanUrl);
    }

    (async () => {
      const result = await exchangeDiscordCode(code, {
        errorStage: "oauth_callback",
      });
      if (!result.ok) return;
      if (result.user) {
        setUser(result.user);
        trackEvent("login_success", { provider: "discord" });
      }
    })();
  }, []);

  const startCheckout = async (priceType: string) => {
    trackEvent("checkout_start_redirect", { priceType });
    window.location.href = `/contract?plan=${priceType}`;
  };

  const openPortal = async () => {
    if (IS_DEMO_MODE) {
      setPortalError("デモ公開版ではStripeポータルを開きません。画面上の導線確認のみできます。");
      trackEvent("portal_demo_blocked");
      return;
    }

    if (!user) {
      beginDiscordLogin();
      return;
    }
    setPortalError(null);
    setPortalLoading(true);
    trackEvent("portal_open_start", { userId: user.id });
    try {
      const res = await fetch("/create-portal-session", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) {
          sessionStorage.removeItem("discord_user");
          setUser(null);
          setPortalError("認証が切れました。再度ログインしてください。");
          return;
        }
        if (res.status === 404) {
          setPortalError("Stripeの契約が見つかりませんでした。決済完了後に数分お待ちください。");
        } else {
          setPortalError("管理画面の生成に失敗しました。時間をおいてもう一度お試しください。");
        }
        captureError(new Error("Portal session failed"), { status: res.status, text });
        return;
      }
      const data = await res.json();
      if (data.url) {
        trackEvent("portal_open_redirect", { userId: user.id });
        window.location.href = data.url;
      }
    } catch (err) {
      setPortalError("ネットワークエラーが発生しました。時間をおいてもう一度お試しください。");
      captureError(err, { stage: "portal_open" });
    } finally {
      setPortalLoading(false);
    }
  };

  const displayUser = user ?? {
    id: "guest",
    name: "Guest",
    discriminator: "0000",
    avatar: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg",
  };

  const dismissCheckoutStatus = () => setCheckoutStatus(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const membershipTitle = "支援フローデモ";
  const membershipDescription =
    "Minecraft向けコミュニティ支援フローを題材にしたポートフォリオ用デモです。実際の決済や契約は行いません。";

  return (
    <div className="min-h-screen token-bg-main token-text-primary font-sans selection:bg-[var(--color-accent)] selection:text-white overflow-x-hidden relative">
      <Seo
        title={membershipTitle}
        description={membershipDescription}
        path="/membership"
        type="website"
      />
      <style>{`
        .soft-shadow {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 10px 15px -3px rgba(50, 60, 90, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.60);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        .btn-push {
          transition: transform 0.08s cubic-bezier(0.3, 0, 0.5, 1), box-shadow 0.08s cubic-bezier(0.3, 0, 0.5, 1);
        }
        .btn-push:active {
          transform: translateY(4px) !important;
          box-shadow: 0 0 0 transparent !important;
        }

        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(12deg); }
          100% { transform: translateX(150%) skewX(12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(var(--color-accent-rgb), 0.5);
        }
      `}</style>

      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={beginDiscordLogin}
        onLogout={handleLogout}
        onScrollTop={scrollToTop}
      />

      <main className="relative z-10 pt-20 md:pt-24 pb-12">
        {checkoutStatus && (
          <div className="container mx-auto px-4 md:px-6 mb-6">
            <div
              className={`rounded-xl px-4 py-3 shadow-md border flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${
                checkoutStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {checkoutStatus === "success" ? (
                  <Check className="text-emerald-600" size={20} />
                ) : (
                  <HelpCircle className="text-amber-600" size={20} />
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    {checkoutStatus === "success"
                      ? "デモ完了画面へ進みました"
                      : "デモ導線を中断しました"}
                  </span>
                  <span className="text-xs md:text-sm">
                    {checkoutStatus === "success"
                      ? "実際の請求やDiscordロール付与は発生していません。"
                      : "もう一度確認する場合は、下のプランから再開できます。"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {checkoutStatus === "success" ? (
                  <a
                    href="https://discord.com/channels/@me"
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Discord画面を開く
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      dismissCheckoutStatus();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-3 py-2 rounded-lg bg-white border text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    プランを再選択
                  </button>
                )}
                <button
                  onClick={dismissCheckoutStatus}
                  className="px-3 py-2 rounded-lg bg-transparent border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="container mx-auto px-4 md:px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 aspect-[4/5] md:aspect-[21/9] min-h-[600px] flex items-center justify-center group"
          >
            <div className="absolute inset-0 z-0">
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentImageIndex}
                  src={heroImages[currentImageIndex].src}
                  srcSet={heroImages[currentImageIndex].srcSet}
                  sizes="100vw"
                  width={heroImages[currentImageIndex].width}
                  height={heroImages[currentImageIndex].height}
                  loading={currentImageIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            <div className="relative z-10 text-center flex flex-col justify-center items-center w-full px-4 transform translate-y-4">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
                  },
                }}
                className="max-w-4xl mx-auto space-y-8 w-full"
              >
                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" },
                    },
                  }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display text-white leading-snug drop-shadow-2xl tracking-tight"
                >
                  <span className="inline-block md:translate-x-[0.2em]">いつもの場所を、</span>
                  <br className="md:hidden" />
                  <span className="token-text-accent text-glow inline-block md:ml-4 md:translate-x-[0.2em]">
                    特別なものに。
                  </span>
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" },
                    },
                  }}
                  className="text-sm md:text-base text-slate-100 font-body leading-relaxed max-w-lg mx-auto drop-shadow-md"
                >
                  サーバー支援導線の設計例を、実取引なしで確認できます。
                  <br className="hidden md:inline" />
                  認証・決済・完了画面の責務分担を見せるためのデモです。
                </motion.p>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" },
                    },
                  }}
                  className="pt-6"
                >
                  <motion.a
                    href="#pricing"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 token-bg-accent hover:bg-[var(--color-action-hover)] text-white px-8 py-4 md:px-12 md:py-5 rounded-2xl font-bold text-lg md:text-xl btn-push shadow-[0_5px_0_var(--color-action-shadow)] active:shadow-none active:translate-y-[5px] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl pointer-events-none"></span>
                    <HeartHandshake className="w-6 h-6 md:w-7 md:h-7" />
                    デモプランを見る
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 pointer-events-none"></div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 pointer-events-none">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown size={28} />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <SampleSiteNotice />

        <section className="w-full relative z-20 mb-20 overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[var(--color-bg-main)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[var(--color-bg-main)] to-transparent z-10 pointer-events-none" />
          <SupporterTicker />
        </section>

        <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-12 max-w-5xl mb-24">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black token-text-display tracking-tight -translate-x-[0.1em]">
              支援者表示の体験を、
              <br />
              <span className="token-text-cta">安全に試せる。</span>
            </h2>
            <p className="text-slate-600 font-body leading-relaxed text-sm">
              専用ロールや支援者一覧を想定したUIを、実際の権限変更なしで確認できます。
              <br />
              <br />
              ポートフォリオ公開用に、Discord・Stripe連携はデモ境界で止まるようにしています。
            </p>
            <div className="flex gap-2 justify-center md:justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgb(var(--color-accent-rgb)/0.1)] token-text-accent text-xs font-bold cursor-default">
                <Crown size={14} className="mr-1" /> 専用ロール
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgb(var(--color-cta-rgb)/0.1)] token-text-cta text-xs font-bold cursor-default">
                <Users size={14} className="mr-1" /> 限定チャンネル
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFC107]/10 text-[#B28704] text-xs font-bold cursor-default">
                <Sparkles size={14} className="mr-1" /> 優先サポート
              </span>
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center md:justify-end md:pr-16">
            <DiscordMemberListMock user={displayUser} />
          </div>
        </section>

        <section id="pricing" className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-12">
              <span className="token-text-accent font-bold tracking-widest uppercase text-sm mb-3 block">
                Supporter Plans
              </span>

              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 text-center">
                デモの表示パターンを選ぶ
              </h2>
              <p className="text-slate-500 font-body text-sm max-w-lg text-center leading-relaxed">
                3つのプラン表示を切り替え、申し込み前後の画面遷移を確認できます。
                <br />
                {DEMO_NOTICE}
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <PricingComponent onStartCheckout={(priceType: string) => startCheckout(priceType)} />
            </div>

            <div className="text-center mt-12 text-xs text-slate-400 font-semibold max-w-lg mx-auto leading-relaxed">
              表示される価格・特典はUIサンプルです。実際の請求や特典提供はありません。
              <br />
            </div>
          </div>
        </section>

        {/* Improved Membership Portal Section (Refined V1) */}
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden"
          >
            {/* Background Accent - Soft & Minimal */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-100 to-slate-50 rounded-bl-full -mr-12 -mt-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[rgb(var(--color-accent-rgb)/0.05)] rounded-tr-full -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-800 mb-3">管理画面導線の確認</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-md mx-auto md:mx-0">
                  本番では支払い履歴やプラン変更画面へ接続する想定です。デモ公開版では外部ポータルを開きません。
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-4 items-center md:items-end">
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className={`w-full md:w-64 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all btn-push shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-[4px] border border-slate-200 ${
                    portalLoading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-transparent"
                      : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {portalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span>読み込み中...</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-100 p-1 rounded text-slate-600">
                        <CreditCard size={16} />
                      </div>
                      <span>{IS_DEMO_MODE ? "デモでは無効" : "Stripeポータルを開く"}</span>
                      <ArrowRight size={16} className="text-slate-400" />
                    </>
                  )}
                </button>

                {/* Status & Sub-actions */}
                <div className="flex flex-col items-center md:items-end gap-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <div
                      className={`w-2 h-2 rounded-full ${user ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-300"}`}
                    />
                    {user ? (
                      <span className="flex items-center gap-1">
                        ログイン中:{" "}
                        <span className="text-slate-600 font-mono">#{user.discriminator}</span>
                      </span>
                    ) : (
                      "ログインが必要です"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {portalError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="bg-white p-1 rounded-full shadow-sm text-red-500 shrink-0">
                  <ArrowRight size={12} className="rotate-45" />
                </div>
                {portalError}
              </motion.div>
            )}
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-3xl">
          <h2 className="text-2xl font-black text-slate-800 mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="token-text-accent" /> よくある質問
          </h2>
          <div className="space-y-4">
            <FAQItem
              q="実際に支払いは発生しますか？"
              a="発生しません。ポートフォリオ用のデモとして、外部決済APIを呼ばない設定を既定にしています。"
            />
            <FAQItem
              q="Discordロールは付与されますか？"
              a="付与されません。ロール付与やGuild参加は本番参考実装として残しつつ、デモ公開版では実行されないようにしています。"
            />
            <FAQItem
              q="Stripe連携は実装されていますか？"
              a="参考実装としてPages Functions側に残していますが、デモモードではCheckout、Portal、Webhook、Subscription取得をモック応答に切り替えます。"
            />
            <FAQItem
              q="この画面は何を見せるものですか？"
              a="静的React UIとCloudflare Pages Functionsで、認証・決済・完了後ページをどう分担するかを説明できる実績デモです。"
            />
            <FAQItem
              q="Minecraft公式のサイトですか？"
              a="いいえ。Minecraftを題材にした非公式のポートフォリオデモで、MojangまたはMicrosoftの承認・提携を示すものではありません。"
            />
          </div>
        </section>

        <Footer onScrollTop={scrollToTop} />
      </main>
    </div>
  );
};

export default Membership;
