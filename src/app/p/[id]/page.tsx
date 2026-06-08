import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const res = await fetch(`https://adis-fashion-default-rtdb.firebaseio.com/products.json`);
    const data = await res.json();
    
    // Convert object or array to find product
    let product: any = null;
    if (Array.isArray(data)) {
      product = data.find((p: any) => p && String(p.id) === id);
    } else if (data && typeof data === 'object') {
      const vals = Object.values(data);
      product = vals.find((p: any) => p && String(p.id) === id);
    }

    if (product) {
      const title = product.title || 'ADIS Product';
      const description = `Shop ${title} at ADIS. Premium pop culture apparel.`;
      let image = '/images/hero_banner_men_1779127853971.png';
      
      if (Array.isArray(product.images) && product.images.length > 0) {
        image = product.images[0];
      } else if (product.image) {
        image = product.image;
      }

      return {
        title: `${title} - ADIS`,
        description,
        openGraph: {
          title,
          description,
          images: [image],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
        }
      };
    }
  } catch (err) {
    console.error("Failed to fetch product for OG metadata:", err);
  }

  return {
    title: 'ADIS',
    description: 'Pop culture fashion.',
  };
}

export default async function ShortlinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let redirectUrl = `/men/${id}`;
  try {
    const res = await fetch(`https://adis-fashion-default-rtdb.firebaseio.com/products.json`);
    const data = await res.json();
    let product: any = null;
    if (Array.isArray(data)) {
      product = data.find((p: any) => p && String(p.id) === id);
    } else if (data && typeof data === 'object') {
      const vals = Object.values(data);
      product = vals.find((p: any) => p && String(p.id) === id);
    }
    
    if (product && product.category) {
      if (product.category === 'Daily Wear') redirectUrl = `/daily-wear/${id}`;
      else if (product.category === 'Sneakers') redirectUrl = `/sneakers/${id}`;
    }
  } catch(e) {}
  
  // Create an HTML redirect so scrapers see the <head> tags but users get redirected to the actual client page
  // A server-side redirect() returns a 307 which crawlers follow BEFORE reading the meta tags, defeating the purpose!
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${redirectUrl}`} />
      </head>
      <body style={{ backgroundColor: 'black', color: 'white', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: 0 }}>
        <p>Redirecting to product...</p>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${redirectUrl}');` }} />
      </body>
    </html>
  );
}
