-- Table: public.filieres

-- DROP TABLE IF EXISTS public.filieres;

CREATE TABLE IF NOT EXISTS public.filieres
(
    id integer NOT NULL DEFAULT nextval('filieres_id_seq'::regclass),
    nom character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT filieres_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.filieres
    OWNER to postgres;

-- Trigger: update_filieres_timestamp

-- DROP TRIGGER IF EXISTS update_filieres_timestamp ON public.filieres;

CREATE OR REPLACE TRIGGER update_filieres_timestamp
    BEFORE UPDATE 
    ON public.filieres
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();


    -- Table: public.utilisateurs

-- DROP TABLE IF EXISTS public.utilisateurs;

CREATE TABLE IF NOT EXISTS public.utilisateurs
(
    id integer NOT NULL DEFAULT nextval('utilisateurs_id_seq'::regclass),
    nom character varying(100) COLLATE pg_catalog."default" NOT NULL,
    prenom character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telephone character varying(20) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    matricule character varying(20) COLLATE pg_catalog."default" NOT NULL,
    filiere_id integer,
    role character varying(10) COLLATE pg_catalog."default" NOT NULL DEFAULT 'etudiant'::character varying,
    mot_de_passe character varying(255) COLLATE pg_catalog."default" NOT NULL,
    whatsapp character varying(20) COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT utilisateurs_pkey PRIMARY KEY (id),
    CONSTRAINT utilisateurs_email_key UNIQUE (email),
    CONSTRAINT utilisateurs_matricule_key UNIQUE (matricule),
    CONSTRAINT utilisateurs_role_check CHECK (role::text = ANY (ARRAY['etudiant'::character varying, 'admin'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.utilisateurs
    OWNER to postgres;

-- Trigger: update_utilisateurs_timestamp

-- DROP TRIGGER IF EXISTS update_utilisateurs_timestamp ON public.utilisateurs;

CREATE OR REPLACE TRIGGER update_utilisateurs_timestamp
    BEFORE UPDATE 
    ON public.utilisateurs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();