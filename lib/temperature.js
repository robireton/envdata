export default {
  // fahrenheit: k16 => Math.round(k16 * 0.5625 - 2298.35) / 5,
  fahrenheit: k16 => k16 * 0.1125 - 459.67,
  celsius: k16 => k16 * 0.0625 - 273.15
}
