export default () => ({
  database: {
    dialect: process.env.DATABASE_DIALECT || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3307,
    username: process.env.DATABASE_USERNAME || 'demo',
    password: process.env.DATABASE_PASSWORD || 'demo',
    database: process.env.DATABASE_NAME || 'demo',
    test: {
      dialect: process.env.DATABASE_DIALECT || 'mysql',
      host: process.env.DATABASE_HOST || 'db',
      port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
      username: process.env.DATABASE_USERNAME_TEST || 'root',
      password: process.env.DATABASE_PASSWORD_TEST || 'root',
      database: process.env.DATABASE_NAME_TEST || 'test_demo',
    },
  },
  cache: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  mailer: {
    email: process.env.EMAIL || '______@gmail.com',
    host: process.env.HOST_MAIL || 'smtp.gmail.com',
    username: process.env.MAIL_USERNAME || '_____@gmail.com',
    password: process.env.MAIL_PASSWORD || 'P@$$vv0rd',
  },
  aws: {
    access_key_id: process.env.AWS_ACCESS_KEY_ID || 'ACCESS_KEY_ID',
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY || 'SECRET_ACCESS_KEY',
    // eslint-disable-next-line prettier/prettier
    public_bucket_name: process.env.AWS_PUBLIC_BUCKET_NAME || 'demo-nestjs-public-bucket',
  },
  secret: process.env.SECRET_KEY || 'saldflk1;lk23kljdaklj21k-=da==ck2lkj1lk=',
  refresh_secret: process.env.REFRESH_SECRET_KEY || 'lkjdslknv2mn====asd=+',
  hash_private_key: process.env.HASH_PRIVATE_KEY || 'e2lkjdlk3k5lLKl1@lkjlks+=',
  path_file: process.env.PATH_FILE || '/images',
  facebook_app_id: process.env.FACEBOOK_APP_ID || '__________',
  // eslint-disable-next-line prettier/prettier
  facebook_app_secret: process.env.FACEBOOK_APP_SECRET || '11_______________5',
  // eslint-disable-next-line prettier/prettier
  facebook_callback_url: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
  oauth_client_id: process.env.OAUTH_CLIENTID || 'oath_client_id',
  oauth_client_secret: process.env.OAUTH_CLIENT_SECRET || 'oauth_client_secret',
  oauth_refresh_token: process.env.OAUTH_REFRESH_TOKEN || 'oauth_refresh_token',
});
