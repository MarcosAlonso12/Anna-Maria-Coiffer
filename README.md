# Anna Maria Coiffer

Loja de perfumes e cuidados com catálogo público, sacola, pedidos, estoque, usuários, gastos mensais e relatórios. Acesso por e-mail e senha da própria loja; clientes também podem pedir sem conta.

**Estado da migração:** esta versão está preparada para hospedagem independente. A configuração da conta Cloudflare e a primeira publicação ainda precisam ser feitas pelo proprietário. Atualizar este repositório não altera a instalação anterior nem transfere seu banco de dados.

## Colocar online

O caminho recomendado para Marcos é conectar **este repositório existente** no painel Cloudflare → Workers & Pages → criar aplicação → importar repositório GitHub. Use a branch `main`, raiz `/`, comando de build `npm run build` e comando de deploy `npm run deploy`.

O [tutorial completo de instalação e publicação](docs/PUBLICAR.md) mostra banco, arquivos, segredos, primeiro administrador, atualizações e domínio próprio.

Para criar uma instalação separada (por exemplo, para um novo cliente), há também o botão abaixo. Ele **copia o repositório**, portanto a cópia passa a ser a origem das atualizações daquela instalação:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/MarcosAlonso12/Anna-Maria-Coiffer)

## O que está incluído

- Catálogo público responsivo, fotos e sacola; pedidos sem cadastro obrigatório.
- Contas próprias da loja e primeiro administrador protegido por chave de instalação.
- Cadastro de produtos, custos e estoque com reserva transacional.
- Pedidos e histórico restritos ao cliente correspondente; administração separada por permissão no servidor.
- Recebimentos manuais, cancelamentos, gastos mensais e relatório exportável.
- Anexo de XML fiscal emitido externamente e exportação gerencial de dados.
- Páginas de ajuda e privacidade, sem scripts ou fontes de terceiros.

## Desenvolvimento no computador

Instale Node.js 22.13 ou superior e Git. No terminal:

```sh
git clone https://github.com/MarcosAlonso12/Anna-Maria-Coiffer.git
cd Anna-Maria-Coiffer
npm ci
```

Copie `.dev.vars.example` para `.dev.vars` e preencha os dois segredos com valores aleatórios diferentes de pelo menos 32 caracteres. Não envie esse arquivo ao GitHub.

```sh
npm run db:local
npm run dev
```

Abra o endereço local exibido no terminal. A primeira conta é criada em **Entrar → Configurar primeiro administrador**, usando a chave `SETUP_TOKEN`. Os dados locais são independentes da produção.

```sh
npm test
```

O teste inclui checagem de TypeScript, empacotamento sem publicação, relatórios e API com banco/arquivos locais descartáveis. Não acessa o banco de produção.

## Estrutura

- `public/`: páginas HTML, interface JavaScript e estilos.
- `src/`: API TypeScript e autenticação; executadas no servidor Cloudflare Workers.
- `drizzle/`: migrações SQL incrementais do banco D1.
- `wrangler.jsonc`: configuração da hospedagem e vínculos de banco/arquivos.
- `tests/`: testes de regras e integração.
- `docs/PUBLICAR.md`: instalação, publicação e manutenção.

Não existem dependências de IA, login de terceiros ou chamadas a modelos na aplicação. O banner usa tipografia e CSS; cadastre fotografias reais dos produtos. O histórico Git conserva as versões antigas para recuperação.

## Limites da versão

Pagamentos são confirmados manualmente. Não há cobrança automática, cálculo de frete, emissão automática de nota fiscal, confirmação de e-mail ou recuperação automática de senha por e-mail. Clientes devem procurar a loja para recuperação; administradores podem redefinir uma senha após confirmar a identidade por outro meio. A compra usa retirada a combinar.

A senha usa PBKDF2-SHA-256, sal individual e segredo de servidor. Há limitação de tentativas, cookies HttpOnly/Secure, proteção de origem/CSRF e rotação de sessão. Não altere `SESSION_SECRET` sem planejar recuperação das senhas: ele participa dos hashes.

O relatório é gerencial. A emissão fiscal é feita no emissor externo. A importação do XML confere campos básicos e não valida assinatura digital. Nenhuma informação de cartão deve ser inserida na loja.

## Atualizações e uso em outros projetos

Após configurar Workers Builds no repositório de produção, commits na branch configurada iniciam o build e a publicação. Teste mudanças em outra branch; use banco e bucket separados para homologação. Faça backup do D1 e R2 antes de migrações. Nunca publique segredos, banco de clientes ou XMLs fiscais no GitHub.

Para outro cliente, crie uma instalação com repositório, banco, bucket, segredos, domínio e administradores próprios. Consulte [o guia de entrega](docs/ENTREGA-CLIENTES.md).
