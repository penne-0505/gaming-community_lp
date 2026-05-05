import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Loader2, ArrowRight, Users } from "lucide-react";
import { trackEvent } from "../analytics";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PricingComponent from "../components/ui/PricingComponent";
import Divider from "../components/ui/Divider";
import Seo from "../components/Seo";
import {
  beginDiscordLogin,
  exchangeDiscordCode,
  extractDiscordOAuthParams,
} from "../utils/discordAuth";

const checkboxTitleOffsets = {
  支援者一覧に表示する: "-translate-x-[0.03em]",
};

export const CheckboxCard = ({ checked, onChange, icon, title, description, tag }) => {
  const titleOffsetClass = checkboxTitleOffsets[title] ?? "";

  return (
    <div
      onClick={onChange}
      className={`
        group relative flex items-center gap-4 p-4 pr-6 rounded-2xl border transition-all duration-200 cursor-pointer select-none
        ${
          checked
            ? "bg-white border-slate-300 shadow-[0_4px_0_#e2e8f0] translate-y-[-2px]"
            : "bg-slate-50 border-slate-200 opacity-80 hover:opacity-100"
        }
      `}
    >
      <div
        className={`
        w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300
        ${checked ? "token-bg-cta text-white" : "bg-slate-200 text-slate-400"}
      `}
      >
        {checked ? icon : <div className="grayscale opacity-50">{icon}</div>}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`font-display font-bold text-base inline-block ${titleOffsetClass} ${checked ? "text-slate-800" : "text-slate-500"}`}
          >
            {title}
          </h4>
          {tag && (
            <span className="text-[10px] font-bold token-bg-accent-soft token-text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
              {tag}
            </span>
          )}
        </div>
        <p className="font-body text-xs md:text-sm text-slate-500 leading-tight">{description}</p>
      </div>

      <div
        className={`
        w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center
        ${checked ? "token-bg-accent" : "bg-slate-300"}
      `}
      >
        <motion.div
          layout
          className="w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
    </div>
  );
};

