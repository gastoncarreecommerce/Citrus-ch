-- Agrega el campo imagenUrl a Espacio (imagen/creatividad de referencia que
-- ve el seller). Correr en el SQL Editor de Neon si no se tiene acceso a
-- una terminal local para `npm run db:push`.

ALTER TABLE "Espacio" ADD COLUMN "imagenUrl" TEXT;
