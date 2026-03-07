import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Servicios',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre del servicio', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 4 }),
    defineField({ name: 'icon', title: 'Ícono (nombre de Lucide)', type: 'string', description: 'Ej: TrendingUp, BarChart2, Target' }),
    defineField({ name: 'order', title: 'Orden de aparición', type: 'number' }),
  ],
  orderings: [{ title: 'Orden', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
