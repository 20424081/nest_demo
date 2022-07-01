const mockJwtService = {
  sign: jest.fn(() => {
    return 'token';
  }),
};

export default mockJwtService;
