import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Home,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  PartyPopper,
  Crown,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { beginDiscordLogin } from "../utils/discordAuth";
import { PLANS } from "../constants/plans";
import Seo from "../components/Seo";
import { DEMO_DISCORD_INVITE_URL, IS_DEMO_MODE } from "../constants/demo";

const FALLBACK_AVATAR = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Credit Card",
  konbini: "コンビニ",
  paypay: "PayPay",
  bank_transfer: "Bank Transfer",
  customer_balance: "Bank Transfer",
  cashapp: "Cash App",
  boleto: "Boleto",
};

const formatCurrency = (amount: number | null | undefined, currency?: string | null) => {
  if (amount == null) return null;
  const upperCurrency = (currency || "JPY").toUpperCase();
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: upperCurrency,
    }).format(amount);
  } catch {
    return `${amount} ${upperCurrency}`;
  }
};

const resolvePaymentMethodLabel = (methods: string[] = []) => {
  const method = methods[0];
  if (!method) return "Stripe";
  return PAYMENT_METHOD_LABELS[method] || method.replace("_", " ");
};

// Enhanced Confetti
const ConfettiParticle = ({ delay, x, type }: { delay: number; x: string; type: number }) => {
  const colors = [
    "bg-yellow-400",
    "token-bg-accent",
    "bg-pink-400",
    "bg-blue-400",
    "bg-purple-400",
  ];
  const color = colors[type % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 0, rotate: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, 150 + Math.random() * 300],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [0, 180 + Math.random() * 360],
        scale: [0, 1, 0.8],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
      className={`absolute -top-10 w-3 h-3 rounded-sm ${color}`}
      style={{ left: x }}
    />
  );
};

// Glowing background aura
const GlowAura = () => (
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-yellow-200/40 via-[color:rgb(var(--color-accent-rgb)/0.1)] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
);

const getDemoPlanKey = () => {
  const url = new URL(window.location.href);
  const plan = url.searchParams.get("plan");
  return plan && PLANS[plan as keyof typeof PLANS] ? plan : "sub_monthly";
};

