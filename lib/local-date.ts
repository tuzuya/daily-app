/**
 * 日付は**必ずローカル日付**で扱う（docs/ai-dev-guide.md §8.2）。
 *
 * `toISOString().slice(0,10)` は UTC に変換してしまうため使わない。
 * 日本時間の朝9時より前は前日の日付になり、1日ぶんズレる。
 */

/** Date → "YYYY-MM-DD"（ローカル） */
export function toLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 今日のローカル日付 */
export function today(): string {
  return toLocalDate();
}

/** "YYYY-MM-DD" 同士の比較。a が b より前なら true */
export function isBefore(a: string, b: string): boolean {
  return a < b; // ゼロ埋め済みの ISO 形式なので辞書順で比較できる
}
