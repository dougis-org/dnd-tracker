const { stopMongoContainer } = require('./mongo-testcontainers');

// Helper to flush stdio and destroy handles
async function flushStdio() {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i += 1) {
    const pendingStdout = process.stdout?._writableState?.pendingcb;
    const pendingStderr = process.stderr?._writableState?.pendingcb;
    if (!pendingStdout && !pendingStderr) {
      console.log('globalTeardown: no pending stdio write callbacks');
      return;
    }
    try {
      if (process.stdout?.write) {
        await new Promise((res) => {
          process.stdout.write('', () => res());
        });
      }
      if (process.stderr?.write) {
        await new Promise((res) => {
          process.stderr.write('', () => res());
        });
      }
      // Give Node a chance to process write callbacks
      await new Promise((res) => setTimeout(res, 50));
    } catch {
      // ignore per-iteration failures
    }
  }

  // If still pending, destroy stdio streams to break event loop binding
  try {
    if (process.stdout?.destroy) {
      try {
        process.stdout.destroy();
      } catch {
        /* ignored */
      }
    }
    if (process.stderr?.destroy) {
      try {
        process.stderr.destroy();
      } catch {
        /* ignored */
      }
    }
    console.log('globalTeardown: destroyed stdio handles as last resort');
  } catch {
    // ignore
  }
}

module.exports = async function globalTeardown() {
  // Stop container
  try {
    await stopMongoContainer();
  } catch (err) {
    console.error('globalTeardown error:', err);
  }

  // Debug: log remaining active handles
  try {
    const handles = process._getActiveHandles();
    const requests = process._getActiveRequests();
    console.log(
      'globalTeardown: active handles:',
      handles.map((h) => h?.constructor?.name)
    );
    console.log(
      'globalTeardown: active requests:',
      requests.map((r) => r?.constructor?.name)
    );

    const util = require('util');
    handles.forEach((h) => {
      try {
        if (h?.constructor?.name === 'Socket') {
          const { remoteAddress, remotePort, localAddress, localPort } = h;
          console.log('Socket details:', {
            remoteAddress,
            remotePort,
            localAddress,
            localPort,
          });
          console.log(
            'Socket inspect:',
            util.inspect(h, { showHidden: true, depth: 5 })
          );
        }
      } catch {
        // ignore inspect errors
      }
    });

    // Flush stdio and destroy handles
    await flushStdio();

    // Destroy other socket-like handles
    handles.forEach((h) => {
      try {
        if (!h) return;
        if (h?.constructor?.name !== 'Socket' && h?.destroy) {
          try {
            h.destroy();
          } catch {
            // ignore destroy errors
          }
        }
      } catch {
        // ignore runtime errors
      }
    });
  } catch (err) {
    console.error('Error enumerating active handles:', err);
  }

  // Force exit if still have active handles
  try {
    const remainingHandles = process._getActiveHandles().filter(Boolean);
    if (remainingHandles.length > 0) {
      console.log('globalTeardown: remaining handles; forcing process.exit(0)');
      process.exit(0);
    } else {
      console.log('globalTeardown: no remaining handles; not forcing exit');
    }
  } catch {
    /* ignore */
  }
};
