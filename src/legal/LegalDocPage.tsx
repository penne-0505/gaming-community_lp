import React, { useEffect, useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { legalDocs, legalDocList, type LegalDocKey } from "./config";
import Footer from "../components/layout/Footer";
import Seo from "../components/Seo";

const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\- ]/gu, "")
    .replace(/\s+/g, "-");

const stripFrontMatter = (markdown: string) => {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return markdown;
  return markdown.slice(end + 4).replace(/^\s+/, "");
};

const LegalDocPage = ({ docKey }: { docKey: string }) => {
  const doc = (legalDocs as Record<string, (typeof legalDocs)[LegalDocKey] | undefined>)[docKey];
  const navigate = useNavigate();
  const activeIndex = Math.max(
    0,
    legalDocList.findIndex((item) => item.key === doc?.key)
  );
  const segmentCount = legalDocList.length || 1;

  const indicatorStyle = useMemo(
    () => ({
      width: `calc(${100 / segmentCount}% - 0.5rem)`,
      left: `calc(${(100 / segmentCount) * activeIndex}% + 0.25rem)`,
    }),
    [activeIndex, segmentCount]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [doc?.key]);

  const counts = new Map<string, number>();
  const sanitizedContent = useMemo(() => stripFrontMatter(doc?.content || ""), [doc?.content]);

  const renderers: Components = {
    h2({ children, ...props }) {
      const title = React.Children.toArray(children)[0]?.toString?.() ?? "";
      const base = slugify(title);
      const current = counts.get(base) ?? 0;
      const id = current === 0 ? base : `${base}-${current}`;
      counts.set(base, current + 1);
      return (
        <h2
          id={id}
          {...props}
          className="scroll-mt-24 text-2xl font-bold text-slate-800 mt-10 mb-3"
        >
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      const title = React.Children.toArray(children)[0]?.toString?.() ?? "";
      const base = slugify(title);
      const current = counts.get(base) ?? 0;
      const id = current === 0 ? base : `${base}-${current}`;
      counts.set(base, current + 1);
      return (
        <h3 id={id} {...props} className="scroll-mt-24 text-xl font-bold text-slate-800 mt-6 mb-2">
          {children}
        </h3>
      );
    },
    a({ ...props }) {
      return (
        <a
          {...props}
          className="token-text-cta font-bold underline underline-offset-2"
          target={props.href?.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
        />
      );
    },
    ul({ ...props }) {
      return <ul className="list-disc pl-5 space-y-1" {...props} />;
    },
    ol({ ...props }) {
      return <ol className="list-decimal pl-5 space-y-1" {...props} />;
    },
    p({ ...props }) {
      return <p className="leading-relaxed text-slate-700" {...props} />;
    },
    strong({ ...props }) {
      return <strong className="font-bold text-slate-800" {...props} />;
    },
  };

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  const handleTabClick = (key: string) => {
    if (key === doc?.key) return;
    navigate(`/legal/${key}`);
  };

  return (
    <div className="min-h-screen token-bg-main token-text-primary font-sans">
      <Seo
        title={doc?.title || "お知らせ"}
        description={doc?.description || "現在はご案内を行っていません。"}
        path={doc?.path || "/legal"}
        type="article"
        noIndex
      />
      <main className="container mx-auto px-4 md:px-6 py-14 max-w-5xl">
        <div className="flex items-center justify-start gap-3 mb-5">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[var(--color-accent)] no-print"
          >
            <ArrowLeft size={18} />
            ホームへ戻る
          </a>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl p-6 md:p-8">
          {legalDocList.length > 0 && doc ? (
            <>
              <div className="bg-slate-100 p-1.5 rounded-2xl flex relative mb-6">
                <div
                  className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
                  style={indicatorStyle}
                />
                {legalDocList.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleTabClick(item.key)}
                    className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-300 ${
                      doc.key === item.key
                        ? "text-[#1e293b]"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{doc.title}</h1>
                <p className="text-sm md:text-base text-slate-600">{doc.description}</p>
              </div>

              <article className="prose max-w-none prose-slate">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
                  {sanitizedContent}
                </ReactMarkdown>
              </article>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-base md:text-lg font-bold text-slate-600">
                現在はご案内を行っていません。
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer onScrollTop={scrollToTop} />
    </div>
  );
};

export default LegalDocPage;
