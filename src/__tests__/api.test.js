import { apiClient } from '../lib/api';

describe('apiClient', () => {
  it('has get method', () => {
    expect(apiClient.get).toBeInstanceOf(Function);
  });
  it('has post method', () => {
    expect(apiClient.post).toBeInstanceOf(Function);
  });
});