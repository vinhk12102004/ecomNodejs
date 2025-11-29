import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../lib/api";

export default function useProducts(initial = {}) {
  const [params, setParams] = useState({ page:1, limit:12, sort:"-createdAt", ...initial });
  const [data,setData] = useState([]);
  const [meta,setMeta] = useState({ total:0, page:1, limit:12 });
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    getProducts(params)
      .then(res=>{
        if(!mounted) return;
        setData(res.data || []);
        setMeta(res.meta || { total:0, page:1, limit:12 });
      })
      .catch(e=>{ if(mounted) setError(e?.response?.data || { error: e.message }); })
      .finally(()=> mounted && setLoading(false));
    return ()=>{ mounted=false; };
  }, [JSON.stringify(params)]);

  const setQuery = (next)=> setParams(p=>({ ...p, ...next, page:1 })); // thay đổi filter sẽ reset về page 1
  const setPage = (page)=> setParams(p=>({ ...p, page }));

  return { data, meta, loading, error, params, setQuery, setPage };
}

