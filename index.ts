// Import stylesheets
import './style.css';

// Write TypeScript code!
import north from './north';
import SimplexNoise from 'simplex-noise';
import imageSource from './image-source';

const simplex = new SimplexNoise();
const ensureIsProductOf = (n: number, p: number) => n - (n % p);
const hsla = (h: number, s: number, l: number, a: number) =>
  `hsl(${h}, ${s}%, ${l}%, ${a})`;
const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
const lerp = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;
const fiftyFifty = <A, B>(a: A, b: B) => (Boolean(Math.random() > 0.5) ? a : b);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const log = (...toLog) => {
  if (Math.random() > 0.999) {
    console.log(...toLog);
  }
};

const createMouseTracker = (canvas: HTMLCanvasElement) => {
  let x = 0;
  let y = 0;
  let intersecting = false;

  document.onmousemove = function handleMouseMove(event) {
    x = event.pageX;
    y = event.pageY;
  };

  canvas.onmouseenter = () => {
    intersecting = true;
  };

  canvas.onmouseleave = () => {
    intersecting = false;
  };

  return {
    get() {
      var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y
      const mouseX = (x - rect.left) * scaleX;
      const mouseY = (y - rect.top) * scaleY;

      return { mouseX, mouseY, x, y, intersecting };
    },
  };
};

const width = window.innerWidth;
const height = window.innerHeight;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

const mouseTracker = createMouseTracker(canvas);

const row_size = Math.sqrt(north.length);
const col_size = Math.sqrt(north.length);
const square_size = 12;

const createColourPicker = (x: number, y: number) => {
  const hue_min = 190;
  const hue_max = 280;
  const alpha_min = 0;
  const alpha_max = 1000;
  const hue_increment = 5;
  const base_hue = hue_max - x - y;

  let hue = ensureIsProductOf(base_hue, hue_increment);
  let alpha = Number(Math.abs(simplex.noise2D(x, y)).toFixed(2)) * 1000;
  let hueInReverse = false;
  let alphaInReverse = false;

  return {
    setHue() {
      if (hue <= hue_min) {
        hueInReverse = false;
      }

      if (hue >= hue_max) {
        hueInReverse = true;
      }

      hue += hueInReverse ? -5 : 5;
    },
    setAlpha() {
      if (alpha <= alpha_min) {
        alphaInReverse = false;
      }

      if (alpha >= alpha_max) {
        alphaInReverse = true;
      }

      alpha += alphaInReverse ? -10 : 10;
    },
    getFill() {
      return hsla(hue, 100, 80, lerp(0.7, 1, alpha / 1000));
    },
  };
};

const initialiseColourPickers = () => {
  setInterval(() => {
    for (const { colourPicker } of instructions) {
      colourPicker.setHue();
      colourPicker.setAlpha();
    }
  }, 50);
};

const instructions: {
  x: number;
  y: number;
  colourPicker: ReturnType<typeof createColourPicker>;
}[] = [];
for (const x of range(row_size)) {
  for (const y of range(col_size)) {
    const col = north.split('\n')[y];
    const char = col[x];

    if (char === '-') {
      continue;
    }

    instructions.push({
      x,
      y,
      colourPicker: createColourPicker(x, y),
    });
  }
}

function render() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  for (const { x, y, colourPicker } of instructions) {
    const xPos = x * square_size;
    const yPos = y * square_size;

    ctx.fillStyle = colourPicker.getFill();
    ctx.fillRect(xPos, yPos, square_size, square_size);
  }
}

const r = () => {
  render();

  window.requestAnimationFrame(r);
};
window.requestAnimationFrame(r);
initialiseColourPickers();
