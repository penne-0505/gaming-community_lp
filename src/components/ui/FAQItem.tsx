import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const labelId = useId();
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <motion.button
        whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={contentId}
        type="button"
      >
        <span id={labelId}>{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-slate-400" />
        </motion.div>
      </motion.button>
      <motion.div
        id={contentId}
        role="region"
        aria-labelledby={labelId}
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="border-t border-slate-50 bg-slate-50/50 overflow-hidden"
      >
        <div className="p-4 text-sm font-semibold text-slate-500 leading-relaxed">{a}</div>
      </motion.div>
    </div>
  );
};

export default FAQItem;
