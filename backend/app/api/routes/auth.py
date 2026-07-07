from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserRead

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un compte",
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """
    Crée un nouveau compte utilisateur (patiente ou sage-femme).
    - L'email doit être unique.
    - Le mot de passe est haché avec bcrypt avant stockage.
    """
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cet email",
        )
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Obtenir un token JWT",
)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    """
    Authentifie l'utilisateur par email (champ `username`) + mot de passe.
    Retourne un access token JWT signé.

    Le token contient :
    - `sub` : l'id de l'utilisateur (str)
    - `role` : "patiente" ou "sage_femme"
    - `exp` : timestamp d'expiration
    """
    user: User | None = db.query(User).filter(User.email == form.username).first()

    # Même message pour email inconnu et mauvais mot de passe (évite l'énumération)
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé — contactez un administrateur",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UserRead,
    summary="Profil de l'utilisateur connecté",
)
def me(current_user: User = Depends(get_current_user)) -> User:
    """Retourne les informations du compte associé au JWT fourni."""
    return current_user
