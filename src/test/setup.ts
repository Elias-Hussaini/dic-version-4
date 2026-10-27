import '@testing-library/jest-dom/vitest';

// fake-indexeddb for Dexie in unit tests
import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';

// clean localStorage between tests
beforeEach(() => {
  localStorage.clear();
});
