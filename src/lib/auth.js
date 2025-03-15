import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export async function verifyAuth(token) {
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Add public image verification
export async function verifyPublicAccess(token) {
  if (!token) return true;
  try {
    await verifyAuth(token);
    return true;
  } catch {
    return false;
  }
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
