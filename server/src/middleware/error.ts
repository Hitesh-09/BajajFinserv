import { Request, Response, NextFunction } from 'express';

type HttpFailureShape = {
  statusCode?: number;
  message?: string;
};

export const errorHandler = (
  requestFailure: unknown,
  _requestContext: Request,
  responseSender: Response,
  _next: NextFunction
): void => {
  const failureEnvelope = (typeof requestFailure === 'object' && requestFailure !== null
    ? requestFailure
    : {}) as HttpFailureShape;
  const httpStatusCode = failureEnvelope.statusCode ?? 500;
  const responseMessage = failureEnvelope.message ?? 'Internal Server Error';

  console.error('Error:', requestFailure);
  responseSender.status(httpStatusCode).json({
    is_success: false,
    message: responseMessage,
  });
};
