import TaskListScreen from "../components/TaskListScreen";

export default function NextPage() {
  return (
    <TaskListScreen
      screen="next"
      eyebrow="NEXT"
      eyebrowTone="gold"
      title="これからやること"
      hint="えらんで Today に送る"
      meta="estimate"
    />
  );
}
