import { defineField, defineType } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Configuración del sitio',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre completo', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'title', title: 'Título profesional', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'shortBio', title: 'Bio corta (Hero)', type: 'text', rows: 3 }),
    defineField({ name: 'longBio', title: 'Bio larga (Sobre mí)', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'photo', title: 'Foto profesional', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'email', title: 'Email de contacto', type: 'string' }),
    defineField({
      name: 'stats',
      title: 'Estadísticas clave',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Valor (ej: 10+)', type: 'string' },
            { name: 'label', title: 'Etiqueta (ej: Años de experiencia)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              options: { list: ['linkedin', 'twitter', 'instagram', 'youtube'] },
            },
            { name: 'url', title: 'URL', type: 'url' },
          ],
        },
      ],
    }),
  ],
})
