export default defineAppConfig({
  core: {
    is_thai_year: false,
    is_thai_month: false,
    date_format: 'dd MMM yyyy',
    month_format: 'MMM yyyy',
    date_time_format: 'dd/MM/yyyy HH:mm',
    color: '#335AFF',
    limit_per_page: 30,
    locale: 'th',
    site_name: 'Mook Target Progression',
  },
  ui: {
    dialog: {
      slots: {
        base: [
          'bg-[url(/dialog-bg.png)] bg-no-repeat bg-top-left bg-size-[220px]',
        ],
      },
    },
    table: {
      slots: {
        th: 'text-[#222222] whitespace-nowrap border-r border-[#EAECF0] last:border-0 bg-[#F9FAFB]',
        td: 'text-[#222222] border-r border-[#EAECF0] last:border-0',
      },
    },
  },
})
