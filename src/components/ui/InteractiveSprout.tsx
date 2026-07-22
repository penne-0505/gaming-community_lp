import { motion } from "framer-motion";

const InteractiveSprout = () => (
  <motion.span
    className="text-xl md:text-2xl ml-1 inline-block cursor-pointer select-none"
    whileHover={{
      rotate: [0, 15, -15, 10, -10, 0],
      transition: { duration: 0.5 },
    }}
    whileTap={{ scale: 0.7 }}
    transition={{ type: "spring", stiffness: 400, damping: 12 }}
  >
    🌱
  </motion.span>
);

export default InteractiveSprout;
