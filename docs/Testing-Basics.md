# Testing Basics: Mocks, Stubs, Spies, Fakes, and More

## 1. Mocking
**Mocking** means creating a fake version of a function, object, or module so you can control its behavior in your tests.
- **Why?** To isolate the code you’re testing from its dependencies (like databases, APIs, or other modules), so your tests are fast, reliable, and only fail when your code is broken—not when a network or database is down.
- **Example:**
  ```js
  // In your test, you can replace db.findUser with a mock:
  db.findUser = () => ({ id: 2, name: "Bob" });
  ```

## 2. Stubbing
**Stubbing** is a specific kind of mocking. A **stub** is a function that replaces a real function, but you control exactly what it returns (or what it does).
- **Why?** To make sure your code gets predictable responses from dependencies, or to simulate errors.
- **Example:**
  ```js
  db.findUser = () => { throw new Error("Database down!"); };
  ```

## 3. Spying
A **spy** is a function that wraps a real function and records information about how it was called (arguments, how many times, etc.), but still lets the real function run (unless you override it).
- **Why?** To check if your code called a function, how many times, and with what arguments.
- **Example:**
  ```js
  const spy = jest.spyOn(db, 'findUser');
  myFunction();
  expect(spy).toHaveBeenCalledWith("alice@example.com");
  ```

## 4. Faking
A **fake** is a lightweight implementation of something real, but simpler. For example, an in-memory database instead of a real one.
- **Why?** To simulate more complex behavior than a stub, but without the overhead of the real thing.
- **Example:**
  An in-memory array that acts like a database for the duration of your test.

## 5. Dependency Injection
This is a design pattern where you pass dependencies (like a database or API client) into your code, rather than having your code create them itself. This makes it easy to swap in mocks or fakes for testing.
- **Why?** To make your code more testable and flexible.
- **Example:**
  ```js
  function getUserProfile(userRepo) {
    return userRepo.findUser();
  }
  // In production: getUserProfile(realDb)
  // In tests: getUserProfile(mockDb)
  ```

---

## Types of Tests

### Unit Tests
- **What:** Test a single function or class in isolation (with all dependencies mocked or stubbed).
- **Where:** Usually in the same folder as the code, or in a `tests` or `__tests__` folder.
- **Helpers:** Use the `__mocks__` folder for reusable mocks.

### Integration Tests
- **What:** Test how multiple parts of your system work together (e.g., your API and your database, or several modules together).
- **Where:** Often in a `tests/integration` or `integration` folder.
- **Helpers:** You might have `__fixtures__` for sample data, or use a test database.

### End-to-End (E2E) Tests
- **What:** Test the whole system as a user would (e.g., using a browser automation tool to click through your app).
- **Where:** Often in a `tests/e2e` or `e2e` folder.
- **Helpers:** May use `__fixtures__` for test data, and sometimes their own mocks for external services.

---

## Special Folders

- `__mocks__`: For reusable mocks and fake implementations. Used by both unit and integration tests.
- `__fixtures__`: (Optional) For static sample data used in tests, especially integration and E2E tests.
- `__tests__`: (Optional) Some projects put all test files here, but you can also keep tests next to the code they test.

**You do NOT need to use all these folders!** Use what makes sense for your project. The most important is `__mocks__` for reusable mocks.

---

## Summary Table

| Technique   | What it is                        | When to use it                |
|-------------|-----------------------------------|-------------------------------|
| Mock        | Fake version of a dependency      | Isolate code, control output  |
| Stub        | Mock that returns specific output | Simulate responses/errors     |
| Spy         | Records calls to a function       | Check how a function is used  |
| Fake        | Simple implementation             | Simulate complex behavior     |
| Dependency Injection | Pass dependencies in     | Make code testable/flexible   |

| Test Type   | What it tests                     | Where to put it               |
|-------------|-----------------------------------|-------------------------------|
| Unit        | One function/class in isolation   | Next to code or __tests__     |
| Integration | Multiple modules together         | tests/integration             |
| E2E         | Whole system (user perspective)   | tests/e2e                     |

---

## Why are these important?
- **Speed:** Tests run fast because they don’t use real databases or networks.
- **Reliability:** Tests don’t fail because of external issues.
- **Isolation:** You can test one piece of code at a time.
- **Control:** You can simulate any scenario (success, error, edge cases).

---

If you want concrete examples of any of these in your codebase, just ask!

---

## Entity Testing Guidelines

### Should You Test Entities? YES!

Entities should be tested when they contain:
- **Business Logic Methods** (e.g., `document.isExpired()`, `document.approve()`)
- **Validation Logic** (e.g., `User.create()` with `validateOrReject()`)
- **State Transitions** (e.g., document status changes)
- **Complex Constructors** with validation

### Should You Mock Entities? Generally NO!

**Don't mock entities when:**
- Testing the entity itself (unit tests)
- Entities are lightweight with no external dependencies
- Entities contain critical business rules

**DO mock entities when:**
- Testing controllers/services that use entities
- Testing complex relationships that are expensive to create
- Isolating components in integration tests

### Entity Testing Best Practices

1. **Test Business Logic Methods** - Focus on methods that contain business rules
2. **Test Validation** - Ensure validation decorators work correctly
3. **Test State Changes** - Verify methods that modify entity state
4. **Use Real Entities** - Create actual entity instances, not mocks
5. **Test Edge Cases** - Invalid data, boundary conditions, error states

### Example: Testing Document Entity

```typescript
// ✅ GOOD: Test the actual entity behavior
describe("Document Entity", () => {
  it("should approve a pending document", () => {
    const document = new Document(/* ... */);
    const user = new User(/* ... */);
    
    document.approve(user, "Looks good");
    
    expect(document.status).toBe(DocumentStatus.APPROVED);
    expect(document.verifiedBy).toBe(user);
  });
});
```

### Example: Testing Controller with Mocked Entities

```typescript
// ✅ GOOD: Mock entities when testing controllers
describe("Document Controller", () => {
  it("should approve document when user has permission", async () => {
    const mockDocument = {
      canBeVerified: mock(() => true),
      approve: mock(() => {}),
    } as unknown as Document;
    
    const result = await approveDocument("doc-123", "user-123");
    
    expect(result.success).toBe(true);
    expect(mockDocument.approve).toHaveBeenCalled();
  });
});
``` 