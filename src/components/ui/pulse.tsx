const Pulse = ({ active }: { active: boolean }) =>
  active ? (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
  ) : (
    <span className="relative flex h-2 w-2">
      <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300"></span>
    </span>
  );

export { Pulse };
