export function hslToString(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpHSL(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t)
  ];
}

export function interpolateColor(corners, row, col, totalRows, totalCols) {
  const tx = col / (totalCols - 1);
  const ty = row / (totalRows - 1);

  const top = lerpHSL(corners.topLeft, corners.topRight, tx);
  const bottom = lerpHSL(corners.bottomLeft, corners.bottomRight, tx);

  return lerpHSL(top, bottom, ty);
}

export function generateGradientGrid(rows, cols, corners) {
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const hsl = interpolateColor(corners, r, c, rows, cols);
      row.push(hsl);
    }
    grid.push(row);
  }

  return grid;
}

export function randomBetween(min, max){
  return Math.random() * (max - min) + min;
}

export function generatePalette(theme="random") {

  const baseHue = Math.floor(Math.random()*360);

  if(theme==="sunset"){
    return {
      topLeft:[20,90,65],
      topRight:[40,85,65],
      bottomLeft:[330,80,55],
      bottomRight:[350,80,55]
    };
  }

  if(theme==="ocean"){
    return {
      topLeft:[180,70,65],
      topRight:[200,70,65],
      bottomLeft:[210,80,50],
      bottomRight:[220,80,45]
    };
  }

  if(theme==="forest"){
    return {
      topLeft:[110,50,65],
      topRight:[130,50,60],
      bottomLeft:[120,60,45],
      bottomRight:[140,60,40]
    };
  }

  if(theme==="lavender"){
    return {
      topLeft:[260,60,75],
      topRight:[280,60,70],
      bottomLeft:[270,50,60],
      bottomRight:[290,50,55]
    };
  }

  // procedural palette
  return {
    topLeft:[
      baseHue,
      randomBetween(60,90),
      randomBetween(60,70)
    ],
    topRight:[
      baseHue + randomBetween(20,60),
      randomBetween(60,90),
      randomBetween(60,70)
    ],
    bottomLeft:[
      baseHue + randomBetween(80,140),
      randomBetween(60,90),
      randomBetween(45,55)
    ],
    bottomRight:[
      baseHue + randomBetween(140,200),
      randomBetween(60,90),
      randomBetween(40,50)
    ]
  };
}