import termsOfService from "./content/terms-of-service.md?raw";
import privacyPolicy from "./content/privacy-policy.md?raw";
import refundPolicy from "./content/refund-policy.md?raw";
import specifiedCommercialTransaction from "./content/specified-commercial-transaction.md?raw";

export const legalDocs = {
  terms: {
    key: "terms",
    title: "利用規約",
    description: "サービスのご利用条件について記載しています。(デモ)",
    path: "/legal/terms",
    content: termsOfService,
  },
  privacy: {
    key: "privacy",
    title: "プライバシーポリシー",
    description: "個人情報の取扱いについて記載しています。(デモ)",
    path: "/legal/privacy",
    content: privacyPolicy,
  },
  refund: {
    key: "refund",
    title: "返金ポリシー",
    description: "返金に関するルールを記載しています。(デモ)",
    path: "/legal/refund",
    content: refundPolicy,
  },
  specified: {
    key: "specified",
    title: "特定商取引法に基づく表記",
    description: "特定商取引法に基づく表記を掲載しています。(デモ)",
    path: "/legal/specified",
    content: specifiedCommercialTransaction,
  },
};

export const legalDocList = [
  { key: legalDocs.terms.key, title: legalDocs.terms.title },
  { key: legalDocs.privacy.key, title: legalDocs.privacy.title },
  { key: legalDocs.refund.key, title: legalDocs.refund.title },
  { key: legalDocs.specified.key, title: legalDocs.specified.title },
];
