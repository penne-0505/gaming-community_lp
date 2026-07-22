const Divider = ({ className = "" }: { className?: string }) => (
  <div className={`w-full border-t ${className}`.trim()} />
);

export default Divider;
