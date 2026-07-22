import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Layers,
  LockKeyhole,
  MessageCircle,
  Route,
  Sparkles,
  Users,
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SampleSiteNotice from "../components/ui/SampleSiteNotice";
import Seo from "../components/Seo";
import lpEntryScreenshot from "../assets/images/demo-flow/lp-entry.jpg";
import lpCtaScreenshot from "../assets/images/demo-flow/lp-cta.jpg";
import membershipStartScreenshot from "../assets/images/demo-flow/membership-start.jpg";
import membershipLoginScreenshot from "../assets/images/demo-flow/membership-login.jpg";
import membershipContractScreenshot from "../assets/images/demo-flow/membership-contract.jpg";
import membershipThanksScreenshot from "../assets/images/demo-flow/membership-thanks.jpg";
import membershipCancellationScreenshot from "../assets/images/demo-flow/membership-cancellation.jpg";
import membershipSupportersScreenshot from "../assets/images/demo-flow/membership-supporters.jpg";

const tabs = [
  {
    id: "lp",
    label: "一般流入LP",
    icon: Globe2,
    eyebrow: "External Entry",
    title: "一般流入からDiscord参加までの本来フロー。",
    description:
      "LPは雰囲気、遊び方、参加前の期待値を伝える対外向けの入口です。本来は参加CTAからDiscord招待を開き、そのまま実サーバーへ参加します。",
    primaryCta: { label: "LPを見る", href: "/" },
    secondaryCta: { label: "Membership導線を見る", tab: "membership" },
    accent: "accent",
    steps: [
      {
        icon: Globe2,
        title: "LPで雰囲気を確認",
        body: "外部から来た人が、ギャラリー、特徴、メンバーの声を見て参加前の期待値を整えます。",
        href: "/",
        action: "LPへ",
        visual: {
          src: lpEntryScreenshot,
          width: 1280,
          height: 860,
          label: "一般流入LPのトップ画面",
        },
      },
      {
        icon: MessageCircle,
        title: "参加CTAから招待を開く",
        body: "本番ではCTA押下でDiscord招待URLを開きます。LP上では参加直前の同意文言までを短く提示します。",
        href: "/#join",
        action: "CTA位置へ",
        visual: {
          src: lpCtaScreenshot,
          width: 1280,
          height: 860,
          label: "Discord参加CTAの位置",
        },
      },
      {
        icon: Route,
        title: "Discord内で参加を完了",
        body: "招待先でサーバー参加、ルール確認、初期案内の確認を行います。実サーバーへの参加画面は公開デモでは再現しません。",
        externalLabel: "Discord Invite",
        externalNote:
          "実サーバー招待とDiscord画面は公開できないため、ここでは本来の到達点だけを示しています。",
      },
    ],
  },
  {
    id: "membership",
    label: "Membership",
    icon: HeartHandshake,
    eyebrow: "Member Funnel",
    title: "既存メンバーが支援契約を完了する本来フロー。",
    description:
      "Membershipは、すでにコミュニティに属している人がDiscord認証、プラン確認、Stripe決済、ロール付与、解約までを進むための導線です。",
    primaryCta: { label: "Membershipフローを開始", href: "/membership" },
    secondaryCta: { label: "一般流入LPを見る", tab: "lp" },
    accent: "cta",
    steps: [
      {
        icon: HeartHandshake,
        title: "支援ページでプランを選ぶ",
        body: "既存メンバーが支援内容、支援者表示、プラン差分を確認し、契約したいプランを選びます。",
        href: "/membership",
        action: "開始する",
        visual: {
          src: membershipStartScreenshot,
          width: 1280,
          height: 860,
          label: "Membership支援ページ",
        },
      },
      {
        icon: BadgeCheck,
        title: "Discord OAuthで本人確認",
        body: "本番ではDiscord OAuthで本人確認を行い、契約とDiscordユーザーIDを紐づけます。公開版ではサンプルユーザーへ置換しています。",
        visual: {
          src: membershipLoginScreenshot,
          width: 1280,
          height: 860,
          label: "Membershipログイン導線",
        },
      },
      {
        icon: FileCheck2,
        title: "契約確認",
        body: "選択プラン、支援者表示、Discordロール付与への同意を確認し、Checkoutへ渡すメタデータを整えます。",
        href: "/contract?plan=sub_monthly",
        action: "確認画面へ",
        visual: {
          src: membershipContractScreenshot,
          width: 1280,
          height: 860,
          label: "契約確認画面",
        },
      },
      {
        icon: CreditCard,
        title: "Stripe Checkoutで決済",
        body: "本番ではStripe Checkoutを開き、支払い方法の入力と決済確定を行います。公開デモでは実Checkout Sessionを作成しません。",
        externalLabel: "Stripe Checkout",
        externalNote:
          "決済画面、カード入力、実請求は外部サービスかつ公開デモ対象外のため、スクリーンショットを掲載していません。",
      },
      {
        icon: CheckCircle2,
        title: "完了画面",
        body: "Checkout成功後に戻り、契約内容、デモID、次の案内を表示します。本番ではsession_idから実契約情報を確認します。",
        href: "/thanks?demo=1&plan=sub_monthly",
        action: "完了画面へ",
        visual: {
          src: membershipThanksScreenshot,
          width: 1280,
          height: 860,
          label: "支援完了画面",
        },
      },
      {
        icon: Users,
        title: "Discordロールを付与",
        body: "Stripe Webhookを受けたFunctionsがDiscord Bot APIを呼び、支援者ロールや支援者一覧の状態を更新します。",
        externalLabel: "Discord Bot API",
        externalNote:
          "ロール付与、チャンネル権限変更、ゲーム内特典提供は実サーバー側の処理なので公開デモでは実行しません。",
      },
      {
        icon: Users,
        title: "支援者一覧",
        body: "契約状態とDiscordユーザー情報をもとに、支援者一覧や表示バッジへ反映します。",
        href: "/supporters",
        action: "一覧へ",
        visual: {
          src: membershipSupportersScreenshot,
          width: 1280,
          height: 860,
          label: "支援者一覧画面",
        },
      },
      {
        icon: CreditCard,
        title: "Customer Portalで解約",
        body: "支援継続中の管理導線からStripe Customer Portalを開き、プラン変更やキャンセルを行います。契約開始とは別の分岐として扱います。",
        externalLabel: "Stripe Customer Portal",
        externalNote:
          "Portal画面は外部サービスで、公開デモではセッションを作成しないためスクリーンショットを省略しています。",
        tone: "aftercare",
      },
      {
        icon: CheckCircle2,
        title: "解約完了を表示",
        body: "Portalから戻った後、残り期間とロール剥奪が行われる想定タイミングを案内します。契約完了とは異なる終了状態として表示します。",
        href: "/cancellation",
        action: "解約画面へ",
        visual: {
          src: membershipCancellationScreenshot,
          width: 1280,
          height: 860,
          label: "解約導線画面",
        },
        tone: "aftercare",
      },
    ],
  },
];

