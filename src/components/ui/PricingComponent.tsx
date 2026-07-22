import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { ArrowRight, Check, Sparkles, Zap, Repeat, Calendar } from "lucide-react";
import { PLANS, type PlanKey } from "../../constants/plans";
import { PRICING_COPY } from "../../constants/pricingCopy";

type BillingType = "subscription" | "one_time";

const deriveStateFromPlanKey = (
  planKey?: PlanKey | string | null
): { billingType: BillingType; isYearly: boolean } => {
  switch (planKey) {
    case "one_month":
      return { billingType: "one_time", isYearly: false };
    case "sub_yearly":
      return { billingType: "subscription", isYearly: true };
    case "sub_monthly":
    default:
      return { billingType: "subscription", isYearly: false };
  }
};

export interface PricingComponentProps {
  onStartCheckout?: (planKey: PlanKey) => void | Promise<void>;
  initialPlanKey?: PlanKey | string | null;
  locked?: boolean;
  hideCTA?: boolean;
  compact?: boolean;
}

const PricingComponent = ({
  onStartCheckout,
  initialPlanKey,
  locked = false,
  hideCTA = false,
  compact = false,
}: PricingComponentProps) => {
  const initialState = deriveStateFromPlanKey(initialPlanKey);
  const [billingType, setBillingType] = useState<BillingType>(initialState.billingType);
  const [isYearly, setIsYearly] = useState(initialState.isYearly);

  useEffect(() => {
    if (!initialPlanKey) return;
    const next = deriveStateFromPlanKey(initialPlanKey);
    setBillingType(next.billingType);
    setIsYearly(next.isYearly);
  }, [initialPlanKey]);

  // 選択状態からプランキーを解決
  const getPlanKey = (): PlanKey => {
    if (billingType === "one_time") return "one_month";
    return isYearly ? "sub_yearly" : "sub_monthly";
  };

  const planKey = getPlanKey();
  const plan = PLANS[planKey];
  const isRecommended = planKey === "sub_yearly";

  // スワイプ操作のハンドリング
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (locked) return;

    const offset = info.offset.x;
    const threshold = 50; // 切り替え判定の移動距離

    // 現在が「単発」で左にスワイプ → 「継続」へ
    if (billingType === "one_time" && offset < -threshold) {
      setBillingType("subscription");
    }
    // 現在が「継続」で右にスワイプ → 「単発」へ
    else if (billingType === "subscription" && offset > threshold) {
      setBillingType("one_time");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
      {/* 1. Main Type Selector (Tabs) */}
      <div
        className={`bg-slate-100 p-1.5 rounded-2xl flex relative w-full max-w-sm ${compact ? "mb-6" : "mb-8"} shadow-inner ${locked ? "opacity-70 pointer-events-none" : ""}`}
      >
        <motion.div
          className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm z-0"
          initial={false}
          animate={{
            left: billingType === "one_time" ? "0.375rem" : "50%",
            x: billingType === "one_time" ? 0 : "0.375rem",
            width: "calc(50% - 0.75rem)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        <button
          onClick={() => {
            if (locked) return;
            setBillingType("one_time");
          }}
          className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${
            billingType === "one_time" ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Zap
            size={16}
            className={billingType === "one_time" ? "text-lime-500 fill-current" : ""}
          />
          {PRICING_COPY.tabs.oneTime}
        </button>

        <button
          onClick={() => {
            if (locked) return;
            setBillingType("subscription");
          }}
          className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${
            billingType === "subscription"
              ? "text-slate-800"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Repeat size={16} className={billingType === "subscription" ? "token-text-accent" : ""} />
          {PRICING_COPY.tabs.subscription}
        </button>
      </div>

      {/* 2. Interval Toggle (Only for Subscription) */}
      <div
        className={`${compact ? "h-11 mb-6" : "h-12 mb-8"} flex justify-center items-center ${locked ? "opacity-70 pointer-events-none" : ""}`}
      >
        <AnimatePresence mode="wait">
          {billingType === "subscription" ? (
            <motion.div
              key="toggle"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="relative bg-white border border-slate-100 rounded-full px-6 py-2 shadow-sm"
            >
              <button
                type="button"
                aria-pressed={isYearly}
                aria-label={
                  isYearly
                    ? PRICING_COPY.intervalToggle.aria.yearlyOn
                    : PRICING_COPY.intervalToggle.aria.yearlyOff
                }
                onClick={() => {
                  if (locked) return;
                  setIsYearly((prev) => !prev);
                }}
                className="absolute inset-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span className="sr-only">
                  {isYearly
                    ? PRICING_COPY.intervalToggle.aria.yearlyOn
                    : PRICING_COPY.intervalToggle.aria.yearlyOff}
                </span>
              </button>
              <div className="flex items-center gap-4 pointer-events-none">
                <span
                  className={`text-sm font-bold transition-colors ${
                    !isYearly ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {PRICING_COPY.intervalToggle.monthly}
                </span>

                <span
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    isYearly ? "bg-teal-500" : "bg-slate-200"
                  }`}
                >
                  <motion.span
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: isYearly ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  />
                </span>

                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isYearly ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {PRICING_COPY.intervalToggle.yearly}
                  </span>
                  <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-teal-200 flex items-center gap-1">
                    <Sparkles size={10} /> {PRICING_COPY.intervalToggle.yearlyBadge}
                  </span>
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="one-time-label"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold text-slate-400 flex items-center gap-2"
            >
              <Calendar size={16} />
              {PRICING_COPY.intervalToggle.oneTimeHelper}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Plan Card Display */}
      <div className="w-full max-w-md relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={planKey}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // Drag Properties for Swipe
            drag={locked ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ touchAction: "pan-y" }} // Allow vertical scrolling
            className="w-full cursor-grab active:cursor-grabbing"
          >
            <div
              className={`relative flex flex-col ${compact ? "p-7 md:p-9" : "p-8 md:p-10"} rounded-[2.5rem] bg-white border-4 transition-all duration-200 ${
                isRecommended
                  ? "border-teal-100 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.25)]"
                  : plan.borderColor + " shadow-xl"
              } overflow-hidden group`}
            >
              {/* Background Decoration */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${plan.bgColor} opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}
              />

              {isRecommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-wider flex items-center gap-1 shadow-md whitespace-nowrap z-10">
                  <Sparkles size={12} fill="currentColor" />{" "}
                  {PRICING_COPY.planCard.recommendedBadge}
                </div>
              )}

              <div className={`${compact ? "mb-7" : "mb-8"} text-center relative z-10`}>
                <h3
                  className={`font-black text-2xl mb-3 uppercase tracking-wide font-outfit ${plan.textColor}`}
                >
                  {plan.label}
                  {PRICING_COPY.planCard.planLabelSuffix}
                </h3>
                <div className="flex items-baseline justify-center gap-1 text-slate-800 font-outfit">
                  <span className="text-xl font-bold">{PRICING_COPY.planCard.pricePrefix}</span>
                  <span
                    className={`text-6xl font-black tracking-tighter font-outfit ${plan.textColor}`}
                  >
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">
                    {PRICING_COPY.planCard.priceUnitPrefix}
                    {plan.unit}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-bold mt-4 bg-slate-50 inline-block px-4 py-1 rounded-full">
                  {plan.desc}
                </p>
              </div>

              <div
                className={`${compact ? "space-y-3 mb-9" : "space-y-4 mb-10"} flex-1 relative z-10`}
              >
                <div className={`w-full h-px bg-slate-100 ${compact ? "mb-5" : "mb-6"}`} />
                {PRICING_COPY.features.filter(Boolean).map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="flex items-center gap-4 text-slate-700 font-bold"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${plan.iconBg} bg-gradient-to-br from-white/20 to-transparent`}
                    >
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <span className="text-small md:text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {!hideCTA && (
                <button
                  onClick={() => {
                    if (typeof onStartCheckout === "function") {
                      onStartCheckout?.(planKey);
                    }
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all btn-push text-white shadow-lg active:shadow-none active:translate-y-[4px] relative overflow-hidden group ${plan.bgColor} ${plan.hoverBgColor}`}
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 rounded-2xl pointer-events-none"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {PRICING_COPY.cta} <ArrowRight size={20} strokeWidth={3} />
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PricingComponent;
