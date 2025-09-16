fetch('/api/products')
  .then(res => res.json())
  .then(products => {
     // render grid
  })
  .catch(err => console.error(err));
