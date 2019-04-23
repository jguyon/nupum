import { LRU_EVICTED_ENTRY } from "./constants";
import createLRU from "./create-lru";

const dateNow = jest.spyOn(Date, "now");
const consoleWarn = jest.spyOn(console, "warn");

afterEach(() => {
  dateNow.mockReset();
  consoleWarn.mockReset();
});

test("adding an item stores its value", () => {
  const lru = createLRU();

  const entryOne = lru.add(1, () => {});
  const entryTwo = lru.add(2, () => {});
  const entryThree = lru.add(3, () => {});

  expect(lru.access(entryOne)).toBe(1);
  expect(lru.access(entryTwo)).toBe(2);
  expect(lru.access(entryThree)).toBe(3);
});

test("updating an item stores its new value", () => {
  const lru = createLRU();

  const entryOne = lru.add(1, () => {});
  const entryTwo = lru.add(2, () => {});
  const entryThree = lru.add(3, () => {});

  lru.update(entryOne, 10);
  lru.update(entryTwo, 20);
  lru.update(entryThree, 30);

  expect(lru.access(entryOne)).toBe(10);
  expect(lru.access(entryTwo)).toBe(20);
  expect(lru.access(entryThree)).toBe(30);
});

test("adding items evicts least recently used items", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing item marks it as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing least recently used item marks it as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  expect(lru.access(entryOne)).toBe(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing most recently used items leaves it as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  expect(lru.access(entryThree)).toBe(3);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing item when creation is not too old does not evict it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing item when creation is too old evicts it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("accessing item when last access is not too old does not evict it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("accessing item when last access it too old evicts it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryOne)).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(lru.access(entryThree)).toBe(3);
  expect(deleteThree).not.toHaveBeenCalled();

  dateNow.mockImplementation(() => 1101);
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("accessing least recently used item when it is too old evicts it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryOne)).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(lru.access(entryThree)).toBe(3);
  expect(deleteThree).not.toHaveBeenCalled();

  dateNow.mockImplementation(() => 1101);
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("accessing most recently used item when it is too old evicts it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryOne)).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(lru.access(entryThree)).toBe(3);
  expect(deleteThree).not.toHaveBeenCalled();

  dateNow.mockImplementation(() => 1101);
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(1);

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  consoleWarn.mockImplementationOnce(() => {});
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("accessing only item when it is too old evicts it", () => {
  const lru = createLRU({ maxSize: 3, maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteOne).toHaveBeenCalledTimes(1);

  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);
  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();

  const deleteSix = jest.fn(() => {});
  lru.add(6, deleteSix);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();

  const deleteSeven = jest.fn(() => {});
  lru.add(7, deleteSeven);

  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteFour).toHaveBeenCalledTimes(1);
  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteSix).not.toHaveBeenCalled();
  expect(deleteSeven).not.toHaveBeenCalled();
});
