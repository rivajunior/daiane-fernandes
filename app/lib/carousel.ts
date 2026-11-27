/**
 * The scroll positions a sideways row can rest at: one per card until the end of the row is reached,
 * after which the remaining cards share the last one.
 */
export function snapPoints(offsets: readonly number[], maxScroll: number): number[] {
  const points: number[] = []
  for (const offset of offsets) {
    const point = Math.min(offset, maxScroll)
    const previous = points.at(-1)
    if (previous === undefined || point - previous > 1) {
      points.push(point)
    }
  }
  return points
}

/** Index of the point closest to `position`; 0 when there are no points. */
export function nearestPoint(points: readonly number[], position: number): number {
  let nearest = 0
  for (const [index, point] of points.entries()) {
    if (Math.abs(point - position) < Math.abs(points[nearest]! - position)) {
      nearest = index
    }
  }
  return nearest
}
