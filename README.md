# Anna Maria Coiffer

Loja online de perfumes e cuidados, com catálogo público, pedidos, estoque, administração de vendas e gastos mensais.

**Site:** https://anna-maria-coiffer.marcosbrpsr.chatgpt.site

## Primeiro uso

1. O proprietário entra no site com a conta ChatGPT vinculada ao ambiente de hospedagem.
2. Em Minha conta → Configurar atendimento, cadastra WhatsApp e condições de retirada.
3. Em Produtos e estoque, cadastra os produtos reais, preços, custos, fotos e quantidades.
4. Quando estiver tudo conferido, abre o recebimento de pedidos em Configurar atendimento.
5. Para dar acesso a outro administrador, cadastra o e-mail utilizado por essa pessoa no ChatGPT, em Usuários.

A loja começa vazia e com pedidos pausados. Não há usuários, senhas nem produtos de demonstração em produção. A imagem editorial do catálogo é ilustrativa e não representa um produto à venda.

## Clientes

O cliente pode enviar um pedido sem criar conta. O histórico anônimo é associado a um cookie seguro no mesmo navegador. Login opcional com ChatGPT permite histórico entre dispositivos. A loja não armazena senhas. O pagamento e a retirada são combinados com a loja; marcar o pedido como recebido depende de conferência manual.

Pedidos pendentes reservam estoque por até 48 horas e são liberados na próxima consulta/operação após a expiração. As regras de estoque são transacionais no banco, impedindo venda acima da disponibilidade. Um identificador por tentativa evita duplicação em reenvios.

## Administração

- Produtos, fotos, custos, preços, quantidade disponível e arquivamento.
- Pedidos, confirmação de recebimento, cancelamento e comprovante sem valor fiscal.
- Contas de clientes e administradores, com bloqueio de acesso.
- Gastos por mês: operação e compra de estoque separados.
- Relatório mensal, margem estimada e exportação CSV.
- XML de NF-e/NFC-e emitido externamente e evento de cancelamento anexáveis ao pedido.
- Exportação dos dados em JSON. Os arquivos R2 não estão incluídos nessa exportação.

A autenticação é fornecida pelo Sites/ChatGPT. `OWNER_EMAIL` identifica o proprietário no ambiente protegido. Administradores adicionais são autorizados pelo banco. Todas as permissões são verificadas no servidor; esconder botões não é usado como controle de acesso.

## Limites atuais

Não há cobrança automática por Pix/cartão, gateway, frete automático, emissão fiscal automática, envio de e-mail ou devolução parcial. XMLs têm verificações básicas de campos, mas não há validação de assinatura digital ou consulta à SEFAZ. O banco da antiga instalação local não sincroniza com esta versão e nenhum dado real daquela instalação foi importado.

O site fica hospedado no Sites; o GitHub armazena o código. **Enviar um commit ao GitHub não publica automaticamente a loja.** Alterações precisam de uma nova publicação no Sites. GitHub Pages não executa o backend deste projeto.

## Stack

React 19, Vinext (compatibilidade com App Router do Next.js), TypeScript, Cloudflare Worker, D1 (SQLite) e R2. O frontend existente da versão local foi reaproveitado em `public/store.js` e `public/store.css`, montado pelo shell React. Valores monetários são inteiros em centavos. Os relatórios usam o mês do recebimento em America/Sao_Paulo.

## Desenvolvimento

Node >=22.13 e pnpm. Instale a versão compatível com `packageManager` no `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

O perfil local de execução e os comandos de migração estão em [docs/DESENVOLVIMENTO-BASE.md](docs/DESENVOLVIMENTO-BASE.md). A configuração de execução é local e não deve ser publicada. Arquivo `.env.example` lista as variáveis de runtime; os valores de produção são definidos como segredos na hospedagem. Nunca faça commit de `.env`, certificados, tokens, bancos ou exportações de clientes.

As migrações `drizzle/*.sql` são aplicadas antes da publicação. O banco D1, os objetos R2 e os segredos não são armazenados neste repositório. Atualizações preservam esses recursos. Um backup completo deve incluir o banco e os arquivos do armazenamento, não apenas o código ou a exportação JSON.

## Verificação

```sh
node --check public/store.js
node node_modules/typescript/bin/tsc --noEmit
python tests/stock_guards.py
node tests/reports.cjs
```

A compilação de produção, as migrações, as regras transacionais de estoque e os cálculos/telas em ambiente de teste foram verificados. O login real usa a infraestrutura do Sites; para a primeira operação, siga o teste de pedido do manual em `/ajuda`.
