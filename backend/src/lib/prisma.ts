import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Prisma Singleton — verhindert mehrere DB-Connections in der Applikation.
 *
 * Problem ohne Singleton:
 *   - Jedes routes/*.ts erstellt eine eigene PrismaClient-Instanz
 *   - SQLite erlaubt nur einen Writer gleichzeitig → Write-Lock-Konflikte unter Last
 *
 * Mit Singleton:
 *   - Eine gemeinsame Connection für alle Routes
 *   - Korrekte Connection-Lebensdauer
 */
export const prisma = global.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Im Dev-Modus: Singleton auf global speichern,
// damit tsx watch keine neuen Instanzen bei Hot-Reload erstellt
if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
