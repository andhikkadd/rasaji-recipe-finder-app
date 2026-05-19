async function test() {
  try {
    const res1 = await fetch('http://localhost:8080/');
    console.log('GET /:', res1.status, res1.headers.get('content-type'));

    const res2 = await fetch('http://localhost:8080/assets/index-CBIhiajM.js');
    console.log('GET /assets/index-CBIhiajM.js:', res2.status, res2.headers.get('content-type'));

    const res3 = await fetch('http://localhost:8080/favicon.svg');
    console.log('GET /favicon.svg:', res3.status, res3.headers.get('content-type'));

    const res4 = await fetch('http://localhost:8080/assets/missing-file.js');
    console.log('GET /assets/missing-file.js (expecting 404):', res4.status);
    
    const res5 = await fetch('http://localhost:8080/api/missing-api');
    console.log('GET /api/missing-api (expecting 404):', res5.status);
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

test();
