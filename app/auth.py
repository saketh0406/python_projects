from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Password hashing ---
def hash_password(password: str) -> str:
    """
    Hash a password (truncated to 72 bytes) for storage.
    """
    password_bytes = password.encode("utf-8")[:72]
    return pwd_context.hash(password_bytes)


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a plain password against the hashed version.
    """
    password_bytes = password.encode("utf-8")[:72]
    return pwd_context.verify(password_bytes, hashed)
