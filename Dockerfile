# Utiliser Node.js comme image de base
FROM node:23-slim

# Installer Bun
RUN curl -fsSL https://bun.sh/install | bash

# Ajouter Bun au PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Commande par défaut
CMD ["bun", "run", "goal"]