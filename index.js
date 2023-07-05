import { createReadStream } from "node:fs";
import { createGzip, createBrotliCompress, createDeflate } from "node:zlib";
import EventEmitter from "node:events";
import StartMonitor from "./start-monitor.js";
import EndMonitor from "./end-monitor.js";


function createMonitor(name) {
  const emitter = new EventEmitter();
  return [new StartMonitor(emitter), new EndMonitor(emitter, name)];
}

async function main() {
  const filename = process.argv[2];
  if (!filename) {
    throw new Error("A file must be provided");
  }

  const [startMonitor1, endMonitor1] = createMonitor("Gzip");
  const [startMonitor2, endMonitor2] = createMonitor("Brotli");
  const [startMonitor3, endMonitor3] = createMonitor("Deflate");

  const fileStream = createReadStream(filename);

  fileStream
    .pipe(startMonitor1)
    .pipe(createGzip())
    .pipe(endMonitor1)
    .on("error", () => {
      fileStream.destroy();
      startMonitor1.destroy();
      endMonitor1.destroy();
    })
    .pipe(process.stdout);

  fileStream
    .pipe(startMonitor2)
    .pipe(createBrotliCompress())
    .pipe(endMonitor2)
    .on("error", () => {
      fileStream.destroy();
      startMonitor2.destroy();
      endMonitor2.destroy();
    })
    .pipe(process.stdout, { end: false });

  fileStream
    .pipe(startMonitor3)
    .pipe(createDeflate())
    .pipe(endMonitor3)
    .on("error", () => {
      fileStream.destroy();
      startMonitor3.destroy();
      endMonitor3.destroy();
    })
    .pipe(process.stdout, { end: false });

  process.stdout.on("finish", () => {
    process.stdout.end();
  });
}

main().catch((err) => console.log(err));
