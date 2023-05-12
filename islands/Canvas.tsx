import { useEffect, useState } from "preact/hooks";

export default function Canvas() {
  const [draw, setDraw] = useState(false);
  const [mode, setMode] = useState("draw");
  const [size, setSize] = useState(2);
  const [strength, setStrength] = useState(0.5);
  const [pixels, setPixels] = useState<Float32Array>(new Float32Array(784).map(()=>1));

  useEffect(()=>{
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    for(let x = 0; x < 28; x++) {
      for(let y = 0; y < 28; y++) {
        const color = pixels[x + (y * 28)] * 255;
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`
        ctx.fillRect(x * 20, y * 20, 20, 20);
      }
    }
  }, [pixels])

  return (
    <div class="flex flex-col gap-2 w-full items-center">
      <div class="flex gap-2">
        <button class="px-4 py-2 bg-gray-100 hover:bg-gray-300 rounded" onClick={()=>{
          setMode("draw")
        }}>Pen</button>
        <button class="px-4 py-2 bg-gray-100 hover:bg-gray-300 rounded" onClick={()=>{
          setMode("erase")
        }}>Eraser</button>
      </div>
      <canvas id="canvas" class="border border-2 w-min" width="560" height="560" onMouseDown={(e)=>{
        setDraw(true)
      }} onMouseUp={()=>{
        setDraw(false)
      }} onMouseMove={(e)=>{
        if(!draw) return;

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / 20)
        const y = Math.floor((e.clientY - rect.top) / 20)

        const newPixels = new Float32Array(pixels);

        for(let dx = -size; dx < size; dx++) {
          for(let dy = -size; dy < size; dy++) {
            if(mode === "draw") {
              newPixels[x + dx + ((y+dy)*28)] -= Math.pow(strength, Math.abs(dx) + Math.abs(dy));
            } else if(mode === "erase") {
              newPixels[x + dx + ((y+dy)*28)] += Math.pow(strength, Math.abs(dx) + Math.abs(dy));
            }
          }
        }

        console.log(x, y)
        
        setPixels(newPixels)
      }}/>
    </div>
  );
}
