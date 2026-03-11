type MockTodoCardProps = {
  title: string;
  tag?: string;
  tone?: "today" | "next" | "overdue" | "buffs";
};

const toneClasses: Record<NonNullable<MockTodoCardProps["tone"]>, string> = {
  today:
    "border-emerald-400/40 bg-emerald-500/10 hover:border-emerald-400/70 hover:bg-emerald-500/15",
  next:
    "border-sky-400/40 bg-sky-500/10 hover:border-sky-400/70 hover:bg-sky-500/15",
  overdue:
    "border-rose-400/40 bg-rose-500/10 hover:border-rose-400/70 hover:bg-rose-500/15",
  buffs:
    "border-violet-400/40 bg-violet-500/10 hover:border-violet-400/70 hover:bg-violet-500/15",
};

export function MockTodoCard({ title, tag, tone = "today" }: MockTodoCardProps) {
  return (
    <div
      className={[
        "group rounded-2xl border px-4 py-3 text-sm text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition-colors duration-200",
        "backdrop-blur-md bg-slate-900/40 border-slate-700/60",
        toneClasses[tone],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.8rem] uppercase tracking-[0.16em] text-slate-400">
            mock task
          </p>
          <p className="text-[0.95rem] font-medium leading-snug">{title}</p>
        </div>
        {tag ? (
          <span className="mt-1 rounded-full bg-slate-950/60 px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]">
            {tag}
          </span>
        ) : null}
      </div>
    </div>
  );
}

