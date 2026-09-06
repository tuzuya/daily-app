import TaskListScreen from "../components/TaskListScreen";

export default function OverduePage() {
  return (
    <TaskListScreen
      screen="overdue"
      eyebrow="OVERDUE"
      eyebrowTone="danger"
      title="まだ終わっていないこと"
      hint="えらんで Today に戻す"
      meta="elapsed"
    />
  );
}
