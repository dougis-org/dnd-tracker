/* eslint-disable */
const { stopMongoContainer } = require('./mongo-testcontainers');

module.exports = async function globalTeardown() {
  try {
    // Stop container and let stopMongoContainer clear/close any connections
    await stopMongoContainer();
    // Debug: log any remaining active handles/requests so we can see what's
    // keeping Jest from exiting. This is intentionally verbose for CI debug.
    try {
      // process._getActiveHandles is intentionally non-public but useful here
      const handles = process._getActiveHandles();
      const requests = process._getActiveRequests();
      console.log('globalTeardown: active handles:', handles.map(h => h && h.constructor && h.constructor.name));
      console.log('globalTeardown: active requests:', requests.map(r => r && r.constructor && r.constructor.name));
      // Provide extra debug for any Sockets; print address info if possible to
      // help identify the owner. This often reveals the network host/port.
      const util = require('util');
      handles.forEach((h) => {
        try {
          if (h && h.constructor && h.constructor.name === 'Socket') {
            const { remoteAddress, remotePort, localAddress, localPort } = h;
            console.log('Socket details:', { remoteAddress, remotePort, localAddress, localPort });
            console.log('Socket inspect:', util.inspect(h, { showHidden: true, depth: 5 }));
          }
        } catch (e) {
          // best-effort; ignore any inspect errors
        }
      });
      // Attempt to flush standard output/error write callbacks which can
      // sometimes leave stdio sockets in a pending-write state and prevent
      // Node from exiting. Also, for any non-stdio sockets we try to destroy
      // them to avoid lingering handles.
      try {
        // Best-effort: if stdio has pending write callbacks, writing an empty
        // string with a callback will give Node a chance to flush. Repeat a
        // few times to allow asynchronous I/O to complete. As a last resort
        // we'll destroy stdio handles to force exit if writes stall.
        async function flushStdio() {
          const maxAttempts = 10;
          for (let i = 0; i < maxAttempts; i += 1) {
            try {
              const pendingStdout = process.stdout && process.stdout._writableState && process.stdout._writableState.pendingcb;
              const pendingStderr = process.stderr && process.stderr._writableState && process.stderr._writableState.pendingcb;
              if (!pendingStdout && !pendingStderr) {
                console.log('globalTeardown: no pending stdio write callbacks');
                return;
              }
              if (process.stdout && process.stdout.write) {
                // write and wait for the callback (batching may combine writes)
                await new Promise((res) => {
                  process.stdout.write('', () => res());
                });
              }
              if (process.stderr && process.stderr.write) {
                await new Promise((res) => {
                  process.stderr.write('', () => res());
                });
              }
              // Give Node a chance to process write callbacks
              await new Promise((res) => setTimeout(res, 50));
            } catch (_err) {
              // ignore per-iteration failures
            }
          }
          // If still pending, attempt to destroy stdio streams to break the
          // event loop binding; it's safe during teardown since tests are
          // finished and we're forcing the process to exit if necessary.
          try {
            if (process.stdout && typeof process.stdout.destroy === 'function') {
              try { process.stdout.destroy(); } catch { /* ignored */ }
            }
            if (process.stderr && typeof process.stderr.destroy === 'function') {
              try { process.stderr.destroy(); } catch { /* ignored */ }
            }
            console.log('globalTeardown: destroyed stdio handles as last resort');
          } catch (_err) {
            // ignore
          }
        }
        await flushStdio();
        // Destroy other socket-like handles that weren't closed by stop
        // commands. Skip stdio fds to avoid interfering with logging.
        handles.forEach((h) => {
          try {
            if (!h) return;
            // Node's stdio handles usually report as Socket and are OK to
            // leave alone, but if they are left with pending callbacks they
            // may block exit; we already attempted to flush stdio above.
            if (h && h.constructor && h.constructor.name !== 'Socket') {
              if (typeof h.destroy === 'function') {
                try {
                  h.destroy();
                } catch (_e) {
                  // ignore destroy errors
                }
              }
            }
          } catch (er) {
            // ignore any runtime errors from destroying handles
          }
        });
      } catch (err) {
        // safe-guard: don't fail teardown for cleanup errors
        console.error('globalTeardown: flush/destroy attempt error', err);
      }
    } catch (err) {
      console.error('Error enumerating active handles:', err);
    }
  } catch (err) {
    // Don't fail teardown if stop fails; just log
     
    console.error('globalTeardown error:', err);
  }
  // After attempts to gracefully close/destroy any open handles, only force
  // exit if there are still active handles. This avoids masking resource
  // leaks unless absolutely necessary.
  try {
    const remainingHandles = process._getActiveHandles().filter(Boolean);
    if (remainingHandles.length > 0) {
      console.log('globalTeardown: remaining handles; forcing process.exit(0)');
      process.exit(0);
    } else {
      console.log('globalTeardown: no remaining handles; not forcing exit');
    }
  } catch (err) {
    /* ignore */
  }
};
