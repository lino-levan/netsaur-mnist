import { Head } from "$fresh/runtime.ts";
import Canvas from "../islands/Canvas.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>MNIST Demo</title>
      </Head>
      <body class="bg-green-100">
        <div class="p-4 mx-auto max-w-screen">
          <div class="font-bold text-xl">Netsaur MNIST Demo</div>
          <Canvas />
        </div>
      </body>
    </>
  );
}
