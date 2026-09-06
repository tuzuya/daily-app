import StatusBars from "../components/StatusBars";

/**
 * アバターのステータス画面（docs/ai-product-brief.md §6.5）。
 * 設定のおまけではなく、育成の成果を確認する場所なので
 * アバターに一番大きな面積を割く（同 §1.1）。
 */
export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[390px] px-[18px] pb-6 pt-[52px]">
      <header className="mb-6">
        <p className="font-label text-[10px] text-gold">STATUS</p>
        <p className="text-[11px] text-ink-muted">アバターの育ち具合</p>
      </header>

      {/* アバターの舞台。中身はベータ後（§4.7）なので領域だけ空ける */}
      <div className="mb-6 grid h-[150px] place-items-center border-[3px] border-ink-outline bg-panel">
        <p className="font-label text-[8px] text-ink-faint">COMING SOON</p>
      </div>

      <section className="mb-6">
        <h2 className="font-label mb-3 text-[10px] text-ink-muted">STATUS</h2>
        <StatusBars />
      </section>

      {/* TODO: LV / EXP は総XPからの式で出す（§7.1 c）。
          コインは獲得と消費のルールが未決なのでまだ出さない。 */}
    </div>
  );
}
