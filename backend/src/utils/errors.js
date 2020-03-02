/**
 * Class-based errors for blockchain components.
 *
 * @file Defines custom errors for the application.
 */

/**
 * Constructs an instance of BaseError class.
 *
 * Provides the ability to create a new BaseError instance
 * with custom message and code.
 *
 * @access public
 * @class
 */
class BaseError extends Error {

  /**
   * Constructs an instance of BaseError class.
   *
   * @access     public
   * @constructs BaseError
   *
   * @constructor
   * @param  {Number}    message Custom error message to provide information.
   * @param  {String}    code    Custom error number code.
   * @return {BaseError} Class instance.
   */
  constructor(message, code) {
    message = code !== null ? `Error ${ code } ${ message }` : message;
    super(message);
    this.code = code;
    this.message = message;
  }
}

class BlockError extends BaseError {
  constructor(message, code = null) {
    super(message, code);
  }
}

class LoggerError extends BaseError {
  constructor(message, code = null) {
    super(message, code);
  }
}

export { BlockError, LoggerError };
