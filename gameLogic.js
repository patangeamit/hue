export function flattenGrid(grid) {
  return grid.flat();
}

export function indexFromRC(r, c, cols) {
  return r * cols + c;
}

export function getCornerIndexes(rows, cols) {
  return [
    0,
    cols - 1,
    (rows - 1) * cols,
    rows * cols - 1
  ];
}

export function shuffleTiles(target, rows, cols) {
  const arr = [...target];
  const corners = new Set(getCornerIndexes(rows, cols));

  const movable = arr
    .map((_, i) => i)
    .filter(i => !corners.has(i));

  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[movable[i]], arr[movable[j]]] =
      [arr[movable[j]], arr[movable[i]]];
  }

  return arr;
}

export function checkSolved(current, target) {
  for (let i = 0; i < target.length; i++) {
    if (current[i] !== target[i]) return false;
  }
  return true;
}

export function isCorner(index, rows, cols) {
  const corners = [
    0,
    cols - 1,
    (rows - 1) * cols,
    rows * cols - 1
  ];
  return corners.includes(index);
}