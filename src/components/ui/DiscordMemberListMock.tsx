import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Crown, Lock, Unlock } from "lucide-react";
import confetti from "canvas-confetti";
import type { DiscordUser } from "../../types/discord";

const DiscordMemberListMock = ({ user }: { user?: DiscordUser | null }) => {
  const [isHover, setIsHover] = useState(false);
  const [isUserHover, setIsUserHover] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const lastConfettiTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (isHover && lockRef.current && now - lastConfettiTime.current > 2000) {
      lastConfettiTime.current = now;
      const rect = lockRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 10,
        spread: 330,
        startVelocity: 5,
        origin: { x, y },
        colors: ["#ffcc00", "#e6b800", "#ffd700", "#ffffff"],
        zIndex: 10001,
        ticks: 50,
        gravity: 0,
        scalar: 0.7,
        shapes: ["circle"],
        disableForReducedMotion: true,
        decay: 0.94,
      });
    }
  }, [isHover]);

  const baseShadow = "3px 20px 25px -5px rgba(0, 0, 0, 0.3), 3px 10px 10px -5px rgba(0, 0, 0, 0.2)";
  const baseRotate = isDesktop ? 1.5 : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    if (query.addEventListener) {
      query.addEventListener("change", update);
    } else {
      query.addListener(update);
    }
    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", update);
      } else {
        query.removeListener(update);
      }
    };
  }, []);

  return (
    <motion.div
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      initial={{ rotate: baseRotate }}
      animate={{ rotate: baseRotate }}
      whileHover={{ rotate: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      style={{
        boxShadow: baseShadow,
        borderColor: isHover ? "rgba(100, 100, 100, 0.5)" : "#1e1f22",
        transition: "box-shadow 0.2s ease-out, border-color 0.2s ease-out",
      }}
      className="w-72 bg-[#313338] rounded-xl overflow-hidden border font-sans"
    >
      <div className="bg-[#2b2d31] p-4 border-b border-[#1e1f22] flex items-center justify-between transition-colors">
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center justify-center w-5 h-5" ref={lockRef}>
            <motion.div
              initial={false}
              animate={{
                opacity: isHover ? 0 : 1,
                scale: isHover ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Lock size={16} className="text-[#949ba4]" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                opacity: isHover ? 1 : 0,
                scale: isHover ? [0.5, 1.2, 1] : 0.5,
                rotate: isHover ? [0, -15, 0] : 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Unlock size={16} className="text-[#ffcc00]" />
            </motion.div>

            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 60,
                    y: (Math.random() - 1) * 40 - 5,
                  }}
                  transition={{
                    duration: Math.random() * 1.5 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeOut",
                  }}
                  className="absolute w-1 h-1 bg-[#ffcc00] rounded-full"
                  style={{ top: "40%", left: "50%" }}
                />
              ))}
            </div>
          </div>
          <div className="relative">
            <span className="text-[#f2f3f5] font-semibold text-sm block relative z-10">
              supporters-chat
            </span>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: isHover ? 1 : 0,
                opacity: isHover ? 1 : 0,
              }}
              style={{ originX: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-2.5 bg-[#ffcc00]/30"
            />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e1f22]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e1f22]"></div>
        </div>
      </div>

      <div className="p-4 bg-[#313338]">
        <div className="text-[#949ba4] text-xs font-semibold uppercase tracking-wide mb-3 px-1 hover:text-[#dbdee1] transition-colors cursor-default">
          Demo Supporters — 1
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, x: -10 }}
          whileInView={{ scale: 1, opacity: 1, x: 0 }}
          animate={{ x: isUserHover ? 2 : 0 }}
          onHoverStart={() => setIsUserHover(true)}
          onHoverEnd={() => setIsUserHover(false)}
          transition={{ delay: 0.3, duration: 0.4 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex items-center gap-4 p-2 rounded cursor-default group relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffcc00]/10 to-[#ffcc00]/20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHover ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0 }}
          />
          <div className="relative z-10">
            <img
              src={
                user?.avatar ||
                "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg"
              }
              className="w-10 h-10 rounded-full bg-slate-200"
              alt=""
            />
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#313338] rounded-full p-[4px]">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="relative z-10">
            <div className="token-text-accent font-semibold text-base flex items-center gap-1.5">
              {user?.name ?? "Guest"}
              <Crown
                size={14}
                className="fill-current text-[#ffcc00] stroke-[#ffcc00] stroke-[1px]"
              />
            </div>
            <div className="text-xs text-[#949ba4]">Demo profile</div>
          </div>
        </motion.div>

        <div className="mt-6 opacity-50">
          <div className="text-[#949ba4] text-xs font-semibold uppercase tracking-wide mb-3 px-1">
            Members — 3
          </div>
          {["Steve", "Alex", "Zombie"].map((name, i) => (
            <div key={i} className="flex items-center gap-4 p-2 rounded opacity-50 grayscale-[0.5]">
              <div className="w-10 h-10 rounded-full token-bg-cta flex items-center justify-center text-white text-sm font-semibold">
                {name[0]}
              </div>
              <div>
                <div className="text-[#dbdee1] text-base font-semibold">{name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DiscordMemberListMock;
