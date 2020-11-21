const BASE64_DATA = `c3RhZ2VzOgotIGJ1aWxkCgpidWlsZDoKICBzdGFnZTogYnVpbGQKICB0YWdzOgogIC0gZGZsZXgK
ICB2YXJpYWJsZXM6CiAgICBET0NLRVJfRFJJVkVSOiBvdmVybGF5MgogICAgQ09OVEFJTkVSX0lN
QUdFOiAkQ0lfUkVHSVNUUlkvJENJX1BST0pFQ1RfUEFUSAogIGJlZm9yZV9zY3JpcHQ6CiAgLSBk
b2NrZXIgaW5mbwogIC0gZG9ja2VyIGxvZ2luIC11IGdpdGxhYi1jaS10b2tlbiAtcCAkQ0lfSk9C
X1RPS0VOICRDSV9SRUdJU1RSWQogIHNjcmlwdDoKICAtIGVjaG8gQnVpbGRpbmcgJENPTlRBSU5F
Ul9JTUFHRS4uLgogICMgQ3JlYXRpbmcgYSBjb3B5IG9mIHBhY2thZ2UuanNvbiBhbmQgcGFja2Fn
ZS1sb2NrLmpzb24gZmlsZXMsIGJ1dCB3aXRoIHZlcnNpb24gZm9yY2libHkgc2V0IHRvIDEuMC4w
LCB0byBoaXQKICAjIGRvY2tlciBjYWNoZSwgaWYgdGhlIG9ubHkgdGhpbmcgY2hhbmdlZCBpbiBw
YWNrYWdlLmpzb24gaXMgdmVyc2lvbiBudW1iZXIuCiAgIyBUaGF0IHRyaWNrIG11c3QgYmUgc3Vw
cG9ydGVkIGF0IERvY2tlcmZpbGUsIG9mIGNvdXJzZQogIC0gc2VkIC1yICdzLyhcInZlcnNpb25c
IlxzKlw6XHMqXCIpKFteXCJdKykvXDExLjAuMC8nIHBhY2thZ2UuanNvbiA+IHBhY2thZ2UuanNv
bi1uby12ZXJzaW9uCiAgIyBSZWx5IG9uICJ2ZXJzaW9uIiB0byBiZSBwbGFjZWQgaW4gZXhhY3Rs
eSAzZCBsaW5lCiAgLSBzZWQgLXIgJzMgcy8oXCJ2ZXJzaW9uXCJccypcOlxzKlwiKShbXlwiXSsp
L1wxMS4wLjAvJyBwYWNrYWdlLWxvY2suanNvbiA+IHBhY2thZ2UtbG9jay5qc29uLW5vLXZlcnNp
b24KICAjIFRoaXMgZmluZHMgbnVtYmVyIG9mIGZpcnN0IGxpbmUgd2l0aCAidmVyc2lvbiIgYW5k
IGJ1aWxkcyBzZWQgZXhwcmVzc2lvbiB0byByZXBsYWNlIGl0IHdpdGggMS4wLjAKICAjIC0gZ3Jl
cCAtRSAtbSAxIC1uICdcInZlcnNpb25cIicgcGFja2FnZS5qc29uIHwgc2VkICdzLzouKiQvLycg
LSB8IHNlZCAncy8kLyBzXC9cKFxcXCJ2ZXJzaW9uXFxcIlxccypcXDpcXHMqXFxcIlwpXChcW1xe
XFwiXF1cK1wpXC9cXDExLjAuMFwvLycgLSB8IHNlZCAtciAtZiAtIHBhY2thZ2UtbG9jay5qc29u
ID4gcGFja2FnZS1sb2NrLmpzb24tbm8tdmVyc2lvbgogIC0gfAogICAgaWYgISBbIC16ICIke0NJ
X0NPTU1JVF9UQUd9IiBdOyB0aGVuCiAgICAgIGRvY2tlciBidWlsZCAuIC10ICRDT05UQUlORVJf
SU1BR0U6bGF0ZXN0IC10ICRDT05UQUlORVJfSU1BR0U6JHtDSV9DT01NSVRfVEFHOjF9CiAgICBl
bHNlCiAgICAgIGRvY2tlciBidWlsZCAuIC10ICRDT05UQUlORVJfSU1BR0U6bGF0ZXN0CiAgICBm
aQogIC0gZG9ja2VyIHB1c2ggJENPTlRBSU5FUl9JTUFHRTpsYXRlc3QKICAjIFB1c2ggaW1hZ2Ug
Zm9yIHRhZ3Mgb25seSwgZG8gbm90IHB1c2ggZm9yIG90aGVyIGJyYW5jaGVzCiAgLSB8CiAgICBp
ZiAhIFsgLXogIiR7Q0lfQ09NTUlUX1RBR30iIF07IHRoZW4KICAgICAgZG9ja2VyIHB1c2ggJENP
TlRBSU5FUl9JTUFHRTpsYXRlc3Q7CiAgICAgIGRvY2tlciBwdXNoICRDT05UQUlORVJfSU1BR0U6
JHtDSV9DT01NSVRfVEFHOjF9OwogICAgICAjTG9naW4gdG8gZ2l0LXB1YiByZWdpc3RyeSBhbmQg
cHVzaCBpbWFnZSB0byByZW1vdGUgcHVibGljIHJlZ2lzdHJ5CiAgICAgIGRvY2tlciBsb2dpbiAt
dSB3cml0ZS10b2tlbiAtcCAkR0JfV1JJVEVfVE9LRU4gZ2l0LXB1Yi5pbnRlY3JhY3kuY29tOjQ1
NjcKICAgICAgZG9ja2VyIHRhZyAkQ09OVEFJTkVSX0lNQUdFOiR7Q0lfQ09NTUlUX1RBRzoxfSBn
aXQtcHViLmludGVjcmFjeS5jb206NDU2Ny9kb2NrZXIvdW5pdHliYXNlL2RyYXctc2VydmljZTok
e0NJX0NPTU1JVF9UQUc6MX0KICAgICAgZG9ja2VyIHB1c2ggZ2l0LXB1Yi5pbnRlY3JhY3kuY29t
OjQ1NjcvZG9ja2VyL3VuaXR5YmFzZS9kcmF3LXNlcnZpY2U6JHtDSV9DT01NSVRfVEFHOjF9CiAg
ICBlbHNlCiAgICAgIGVjaG8gIlNraXBwZWQgcHVzaGluZyBpbWFnZS4iOwogICAgZmkK`
const ITER = 1000

let b
let LL = 0

console.time('js')
for (let i = 0; i < ITER; i++) {
  b = base64ToArrayBuffer(BASE64_DATA)
  LL += b.byteLength
}
console.timeEnd('js')


console.time('native')
for (let i = 0; i < ITER; i++) {
  b = Buffer.from(BASE64_DATA, 'base64')
  LL += b.byteLength
}
console.timeEnd('native')
console.log(LL)


/**
 * base64 to ArrayBuffer
 * @deprecated Use const buff = Buffer.from(base64, 'base64')
 * @param base64
 * @returns {ArrayBuffer}
 */
function base64ToArrayBuffer(base64) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }

  var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
}


