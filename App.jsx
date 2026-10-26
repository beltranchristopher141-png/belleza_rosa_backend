import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { ShoppingBag, Search, Heart, Sparkles, Menu, X, Plus, Minus, Trash2, ArrowUpRight, LayoutDashboard, Package, Users, ReceiptText, CheckCircle2, AlertCircle, Pencil, ChevronDown } from 'lucide-react';

const money = n => new Intl.NumberFormat('es-SV',{style:'currency',currency:'USD'}).format(Number(n||0));
const fallback = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80';
const categories = ['Todos','Rostro','Labios','Ojos','Uñas','Brochas','Cuidado de piel','Accesorios'];

export default function App(){
  const [products,setProducts]=useState([]);
  const [employees,setEmployees]=useState([]);
  const [sales,setSales]=useState([]);
  const [view,setView]=useState('tienda');
  const [category,setCategory]=useState('Todos');
  const [search,setSearch]=useState('');
  const [cart,setCart]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [notice,setNotice]=useState(null);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(null);
  const [productForm,setProductForm]=useState({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''});
  const [employeeForm,setEmployeeForm]=useState({nombre:'',turno:'Mañana'});
  const [saleClient,setSaleClient]=useState('Cliente de tienda');

  const notify=(message,type='success')=>{setNotice({message,type}); window.setTimeout(()=>setNotice(null),3500)};
  const loadAll=async()=>{
    setLoading(true);
    try{
      const [p,e,s]=await Promise.all([api.get('/productos'),api.get('/empleados'),api.get('/ventas')]);
      setProducts(p.data);setEmployees(e.data);setSales(s.data);
    }catch(err){notify(err.response?.data?.message || 'No se pudo conectar con la API. Comprueba que backend y MySQL estén encendidos.','error');}
    finally{setLoading(false);}
  };
  useEffect(()=>{loadAll();},[]);
  const visible=useMemo(()=>products.filter(p=>(category==='Todos'||p.categoria===category)&&`${p.nombre} ${p.descripcion}`.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const cartCount=cart.reduce((s,i)=>s+i.cantidad,0);
  const cartTotal=cart.reduce((s,i)=>s+Number(i.precio)*i.cantidad,0);
  const addToCart=p=>{if(p.stock<1)return notify('Este producto está agotado.','error');setCart(old=>{const found=old.find(i=>i.id===p.id);if(found){if(found.cantidad>=p.stock){notify('No hay más unidades disponibles.','error');return old;}return old.map(i=>i.id===p.id?{...i,cantidad:i.cantidad+1}:i);}return [...old,{...p,cantidad:1}];});notify(`${p.nombre} se agregó a tu carrito`);};
  const changeQty=(id,delta)=>setCart(old=>old.map(i=>i.id===id?{...i,cantidad:Math.max(1,Math.min(i.stock,i.cantidad+delta))}:i));
  const removeCart=id=>setCart(old=>old.filter(i=>i.id!==id));
  const checkout=async()=>{
    if(!cart.length)return;
    try{const res=await api.post('/ventas',{cliente:saleClient,items:cart.map(i=>({producto_id:i.id,cantidad:i.cantidad}))});setCart([]);setCartOpen(false);notify(`${res.data.message} Total: ${money(res.data.total)}`);await loadAll();setView('tienda');}
    catch(err){notify(err.response?.data?.message||'No se pudo completar la compra.','error');}
  };
  const saveProduct=async e=>{
    e.preventDefault();
    const payload={...productForm,precio:Number(productForm.precio),stock:Number(productForm.stock)};
    try{if(editing)await api.put(`/productos/${editing}`,payload);else await api.post('/productos',payload);setEditing(null);setProductForm({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''});notify('Producto guardado correctamente');await loadAll();}
    catch(err){notify(err.response?.data?.message||'No se pudo guardar el producto','error');}
  };
  const editProduct=p=>{setEditing(p.id);setProductForm({nombre:p.nombre,categoria:p.categoria,descripcion:p.descripcion||'',precio:p.precio,stock:p.stock,imagen:p.imagen||''});window.scrollTo({top:0,behavior:'smooth'});};
  const deleteProduct=async id=>{if(!confirm('¿Quieres retirar este producto del catálogo?'))return;try{await api.delete(`/productos/${id}`);notify('Producto retirado');await loadAll();}catch(err){notify(err.response?.data?.message||'No se pudo eliminar','error');}};
  const saveEmployee=async e=>{e.preventDefault();try{if(editing?.type==='employee')await api.put(`/empleados/${editing.id}`,employeeForm);else await api.post('/empleados',employeeForm);setEditing(null);setEmployeeForm({nombre:'',turno:'Mañana'});notify('Empleado guardado');await loadAll();}catch(err){notify(err.response?.data?.message||'No se pudo guardar empleado','error');}};
  const deleteEmployee=async id=>{if(!confirm('¿Eliminar este empleado?'))return;try{await api.delete(`/empleados/${id}`);notify('Empleado eliminado');await loadAll();}catch(err){notify(err.response?.data?.message||'No se pudo eliminar','error');}};
  const deleteSale=async id=>{if(!confirm('¿Eliminar este registro de venta?'))return;try{await api.delete(`/ventas/${id}`);notify('Venta eliminada');await loadAll();}catch(err){notify(err.response?.data?.message||'No se pudo eliminar venta','error');}};
  const nav=[['tienda','Tienda',ShoppingBag],['productos','Productos',Package],['empleados','Empleados',Users],['ventas','Ventas',ReceiptText]];
  return <div className="app">
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Menú">{mobileMenu?<X/>:<Menu/>}</button>
      <button className="brand" onClick={()=>setView('tienda')}><span className="brand-mark">b.</span><span><b>BELLEZA ROSA</b><small>MAKEUP BOUTIQUE</small></span></button>
      <nav className={mobileMenu?'nav open':'nav'}>{nav.map(([key,label,Icon])=><button key={key} className={view===key?'nav-link selected':'nav-link'} onClick={()=>{setView(key);setMobileMenu(false)}}><Icon size={16}/>{label}</button>)}</nav>
      <div className="top-actions"><span className="top-note"><Sparkles size={15}/> Tu belleza, tu esencia</span><button className="cart-button" onClick={()=>setCartOpen(true)}><ShoppingBag size={18}/><span>Mi bolsa</span><b>{cartCount}</b></button></div>
    </header>
    {notice&&<div className={`toast ${notice.type}`}><span>{notice.type==='success'?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}</span>{notice.message}<button onClick={()=>setNotice(null)}><X size={16}/></button></div>}
    {view==='tienda'&&<main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><Sparkles size={15}/> BELLEZA EN CADA DETALLE</span><h1>Tu ritual de belleza,<br/><em>un momento para ti.</em></h1><p>Descubre tus nuevos favoritos: pequeños detalles que hacen brillar tu esencia.</p><button className="primary-button" onClick={()=>document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'})}>Explorar colección <ArrowUpRight size={17}/></button><div className="hero-foot"><span><b>01</b> Belleza auténtica</span><span><b>02</b> Amor propio</span></div></div>
        <div className="hero-art"><img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1300&q=90" alt="Colección de maquillaje"/><div className="floating-note"><span className="note-icon"><Heart size={18}/></span><span><b>Un toque de magia</b><small>Para tu versión favorita</small></span></div><div className="round-stamp">LOVE<br/>YOUR<br/>GLOW ✦</div></div>
      </section>
      <section className="promise-row"><div><span>✧</span><p><b>Favoritos seleccionados</b><small>Productos que inspiran</small></p></div><div><span>♡</span><p><b>Tu estilo, tus reglas</b><small>Exprésate sin límites</small></p></div><div><span>✿</span><p><b>Un regalo para ti</b><small>Disfruta tu rutina</small></p></div></section>
      <section className="catalog section-wrap" id="catalogo"><div className="section-heading"><div><span className="eyebrow">LA COLECCIÓN</span><h2>Pequeños tesoros <em>de belleza</em></h2><p>Encuentra ese producto que te hace sentir increíble.</p></div><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos..."/></label></div>
      <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'chip active':'chip'}>{c}</button>)}</div>
      {loading?<div className="empty-state">Cargando colección...</div>:visible.length===0?<div className="empty-state">No encontramos productos con esa búsqueda.</div>:<div className="product-grid">{visible.map((p,i)=><article className="product-card" key={p.id}><div className="product-photo"><img src={p.imagen||fallback} alt={p.nombre} onError={e=>e.currentTarget.src=fallback}/><span className="product-tag">{i%3===0?'FAVORITO':p.categoria.toUpperCase()}</span><button className="heart-button" aria-label="Favorito"><Heart size={17}/></button><button className="quick-add" onClick={()=>addToCart(p)} disabled={p.stock<1}>{p.stock<1?'Agotado':'＋ Añadir a la bolsa'}</button></div><div className="product-info"><small>{p.categoria}</small><h3>{p.nombre}</h3><p>{p.descripcion}</p><div className="product-bottom"><b>{money(p.precio)}</b><span>{p.stock>0?`${p.stock} disponibles`:'Agotado'}</span></div></div></article>)}</div>}
      </section>
      <section className="newsletter"><div><span className="eyebrow">UN MOMENTO PARA TI</span><h2>La belleza empieza <em>contigo.</em></h2><p>Explora, juega y encuentra los tonos que cuentan tu historia.</p></div><button className="light-button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Volver al inicio <ArrowUpRight size={16}/></button></section>
    </main>}
    {view!=='tienda'&&<main className="admin section-wrap"><div className="admin-title"><div><span className="eyebrow"><LayoutDashboard size={14}/> PANEL DE ADMINISTRACIÓN</span><h1>{view==='productos'?'Gestión de productos':view==='empleados'?'Nuestro equipo':'Historial de ventas'}</h1><p>Administra la información de Belleza Rosa desde un solo lugar.</p></div><button className="outline-button" onClick={loadAll}>Actualizar datos ↻</button></div>
      {view==='productos'&&<><form className="admin-form" onSubmit={saveProduct}><h3>{editing&&typeof editing==='number'?'Editar producto':'Agregar producto'}</h3><div className="form-grid"><label>Nombre<input required value={productForm.nombre} onChange={e=>setProductForm({...productForm,nombre:e.target.value})}/></label><label>Categoría<select value={productForm.categoria} onChange={e=>setProductForm({...productForm,categoria:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Precio ($)<input required min="0" step="0.01" type="number" value={productForm.precio} onChange={e=>setProductForm({...productForm,precio:e.target.value})}/></label><label>Existencias<input required min="0" step="1" type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm,stock:e.target.value})}/></label><label className="wide">Descripción<input value={productForm.descripcion} onChange={e=>setProductForm({...productForm,descripcion:e.target.value})}/></label><label className="wide">URL de imagen<input value={productForm.imagen} onChange={e=>setProductForm({...productForm,imagen:e.target.value})} placeholder="https://..."/></label></div><div className="form-actions"><button className="primary-button">{editing?'Guardar cambios':'Agregar producto'}</button>{editing&&<button type="button" className="outline-button" onClick={()=>{setEditing(null);setProductForm({nombre:'',categoria:'Rostro',descripcion:'',precio:'',stock:'',imagen:''})}}>Cancelar</button>}</div></form><div className="table-card"><h3>Catálogo de productos <span>{products.length} artículos</span></h3><div className="table-scroll"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.imagen||fallback} alt=""/><b>{p.nombre}</b></div></td><td>{p.categoria}</td><td>{money(p.precio)}</td><td>{p.stock}</td><td><button className="mini-action" onClick={()=>editProduct(p)}><Pencil size={15}/></button><button className="mini-action danger" onClick={()=>deleteProduct(p.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></>}
      {view==='empleados'&&<><form className="admin-form" onSubmit={saveEmployee}><h3>{editing?.type==='employee'?'Editar empleado':'Registrar empleado'}</h3><div className="form-grid"><label>Nombre completo<input required value={employeeForm.nombre} onChange={e=>setEmployeeForm({...employeeForm,nombre:e.target.value})}/></label><label>Turno<select value={employeeForm.turno} onChange={e=>setEmployeeForm({...employeeForm,turno:e.target.value})}>{['Mañana','Tarde','Noche','Completo'].map(t=><option key={t}>{t}</option>)}</select></label></div><div className="form-actions"><button className="primary-button">{editing?.type==='employee'?'Guardar cambios':'Agregar empleado'}</button>{editing?.type==='employee'&&<button type="button" className="outline-button" onClick={()=>{setEditing(null);setEmployeeForm({nombre:'',turno:'Mañana'})}}>Cancelar</button>}</div></form><div className="table-card"><h3>Equipo de trabajo <span>{employees.length} personas</span></h3><div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Turno</th><th>Acciones</th></tr></thead><tbody>{employees.map(e=><tr key={e.id}><td>{e.nombre}</td><td><span className="status-pill">{e.turno}</span></td><td><button className="mini-action" onClick={()=>{setEditing({type:'employee',id:e.id});setEmployeeForm({nombre:e.nombre,turno:e.turno})}}><Pencil size={15}/></button><button className="mini-action danger" onClick={()=>deleteEmployee(e.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></>}
      {view==='ventas'&&<div className="table-card"><h3>Ventas recientes <span>{sales.length} registros</span></h3><div className="table-scroll"><table><thead><tr><th>#</th><th>Cliente</th><th>Artículos</th><th>Empleado</th><th>Total</th><th>Fecha</th><th></th></tr></thead><tbody>{sales.map(s=><tr key={s.id}><td>#{s.id}</td><td>{s.cliente}</td><td>{s.articulos||'—'}</td><td>{s.empleado||'Tienda online'}</td><td><b>{money(s.total)}</b></td><td>{new Date(s.fecha).toLocaleString('es-SV')}</td><td><button className="mini-action danger" onClick={()=>deleteSale(s.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>{!sales.length&&<div className="empty-state">Todavía no hay ventas. Haz una compra en la tienda para probar el sistema.</div>}</div>}
    </main>}
    <footer className="footer"><button className="brand footer-brand" onClick={()=>setView('tienda')}><span className="brand-mark">b.</span><span><b>BELLEZA ROSA</b><small>MAKEUP BOUTIQUE</small></span></button><span>Hecho con cariño para celebrar tu esencia ♡</span><span>© 2026 Belleza Rosa</span></footer>
    {cartOpen&&<div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">TU SELECCIÓN</span><h2>Mi bolsa <span>({cartCount})</span></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)}><X/></button></div>{!cart.length?<div className="cart-empty"><span><ShoppingBag size={28}/></span><h3>Tu bolsa está esperando</h3><p>Agrega tus favoritos y vuelve aquí para confirmar tu compra.</p><button className="primary-button" onClick={()=>{setCartOpen(false);document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'})}}>Explorar productos</button></div>:<><div className="cart-lines">{cart.map(i=><div className="cart-line" key={i.id}><img src={i.imagen||fallback} alt={i.nombre}/><div className="cart-line-info"><b>{i.nombre}</b><span>{money(i.precio)}</span><div className="qty-control"><button onClick={()=>changeQty(i.id,-1)}><Minus size={13}/></button><span>{i.cantidad}</span><button onClick={()=>changeQty(i.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>removeCart(i.id)}><Trash2 size={16}/></button></div>)}</div><div className="checkout"><label>Nombre del cliente<input value={saleClient} onChange={e=>setSaleClient(e.target.value)} placeholder="Tu nombre"/></label><div className="total-row"><span>Subtotal</span><b>{money(cartTotal)}</b></div><div className="total-row muted"><span>Envío</span><span>Se coordina al entregar</span></div><div className="total-row grand"><span>Total</span><b>{money(cartTotal)}</b></div><button className="primary-button checkout-button" onClick={checkout}>Confirmar compra <ArrowUpRight size={17}/></button><small className="checkout-note">Compra de demostración escolar. No se procesan pagos reales.</small></div></>}</aside></div>}
  </div>;
}
