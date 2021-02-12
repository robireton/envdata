export default {
  dedup: rows => rows.filter((row, i, a) => (i > 0 && i < (a.length - 1)) ? (row[1] !== a[i - 1][1] || row[1] !== a[i + 1][1]) : true),

  average: (rows, minutes = 1) => {
    const ms = Math.floor(minutes * 60 * 1000)
    const buckets = new Map()
    for (const [stamp, value] of rows) {
      const key = Math.round(stamp / ms)
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(value)
    }
    return Array.from(buckets.entries()).map(([k, v]) => [k * ms, v.reduce((a, c) => a + c) / v.length])
  }
}
