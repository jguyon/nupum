import invariant from "tiny-invariant";
import warning from "tiny-warning";
import { LRU_EVICTED_ENTRY } from "./constants";

// Inspired by
// https://github.com/facebook/react/blob/4d5cb64aa2beacf982cf0e01628ddda6bd92014c/packages/react-cache/src/LRU.js
export default function createLRU({
  maxSize = Infinity, // max number of entries to store
  maxAge = Infinity, // max age of entries since their last access
} = {}) {
  invariant(typeof maxSize === "number", "expected maxSize to be a number");
  invariant(maxSize > 1, "expected maxSize to be greater than 1");
  invariant(typeof maxAge === "number", "expected maxAge to be a number");
  invariant(maxAge > 0, "expected maxAge to be greater than 0");

  let first = null;
  let size = 0;

  function add(value, onDelete) {
    const entry = {
      value,
      lastAccessedAt: Date.now(),
      onDelete,
      next: null,
      prev: null,
    };

    if (size === maxSize) {
      const last = first.prev;
      const beforeLast = last.prev;

      beforeLast.next = first.prev = entry;
      entry.next = first;
      entry.prev = beforeLast;

      first = entry;

      last.next = last.prev = null;
      last.onDelete();
    } else if (size > 0) {
      const last = first.prev;

      last.next = first.prev = entry;
      entry.next = first;
      entry.prev = last;

      first = entry;
      size += 1;
    } else {
      entry.next = entry.prev = entry;

      first = entry;
      size = 1;
    }

    return entry;
  }

  function update(entry, newValue) {
    entry.value = newValue;
  }

  function access(entry) {
    const { next, prev } = entry;

    if (next) {
      const now = Date.now();

      if (now - entry.lastAccessedAt > maxAge) {
        if (size > 1) {
          prev.next = next;
          next.prev = prev;

          size -= 1;
          if (first === entry) {
            first = next;
          }
        } else {
          size = 0;
          first = null;
        }

        entry.next = entry.prev = null;
        entry.onDelete();

        return LRU_EVICTED_ENTRY;
      } else {
        entry.lastAccessedAt = now;

        if (first !== entry) {
          prev.next = next;
          next.prev = prev;

          const last = first.prev;

          last.next = first.prev = entry;
          entry.next = first;
          entry.prev = last;

          first = entry;
        }

        return entry.value;
      }
    } else {
      warning(false, "trying to access a deleted LRU entry");
      return LRU_EVICTED_ENTRY;
    }
  }

  return {
    add,
    update,
    access,
  };
}
