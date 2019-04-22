import invariant from "tiny-invariant";
import warning from "tiny-warning";

export default function createLRU({ maxSize = Infinity } = {}) {
  invariant(typeof maxSize === "number", "expected maxSize to be a number");
  invariant(maxSize > 1, "expected maxSize to be greater than 1");

  let first = null;
  let size = 0;

  function add(value, onDelete) {
    const entry = {
      value,
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
      size = size + 1;
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
      if (first !== entry) {
        prev.next = next;
        next.prev = prev;

        const last = first.prev;

        last.next = first.prev = entry;
        entry.next = first;
        entry.prev = last;

        first = entry;
      }
    } else {
      warning(false, "trying to access a deleted entry in lru");
    }

    return entry.value;
  }

  return {
    add,
    update,
    access,
  };
}
