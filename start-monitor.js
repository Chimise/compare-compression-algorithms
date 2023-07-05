import { Transform } from "stream";

class StartMonitor extends Transform {
    constructor(emitter, options) {
      super(options);
      this.emitted = 0;
      this.emitter = emitter;
    }
  
    _transform(chunk, encoding, cb) {
      this.emitted += chunk.length;
      this.push(chunk);
      cb();
    }
  
    _flush(cb) {
      this.emitter.emit("total", this.emitted);
      cb();
    }
  }


export default StartMonitor;