import { useEffect, useState } from "preact/hooks";
import IconBallpen from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/ballpen.tsx";
import IconEraser from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/eraser.tsx";
import IconClearAll from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/clear-all.tsx";
import {
  setupBackend,
  WASM,
  Sequential,
  tensor,
  Rank,
  Tensor,
} from "https://deno.land/x/netsaur@0.2.6/web.ts";

export default function Canvas() {
  const [draw, setDraw] = useState(false);
  const [mode, setMode] = useState("draw");
  const [size, setSize] = useState(2);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [predictions, setPredictions] = useState(Array(10).fill(0));
  const [predicting, setPredicting] = useState(false);
  const [strength, setStrength] = useState(0.1);
  const [pixels, setPixels] = useState<Float32Array>(
    new Float32Array(784).map(() => 1)
  );
  const [network, setNetwork] = useState<Sequential | undefined>(undefined);

  function argmax(mat: Tensor<Rank>) {
    let max = -Infinity;
    let index = -1;
    for (let i = 0; i < mat.data.length; i++) {
      if (mat.data[i] > max) {
        max = mat.data[i];
        index = i;
      }
    }
    return index;
  }

  function normalize(mat: Tensor<Rank>) {
    const mean = mat.data.reduce((a, k) => a + (1 - k), 0) / 784;
    const sd = Math.sqrt(
      mat.data.reduce((a, k) => a + (1 - k) * (1 - k), 0) / 784 - mean * mean
    );
    return new Tensor(
      mat.data.map((k) => (1 - k - mean) / sd),
      mat.shape
    );
  }

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    for (let x = 0; x < 28; x++) {
      for (let y = 0; y < 28; y++) {
        const color = pixels[x + y * 28] * 255;
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(x * 20, y * 20, 20, 20);
      }
    }

    if (!network) {
      setupBackend(WASM)
        .then(() => fetch("mnist.test.bin"))
        .then((res) => res.arrayBuffer())
        .then((buffer) => setNetwork(Sequential.load(new Uint8Array(buffer))));
    }
  }, [pixels]);

  return (
    <div class="lg:flex flex-row gap-20 w-full items-center justify-center">
      <div class="flex flex-col gap-2 items-center">
        <div class="bg-gray-800 text-white rounded-full py-2 px-4 mb-4">
          <p class="font-bold">Prediction: {prediction}</p>
        </div>
        <canvas
          id="canvas"
          class="border border-2 w-min"
          width="560"
          height="560"
          onMouseDown={(e) => {
            setDraw(true);
          }}
          onMouseUp={() => {
            setDraw(false);
          }}
          onMouseMove={(e) => {
            if (!draw) return;

            const canvas = document.getElementById(
              "canvas"
            ) as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / 20);
            const y = Math.floor((e.clientY - rect.top) / 20);

            const newPixels = new Float32Array(pixels);

            for (let dx = -size; dx < size; dx++) {
              for (let dy = -size; dy < size; dy++) {
                if (mode === "draw") {
                  newPixels[x + dx + (y + dy) * 28] -= Math.pow(
                    strength,
                    Math.abs(dx) + Math.abs(dy)
                  );
                } else if (mode === "erase") {
                  newPixels[x + dx + (y + dy) * 28] += Math.pow(
                    strength,
                    Math.abs(dx) + Math.abs(dy)
                  );
                }
              }
            }

            setPixels(newPixels);
            if (network && !predicting) {
              setPredicting(true);
              network
                .predict(normalize(tensor(pixels, [1, 28, 28])))
                .then((output) => {
                  setPredictions(Array.from(output.data));
                  setPrediction(argmax(output));
                })
                .then(() => setPredicting(false));
            }
          }}
        />
        <div class="flex gap-2">
          <button
            class="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex gap-2"
            onClick={() => {
              setMode("draw");
            }}
          >
            <IconBallpen class="w-6 h-6" /> Draw
          </button>
          <button
            class="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex gap-2"
            onClick={() => {
              setMode("erase");
            }}
          >
            <IconEraser class="w-6 h-6" /> Erase
          </button>
          <button
            class="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 flex gap-2"
            onClick={() => {
              setPixels(pixels.map(_ => 1));
            }}
          >
            <IconClearAll class="w-6 h-6" /> Clear
          </button>
        </div>
      </div>
      <div class="flex flex-col">
        <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div class="overflow-hidden">
              <table class="min-w-full text-left text-sm font-light">
                <thead class="border-gray-700 bg-gray-800 text-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3">
                      Value
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Probability
                    </th>
                  </tr>
                </thead>
                <tbody class="border">
                  {predictions.map((value, i) => {
                    return (
                      <tr class={prediction == i ? "font-bold" : ""}>
                        <td class="border whitespace-nowrap px-6 py-3">{i}</td>
                        <td class="border whitespace-nowrap px-6 py-3">
                          {value.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
