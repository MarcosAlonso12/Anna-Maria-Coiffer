# Publicar a loja independente

Este guia publica o site fora da hospedagem anterior. O código fica no GitHub e a aplicação roda na sua conta Cloudflare, com endereço `workers.dev` ou domínio próprio. Os visitantes abrem o link normalmente, sem conta em plataformas de IA.

## 1. Preparar a conta

1. Entre em https://dash.cloudflare.com/ e crie uma conta caso ainda não tenha.
2. Ative Workers & Pages e R2. O R2 pode pedir dados de faturamento mesmo com uso pequeno. Confira os preços e limites da sua conta antes de confirmar qualquer contratação.
3. No computador, instale Git e Node.js 22.13 ou superior. No PowerShell, clone o repositório e instale as dependências conforme o README.
4. Execute `npx wrangler login`. A autorização ocorre no seu navegador; não envie senha ou token nesta conversa nem ao GitHub.

## 2. Criar os recursos

No terminal da pasta do projeto:

```sh
npx wrangler d1 create anna-maria-db
npx wrangler r2 bucket create anna-maria-arquivos
```

O primeiro comando informa um `database_id`. Em `wrangler.jsonc`, acrescente esse identificador ao objeto que tem `binding: "DB"`. Use o ID real retornado pela sua conta, nunca um valor inventado. Exemplo do formato, sem valor real:

```json
{
  "binding": "DB",
  "database_name": "anna-maria-db",
  "database_id": "COLE-O-ID-RETORNADO",
  "migrations_dir": "drizzle"
}
```

O ID do banco e o nome do bucket são configurações, não senhas. Confirme também o nome do Worker e do bucket em `wrangler.jsonc`. Faça commit dessa configuração. Se um recurso com esse nome já existir, confira se é realmente o recurso desta loja antes de usá-lo; não apague um recurso existente para resolver conflito de nome.

O botão alternativo **Deploy to Cloudflare** no README pode criar os recursos durante a instalação. Nesse fluxo, confira as configurações e os comandos detectados. Ele cria uma cópia do repositório; passe a atualizar a cópia criada, não um repositório diferente.

## 3. Configurar os segredos

Gere **dois** valores diferentes, executando duas vezes no terminal:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarde os valores em um gerenciador de senhas. Cadastre os segredos no Worker usando os comandos abaixo. Cada comando pede o valor em uma entrada protegida:

```sh
npx wrangler secret put SESSION_SECRET
npx wrangler secret put SETUP_TOKEN
```

Se o Worker ainda não existir e o comando oferecer criá-lo, confira o nome `anna-maria-coiffer`. Também é possível cadastrar esses valores como **Secret** nas configurações do Worker no painel. Não use texto aberto no código. `SESSION_SECRET` protege senhas e identificadores; preserve seu valor ao atualizar. `SETUP_TOKEN` só permite o primeiro cadastro administrativo.

## 4. Primeira publicação

```sh
npm test
npm run deploy
```

`npm run deploy` aplica as migrações no D1 remoto e publica o Worker com os arquivos públicos. O terminal retorna o endereço real. Abra esse endereço; não deduza o endereço a partir do nome do repositório.

Se aparecer erro de banco inexistente, confira o `database_id` e a conta autenticada. Se faltar um segredo, configure-o e publique novamente. Se o erro for R2, confira se o serviço está ativado e se o nome do bucket é correto.

## 5. Criar o administrador

1. Abra o site publicado e clique em **Entrar → Configurar primeiro administrador**.
2. Cole o `SETUP_TOKEN`, informe seu nome, e-mail e uma senha de pelo menos 12 caracteres.
3. O sistema cria uma única conta administrativa inicial e fecha esse cadastro, mesmo que a chave continue configurada.
4. Remova o segredo de instalação no painel ou execute `npx wrangler secret delete SETUP_TOKEN`.
5. Em **Usuários**, cadastre sua mãe como Administrador, com e-mail e senha inicial próprios. Ela deve alterar a senha em **Minha conta**. O cadastro não envia e-mail.
6. Mantenha pelo menos duas pessoas responsáveis com acesso administrativo e guarde o acesso à conta de hospedagem.

Clientes podem criar contas próprias ou comprar sem cadastro. O e-mail não é confirmado automaticamente. Não use o simples conhecimento de um e-mail como prova de identidade ao redefinir senha.

