import { redirect } from "next/navigation";

/**
 * `/` は存在しないルートだった（`src/app/page.tsx` が無く 404 になっていた）。
 * ドキュメントは「`/today` へリダイレクト」と書いていたので、実装を合わせる。
 */
export default function RootPage() {
  redirect("/today");
}
