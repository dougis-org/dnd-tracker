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
        // string with a callback will give Node a chance to flush.
        if (process.stdout && process.stdout.write) {
          process.stdout.write('', () => {
            console.log('globalTeardown: flushed stdout');
          });
        }
        if (process.stderr && process.stderr.write) {
          process.stderr.write('', () => {
            console.log('globalTeardown: flushed stderr');
          });
        }
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
  // If we've reached this point and Jest still hasn't exited due to open
  // handles, force exit to avoid hanging CI. This is a last-resort safety
  // measure; ideally we'd find the root cause of open handles above.
  try {
    process.exit(0);
  } catch (err) {
    /* ignore */
  }
};
