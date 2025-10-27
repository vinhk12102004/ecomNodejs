export default function Pagination({ total, page, limit, onPage }){
  const pages = Math.max(1, Math.ceil((total||0) / (limit||12)));
  if (pages <= 1) return null;
  const btn = (p, label=String(p)) => (
    <button key={label}
      className={"px-3 py-1 rounded border " + (p===page ? "bg-slate-900 text-white" : "bg-white")}
      onClick={()=> onPage(p)}
      disabled={p===page}
    >{label}</button>
  );
  const items = [];
  for(let i=1;i<=pages;i++) items.push(btn(i));
  return <div className="flex gap-2 flex-wrap">{items}</div>;
}