## 6. Preparar para vender

Em Minha conta, configure WhatsApp com `55`, DDD e número, e as instruções de retirada. Cadastre fotos reais, preços, custos e quantidades. A loja começa sem produtos e com pedidos pausados. Ative o recebimento somente após conferir o estoque.

Faça um teste em outro navegador ou celular: abra o catálogo, envie um pedido, confira se aparece no painel e se o estoque diminui. Cancele esse pedido e confira a devolução do estoque. Teste também o login de cliente para conferir seu histórico.

O site registra pedidos; o pagamento é combinado e confirmado manualmente. Não há processamento de cartão. A nota fiscal é emitida no serviço fiscal da loja, e o XML autorizado pode ser anexado à venda.

## 7. Atualizar pelo GitHub

Na Cloudflare, abra o Worker → Settings/Builds e conecte `MarcosAlonso12/Anna-Maria-Coiffer`. Se estiver começando pela importação de repositório, selecione esse mesmo repositório na criação. Use:

| Configuração | Valor |
| --- | --- |
| Branch de produção | `main` |
| Pasta raiz | `/` |
| Instalação | `npm ci` |
| Build | `npm test` |
| Deploy | `npm run deploy` |

Os nomes de menus podem variar. Confira os comandos antes de salvar. Se o painel pedir permissões da integração, conceda acesso a este repositório. Recursos e segredos devem estar associados ao Worker correto. Não configure uma segunda aplicação com outro banco sem intenção.

Após essa conexão, um commit na branch de produção inicia a publicação automática. Veja o resultado em Builds; um commit salvo no GitHub, sozinho, não garante que a publicação terminou. Se usar o botão de cópia, conecte a cópia correspondente.

Para modificar: crie uma branch, faça a alteração, execute `npm test`, revise e só então mescle na `main`. Para homologação, use **outro banco e outro bucket**. Não aplique testes de cadastro/venda no banco real. Migrações novas devem ser incrementais; não reescreva migrações já aplicadas. Reverter apenas o código não reverte automaticamente o banco.

## 8. Domínio próprio

Depois que o endereço padrão funcionar, você pode registrar um domínio na sua conta. No Worker, abra Settings → Domains & Routes → Add → Custom Domain e siga as instruções de DNS da Cloudflare. O domínio precisa estar sob seu controle. O projeto usa caminhos relativos, por isso catálogo e API ficam juntos no novo domínio sem editar cada link.

Não há domínio comprado ou configurado por esta alteração. O endereço definitivo só existe após a publicação ou vinculação confirmada.

## 9. Dados da instalação anterior

Esta migração prepara o código e **não transfere dados ou arquivos automaticamente**. O banco de uma nova conta começa vazio. Antes de divulgar o novo link, veja se há cadastros/pedidos reais na instalação anterior.

Se houver dados reais, pause novos pedidos por uma janela combinada, faça backup do banco e dos objetos, planeje uma importação preservando IDs de usuários, produtos, pedidos e nomes de arquivos, e valide totais e estoque. Contas antigas precisam receber senhas próprias; sessões antigas devem ser descartadas. Não cole exports de clientes em issues, commits ou repositórios públicos. O JSON gerencial do painel não inclui fotos/XMLs e não possui restaurador automático.

A instalação anterior permanece separada. Depois da validação e migração, desative pedidos no endereço antigo e divulgue apenas o novo, para não vender sobre dois estoques diferentes.

## 10. Backup e recuperação

Exporte regularmente o D1 com as ferramentas da Cloudflare e mantenha cópia dos objetos R2 em local privado. Exemplo para o banco:

```sh
npx wrangler d1 export DB --remote --output=backup-loja.sql
```

Salve o arquivo **fora do repositório** e mantenha acesso restrito. Esse arquivo contém dados pessoais e hashes de senha. A exportação gerencial do painel não inclui hashes, sessões nem arquivos e não substitui o backup completo.

Para senha esquecida, outro administrador pode redefinir em Usuários, após confirmar a identidade. Não há recuperação automática por e-mail. Se todos perderem acesso, a recuperação requer o responsável técnico com acesso ao banco e à conta de hospedagem; não reabra o primeiro cadastro nem crie senha pública padrão.

## Referências de hospedagem

- https://developers.cloudflare.com/workers/platform/deploy-buttons/
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/d1/get-started/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
