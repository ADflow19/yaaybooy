-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║              YAAY BOOY — Script SQL (MySQL)                            ║
-- ║              Application de suivi de grossesse                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

CREATE DATABASE IF NOT EXISTS yaay_booy
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE yaay_booy;

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : utilisateurs  (classe de base — héritage polymorphique)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS utilisateurs (
    id                 INT          NOT NULL AUTO_INCREMENT,
    nom                VARCHAR(100) NOT NULL,
    prenom             VARCHAR(100) NOT NULL,
    tel                VARCHAR(20)  NOT NULL,
    password           VARCHAR(255) NOT NULL,
    type_utilisateur   VARCHAR(50)  NOT NULL,   -- 'patiente' | 'personnel_medical'

    PRIMARY KEY (id),
    UNIQUE KEY uq_utilisateurs_tel (tel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : patientes
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS patientes (
    id                   INT         NOT NULL,
    date_derniere_regle  DATE,
    langue_prefere       VARCHAR(50) DEFAULT 'fr',
    zone_geographique    VARCHAR(150),

    PRIMARY KEY (id),
    CONSTRAINT fk_patientes_utilisateur
        FOREIGN KEY (id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : personnel_medical
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personnel_medical (
    id         INT         NOT NULL,
    matricule  VARCHAR(50) NOT NULL,
    role       ENUM('SAGE_FEMME', 'MEDECIN') NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_personnel_matricule (matricule),
    CONSTRAINT fk_personnel_utilisateur
        FOREIGN KEY (id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : dossiers_medicaux
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dossiers_medicaux (
    id              INT         NOT NULL AUTO_INCREMENT,
    code_dossier    VARCHAR(50) NOT NULL,
    groupe_sanguin  VARCHAR(5),
    antecedents     TEXT,
    date_creation   DATE        NOT NULL DEFAULT (CURRENT_DATE),
    patiente_id     INT         NOT NULL,
    personnel_id    INT,

    PRIMARY KEY (id),
    UNIQUE KEY uq_dossier_code (code_dossier),
    CONSTRAINT fk_dossier_patiente
        FOREIGN KEY (patiente_id) REFERENCES patientes(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_dossier_personnel
        FOREIGN KEY (personnel_id) REFERENCES personnel_medical(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : consultations
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS consultations (
    id                      INT         NOT NULL AUTO_INCREMENT,
    date_consultation       DATE        NOT NULL DEFAULT (CURRENT_DATE),
    poids                   FLOAT,
    tension                 VARCHAR(20),
    rythme_cardiaque_foetal VARCHAR(20),
    observations            TEXT,
    dossier_id              INT         NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_consultation_dossier
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE : alertes
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alertes (
    id               INT      NOT NULL AUTO_INCREMENT,
    message          TEXT     NOT NULL,
    date_envoi       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type             ENUM('SMS', 'APPLICATION') NOT NULL,
    statut           ENUM('ENVOYE', 'ECHEC')    NOT NULL DEFAULT 'ENVOYE',
    consultation_id  INT,

    PRIMARY KEY (id),
    CONSTRAINT fk_alerte_consultation
        FOREIGN KEY (consultation_id) REFERENCES consultations(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ══════════════════════════════════════════════════════════════════════════════
-- DONNÉES DE TEST
-- ══════════════════════════════════════════════════════════════════════════════

-- Personnel médical (mot de passe : "password123" — bcrypt, à régénérer via l'API)
INSERT INTO utilisateurs (nom, prenom, tel, password, type_utilisateur) VALUES
    ('Diallo',  'Mariama', '771000001', '$2b$12$placeholder_hash_sagefemme', 'personnel_medical'),
    ('Ndiaye',  'Abdou',   '771000002', '$2b$12$placeholder_hash_medecin',   'personnel_medical');

INSERT INTO personnel_medical (id, matricule, role) VALUES
    (1, 'SF-001', 'SAGE_FEMME'),
    (2, 'MD-001', 'MEDECIN');

-- Patiente de test
INSERT INTO utilisateurs (nom, prenom, tel, password, type_utilisateur) VALUES
    ('Sow', 'Fatou', '771000010', '$2b$12$placeholder_hash_patiente', 'patiente');

INSERT INTO patientes (id, date_derniere_regle, langue_prefere, zone_geographique) VALUES
    (3, '2026-03-01', 'fr', 'Dakar - Médina');

-- Dossier médical
INSERT INTO dossiers_medicaux (code_dossier, groupe_sanguin, antecedents, patiente_id, personnel_id) VALUES
    ('DOS-2026-001', 'A+', 'Aucun antécédent notable', 3, 1);

-- Consultation initiale
INSERT INTO consultations (date_consultation, poids, tension, rythme_cardiaque_foetal, observations, dossier_id) VALUES
    ('2026-05-20', 68.5, '12/8', '140 bpm', 'Grossesse évolutive normale. Vitamines prescrites.', 1);

-- Alerte SMS associée
INSERT INTO alertes (message, type, statut, consultation_id) VALUES
    ('Rappel : prenez vos vitamines quotidiennement et revenez dans 4 semaines.', 'SMS', 'ENVOYE', 1);
