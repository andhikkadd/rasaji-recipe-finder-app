const testUrls = [
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // chicken?
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // rice
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // nasi goreng
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // mie
  'https://images.unsplash.com/photo-1541529086526-db283c563270?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // spring rolls
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // drink
  'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // meat
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // tofu/bowl
  'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // sambal/sauce?
  'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&w=800', // sayur
  'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=800', // telur
  'https://images.pexels.com/photos/3296395/pexels-photo-3296395.jpeg?auto=compress&cs=tinysrgb&w=800', // ikan
  'https://images.pexels.com/photos/10580196/pexels-photo-10580196.jpeg?auto=compress&cs=tinysrgb&w=800', // ayam goreng
  'https://images.pexels.com/photos/4552136/pexels-photo-4552136.jpeg?auto=compress&cs=tinysrgb&w=800', // sambal
  'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=800', // tahu
  'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=800' // mie
];

async function check() {
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(res.status, url);
    } catch (e) {
      console.log('Error', url);
    }
  }
}
check();
