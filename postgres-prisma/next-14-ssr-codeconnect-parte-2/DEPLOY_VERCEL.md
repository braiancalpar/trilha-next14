# Deploy na Vercel

Este projeto usa Prisma 7 e espera uma única variável de ambiente:

```text
DATABASE_URL
```

Não use as variáveis `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` da aula. Elas pertencem à integração antiga Vercel Postgres, que não é mais oferecida para novos bancos.

## 1. Preparar o repositório

O arquivo `.env` é exclusivamente local e não deve ser enviado ao Git. Antes do primeiro push, confira:

```powershell
git status
git add package.json .gitignore src/logger.js DEPLOY_VERCEL.md prisma
git commit -m "chore: preparar deploy na vercel"
git push origin main
```

As migrations em `prisma/migrations` precisam estar versionadas. Este projeto já possui a migration inicial.

## 2. Criar o projeto na Vercel

1. Em [Vercel](https://vercel.com/new), importe `braiancalpar/trilha-next14`.
2. Em **Root Directory**, selecione exatamente:

   ```text
   postgres-prisma/next-14-ssr-codeconnect-parte-2
   ```

3. Mantenha o preset **Next.js** e o comando de build padrão (`npm run build`). Não sobrescreva o comando para incluir migrations ou seed.
4. Faça o primeiro deploy. Ele pode subir sem posts, pois o banco ainda não estará conectado.

## 3. Conectar o banco

No projeto Vercel, abra **Storage** (ou **Marketplace**) e instale a integração **Prisma Postgres**. Conecte-a ao projeto e mantenha o nome de variável padrão `DATABASE_URL`.

Essa integração injeta `DATABASE_URL` nos ambientes da Vercel. Não copie a URL para o Git nem a exponha com o prefixo `NEXT_PUBLIC_`.

## 4. Aplicar schema e dados iniciais localmente

As variáveis criadas pela integração são marcadas como **Sensitive**. Por isso, `vercel env pull` salva o placeholder `<encrypted>` e não pode ser usado para migrations locais.

Na tela do banco em **Storage**, clique em **Show secret** e depois em **Copy Snippet**. Não compartilhe essas URLs. Faça uma cópia do seu `.env` local (do Docker), substitua temporariamente o conteúdo dele pelo snippet copiado e execute:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
npm.cmd run db:deploy
npx.cmd prisma generate
npm.cmd run db:seed
```

O primeiro comando remove uma variável temporária da sessão do PowerShell, caso ela tenha sido configurada antes. Sem ele, essa variável tem prioridade sobre o `.env` e pode apontar para o placeholder `<encrypted>`. Ao terminar, restaure o `.env` local do Docker. `db:deploy` usa `prisma migrate deploy`, o comando não interativo apropriado para produção. Nunca troque por `prisma migrate dev` neste passo.

Na Vercel, mantenha o **Build Command** padrão:

```text
npm run build
```

## 5. Validar

Na Vercel, faça **Redeploy** (ou envie um commit vazio) e abra a URL de produção. A home deve mostrar os posts; teste uma busca, a paginação e a página de detalhes.

## Atualizações futuras do banco

1. Localmente, altere `prisma/schema.prisma`.
2. Crie e teste uma migration com `npx prisma migrate dev --name descricao` usando o Docker local.
3. Versione a nova pasta em `prisma/migrations` e faça push.
4. Repita localmente o passo de `db:deploy` com o snippet da base de produção e faça um redeploy na Vercel.
