from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ── Exception réutilisable ────────────────────────────────────────────────────
_CREDENTIALS_EXC = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token invalide ou expiré",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Décode le JWT, valide la signature et l'expiration,
    puis charge l'utilisateur depuis la base.
    Lève 401 si le token est invalide ou si le user n'existe plus.
    """
    try:
        payload = decode_token(token)
    except JWTError:
        raise _CREDENTIALS_EXC

    # "sub" est toujours une chaîne dans un JWT standard
    raw_sub: str | None = payload.get("sub")
    if not raw_sub:
        raise _CREDENTIALS_EXC

    try:
        user_id = int(raw_sub)
    except ValueError:
        raise _CREDENTIALS_EXC

    user: User | None = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _CREDENTIALS_EXC

    return user


def require_patiente(current_user: User = Depends(get_current_user)) -> User:
    """Lève 403 si l'utilisateur connecté n'est pas une patiente."""
    if current_user.role != UserRole.patiente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux patientes",
        )
    return current_user


def require_sage_femme(current_user: User = Depends(get_current_user)) -> User:
    """Lève 403 si l'utilisateur connecté n'est pas une sage-femme."""
    if current_user.role != UserRole.sage_femme:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux sages-femmes",
        )
    return current_user