const boundaryItems = [
  {
    title: "実Discord招待URLは公開しない",
    detail: "招待リンクは環境変数経由でのみ参照します。",
  },
  {
    title: "実Discord OAuthはモックユーザーに置換",
    detail: "Login導線はあるが、本物のIDは取得しません。",
  },
  {
    title: "Stripe Checkout / Portalは作成しない",
    detail: "クライアントから外部セッションを開きません。",
  },
  {
    title: "Discordロール付与は実行しない",
    detail: "WebhookとBot APIへの結線は参考実装に留めます。",
  },
  {
    title: "ゲーム内特典提供は発生しない",
    detail: "実サーバー側の権限変更は本デモ対象外です。",
  },
  {
    title: "Pages Functionsの参考実装は保持",
    detail: "コード上は本番フローを示し、実行は停止しています。",
  },
];

const accentClassMap = {
  accent: {
    text: "token-text-accent",
    bg: "token-bg-accent",
    bgSoft: "token-bg-accent-soft",
    ring: "ring-[rgb(var(--color-accent-rgb)/0.25)]",
    shadow: "shadow-[0_4px_0_var(--color-action-shadow)]",
    hover: "hover:bg-[var(--color-action-hover)]",
    wash: "bg-[rgb(var(--color-accent-rgb)/0.06)]",
    border: "border-[rgb(var(--color-accent-rgb)/0.25)]",
  },
  cta: {
    text: "token-text-cta",
    bg: "token-bg-cta",
    bgSoft: "token-bg-cta-soft",
    ring: "ring-[rgb(var(--color-cta-rgb)/0.25)]",
    shadow: "shadow-[0_4px_0_var(--color-cta-shadow)]",
    hover: "hover:bg-[var(--color-cta-shadow)]",
    wash: "bg-[rgb(var(--color-cta-rgb)/0.05)]",
    border: "border-[rgb(var(--color-cta-rgb)/0.25)]",
  },
};

