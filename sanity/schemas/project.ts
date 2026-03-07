import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Casos de éxito',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Descripción corta', type: 'text', rows: 3 }),
    defineField({ name: 'content', title: 'Contenido detallado', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
    defineField({ name: 'image', title: 'Imagen de portada', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'client', title: 'Cliente', type: 'string' }),
    defineField({ name: 'result', title: 'Resultado clave', type: 'string', description: 'Ej: +40% en conversiones en 3 meses' }),
    defineField({ name: 'url', title: 'URL del proyecto (opcional)', type: 'url' }),
    defineField({ name: 'featured', title: 'Destacado en Home', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Fecha', type: 'date' }),
  ],
})
