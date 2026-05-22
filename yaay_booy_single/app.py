"""
╔══════════════════════════════════════════════════════════════╗
║           YAAY BOOY — Backend FastAPI (fichier unique)       ║
║           Application de suivi de grossesse                  ║
╚══════════════════════════════════════════════════════════════╝

Lancement :
    uvicorn app:app --reload

Base de données :
    Importer yaay_booy.sql dans MySQL avant de lancer l'API.
"""

import enum
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

# ── Dépendances externes ───────────────────────────────────────────────────────
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import (
    Column, Date, DateTime, Enum as SAEnum,
    Float, ForeignKey, Integer, String, Text, create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker


# ══════════════════════════════════════════════════════════════════════════════
# 1. CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "yaay_booy"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    SECRET_KEY: str = "changez_cette_cle_secrete_en_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()


# ══════════════════════════════════════════════════════════════════════════════
# 2. BASE DE DONNÉES
# ══════════════════════════════════════════════════════════════════════════════

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# 3. MODÈLES SQLALCHEMY
# ══════════════════════════════════════════════════════════════════════════════

class RolePersonnel(str, enum.Enum):
    SAGE_FEMME = "SAGE_FEMME"
    MEDECIN    = "MEDECIN"


class TypeAlerte(str, enum.Enum):
    SMS         = "SMS"
    APPLICATION = "APPLICATION"


class StatutAlerte(str, enum.Enum):
    ENVOYE = "ENVOYE"
    ECHEC  = "ECHEC"


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id               = Column(Integer, primary_key=True, index=True)
    nom              = Column(String(100), nullable=False)
    prenom           = Column(String(100), nullable=False)
    tel              = Column(String(20), unique=True, nullable=False)
    password         = Column(String(255), nullable=False)
    type_utilisateur = Column(String(50), nullable=False)

    __mapper_args__ = {
        "polymorphic_on":       type_utilisateur,
        "polymorphic_identity": "utilisateur",
    }


class Patiente(Utilisateur):
    __tablename__ = "patientes"

    id                  = Column(Integer, ForeignKey("utilisateurs.id"), primary_key=True)
    date_derniere_regle = Column(Date, nullable=True)
    langue_prefere      = Column(String(50), default="fr")
    zone_geographique   = Column(String(150), nullable=True)

    dossier = relationship("DossierMedical", back_populates="patiente", uselist=False)

    __mapper_args__ = {"polymorphic_identity": "patiente"}


class PersonnelMedical(Utilisateur):
    __tablename__ = "personnel_medical"

    id        = Column(Integer, ForeignKey("utilisateurs.id"), primary_key=True)
    matricule = Column(String(50), unique=True, nullable=False)
    role      = Column(SAEnum(RolePersonnel), nullable=False)

    dossiers_realises = relationship(
        "DossierMedical", back_populates="personnel",
        foreign_keys="DossierMedical.personnel_id",
    )

    __mapper_args__ = {"polymorphic_identity": "personnel_medical"}


class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"

    id             = Column(Integer, primary_key=True, index=True)
    code_dossier   = Column(String(50), unique=True, nullable=False)
    groupe_sanguin = Column(String(5), nullable=True)
    antecedents    = Column(Text, nullable=True)
    date_creation  = Column(Date, default=date.today)
    patiente_id    = Column(Integer, ForeignKey("patientes.id"), nullable=False)
    personnel_id   = Column(Integer, ForeignKey("personnel_medical.id"), nullable=True)

    patiente  = relationship("Patiente", back_populates="dossier")
    personnel = relationship(
        "PersonnelMedical", back_populates="dossiers_realises",
        foreign_keys=[personnel_id],
    )
    consultations = relationship("Consultation", back_populates="dossier")


class Consultation(Base):
    __tablename__ = "consultations"

    id                      = Column(Integer, primary_key=True, index=True)
    date_consultation       = Column(Date, nullable=False, default=date.today)
    poids                   = Column(Float, nullable=True)
    tension                 = Column(String(20), nullable=True)
    rythme_cardiaque_foetal = Column(String(20), nullable=True)
    observations            = Column(Text, nullable=True)
    dossier_id              = Column(Integer, ForeignKey("dossiers_medicaux.id"), nullable=False)

    dossier = relationship("DossierMedical", back_populates="consultations")
    alertes = relationship("Alerte", back_populates="consultation")


class Alerte(Base):
    __tablename__ = "alertes"

    id              = Column(Integer, primary_key=True, index=True)
    message         = Column(Text, nullable=False)
    date_envoi      = Column(DateTime, default=datetime.utcnow)
    type            = Column(SAEnum(TypeAlerte), nullable=False)
    statut          = Column(SAEnum(StatutAlerte), default=StatutAlerte.ENVOYE)
    consultation_id = Column(Integer, ForeignKey("consultations.id"), nullable=True)

    consultation = relationship("Consultation", back_populates="alertes")


# ══════════════════════════════════════════════════════════════════════════════
# 4. SCHÉMAS PYDANTIC
# ══════════════════════════════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    tel:      str
    password: str


class TokenResponse(BaseModel):
    access_token:     str
    token_type:       str = "bearer"
    utilisateur_id:   int
    type_utilisateur: str


class UtilisateurOut(BaseModel):
    id:               int
    nom:              str
    prenom:           str
    tel:              str
    type_utilisateur: str
    model_config = {"from_attributes": True}


class PatienteCreate(BaseModel):
    nom:                str
    prenom:             str
    tel:                str
    password:           str
    date_derniere_regle: Optional[date] = None
    langue_prefere:      Optional[str]  = "fr"
    zone_geographique:   Optional[str]  = None


class PatienteOut(UtilisateurOut):
    date_derniere_regle: Optional[date] = None
    langue_prefere:      Optional[str]  = None
    zone_geographique:   Optional[str]  = None
    model_config = {"from_attributes": True}


class PersonnelCreate(BaseModel):
    nom:       str
    prenom:    str
    tel:       str
    password:  str
    matricule: str
    role:      RolePersonnel


class PersonnelOut(UtilisateurOut):
    matricule: str
    role:      RolePersonnel
    model_config = {"from_attributes": True}


class DossierCreate(BaseModel):
    code_dossier:   str
    groupe_sanguin: Optional[str] = None
    antecedents:    Optional[str] = None
    patiente_id:    int
    personnel_id:   Optional[int] = None


class DossierOut(DossierCreate):
    id:            int
    date_creation: date
    model_config = {"from_attributes": True}


class ConsultationCreate(BaseModel):
    date_consultation:       Optional[date]  = None
    poids:                   Optional[float] = None
    tension:                 Optional[str]   = None
    rythme_cardiaque_foetal: Optional[str]   = None
    observations:            Optional[str]   = None
    dossier_id:              int


class ConsultationOut(ConsultationCreate):
    id: int
    model_config = {"from_attributes": True}


class AlerteCreate(BaseModel):
    message:         str
    type:            TypeAlerte
    consultation_id: Optional[int] = None


class AlerteOut(AlerteCreate):
    id:         int
    date_envoi: datetime
    statut:     StatutAlerte
    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# 5. SÉCURITÉ (JWT + bcrypt)
# ══════════════════════════════════════════════════════════════════════════════

pwd_context    = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme  = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire    = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(
    token: str     = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> Utilisateur:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get(Utilisateur, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user


# ══════════════════════════════════════════════════════════════════════════════
# 6. APPLICATION FASTAPI
# ══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Yaay Booy API",
    description="API de suivi de grossesse — Sage-femme & Médecin",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# 7. ROUTES — AUTH
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Yaay Booy API opérationnelle 🤱"}


@app.post("/api/auth/register/patiente",
          response_model=PatienteOut, status_code=201, tags=["Auth"])
def register_patiente(data: PatienteCreate, db: Session = Depends(get_db)):
    if db.query(Utilisateur).filter(Utilisateur.tel == data.tel).first():
        raise HTTPException(400, "Numéro de téléphone déjà utilisé.")
    patiente = Patiente(
        nom=data.nom, prenom=data.prenom, tel=data.tel,
        password=hash_password(data.password),
        date_derniere_regle=data.date_derniere_regle,
        langue_prefere=data.langue_prefere,
        zone_geographique=data.zone_geographique,
    )
    db.add(patiente); db.commit(); db.refresh(patiente)
    return patiente


@app.post("/api/auth/register/personnel",
          response_model=PersonnelOut, status_code=201, tags=["Auth"])
def register_personnel(data: PersonnelCreate, db: Session = Depends(get_db)):
    if db.query(Utilisateur).filter(Utilisateur.tel == data.tel).first():
        raise HTTPException(400, "Numéro de téléphone déjà utilisé.")
    if db.query(PersonnelMedical).filter(PersonnelMedical.matricule == data.matricule).first():
        raise HTTPException(400, "Matricule déjà utilisé.")
    personnel = PersonnelMedical(
        nom=data.nom, prenom=data.prenom, tel=data.tel,
        password=hash_password(data.password),
        matricule=data.matricule, role=data.role,
    )
    db.add(personnel); db.commit(); db.refresh(personnel)
    return personnel


@app.post("/api/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.tel == data.tel).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(401, "Numéro ou mot de passe incorrect.")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        utilisateur_id=user.id,
        type_utilisateur=user.type_utilisateur,
    )


@app.get("/api/auth/me", response_model=UtilisateurOut, tags=["Auth"])
def me(current_user: Utilisateur = Depends(get_current_user)):
    return current_user


# ══════════════════════════════════════════════════════════════════════════════
# 8. ROUTES — DOSSIERS MÉDICAUX
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/dossiers",
          response_model=DossierOut, status_code=201, tags=["Dossiers"])
def creer_dossier(data: DossierCreate, db: Session = Depends(get_db),
                  _=Depends(get_current_user)):
    if db.query(DossierMedical).filter(
            DossierMedical.code_dossier == data.code_dossier).first():
        raise HTTPException(400, "Code dossier déjà existant.")
    dossier = DossierMedical(**data.model_dump())
    db.add(dossier); db.commit(); db.refresh(dossier)
    return dossier


@app.get("/api/dossiers/patiente/{patiente_id}",
         response_model=DossierOut, tags=["Dossiers"])
def get_dossier_by_patiente(patiente_id: int, db: Session = Depends(get_db),
                             _=Depends(get_current_user)):
    dossier = db.query(DossierMedical).filter(
        DossierMedical.patiente_id == patiente_id).first()
    if not dossier:
        raise HTTPException(404, "Aucun dossier pour cette patiente.")
    return dossier


@app.get("/api/dossiers/{dossier_id}",
         response_model=DossierOut, tags=["Dossiers"])
def get_dossier(dossier_id: int, db: Session = Depends(get_db),
                _=Depends(get_current_user)):
    dossier = db.get(DossierMedical, dossier_id)
    if not dossier:
        raise HTTPException(404, "Dossier introuvable.")
    return dossier


# ══════════════════════════════════════════════════════════════════════════════
# 9. ROUTES — CONSULTATIONS
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/consultations",
          response_model=ConsultationOut, status_code=201, tags=["Consultations"])
def creer_consultation(data: ConsultationCreate, db: Session = Depends(get_db),
                       _=Depends(get_current_user)):
    consultation = Consultation(**data.model_dump())
    db.add(consultation); db.commit(); db.refresh(consultation)
    return consultation


@app.get("/api/consultations/dossier/{dossier_id}",
         response_model=List[ConsultationOut], tags=["Consultations"])
def get_consultations_dossier(dossier_id: int, db: Session = Depends(get_db),
                               _=Depends(get_current_user)):
    return db.query(Consultation).filter(
        Consultation.dossier_id == dossier_id).all()


@app.get("/api/consultations/{consultation_id}",
         response_model=ConsultationOut, tags=["Consultations"])
def get_consultation(consultation_id: int, db: Session = Depends(get_db),
                     _=Depends(get_current_user)):
    c = db.get(Consultation, consultation_id)
    if not c:
        raise HTTPException(404, "Consultation introuvable.")
    return c


# ══════════════════════════════════════════════════════════════════════════════
# 10. ROUTES — ALERTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/alertes",
          response_model=AlerteOut, status_code=201, tags=["Alertes"])
def creer_alerte(data: AlerteCreate, db: Session = Depends(get_db),
                 _=Depends(get_current_user)):
    alerte = Alerte(**data.model_dump())
    db.add(alerte); db.commit(); db.refresh(alerte)
    return alerte


@app.get("/api/alertes/consultation/{consultation_id}",
         response_model=List[AlerteOut], tags=["Alertes"])
def get_alertes_consultation(consultation_id: int, db: Session = Depends(get_db),
                              _=Depends(get_current_user)):
    return db.query(Alerte).filter(
        Alerte.consultation_id == consultation_id).all()


@app.get("/api/alertes/{alerte_id}",
         response_model=AlerteOut, tags=["Alertes"])
def get_alerte(alerte_id: int, db: Session = Depends(get_db),
               _=Depends(get_current_user)):
    alerte = db.get(Alerte, alerte_id)
    if not alerte:
        raise HTTPException(404, "Alerte introuvable.")
    return alerte
