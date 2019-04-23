import { LRU_EVICTED_ENTRY } from "./constants";
import createLRU from "./create-lru";

const dateNow = jest.spyOn(Date, "now");

afterEach(() => {
  dateNow.mockReset();
});

test("least recently used items are evicted when adding items", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);

  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteOne).toHaveBeenCalledTimes(1);
});

test("accessing an item marks it as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);
  const valueTwo = lru.access(entryTwo);

  expect(valueTwo).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);
  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
});

test("accessing least recently used item marks it as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);
  const valueOne = lru.access(entryOne);

  expect(valueOne).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);
  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).toHaveBeenCalledTimes(1);
  expect(deleteTwo).toHaveBeenCalledTimes(1);
});

test("accessing most recently used item leaves it marked as most recently used", () => {
  const lru = createLRU({ maxSize: 3 });

  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);
  const valueThree = lru.access(entryThree);

  expect(valueThree).toBe(3);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);
  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).toHaveBeenCalledTimes(1);
  expect(deleteOne).toHaveBeenCalledTimes(1);
});

test("accessing item when creation is not too old does not evict it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
});

test("accessing item when creation is too old evicts it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).toHaveBeenCalledTimes(1);

  const entryFour = lru.add(4, () => {});
  expect(lru.access(entryFour)).toBe(4);
});

test("accessing item when last access is not too old does not evict it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  const valueOne = lru.access(entryOne);
  const valueTwo = lru.access(entryTwo);
  const valueThree = lru.access(entryThree);

  expect(valueOne).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(valueTwo).toBe(2);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(valueThree).toBe(3);
  expect(deleteThree).not.toHaveBeenCalled();

  dateNow.mockImplementation(() => 1100);
  expect(lru.access(entryTwo)).toBe(2);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
});

test("accessing item when last access is too old evicts it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1050);
  const valueOne = lru.access(entryOne);
  const valueTwo = lru.access(entryTwo);
  const valueThree = lru.access(entryThree);

  expect(valueOne).toBe(1);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(valueTwo).toBe(2);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(valueThree).toBe(3);
  expect(deleteThree).not.toHaveBeenCalled();

  dateNow.mockImplementation(() => 1101);
  expect(lru.access(entryTwo)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).toHaveBeenCalledTimes(1);

  const entryFour = lru.add(4, () => {});
  expect(lru.access(entryFour)).toBe(4);
});

test("accessing least recently used item when it is too old evicts it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteOne).toHaveBeenCalledTimes(1);

  const entryFour = lru.add(4, () => {});
  expect(lru.access(entryFour)).toBe(4);
});

test("accessing most recently used item when it is too old evicts it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  const entryThree = lru.add(3, deleteThree);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryThree)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).toHaveBeenCalledTimes(1);

  const entryFour = lru.add(4, () => {});
  expect(lru.access(entryFour)).toBe(4);
});

test("accessing only item when it is too old evicts it", () => {
  const lru = createLRU({ maxAge: 50 });

  dateNow.mockImplementation(() => 1000);
  const deleteOne = jest.fn(() => {});
  const entryOne = lru.add(1, deleteOne);

  dateNow.mockImplementation(() => 1051);
  expect(lru.access(entryOne)).toBe(LRU_EVICTED_ENTRY);
  expect(deleteOne).toHaveBeenCalledTimes(1);

  const entryTwo = lru.add(2, () => {});
  expect(lru.access(entryTwo)).toBe(2);
});

test("updating an item stores its new value", () => {
  const lru = createLRU({ maxSize: 2 });

  const entry = lru.add("initial", () => {});
  expect(lru.access(entry)).toBe("initial");

  lru.update(entry, "updated");
  expect(lru.access(entry)).toBe("updated");
});
