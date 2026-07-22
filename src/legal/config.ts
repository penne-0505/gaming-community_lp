import termsOfService from "./content/terms-of-service.md?raw";
import privacyPolicy from "./content/privacy-policy.md?raw";
import refundPolicy from "./content/refund-policy.md?raw";
import specifiedCommercialTransaction from "./content/specified-commercial-transaction.md?raw";

export const legalDocs = {
  terms: {
    key: "terms",
    title: "デモ利用条件",
    description: "ポートフォリオ用デモ画面の閲覧条件を記載しています。",
    path: "/legal/terms",
    content: termsOfService,
  },
  privacy: {
    key: "privacy",
    title: "デモプライバシーノート",
    description: "デモ画面で扱う情報と外部連携の境界を記載しています。",
    path: "/legal/privacy",
    content: privacyPolicy,
  },
  refund: {
    key: "refund",
    title: "デモ返金ノート",
    description: "実取引がないため返金対象が存在しないことを記載しています。",
    path: "/legal/refund",
    content: refundPolicy,
  },
  specified: {
    key: "specified",
    title: "デモ表示に関する注記",
    description: "実販売ではないため特定商取引法上の販売表示ではないことを記載しています。",
    path: "/legal/specified",
    content: specifiedCommercialTransaction,
  },
} as const;

export type LegalDocKey = keyof typeof legalDocs;

export const legalDocList = [
  { key: legalDocs.terms.key, title: legalDocs.terms.title },
  { key: legalDocs.privacy.key, title: legalDocs.privacy.title },
  { key: legalDocs.refund.key, title: legalDocs.refund.title },
  { key: legalDocs.specified.key, title: legalDocs.specified.title },
];
