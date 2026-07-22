import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEMO_SUPPORTERS, IS_DEMO_MODE } from "../../constants/demo";

interface TickerSupporter {
  name: string;
  plan: string;
  joinedAt?: string;
  avatar?: string | null;
}

const SupporterTicker = ({ showLabel = true }: { showLabel?: boolean }) => {
  const [supporters, setSupporters] = useState<TickerSupporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const getPlanStyle = (plan: string) => {
    switch (plan) {
      case "Ticket":
        return "text-lime-600 bg-lime-100 border-lime-200";
      case "Yearly":
        return "text-teal-600 bg-teal-100 border-teal-200";
      case "Monthly":
      default:
        return "token-text-accent bg-[rgb(var(--color-accent-rgb)/0.1)] border-[rgb(var(--color-accent-rgb)/0.3)]";
    }
  };

  useEffect(() => {
    let aborted = false;

    (async () => {
      if (IS_DEMO_MODE) {
        setSupporters(DEMO_SUPPORTERS);
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
        const data = (await res.json()) as { supporters?: TickerSupporter[] };
        if (aborted) return;
        const mapped = (data?.supporters || []).map((s) => ({
          name: s.name,
          plan: s.plan,
          joinedAt: s.joinedAt,
          avatar: s.avatar,
        }));
        setSupporters(mapped);
      } catch {
        if (!aborted) {
          setSupporters([]);
          setFailed(true);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  const formatJoinedDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading || failed || supporters.length <= 5) {
    return null;
  }

  const loopSupporters = [...supporters, ...supporters];

  return (
    <div className="flex flex-col gap-4">
      {showLabel && (
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-slate-400 tracking-wider uppercase flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            デモ支援者
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </p>
        </div>
      )}
      <div className="flex overflow-hidden select-none">
        <motion.div
          className="flex gap-4 md:gap-6 pr-4 md:pr-6"
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
          whileHover={{ animationPlayState: "paused" }}
          style={{ width: "max-content" }}
        >
          {loopSupporters.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
              className="flex items-center gap-4 bg-white/60 backdrop-blur-sm border border-slate-200 px-6 py-3 rounded-full shadow-sm whitespace-nowrap min-w-[400px] cursor-default transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-semibold text-sm shrink-0 overflow-hidden">
                {s.avatar ? (
                  <img
                    src={s.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  s.name[0]
                )}
              </div>
              <div className="text-base font-semibold text-slate-700">{s.name}</div>
              <div
                className={`text-[10px] font-semibold uppercase px-2 py-1 rounded border ${getPlanStyle(
                  s.plan
                )}`}
              >
                {s.plan}
              </div>
              <div className="flex-1" />
              {s.joinedAt && (
                <div className="text-[10px] font-semibold text-slate-400">
                  {formatJoinedDate(s.joinedAt)}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SupporterTicker;
