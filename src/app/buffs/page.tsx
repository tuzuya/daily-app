import TaskListScreen from "../components/TaskListScreen";

export default function BuffsPage() {
  return (
    <TaskListScreen
      screen="buffs"
      eyebrow="BUFFS"
      eyebrowTone="gold"
      title="今日をちょっと良くする"
      hint="えらんで Today に追加する"
      meta="estimate"
    />
  );
}
