let city = '';

beforeEach(() => {
  city = 'Vienna';
});

afterEach(() => {
  city = undefined;
});

test("city database has Vienna", () => {
  expect(city).toBe('Vienna');
});
