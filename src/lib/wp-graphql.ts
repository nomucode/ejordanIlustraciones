const API_URL = import.meta.env.PUBLIC_WORDPRESS_API_URL;

async function fetchAPI(query = "", variables: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }

  return json.data;
}

export async function getAllObras() {
  const data = await fetchAPI(`
    query GetAllObras {
      obras(first: 100) { 
        nodes {
          title
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `);
  return data?.obras.nodes;
}

export async function getObraBySlug(slug: string) {
  const data = await fetchAPI(
    `
    query GetObraBySlug($id: ID!) {
      obra(id: $id, idType: SLUG) {
        title
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        datosDeLaObra {
          descripcion
          ano
        }
      }
    }
  `,
    {
      id: slug,
    }
  );
  return data?.obra;
}

export async function getSobreMiPage() {
  const data = await fetchAPI(`
    query GetSobreMiPage {
  page(id: "sobre-mi", idType: URI) {
    title
    slug
    datosSobreMi {
      textoIntroductorio
      trayectoria
      visionArtistica
      valores
      titulo
      cta {
        texto
        enlace {
          url
          tituloDelEnlace
        }
      }
    }
  }
}
  `);
  return data?.page;
}
