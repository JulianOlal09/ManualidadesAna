import jwt from 'jsonwebtoken';
export function generateToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jwt.sign(payload, secret, { expiresIn: '1d' });
}
export function verifyToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jwt.verify(token, secret);
}
//# sourceMappingURL=jwt.js.map