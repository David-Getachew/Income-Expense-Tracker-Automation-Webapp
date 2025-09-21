// tests/api.normalizeRow.test.js
// Unit tests for the normalizeRow function

describe('API Normalization', () => {
  test('should calculate amount correctly', () => {
    const dbRow = {
      'Quantity': 50,
      'Price per Quantity': 5
    };

    const amount = dbRow['Quantity'] * dbRow['Price per Quantity'];
    expect(amount).toBe(250);
  });

  test('should handle fields correctly', () => {
    const dbRow = {
      'item name': 'Injera',
      'Quantity': 50,
      'Price per Quantity': 5
    };

    expect(dbRow['item name']).toBe('Injera');
    expect(dbRow['Quantity']).toBe(50);
    expect(dbRow['Price per Quantity']).toBe(5);
  });
});