const isKnownTab = (tabId: string | null): tabId is string =>
  !!tabId && tabs.some((tab) => tab.id === tabId);

const getActiveTab = (searchParams: URLSearchParams) => {
  const tab = searchParams.get("tab");
  return isKnownTab(tab) ? tab : "lp";
};

const TabButton = ({
  tab,
  isActive,
  onSelect,
  accent,
}: {
  tab: (typeof tabs)[number];
  isActive: boolean;
  onSelect: (id: string) => void;
  accent: keyof typeof accentClassMap;
}) => {
  const Icon = tab.icon;
  const palette =
    accentClassMap[accent as keyof typeof accentClassMap as keyof typeof accentClassMap];

  return (
    <button
      type="button"
      role="tab"
      id={`demo-flow-tab-${tab.id}`}
      aria-selected={isActive}
      aria-controls={`demo-flow-panel-${tab.id}`}
      onClick={() => onSelect(tab.id)}
      className={`group relative inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-black transition-all focus:outline-none focus-visible:ring-4 sm:text-sm ${palette.ring} md:flex-none md:px-5 ${
        isActive
          ? `${palette.bg} text-white ${palette.shadow}`
          : "bg-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{tab.label}</span>
      <span
        className={`ml-1 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {tab.steps.length}
      </span>
    </button>
  );
};

const StickyTabs = ({
  activeTabId,
  selectTab,
}: {
  activeTabId: string;
  selectTab: (id: string) => void;
}) => (
  <div className="sticky top-16 z-30 md:top-20">
    <div className="border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div role="tablist" aria-label="本来フロー導線" className="flex items-center gap-1 py-3">
          <span className="hidden items-center gap-2 pr-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400 md:inline-flex">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Flow
          </span>
          <div className="flex flex-1 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1 md:flex-none">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                onSelect={selectTab}
                accent={tab.accent as keyof typeof accentClassMap}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FlowVisual = ({
  image,
  label,
}: {
  image: { src: string; width?: number; height?: number; label?: string };
  label: string;
}) => (
  <div className="relative">
    <div className="absolute -left-2 top-5 z-20 hidden rotate-[-4deg] rounded-full bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-lg md:inline-flex">
      {label}
    </div>
    <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_20px_40px_-15px_rgba(15,23,42,0.18)]">
      <div className="flex h-8 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" aria-hidden="true" />
      </div>
      <img
        src={image.src}
        sizes="(max-width: 768px) 92vw, 640px"
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        alt={image.label}
        className="aspect-[16/10] w-full bg-slate-100 object-cover object-top"
      />
    </div>
  </div>
);

const ExternalFlowNote = ({
  step,
  palette,
}: {
  step: (typeof tabs)[number]["steps"][number];
  palette: (typeof accentClassMap)[keyof typeof accentClassMap];
}) => (
  <div className="relative overflow-hidden rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-7 shadow-sm md:p-9">
    <div className={`absolute inset-x-0 top-0 h-1 ${palette.bg}`} aria-hidden="true" />
    <span className={`type-kicker ${palette.text}`}>{step.externalLabel ?? "External Step"}</span>
    <h4 className="mt-3 font-display text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
      外部サービスで実行
    </h4>
    <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
      {step.externalNote}
    </p>
    <div className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white">
      <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>公開デモでは外部処理を実行しません</span>
    </div>
  </div>
);

const FlowStep = ({
  step,
  index,
  totalSteps,
  activeTab,
}: {
  step: (typeof tabs)[number]["steps"][number];
  index: number;
  totalSteps: number;
  activeTab: (typeof tabs)[number];
}) => {
  const Icon = step.icon;
  const isReversed = index % 2 === 1;
  const isAftercare = step.tone === "aftercare";
  const palette =
    accentClassMap[activeTab.accent as keyof typeof accentClassMap as keyof typeof accentClassMap];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative py-10 md:py-14"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
        <div className={`relative z-10 space-y-5 ${isReversed ? "lg:order-2" : ""}`}>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isAftercare ? "bg-slate-100 text-slate-500" : `${palette.bgSoft} ${palette.text}`
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] ${
                isAftercare ? "text-slate-400" : palette.text
              }`}
            >
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                  isAftercare ? "bg-slate-200 text-slate-600" : `${palette.bg} text-white`
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              of {String(totalSteps).padStart(2, "0")}
              {isAftercare && (
                <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-600">
                  Aftercare
                </span>
              )}
            </span>
          </div>
          <h3 className="font-display text-2xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
            {step.title}
          </h3>
          <p className="max-w-xl text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
            {step.body}
          </p>
          {step.href && (
            <a
              href={step.href}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-[0_3px_0_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:text-[var(--color-accent-strong)] active:translate-y-[2px] active:shadow-none"
            >
              {step.action}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className={`relative z-10 ${isReversed ? "lg:order-1" : ""}`}>
          {step.visual ? (
            <FlowVisual image={step.visual} label={step.visual.label} />
          ) : (
            <ExternalFlowNote step={step} palette={palette} />
          )}
        </div>
      </div>
    </motion.section>
  );
};

const FlowShowcase = ({
  activeTab,
  selectTab,
}: {
  activeTab: (typeof tabs)[number];
  selectTab: (id: string) => void;
}) => {
  const palette =
    accentClassMap[activeTab.accent as keyof typeof accentClassMap as keyof typeof accentClassMap];

  return (
    <section
      className={`relative overflow-hidden ${palette.wash}`}
      aria-labelledby="demo-flow-section-heading"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id}
          id={`demo-flow-panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`demo-flow-tab-${activeTab.id}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 pt-16 md:px-6 md:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className={`type-kicker ${palette.text}`}>{activeTab.eyebrow}</span>
              <h2
                id="demo-flow-section-heading"
                className="mt-3 font-display text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl"
              >
                {activeTab.title}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
                {activeTab.description}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {activeTab.steps.map((step: (typeof tabs)[number]["steps"][number], index: number) => (
              <FlowStep
                key={`${activeTab.id}-${step.title}`}
                step={step}
                index={index}
                totalSteps={activeTab.steps.length}
                activeTab={activeTab}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 pb-20 pt-8 md:px-6 md:pb-24">
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={activeTab.primaryCta.href}
                className={`btn-push inline-flex w-full items-center justify-center rounded-xl ${palette.bg} ${palette.hover} px-6 py-3.5 text-sm font-black text-white ${palette.shadow} transition active:translate-y-[4px] active:shadow-none sm:w-auto`}
              >
                {activeTab.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => selectTab(activeTab.secondaryCta.tab)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900 sm:w-auto"
              >
                {activeTab.secondaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4 opacity-60" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const BoundarySection = () => (
  <section className="bg-white py-16 md:py-24">
    <div className="container mx-auto px-4 md:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <span className="type-kicker token-text-accent">Demo Boundary</span>
        <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          本来フローのうち公開版で止めている処理
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 md:text-base">
          本番想定では外部サービスへの招待、決済、権限付与まで進みます。公開版ではそこを実行せず、画面上の責務と参考実装の境界を見られる状態にしています。
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:mt-12 md:grid-cols-2">
        {boundaryItems.map((item) => (
          <div
            key={item.title}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-card"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl token-bg-cta-soft token-text-cta">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-black leading-snug text-slate-800 md:text-base">
                {item.title}
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 md:text-sm">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCta = () => (
  <section className="bg-gradient-to-b from-white to-[rgb(var(--color-accent-rgb)/0.08)] py-16 md:py-24">
    <div className="container mx-auto px-4 md:px-6">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgb(var(--color-accent-rgb)/0.12)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[rgb(var(--color-cta-rgb)/0.1)] blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="type-kicker token-text-accent inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Next Step
            </span>
            <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              本来フローを画面からたどる
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
              本番では外部サービスを含む導線ですが、公開版では内部画面の責務と外部処理の境界を切り分けて確認できます。
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:flex-col md:items-end">
            <a
              href="/membership"
              className="btn-push inline-flex w-full items-center justify-center rounded-xl token-bg-accent px-6 py-3.5 text-sm font-black text-white shadow-[0_4px_0_var(--color-action-shadow)] transition hover:bg-[var(--color-action-hover)] active:translate-y-[4px] active:shadow-none md:w-64"
            >
              Membershipフローへ
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-600 transition hover:-translate-y-0.5 hover:text-slate-900 md:w-64"
            >
              一般流入LPへ
              <ExternalLink className="ml-2 h-4 w-4 opacity-60" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const DemoFlow = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = getActiveTab(searchParams);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const selectTab = (tabId: string) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setHasInteracted(true);
  };

  useEffect(() => {
    if (!hasInteracted || !sectionRef.current) return;
    sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTabId, hasInteracted]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rightSlot = (
    <a
      href="/membership"
      className="hidden rounded-xl token-bg-accent px-5 py-2.5 text-sm font-black text-white shadow-[0_4px_0_var(--color-action-shadow)] transition hover:bg-[var(--color-action-hover)] active:translate-y-[4px] active:shadow-none md:inline-flex"
    >
      支援フローへ
    </a>
  );

  return (
    <div className="min-h-screen token-bg-main token-text-primary font-sans selection:bg-[var(--color-accent)] selection:text-white">
      <Seo
        title="本来の導線"
        description="Clover Support Demoの一般流入LP導線とMembership導線について、本番想定の本来フローと公開デモで止めている外部処理を案内するページです。"
        path="/demo-flow"
        type="website"
      />
      <style>{`
        .btn-push { transition: transform 0.08s cubic-bezier(0.3, 0, 0.5, 1), box-shadow 0.08s cubic-bezier(0.3, 0, 0.5, 1); }
        .btn-push:active { transform: translateY(4px); box-shadow: 0 0 0 transparent !important; }
      `}</style>
      <Header onScrollTop={scrollToTop} rightSlot={rightSlot} />

      <main className="pt-20 md:pt-24">
        <div ref={sectionRef} aria-hidden="true" />
        <StickyTabs activeTabId={activeTabId} selectTab={selectTab} />
        <FlowShowcase activeTab={activeTab} selectTab={selectTab} />

        <BoundarySection />

        <FinalCta />

        <SampleSiteNotice />
      </main>
      <Footer />
    </div>
  );
};

export default DemoFlow;
