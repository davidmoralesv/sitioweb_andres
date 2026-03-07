import { client } from '@/sanity/client'

export async function getSiteConfig() {
  return client.fetch(
    `*[_type == "siteConfig"][0]{
      name, title, shortBio, longBio, photo, email, stats, socialLinks
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getServices() {
  return client.fetch(
    `*[_type == "service"] | order(order asc){
      _id, name, description, icon
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getFeaturedProjects() {
  return client.fetch(
    `*[_type == "project" && featured == true] | order(publishedAt desc)[0...3]{
      _id, title, slug, description, image, client, result
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getAllProjects() {
  return client.fetch(
    `*[_type == "project"] | order(publishedAt desc){
      _id, title, slug, description, image, client, result, publishedAt
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getProjectBySlug(slug: string) {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{
      _id, title, slug, description, content, image, client, result, url, publishedAt
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}
