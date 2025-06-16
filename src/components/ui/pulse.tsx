const Pulse = ({ active }: { active: boolean }) =>
  active ? (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
    </span>
  ) : (
    <span className="relative flex h-2 w-2">
      <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-300"></span>
    </span>
  );

export { Pulse };
