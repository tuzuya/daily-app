import { MockTodoCard } from "../components/MockTodoCard";

export default function OverduePage() {
  return (
    <div className="min-h-full space-y-6 pt-10">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-rose-100">
          Overdue / まだ終わっていないこと
        </h1>
        <p className="text-xs text-rose-200/80">
          終わらなかったタスクを責めないで、もう一度チューニングする場所。ここから Today に優しく戻していく。
        </p>
      </div>

      <div className="grid gap-3">
        <MockTodoCard
          title="先週の「やりかけメモ」を読み直して、1つだけ今日に戻す"
          tag="retry"
          tone="overdue"
        />
        <MockTodoCard
          title="やらなくてよかったタスクを1つ決めて、リストから卒業させる"
          tag="let go"
          tone="overdue"
        />
      </div>
    </div>
  );
}