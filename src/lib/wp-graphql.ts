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
          ano,
          dimensiones,
          tecnica,
          textonarrativo,
          
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
  return data?.page.datosSobreMi;
}

export async function getHomePage() {
  const data = await fetchAPI(`
   {
  page(id: "triz-jordan", idType: URI) {

    title
    slug
    featuredImage {
          node {
            sourceUrl
            altText
          }
        }
    contenidoDeLaHome {
      hero {
        titulo
        texto
        subtitulo
        callToAction {
          enlace
          texto
        }
      }
      manifiesto {
        texto
        titulo
      }
      queHago {
        titulo
        introduccion
        bloque1 {
          texto
          titulo
        }
        bloque2 {
          texto
          titulo
        }
        bloque3 {
          texto
          titulo
        }
      }
      cierre {
        titulo
        texto
        callToAction {
          texto
          enlace {
            url
            title
            target
          }
        }
      }
      galeria {
        titulo
        texto
        callToAction {
          texto
          enlace {
            url
            title
            target
          }
        }
      }
      imagenDePortada {
        node {
          altText
          sourceUrl
        }
      }
    }
  }
}
  `);
  return data?.page;
}