export default function Thanks() {
  const thanksTitle = "完了画面デモ";
  const thanksDescription =
    "支援フロー完了後の案内画面を再現したデモです。実際の決済やロール付与は行っていません。";
  const mockUser = {
    name: "Supporter",
    avatar: FALLBACK_AVATAR,
  };
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(() => {
    try {
      const raw = sessionStorage.getItem("discord_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayUser = user || mockUser;
  const demoPlanKey = useMemo(() => getDemoPlanKey(), []);
  const demoPlan = PLANS[demoPlanKey as keyof typeof PLANS];
  const displayTransactionId = session?.transaction_id || `tx_demo_${demoPlanKey}`;

  const sessionId = useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("session_id");
  }, []);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError("決済セッションが見つかりませんでした。");
      setLoading(false);
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
          { signal: controller.signal, credentials: "include" }
        );
        if (!res.ok) {
          const text = await res.text();
          if (res.status === 401) {
            setError("ログインが必要です。");
            return;
          }
          throw new Error(text || "決済データの取得に失敗しました。");
        }
        const data = await res.json();
        if (!ignore) {
          setSession(data.session || null);
        }
      } catch {
        if (!ignore) {
          setError("決済データの取得に失敗しました。時間をおいてお試しください。");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [sessionId]);

  const isLoggedIn = !!(user && user.id);
  const handleLogout = () => {
    sessionStorage.removeItem("discord_user");
    setUser(null);
  };

  const handleCopyId = () => {
    if (!displayTransactionId) return;
    navigator.clipboard.writeText(displayTransactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const planName = useMemo(() => {
    if (!session) return `${demoPlan.label} Plan`;
    const plan = session.price_type ? PLANS[session.price_type as keyof typeof PLANS] : null;
    if (plan?.label) return `${plan.label} Plan`;
    return session.line_item_name || "Supporter Plan";
  }, [demoPlan.label, session]);

  const amountText = useMemo(() => {
    if (!session) return `表示例 ${formatCurrency(demoPlan.price, "JPY")}`;
    return formatCurrency(session.amount_total, session.currency);
  }, [demoPlan.price, session]);

  const dateText = useMemo(() => {
    if (!session?.created) {
      return new Date().toLocaleDateString("ja-JP");
    }
    const date = new Date(session.created);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ja-JP");
  }, [session]);

  const paymentMethod = useMemo(() => {
    if (!session) return "Demo";
    return resolvePaymentMethodLabel(session.payment_method_types);
  }, [session]);

  // Portfolio: bypass access gate for /thanks.
  // const accessBlocked = !loading && (error || !session);
  const accessBlocked = false;

  return (
    <div className="min-h-screen token-bg-main font-sans selection:bg-[color:rgb(var(--color-accent-rgb)/0.3)] token-text-primary flex flex-col overflow-hidden relative">
      <Seo
        title={thanksTitle}
        description={thanksDescription}
        path="/thanks"
        type="website"
        noIndex
      />
      <style>{`
        .text-gradient-gold {
          background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Confetti Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.15} x={`${Math.random() * 100}%`} type={i} />
        ))}
      </div>

      <GlowAura />

      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={beginDiscordLogin}
        onLogout={handleLogout}
        onScrollTop={scrollToTop}
      />

      <main className="flex-grow pt-36 md:pt-44 pb-12 px-4 md:px-6 relative z-10 flex flex-col items-center">
        {accessBlocked ? (
          <div className="max-w-xl w-full text-center">
            <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle size={24} />
              </div>
              <h1 className="font-display type-h2 token-text-display mb-3">
                決済情報を確認できませんでした
              </h1>
              <p className="font-body type-body token-text-secondary mb-6">
                {error || "このページは決済完了後に表示されます。"}
              </p>
              <a
                href="/membership"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl token-bg-accent text-white font-bold shadow-[0_4px_0_var(--color-action-shadow)] active:translate-y-[3px] transition-all"
              >
                メンバーシップへ戻る
              </a>
            </div>
          </div>
        ) : (
          <div className="max-w-xl w-full text-center">
            {/* Avatar Celebration Hero */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="mb-6 relative inline-block"
            >
              {/* Crown Icon */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: -35, opacity: 1, rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 text-yellow-400 drop-shadow-lg"
              >
                <Crown size={48} fill="currentColor" strokeWidth={1.5} />
              </motion.div>

              {/* Avatar with Ring */}
              <div className="relative z-10 p-2 bg-white rounded-full shadow-xl">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-yellow-300 relative bg-slate-100">
                  <img
                    src={displayUser.avatar || FALLBACK_AVATAR}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 token-bg-accent text-white p-2 rounded-full border-4 border-white shadow-lg">
                  <Check size={20} strokeWidth={4} />
                </div>
              </div>

              {/* Sparkles around avatar */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -m-8 pointer-events-none"
              >
                <Sparkles className="absolute top-0 right-0 text-yellow-400" size={24} />
                <Sparkles className="absolute bottom-0 left-0 token-text-accent" size={20} />
              </motion.div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
            >
              <div className="flex items-center justify-center gap-2 mb-2 text-yellow-500 font-bold uppercase tracking-widest text-xs">
                <PartyPopper size={16} />
                <span>Demo flow complete</span>
                <PartyPopper size={16} className="scale-x-[-1]" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                Demo Complete,
                <br />
                <span className="text-gradient-gold">{displayUser.name || "Supporter"}!</span>
              </h1>
              <p className="font-body text-slate-500 font-semibold text-lg md:text-xl max-w-sm mx-auto">
                完了画面の表示例です。
                <br />
                実際の支払い、契約、Discordロール付与は発生していません。
              </p>
            </motion.div>

            {/* Membership Card (Receipt) */}
            <motion.div
              initial={{ y: 40, opacity: 0, rotateX: -15 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="perspective-1000 mb-10"
            >
              <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative transform transition-transform hover:scale-[1.02] duration-300">
                {/* Gold decorative bar */}
                <div className="h-3 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 w-full" />

                <div className="p-8 pb-10">
                  {loading ? (
                    <div className="space-y-4 text-left">
                      <div className="h-4 w-32 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-6 w-48 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-left">
                          <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-[10px] uppercase tracking-wider mb-2">
                            Demo Supporter
                          </span>
                          <h3 className="font-display font-black text-xl text-slate-800">
                            {planName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold text-2xl token-text-accent">
                            {amountText}
                          </div>
                          <div className="text-xs font-bold text-slate-400">Demo Only</div>
                        </div>
                      </div>

                      <div className="relative h-px w-full bg-slate-200 my-6">
                        <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full token-bg-main" />
                        <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full token-bg-main" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left font-body text-sm">
                        <div>
                          <div className="text-slate-400 text-xs font-bold mb-1">Date</div>
                          <div className="font-bold text-slate-700">{dateText}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs font-bold mb-1">Mode</div>
                          <div className="font-bold text-slate-700 flex items-center gap-2">
                            {paymentMethod}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-slate-400 text-xs font-bold mb-1">Demo ID</div>
                          <div
                            onClick={handleCopyId}
                            className={`group flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 transition-colors ${
                              displayTransactionId
                                ? "cursor-pointer hover:bg-slate-100"
                                : "cursor-default opacity-60"
                            }`}
                          >
                            <span className="font-mono text-slate-600 text-xs">
                              {displayTransactionId || "N/A"}
                            </span>
                            <span className="text-slate-400 group-hover:text-[var(--color-accent)] transition-colors">
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mb-12"
            >
              {/* Discord Action */}
              <div className="group relative bg-white p-1 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cta)] to-[#404EED] rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10 blur-sm translate-y-2" />
                <div className="bg-white rounded-xl p-5 h-full flex flex-col items-center text-center border border-slate-100 group-hover:border-[color:rgb(var(--color-cta-rgb)/0.3)] transition-colors">
                  <div className="w-12 h-12 token-bg-cta-soft token-text-cta rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle size={24} fill="currentColor" className="opacity-20 absolute" />
                    <MessageCircle size={24} className="relative z-10" />
                  </div>
                  <h3 className="font-display font-black text-slate-800 mb-1">Check Discord</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-4">
                    ロール付与後の案内UIです。
                    <br />
                    実際のDiscord操作は行っていません。
                  </p>
                  <a
                    href={import.meta.env.VITE_DISCORD_INVITE_URL || DEMO_DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full py-2 rounded-lg token-bg-cta text-white text-sm font-bold shadow-[0_3px_0_var(--color-cta-shadow)] active:shadow-none active:translate-y-[3px] transition-all flex items-center justify-center gap-2"
                  >
                    Discordを開く <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <a
                href="/"
                className="text-slate-400 font-bold font-body text-sm hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Home size={16} />
                トップページへ戻る
              </a>
            </motion.div>
          </div>
        )}
      </main>

      <Footer onScrollTop={scrollToTop} />
    </div>
  );
}
