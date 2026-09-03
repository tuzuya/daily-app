import HexagonStatus from "../components/HexagonStatus";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8 py-4">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          My Status
        </h1>
        <p className="text-xs text-slate-500">
          達成したタスクのポイントがステータスに反映されます
        </p>
      </div>

      <HexagonStatus />
    </div>
  );
}