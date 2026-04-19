-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL DEFAULT 'general',
    "type" TEXT NOT NULL DEFAULT 'image',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'template',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
