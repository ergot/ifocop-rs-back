module.exports = {
  'db': {
    'name': 'db',
    'connector': 'memory',
  },
  'mongoDs': {
    'url': 'mongodb://heroku_x991tj3v:dqfjb2obgrm78640h5f4801uat@ds141450.mlab.com:41450/heroku_x991tj3v',
    'connector': 'mongodb',
  },
  'myEmailDataSource': {
    'name': 'myEmailDataSource',
    'connector': 'mail',
    'transports': [
      {
        'type': 'SMTP',
        'host': 'smtp.sendgrid.net',
        'secure': false,
        'port': 2525,
        'tls': {
          'rejectUnauthorized': false,
        },
        'auth': {
          'user': process.env.SENDGRID_USERNAME,
          'pass': process.env.SENDGRID_PASSWORD,
        },
      },
    ],
  },
};
