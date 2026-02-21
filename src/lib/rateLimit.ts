// Simple in-memory rate limiter (for production, use Redis)
const requests = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];
  
  // Filter out old requests outside the window
  const recentRequests = userRequests.filter((time) => now - time < windowMs);
  
  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  
  // Cleanup old entries periodically
  if (requests.size > 10000) {
    requests.clear();
  }
  
  return true;
}

// Get IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}
