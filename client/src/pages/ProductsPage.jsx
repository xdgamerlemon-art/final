import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import ProductCard from '../components/common/ProductCard.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import Filter from '../components/common/Filter.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
export default function ProductsPage() {
 const pageSize=12;
 const [products,setProducts]=useState([]);
 const [categories,setCategories]=useState([]);
 const [page,setPage]=useState(1);
 const [pages,setPages]=useState(0);
 const [total,setTotal]=useState(0);
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState('All');
 const [minPrice,setMinPrice]=useState('');
 const [maxPrice,setMaxPrice]=useState('');
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');

 const updateFilter=(setter)=>(value)=>{setter(value);setPage(1);};
 useEffect(()=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>{
   const params=new URLSearchParams({page:String(page),pageSize:String(pageSize)});
   if(search.trim())params.set('search',search.trim());
   if(category!=='All')params.set('category',category);
   if(minPrice)params.set('minPrice',minPrice);
   if(maxPrice)params.set('maxPrice',maxPrice);
   setLoading(true);setError('');
   api(`/products?${params}`,{signal:controller.signal}).then((data)=>{
	setProducts(data.products);setCategories(data.categories||[]);setTotal(data.total||0);setPages(data.pages||0);setError('');
   }).catch((requestError)=>{if(requestError.name!=='AbortError')setError(requestError.message);}).finally(()=>{
	if(!controller.signal.aborted)setLoading(false);
   });
  },220);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[search,category,minPrice,maxPrice,page]);

 return <main className="catalog-page"><div className="page-intro"><span className="eyebrow">A COLLECTION OF THE CONSIDERED</span><h1>Handpicked <em>with heart.</em></h1><p>One-of-a-kind pieces, made slowly and thoughtfully by independent makers.</p></div><div className="catalog-controls"><SearchInput value={search} onChange={updateFilter(setSearch)}/><Filter {...{category,categories,minPrice,maxPrice}} setCategory={updateFilter(setCategory)} setMinPrice={updateFilter(setMinPrice)} setMaxPrice={updateFilter(setMaxPrice)}/></div>{error?<p className="error-banner">{error}</p>:products.length?<><div className={`product-grid ${loading?'catalog-loading':''}`} aria-busy={loading}>{products.map((product,index)=><ProductCard key={product._id} product={product} priority={index<2}/>)}</div><div className="pagination" aria-label="Catalog pages"><span>{total?`${(page-1)*pageSize+1}–${Math.min(page*pageSize,total)} of ${total} finds`:''}</span><div><button className="button button-ghost" onClick={()=>setPage((current)=>Math.max(1,current-1))} disabled={loading||page<=1}>← Previous</button><span>Page {page} of {pages||1}</span><button className="button button-ghost" onClick={()=>setPage((current)=>Math.min(pages,current+1))} disabled={loading||page>=pages}>Next →</button></div></div></>:loading?<div className="catalog-skeleton" role="status">Finding the good stuff…</div>:<EmptyState title="No finds just yet" text="Try another search or clear a filter to see more handmade goodness."/>}</main>;
}
