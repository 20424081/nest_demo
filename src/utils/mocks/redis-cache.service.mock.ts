const mockRedisCacheService = {
  genHashSHA1: jest.fn(() => 'abcxyz'),
  get: jest.fn(() => {
    return JSON.stringify({ code: 'abcxyz', time_try: 1 });
  }),
  set: jest.fn(),
  del: jest.fn(),
};
export default mockRedisCacheService;
