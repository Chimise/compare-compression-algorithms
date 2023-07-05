import { Transform } from "stream";

class EndMonitor extends Transform {
  constructor(emitter, name, options) {
    super(options);
    this.emitted = 0;
    this.previousEmitted = null;
    this.emitter = emitter;
    this.name = name;
    this.emitter.once("total", (total) => {
      this.previousEmitted = total;
    });
  }

  _transform(chunk, enc, cb) {
    this.emitted += chunk.length;
    cb();
  }

  _flush(cb) {
    if (!this.previousEmitted) {
      setTimeout(() => {
        if (this.previousEmitted) {
          this._compute(cb);
        } else {
          cb(new Error("Did not receive any message"));
        }
      }, 2000);
    } else {
      this._compute(cb);
    }
  }

  _compute(cb) {
    const compressionRatio = (this.emitted / this.previousEmitted).toFixed(5);
    const compressionEfficiency = ((1 - compressionRatio) * 100).toFixed(3);
    this.push(
      `\n${this.name}\nRatio\t|\tEfficiency\n${compressionRatio}\t|\t${compressionEfficiency}%\n`
    );
    cb();
  }
}

export default EndMonitor;
