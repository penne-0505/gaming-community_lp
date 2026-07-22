import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Crown, Star } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { beginDiscordLogin } from "../utils/discordAuth";
import Seo from "../components/Seo";
import { DEMO_SUPPORTERS, IS_DEMO_MODE } from "../constants/demo";

const planStyles: Record<string, { color: string; bg: string; border: string }> = {
  Yearly: {
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  Monthly: {
    color: "token-text-accent",
    bg: "token-bg-accent-soft",
    border: "border-[color:rgb(var(--color-accent-rgb)/0.3)]",
  },
  Ticket: {
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  Supporter: {
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
};

const SupporterCard = ({ supporter, index }: { supporter: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    className={`bg-white rounded-2xl p-6 border ${supporter.border} shadow-sm relative overflow-hidden group`}
  >
    {/* Decorative Background */}
    <div
      className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 transition-transform group-hover:scale-110 ${supporter.bg.replace("/10", "")}`}
    />

    <div className="flex items-start gap-4 relative z-10">
      <div className="relative">
        <img
          src={supporter.avatar}
          alt={supporter.name}
          className="w-16 h-16 rounded-2xl bg-slate-100 object-cover shadow-inner"
        />
        {supporter.plan === "Yearly" && (
          <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm border-2 border-white">
            <Crown size={12} fill="currentColor" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{supporter.name}</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${supporter.bg} ${supporter.color}`}
          >
            {supporter.plan} Plan
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-bold">Joined: {supporter.joinedAt}</div>
      </div>
    </div>
  </motion.div>
);

const PAGE_SIZE = 9;

const Supporters = () => {
  const supportersTitle = "支援者一覧デモ";
  const supportersDescription = "支援者一覧画面の表示サンプルです。掲載名はモックデータです。";
  const [searchTerm, setSearchTerm] = useState("");
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = sessionStorage.getItem("discord_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let aborted = false;
    (async () => {
      if (IS_DEMO_MODE) {
        const mapped = DEMO_SUPPORTERS.map((s: any) => {
          const style = planStyles[s.plan] || planStyles.Supporter;
          return {
            ...s,
            ...style,
            bg: style.bg,
            color: style.color,
            border: style.border,
          };
        });
        setSupporters(mapped);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/supporters", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        const data = await res.json();
        if (aborted) return;
        const mapped = (data?.supporters || []).map((s: any) => {
          const style = planStyles[s.plan] || planStyles.Supporter;
          return {
            ...s,
            ...style,
            bg: style.bg,
            color: style.color,
            border: style.border,
            joinedAt: s.joinedAt || "---",
          };
        });
        setSupporters(mapped);
        setCurrentPage(1);
      } catch {
        if (!aborted) {
          setError("サポーターの取得に失敗しました。");
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleLogin = () => beginDiscordLogin();
  const handleLogout = () => {
    sessionStorage.removeItem("discord_user");
    setUser(null);
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const filtered = supporters.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedSupporters = loading
    ? supporters
    : filtered.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  const buildPageButtons = (): Array<number | "..."> => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | "..."> = [1];
    if (safeCurrentPage > 3) pages.push("...");
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (safeCurrentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen token-bg-alt font-sans selection:bg-[color:rgb(var(--color-accent-rgb)/0.3)] token-text-primary">
      <Seo
        title={supportersTitle}
        description={supportersDescription}
        path="/supporters"
        type="website"
        noIndex
      />
      <Header
        isLoggedIn={!!user}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onScrollTop={scrollToTop}
      />

      <main className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 type-kicker mb-4"
            >
              <Star size={14} className="text-amber-400 fill-current" />
              Demo Supporters
            </motion.div>
            <h1 className="font-display type-h1 token-text-display mb-4">Supporter List Demo</h1>
            <p className="font-body type-body token-text-secondary max-w-xl mx-auto">
              支援者一覧ページの表示サンプルです。
              <br className="hidden md:inline" />
              ここに表示されるユーザー名とプランはモックデータです。
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="名前で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-accent-rgb)/0.5)] focus:border-[var(--color-accent)] transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end w-full md:w-auto">
              <div className="text-xs font-bold text-slate-400 px-2">
                Total: <span className="text-slate-800">{loading ? "..." : filtered.length}</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSupporters.map((supporter, index) => (
              <SupporterCard key={supporter.id} supporter={supporter} index={index} />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-400 font-bold py-10">
                {error || "該当するサポーターが見つかりません。"}
              </div>
            )}
          </div>

          {/* Pagination Mock */}
          {buildPageButtons().length > 0 && (
            <div className="mt-12 flex justify-center gap-2">
              {buildPageButtons().map((page, i) => {
                const isEllipsis = page === "...";
                const isActive = page === safeCurrentPage;
                return (
                  <button
                    key={`${page}-${i}`}
                    disabled={isEllipsis}
                    onClick={() => {
                      if (typeof page === "number") setCurrentPage(page);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      isActive
                        ? "token-bg-accent text-white shadow-md"
                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-default"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer onScrollTop={scrollToTop} />
    </div>
  );
};

export default Supporters;
