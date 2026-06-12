import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class RateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # dict mapping client IP to list of request timestamps
        self.history = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        # Clean up timestamps older than the window
        cutoff = now - self.window_seconds
        self.history[client_ip] = [t for t in self.history[client_ip] if t > cutoff]
        
        if len(self.history[client_ip]) < self.requests_limit:
            self.history[client_ip].append(now)
            return True
        return False

def rate_limit(limiter: RateLimiter):
    async def dependency(request: Request):
        client_ip = request.headers.get("X-Forwarded-For") or (request.client.host if request.client else "127.0.0.1")
        if client_ip and "," in client_ip:
            client_ip = client_ip.split(",")[0].strip()
            
        if not limiter.is_allowed(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
    return dependency

# Define rate limiters for different purposes
# 1. Unauthenticated code/file generation: 10 requests per minute
direct_gen_limiter = RateLimiter(requests_limit=10, window_seconds=60)

# 2. Unauthenticated ZIP upload/analyze: 5 requests per minute
direct_analyze_limiter = RateLimiter(requests_limit=5, window_seconds=60)

# 3. Auth endpoints (GitHub login flow): 20 requests per minute
auth_limiter = RateLimiter(requests_limit=20, window_seconds=60)

# 4. Authenticated API operations: 100 requests per minute
general_limiter = RateLimiter(requests_limit=100, window_seconds=60)
