"use client";

/**
 * Today のドロップ枠。カードを下に引っ張って達成する受け口。
 * Figma の `slot/*` に対応（docs/pixel-style-guide.md §9.1）。
 *
 * ベベルを反転させて「へこんでいる」ことを示す（上が暗く、下が明るい）。
 */

export type DropSlotProps = {
  /** カルーセルの引っ張り具合 0..1 */
  progress: number;
};

export default function DropSlot({ progress }: DropSlotProps) {
  const armed = progress >= 1;
  const near = progress > 0.15;

  return (
    <div className="relative flex flex-col items-center">
      {/* 下向きのシェブロン。引っ張れと示す */}
      <svg
        width="36"
        height="18"
        viewBox="0 0 12 6"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="mb-3"
        style={{ opacity: near ? 0 : 1 }}
      >
        <path
          d="M0 0h3v1H0zM9 0h3v1H9zM1 1h3v1H1zM8 1h3v1H8zM2 2h3v1H2zM7 2h3v1H7zM3 3h6v1H3zM4 4h4v1H4zM5 5h2v1H5z"
          fill="var(--gold)"
        />
      </svg>

      {/* 発光。ぼかしではなく同心の硬い帯2枚で表す */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute bg-gold"
          style={{
            left: -9,
            top: -9,
            right: -9,
            bottom: -9,
            opacity: armed ? 0.26 : progress * 0.18,
          }}
        />
        <span
          aria-hidden="true"
          className="absolute bg-gold"
          style={{
            left: -3,
            top: -3,
            right: -3,
            bottom: -3,
            opacity: armed ? 0.4 : progress * 0.26,
          }}
        />

        <div
          className="relative grid h-[88px] w-[240px] place-items-center border-[3px] border-ink-outline"
          style={{
            // 引き切ると床が明るく光る。補間せず段階で切り替える
            background: armed ? "var(--gold-light)" : "var(--gold-dark)",
          }}
        >
          {/* へこみ: 上が暗く、下が明るい */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-[3px] w-full"
            style={{ background: "rgba(0,0,0,0.55)" }}
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[3px] w-full bg-gold-light"
          />

          <span
            className="font-num text-[16px]"
            style={{ color: armed ? "var(--ink-inverse)" : "var(--gold-light)" }}
          >
            CLEAR!
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-gold">
        カードをここにドラッグして達成
      </p>
    </div>
  );
}
