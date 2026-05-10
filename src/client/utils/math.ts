// 浮動小数点誤差を避けるための小数演算ヘルパー。
// JavaScript の number は IEEE 754 倍精度なので 0.0991 のような循環小数を
// 厳密に表現できず、`300000 * 0.0991 / 2` が 14864.999... になる。
// rate を「分子 / 10^N」に分解して整数演算してから最後に除算することで、
// Java の BigDecimal を使うのと同等の精度を依存ゼロで実現する。

function decomposeRate(rate: number): { numerator: number; scale: number } {
  const s = rate.toString();
  const dot = s.indexOf('.');
  const decimals = dot < 0 ? 0 : s.length - dot - 1;
  const scale = 10 ** decimals;
  return { numerator: Math.round(rate * scale), scale };
}

// value × rate を浮動小数点誤差なしで計算する。
// 例: rateMultiply(300000, 0.0991) = 29730（厳密）
export function rateMultiply(value: number, rate: number): number {
  const { numerator, scale } = decomposeRate(rate);
  return (value * numerator) / scale;
}

// Math.floor((value × rate) / divisor) を浮動小数点誤差なしで計算する。
// 例: rateFloor(300000, 0.0991, 2) = 14865（厳密）
export function rateFloor(value: number, rate: number, divisor: number = 1): number {
  const { numerator, scale } = decomposeRate(rate);
  return Math.floor((value * numerator) / (scale * divisor));
}
