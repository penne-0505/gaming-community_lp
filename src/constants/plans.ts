export const PLANS = {
  one_month: {
    price: 500,
    unit: "表示例",
    desc: "単発支援UIの表示サンプル",
    label: "One-Time",
    textColor: "text-lime-600",
    bgColor: "bg-lime-500",
    hoverBgColor: "hover:bg-lime-600",
    borderColor: "border-lime-200",
    iconBg: "bg-lime-500",
    shadowStyle: "shadow-[0_5px_0_#A4BD19]",
  },
  sub_monthly: {
    price: 500,
    unit: "表示例",
    desc: "月額支援UIの表示サンプル",
    label: "Monthly",
    textColor: "token-text-accent",
    bgColor: "token-bg-accent",
    hoverBgColor: "hover:bg-[var(--color-accent-strong)]",
    borderColor: "border-[color:rgb(var(--color-accent-rgb)/0.3)]",
    iconBg: "token-bg-accent",
    shadowStyle: "shadow-[0_5px_0_var(--color-action-shadow)]",
  },
  sub_yearly: {
    price: 5000,
    unit: "表示例",
    desc: "年額支援UIの表示サンプル",
    label: "Yearly",
    textColor: "text-teal-600",
    bgColor: "bg-teal-600",
    hoverBgColor: "hover:bg-teal-700",
    borderColor: "border-teal-200",
    iconBg: "bg-teal-600",
    shadowStyle: "shadow-[0_5px_0_#0d9488]",
  },
};

export const PLAN_KEYS = ["one_month", "sub_monthly", "sub_yearly"] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export type PlanDefinition = (typeof PLANS)[PlanKey];
