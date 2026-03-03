'use strict';

// Shim for Node's `crypto` module used by the Parse SDK in React Native.
// React Native 0.73+ exposes global.crypto with randomUUID natively.
function randomUUID() {
  if (
    typeof global.crypto !== 'undefined' &&
    typeof global.crypto.randomUUID === 'function'
  ) {
    return global.crypto.randomUUID();
  }
  // Fallback: RFC-4122 v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

module.exports = { randomUUID };
