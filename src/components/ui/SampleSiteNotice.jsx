const SampleSiteNotice = () => (
  <section aria-label="Sample site notice" className="bg-white">
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 pb-8">
      <div className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/70 text-amber-950 rounded-2xl px-6 py-5 text-sm md:text-base leading-relaxed shadow-md flex gap-3 items-start">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-900 text-sm font-bold shrink-0"
          aria-hidden="true"
        >
          !
        </span>
        <p className="font-bold">
          このサイトはサンプルページです。実際の取引やサービス提供は行っていません。
        </p>
      </div>
    </div>
  </section>
);

export default SampleSiteNotice;
