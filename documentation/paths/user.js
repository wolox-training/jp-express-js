module.exports = {
  '/users': {
    post: {
      tags: ['Create User'],
      description: 'Create user',
      operationId: 'createUser',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        required: true
      },
      responses: {
        201: {
          description: 'New user was created'
        },
        422: {
          description: 'Unprocessable Entity',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DatabaseError'
              },
              example: {
                message: 'A user with that email already exists.',
                internal_code: 'database_error'
              }
            }
          }
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserValidationError'
              },
              example: {
                message: 'The password doesn`t meet our stadards.',
                internal_code: 'user_validation_error'
              }
            }
          }
        }
      }
    }
  }
};
