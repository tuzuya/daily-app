import { ScrollingText } from "../components/ScrollingText";
import { MockTodoCard } from "../components/MockTodoCard";

export default function TodayPage() {
  return (
    <div className="relative min-h-full">
      {/* 応援メッセージ（Today専用） */}
      <ScrollingText />

      <div className="relative z-10 space-y-6 pt-10">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-50">
            Today / 今日のタスク
          </h1>
          <p className="text-xs text-slate-400">
            今日フォーカスすることだけをここに置く。完了したら、この宇宙を少しずつ前に進めよう。
          </p>
        </div>

        <div className="grid gap-3">
          <MockTodoCard
            title="朝のエネルギーチェック：コーヒーを淹れて、今日の最初の1タスクを決める"
            tag="focus"
            tone="today"
          />
          <MockTodoCard
            title="今日のメインクエスト：Next から1つだけ前倒しで片づける"
            tag="main"
            tone="today"
          />
          <MockTodoCard
            title="自分をねぎらう5分：画面を閉じて、深呼吸だけする"
            tag="buff"
            tone="buffs"
          />
        </div>
      </div>
    </div>
  );
}