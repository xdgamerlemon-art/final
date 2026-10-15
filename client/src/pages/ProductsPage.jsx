import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import ProductCard from '../components/common/ProductCard.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import Filter from '../components/common/Filter.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
export default function ProductsPage() {
 const [products,setProducts]=useState([]); const [search,setSearch]=useState(''); const [category,setCategory]=useState('All'); const [minPrice,setMinPrice]=useState(''); const [maxPrice,setMaxPrice]=useState(''); const [error,setError]=useState(''); const categories=[...new Set(products.map((p)=>p.category))].sort();
 useEffect(()=>{const timer=setTimeout(()=>{const params=new URLSearchParams(); if(search)params.set('search',search);if(category!=='All')params.set('category',category);if(minPrice)params.set('minPrice',minPrice);if(maxPrice)params.set('maxPrice',maxPrice);api(`/products?${params}`).then((data)=>{setProducts(data.products);setError('');}).catch((e)=>setError(e.message));},220);return()=>clearTimeout(timer);},[search,category,minPrice,maxPrice]);
 return <main className="catalog-page"><div className="page-intro"><span className="eyebrow">A COLLECTION OF THE CONSIDERED</span><h1>Handpicked <em>with heart.</em></h1><p>One-of-a-kind pieces, made slowly and thoughtfully by independent makers.</p></div><div className="catalog-controls"><SearchInput value={search} onChange={setSearch}/><Filter {...{category,setCategory,categories,minPrice,setMinPrice,maxPrice,setMaxPrice}}/></div>{error?<p className="error-banner">{error}</p>:products.length?<div className="product-grid">{products.map((product,index)=><ProductCard key={product._id} product={product} priority={index<4}/>)}</div>:<EmptyState title="No finds just yet" text="Try another search or clear a filter to see more handmade goodness."/>}</main>;
}
