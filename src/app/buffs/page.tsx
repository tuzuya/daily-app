import { MockTodoCard } from "../components/MockTodoCard";

export default function BuffsPage() {
  return (
    <div className="min-h-full space-y-6 pt-10">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-violet-100">
          Buffs / 今日をちょっと良くするタスク
        </h1>
        <p className="text-xs text-violet-200/80">
          AI が用意した「QOL が少し上がる行動」の候補をここに置く。気になったものを Today に召喚して使っていく。
        </p>
      </div>

      <div className="grid gap-3">
        <MockTodoCard
          title="30秒だけ姿勢をリセットする"
          tag="body"
          tone="buffs"
        />
        <MockTodoCard
          title="今の気分を一言だけメモする"
          tag="mood"
          tone="buffs"
        />
        <MockTodoCard
          title="デスクの上から 1 アイテムだけ片づける"
          tag="environment"
          tone="buffs"
        />
      </div>
    </div>
  );
}