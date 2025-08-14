#!/bin/bash

# Script para executar migrations manualmente no Railway
# Use este script se as migrations não foram executadas automaticamente

echo "🚀 Executando migrations no Railway..."

# Definir ambiente de produção
export NODE_ENV=production

# Executar migrations
npm run db:migrate

echo "✅ Migrations executadas com sucesso!"
echo "🔄 Verificando status..."

# Verificar status
npm run db:migrate:status

echo "🎉 Deploy concluído!"
