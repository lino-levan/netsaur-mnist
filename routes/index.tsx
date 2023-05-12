import { Head } from "$fresh/runtime.ts";
import Canvas from "../islands/Canvas.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>MNIST DEmo</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <Canvas />
      </div>
    </>
  );
}
