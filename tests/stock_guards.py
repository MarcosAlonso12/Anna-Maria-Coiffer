import sqlite3, pathlib, uuid
c=sqlite3.connect(':memory:');c.execute('PRAGMA foreign_keys=ON')
for f in sorted((pathlib.Path(__file__).resolve().parents[1]/'drizzle').glob('*.sql')):c.executescript(f.read_text())
c.execute("INSERT INTO products(sku,name,category,price,cost,stock) VALUES('TEST','Teste','Teste',10000,4000,1)");c.commit()
def order(key):
 with c:
  oid=c.execute("INSERT INTO orders(customer_name,phone,delivery,created,payment,total,cost,request_id) VALUES('Cliente','11999999999','Retirada','2026-09-27T10:00:00Z','Pix',10000,4000,?)",(key,)).lastrowid
  c.execute("UPDATE products SET stock=CASE WHEN active=1 AND price=10000 AND cost=4000 THEN stock-1 ELSE -1 END,version=version+1 WHERE id=1")
  c.execute("INSERT INTO items(order_id,product_id,name,quantity,price,cost) VALUES(?,1,'Teste',1,10000,4000)",(oid,))
 return oid
first=order('first')
assert c.execute('SELECT stock FROM products').fetchone()[0]==0
try:order('oversell');raise AssertionError('Venda indevida')
except sqlite3.IntegrityError:pass
assert c.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==1
op=str(uuid.uuid4())
with c:
 c.execute("UPDATE orders SET status='cancelled',cancel_op=? WHERE id=? AND status!='cancelled'",(op,first))
 c.execute('UPDATE products SET stock=stock+(SELECT SUM(i.quantity) FROM items i JOIN orders o ON o.id=i.order_id WHERE o.cancel_op=? AND i.product_id=products.id),version=version+1 WHERE id IN(SELECT i.product_id FROM items i JOIN orders o ON o.id=i.order_id WHERE o.cancel_op=?)',(op,op))
assert c.execute('SELECT stock FROM products').fetchone()[0]==1
op=str(uuid.uuid4())
with c:
 c.execute("UPDATE orders SET status='cancelled',cancel_op=? WHERE id=? AND status!='cancelled'",(op,first))
 c.execute('UPDATE products SET stock=stock+(SELECT SUM(i.quantity) FROM items i JOIN orders o ON o.id=i.order_id WHERE o.cancel_op=? AND i.product_id=products.id),version=version+1 WHERE id IN(SELECT i.product_id FROM items i JOIN orders o ON o.id=i.order_id WHERE o.cancel_op=?)',(op,op))
assert c.execute('SELECT stock FROM products').fetchone()[0]==1
c.execute('UPDATE products SET price=12000');c.commit()
try:order('price-changed');raise AssertionError('Preço antigo aceito')
except sqlite3.IntegrityError:pass
assert c.execute('SELECT stock FROM products').fetchone()[0]==1
assert c.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==1
print('PASS: estoque transacional, rollback integral, cancelamento idempotente e proteção contra alteração de preço.')
