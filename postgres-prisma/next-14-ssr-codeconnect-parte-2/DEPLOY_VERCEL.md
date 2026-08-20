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

## 4. Aplicar schema e dados iniciais no build da Vercel

As variáveis criadas pela integração são marcadas como **Sensitive**. A Vercel as disponibiliza durante o build e a execução da aplicação, mas não permite exportá-las para um arquivo local. Portanto, não use `vercel env pull` para executar migrations deste banco localmente: o arquivo conterá o placeholder `<encrypted>`.

No projeto Vercel, abra **Settings > Build and Deployment**. Em **Build Command**, ative o override e informe:

```text
npm run db:deploy && npm run db:seed && npm run build
```

Em seguida, faça um redeploy. A Vercel executará a migration e o seed com a credencial real, sem revelá-la. O seed deste projeto usa `upsert`, então pode ser reexecutado sem duplicar os posts.

`db:deploy` usa `prisma migrate deploy`: é o comando não interativo apropriado para produção. Nunca troque por `prisma migrate dev` na Vercel.

## 5. Validar

Na Vercel, faça **Redeploy** (ou envie um commit vazio) e abra a URL de produção. A home deve mostrar os posts; teste uma busca, a paginação e a página de detalhes.

## Atualizações futuras do banco

1. Localmente, altere `prisma/schema.prisma`.
2. Crie e teste uma migration com `npx prisma migrate dev --name descricao` usando o Docker local.
3. Versione a nova pasta em `prisma/migrations` e faça push.
4. Faça um redeploy na Vercel. O comando de build aplicará as migrations pendentes.
