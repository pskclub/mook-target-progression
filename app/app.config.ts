export default defineAppConfig({
  core: {
    is_thai_year: true,
    is_thai_month: true,
    date_format: 'dd MMM yyyy',
    month_format: 'MMM yyyy',
    date_time_format: 'dd MMM yyyy HH:mm',
    color: '#335AFF',
    limit_per_page: 100,
    locale: 'th',
    site_name: 'Mook Target Progression',
  },
  ui: {
    card: {
      slots: {
        body: 'sm:p-2 sm:px-3 p-2',
      },
    },
    dialog: {
      slots: {
        base: [
          'bg-[url(/dialog-bg.png)] bg-no-repeat bg-top-left bg-size-[220px]',
        ],
      },
    },
    tabs: {
      slots: {
        content: 'py-2 px-3',
      },
    },
    table: {
      slots: {
        th: 'text-[#222222] whitespace-nowrap border-r border-[#EAECF0] last:border-0 bg-[#F9FAFB]',
        td: 'text-[#222222] border-r border-[#EAECF0] last:border-0 p-0 px-2',
      },
    },
    selectMenu: {
      defaultVariants: {
        size: 'md',
      },
    },
  },
})
