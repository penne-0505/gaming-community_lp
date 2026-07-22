import { motion } from "framer-motion";

const CommunityGoalWidget = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }}
    className="bg-white border border-slate-200 rounded-full p-1.5 pr-6 mb-6 flex items-center gap-4 soft-shadow cursor-default group"
  >
    <div className="flex items-center pl-1 relative">
      {[
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sudo",
      ].map((src, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative z-0 shadow-sm"
          style={{ marginLeft: i === 0 ? 0 : -12 }}
        >
          <img src={src} className="w-full h-full object-cover" alt="" />
        </div>
      ))}
      <div
        className="w-8 h-8 rounded-full border-2 border-white token-bg-accent flex items-center justify-center text-white text-[10px] font-semibold relative z-10 shadow-sm"
        style={{ marginLeft: -12 }}
      >
        +42
      </div>
    </div>

    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
          デモ支援ゴール
        </span>
        <span className="text-xs font-semibold token-text-accent">78%</span>
      </div>
      <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "78%" }}
          viewport={{ once: true }}
          className="h-full token-bg-accent rounded-full"
        />
      </div>
    </div>
  </motion.div>
);

export default CommunityGoalWidget;
