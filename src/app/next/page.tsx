import { MockTodoCard } from "../components/MockTodoCard";

export default function NextPage() {
  return (
    <div className="min-h-full space-y-6 pt-10">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-50">
          Next / これからやること
        </h1>
        <p className="text-xs text-slate-400">
          今日ではないけれど、近いうちに回収したいタスクたち。ここから Today に呼び込んでいく。
        </p>
      </div>

      <div className="grid gap-3">
        <MockTodoCard
          title="週末に読みたい記事をまとめておく"
          tag="soon"
          tone="next"
        />
        <MockTodoCard
          title="今月中に試したい習慣を3つ書き出す"
          tag="habit"
          tone="next"
        />
        <MockTodoCard
          title="未来の自分へのメモ：やりたいけれど、まだタイミングじゃないことを1つ書く"
          tag="someday"
          tone="next"
        />
      </div>
    </div>
  );
}

