module.exports = {
  UserValidationError: {
    type: 'object',
    properties: {
      message: {
        type: 'The password doesn`t meet our stadards.'
      },
      internal_code: {
        type: 'user_validation_error'
      }
    }
  },
  DatabaseError: {
    type: 'object',
    properties: {
      message: {
        type: 'A user with that email already exists.'
      },
      internal_code: {
        type: 'database_error'
      }
    }
  }
};