export default function Contract() {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const contractTitle = "プラン申し込み";
  const contractDescription = "メンバーシップの申し込み前に条件を確認し、決済へ進みます。";
  const mockUser = {
    name: "Supporter",
    discriminator: "0000",
    avatar: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg",
  };
  const mockPlanParam = "sub_monthly";

  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("discord_user");
    try {
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed && parsed.id ? parsed : null;
    } catch {
      return null;
    }
  });

  const [agreements, setAgreements] = useState({
    discordRole: false,
    showSupporterList: true,
    termsAccepted: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const displayUser = user || mockUser;
  const displayPlanParam = planParam || mockPlanParam;

  // --- Logic from original Contract.jsx ---
  useEffect(() => {
    const { code, cleanUrl } = extractDiscordOAuthParams(window.location.href);
    if (!code) return;

    if (cleanUrl) {
      window.history.replaceState({}, "", cleanUrl);
    }

    (async () => {
      const result = await exchangeDiscordCode(code, {
        captureResponseError: false,
        errorStage: "oauth_callback_contract",
      });
      if (!result.ok) {
        if (result.status === 401) {
          setError("認証に失敗しました。メンバーシップページへ戻ります。");
          setTimeout(() => {
            window.location.href = "/membership";
          }, 1800);
          return;
        }
        if (result.status) {
          setError("認証に失敗しました。もう一度お試しください。");
          return;
        }
        setError("認証中にエラーが発生しました。");
        return;
      }

      if (result.user) {
        setUser(result.user);
        trackEvent("login_success", { provider: "discord", context: "contract" });
      }
    })();
  }, []);

  const handleDiscordLogin = () => {
    beginDiscordLogin(undefined, { context: "contract" });
  };

  // Portfolio: bypass access gate for /contract.
  /*
  useEffect(() => {
    if (!planParam) {
      window.location.replace("/membership");
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("code")) return;

    if (!user) {
      beginDiscordLogin();
      return;
    }
  }, [user, planParam]);
  */

  const toggleAgreement = (key) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePayment = async () => {
    if (!agreements.discordRole || !agreements.termsAccepted) {
      return;
    }

    setIsLoading(true);
    trackEvent("checkout_start", { priceType: displayPlanParam });

    // Portfolio mock: skip Stripe checkout, go directly to thanks page.
    /*
    try {
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceType: planParam,
          avatar_url: user.avatar || null,
          consent_roles: agreements.discordRole,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) {
          sessionStorage.removeItem("discord_user");
          setUser(null);
          setError("認証が切れました。メンバーシップページへ戻ります。");
          setTimeout(() => {
            window.location.href = "/membership";
          }, 1800);
          setIsLoading(false);
          return;
        }
        captureError(new Error("Checkout create failed"), { priceType: planParam, text });
        setError("決済セッションの作成に失敗しました。しばらくしてからもう一度お試しください。");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      captureError(err, { stage: "checkout_start_contract", priceType: planParam });
      setError("ネットワークエラーが発生しました。しばらくしてからもう一度お試しください。");
      setIsLoading(false);
    }
    */
    window.location.href = "/thanks";
  };

  const isPayable = agreements.discordRole && agreements.termsAccepted && !isLoading;

  // --- Render (New UI) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen token-bg-main token-text-primary font-sans selection:bg-[color:var(--color-accent)] selection:text-white flex flex-col">
      <Seo
        title={contractTitle}
        description={contractDescription}
        path="/contract"
        type="website"
      />
      <style>{`
        .btn-push:active { transform: translateY(4px); box-shadow: none !important; }
      `}</style>

      <Header
        isLoggedIn={!!displayUser}
        user={displayUser}
        onLogin={handleDiscordLogin}
        onLogout={() => {
          sessionStorage.removeItem("discord_user");
          setUser(null);
        }}
        onScrollTop={() => window.scrollTo(0, 0)}
        brandHref="/membership"
      />

      <main className="flex-grow pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left Col: Plan Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-28">
                <PricingComponent initialPlanKey={displayPlanParam} hideCTA compact />
              </div>
            </motion.div>

            {/* Right Col: Agreements & Action */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
              <motion.div variants={itemVariants} className="mb-2 text-left">
                <h1 className="font-display text-3xl md:text-4xl font-black text-slate-900 mb-2 -translate-x-[0.04em]">
                  サポート内容の確認
                </h1>
                <p className="font-body text-slate-500 font-semibold">
                  決済前の最終確認です。この段階では請求は発生しません。
                </p>
              </motion.div>

              {/* Agreements Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex flex-col gap-4">
                  <CheckboxCard
                    checked={agreements.showSupporterList}
                    onChange={() => toggleAgreement("showSupporterList")}
                    icon={<Users size={20} />}
                    title="支援者一覧に表示する"
                    description="支援者一覧に名前を掲載します（後からいつでも変更できます）。"
                    tag="任意"
                  />

                  <Divider className="border-slate-200" />

                  <div className="pt-2 space-y-3">
                    <label
                      className={`
                        group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer select-none
                        ${
                          agreements.discordRole
                            ? "token-border-accent bg-[color:rgb(var(--color-accent-rgb)/0.15)]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }
                      `}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={agreements.discordRole}
                          onChange={() => toggleAgreement("discordRole")}
                        />
                        <div
                          className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                          ${
                            agreements.discordRole
                              ? "token-bg-accent token-border-accent"
                              : "bg-white border-slate-300 group-hover:border-slate-400"
                          }
                        `}
                        >
                          <Check size={16} className="text-white" strokeWidth={4} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-slate-800 text-lg inline-block -translate-x-[0.02em]">
                            Discordロールの付与
                          </span>
                          <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            必須
                          </span>
                        </div>
                        <p className="font-body text-slate-500 text-sm leading-tight">
                          ゲーム内特典付与のため、サポーターロールを自動付与します。
                        </p>
                      </div>
                    </label>

                    <label
                      className={`
                        group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer select-none
                        ${
                          agreements.termsAccepted
                            ? "token-border-accent bg-[color:rgb(var(--color-accent-rgb)/0.15)]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }
                      `}
                    >
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={agreements.termsAccepted}
                          onChange={() => toggleAgreement("termsAccepted")}
                        />
                        <div
                          className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                          ${
                            agreements.termsAccepted
                              ? "token-bg-accent token-border-accent"
                              : "bg-white border-slate-300 group-hover:border-slate-400"
                          }
                        `}
                        >
                          <Check size={16} className="text-white" strokeWidth={4} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-slate-800 text-lg inline-block -translate-x-[0.025em]">
                            利用規約に同意する
                          </span>
                          <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            必須
                          </span>
                        </div>
                        <p className="font-body text-slate-500 text-sm leading-tight">
                          これはモックであり、実際の規約同意は求めていない。
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Actions Section */}
              <motion.div variants={itemVariants} className="pt-4 space-y-4">
                <Divider className="border-slate-200" />
                <div className="flex flex-col-reverse md:flex-row gap-4 md:items-center justify-between">
                  <button
                    onClick={() => (window.location.href = "/membership")}
                    className="font-body font-bold text-slate-400 hover:text-slate-600 px-4 py-3 transition-colors text-sm"
                  >
                    キャンセルして戻る
                  </button>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button
                      onClick={handlePayment}
                      disabled={!isPayable}
                      className={`
                        btn-push relative w-full md:w-64 h-14 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-3 transition-all
                        ${
                          isPayable
                            ? "token-bg-accent text-white shadow-[0_4px_0_var(--color-action-shadow)] hover:bg-[var(--color-accent-strong)] translate-y-0"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        }
                      `}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          {/* <span>{isPayable ? "Stripeで決済する" : "同意が必要"}</span> */}
                          <span>{isPayable ? "完了画面を見る" : "チェックで次に遷移"}</span>
                          <ArrowRight size={20} strokeWidth={3} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer onScrollTop={() => window.scrollTo(0, 0)} />

      {/* Error Modal Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setError(null)}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-display font-black text-xl text-slate-800 mb-2">エラー</h3>
              <p className="font-body text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
