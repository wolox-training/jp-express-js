module.exports = {
  firstName: {
    type: 'string',
    example: 'Juan'
  },
  lastName: {
    type: 'string',
    example: 'Rojas'
  },
  email: {
    type: 'string',
    example: 'juanpablo.rojas@wolox.co',
    description: 'Domain must be one of our wolox.co* domains`'
  },
  password: {
    type: 'string',
    example: 'abc123456',
    description: 'Password must be alphanumeric, greater or equal than 8`'
  },
  User: {
    type: 'object',
    properties: {
      firstName: {
        $ref: '#/components/schemas/firstName'
      },
      lastName: {
        $ref: '#/components/schemas/lastName'
      },
      email: {
        $ref: '#/components/schemas/email'
      },
      password: {
        $ref: '#/components/schemas/password'
      }
    },
    description: 'asdfsaddf'
  },
  Users: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User'
        }
      }
    }
  }
};
