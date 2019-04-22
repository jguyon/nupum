import createLRU from "./create-lru";

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
  const entryOne = lru.add(1, deleteOne);
  const deleteTwo = jest.fn(() => {});
  const entryTwo = lru.add(2, deleteTwo);
  const deleteThree = jest.fn(() => {});
  lru.add(3, deleteThree);
  const valueTwo = lru.access(entryTwo);
  const valueOne = lru.access(entryOne);

  expect(valueOne).toBe(1);
  expect(valueTwo).toBe(2);
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();

  const deleteFour = jest.fn(() => {});
  lru.add(4, deleteFour);

  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteTwo).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteThree).toHaveBeenCalledTimes(1);
  deleteThree.mockClear();

  const deleteFive = jest.fn(() => {});
  lru.add(5, deleteFive);

  expect(deleteFive).not.toHaveBeenCalled();
  expect(deleteFour).not.toHaveBeenCalled();
  expect(deleteThree).not.toHaveBeenCalled();
  expect(deleteOne).not.toHaveBeenCalled();
  expect(deleteTwo).toHaveBeenCalledTimes(1);
});

test("updating an item stores its new value", () => {
  const lru = createLRU({ maxSize: 2 });

  const entry = lru.add("initial", () => {});
  expect(lru.access(entry)).toBe("initial");

  lru.update(entry, "updated");
  expect(lru.access(entry)).toBe("updated");
});
