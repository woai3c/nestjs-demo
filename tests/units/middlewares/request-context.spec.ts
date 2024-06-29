import { RequestContextMiddleware } from '@/middlewares/request-context'
import { createNamespace } from 'cls-hooked'

jest.mock('cls-hooked', () => ({
  createNamespace: jest.fn().mockReturnValue({
    run: jest.fn((callback) => callback()),
    set: jest.fn(),
    get: jest.fn(),
  }),
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}))

describe('RequestContextMiddleware', () => {
  let middleware: RequestContextMiddleware
  let mockRequestNamespace

  beforeEach(() => {
    middleware = new RequestContextMiddleware()
    mockRequestNamespace = createNamespace('request')
  })

  it('should set requestId in requestNamespace on use', () => {
    const mockReq: any = {}
    const mockRes: any = {}
    const mockNext: any = jest.fn()

    middleware.use(mockReq, mockRes, mockNext)

    expect(mockRequestNamespace.set).toHaveBeenCalledWith('requestId', 'test-uuid')
    expect(mockNext).toHaveBeenCalled()
  })

  it('should return requestId from requestNamespace in getRequestId', () => {
    mockRequestNamespace.get.mockReturnValue('test-uuid')

    const requestId = RequestContextMiddleware.getRequestId()

    expect(requestId).toEqual('test-uuid')
    expect(mockRequestNamespace.get).toHaveBeenCalledWith('requestId')
  })
})
