import jwt from 'jsonwebtoken';

export function validateJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET in .env to a random value of at least 32 characters.');
  }
}

export function createToken(userId) {
  validateJwtSecret();
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(userId), algorithm: 'HS256', expiresIn: '1h',
    issuer: 'healthcare-api', audience: 'healthcare-frontend',
  });
}

export function readToken(token) {
  validateJwtSecret();
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'], issuer: 'healthcare-api', audience: 'healthcare-frontend',
  });
}
