import { jwtDecode } from 'jwt-decode';

export class JwtUtils {

  static decode(token) {
    if (!token) {
      throw new Error('JWT 토큰이 필요합니다.');
    }

    try {
      return jwtDecode(token);
    } catch (error) {
      throw new Error('유효하지 않은 JWT 토큰입니다.');
    }
  }

  static isExpired(token) {
    try {
      const decoded = JwtUtils.decode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (e) {
      return true;
    }
  }
}
