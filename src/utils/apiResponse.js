/**
 * Standard API Response Utility
 * Provides consistent response format across all endpoints
 */

class ApiResponse {
  /**
   * Success response with data
   */
  static success(res, statusCode = 200, data = null, message = 'Success', meta = {}) {
    const response = {
      success: true,
      message,
      data,
    };

    // Add metadata if provided (pagination, etc.)
    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Success response with pagination
   */
  static successWithPagination(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    });
  }

  /**
   * Error response
   */
  static error(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, 201, data, message);
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Bad request response (400)
   */
  static badRequest(res, message = 'Bad Request', errors = null) {
    return this.error(res, 400, message, errors);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, 401, message);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, 403, message);
  }

  /**
   * Not found response (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, 404, message);
  }

  /**
   * Conflict response (409)
   */
  static conflict(res, message = 'Conflict') {
    return this.error(res, 409, message);
  }

  /**
   * Internal server error response (500)
   */
  static serverError(res, message = 'Internal Server Error') {
    return this.error(res, 500, message);
  }
}

module.exports = ApiResponse;